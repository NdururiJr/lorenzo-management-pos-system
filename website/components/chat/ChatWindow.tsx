/**
 * ChatWindow Component
 *
 * Main chat window UI with messages, input, and controls.
 * Features: message history, quick actions, typing indicator.
 *
 * @module components/chat/ChatWindow
 */

'use client';

import { useRef, useEffect, useState } from 'react';
import { X, Trash2, Send, Loader2, User, LogIn, UserCheck } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/services/agents/api-client';

/** Customer login URL */
const CUSTOMER_LOGIN_URL = `${process.env.NEXT_PUBLIC_POS_API_URL || 'http://localhost:3000'}/customer-login`;

/**
 * Melvin avatar component - reusable across chat UI
 */
function MelvinAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className={cn(sizeClasses[size], 'rounded-full overflow-hidden flex-shrink-0')}>
      <Image
        src="/images/melvin.png"
        alt="Melvin"
        width={size === 'lg' ? 64 : size === 'md' ? 40 : 32}
        height={size === 'lg' ? 64 : size === 'md' ? 40 : 32}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

interface QuickAction {
  label: string;
  prompt: string;
}

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onClearMessages: () => void;
  quickActions: QuickAction[];
  customerName?: string | null;
  isAuthenticated?: boolean;
}

export function ChatWindow({
  isOpen,
  onClose,
  messages,
  isLoading,
  onSendMessage,
  onClearMessages,
  quickActions,
  customerName,
  isAuthenticated,
}: ChatWindowProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    if (!isLoading) {
      onSendMessage(action.prompt);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'fixed',
        // Very high z-index to ensure it's above everything
        'z-[99999]',
        // Mobile: full screen
        'inset-0',
        // Desktop: bottom right corner with fixed size, max-height to fit viewport
        'md:inset-auto md:bottom-6 md:right-6 md:w-[400px] md:h-[600px] md:max-h-[calc(100vh-48px)]',
        'flex flex-col',
        'bg-white',
        'md:rounded-2xl md:shadow-2xl',
        'border border-gray-200',
        'overflow-hidden'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-lorenzo-dark text-white border-b border-gray-700">
        <div className="flex items-center gap-3">
          <MelvinAvatar size="md" />
          <div>
            <h3 className="font-semibold">Melvin</h3>
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <span className="text-xs text-lorenzo-accent-gold flex items-center gap-1">
                  <UserCheck className="w-3 h-3" />
                  {customerName || 'Customer'}
                </span>
              ) : (
                <span className="text-xs text-white/70">Guest</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isAuthenticated && (
            <a
              href={CUSTOMER_LOGIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 rounded-lg text-xs bg-lorenzo-accent-teal hover:bg-lorenzo-accent-teal/80 transition-colors flex items-center gap-1"
              title="Sign in to track orders"
            >
              <LogIn className="w-3 h-3" />
              Sign in
            </a>
          )}
          <button
            onClick={onClearMessages}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Clear messages"
            title="Clear conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <WelcomeMessage onQuickAction={handleQuickAction} quickActions={quickActions} />
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && <TypingIndicator />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions (when few messages) */}
      {messages.length > 0 && messages.length < 3 && !isLoading && (
        <div className="px-4 py-2 border-t border-gray-100 bg-white">
          <div className="flex flex-wrap gap-2">
            {quickActions.slice(0, 3).map((action) => (
              <button
                key={action.label}
                onClick={() => handleQuickAction(action)}
                className="px-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700 hover:bg-lorenzo-accent-teal hover:text-white transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className={cn(
              'flex-1 px-4 py-3 rounded-xl',
              'bg-gray-100 border border-gray-200',
              'focus:outline-none focus:ring-2 focus:ring-lorenzo-accent-teal focus:border-transparent',
              'placeholder:text-gray-400',
              'disabled:opacity-50'
            )}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={cn(
              'w-12 h-12 rounded-xl',
              'bg-lorenzo-accent-teal text-white',
              'flex items-center justify-center',
              'hover:bg-lorenzo-accent-teal/90',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors'
            )}
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

/**
 * Welcome message shown when chat is empty
 */
function WelcomeMessage({
  onQuickAction,
  quickActions,
}: {
  onQuickAction: (action: QuickAction) => void;
  quickActions: QuickAction[];
}) {
  return (
    <div className="text-center py-6">
      <div className="mx-auto mb-4">
        <MelvinAvatar size="lg" />
      </div>
      <h4 className="font-semibold text-gray-900 mb-2">Hi, I'm Melvin!</h4>
      <p className="text-sm text-gray-600 mb-6 max-w-xs mx-auto">
        Your assistant for today at Lorenzo Dry Cleaners. I can help with order tracking, pricing, and more.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => onQuickAction(action)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium',
              'bg-white border border-gray-200',
              'hover:bg-lorenzo-accent-teal hover:text-white hover:border-lorenzo-accent-teal',
              'transition-all duration-200'
            )}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Individual message bubble
 */
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  const requiresLogin = message.metadata?.requiresLogin === true;

  return (
    <div className={cn('flex items-start gap-2', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar */}
      {isUser ? (
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-gray-200">
          <User className="w-4 h-4 text-gray-600" />
        </div>
      ) : (
        <MelvinAvatar size="sm" />
      )}

      {/* Message Content */}
      <div className="max-w-[80%]">
        <div
          className={cn(
            'rounded-2xl px-4 py-3',
            isUser
              ? 'bg-lorenzo-accent-teal text-white rounded-tr-sm'
              : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
          )}
        >
          <div className="text-sm whitespace-pre-wrap prose prose-sm max-w-none">
            <FormattedMessage content={message.content} />
          </div>
          <div
            className={cn(
              'text-xs mt-1',
              isUser ? 'text-white/70' : 'text-gray-400'
            )}
          >
            {formatTime(message.timestamp)}
          </div>
        </div>
        {/* Login prompt card for messages requiring authentication */}
        {!isUser && requiresLogin && <LoginPromptCard />}
      </div>
    </div>
  );
}

/**
 * Format message content with markdown-like styling
 */
function FormattedMessage({ content }: { content: string }) {
  // Simple markdown formatting
  const formatted = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-lorenzo-accent-teal underline">$1</a>')
    .replace(/• (.*?)$/gm, '<li>$1</li>')
    .replace(/(<li>.*?<\/li>\n?)+/g, '<ul class="list-disc list-inside space-y-1">$&</ul>');

  return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
}

/**
 * Typing indicator
 */
function TypingIndicator() {
  return (
    <div className="flex items-start gap-2">
      <MelvinAvatar size="sm" />
      <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

/**
 * Format timestamp for display
 */
function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Login prompt card shown when action requires authentication
 */
function LoginPromptCard() {
  return (
    <div className="mt-3 p-3 bg-lorenzo-accent-teal/10 rounded-xl border border-lorenzo-accent-teal/20">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-lorenzo-accent-teal/20 rounded-lg">
          <LogIn className="w-4 h-4 text-lorenzo-accent-teal" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800">Sign in to continue</p>
          <p className="text-xs text-gray-600 mt-1">
            To view your orders or access personalized features, please sign in to your account.
          </p>
          <a
            href={CUSTOMER_LOGIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-lorenzo-accent-teal text-white hover:bg-lorenzo-accent-teal/90 transition-colors"
          >
            <LogIn className="w-3 h-3" />
            Sign in to Customer Portal
          </a>
        </div>
      </div>
    </div>
  );
}
