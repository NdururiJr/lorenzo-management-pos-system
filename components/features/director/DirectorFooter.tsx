/**
 * Director Footer Component
 *
 * Footer bar for the director dashboard displaying:
 * - Last updated timestamp
 * - Auto-refresh countdown
 * - System status indicator with pulsing dot
 *
 * @module components/features/director/DirectorFooter
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DirectorFooterProps {
  lastUpdated: Date;
  refreshInterval: number; // minutes
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDate(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function DirectorFooter({ lastUpdated, refreshInterval }: DirectorFooterProps) {
  const [minutesUntilRefresh, setMinutesUntilRefresh] = useState(refreshInterval);
  const [_currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Calculate time remaining until next refresh
    const updateCountdown = () => {
      const now = new Date();
      setCurrentTime(now);

      const elapsedMinutes = Math.floor(
        (now.getTime() - lastUpdated.getTime()) / (1000 * 60)
      );
      const remaining = Math.max(0, refreshInterval - (elapsedMinutes % refreshInterval));
      setMinutesUntilRefresh(remaining);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [lastUpdated, refreshInterval]);

  return (
    <motion.footer
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.3 }}
      className={cn(
        'fixed bottom-0 left-0 right-0',
        'bg-white/80 backdrop-blur-xl',
        'border-t border-lorenzo-teal/10',
        'px-4 lg:px-8 py-3',
        'z-40'
      )}
    >
      {/* Top border accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-lorenzo-accent-teal/30 to-transparent" />

      <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
        {/* Last updated info */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>
            Last updated: {formatDate(lastUpdated)} at {formatTime(lastUpdated)}
          </span>
          <span className="text-gray-300">|</span>
          <span>
            Auto-refresh in{' '}
            <span className="font-medium text-gray-600">
              {minutesUntilRefresh} {minutesUntilRefresh === 1 ? 'minute' : 'minutes'}
            </span>
          </span>
        </div>

        {/* System status */}
        <div className="flex items-center gap-2">
          {/* Pulsing green dot */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs text-gray-500">All systems operational</span>
        </div>
      </div>
    </motion.footer>
  );
}

/**
 * Sticky variant that appears at the bottom of content rather than fixed
 */
export function DirectorFooterInline({ lastUpdated, refreshInterval }: DirectorFooterProps) {
  const [minutesUntilRefresh, setMinutesUntilRefresh] = useState(refreshInterval);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const elapsedMinutes = Math.floor(
        (now.getTime() - lastUpdated.getTime()) / (1000 * 60)
      );
      const remaining = Math.max(0, refreshInterval - (elapsedMinutes % refreshInterval));
      setMinutesUntilRefresh(remaining);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 30000);

    return () => clearInterval(interval);
  }, [lastUpdated, refreshInterval]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className={cn(
        'mt-8 pt-4',
        'border-t border-lorenzo-teal/10',
        'flex items-center justify-between',
        'text-xs text-gray-400'
      )}
    >
      {/* Last updated info */}
      <div className="flex items-center gap-2">
        <span>
          Last updated: {formatDate(lastUpdated)} at {formatTime(lastUpdated)}
        </span>
        <span className="text-gray-200">|</span>
        <span>
          Auto-refresh in {minutesUntilRefresh} {minutesUntilRefresh === 1 ? 'min' : 'mins'}
        </span>
      </div>

      {/* System status */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
        </span>
        <span>All systems operational</span>
      </div>
    </motion.div>
  );
}
