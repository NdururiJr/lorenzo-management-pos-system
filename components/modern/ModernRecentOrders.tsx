/**
 * ModernRecentOrders Component
 *
 * Displays a list of recent orders processed by the current staff member.
 * Matches the lorenzo-staff-dashboard.jsx reference design.
 *
 * @module components/modern/ModernRecentOrders
 */

'use client';

import { motion } from 'framer-motion';
import { Package, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface RecentOrder {
  id: string;
  customer: string;
  items: number;
  status: string;
  time: string;
  statusColor: string;
}

interface ModernRecentOrdersProps {
  orders?: RecentOrder[];
  className?: string;
}

// Status color mapping - FR-008: Added 'queued_for_delivery'
const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    'received': '#6B7280',
    'queued': '#6B7280',
    'washing': '#3B82F6',
    'drying': '#8B5CF6',
    'ironing': '#F59E0B',
    'quality_check': '#8B5CF6',
    'packaging': '#EC4899',
    'queued_for_delivery': '#10B981', // FR-008: Replaced 'ready'
    'out_for_delivery': '#F59E0B',
    'delivered': '#10B981',
    'collected': '#10B981',
  };
  return statusColors[status.toLowerCase()] || '#6B7280';
};

// Format status for display
const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'received': 'Received',
    'queued': 'Queued',
    'washing': 'Washing',
    'drying': 'Drying',
    'ironing': 'Ironing',
    'quality_check': 'QC',
    'packaging': 'Packaging',
    'ready': 'Ready',
    'out_for_delivery': 'Delivery',
    'delivered': 'Delivered',
    'collected': 'Collected',
  };
  return statusMap[status.toLowerCase()] || status;
};

// Demo data matching reference
const demoOrders: RecentOrder[] = [
  { id: 'ORD-001', customer: 'Sarah Kimani', items: 3, status: 'washing', time: '09:30', statusColor: '#3B82F6' },
  { id: 'ORD-002', customer: 'John Odhiambo', items: 5, status: 'queued_for_delivery', time: '10:45', statusColor: '#10B981' }, // FR-008
  { id: 'ORD-003', customer: 'Mary Wanjiku', items: 2, status: 'ironing', time: '11:00', statusColor: '#F59E0B' },
  { id: 'ORD-004', customer: 'Peter Mwangi', items: 4, status: 'quality_check', time: '13:15', statusColor: '#8B5CF6' },
];

export function ModernRecentOrders({ orders = demoOrders, className = '' }: ModernRecentOrdersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className={`bg-white rounded-3xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] h-full ${className}`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-medium text-lorenzo-dark-teal">My Recent Orders</h3>
        <Link
          href="/orders"
          className="text-sm font-medium text-lorenzo-teal hover:text-lorenzo-accent-teal transition-colors flex items-center gap-1"
        >
          View All <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Orders List */}
      <div className="flex flex-col gap-2.5">
        {orders.map((order, index) => {
          const statusColor = order.statusColor || getStatusColor(order.status);

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-center gap-3.5 p-3.5 bg-lorenzo-cream rounded-[14px] cursor-pointer hover:bg-lorenzo-cream/80 transition-colors"
            >
              {/* Icon */}
              <div
                className="w-[42px] h-[42px] rounded-xl flex items-center justify-center text-lg"
                style={{ backgroundColor: `${statusColor}20` }}
              >
                <Package className="h-5 w-5" style={{ color: statusColor }} />
              </div>

              {/* Order Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-lorenzo-dark-teal truncate">
                  {order.customer}
                </p>
                <p className="text-xs text-lorenzo-teal/50 mt-0.5">
                  {order.id} • {order.items} items
                </p>
              </div>

              {/* Status Badge */}
              <span
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{
                  backgroundColor: `${statusColor}15`,
                  color: statusColor
                }}
              >
                {formatStatus(order.status)}
              </span>

              {/* Time */}
              <span className="text-xs text-lorenzo-teal/50">
                {order.time}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default ModernRecentOrders;
