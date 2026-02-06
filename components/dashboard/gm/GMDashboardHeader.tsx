/**
 * GM Dashboard Header Component
 *
 * Header with logo, LIVE indicator, search, filters, theme toggle, and notifications
 *
 * @module components/dashboard/gm/GMDashboardHeader
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Sun,
  Moon,
  Bell,
  RefreshCw,
  ChevronDown,
  Store,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import type { GMDashboardTheme } from '@/types/gm-dashboard';
import { format } from 'date-fns';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface GMDashboardHeaderProps {
  themeMode: GMDashboardTheme;
  onThemeToggle: () => void;
  branchFilter: string;
  onBranchFilterChange: (branch: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  lastUpdated?: Date;
}

export function GMDashboardHeader({
  themeMode,
  onThemeToggle,
  branchFilter,
  onBranchFilterChange,
  searchQuery,
  onSearchChange,
  onRefresh,
  lastUpdated,
}: GMDashboardHeaderProps) {
  const { userData } = useAuth();
  const isDark = themeMode === 'operations';

  // Fetch branches from Firestore instead of hardcoded values
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([
    { id: 'all', name: 'All Branches' },
  ]);
  const [loadingBranches, setLoadingBranches] = useState(true);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const branchesQuery = query(
          collection(db, 'branches'),
          where('active', '==', true)
        );
        const snapshot = await getDocs(branchesQuery);
        const branchList = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: (doc.data() as { name?: string }).name || doc.id,
        }));

        // Sort branches alphabetically by name
        branchList.sort((a, b) => a.name.localeCompare(b.name));

        // Add "All Branches" at the beginning
        setBranches([{ id: 'all', name: 'All Branches' }, ...branchList]);
      } catch (error) {
        console.error('Error fetching branches:', error);
        // Keep the default "All Branches" option on error
      } finally {
        setLoadingBranches(false);
      }
    };

    fetchBranches();
  }, []);

  const selectedBranch = branches.find((b) => b.id === branchFilter) || branches[0];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl',
        isDark
          ? 'bg-white/5 backdrop-blur-xl border border-white/10'
          : 'bg-white border border-black/5 shadow-sm'
      )}
    >
      {/* Left: Logo + LIVE indicator */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <h1
            className={cn(
              'text-2xl tracking-[0.2em] font-light',
              isDark ? 'text-white' : 'text-lorenzo-dark-teal'
            )}
          >
            LORENZO
          </h1>
          <span
            className={cn(
              'text-[10px] tracking-[0.3em] uppercase',
              isDark ? 'text-[#2DD4BF]/80' : 'text-lorenzo-accent-teal/80'
            )}
          >
            Operations Center
          </span>
        </div>

        {/* LIVE Indicator */}
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full',
            isDark ? 'bg-red-500/20' : 'bg-red-50'
          )}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span
            className={cn(
              'text-xs font-semibold',
              isDark ? 'text-red-400' : 'text-red-600'
            )}
          >
            LIVE
          </span>
        </div>
      </div>

      {/* Center: Search + Filters */}
      <div className="flex items-center gap-3 flex-1 max-w-2xl">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4',
              isDark ? 'text-white/50' : 'text-gray-400'
            )}
          />
          <Input
            placeholder="Search orders, customers..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={cn(
              'pl-10 rounded-xl border-0',
              isDark
                ? 'bg-white/10 text-white placeholder:text-white/40 focus:bg-white/15'
                : 'bg-gray-100 text-gray-900 placeholder:text-gray-400 focus:bg-gray-50'
            )}
          />
        </div>

        {/* Branch Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'min-w-[180px] justify-between rounded-xl border-0',
                isDark
                  ? 'bg-white/10 text-white hover:bg-white/15'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-50'
              )}
              disabled={loadingBranches}
            >
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4" />
                <span className="truncate">
                  {loadingBranches ? 'Loading...' : selectedBranch.name}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className={cn(
              'w-[200px]',
              isDark
                ? 'bg-[#0D2329] border-white/10 text-white'
                : 'bg-white border-gray-200'
            )}
          >
            {branches.map((branch) => (
              <DropdownMenuItem
                key={branch.id}
                onClick={() => onBranchFilterChange(branch.id)}
                className={cn(
                  'cursor-pointer',
                  isDark
                    ? 'focus:bg-white/10 focus:text-white'
                    : 'focus:bg-gray-100'
                )}
              >
                {branch.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Last Updated */}
        {lastUpdated && (
          <span
            className={cn(
              'text-xs hidden sm:block',
              isDark ? 'text-white/40' : 'text-gray-400'
            )}
          >
            Updated {format(lastUpdated, 'h:mm a')}
          </span>
        )}

        {/* Refresh */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          className={cn(
            'rounded-xl',
            isDark
              ? 'text-white/70 hover:text-white hover:bg-white/10'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          )}
        >
          <RefreshCw className="w-5 h-5" />
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'relative rounded-xl',
            isDark
              ? 'text-white/70 hover:text-white hover:bg-white/10'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          )}
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onThemeToggle}
          className={cn(
            'rounded-xl',
            isDark
              ? 'text-[#C9A962] hover:text-[#C9A962] hover:bg-white/10'
              : 'text-lorenzo-gold hover:text-lorenzo-gold hover:bg-gray-100'
          )}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>

        {/* User Avatar */}
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium',
            isDark
              ? 'bg-gradient-to-br from-[#C9A962] to-[#A88B4A] text-white'
              : 'bg-gradient-to-br from-lorenzo-gold to-lorenzo-gold-dark text-white'
          )}
        >
          {userData?.name?.charAt(0) || 'G'}
        </div>
      </div>
    </motion.header>
  );
}
