'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardSidebar, NavItem } from './DashboardSidebar';
import { cn } from '@/lib/utils';

/**
 * User information
 */
interface UserInfo {
  name: string;
  email: string;
  role?: string;
}

/**
 * Props for the DashboardLayout component
 */
interface DashboardLayoutProps {
  /**
   * Navigation items for sidebar
   */
  navItems: NavItem[];
  /**
   * Current user information
   */
  user: UserInfo;
  /**
   * Sign out callback
   */
  onSignOut: () => void;
  /**
   * Page content
   */
  children: React.ReactNode;
  /**
   * Additional CSS classes for content area
   */
  className?: string;
}

/**
 * DashboardLayout component - complete dashboard layout with sidebar and content area
 *
 * @example
 * ```tsx
 * <DashboardLayout
 *   navItems={navigationItems}
 *   user={currentUser}
 *   onSignOut={handleSignOut}
 * >
 *   <PageHeader title="Dashboard" />
 *   <div>Your dashboard content...</div>
 * </DashboardLayout>
 * ```
 */
export function DashboardLayout({
  navItems,
  user,
  onSignOut,
  children,
  className,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <DashboardSidebar
        navItems={navItems}
        user={user}
        onSignOut={onSignOut}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-black">
              Lorenzo Dry Cleaners
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={sidebarOpen}
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className={cn('min-h-screen', className)}>
          {children}
        </main>
      </div>
    </div>
  );
}
