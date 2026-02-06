/**
 * OpenAI Provider
 *
 * LLM provider implementation for OpenAI API.
 *
 * @module lib/llm/providers/openai-provider
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

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenAIProvider extends BaseProvider {
  provider: LLMProvider = 'openai';

  constructor(config: ProviderClientConfig) {
    super(config);
  }

  protected getApiUrl(): string {
    return this.config.baseUrl || 'https://api.openai.com/v1';
  }

  protected getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.config.apiKey}`,
    };
  }

  async chatCompletion(
    messages: ChatMessage[],
    options?: ChatCompletionOptions
  ): Promise<ChatCompletionResponse> {
    const openaiMessages: OpenAIMessage[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const body = {
      model: this.config.model,
      messages: openaiMessages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 4096,
      top_p: options?.topP,
      frequency_penalty: options?.frequencyPenalty,
      presence_penalty: options?.presencePenalty,
      stop: options?.stopSequences,
    };

    const response = await this.fetchWithTimeout(`${this.getApiUrl()}/chat/completions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    const responseBody = await response.json();

    if (!response.ok) {
      this.handleError(response, responseBody);
    }

    const data = responseBody as OpenAIResponse;

    return {
      content: data.choices[0]?.message?.content || '',
      finishReason: this.mapFinishReason(data.choices[0]?.finish_reason),
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
      model: data.model,
      provider: 'openai',
    };
  }

  async isAvailable(): Promise<boolean> {
    if (!this.config.apiKey) return false;

    try {
      const response = await this.fetchWithTimeout(`${this.getApiUrl()}/models`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private handleError(response: Response, body: unknown): never {
    const message = this.parseErrorResponse(response, body);

    if (response.status === 401) {
      throw new AuthenticationError('openai');
    }

    if (response.status === 429) {
      throw new RateLimitError('openai');
    }

    throw new LLMError(message, 'openai', undefined, response.status);
  }

  private mapFinishReason(
    reason: string
  ): 'stop' | 'length' | 'content_filter' | 'error' {
    switch (reason) {
      case 'stop':
        return 'stop';
      case 'length':
        return 'length';
      case 'content_filter':
        return 'content_filter';
      default:
        return 'stop';
    }
  }
}
