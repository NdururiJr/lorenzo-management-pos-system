/**
 * Welcome Header Component
 *
 * Personalized greeting for the customer dashboard.
 *
 * @module components/features/customer/WelcomeHeader
 */

'use client';

import { Card } from '@/components/ui/card';
import { formatRelativeTime } from '@/lib/utils/formatters';
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
    <Card className="p-6 bg-gradient-to-br from-black to-gray-800 text-white">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">
          {getGreeting()}, {customerName}!
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-300">
          {lastOrderDate && (
            <div>
              Last order: {formatRelativeTime(lastOrderDate.toDate())}
            </div>
          )}
          <div>Total orders: {totalOrders}</div>
        </div>
      </div>
    </Card>
  );
}
