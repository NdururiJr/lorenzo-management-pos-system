/**
 * Quick Actions Component
 *
 * Quick action buttons for common tasks.
 *
 * @module components/features/customer/QuickActions
 */

'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, History, User, Phone } from 'lucide-react';

const ACTIONS = [
  {
    href: '/orders',
    label: 'Track Order',
    description: 'View order status',
    icon: Package,
    color: 'bg-blue-50 text-blue-600 border-blue-200',
  },
  {
    href: '/orders',
    label: 'History',
    description: 'Past orders',
    icon: History,
    color: 'bg-purple-50 text-purple-600 border-purple-200',
  },
  {
    href: '/profile',
    label: 'Profile',
    description: 'Edit details',
    icon: User,
    color: 'bg-green-50 text-green-600 border-green-200',
  },
];

export function QuickActions() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Quick Actions</h2>

      <div className="grid grid-cols-3 gap-3">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} href={action.href}>
              <Card
                className={`p-4 hover:shadow-md transition-shadow cursor-pointer border ${action.color}`}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <Icon className="w-6 h-6" />
                  <div>
                    <div className="font-semibold text-sm">
                      {action.label}
                    </div>
                    <div className="text-xs opacity-80 hidden sm:block">
                      {action.description}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
