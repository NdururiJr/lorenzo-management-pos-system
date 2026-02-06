/**
 * GM Urgent Issues Component
 *
 * Issues list with priority indicators and action buttons
 *
 * @module components/dashboard/gm/GMUrgentIssues
 */

'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronRight,
  Clock,
  Package,
  Users,
  Wrench,
  User,
  Boxes,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { UrgentIssue, GMDashboardTheme } from '@/types/gm-dashboard';
import { formatDistanceToNow } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

interface GMUrgentIssuesProps {
  issues: UrgentIssue[];
  themeMode: GMDashboardTheme;
}

const priorityConfig: Record<
  string,
  { icon: React.ElementType; borderColor: string; bgColor: string; textColor: string }
> = {
  high: {
    icon: AlertTriangle,
    borderColor: 'border-l-red-500',
    bgColor: 'bg-red-500/10',
    textColor: 'text-red-500',
  },
  medium: {
    icon: AlertCircle,
    borderColor: 'border-l-amber-500',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-500',
  },
  low: {
    icon: Info,
    borderColor: 'border-l-blue-500',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-500',
  },
};

const typeIcons: Record<string, React.ElementType> = {
  equipment: Wrench,
  order: Package,
  staff: Users,
  customer: User,
  inventory: Boxes,
};

export function GMUrgentIssues({ issues, themeMode }: GMUrgentIssuesProps) {
  const router = useRouter();
  const isDark = themeMode === 'operations';

  const handleTakeAction = (issue: UrgentIssue) => {
    // Navigate to issue detail or relevant page based on issue type
    if (issue.orderId) {
      router.push(`/pipeline?orderId=${issue.orderId}`);
    } else {
      router.push(`/issues/${issue.id}`);
    }
  };

  const handleViewAllIssues = () => {
    router.push('/issues');
  };

  const formatTime = (timestamp: Date | Timestamp | undefined) => {
    if (!timestamp) return 'Unknown';
    const date =
      timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const highPriorityCount = issues.filter((i) => i.priority === 'high').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
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
              highPriorityCount > 0
                ? 'bg-red-500/20'
                : isDark
                ? 'bg-white/10'
                : 'bg-gray-100'
            )}
          >
            <AlertTriangle
              className={cn(
                'w-5 h-5',
                highPriorityCount > 0
                  ? 'text-red-500'
                  : isDark
                  ? 'text-white/60'
                  : 'text-gray-400'
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
              Urgent Issues
            </h3>
            <p
              className={cn(
                'text-sm',
                isDark ? 'text-white/60' : 'text-gray-500'
              )}
            >
              {issues.length} open issue{issues.length !== 1 ? 's' : ''}
              {highPriorityCount > 0 && (
                <span className="text-red-500 ml-1">
                  ({highPriorityCount} high priority)
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        {issues.length === 0 ? (
          <div
            className={cn(
              'text-center py-8',
              isDark ? 'text-white/40' : 'text-gray-400'
            )}
          >
            <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No urgent issues</p>
            <p className="text-xs mt-1">All systems operating normally</p>
          </div>
        ) : (
          issues.slice(0, 5).map((issue, index) => {
            const priority = priorityConfig[issue.priority] || priorityConfig.low;
            const _PriorityIcon = priority.icon;
            const TypeIcon = typeIcons[issue.type] || AlertCircle;

            return (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className={cn(
                  'rounded-xl p-4 border-l-4 transition-all hover:scale-[1.01]',
                  priority.borderColor,
                  isDark
                    ? 'bg-white/5 border border-white/5'
                    : 'bg-gray-50 border border-black/5'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                        priority.bgColor
                      )}
                    >
                      <TypeIcon className={cn('w-4 h-4', priority.textColor)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4
                          className={cn(
                            'font-medium text-sm truncate',
                            isDark ? 'text-white' : 'text-gray-900'
                          )}
                        >
                          {issue.title}
                        </h4>
                        <span
                          className={cn(
                            'text-[10px] uppercase px-1.5 py-0.5 rounded font-medium',
                            priority.bgColor,
                            priority.textColor
                          )}
                        >
                          {issue.priority}
                        </span>
                      </div>
                      <p
                        className={cn(
                          'text-xs line-clamp-2 mb-2',
                          isDark ? 'text-white/60' : 'text-gray-500'
                        )}
                      >
                        {issue.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1">
                          <Clock
                            className={cn(
                              'w-3 h-3',
                              isDark ? 'text-white/40' : 'text-gray-400'
                            )}
                          />
                          <span
                            className={isDark ? 'text-white/40' : 'text-gray-400'}
                          >
                            {formatTime(issue.createdAt)}
                          </span>
                        </div>
                        {issue.branchName && (
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded-full',
                              isDark
                                ? 'bg-white/10 text-white/60'
                                : 'bg-gray-100 text-gray-500'
                            )}
                          >
                            {issue.branchName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleTakeAction(issue)}
                    className={cn(
                      'rounded-lg h-8 px-3 flex-shrink-0',
                      isDark
                        ? 'text-[#2DD4BF] hover:bg-white/10 hover:text-[#2DD4BF]'
                        : 'text-lorenzo-accent-teal hover:bg-gray-100'
                    )}
                  >
                    Take Action
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* View All Link */}
      {issues.length > 5 && (
        <Button
          variant="ghost"
          onClick={handleViewAllIssues}
          className={cn(
            'w-full mt-4 rounded-xl',
            isDark
              ? 'text-white/60 hover:text-white hover:bg-white/10'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          )}
        >
          View All Issues ({issues.length})
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      )}
    </motion.div>
  );
}
