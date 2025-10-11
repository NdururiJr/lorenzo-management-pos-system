/**
 * Authentication Context
 *
 * Manages authentication state and provides auth-related functions
 * throughout the application.
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
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  type User,
} from 'firebase/auth';
import { getAuthInstance } from '@/lib/firebase';
import {
  getUserRole,
  setAuthToken,
  removeAuthToken,
  type UserData,
} from '@/lib/auth/utils';
import type { UserRole } from '@/lib/validations/auth';

/**
 * Authentication state interface
 */
interface AuthState {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  error: string | null;
}

/**
 * Authentication context value interface
 */
interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
  checkRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  isAdmin: boolean;
  isManager: boolean;
  isStaff: boolean;
  isCustomer: boolean;
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
 * Wraps the application to provide authentication state and functions.
 *
 * @example
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    userData: null,
    loading: true,
    error: null,
  });

  /**
   * Refresh user data from Firestore
   */
  const refreshUserData = useCallback(async () => {
    if (!state.user) {
      setState((prev) => ({ ...prev, userData: null }));
      return;
    }

    try {
      const userData = await getUserRole(state.user.uid);
      setState((prev) => ({ ...prev, userData, error: null }));
    } catch (error) {
      console.error('Error fetching user data:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to fetch user data',
      }));
    }
  }, [state.user]);

  /**
   * Listen to authentication state changes
   */
  useEffect(() => {
    const auth = getAuthInstance();

    if (!auth) {
      setState({
        user: null,
        userData: null,
        loading: false,
        error: 'Firebase not initialized',
      });
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        setState((prev) => ({ ...prev, user, loading: true }));

        if (user) {
          try {
            // Get ID token and store it
            const token = await user.getIdToken();
            setAuthToken(token, false);

            // Fetch user data from Firestore
            const userData = await getUserRole(user.uid);
            setState({
              user,
              userData,
              loading: false,
              error: null,
            });
          } catch (error) {
            console.error('Error fetching user data:', error);
            setState({
              user,
              userData: null,
              loading: false,
              error: 'Failed to fetch user data',
            });
          }
        } else {
          removeAuthToken();
          setState({
            user: null,
            userData: null,
            loading: false,
            error: null,
          });
        }
      },
      (error) => {
        console.error('Auth state change error:', error);
        setState({
          user: null,
          userData: null,
          loading: false,
          error: 'Authentication error',
        });
      }
    );

    return () => unsubscribe();
  }, []);

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(
    async (email: string, password: string, rememberMe = false) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const auth = getAuthInstance();
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Get ID token and store it
        const token = await userCredential.user.getIdToken();
        setAuthToken(token, rememberMe);

        // User data will be fetched by onAuthStateChanged
      } catch (error: unknown) {
        let errorMessage = 'Failed to sign in';

        if (error instanceof Error) {
          // Firebase error codes
          if ('code' in error) {
            const code = (error as { code: string }).code;
            if (code === 'auth/user-not-found' || code === 'auth/wrong-password') {
              errorMessage = 'Invalid email or password';
            } else if (code === 'auth/too-many-requests') {
              errorMessage = 'Too many failed attempts. Please try again later';
            } else if (code === 'auth/user-disabled') {
              errorMessage = 'This account has been disabled';
            } else {
              errorMessage = error.message;
            }
          }
        }

        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        throw new Error(errorMessage);
      }
    },
    []
  );

  /**
   * Sign out current user
   */
  const signOut = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const auth = getAuthInstance();
      await firebaseSignOut(auth);
      removeAuthToken();
      setState({
        user: null,
        userData: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error signing out:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Failed to sign out',
      }));
      throw new Error('Failed to sign out');
    }
  }, []);

  /**
   * Send password reset email
   */
  const sendPasswordReset = useCallback(async (email: string) => {
    try {
      const auth = getAuthInstance();
      await sendPasswordResetEmail(auth, email);
    } catch (error: unknown) {
      let errorMessage = 'Failed to send password reset email';

      if (error instanceof Error && 'code' in error) {
        const code = (error as { code: string }).code;
        if (code === 'auth/user-not-found') {
          errorMessage = 'No account found with this email';
        } else if (code === 'auth/too-many-requests') {
          errorMessage = 'Too many requests. Please try again later';
        } else {
          errorMessage = error.message;
        }
      }

      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Check if user has specific role
   */
  const checkRole = useCallback(
    (role: UserRole): boolean => {
      return state.userData?.role === role;
    },
    [state.userData]
  );

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = useCallback(
    (roles: UserRole[]): boolean => {
      return state.userData ? roles.includes(state.userData.role) : false;
    },
    [state.userData]
  );

  /**
   * Computed properties for role checks
   */
  const isAdmin = useMemo(
    () => state.userData?.role === 'admin',
    [state.userData]
  );

  const isManager = useMemo(
    () => state.userData?.role === 'manager',
    [state.userData]
  );

  const isStaff = useMemo(
    () =>
      state.userData
        ? ['admin', 'manager', 'cashier', 'driver'].includes(state.userData.role)
        : false,
    [state.userData]
  );

  const isCustomer = useMemo(
    () => state.userData?.role === 'customer',
    [state.userData]
  );

  /**
   * Context value
   */
  const value = useMemo(
    () => ({
      ...state,
      signIn,
      signOut,
      sendPasswordReset,
      refreshUserData,
      checkRole,
      hasAnyRole,
      isAdmin,
      isManager,
      isStaff,
      isCustomer,
    }),
    [
      state,
      signIn,
      signOut,
      sendPasswordReset,
      refreshUserData,
      checkRole,
      hasAnyRole,
      isAdmin,
      isManager,
      isStaff,
      isCustomer,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
