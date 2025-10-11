'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserMenu } from '@/components/ui/user-menu';

/**
 * Navigation menu item
 */
export interface NavItem {
  /**
   * Display label
   */
  label: string;
  /**
   * Link href
   */
  href: string;
  /**
   * Icon component from lucide-react
   */
  icon: LucideIcon;
  /**
   * Required role (optional)
   */
  role?: string[];
}

/**
 * User information
 */
interface UserInfo {
  name: string;
  email: string;
  role?: string;
}

/**
 * Props for the DashboardSidebar component
 */
interface DashboardSidebarProps {
  /**
   * Navigation items
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
   * Whether the sidebar is open (mobile)
   */
  isOpen?: boolean;
  /**
   * Close sidebar callback (mobile)
   */
  onClose?: () => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * DashboardSidebar component - sidebar navigation for dashboard
 *
 * @example
 * ```tsx
 * <DashboardSidebar
 *   navItems={[
 *     { label: 'Dashboard', href: '/dashboard', icon: Home },
 *     { label: 'Orders', href: '/dashboard/orders', icon: Package }
 *   ]}
 *   user={{ name: 'John Doe', email: 'john@example.com' }}
 *   onSignOut={handleSignOut}
 * />
 * ```
 */
export function DashboardSidebar({
  navItems,
  user,
  onSignOut,
  isOpen = true,
  onClose,
  className,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  // Filter nav items by user role
  const filteredNavItems = navItems.filter((item) => {
    if (!item.role) return true;
    if (!user.role) return false;
    return item.role.includes(user.role);
  });

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0',
          !isOpen && '-translate-x-full',
          className
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-black">
              Lorenzo Dry Cleaners
            </h2>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200">
            <UserMenu user={user} onSignOut={onSignOut} />
          </div>
        </div>
      </aside>
    </>
  );
}
