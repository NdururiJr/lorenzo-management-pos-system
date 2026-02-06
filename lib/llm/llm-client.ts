/**
 * LLM Client
 *
 * Unified client for LLM operations that automatically selects
 * the appropriate provider based on configuration.
 *
 * @module lib/llm/llm-client
 */

import type { LLMProvider, LLMAgentType, AgentFunction } from '@/lib/db/schema';
import { getModelForRequest, getProviderWithKey } from '@/lib/config';
import { getGlobalLLMConfig } from '@/lib/db/config';
import {
  OpenAIProvider,
  AnthropicProvider,
  GoogleProvider,
  LocalProvider,
} from './providers';
import type {
  ChatMessage,
  ChatCompletionOptions,
  ChatCompletionResponse,
  LLMProviderInterface,
  ProviderClientConfig,
  LLMRequestContext,
} from './types';
import { LLMError, RateLimitError } from './types';

/**
 * Create a provider instance
 */
function createProvider(
  providerType: LLMProvider,
  config: ProviderClientConfig
): LLMProviderInterface {
  switch (providerType) {
    case 'openai':
      return new OpenAIProvider(config);
    case 'anthropic':
      return new AnthropicProvider(config);
    case 'google':
      return new GoogleProvider(config);
    case 'local':
      return new LocalProvider(config);
    default:
      throw new Error(`Unknown provider: ${providerType}`);
  }
}

/**
 * Main LLM client class
 */
export class LLMClient {
  private requestId?: string;

  constructor(requestId?: string) {
    this.requestId = requestId;
  }

  /**
   * Generate a chat completion using configured model for the agent/function
   *
   * @param agentType - The type of agent making the request
   * @param agentFunction - The function being performed
   * @param messages - The conversation messages
   * @param options - Optional completion options (overrides config)
   */
  async chatCompletion(
    agentType: LLMAgentType,
    agentFunction: AgentFunction,
    messages: ChatMessage[],
    options?: Partial<ChatCompletionOptions>
  ): Promise<ChatCompletionResponse> {
    const context: LLMRequestContext = {
      agentType,
      agentFunction,
      requestId: this.requestId,
    };

    // Get the model selection based on configuration
    const modelSelection = await getModelForRequest(context);

    // Create provider with the selected model
    const providerConfig: ProviderClientConfig = {
      apiKey: modelSelection.apiKey,
      baseUrl: modelSelection.baseUrl,
      model: modelSelection.model,
    };

    const provider = createProvider(modelSelection.provider, providerConfig);

    // Merge options with config defaults
    const finalOptions: ChatCompletionOptions = {
      temperature: options?.temperature ?? modelSelection.temperature,
      maxTokens: options?.maxTokens ?? modelSelection.maxTokens,
      ...options,
    };

    try {
      const response = await provider.chatCompletion(messages, finalOptions);
      return response;
    } catch (error) {
      // Handle rate limit with fallback
      if (error instanceof RateLimitError) {
        const fallbackResponse = await this.tryFallbackProviders(
          modelSelection.provider,
          messages,
          finalOptions
        );
        if (fallbackResponse) {
          return fallbackResponse;
        }
      }
      throw error;
    }
  }

  /**
   * Try fallback providers when primary fails
   */
  private async tryFallbackProviders(
    failedProvider: LLMProvider,
    messages: ChatMessage[],
    options: ChatCompletionOptions
  ): Promise<ChatCompletionResponse | null> {
    const globalConfig = await getGlobalLLMConfig();

    if (!globalConfig.enableFallback) {
      return null;
    }

    for (const fallbackProvider of globalConfig.fallbackOrder) {
      if (fallbackProvider === failedProvider) continue;

      const providerConfig = await getProviderWithKey(fallbackProvider);
      if (!providerConfig || !providerConfig.enabled) continue;

      try {
        const provider = createProvider(fallbackProvider, {
          apiKey: providerConfig.apiKey,
          baseUrl: providerConfig.baseUrl,
          model: providerConfig.defaultModel,
        });

        const response = await provider.chatCompletion(messages, options);
        return response;
      } catch {
        // Continue to next fallback
        continue;
      }
    }

    return null;
  }

  /**
   * Generate completion with a specific provider (bypassing config)
   */
  async chatCompletionWithProvider(
    providerType: LLMProvider,
    model: string,
    messages: ChatMessage[],
    options?: ChatCompletionOptions
  ): Promise<ChatCompletionResponse> {
    const providerConfig = await getProviderWithKey(providerType);

    if (!providerConfig) {
      throw new LLMError(`Provider ${providerType} not configured`, providerType);
    }

    const provider = createProvider(providerType, {
      apiKey: providerConfig.apiKey,
      baseUrl: providerConfig.baseUrl,
      model,
    });

    return provider.chatCompletion(messages, options);
  }

  /**
   * Check if a provider is available
   */
  async isProviderAvailable(providerType: LLMProvider): Promise<boolean> {
    const providerConfig = await getProviderWithKey(providerType);

    if (!providerConfig || !providerConfig.enabled) {
      return false;
    }

    const provider = createProvider(providerType, {
      apiKey: providerConfig.apiKey,
      baseUrl: providerConfig.baseUrl,
      model: providerConfig.defaultModel,
    });

    return provider.isAvailable();
  }
}

/**
 * Singleton instance for convenience
 */
let defaultClient: LLMClient | null = null;

/**
 * Get the default LLM client
 */
export function getLLMClient(requestId?: string): LLMClient {
  if (requestId) {
    return new LLMClient(requestId);
  }

  if (!defaultClient) {
    defaultClient = new LLMClient();
  }

  return defaultClient;
}

/**
 * Simple function to get a chat completion
 * Convenience wrapper for common use case
 */
export async function complete(
  agentType: LLMAgentType,
  agentFunction: AgentFunction,
  messages: ChatMessage[],
  options?: Partial<ChatCompletionOptions>
): Promise<string> {
  const client = getLLMClient();
  const response = await client.chatCompletion(agentType, agentFunction, messages, options);
  return response.content;
}

/**
 * Simple function to get a chat response for a single prompt
 */
export async function ask(
  agentType: LLMAgentType,
  agentFunction: AgentFunction,
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const messages: ChatMessage[] = [];

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  messages.push({ role: 'user', content: prompt });

  return complete(agentType, agentFunction, messages);
}
