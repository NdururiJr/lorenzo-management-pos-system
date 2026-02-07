/**
 * Authentication Context for Website
 *
 * Lightweight auth context for the marketing website.
 * Provides Firebase authentication state for the chatbot.
 *
 * @module contexts/AuthContext
 */

'use client';

import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { getAuthInstance, isFirebaseAuthAvailable } from '@/lib/firebase';

/**
 * Authentication state interface
 */
interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

/**
 * Authentication context value interface
 */
interface AuthContextValue extends AuthState {
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
  customerName: string | null;
}

/**
 * Create authentication context
 */
export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

/**
 * Authentication Provider Props
 */
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Authentication Provider Component
 *
 * Provides authentication state for the website chatbot.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
  });

  /**
   * Listen to authentication state changes
   */
  useEffect(() => {
    // Check if Firebase is available
    if (!isFirebaseAuthAvailable()) {
      setState({
        user: null,
        loading: false,
        isAuthenticated: false,
      });
      return;
    }

    const auth = getAuthInstance();
    if (!auth) {
      setState({
        user: null,
        loading: false,
        isAuthenticated: false,
      });
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setState({
          user,
          loading: false,
          isAuthenticated: !!user,
        });
      },
      (error) => {
        console.error('Auth state change error:', error);
        setState({
          user: null,
          loading: false,
          isAuthenticated: false,
        });
      }
    );

    return () => unsubscribe();
  }, []);

  /**
   * Sign out current user
   */
  const signOut = useCallback(async () => {
    const auth = getAuthInstance();
    if (auth) {
      await firebaseSignOut(auth);
    }
  }, []);

  /**
   * Get Firebase ID token for API authentication
   */
  const getIdToken = useCallback(async (): Promise<string | null> => {
    if (!state.user) return null;
    try {
      return await state.user.getIdToken();
    } catch (error) {
      console.error('Error getting ID token:', error);
      return null;
    }
  }, [state.user]);

  /**
   * Get customer display name
   */
  const customerName = useMemo(() => {
    if (!state.user) return null;
    return state.user.displayName || state.user.email?.split('@')[0] || 'Customer';
  }, [state.user]);

  /**
   * Context value
   */
  const value = useMemo(
    () => ({
      ...state,
      signOut,
      getIdToken,
      customerName,
    }),
    [state, signOut, getIdToken, customerName]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use authentication context
 *
 * @returns {AuthContextValue} Authentication context value
 */
export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
