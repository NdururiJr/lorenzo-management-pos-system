/**
 * Mobile Bottom Navigation Component
 *
 * Fixed bottom navigation for mobile devices.
 * Hidden on desktop (screens >= 768px).
 *
 * @module components/features/customer/MobileBottomNav
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Package, User } from 'lucide-react';

const NAV_ITEMS = [
  {
    href: '/portal',
    label: 'Home',
    icon: Home,
  },
  {
    href: '/portal/orders',
    label: 'Orders',
    icon: Package,
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: User,
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden z-50">
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/portal' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                isActive ? 'text-black' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive && 'fill-black')} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
