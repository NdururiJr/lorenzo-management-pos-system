/**
 * GM Live Order Queue Component
 *
 * Real-time order table with status, ETA, priority, and actions
 *
 * @module components/dashboard/gm/GMLiveOrderQueue
 */

'use client';

import { motion } from 'framer-motion';
import {
  Package,
  Clock,
  Zap,
  MoreHorizontal,
  Eye,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { OrderQueueItem, GMDashboardTheme } from '@/types/gm-dashboard';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

interface GMLiveOrderQueueProps {
  orders: OrderQueueItem[];
  themeMode: GMDashboardTheme;
}

const statusColors: Record<string, { dark: string; light: string }> = {
  received: { dark: 'bg-blue-500/20 text-blue-400', light: 'bg-blue-50 text-blue-600' },
  queued: { dark: 'bg-gray-500/20 text-gray-400', light: 'bg-gray-50 text-gray-600' },
  washing: { dark: 'bg-cyan-500/20 text-cyan-400', light: 'bg-cyan-50 text-cyan-600' },
  drying: { dark: 'bg-amber-500/20 text-amber-400', light: 'bg-amber-50 text-amber-600' },
  ironing: { dark: 'bg-orange-500/20 text-orange-400', light: 'bg-orange-50 text-orange-600' },
  quality_check: { dark: 'bg-purple-500/20 text-purple-400', light: 'bg-purple-50 text-purple-600' },
  packaging: { dark: 'bg-pink-500/20 text-pink-400', light: 'bg-pink-50 text-pink-600' },
  ready: { dark: 'bg-green-500/20 text-green-400', light: 'bg-green-50 text-green-600' },
  out_for_delivery: { dark: 'bg-teal-500/20 text-teal-400', light: 'bg-teal-50 text-teal-600' },
};

const priorityColors: Record<string, { dark: string; light: string }> = {
  express: { dark: 'bg-red-500/20 text-red-400', light: 'bg-red-50 text-red-600' },
  standard: { dark: 'bg-blue-500/20 text-blue-400', light: 'bg-blue-50 text-blue-600' },
  economy: { dark: 'bg-gray-500/20 text-gray-400', light: 'bg-gray-50 text-gray-600' },
};

export function GMLiveOrderQueue({ orders, themeMode }: GMLiveOrderQueueProps) {
  const isDark = themeMode === 'operations';

  const _formatTime = (timestamp: Date | Timestamp | undefined) => {
    if (!timestamp) return '-';
    const date =
      timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'h:mm a');
  };

  const getStatusDisplay = (status: string) => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={cn(
        'rounded-2xl overflow-hidden',
        isDark
          ? 'bg-white/5 backdrop-blur-xl border border-white/10'
          : 'bg-white border border-black/5 shadow-sm'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              isDark ? 'bg-[#2DD4BF]/20' : 'bg-lorenzo-accent-teal/10'
            )}
          >
            <Package
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
              Live Order Queue
            </h3>
            <p
              className={cn(
                'text-sm',
                isDark ? 'text-white/60' : 'text-gray-500'
              )}
            >
              {orders.length} active orders
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'rounded-xl',
            isDark
              ? 'text-[#2DD4BF] hover:bg-white/10'
              : 'text-lorenzo-accent-teal hover:bg-gray-100'
          )}
          onClick={() => (window.location.href = '/orders')}
        >
          View All
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow
              className={cn(
                isDark
                  ? 'border-white/10 hover:bg-transparent'
                  : 'border-gray-100 hover:bg-transparent'
              )}
            >
              <TableHead
                className={cn(isDark ? 'text-white/60' : 'text-gray-500')}
              >
                Order ID
              </TableHead>
              <TableHead
                className={cn(isDark ? 'text-white/60' : 'text-gray-500')}
              >
                Customer
              </TableHead>
              <TableHead
                className={cn(isDark ? 'text-white/60' : 'text-gray-500')}
              >
                Items
              </TableHead>
              <TableHead
                className={cn(isDark ? 'text-white/60' : 'text-gray-500')}
              >
                Services
              </TableHead>
              <TableHead
                className={cn(isDark ? 'text-white/60' : 'text-gray-500')}
              >
                Status
              </TableHead>
              <TableHead
                className={cn(isDark ? 'text-white/60' : 'text-gray-500')}
              >
                ETA
              </TableHead>
              <TableHead
                className={cn(isDark ? 'text-white/60' : 'text-gray-500')}
              >
                Priority
              </TableHead>
              <TableHead
                className={cn(
                  'text-right',
                  isDark ? 'text-white/60' : 'text-gray-500'
                )}
              >
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className={cn(
                    'text-center py-10',
                    isDark ? 'text-white/40' : 'text-gray-400'
                  )}
                >
                  <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No active orders</p>
                </TableCell>
              </TableRow>
            ) : (
              orders.slice(0, 10).map((order, _index) => {
                const statusStyle =
                  statusColors[order.status] || statusColors.received;
                const priorityStyle =
                  priorityColors[order.priority] || priorityColors.standard;
                const isOverdue = order.eta === 'Overdue';

                return (
                  <TableRow
                    key={order.orderId}
                    className={cn(
                      'transition-colors',
                      isDark
                        ? 'border-white/5 hover:bg-white/5'
                        : 'border-gray-50 hover:bg-gray-50'
                    )}
                  >
                    <TableCell>
                      <span
                        className={cn(
                          'font-mono text-sm',
                          isDark ? 'text-[#2DD4BF]' : 'text-lorenzo-accent-teal'
                        )}
                      >
                        {order.orderId.slice(-8)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p
                          className={cn(
                            'font-medium',
                            isDark ? 'text-white' : 'text-gray-900'
                          )}
                        >
                          {order.customerName}
                        </p>
                        <p
                          className={cn(
                            'text-xs',
                            isDark ? 'text-white/40' : 'text-gray-400'
                          )}
                        >
                          {order.customerPhone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'gm-number font-medium',
                          isDark ? 'text-white' : 'text-gray-900'
                        )}
                      >
                        {order.items}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {order.services.slice(0, 2).map((service) => (
                          <span
                            key={service}
                            className={cn(
                              'text-xs px-2 py-0.5 rounded-full',
                              isDark
                                ? 'bg-white/10 text-white/70'
                                : 'bg-gray-100 text-gray-600'
                            )}
                          >
                            {service}
                          </span>
                        ))}
                        {order.services.length > 2 && (
                          <span
                            className={cn(
                              'text-xs px-2 py-0.5 rounded-full',
                              isDark
                                ? 'bg-white/10 text-white/70'
                                : 'bg-gray-100 text-gray-600'
                            )}
                          >
                            +{order.services.length - 2}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          'text-xs font-medium',
                          isDark ? statusStyle.dark : statusStyle.light
                        )}
                      >
                        {getStatusDisplay(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {isOverdue ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                        ) : (
                          <Clock
                            className={cn(
                              'w-3.5 h-3.5',
                              isDark ? 'text-white/40' : 'text-gray-400'
                            )}
                          />
                        )}
                        <span
                          className={cn(
                            'text-sm gm-number',
                            isOverdue
                              ? 'text-red-500 font-medium'
                              : isDark
                              ? 'text-white'
                              : 'text-gray-900'
                          )}
                        >
                          {order.eta}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          'text-xs font-medium',
                          isDark ? priorityStyle.dark : priorityStyle.light
                        )}
                      >
                        {order.priority === 'express' && (
                          <Zap className="w-3 h-3 mr-1" />
                        )}
                        {order.priority.charAt(0).toUpperCase() +
                          order.priority.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              'h-8 w-8 rounded-lg',
                              isDark
                                ? 'text-white/60 hover:text-white hover:bg-white/10'
                                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'
                            )}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className={cn(
                            isDark
                              ? 'bg-[#0D2329] border-white/10 text-white'
                              : 'bg-white border-gray-200'
                          )}
                        >
                          <DropdownMenuItem
                            onClick={() =>
                              (window.location.href = `/orders/${order.orderId}`)
                            }
                            className={cn(
                              'cursor-pointer',
                              isDark
                                ? 'focus:bg-white/10'
                                : 'focus:bg-gray-100'
                            )}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className={cn(
                              'cursor-pointer',
                              isDark
                                ? 'focus:bg-white/10'
                                : 'focus:bg-gray-100'
                            )}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Update Status
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}
