/**
 * Statistics Section Component
 *
 * Displays customer order statistics.
 *
 * @module components/features/customer/StatisticsSection
 */

'use client';

import { Card } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { Package, DollarSign, Calendar } from 'lucide-react';
import type { Customer } from '@/lib/db/schema';

interface StatisticsSectionProps {
  customer: Customer;
}

export function StatisticsSection({ customer }: StatisticsSectionProps) {
  const stats = [
    {
      label: 'Total Orders',
      value: customer.orderCount,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Total Spent',
      value: formatCurrency(customer.totalSpent),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Member Since',
      value: formatDate(customer.createdAt.toDate()),
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Your Statistics</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`${stat.bgColor} rounded-lg p-4 border`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-600">{stat.label}</p>
                  <p className={`text-lg font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
