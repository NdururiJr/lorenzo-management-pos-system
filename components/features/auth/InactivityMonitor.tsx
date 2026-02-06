'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, AlertTriangle } from 'lucide-react';

interface InactivityMonitorProps {
  /** Override default timeout (in seconds) */
  timeoutOverride?: number;
  /** Warning time before logout (in seconds) */
  warningTime?: number;
  /** Whether to show the monitor (can be disabled for certain pages) */
  enabled?: boolean;
}

const DEFAULT_TIMEOUT = 600; // 10 minutes
const DEFAULT_WARNING_TIME = 60; // 1 minute warning

/**
 * InactivityMonitor Component
 *
 * Monitors user activity and automatically logs out after a period of inactivity.
 * Shows a warning dialog before logout to allow users to continue their session.
 */
export function InactivityMonitor({
  timeoutOverride,
  warningTime = DEFAULT_WARNING_TIME,
  enabled = true,
}: InactivityMonitorProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(warningTime);
  const [inactivityTimeout, setInactivityTimeout] = useState(timeoutOverride || DEFAULT_TIMEOUT);

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch system settings for inactivity timeout
  useEffect(() => {
    if (!timeoutOverride) {
      const fetchSettings = async () => {
        try {
          const settingsRef = doc(db, 'system_settings', 'global');
          const settingsDoc = await getDoc(settingsRef);
          if (settingsDoc.exists()) {
            const data = settingsDoc.data();
            if (data.inactivityTimeout) {
              setInactivityTimeout(data.inactivityTimeout);
            }
          }
        } catch (error) {
          console.error('Error fetching inactivity settings:', error);
        }
      };
      fetchSettings();
    }
  }, [timeoutOverride]);

  // Clear all timers
  const clearAllTimers = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  // Handle user logout
  const handleLogout = useCallback(async () => {
    clearAllTimers();
    setShowWarning(false);
    try {
      await signOut();
      router.push('/login?reason=inactivity');
    } catch (error) {
      console.error('Error during auto-logout:', error);
      router.push('/login');
    }
  }, [clearAllTimers, signOut, router]);

  // Start warning countdown
  const startWarningCountdown = useCallback(() => {
    setShowWarning(true);
    setCountdown(warningTime);

    // Countdown interval
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Final logout timer
    warningTimerRef.current = setTimeout(() => {
      handleLogout();
    }, warningTime * 1000);
  }, [handleLogout, warningTime]);

  // Reset inactivity timer
  const resetTimer = useCallback(() => {
    clearAllTimers();
    setShowWarning(false);
    setCountdown(warningTime);

    if (!enabled || !user) return;

    // Set new inactivity timer
    const warningTimeout = (inactivityTimeout - warningTime) * 1000;

    inactivityTimerRef.current = setTimeout(() => {
      startWarningCountdown();
    }, Math.max(warningTimeout, 0));
  }, [clearAllTimers, enabled, inactivityTimeout, startWarningCountdown, user, warningTime]);

  // Continue session (dismiss warning)
  const continueSession = useCallback(() => {
    clearAllTimers();
    setShowWarning(false);
    setCountdown(warningTime);
    resetTimer();
  }, [clearAllTimers, resetTimer, warningTime]);

  // Activity event listener
  useEffect(() => {
    if (!enabled || !user) return;

    const events = ['mousedown', 'keydown', 'mousemove', 'touchstart', 'scroll', 'click'];

    // Throttled event handler
    let lastActivity = Date.now();
    const handleActivity = () => {
      const now = Date.now();
      // Only reset timer if more than 1 second has passed (throttle)
      if (now - lastActivity > 1000) {
        lastActivity = now;
        // Don't reset if warning is showing
        if (!showWarning) {
          resetTimer();
        }
      }
    };

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Start initial timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearAllTimers();
    };
  }, [enabled, user, resetTimer, clearAllTimers, showWarning]);

  // Don't render if not enabled or no user
  if (!enabled || !user) {
    return null;
  }

  const progress = (countdown / warningTime) * 100;

  return (
    <Dialog open={showWarning} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Session Timeout Warning
          </DialogTitle>
          <DialogDescription>
            Your session will expire due to inactivity. Click continue to stay logged in.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="flex items-center justify-center gap-2 text-4xl font-bold">
            <Clock className="w-8 h-8 text-amber-500" />
            <span className={countdown <= 10 ? 'text-red-500' : 'text-amber-600'}>
              {countdown}s
            </span>
          </div>

          <Progress value={progress} className="h-2" />

          <p className="text-center text-sm text-gray-500">
            You will be automatically logged out when the timer reaches 0
          </p>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleLogout}>
            Log Out Now
          </Button>
          <Button onClick={continueSession}>
            Continue Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default InactivityMonitor;
