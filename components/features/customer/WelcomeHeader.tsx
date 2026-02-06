/**
 * Welcome Header Component
 *
 * Personalized greeting for the customer dashboard with modern glassmorphic design.
 *
 * @module components/features/customer/WelcomeHeader
 */

'use client';

import { ModernCardContent } from '@/components/modern/ModernCard';
import { formatRelativeTime } from '@/lib/utils/formatters';
import { Package, Clock } from 'lucide-react';
import type { Timestamp } from 'firebase/firestore';

interface WelcomeHeaderProps {
  customerName: string;
  lastOrderDate?: Timestamp;
  totalOrders: number;
}

export function WelcomeHeader({
  customerName,
  lastOrderDate,
  totalOrders,
}: WelcomeHeaderProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="mb-6 bg-gradient-to-r from-brand-blue-50 to-white border border-gray-200 rounded-xl shadow-sm">
      <ModernCardContent className="!p-8">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-brand-blue mb-1">
              {getGreeting()}
            </p>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {customerName}!
            </h1>
          </div>

          <div className="flex flex-wrap gap-6">
            {lastOrderDate && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4 text-brand-blue" />
                <span className="text-sm">
                  Last order: <span className="font-medium text-gray-900">{formatRelativeTime(lastOrderDate.toDate())}</span>
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-600">
              <Package className="h-4 w-4 text-brand-blue" />
              <span className="text-sm">
                Total orders: <span className="font-medium text-gray-900">{totalOrders}</span>
              </span>
            </div>
          </div>
        </div>
      </ModernCardContent>
    </div>
  );
}
