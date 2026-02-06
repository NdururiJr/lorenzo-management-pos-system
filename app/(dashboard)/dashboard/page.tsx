/**
 * Dashboard Home Page
 *
 * Role-based dashboard that shows:
 * - Director Dashboard for director role (dark theme executive view)
 * - GM Operations Dashboard for general_manager role
 * - Staff Dashboard for all other roles
 *
 * @module app/(dashboard)/dashboard/page
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { StaffDashboard } from '@/components/dashboard/StaffDashboard';
import { GMOperationsDashboard } from '@/components/dashboard/GMOperationsDashboard';
import { Loader2 } from 'lucide-react';
import { getActiveBranches } from '@/lib/db/index';
import type { Branch } from '@/lib/db/schema';

// Director Dashboard Components
import { InsightsHeader } from '@/components/features/director/InsightsHeader';
import { ExecutiveNarrative } from '@/components/features/director/ExecutiveNarrative';
import { DirectorKPICards } from '@/components/features/director/DirectorKPICards';
import { PredictivePerformanceChart } from '@/components/features/director/PredictivePerformanceChart';
import { KeyDriversChart } from '@/components/features/director/KeyDriversChart';
import { RiskRadar } from '@/components/features/director/RiskRadar';
import { AIRecommendations } from '@/components/features/director/AIRecommendations';
import { BranchComparison } from '@/components/features/director/BranchComparison';
import { OperationalHealth } from '@/components/features/director/OperationalHealth';
import { DirectorFooterInline } from '@/components/features/director/DirectorFooter';
import { DirectorSearchModal, type SearchResult } from '@/components/features/director/DirectorSearchModal';

// Type definitions
type TimePeriod = 'today' | 'week' | 'month' | 'quarter' | 'year';

/**
 * Auto-refresh interval in milliseconds (30 seconds)
 */
const AUTO_REFRESH_INTERVAL = 30000;

/**
 * Director Dashboard Component
 *
 * Executive-level dashboard with AI-powered insights,
 * predictive analytics, risk monitoring, and strategic recommendations.
 */
function DirectorDashboard({ userData }: { userData: { name?: string; role?: string } }) {
  // Get Firebase user for API authentication
  const { user } = useAuth();

  // State for filters
  const [timeframe, setTimeframe] = useState<TimePeriod>('quarter');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());

  // State for AI search
  const [isSearching, setIsSearching] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Fetch branches for filter dropdown
  const { data: branches = [], refetch: refetchBranches } = useQuery<Branch[]>({
    queryKey: ['director-branches'],
    queryFn: getActiveBranches,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  /**
   * Handle data refresh
   */
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetchBranches();
      setLastRefreshTime(new Date());
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchBranches]);

  /**
   * Auto-refresh data every 30 seconds
   */
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [handleRefresh]);

  /**
   * Handle AI search query
   */
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    setSearchModalOpen(true);
    setIsSearching(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      // Get authentication token
      const token = await user?.getIdToken();
      if (!token) {
        throw new Error('Not authenticated. Please log in again.');
      }

      const response = await fetch('/api/director/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query,
          context: {
            branchId: selectedBranch,
            timeframe,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process your query');
      }

      setSearchResult({
        answer: data.answer,
        intent: data.intent,
        sources: data.sources || [],
        branchId: data.branchId,
      });
    } catch (error) {
      console.error('[Director Search] Error:', error);
      setSearchError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSearching(false);
    }
  }, [user, selectedBranch, timeframe]);

  // Format branches for header dropdown
  const branchOptions = branches.map((b) => ({
    branchId: b.branchId,
    name: b.name,
  }));

  // Get selected branch name for display
  const selectedBranchName = selectedBranch === 'all'
    ? undefined
    : branches.find(b => b.branchId === selectedBranch)?.name;

  return (
    <div className="director-dark min-h-screen">
      {/* Header with Search, Filters, User Profile */}
      <InsightsHeader
        timeframe={timeframe}
        onTimeframeChange={(value) => setTimeframe(value as TimePeriod)}
        branch={selectedBranch}
        onBranchChange={setSelectedBranch}
        onRefresh={handleRefresh}
        userName={userData?.name || 'Director'}
        userRole={userData?.role || 'director'}
        isRefreshing={isRefreshing}
        branches={branchOptions}
        notificationCount={2}
        onSearch={handleSearch}
        isSearching={isSearching}
      />

      {/* AI Search Results Modal */}
      <DirectorSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        query={searchQuery}
        result={searchResult}
        isLoading={isSearching}
        error={searchError}
        onNewSearch={handleSearch}
      />

      {/* Main Content */}
      <main className="px-4 md:px-8 py-6">
        {/* Executive Narrative / Morning Briefing */}
        <div className="mb-6">
          <ExecutiveNarrative timeframe={timeframe} branchId={selectedBranch} />
        </div>

        {/* KPI Cards Grid */}
        <div className="mb-6">
          <DirectorKPICards timeframe={timeframe} branchId={selectedBranch} />
        </div>

        {/* Strategic Deep Dive Section Label */}
        <div className="director-divider-label mb-4">
          Strategic Deep Dive
        </div>

        {/* Performance Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-6">
          {/* Revenue Performance Chart - Takes 3 columns */}
          <div className="lg:col-span-3">
            <PredictivePerformanceChart
              timeframe={timeframe}
              branchId={selectedBranch}
              branchName={selectedBranchName}
            />
          </div>

          {/* Key Drivers Chart - Takes 2 columns */}
          <div className="lg:col-span-2">
            <KeyDriversChart timeframe={timeframe} branchId={selectedBranch} />
          </div>
        </div>

        {/* Risk Radar & Opportunities Section Label */}
        <div className="director-divider-label mb-4">
          Risk Radar & Opportunities
        </div>

        {/* Risk & AI Section Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          {/* Risk Watchlist */}
          <RiskRadar branchId={selectedBranch} />

          {/* AI Recommendations */}
          <AIRecommendations branchId={selectedBranch} timeframe={timeframe} />
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          {/* Branch Comparison - Takes 2 columns */}
          <div className="lg:col-span-2">
            <BranchComparison period={timeframe} />
          </div>

          {/* Operational Health - Takes 1 column */}
          <div>
            <OperationalHealth branchId={selectedBranch} />
          </div>
        </div>

        {/* Footer with Status */}
        <DirectorFooterInline lastUpdated={lastRefreshTime} refreshInterval={1} />
      </main>
    </div>
  );
}

export default function DashboardPage() {
  const { user, userData, loading } = useAuth();

  // Show loading state while auth is being checked
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-lorenzo-accent-teal mx-auto mb-4" />
          <p className="text-lorenzo-teal">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user || !userData) {
    return null;
  }

  // Check user role for appropriate dashboard
  const isDirector = userData.role === 'director';
  const isGeneralManager = userData.role === 'general_manager';

  // Director gets the executive dark theme dashboard
  if (isDirector) {
    return <DirectorDashboard userData={userData} />;
  }

  // General Manager gets the operations dashboard
  if (isGeneralManager) {
    return <GMOperationsDashboard />;
  }

  // Default: Staff Dashboard for all other roles
  return <StaffDashboard />;
}
