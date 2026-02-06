/**
 * LLM Types
 *
 * Unified type definitions for LLM operations across all providers.
 *
 * @module lib/llm/types
 */

import type { LLMProvider, LLMAgentType, AgentFunction } from '@/lib/db/schema';

/**
 * Role in a chat conversation
 */
export type ChatRole = 'system' | 'user' | 'assistant';

/**
 * A message in a chat conversation
 */
export interface ChatMessage {
  role: ChatRole;
  content: string;
}

/**
 * Options for a chat completion request
 */
export interface ChatCompletionOptions {
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

/**
 * Response from a chat completion
 */
export interface ChatCompletionResponse {
  content: string;
  finishReason: 'stop' | 'length' | 'content_filter' | 'error';
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: LLMProvider;
}

/**
 * Streaming chunk from a chat completion
 */
export interface ChatCompletionChunk {
  content: string;
  done: boolean;
}

/**
 * Request context for LLM operations
 */
export interface LLMRequestContext {
  agentType: LLMAgentType;
  agentFunction: AgentFunction;
  requestId?: string;
}

/**
 * Provider-specific configuration
 */
export interface ProviderClientConfig {
  apiKey?: string;
  baseUrl?: string;
  model: string;
  timeout?: number;
}

/**
 * Error from LLM provider
 */
export class LLMError extends Error {
  constructor(
    message: string,
    public provider: LLMProvider,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'LLMError';
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends LLMError {
  constructor(
    provider: LLMProvider,
    public retryAfterMs?: number
  ) {
    super('Rate limit exceeded', provider, 'RATE_LIMIT', 429);
    this.name = 'RateLimitError';
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends LLMError {
  constructor(provider: LLMProvider) {
    super('Invalid API key or authentication failed', provider, 'AUTH_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * Base provider interface
 */
export interface LLMProviderInterface {
  provider: LLMProvider;

  /**
   * Generate a chat completion
   */
  chatCompletion(
    messages: ChatMessage[],
    options?: ChatCompletionOptions
  ): Promise<ChatCompletionResponse>;

  /**
   * Generate a streaming chat completion
   */
  streamChatCompletion?(
    messages: ChatMessage[],
    options?: ChatCompletionOptions
  ): AsyncGenerator<ChatCompletionChunk>;

  /**
   * Check if the provider is available
   */
  isAvailable(): Promise<boolean>;
}
