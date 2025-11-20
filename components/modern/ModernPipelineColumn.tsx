/**
 * Modern Pipeline Column Component
 *
 * Glassmorphic Kanban column with blue theme and animations.
 *
 * @module components/modern/ModernPipelineColumn
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, Clock, Package, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OrderExtended, OrderStatus } from '@/lib/db/schema';
import { getStatusConfig } from '@/lib/pipeline/status-manager';
import { formatDuration } from '@/lib/pipeline/pipeline-helpers';
import { ModernBadge } from './ModernBadge';

interface ModernPipelineColumnProps {
  status: OrderStatus;
  orders: OrderExtended[];
  onOrderClick: (order: OrderExtended) => void;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  className?: string;
}

export function ModernPipelineColumn({
  status,
  orders,
  onOrderClick,
  onStatusChange,
  className,
}: ModernPipelineColumnProps) {
  const statusConfig = getStatusConfig(status);

  // Calculate average time in this stage
  const avgTime = orders.length > 0
    ? Math.round(
        orders.reduce((sum, order) => {
          const lastStatus = order.statusHistory[order.statusHistory.length - 1];
          if (lastStatus) {
            const timeInStage = Math.floor(
              (Date.now() - lastStatus.timestamp.toDate().getTime()) / (1000 * 60)
            );
            return sum + timeInStage;
          }
          return sum;
        }, 0) / orders.length
      )
    : 0;

  // Get status color theme
  const getStatusTheme = () => {
    switch (status) {
      case 'received':
      case 'queued':
        return {
          bg: 'from-brand-blue/10 to-brand-blue/5',
          border: 'border-brand-blue/20',
          icon: Package,
          iconColor: 'text-brand-blue',
        };
      case 'washing':
      case 'drying':
      case 'ironing':
        return {
          bg: 'from-purple-100 to-purple-50',
          border: 'border-purple-200',
          icon: Clock,
          iconColor: 'text-purple-600',
        };
      case 'quality_check':
      case 'packaging':
        return {
          bg: 'from-amber-100 to-amber-50',
          border: 'border-amber-200',
          icon: AlertCircle,
          iconColor: 'text-amber-600',
        };
      case 'ready':
      case 'out_for_delivery':
        return {
          bg: 'from-green-100 to-green-50',
          border: 'border-green-200',
          icon: CheckCircle2,
          iconColor: 'text-green-600',
        };
      default:
        return {
          bg: 'from-gray-100 to-gray-50',
          border: 'border-gray-200',
          icon: Package,
          iconColor: 'text-gray-600',
        };
    }
  };

  const theme = getStatusTheme();
  const StatusIcon = theme.icon;

  return (
    <div className={cn('w-80 flex-shrink-0 flex flex-col', className)}>
      {/* Column Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'mb-4 p-5 bg-white/70 backdrop-blur-xl rounded-3xl shadow-card border-2',
          theme.border
        )}
      >
        <div className={cn('absolute inset-0 rounded-3xl bg-gradient-to-br opacity-50', theme.bg)} />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400 }}
                className={cn('p-2 rounded-xl bg-white/80')}
              >
                <StatusIcon className={cn('w-5 h-5', theme.iconColor)} />
              </motion.div>
              <h3 className="font-semibold text-gray-900">{statusConfig.label}</h3>
            </div>
            <ModernBadge variant="primary" size="sm" gradient>
              {orders.length}
            </ModernBadge>
          </div>

          <p className="text-xs text-gray-600 mb-2">
            {statusConfig.description}
          </p>

          {avgTime > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-1 text-xs"
            >
              <Clock className="w-3 h-3 text-gray-500" />
              <span className="text-gray-600">
                Avg: <strong>{formatDuration(avgTime)}</strong> in stage
              </span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Orders List */}
      <ScrollArea className="flex-1 h-[calc(100vh-320px)] pr-2">
        <AnimatePresence mode="popLayout">
          {orders.length > 0 ? (
            <div className="space-y-3">
              {orders.map((order, index) => (
                <motion.div
                  key={order.orderId}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                  }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  onClick={() => onOrderClick(order)}
                  className="relative p-4 bg-white/70 backdrop-blur-xl rounded-2xl shadow-card border-2 border-white/60 cursor-pointer hover:shadow-glow-blue/10 transition-all"
                >
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-blue/5 via-transparent to-brand-blue-100/5 pointer-events-none" />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-mono font-semibold text-sm text-brand-blue">
                        {order.orderId}
                      </p>
                    </div>

                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {order.customerName}
                    </p>

                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <span className="flex items-center">
                        <Package className="w-3 h-3 mr-1" />
                        {order.garments.length} items
                      </span>
                      <span>•</span>
                      <span className="font-medium">
                        KES {order.totalAmount.toLocaleString()}
                      </span>
                    </div>

                    {/* Time in current stage */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="mt-3 pt-3 border-t border-gray-100"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">In stage:</span>
                        <span className={cn(
                          'font-medium',
                          avgTime > 120 ? 'text-red-600' : 'text-gray-600'
                        )}>
                          {(() => {
                            const lastStatus = order.statusHistory[order.statusHistory.length - 1];
                            if (lastStatus) {
                              const timeInStage = Math.floor(
                                (Date.now() - lastStatus.timestamp.toDate().getTime()) / (1000 * 60)
                              );
                              return formatDuration(timeInStage);
                            }
                            return 'Just arrived';
                          })()}
                        </span>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-200"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
              >
                <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              </motion.div>
              <p className="text-sm text-gray-500 font-medium">No orders in this stage</p>
              <p className="text-xs text-gray-400 mt-1">Orders will appear here when moved</p>
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
}