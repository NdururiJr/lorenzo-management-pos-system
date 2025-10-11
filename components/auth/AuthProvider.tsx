/**
 * Authentication Provider Component
 *
 * Wraps the app with authentication context and handles auth state persistence.
 * Includes token refresh logic.
 *
 * @module components/auth/AuthProvider
 */

'use client';

import { useEffect } from 'react';
import { AuthProvider as AuthContextProvider } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { setAuthToken } from '@/lib/auth/utils';

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Auth Provider Wrapper
 *
 * Handles authentication state persistence and token refresh.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  useEffect(() => {
    // Set up token refresh
    // Firebase automatically refreshes tokens every hour
    const unsubscribe = auth.onIdTokenChanged(async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken(true); // Force refresh
          setAuthToken(token, false);
        } catch (error) {
          console.error('Error refreshing token:', error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return <AuthContextProvider>{children}</AuthContextProvider>;
}
