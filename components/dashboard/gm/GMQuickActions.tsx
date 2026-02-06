/**
 * GM Quick Actions Component
 *
 * 2x2 grid of action buttons: New Order, Add Staff, Log Issue, Send Alert
 *
 * @module components/dashboard/gm/GMQuickActions
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Plus,
  UserPlus,
  AlertTriangle,
  Bell,
  BarChart3,
  Wrench,
  ChevronRight,
  X,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GMDashboardTheme } from '@/types/gm-dashboard';

interface GMQuickActionsProps {
  themeMode: GMDashboardTheme;
}

interface QuickActionButton {
  icon: React.ElementType;
  label: string;
  description: string;
  href?: string;
  onClick?: () => void;
  variant: 'primary' | 'secondary' | 'warning' | 'danger';
}

const getActions = (onSendAlert: () => void): QuickActionButton[] => [
  {
    icon: Plus,
    label: 'New Order',
    description: 'Create a new customer order',
    href: '/pos',
    variant: 'primary',
  },
  {
    icon: UserPlus,
    label: 'Add Staff',
    description: 'Register new employee',
    href: '/employees/new',
    variant: 'secondary',
  },
  {
    icon: AlertTriangle,
    label: 'Log Issue',
    description: 'Report a problem',
    href: '/issues/new',
    variant: 'warning',
  },
  {
    icon: Bell,
    label: 'Send Alert',
    description: 'Broadcast to team',
    onClick: onSendAlert,
    variant: 'danger',
  },
];

const variantStyles = {
  primary: {
    dark: 'bg-gradient-to-br from-[#2DD4BF] to-[#14b8a6] text-[#0A1A1F] hover:from-[#5eead4] hover:to-[#2DD4BF]',
    light: 'bg-gradient-to-br from-lorenzo-accent-teal to-lorenzo-teal text-white hover:from-lorenzo-accent-teal/90 hover:to-lorenzo-teal/90',
  },
  secondary: {
    dark: 'bg-white/10 text-white border border-white/20 hover:bg-white/20',
    light: 'bg-gray-100 text-gray-900 border border-gray-200 hover:bg-gray-200',
  },
  warning: {
    dark: 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30',
    light: 'bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100',
  },
  danger: {
    dark: 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30',
    light: 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100',
  },
};

export function GMQuickActions({ themeMode }: GMQuickActionsProps) {
  const router = useRouter();
  const isDark = themeMode === 'operations';
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertPriority, setAlertPriority] = useState<'info' | 'warning' | 'urgent'>('info');
  const [isSending, setIsSending] = useState(false);

  const actions = getActions(() => setShowAlertModal(true));

  const handleAction = (action: QuickActionButton) => {
    if (action.href) {
      router.push(action.href);
    } else if (action.onClick) {
      action.onClick();
    }
  };

  const handleSendAlert = async () => {
    if (!alertMessage.trim()) return;

    setIsSending(true);
    try {
      // TODO: Implement actual alert sending via API
      // For now, simulate sending
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Reset form and close modal
      setAlertMessage('');
      setAlertPriority('info');
      setShowAlertModal(false);
    } catch {
      // Error handling would go here
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={cn(
          'rounded-2xl p-5',
          isDark
            ? 'bg-gradient-to-br from-[#0D2329] to-[#0A1A1F] border border-white/10'
            : 'bg-gradient-to-br from-lorenzo-deep-teal to-lorenzo-dark-teal'
        )}
      >
        {/* Header */}
        <h3 className="text-white font-semibold mb-4">Quick Actions</h3>

        {/* Actions Grid */}
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            const style = variantStyles[action.variant];

            return (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAction(action)}
                className={cn(
                  'flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200',
                  isDark ? style.dark : style.light
                )}
              >
                <Icon className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">{action.label}</span>
                <span
                  className={cn(
                    'text-[10px] mt-0.5',
                    action.variant === 'primary'
                      ? 'opacity-70'
                      : isDark
                      ? 'opacity-60'
                      : 'opacity-70'
                  )}
                >
                  {action.description}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Additional Links */}
        <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
          <button
            onClick={() => router.push('/reports')}
            className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors text-sm"
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span>View Reports</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => router.push('/settings')}
            className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors text-sm"
          >
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              <span>System Settings</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Send Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAlertModal(false)}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              'relative w-full max-w-md mx-4 rounded-2xl p-6',
              isDark
                ? 'bg-[#0D2329] border border-white/20'
                : 'bg-white'
            )}
          >
            {/* Close button */}
            <button
              onClick={() => setShowAlertModal(false)}
              className={cn(
                'absolute top-4 right-4 p-1 rounded-lg transition-colors',
                isDark
                  ? 'text-white/60 hover:text-white hover:bg-white/10'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              )}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className={cn(
                'p-2 rounded-lg',
                isDark ? 'bg-red-500/20' : 'bg-red-50'
              )}>
                <Bell className={cn('w-5 h-5', isDark ? 'text-red-400' : 'text-red-500')} />
              </div>
              <div>
                <h3 className={cn('font-semibold', isDark ? 'text-white' : 'text-gray-900')}>
                  Send Team Alert
                </h3>
                <p className={cn('text-sm', isDark ? 'text-white/60' : 'text-gray-500')}>
                  Broadcast a message to all staff
                </p>
              </div>
            </div>

            {/* Priority Selection */}
            <div className="mb-4">
              <label className={cn('block text-sm font-medium mb-2', isDark ? 'text-white/80' : 'text-gray-700')}>
                Priority
              </label>
              <div className="flex gap-2">
                {(['info', 'warning', 'urgent'] as const).map((priority) => (
                  <button
                    key={priority}
                    onClick={() => setAlertPriority(priority)}
                    className={cn(
                      'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors capitalize',
                      alertPriority === priority
                        ? priority === 'info'
                          ? 'bg-blue-500 text-white'
                          : priority === 'warning'
                          ? 'bg-amber-500 text-white'
                          : 'bg-red-500 text-white'
                        : isDark
                        ? 'bg-white/10 text-white/70 hover:bg-white/20'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div className="mb-6">
              <label className={cn('block text-sm font-medium mb-2', isDark ? 'text-white/80' : 'text-gray-700')}>
                Message
              </label>
              <textarea
                value={alertMessage}
                onChange={(e) => setAlertMessage(e.target.value)}
                placeholder="Enter your alert message..."
                rows={4}
                className={cn(
                  'w-full rounded-lg p-3 resize-none transition-colors',
                  isDark
                    ? 'bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-[#2DD4BF] focus:ring-1 focus:ring-[#2DD4BF]'
                    : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-lorenzo-accent-teal focus:ring-1 focus:ring-lorenzo-accent-teal'
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowAlertModal(false)}
                className={cn(
                  'flex-1 py-2.5 px-4 rounded-lg font-medium transition-colors',
                  isDark
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                Cancel
              </button>
              <button
                onClick={handleSendAlert}
                disabled={!alertMessage.trim() || isSending}
                className={cn(
                  'flex-1 py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2',
                  'bg-red-500 text-white hover:bg-red-600',
                  (!alertMessage.trim() || isSending) && 'opacity-50 cursor-not-allowed'
                )}
              >
                {isSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Alert
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
