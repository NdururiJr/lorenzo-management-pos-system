/**
 * GM Staff on Duty Component
 *
 * Staff list with avatar, role, status, and performance metrics
 *
 * @module components/dashboard/gm/GMStaffOnDuty
 */

'use client';

import { motion } from 'framer-motion';
import {
  Users,
  Star,
  Package,
  Coffee,
  CheckCircle,
  Pause,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  StaffOnDuty,
  StaffMetrics,
  GMDashboardTheme,
} from '@/types/gm-dashboard';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

interface GMStaffOnDutyProps {
  staff: StaffOnDuty[];
  metrics?: StaffMetrics;
  themeMode: GMDashboardTheme;
}

const statusConfig: Record<
  string,
  { icon: React.ElementType; label: string; darkClass: string; lightClass: string }
> = {
  active: {
    icon: CheckCircle,
    label: 'Active',
    darkClass: 'bg-green-500/20 text-green-400',
    lightClass: 'bg-green-50 text-green-600',
  },
  on_break: {
    icon: Coffee,
    label: 'On Break',
    darkClass: 'bg-amber-500/20 text-amber-400',
    lightClass: 'bg-amber-50 text-amber-600',
  },
  idle: {
    icon: Pause,
    label: 'Idle',
    darkClass: 'bg-gray-500/20 text-gray-400',
    lightClass: 'bg-gray-50 text-gray-600',
  },
};

const roleColors: Record<string, { dark: string; light: string }> = {
  admin: { dark: 'from-purple-500 to-purple-600', light: 'from-purple-400 to-purple-500' },
  director: { dark: 'from-blue-500 to-blue-600', light: 'from-blue-400 to-blue-500' },
  general_manager: { dark: 'from-[#C9A962] to-[#A88B4A]', light: 'from-lorenzo-gold to-lorenzo-gold-dark' },
  store_manager: { dark: 'from-teal-500 to-teal-600', light: 'from-teal-400 to-teal-500' },
  workstation_manager: { dark: 'from-cyan-500 to-cyan-600', light: 'from-cyan-400 to-cyan-500' },
  workstation_staff: { dark: 'from-emerald-500 to-emerald-600', light: 'from-emerald-400 to-emerald-500' },
  front_desk: { dark: 'from-pink-500 to-pink-600', light: 'from-pink-400 to-pink-500' },
  driver: { dark: 'from-orange-500 to-orange-600', light: 'from-orange-400 to-orange-500' },
};

export function GMStaffOnDuty({
  staff,
  metrics,
  themeMode,
}: GMStaffOnDutyProps) {
  const isDark = themeMode === 'operations';

  const formatClockInTime = (timestamp: Date | Timestamp | undefined) => {
    if (!timestamp) return '-';
    const date =
      timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'h:mm a');
  };

  const getRoleDisplay = (role: string) => {
    return role
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getAvatarGradient = (role: string) => {
    const colors = roleColors[role] || roleColors.workstation_staff;
    return isDark ? colors.dark : colors.light;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      className={cn(
        'rounded-2xl p-5',
        isDark
          ? 'bg-white/5 backdrop-blur-xl border border-white/10'
          : 'bg-white border border-black/5 shadow-sm'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              isDark ? 'bg-[#2DD4BF]/20' : 'bg-lorenzo-accent-teal/10'
            )}
          >
            <Users
              className={cn(
                'w-5 h-5',
                isDark ? 'text-[#2DD4BF]' : 'text-lorenzo-accent-teal'
              )}
            />
          </div>
          <div>
            <h3
              className={cn(
                'font-semibold',
                isDark ? 'text-white' : 'text-gray-900'
              )}
            >
              Staff on Duty
            </h3>
            <p
              className={cn(
                'text-sm',
                isDark ? 'text-white/60' : 'text-gray-500'
              )}
            >
              {metrics?.onDuty || staff.length} of {metrics?.total || staff.length} on shift
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        {metrics && (
          <div className="flex items-center gap-3">
            {metrics.onBreak > 0 && (
              <div
                className={cn(
                  'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs',
                  isDark
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-amber-50 text-amber-600'
                )}
              >
                <Coffee className="w-3 h-3" />
                {metrics.onBreak} on break
              </div>
            )}
          </div>
        )}
      </div>

      {/* Staff List */}
      <div className="space-y-3">
        {staff.length === 0 ? (
          <div
            className={cn(
              'text-center py-8',
              isDark ? 'text-white/40' : 'text-gray-400'
            )}
          >
            <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No staff on duty</p>
          </div>
        ) : (
          staff.slice(0, 6).map((member, index) => {
            const status = statusConfig[member.status] || statusConfig.active;
            const StatusIcon = status.icon;

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + index * 0.05 }}
                className={cn(
                  'flex items-center justify-between p-3 rounded-xl transition-all hover:scale-[1.01]',
                  isDark ? 'bg-white/5' : 'bg-gray-50'
                )}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center text-white font-medium text-sm bg-gradient-to-br',
                      getAvatarGradient(member.role)
                    )}
                  >
                    {member.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="w-full h-full rounded-xl object-cover"
                      />
                    ) : (
                      member.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                    )}
                  </div>

                  {/* Info */}
                  <div>
                    <p
                      className={cn(
                        'font-medium text-sm',
                        isDark ? 'text-white' : 'text-gray-900'
                      )}
                    >
                      {member.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={isDark ? 'text-white/60' : 'text-gray-500'}
                      >
                        {getRoleDisplay(member.role)}
                      </span>
                      <span
                        className={cn(
                          'w-1 h-1 rounded-full',
                          isDark ? 'bg-white/30' : 'bg-gray-300'
                        )}
                      />
                      <span
                        className={isDark ? 'text-white/40' : 'text-gray-400'}
                      >
                        In since {formatClockInTime(member.clockInTime)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Stats + Status */}
                <div className="flex items-center gap-4">
                  {/* Orders Handled */}
                  <div className="text-right hidden sm:block">
                    <div className="flex items-center gap-1">
                      <Package
                        className={cn(
                          'w-3 h-3',
                          isDark ? 'text-white/40' : 'text-gray-400'
                        )}
                      />
                      <span
                        className={cn(
                          'text-sm font-medium gm-number',
                          isDark ? 'text-white' : 'text-gray-900'
                        )}
                      >
                        {member.ordersHandled}
                      </span>
                    </div>
                    <p
                      className={cn(
                        'text-[10px]',
                        isDark ? 'text-white/40' : 'text-gray-400'
                      )}
                    >
                      orders
                    </p>
                  </div>

                  {/* Rating */}
                  <div className="text-right hidden sm:block">
                    <div className="flex items-center gap-1">
                      <Star
                        className={cn(
                          'w-3 h-3',
                          isDark ? 'text-[#C9A962]' : 'text-lorenzo-gold'
                        )}
                      />
                      <span
                        className={cn(
                          'text-sm font-medium gm-number',
                          isDark ? 'text-white' : 'text-gray-900'
                        )}
                      >
                        {member.rating.toFixed(1)}
                      </span>
                    </div>
                    <p
                      className={cn(
                        'text-[10px]',
                        isDark ? 'text-white/40' : 'text-gray-400'
                      )}
                    >
                      rating
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div
                    className={cn(
                      'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
                      isDark ? status.darkClass : status.lightClass
                    )}
                  >
                    <StatusIcon className="w-3 h-3" />
                    <span className="hidden sm:inline">{status.label}</span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* View All Link */}
      {staff.length > 6 && (
        <button
          onClick={() => (window.location.href = '/employees')}
          className={cn(
            'w-full mt-4 py-2 text-sm rounded-xl transition-colors',
            isDark
              ? 'text-white/60 hover:text-white hover:bg-white/10'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          )}
        >
          View All Staff ({staff.length})
        </button>
      )}
    </motion.div>
  );
}
