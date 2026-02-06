/**
 * Google Gemini Provider
 *
 * LLM provider implementation for Google Gemini API.
 *
 * @module lib/llm/providers/google-provider
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

interface GeminiContent {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
      role: string;
    };
    finishReason: string;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export class GoogleProvider extends BaseProvider {
  provider: LLMProvider = 'google';

  constructor(config: ProviderClientConfig) {
    super(config);
  }

  protected getApiUrl(): string {
    return (
      this.config.baseUrl ||
      'https://generativelanguage.googleapis.com/v1beta'
    );
  }

  protected getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
    };
  }

  async chatCompletion(
    messages: ChatMessage[],
    options?: ChatCompletionOptions
  ): Promise<ChatCompletionResponse> {
    // Convert messages to Gemini format
    let systemInstruction: string | undefined;
    const contents: GeminiContent[] = [];

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemInstruction = msg.content;
      } else {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        });
      }
    }

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens ?? 4096,
        topP: options?.topP,
        stopSequences: options?.stopSequences,
      },
    };

    if (systemInstruction) {
      body.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    const url = `${this.getApiUrl()}/models/${this.config.model}:generateContent?key=${this.config.apiKey}`;

    const response = await this.fetchWithTimeout(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    const responseBody = await response.json();

    if (!response.ok) {
      this.handleError(response, responseBody);
    }

    const data = responseBody as GeminiResponse;

    // Extract text from response
    const textContent =
      data.candidates?.[0]?.content?.parts
        ?.map((p) => p.text)
        .join('') || '';

    return {
      content: textContent,
      finishReason: this.mapFinishReason(data.candidates?.[0]?.finishReason),
      usage: data.usageMetadata
        ? {
            promptTokens: data.usageMetadata.promptTokenCount,
            completionTokens: data.usageMetadata.candidatesTokenCount,
            totalTokens: data.usageMetadata.totalTokenCount,
          }
        : undefined,
      model: this.config.model,
      provider: 'google',
    };
  }

  async isAvailable(): Promise<boolean> {
    if (!this.config.apiKey) return false;

    try {
      const response = await this.fetchWithTimeout(
        `${this.getApiUrl()}/models?key=${this.config.apiKey}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  private handleError(response: Response, body: unknown): never {
    const message = this.parseErrorResponse(response, body);

    if (response.status === 401 || response.status === 403) {
      throw new AuthenticationError('google');
    }

    if (response.status === 429) {
      throw new RateLimitError('google');
    }

    throw new LLMError(message, 'google', undefined, response.status);
  }

  private mapFinishReason(
    reason?: string
  ): 'stop' | 'length' | 'content_filter' | 'error' {
    switch (reason) {
      case 'STOP':
        return 'stop';
      case 'MAX_TOKENS':
        return 'length';
      case 'SAFETY':
        return 'content_filter';
      default:
        return 'stop';
    }
  }
}
