/**
 * Base LLM Provider
 *
 * Abstract base class for all LLM providers.
 *
 * @module lib/llm/providers/base-provider
 */

import type { LLMProvider } from '@/lib/db/schema';
import type {
  LLMProviderInterface,
  ChatMessage,
  ChatCompletionOptions,
  ChatCompletionResponse,
  ChatCompletionChunk,
  ProviderClientConfig,
} from '../types';

/**
 * Abstract base class for LLM providers
 */
export abstract class BaseProvider implements LLMProviderInterface {
  abstract provider: LLMProvider;

  protected config: ProviderClientConfig;
  protected defaultTimeout = 30000;

  constructor(config: ProviderClientConfig) {
    this.config = config;
  }

  /**
   * Generate a chat completion
   */
  abstract chatCompletion(
    messages: ChatMessage[],
    options?: ChatCompletionOptions
  ): Promise<ChatCompletionResponse>;

  /**
   * Generate a streaming chat completion (optional)
   */
  streamChatCompletion?(
    messages: ChatMessage[],
    options?: ChatCompletionOptions
  ): AsyncGenerator<ChatCompletionChunk>;

  /**
   * Check if the provider is available
   */
  abstract isAvailable(): Promise<boolean>;

  /**
   * Get the API endpoint URL
   */
  protected abstract getApiUrl(): string;

  /**
   * Get headers for API requests
   */
  protected abstract getHeaders(): Record<string, string>;

  /**
   * Make an HTTP request with timeout
   */
  protected async fetchWithTimeout(
    url: string,
    options: RequestInit
  ): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.config.timeout || this.defaultTimeout
    );

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Parse error response from provider
   */
  protected parseErrorResponse(response: Response, body: unknown): string {
    if (typeof body === 'object' && body !== null) {
      const errorBody = body as Record<string, unknown>;
      if (typeof errorBody.error === 'object' && errorBody.error !== null) {
        const error = errorBody.error as Record<string, unknown>;
        return (error.message as string) || 'Unknown error';
      }
      if (typeof errorBody.message === 'string') {
        return errorBody.message;
      }
    }
    return `HTTP ${response.status}: ${response.statusText}`;
  }
}
