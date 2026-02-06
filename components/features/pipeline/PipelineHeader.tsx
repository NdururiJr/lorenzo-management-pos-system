/**
 * Pipeline Header Component
 *
 * Header with filters, search, and view controls for the pipeline board.
 *
 * @module components/features/pipeline/PipelineHeader
 */

'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, RefreshCw, X, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PipelineFilters } from '@/hooks/usePipelineFilters';

interface PipelineHeaderProps {
  filters: PipelineFilters;
  onFilterChange: <K extends keyof PipelineFilters>(
    key: K,
    value: PipelineFilters[K]
  ) => void;
  onResetFilters: () => void;
  onRefresh: () => void;
  hasActiveFilters: boolean;
  isLoading?: boolean;
  totalOrders: number;
  filteredCount: number;
  className?: string;
}

export function PipelineHeader({
  filters,
  onFilterChange,
  onResetFilters,
  onRefresh,
  hasActiveFilters,
  isLoading = false,
  totalOrders,
  filteredCount,
  className,
}: PipelineHeaderProps) {
  return (
    <div className={cn('bg-white border-b border-gray-200', className)}>
      <div className="px-6 py-4">
        {/* Title and Actions */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-black">
              Order Pipeline
            </h1>
            <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
              <span>Showing {filteredCount} of {totalOrders} orders</span>
              {hasActiveFilters && (
                <Badge variant="secondary">
                  Filtered
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={onResetFilters}
                className="border-gray-300"
              >
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="border-gray-300"
            >
              <RefreshCw
                className={cn('w-4 h-4 mr-2', isLoading && 'animate-spin')}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by order ID, customer name, or phone..."
              value={filters.searchQuery}
              onChange={(e) => onFilterChange('searchQuery', e.target.value)}
              className="pl-10 border-gray-300"
            />
          </div>

          {/* Date Range */}
          <Select
            value={filters.dateRange}
            onValueChange={(value) =>
              onFilterChange('dateRange', value as PipelineFilters['dateRange'])
            }
          >
            <SelectTrigger className="border-gray-300">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Group */}
          <Select
            value={filters.statusGroup}
            onValueChange={(value) =>
              onFilterChange(
                'statusGroup',
                value as PipelineFilters['statusGroup']
              )
            }
          >
            <SelectTrigger className="border-gray-300">
              <SelectValue placeholder="Status Group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter Indicator */}
          <div className="flex items-center justify-center lg:justify-start">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              <span>
                {hasActiveFilters ? 'Filters Active' : 'No Filters'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
