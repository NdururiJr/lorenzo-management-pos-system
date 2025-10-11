/**
 * useAuth Hook
 *
 * Custom hook to access authentication context.
 * Provides type-safe access to auth state and functions.
 *
 * @module hooks/useAuth
 */

'use client';

import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

/**
 * Custom hook to use authentication context
 *
 * @returns Authentication context value
 * @throws Error if used outside AuthProvider
 *
 * @example
 * function MyComponent() {
 *   const { user, userData, signIn, signOut, isAdmin } = useAuth();
 *
 *   if (!user) {
 *     return <div>Please log in</div>;
 *   }
 *
 *   return (
 *     <div>
 *       <p>Welcome, {userData?.name}</p>
 *       {isAdmin && <AdminPanel />}
 *       <button onClick={signOut}>Sign Out</button>
 *     </div>
 *   );
 * }
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
