/**
 * InsightsHeader Component
 *
 * Header for the Director Dashboard (Lorenzo Insights Command).
 * Features logo, search bar, filter dropdowns, action buttons, and user profile.
 *
 * @module components/features/director/InsightsHeader
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Search,
  Calendar,
  ChevronDown,
  RefreshCw,
  Bell,
  Settings,
  Sparkles,
  Building2,
} from 'lucide-react';

/**
 * Props for InsightsHeader component
 */
export interface InsightsHeaderProps {
  /** Currently selected timeframe */
  timeframe: string;
  /** Callback when timeframe changes */
  onTimeframeChange: (value: string) => void;
  /** Currently selected branch */
  branch: string;
  /** Callback when branch changes */
  onBranchChange: (value: string) => void;
  /** Callback when refresh button is clicked */
  onRefresh: () => void;
  /** Display name of the logged-in user */
  userName: string;
  /** Role of the logged-in user */
  userRole: string;
  /** Whether data is currently refreshing */
  isRefreshing?: boolean;
  /** List of available branches */
  branches?: Array<{ branchId: string; name: string }>;
  /** Number of unread notifications */
  notificationCount?: number;
  /** Callback when search is submitted */
  onSearch?: (query: string) => void;
  /** Whether search is currently processing */
  isSearching?: boolean;
}

/**
 * Timeframe options for the dropdown
 */
const TIMEFRAME_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
];

/**
 * Currency options for display (currently view-only)
 */
const CURRENCY_OPTIONS = [
  { value: 'KES', label: 'KES' },
  { value: 'USD', label: 'USD' },
];

/**
 * Extract initials from a name
 */
function getInitials(name: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Custom dropdown component for director theme
 */
function DirectorDropdown({
  icon: Icon,
  label,
  value,
  options,
  onChange,
}: {
  icon?: React.ComponentType<{ size: number }>;
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption?.label || value;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="director-dropdown"
      >
        {Icon && <Icon size={14} />}
        <span>{label}:</span>
        <span className="text-lorenzo-accent-teal font-medium">{displayLabel}</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 min-w-[180px] py-1 glass-card-dark z-50">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`
                w-full text-left px-4 py-2 text-sm transition-colors
                ${
                  option.value === value
                    ? 'text-lorenzo-accent-teal bg-lorenzo-teal/20'
                    : 'text-white/80 hover:text-white hover:bg-lorenzo-teal/10'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * InsightsHeader - Director Dashboard Header
 *
 * Displays the Lorenzo Insights Command header with:
 * - Logo and branding
 * - AI-powered search bar
 * - Filter dropdowns (timeframe, branch, currency)
 * - Action buttons (refresh, notifications, settings)
 * - User profile pill
 */
export function InsightsHeader({
  timeframe,
  onTimeframeChange,
  branch,
  onBranchChange,
  onRefresh,
  userName,
  userRole,
  isRefreshing = false,
  branches = [],
  notificationCount = 0,
  onSearch,
  isSearching = false,
}: InsightsHeaderProps) {
  const [currency, setCurrency] = useState('KES');
  const [searchValue, setSearchValue] = useState('');

  /**
   * Handle search input key press
   */
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchValue.trim() && !isSearching) {
      onSearch?.(searchValue.trim());
    }
  };

  /**
   * Handle search input change
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  // Build branch options from provided branches
  const branchOptions = [
    { value: 'all', label: 'All Branches' },
    ...branches.map((b) => ({ value: b.branchId, label: b.name })),
  ];

  return (
    <header className="px-4 md:px-8 py-4 flex flex-wrap items-center gap-4 md:gap-6 director-header-border">
      {/* Logo Section */}
      <div className="flex items-center gap-3">
        <div className="director-logo-box">
          <Sparkles size={20} className="text-white" />
        </div>
        <div className="hidden sm:block">
          <div className="text-[15px] font-semibold tracking-wide text-white">
            Lorenzo Insights Command
          </div>
          <div className="text-[10px] text-white/50 tracking-[2px] uppercase">
            Director View
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-[500px] relative order-last lg:order-none w-full lg:w-auto">
        <Search
          size={18}
          className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
            isSearching ? 'text-lorenzo-accent-teal animate-pulse' : 'text-white/40'
          }`}
        />
        <input
          type="text"
          value={searchValue}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyDown}
          disabled={isSearching}
          className={`director-search-input ${isSearching ? 'opacity-70' : ''}`}
          placeholder={isSearching ? 'Analyzing...' : 'Ask anything... e.g., "Why did Kilimani revenue drop last week?"'}
        />
        {isSearching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <RefreshCw size={16} className="text-lorenzo-accent-teal animate-spin" />
          </div>
        )}
      </div>

      {/* Filter Dropdowns */}
      <div className="hidden xl:flex items-center gap-3">
        <DirectorDropdown
          icon={Calendar}
          label="Timeframe"
          value={timeframe}
          options={TIMEFRAME_OPTIONS}
          onChange={onTimeframeChange}
        />

        <DirectorDropdown
          icon={Building2}
          label="Business Unit"
          value={branch}
          options={branchOptions}
          onChange={onBranchChange}
        />

        <DirectorDropdown
          label="Currency"
          value={currency}
          options={CURRENCY_OPTIONS}
          onChange={setCurrency}
        />
      </div>

      {/* Mobile Filters Button */}
      <button
        type="button"
        className="xl:hidden director-dropdown"
        onClick={() => {
          // Could open a modal/sheet with filters on mobile
        }}
      >
        <Calendar size={14} />
        <span>Filters</span>
        <ChevronDown size={14} />
      </button>

      {/* Action Buttons & User Profile */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Refresh Button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="director-icon-btn"
          aria-label="Refresh data"
        >
          <RefreshCw
            size={18}
            className={isRefreshing ? 'animate-spin' : ''}
          />
        </button>

        {/* Notifications Button */}
        <button
          type="button"
          className="director-icon-btn relative"
          aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} unread)` : ''}`}
        >
          <Bell size={18} />
          {notificationCount > 0 && (
            <span className="director-notification-dot" />
          )}
        </button>

        {/* Settings Button */}
        <button
          type="button"
          className="director-icon-btn"
          aria-label="Settings"
        >
          <Settings size={18} />
        </button>

        {/* User Profile Pill */}
        <div className="director-user-pill ml-2">
          <div className="director-avatar">
            {getInitials(userName)}
          </div>
          <div className="hidden sm:block text-[13px]">
            <div className="font-medium text-white">{userName || 'User'}</div>
            <div className="text-[10px] text-white/50 capitalize">
              {userRole?.replace(/_/g, ' ') || 'Director'}
            </div>
          </div>
          <ChevronDown size={14} className="hidden sm:block text-white/50" />
        </div>
      </div>
    </header>
  );
}

export default InsightsHeader;
