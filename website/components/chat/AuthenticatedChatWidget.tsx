/**
 * Authenticated Chat Widget
 *
 * Wrapper around ChatWidget that provides authentication context.
 * Automatically passes the Firebase ID token to the chat system.
 *
 * @module components/chat/AuthenticatedChatWidget
 */

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ChatWidget } from './ChatWidget';

export function AuthenticatedChatWidget() {
  const { user, loading, getIdToken, customerName, isAuthenticated } = useAuth();
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Get fresh token when user changes
  useEffect(() => {
    async function fetchToken() {
      if (user) {
        const token = await getIdToken();
        setAuthToken(token);
      } else {
        setAuthToken(null);
      }
    }
    fetchToken();
  }, [user, getIdToken]);

  // Refresh token periodically (every 50 minutes - tokens expire in 60)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      const token = await getIdToken();
      setAuthToken(token);
    }, 50 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, getIdToken]);

  // Don't render until auth state is loaded
  if (loading) {
    return null;
  }

  return (
    <ChatWidget
      authToken={authToken}
      customerName={customerName}
      isAuthenticated={isAuthenticated}
    />
  );
}
