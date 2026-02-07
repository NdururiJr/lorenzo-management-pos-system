/**
 * Chat Hook
 *
 * React hook for managing chat state and interactions with the AI agent system.
 * Uses the orchestrator agent with OpenAI for human-like responses.
 *
 * @module hooks/useChat
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { getAgentClient, type ChatMessage } from '@/services/agents/api-client';

/**
 * Chat state interface
 */
interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  isOpen: boolean;
  pendingRetryMessage: string | null;
}

/**
 * Quick action suggestion
 */
interface QuickAction {
  label: string;
  prompt: string;
}

/**
 * Default quick actions for new conversations
 */
const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  { label: 'Track my order', prompt: 'Where is my order?' },
  { label: 'View pricing', prompt: 'What are your prices?' },
  { label: 'Our services', prompt: 'What services do you offer?' },
  { label: 'Contact support', prompt: 'I need to speak with someone' },
];

/**
 * Lorenzo company info for fallback responses
 */
const LORENZO_INFO = {
  phone: '0728 400 200',
  whatsapp: '+254728400200',
};

/**
 * Chat hook for managing conversations
 */
export function useChat(authToken?: string | null) {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
    isOpen: false,
    pendingRetryMessage: null,
  });

  const clientRef = useRef(getAgentClient());
  const previousAuthTokenRef = useRef<string | null | undefined>(undefined);

  // Update auth token when it changes
  useEffect(() => {
    clientRef.current.setAuthToken(authToken || null);
  }, [authToken]);

  /**
   * Generate unique message ID
   */
  const generateMessageId = useCallback((): string => {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }, []);

  /**
   * Add a message to the conversation
   */
  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: generateMessageId(),
      timestamp: new Date(),
    };

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));

    return newMessage;
  }, [generateMessageId]);

  /**
   * Send a message and get a response from the orchestrator agent
   */
  const sendMessage = useCallback(async (content: string, isRetry = false) => {
    if (!content.trim()) return;

    // Add user message (but not for retry - it's already there)
    if (!isRetry) {
      addMessage({ role: 'user', content: content.trim() });
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Send to orchestrator agent for human-like response
      const response = await clientRef.current.sendRequest(
        'orchestrator-agent',
        'chat',
        { message: content.trim() }
      );

      if (response.status === 'success') {
        const data = response.data as {
          message: string;
          intent?: string;
          requiresLogin?: boolean;
        };

        const requiresLogin = data.requiresLogin === true;

        addMessage({
          role: 'assistant',
          content: data.message || response.message || 'I apologize, I couldn\'t process that request.',
          agentSource: response.fromAgent,
          metadata: {
            requiresLogin,
          },
        });

        // Track message for retry if login is required
        if (requiresLogin) {
          setState((prev) => ({
            ...prev,
            pendingRetryMessage: content.trim(),
          }));
        } else {
          // Clear pending retry on successful response
          setState((prev) => ({
            ...prev,
            pendingRetryMessage: null,
          }));
        }
      } else {
        // Error from agent
        addMessage({
          role: 'assistant',
          content: response.error || 'Sorry, I encountered an error. Please try again or contact us directly.',
        });
      }
    } catch (error) {
      console.error('Chat error:', error);

      // Fallback response on network/server error
      addMessage({
        role: 'assistant',
        content: `I'm having trouble connecting right now. 😅 Please try again, or reach out to us directly:\n\n📞 **${LORENZO_INFO.phone}**\n💬 **WhatsApp:** ${LORENZO_INFO.whatsapp}`,
      });

      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [addMessage]);

  // Auto-retry pending message when user logs in
  useEffect(() => {
    const wasLoggedOut = !previousAuthTokenRef.current;
    const isNowLoggedIn = !!authToken;

    // If user just logged in and there's a pending retry message
    if (wasLoggedOut && isNowLoggedIn && state.pendingRetryMessage && !state.isLoading) {
      // Add a system message indicating we're retrying
      addMessage({
        role: 'assistant',
        content: "Great, you're now signed in! Let me try that again for you...",
      });

      // Small delay to show the message before retrying
      const timer = setTimeout(() => {
        const message = state.pendingRetryMessage;
        if (message) {
          // Clear pending before retry to avoid loops
          setState((prev) => ({ ...prev, pendingRetryMessage: null }));
          sendMessage(message, true);
        }
      }, 500);

      previousAuthTokenRef.current = authToken;
      return () => clearTimeout(timer);
    }

    previousAuthTokenRef.current = authToken;
  }, [authToken, state.pendingRetryMessage, state.isLoading, addMessage, sendMessage]);

  /**
   * Toggle chat open/closed
   */
  const toggleChat = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  /**
   * Open chat
   */
  const openChat = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: true }));
  }, []);

  /**
   * Close chat
   */
  const closeChat = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  /**
   * Clear conversation
   */
  const clearMessages = useCallback(async () => {
    // Clear local state including pending retry
    setState((prev) => ({ ...prev, messages: [], error: null, pendingRetryMessage: null }));

    // Clear server-side history
    try {
      await clientRef.current.sendRequest('orchestrator-agent', 'clearHistory', {});
    } catch {
      // Ignore errors on clear
    }
  }, []);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    isOpen: state.isOpen,
    sendMessage,
    toggleChat,
    openChat,
    closeChat,
    clearMessages,
    quickActions: DEFAULT_QUICK_ACTIONS,
  };
}
