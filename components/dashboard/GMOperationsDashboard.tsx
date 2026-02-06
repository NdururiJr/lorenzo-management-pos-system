/**
 * GM Operations Dashboard
 *
 * Main container for the General Manager Operations Dashboard.
 * Features dark glassmorphism theme with toggle to light theme.
 *
 * @module components/dashboard/GMOperationsDashboard
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGMDashboard } from '@/hooks/useGMDashboard';
import { GMDashboardHeader } from './gm/GMDashboardHeader';
import { GMMetricsRow } from './gm/GMMetricsRow';
import { GMLiveOrderQueue } from './gm/GMLiveOrderQueue';
import { GMBranchPerformance } from './gm/GMBranchPerformance';
import { GMEquipmentStatus } from './gm/GMEquipmentStatus';
import { GMWeatherWidget } from './gm/GMWeatherWidget';
import { GMUrgentIssues } from './gm/GMUrgentIssues';
import { GMStaffOnDuty } from './gm/GMStaffOnDuty';
import { GMQuickActions } from './gm/GMQuickActions';
import type { GMDashboardTheme } from '@/types/gm-dashboard';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface GMOperationsDashboardProps {
  initialTheme?: GMDashboardTheme;
}

/**
 * Operations theme styles
 */
const operationsTheme = {
  background: 'bg-gradient-to-br from-[#0A1A1F] via-[#0D2329] to-[#0A1A1F]',
  text: 'text-[#E8F0F2]',
  card: 'bg-white/5 backdrop-blur-xl border border-white/10',
  cardHover: 'hover:bg-white/10 hover:border-white/20',
  accent: 'text-[#2DD4BF]',
  gold: 'text-[#C9A962]',
};

/**
 * Light theme styles
 */
const lightTheme = {
  background: 'bg-lorenzo-cream',
  text: 'text-lorenzo-dark-teal',
  card: 'bg-white border border-black/5 shadow-sm',
  cardHover: 'hover:shadow-md',
  accent: 'text-lorenzo-accent-teal',
  gold: 'text-lorenzo-gold',
};

export function GMOperationsDashboard({
  initialTheme = 'operations',
}: GMOperationsDashboardProps) {
  const [themeMode, setThemeMode] = useState<GMDashboardTheme>(initialTheme);
  const [branchFilter, setBranchFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('gm-dashboard-theme') as GMDashboardTheme;
    if (savedTheme && (savedTheme === 'operations' || savedTheme === 'light')) {
      setThemeMode(savedTheme);
    }
  }, []);

  // Save theme to localStorage
  const handleThemeToggle = () => {
    const newTheme = themeMode === 'operations' ? 'light' : 'operations';
    setThemeMode(newTheme);
    localStorage.setItem('gm-dashboard-theme', newTheme);
  };

  // Fetch dashboard data
  const { data, isLoading, refetchAll } = useGMDashboard({
    branchFilter,
    enabled: true,
  });

  const theme = themeMode === 'operations' ? operationsTheme : lightTheme;
  const isDark = themeMode === 'operations';

  if (isLoading && !data.orders) {
    return (
      <div
        className={cn(
          'min-h-screen flex items-center justify-center',
          theme.background
        )}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2
            className={cn('w-12 h-12 animate-spin mb-4', theme.accent)}
          />
          <p className={theme.text}>Loading Operations Dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'min-h-screen transition-colors duration-500',
        theme.background,
        isDark ? 'font-sans' : ''
      )}
    >
      {/* Custom font for operations mode */}
      {isDark && (
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
          .gm-number {
            font-family: 'JetBrains Mono', monospace;
          }
        `}</style>
      )}

      <div className="max-w-[1800px] mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <GMDashboardHeader
          themeMode={themeMode}
          onThemeToggle={handleThemeToggle}
          branchFilter={branchFilter}
          onBranchFilterChange={setBranchFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={refetchAll}
          lastUpdated={data.lastUpdated}
        />

        {/* Metrics Row - 5 cards */}
        <GMMetricsRow
          orders={data.orders}
          revenue={data.revenue}
          turnaround={data.turnaround}
          staff={data.staff}
          satisfaction={data.satisfaction}
          themeMode={themeMode}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Live Order Queue */}
            <GMLiveOrderQueue
              orders={data.liveOrders || []}
              themeMode={themeMode}
            />

            {/* Branch Performance */}
            <GMBranchPerformance
              branches={data.branches || []}
              themeMode={themeMode}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Weather Widget */}
            <GMWeatherWidget themeMode={themeMode} />

            {/* Equipment Status */}
            <GMEquipmentStatus
              equipment={data.equipment || []}
              summary={data.equipmentSummary}
              themeMode={themeMode}
            />

            {/* Urgent Issues */}
            <GMUrgentIssues
              issues={data.issues || []}
              themeMode={themeMode}
            />

            {/* Staff on Duty */}
            <GMStaffOnDuty
              staff={data.staffOnDuty || []}
              metrics={data.staff}
              themeMode={themeMode}
            />

            {/* Quick Actions */}
            <GMQuickActions themeMode={themeMode} />
          </div>
        </div>
      </div>
    </div>
  );
}
