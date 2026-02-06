/**
 * Local Models Provider
 *
 * LLM provider implementation for local models (Ollama, LM Studio, etc).
 *
 * @module lib/llm/providers/local-provider
 */

import type { LLMProvider } from '@/lib/db/schema';
import { BaseProvider } from './base-provider';
import {
  LLMError,
  type ChatMessage,
  type ChatCompletionOptions,
  type ChatCompletionResponse,
  type ProviderClientConfig,
} from '../types';

interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export class LocalProvider extends BaseProvider {
  provider: LLMProvider = 'local';

  constructor(config: ProviderClientConfig) {
    super(config);
    // Local models typically need more time
    this.defaultTimeout = 120000;
  }

  protected getApiUrl(): string {
    return this.config.baseUrl || 'http://localhost:11434/api';
  }

  protected getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Some local servers may require auth
    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    return headers;
  }

  async chatCompletion(
    messages: ChatMessage[],
    options?: ChatCompletionOptions
  ): Promise<ChatCompletionResponse> {
    const ollamaMessages: OllamaMessage[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const body = {
      model: this.config.model,
      messages: ollamaMessages,
      stream: false,
      options: {
        temperature: options?.temperature ?? 0.7,
        num_predict: options?.maxTokens ?? 4096,
        top_p: options?.topP,
        stop: options?.stopSequences,
      },
    };

    const response = await this.fetchWithTimeout(`${this.getApiUrl()}/chat`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    const responseBody = await response.json();

    if (!response.ok) {
      this.handleError(response, responseBody);
    }

    const data = responseBody as OllamaResponse;

    // Calculate approximate token counts if available
    const promptTokens = data.prompt_eval_count || 0;
    const completionTokens = data.eval_count || 0;

    return {
      content: data.message?.content || '',
      finishReason: data.done ? 'stop' : 'length',
      usage:
        promptTokens || completionTokens
          ? {
              promptTokens,
              completionTokens,
              totalTokens: promptTokens + completionTokens,
            }
          : undefined,
      model: data.model,
      provider: 'local',
    };
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout(`${this.getApiUrl()}/tags`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get list of available local models
   */
  async listModels(): Promise<string[]> {
    try {
      const response = await this.fetchWithTimeout(`${this.getApiUrl()}/tags`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        return [];
      }

      const data = (await response.json()) as { models?: Array<{ name: string }> };
      return data.models?.map((m) => m.name) || [];
    } catch {
      return [];
    }
  }

  private handleError(response: Response, body: unknown): never {
    const message = this.parseErrorResponse(response, body);
    throw new LLMError(message, 'local', undefined, response.status);
  }
}
