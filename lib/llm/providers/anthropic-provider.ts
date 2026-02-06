/**
 * Anthropic Provider
 *
 * LLM provider implementation for Anthropic Claude API.
 *
 * @module lib/llm/providers/anthropic-provider
 */

import type { LLMProvider } from '@/lib/db/schema';
import { BaseProvider } from './base-provider';
import {
  LLMError,
  RateLimitError,
  AuthenticationError,
  type ChatMessage,
  type ChatCompletionOptions,
  type ChatCompletionResponse,
  type ProviderClientConfig,
} from '../types';

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AnthropicResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class AnthropicProvider extends BaseProvider {
  provider: LLMProvider = 'anthropic';

  constructor(config: ProviderClientConfig) {
    super(config);
  }

  protected getApiUrl(): string {
    return this.config.baseUrl || 'https://api.anthropic.com/v1';
  }

  protected getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.config.apiKey || '',
      'anthropic-version': '2023-06-01',
    };
  }

  async chatCompletion(
    messages: ChatMessage[],
    options?: ChatCompletionOptions
  ): Promise<ChatCompletionResponse> {
    // Extract system message (Anthropic handles it separately)
    let systemPrompt: string | undefined;
    const anthropicMessages: AnthropicMessage[] = [];

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemPrompt = msg.content;
      } else {
        anthropicMessages.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        });
      }
    }

    const body: Record<string, unknown> = {
      model: this.config.model,
      messages: anthropicMessages,
      max_tokens: options?.maxTokens ?? 4096,
      temperature: options?.temperature ?? 0.7,
      top_p: options?.topP,
      stop_sequences: options?.stopSequences,
    };

    if (systemPrompt) {
      body.system = systemPrompt;
    }

    const response = await this.fetchWithTimeout(`${this.getApiUrl()}/messages`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    const responseBody = await response.json();

    if (!response.ok) {
      this.handleError(response, responseBody);
    }

    const data = responseBody as AnthropicResponse;

    // Extract text content
    const textContent = data.content
      .filter((c) => c.type === 'text')
      .map((c) => c.text)
      .join('');

    return {
      content: textContent,
      finishReason: this.mapFinishReason(data.stop_reason),
      usage: data.usage
        ? {
            promptTokens: data.usage.input_tokens,
            completionTokens: data.usage.output_tokens,
            totalTokens: data.usage.input_tokens + data.usage.output_tokens,
          }
        : undefined,
      model: data.model,
      provider: 'anthropic',
    };
  }

  async isAvailable(): Promise<boolean> {
    if (!this.config.apiKey) return false;

    try {
      // Anthropic doesn't have a simple health check endpoint
      // We'll try a minimal request
      const response = await this.fetchWithTimeout(`${this.getApiUrl()}/messages`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'hi' }],
        }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private handleError(response: Response, body: unknown): never {
    const message = this.parseErrorResponse(response, body);

    if (response.status === 401) {
      throw new AuthenticationError('anthropic');
    }

    if (response.status === 429) {
      throw new RateLimitError('anthropic');
    }

    throw new LLMError(message, 'anthropic', undefined, response.status);
  }

  private mapFinishReason(
    reason: string
  ): 'stop' | 'length' | 'content_filter' | 'error' {
    switch (reason) {
      case 'end_turn':
      case 'stop_sequence':
        return 'stop';
      case 'max_tokens':
        return 'length';
      default:
        return 'stop';
    }
  }
}
