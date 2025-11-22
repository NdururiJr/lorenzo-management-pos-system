/**
 * Customer Sidebar Component
 *
 * Navigation sidebar for the customer portal with glassmorphic design.
 * Includes navigation links (Home, Orders, Request Pickup, Contact Us, Profile),
 * user profile, and sign out functionality.
 *
 * @module components/features/customer/CustomerSidebar
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import {
  Home,
  Package,
  User,
  LogOut,
  Menu,
  X,
  Truck,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigationItems: NavItem[] = [
  {
    label: 'Home',
    href: '/portal',
    icon: Home,
  },
  {
    label: 'Orders',
    href: '/portal/orders',
    icon: Package,
  },
  {
    label: 'Request Pickup',
    href: '/portal/request-pickup',
    icon: Truck,
  },
  {
    label: 'Contact Us',
    href: '/portal/contact',
    icon: MessageCircle,
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: User,
  },
];

export function CustomerSidebar() {
  const pathname = usePathname();
  const { user, userData, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'hidden md:flex fixed left-0 top-0 h-screen z-40 flex-col',
          'bg-white/70 backdrop-blur-xl border-r-2 border-white/60',
          'shadow-xl transition-all duration-300',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="p-6 border-b border-gray-200/50">
            <Link href="/portal" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-blue to-brand-blue-dark flex items-center justify-center text-white font-bold text-lg shadow-md">
                L
              </div>
              {!isCollapsed && (
                <div>
                  <h1 className="font-bold text-lg text-gray-900">Lorenzo</h1>
                  <p className="text-xs text-gray-600">Dry Cleaners</p>
                </div>
              )}
            </Link>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
                        'hover:bg-brand-blue/10 group relative',
                        isActive
                          ? 'bg-brand-blue text-white shadow-md'
                          : 'text-gray-700 hover:text-brand-blue'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-5 w-5 flex-shrink-0',
                          isActive ? 'text-white' : 'text-gray-600 group-hover:text-brand-blue'
                        )}
                      />
                      {!isCollapsed && (
                        <span className="font-medium text-sm">{item.label}</span>
                      )}
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute inset-0 bg-brand-blue rounded-xl -z-10"
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200/50">
            <div className={cn('flex items-center gap-3', isCollapsed && 'justify-center')}>
              <Avatar className="h-10 w-10 border-2 border-brand-blue/20">
                <AvatarFallback className="bg-gradient-to-br from-brand-blue to-brand-blue-dark text-white font-semibold">
                  {userData?.name?.charAt(0).toUpperCase() || 'C'}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {userData?.name || 'Customer'}
                  </p>
                  <p className="text-xs text-gray-600">Customer</p>
                </div>
              )}
            </div>

            {/* Sign Out Button */}
            {!isCollapsed && (
              <button
                onClick={handleSignOut}
                className="w-full mt-3 flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            )}
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-6 h-6 w-6 rounded-full bg-white border-2 border-brand-blue/20 flex items-center justify-center hover:bg-brand-blue hover:text-white transition-colors shadow-md"
          >
            {isCollapsed ? (
              <Menu className="h-3 w-3" />
            ) : (
              <X className="h-3 w-3" />
            )}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
