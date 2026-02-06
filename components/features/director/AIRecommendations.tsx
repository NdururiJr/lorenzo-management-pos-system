'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Lightbulb,
  TrendingUp,
  Sparkles,
  Clock,
  AlertTriangle,
  Loader2,
  RefreshCw,
  WifiOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface AIRecommendationsProps {
  branchId: string;
  timeframe: string;
}

type RecommendationType = 'opportunity' | 'optimization' | 'risk';

interface RecommendationAction {
  label?: string;
  type?: 'primary' | 'secondary';
}

interface APIRecommendation {
  type: RecommendationType;
  title: string;
  description: string;
  impact: string;
  priority: 'high' | 'medium' | 'low';
  actions: (string | RecommendationAction)[];
}

interface APIResponse {
  recommendations: APIRecommendation[];
  generatedAt: string;
  dataSource: 'ai' | 'rule-based';
  metrics?: {
    ordersToday: number;
    pipelineTotal: number;
    topCustomersCount: number;
    pendingPickups: number;
    revenue: number;
  };
}

// Icon mapping for recommendation types
const typeIcons: Record<RecommendationType, typeof TrendingUp> = {
  opportunity: TrendingUp,
  optimization: Clock,
  risk: AlertTriangle,
};

// Fallback recommendations when API is unavailable
const fallbackRecommendations: APIRecommendation[] = [
  {
    type: 'opportunity',
    title: 'Corporate Account Expansion',
    description:
      'Corporate account conversion rate is high. Consider allocating additional sales resources to prospect list.',
    impact: 'KES 450K/quarter estimated increase',
    priority: 'high',
    actions: ['Model Scenarios', 'Approve Shift'],
  },
  {
    type: 'optimization',
    title: 'Peak Hour Staffing',
    description:
      'Peak hour staffing model suggests adding 1 staff member during 8-10am rush. Reduces average wait time.',
    impact: '40% wait time reduction',
    priority: 'medium',
    actions: ['Model Scenarios'],
  },
];

// Format recommendation description with highlighted impact
function formatDescription(
  description: string,
  impact: string
): React.ReactElement {
  return (
    <span className="text-[13px] text-[rgba(232,240,242,0.9)] leading-relaxed">
      {description}{' '}
      <strong className="text-[#818CF8]">{impact}</strong>
    </span>
  );
}

// Get action label from action object or string
function getActionLabel(action: string | RecommendationAction): string {
  if (typeof action === 'string') {
    return action;
  }
  return action.label || 'View Details';
}

// Skeleton loader for recommendations
function _RecommendationSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-lg p-4 border animate-pulse"
          style={{
            background: 'rgba(99, 102, 241, 0.05)',
            borderColor: 'rgba(99, 102, 241, 0.15)',
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div
                className="h-3 w-20 rounded mb-2"
                style={{ background: 'rgba(99, 102, 241, 0.2)' }}
              />
              <div
                className="h-4 w-full rounded mb-1"
                style={{ background: 'rgba(232, 240, 242, 0.1)' }}
              />
              <div
                className="h-4 w-3/4 rounded"
                style={{ background: 'rgba(232, 240, 242, 0.1)' }}
              />
            </div>
            <div
              className="h-8 w-24 rounded-lg"
              style={{ background: 'rgba(99, 102, 241, 0.2)' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AIRecommendations({
  branchId,
  timeframe,
}: AIRecommendationsProps) {
  const { user } = useAuth();

  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery<APIResponse>({
    queryKey: ['director-recommendations', branchId, timeframe],
    queryFn: async () => {
      const token = await user?.getIdToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `/api/analytics/director/recommendations?branchId=${branchId}&timeframe=${timeframe}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      return response.json();
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
    retry: 2,
  });

  // Use API recommendations or fallback
  const recommendations = React.useMemo(() =>
    data?.recommendations || (error ? fallbackRecommendations : []),
    [data?.recommendations, error]
  );
  const isAIPowered = data?.dataSource === 'ai';
  const hasError = !!error;

  // Filter recommendations based on timeframe
  const filteredRecommendations = React.useMemo(() => {
    if (timeframe === 'today' || timeframe === 'yesterday') {
      return recommendations.slice(0, 2);
    }
    if (timeframe === 'week') {
      return recommendations.slice(0, 3);
    }
    return recommendations.slice(0, 4);
  }, [recommendations, timeframe]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card-dark p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        {/* Purple gradient icon box */}
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
          }}
        >
          <Lightbulb size={14} className="text-white" />
        </div>

        {/* Title */}
        <span className="text-[15px] font-semibold text-white">
          AI Recommended Actions
        </span>

        {/* Status badge */}
        <div
          className={cn(
            'ml-auto px-2.5 py-1 rounded-xl text-[10px] font-medium tracking-wide flex items-center gap-1.5',
            hasError
              ? 'bg-amber-500/15 text-amber-400'
              : 'bg-[rgba(99,102,241,0.15)] text-[#818CF8]'
          )}
          style={{ letterSpacing: '0.5px' }}
        >
          {hasError ? (
            <>
              <WifiOff size={10} />
              RULE-BASED
            </>
          ) : isAIPowered ? (
            'POWERED BY AI'
          ) : (
            'RULE-BASED'
          )}
        </div>

        {/* Refresh button */}
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className={cn(
            'p-1.5 rounded-lg transition-all duration-200',
            'hover:bg-[rgba(99,102,241,0.1)]',
            isFetching && 'opacity-50 cursor-not-allowed'
          )}
          title="Refresh recommendations"
        >
          <RefreshCw
            size={14}
            className={cn('text-[#818CF8]', isFetching && 'animate-spin')}
          />
        </button>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-[#818CF8] mb-3" />
          <p className="text-[13px] text-[rgba(232,240,242,0.7)]">
            Generating AI recommendations...
          </p>
        </div>
      ) : filteredRecommendations.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
            style={{ background: 'rgba(99, 102, 241, 0.1)' }}
          >
            <Sparkles size={24} className="text-[#818CF8]" />
          </div>
          <p className="text-[14px] text-[rgba(232,240,242,0.7)]">
            No AI recommendations available for this timeframe.
          </p>
          <p className="text-[12px] text-[rgba(232,240,242,0.5)] mt-1">
            Check back later for personalized insights.
          </p>
        </div>
      ) : (
        /* Recommendation Cards */
        <div className="space-y-3">
          {filteredRecommendations.map((recommendation, index) => {
            const IconComponent = typeIcons[recommendation.type] || TrendingUp;

            return (
              <motion.div
                key={`${recommendation.type}-${index}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                className={cn(
                  'rounded-lg p-4',
                  'border',
                  'transition-all duration-200',
                  'hover:border-[rgba(99,102,241,0.4)]'
                )}
                style={{
                  background:
                    recommendation.priority === 'high'
                      ? 'rgba(99, 102, 241, 0.08)'
                      : 'rgba(99, 102, 241, 0.05)',
                  borderColor:
                    recommendation.priority === 'high'
                      ? 'rgba(99, 102, 241, 0.25)'
                      : 'rgba(99, 102, 241, 0.15)',
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Category label */}
                    <div
                      className="text-[10px] font-medium mb-1.5 flex items-center gap-1"
                      style={{
                        color:
                          recommendation.type === 'risk'
                            ? '#F59E0B'
                            : '#818CF8',
                        letterSpacing: '1px',
                      }}
                    >
                      <IconComponent size={10} />
                      {recommendation.type.toUpperCase()}
                    </div>

                    {/* Title */}
                    <div className="text-[13px] font-medium text-white mb-1">
                      {recommendation.title}
                    </div>

                    {/* Description with highlighted impact */}
                    {formatDescription(
                      recommendation.description,
                      recommendation.impact
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-1.5 shrink-0">
                    {recommendation.actions.slice(0, 2).map((action, actionIndex) => {
                      const label = getActionLabel(action);
                      const isPrimary = actionIndex === 0;

                      return isPrimary ? (
                        <button
                          key={actionIndex}
                          className="director-action-btn-ai text-[11px] px-3 py-1.5 whitespace-nowrap"
                          onClick={() => {
                            console.log(
                              `Action: ${label} for recommendation ${index}`
                            );
                          }}
                        >
                          {label}
                        </button>
                      ) : (
                        <button
                          key={actionIndex}
                          className={cn(
                            'text-[11px] px-3 py-1.5 whitespace-nowrap',
                            'bg-transparent',
                            'border border-[rgba(99,102,241,0.3)]',
                            'rounded-lg',
                            'text-[#818CF8]',
                            'hover:bg-[rgba(99,102,241,0.1)]',
                            'hover:border-[rgba(99,102,241,0.5)]',
                            'transition-all duration-200'
                          )}
                          onClick={() => {
                            console.log(
                              `Action: ${label} for recommendation ${index}`
                            );
                          }}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Error indicator */}
      {hasError && filteredRecommendations.length > 0 && (
        <div className="mt-3 flex items-center gap-2 text-[11px] text-amber-400/80">
          <WifiOff size={12} />
          <span>
            AI service unavailable. Showing rule-based recommendations.
          </span>
        </div>
      )}

      {/* View all link */}
      {filteredRecommendations.length > 0 && (
        <motion.button
          whileHover={{ x: 4 }}
          className="mt-4 flex items-center gap-1 text-[12px] text-[#818CF8] hover:text-[#A5B4FC] transition-colors"
        >
          View all recommendations
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </motion.button>
      )}
    </motion.div>
  );
}

export default AIRecommendations;
