/**
 * Session Manager
 *
 * Handles session management including:
 * - Session timeout tracking
 * - Shift-based auto-logout
 * - Last activity tracking
 *
 * @module lib/auth/session-manager
 */

import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from '@/lib/db/schema';

interface SessionInfo {
  userId: string;
  loginTime: Date;
  lastActivity: Date;
  expiresAt: Date;
}

interface SystemSettings {
  inactivityTimeout: number;
  sessionDuration: number;
}

const SESSION_KEY = 'lorenzo_session';
const DEFAULT_SESSION_DURATION = 8; // hours

/**
 * Create a new session for a user
 */
export function createSession(userId: string, durationHours?: number): SessionInfo {
  const now = new Date();
  const duration = durationHours || DEFAULT_SESSION_DURATION;
  const expiresAt = new Date(now.getTime() + duration * 60 * 60 * 1000);

  const session: SessionInfo = {
    userId,
    loginTime: now,
    lastActivity: now,
    expiresAt,
  };

  // Store in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  return session;
}

/**
 * Get current session info
 */
export function getSession(): SessionInfo | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) return null;

  try {
    const session = JSON.parse(stored);
    return {
      ...session,
      loginTime: new Date(session.loginTime),
      lastActivity: new Date(session.lastActivity),
      expiresAt: new Date(session.expiresAt),
    };
  } catch {
    return null;
  }
}

/**
 * Update last activity timestamp
 */
export function updateLastActivity(): void {
  const session = getSession();
  if (!session) return;

  session.lastActivity = new Date();

  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

/**
 * Check if session is expired
 */
export function isSessionExpired(): boolean {
  const session = getSession();
  if (!session) return true;

  return new Date() > session.expiresAt;
}

/**
 * Clear the current session
 */
export function clearSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
  }
}

/**
 * Get remaining session time in seconds
 */
export function getRemainingSessionTime(): number {
  const session = getSession();
  if (!session) return 0;

  const remaining = session.expiresAt.getTime() - Date.now();
  return Math.max(0, Math.floor(remaining / 1000));
}

/**
 * Check if user should be auto-logged out based on shift times
 */
export async function checkShiftBasedLogout(userId: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return false;

    const userData = userDoc.data() as User;
    if (!userData.shiftEndTime) return false;

    const now = new Date();
    const [hours, minutes] = userData.shiftEndTime.split(':').map(Number);

    // Create today's shift end time
    const shiftEnd = new Date();
    shiftEnd.setHours(hours, minutes, 0, 0);

    // If current time is past shift end, should logout
    return now > shiftEnd;
  } catch (error) {
    console.error('Error checking shift-based logout:', error);
    return false;
  }
}

/**
 * Get system settings for session management
 */
export async function getSessionSettings(): Promise<SystemSettings> {
  try {
    const settingsDoc = await getDoc(doc(db, 'system_settings', 'global'));
    if (settingsDoc.exists()) {
      const data = settingsDoc.data();
      return {
        inactivityTimeout: data.inactivityTimeout || 600,
        sessionDuration: data.sessionDuration || DEFAULT_SESSION_DURATION,
      };
    }
  } catch (error) {
    console.error('Error fetching session settings:', error);
  }

  return {
    inactivityTimeout: 600,
    sessionDuration: DEFAULT_SESSION_DURATION,
  };
}

/**
 * Update user's last login timestamp
 */
export async function updateLastLogin(userId: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      lastLogin: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating last login:', error);
  }
}

/**
 * Format remaining time as human-readable string
 */
export function formatRemainingTime(seconds: number): string {
  if (seconds <= 0) return 'Expired';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}
