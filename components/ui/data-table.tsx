'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { LoadingSpinner } from './loading-spinner';
import { EmptyState } from './empty-state';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

/**
 * Column definition for the data table
 */
export interface DataTableColumn<T> {
  /**
   * Column header label
   */
  header: string;
  /**
   * Accessor function to get cell value
   */
  accessor: (item: T) => React.ReactNode;
  /**
   * Whether this column is sortable
   */
  sortable?: boolean;
  /**
   * Sort key (defaults to header if not provided)
   */
  sortKey?: string;
  /**
   * Additional CSS classes for the column
   */
  className?: string;
}

/**
 * Props for the DataTable component
 */
interface DataTableProps<T> {
  /**
   * Column definitions
   */
  columns: DataTableColumn<T>[];
  /**
   * Data array
   */
  data: T[];
  /**
   * Whether data is loading
   */
  isLoading?: boolean;
  /**
   * Empty state configuration
   */
  emptyState?: {
    icon: LucideIcon;
    heading: string;
    description: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  /**
   * Pagination configuration
   */
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  };
  /**
   * Row click handler
   */
  onRowClick?: (item: T) => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * DataTable component - reusable data table with pagination, sorting, and states
 *
 * @example
 * ```tsx
 * <DataTable
 *   columns={[
 *     { header: 'Name', accessor: (item) => item.name, sortable: true },
 *     { header: 'Email', accessor: (item) => item.email }
 *   ]}
 *   data={users}
 *   isLoading={isLoading}
 *   pagination={{
 *     currentPage: 1,
 *     pageSize: 10,
 *     totalItems: 100,
 *     onPageChange: setPage
 *   }}
 * />
 * ```
 */
export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  emptyState,
  pagination,
  onRowClick,
  className,
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Handle sorting
  const handleSort = (column: DataTableColumn<T>) => {
    if (!column.sortable) return;

    const key = column.sortKey || column.header;
    if (sortColumn === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(key);
      setSortDirection('asc');
    }
  };

  // Calculate pagination values
  const totalPages = pagination
    ? Math.ceil(pagination.totalItems / pagination.pageSize)
    : 1;

  if (isLoading) {
    return (
      <div className="border rounded-lg p-8">
        <LoadingSpinner size="medium" text="Loading data..." centered />
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return (
      <div className="border rounded-lg">
        <EmptyState {...emptyState} />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead
                  key={index}
                  className={cn(
                    column.sortable && 'cursor-pointer select-none hover:bg-gray-50',
                    column.className
                  )}
                  onClick={() => column.sortable && handleSort(column)}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && sortColumn === (column.sortKey || column.header) && (
                      <span className="text-xs">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, rowIndex) => (
              <TableRow
                key={rowIndex}
                onClick={() => onRowClick?.(item)}
                className={cn(onRowClick && 'cursor-pointer')}
              >
                {columns.map((column, colIndex) => (
                  <TableCell key={colIndex} className={column.className}>
                    {column.accessor(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of{' '}
            {pagination.totalItems} results
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(1)}
              disabled={pagination.currentPage === 1}
              aria-label="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-sm font-medium">
              Page {pagination.currentPage} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === totalPages}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(totalPages)}
              disabled={pagination.currentPage === totalPages}
              aria-label="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
