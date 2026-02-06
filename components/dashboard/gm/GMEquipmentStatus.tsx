/**
 * GM Equipment Status Component
 *
 * Equipment grid showing washer, dryer, press, steamer status
 *
 * @module components/dashboard/gm/GMEquipmentStatus
 */

'use client';

import { motion } from 'framer-motion';
import {
  Droplets,
  Wind,
  Shirt,
  Sparkles,
  FolderOpen,
  AlertTriangle,
  CheckCircle,
  Pause,
  Wrench,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  Equipment,
  EquipmentSummary,
  GMDashboardTheme,
} from '@/types/gm-dashboard';

interface GMEquipmentStatusProps {
  equipment: Equipment[];
  summary?: EquipmentSummary;
  themeMode: GMDashboardTheme;
}

const equipmentIcons: Record<string, React.ElementType> = {
  washer: Droplets,
  dryer: Wind,
  press: Shirt,
  steamer: Sparkles,
  folder: FolderOpen,
};

const statusConfig: Record<
  string,
  { icon: React.ElementType; darkClass: string; lightClass: string; label: string }
> = {
  running: {
    icon: CheckCircle,
    darkClass: 'bg-green-500/20 text-green-400 border-green-500/30',
    lightClass: 'bg-green-50 text-green-600 border-green-200',
    label: 'Running',
  },
  idle: {
    icon: Pause,
    darkClass: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    lightClass: 'bg-gray-50 text-gray-600 border-gray-200',
    label: 'Idle',
  },
  maintenance: {
    icon: Wrench,
    darkClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    lightClass: 'bg-amber-50 text-amber-600 border-amber-200',
    label: 'Maintenance',
  },
  offline: {
    icon: AlertTriangle,
    darkClass: 'bg-red-500/20 text-red-400 border-red-500/30',
    lightClass: 'bg-red-50 text-red-600 border-red-200',
    label: 'Offline',
  },
};

export function GMEquipmentStatus({
  equipment,
  summary,
  themeMode,
}: GMEquipmentStatusProps) {
  const isDark = themeMode === 'operations';

  // Build summary from equipment if not provided
  const equipmentSummary: EquipmentSummary = summary || {
    washers: { running: 0, total: 0 },
    dryers: { running: 0, total: 0 },
    presses: { running: 0, total: 0 },
    steamers: { running: 0, total: 0 },
    folders: { running: 0, total: 0 },
  };

  // Summary cards for each equipment type
  const summaryCards = [
    {
      type: 'washer',
      label: 'Washers',
      icon: Droplets,
      ...equipmentSummary.washers,
    },
    {
      type: 'dryer',
      label: 'Dryers',
      icon: Wind,
      ...equipmentSummary.dryers,
    },
    {
      type: 'press',
      label: 'Presses',
      icon: Shirt,
      ...equipmentSummary.presses,
    },
    {
      type: 'steamer',
      label: 'Steamers',
      icon: Sparkles,
      ...equipmentSummary.steamers,
    },
    {
      type: 'folder',
      label: 'Folders',
      icon: FolderOpen,
      ...equipmentSummary.folders,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
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
            <Wrench
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
              Equipment Status
            </h3>
            <p
              className={cn(
                'text-sm',
                isDark ? 'text-white/60' : 'text-gray-500'
              )}
            >
              {equipment.filter((e) => e.status === 'running').length} of{' '}
              {equipment.length} running
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-5 gap-3 mb-4">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          const utilizationPercent =
            card.total > 0
              ? Math.round((card.running / card.total) * 100)
              : 0;

          return (
            <motion.div
              key={card.type}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + index * 0.05 }}
              className={cn(
                'rounded-xl p-3 text-center transition-all hover:scale-105',
                isDark
                  ? 'bg-white/5 border border-white/10'
                  : 'bg-gray-50 border border-black/5'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center',
                  utilizationPercent > 70
                    ? isDark
                      ? 'bg-green-500/20'
                      : 'bg-green-50'
                    : utilizationPercent > 30
                    ? isDark
                      ? 'bg-[#2DD4BF]/20'
                      : 'bg-lorenzo-accent-teal/10'
                    : isDark
                    ? 'bg-white/10'
                    : 'bg-gray-100'
                )}
              >
                <Icon
                  className={cn(
                    'w-4 h-4',
                    utilizationPercent > 70
                      ? isDark
                        ? 'text-green-400'
                        : 'text-green-600'
                      : utilizationPercent > 30
                      ? isDark
                        ? 'text-[#2DD4BF]'
                        : 'text-lorenzo-accent-teal'
                      : isDark
                      ? 'text-white/60'
                      : 'text-gray-400'
                  )}
                />
              </div>
              <p
                className={cn(
                  'text-lg font-semibold gm-number',
                  isDark ? 'text-white' : 'text-gray-900'
                )}
              >
                {card.running}/{card.total}
              </p>
              <p
                className={cn(
                  'text-[10px] uppercase tracking-wider',
                  isDark ? 'text-white/40' : 'text-gray-400'
                )}
              >
                {card.label}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Equipment Detail List */}
      {equipment.length > 0 && (
        <div className="space-y-2">
          <p
            className={cn(
              'text-xs uppercase tracking-wider mb-2',
              isDark ? 'text-white/40' : 'text-gray-400'
            )}
          >
            Equipment Details
          </p>
          <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
            {equipment.slice(0, 8).map((eq, index) => {
              const Icon = equipmentIcons[eq.type] || Wrench;
              const status = statusConfig[eq.status] || statusConfig.idle;
              const StatusIcon = status.icon;

              return (
                <motion.div
                  key={eq.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.03 }}
                  className={cn(
                    'flex items-center justify-between p-2 rounded-lg',
                    isDark ? 'bg-white/5' : 'bg-gray-50'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      className={cn(
                        'w-4 h-4',
                        isDark ? 'text-white/40' : 'text-gray-400'
                      )}
                    />
                    <span
                      className={cn(
                        'text-sm',
                        isDark ? 'text-white' : 'text-gray-900'
                      )}
                    >
                      {eq.name}
                    </span>
                  </div>
                  <div
                    className={cn(
                      'flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border',
                      isDark ? status.darkClass : status.lightClass
                    )}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {equipment.length === 0 && (
        <div
          className={cn(
            'text-center py-6',
            isDark ? 'text-white/40' : 'text-gray-400'
          )}
        >
          <Wrench className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No equipment data available</p>
        </div>
      )}
    </motion.div>
  );
}
