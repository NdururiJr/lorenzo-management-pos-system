/**
 * ModernPipelineStatus Component
 *
 * Displays pipeline stage progress bars with counts.
 * Matches the lorenzo-staff-dashboard.jsx reference design.
 *
 * @module components/modern/ModernPipelineStatus
 */

'use client';

import { motion } from 'framer-motion';

interface PipelineStage {
  stage: string;
  count: number;
  percent: number;
}

interface ModernPipelineStatusProps {
  stages?: PipelineStage[];
  totalOrders?: number;
  className?: string;
}

// Demo data matching reference
const demoStages: PipelineStage[] = [
  { stage: 'Received', count: 3, percent: 15 },
  { stage: 'Washing', count: 5, percent: 25 },
  { stage: 'Drying', count: 2, percent: 10 },
  { stage: 'Ironing', count: 4, percent: 20 },
  { stage: 'Ready', count: 6, percent: 30 },
];

// Get color for each stage
const getStageColor = (stage: string, _index: number): string => {
  // Ready is green, Ironing is gold, others are accent teal
  if (stage.toLowerCase() === 'ready') return '#10B981';
  if (stage.toLowerCase() === 'ironing') return '#C9A962';
  return '#2DD4BF';
};

export function ModernPipelineStatus({
  stages = demoStages,
  totalOrders,
  className = ''
}: ModernPipelineStatusProps) {
  const total = totalOrders ?? stages.reduce((sum, s) => sum + s.count, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className={`bg-white rounded-3xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] h-full ${className}`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-base font-medium text-lorenzo-dark-teal">Pipeline Status</h3>
        <span className="text-2xl font-light text-lorenzo-dark-teal">{total}</span>
      </div>

      {/* Progress Bars */}
      <div className="flex flex-col gap-3.5">
        {stages.map((stat, index) => {
          const color = getStageColor(stat.stage, index);
          // Calculate width based on percentage (multiply by 3 like reference for visual effect)
          const barWidth = Math.min(stat.percent * 3, 100);

          return (
            <motion.div
              key={stat.stage}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              {/* Label Row */}
              <div className="flex justify-between mb-1.5">
                <span className="text-sm text-lorenzo-teal/70">{stat.stage}</span>
                <span className="text-sm font-semibold text-lorenzo-dark-teal">{stat.count}</span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-lorenzo-deep-teal/15 rounded overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ duration: 0.5, delay: 0.2 + (0.1 * index) }}
                  className="h-full rounded"
                  style={{ backgroundColor: color }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default ModernPipelineStatus;
