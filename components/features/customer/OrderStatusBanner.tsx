/**
 * Order Status Banner Component
 *
 * Displays persistent status banners at the top of order detail pages
 * for ready and out_for_delivery statuses.
 *
 * @module components/features/customer/OrderStatusBanner
 */

'use client';

import { useState, useEffect } from 'react';
import { X, Package, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { OrderStatus } from '@/lib/db/schema';

interface OrderStatusBannerProps {
  status: OrderStatus;
  orderId: string;
}

export function OrderStatusBanner({ status, orderId }: OrderStatusBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Check localStorage for dismissed state
  useEffect(() => {
    const dismissed = localStorage.getItem(`banner-dismissed-${orderId}-${status}`);
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, [orderId, status]);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(`banner-dismissed-${orderId}-${status}`, 'true');
  };

  // Only show for specific statuses
  // FR-008: Updated to use 'queued_for_delivery' instead of 'ready'
  if (status !== 'queued_for_delivery' && status !== 'out_for_delivery') {
    return null;
  }

  // Don't render if dismissed
  if (isDismissed) {
    return null;
  }

  // FR-008: Updated to use 'queued_for_delivery' instead of 'ready'
  const bannerConfig = {
    queued_for_delivery: {
      icon: Package,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-600',
      title: 'Your order is ready for pickup!',
      message: 'Visit your nearest branch to collect your clean garments.',
    },
    out_for_delivery: {
      icon: Truck,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-600',
      title: 'Driver is on the way!',
      message: 'Track your delivery in real-time below.',
    },
  };

  const config = bannerConfig[status];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={`relative ${config.bgColor} border ${config.borderColor} rounded-lg p-4 mb-6`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 ${config.iconColor}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold ${config.textColor}`}>
              {config.title}
            </h3>
            <p className={`text-sm ${config.textColor} mt-1`}>
              {config.message}
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className={`flex-shrink-0 ${config.textColor} hover:opacity-70 transition-opacity`}
            aria-label="Dismiss notification"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
