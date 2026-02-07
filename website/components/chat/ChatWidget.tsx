/**
 * ChatWidget Component
 *
 * Floating chat widget container that appears on all website pages.
 * Includes the chat button and expandable chat window.
 *
 * @module components/chat/ChatWidget
 */

'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useChat } from '@/hooks/useChat';
import { ChatWindow } from './ChatWindow';

// Permanent dismissal (user opened chat or clicked X)
const CHAT_OPENED_KEY = 'lorenzo_chat_opened';

interface ChatWidgetProps {
  authToken?: string | null;
  customerName?: string | null;
  isAuthenticated?: boolean;
  className?: string;
}

export function ChatWidget({ authToken, customerName, isAuthenticated, className }: ChatWidgetProps) {
  const chat = useChat(authToken);
  const pathname = usePathname();
  const [showLabel, setShowLabel] = useState(false);
  const [labelVisible, setLabelVisible] = useState(true);

  // Reset and show label on each page navigation (if user hasn't opened chat before)
  useEffect(() => {
    // Check if user has previously opened/dismissed chat permanently
    const hasOpenedChat = localStorage.getItem(CHAT_OPENED_KEY);
    if (hasOpenedChat) {
      setShowLabel(false);
      return;
    }

    // Reset visibility for new page
    setLabelVisible(true);
    setShowLabel(false);

    // Show label after 2 seconds on new page
    const showTimer = setTimeout(() => {
      setShowLabel(true);
    }, 2000);

    // Auto-hide label after 15 seconds
    const hideTimer = setTimeout(() => {
      setLabelVisible(false);
    }, 17000); // 2s delay + 15s visible

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [pathname]); // Re-run when pathname changes

  // Hide label when chat is opened
  useEffect(() => {
    if (chat.isOpen) {
      setShowLabel(false);
      localStorage.setItem(CHAT_OPENED_KEY, 'true');
    }
  }, [chat.isOpen]);

  const handleDismissLabel = () => {
    setLabelVisible(false);
    localStorage.setItem(CHAT_OPENED_KEY, 'true');
  };

  return (
    <>
      {/* Chat Window */}
      <ChatWindow
        isOpen={chat.isOpen}
        onClose={chat.closeChat}
        messages={chat.messages}
        isLoading={chat.isLoading}
        onSendMessage={chat.sendMessage}
        onClearMessages={chat.clearMessages}
        quickActions={chat.quickActions}
        customerName={customerName}
        isAuthenticated={isAuthenticated}
      />

      {/* Floating Chat Button with Label */}
      {!chat.isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          {/* Floating Label */}
          {showLabel && labelVisible && (
            <div
              className={cn(
                'relative animate-fade-in',
                'bg-white text-lorenzo-dark',
                'text-sm font-medium',
                'px-4 py-3 rounded-xl',
                'shadow-lg border border-gray-100',
                'whitespace-nowrap',
                'animate-float'
              )}
            >
              <button
                onClick={handleDismissLabel}
                className="absolute -top-2 -right-2 w-5 h-5 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-xs transition-colors"
                aria-label="Dismiss"
              >
                &times;
              </button>
              <span className="text-lorenzo-accent-teal font-semibold">Need help?</span>
              <br />
              <span className="text-gray-600">Chat with Melvin</span>
              {/* Arrow pointing to button */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
                <div className="w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-white drop-shadow-sm" />
              </div>
            </div>
          )}

          {/* Chat Button */}
          <button
            onClick={chat.openChat}
            className={cn(
              'w-14 h-14 rounded-full',
              'overflow-hidden',
              'shadow-lg hover:shadow-xl',
              'transition-all duration-300',
              'hover:scale-110',
              'focus:outline-none focus:ring-2 focus:ring-lorenzo-accent-teal focus:ring-offset-2',
              'border-2 border-lorenzo-accent-teal',
              className
            )}
            aria-label="Chat with Melvin"
          >
            <Image
              src="/images/melvin.png"
              alt="Chat with Melvin"
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      )}
    </>
  );
}
