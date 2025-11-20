/**
 * Sidebar Navigation Component
 *
 * Main navigation sidebar with role-based menu items.
 * Includes mobile responsive drawer functionality.
 *
 * @module components/layout/Sidebar
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home,
  Package,
  Users,
  Settings,
  TrendingUp,
  Truck,
  FileText,
  ShoppingBag,
  DollarSign,
  BarChart3,
  Calendar,
  ClipboardList,
  Boxes,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  Store,
  Wrench,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { getRoleDisplayName } from '@/lib/auth/utils';
import type { UserRole } from '@/lib/db/schema';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[]; // If undefined, accessible to all roles
  badge?: string;
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    label: 'Orders',
    href: '/orders',
    icon: Package,
    children: [
      {
        label: 'All Orders',
        href: '/orders',
        icon: Package,
      },
      {
        label: 'Create Order',
        href: '/orders/new',
        icon: ShoppingBag,
        roles: ['admin', 'director', 'general_manager', 'store_manager', 'manager', 'front_desk'],
      },
      {
        label: 'Pipeline',
        href: '/pipeline',
        icon: TrendingUp,
        roles: ['admin', 'director', 'general_manager', 'store_manager', 'workstation_manager', 'manager'],
      },
    ],
  },
  {
    label: 'Workstation',
    href: '/workstation',
    icon: Wrench,
    roles: ['admin', 'director', 'general_manager', 'store_manager', 'workstation_manager', 'workstation_staff'],
  },
  {
    label: 'Customers',
    href: '/customers',
    icon: Users,
    roles: ['admin', 'director', 'general_manager', 'store_manager', 'manager', 'front_desk'],
  },
  {
    label: 'Deliveries',
    href: '/deliveries',
    icon: Truck,
    roles: ['admin', 'director', 'general_manager', 'store_manager', 'manager', 'driver'],
  },
  {
    label: 'Inventory',
    href: '/inventory',
    icon: Boxes,
    roles: ['admin', 'director', 'general_manager', 'store_manager', 'manager'],
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: BarChart3,
    roles: ['admin', 'director', 'general_manager', 'store_manager', 'manager'],
  },
  {
    label: 'Staff',
    href: '/staff',
    icon: Calendar,
    roles: ['admin', 'director', 'general_manager', 'store_manager', 'manager'],
  },
  {
    label: 'Pricing',
    href: '/pricing',
    icon: DollarSign,
    roles: ['admin', 'director', 'general_manager', 'store_manager', 'manager'],
  },
  {
    label: 'Transactions',
    href: '/transactions',
    icon: FileText,
    roles: ['admin', 'director', 'general_manager', 'store_manager', 'manager'],
  },
  {
    label: 'Branches',
    href: '/branches',
    icon: Store,
    roles: ['admin', 'director', 'general_manager'],
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['admin', 'director', 'general_manager', 'store_manager'],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, userData, signOut } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const userRole = userData?.role;

  // Filter navigation items based on user role
  const filteredNavItems = navigationItems.filter((item) => {
    if (!item.roles) return true; // Accessible to all
    return userRole && item.roles.includes(userRole);
  });

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const hasAccessToChild = (child: NavItem) => {
    if (!child.roles) return true;
    return userRole && child.roles.includes(userRole);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">L</span>
          </div>
          <div>
            <h2 className="font-bold text-lg text-black">Lorenzo</h2>
            <p className="text-xs text-gray-500">Dry Cleaners</p>
          </div>
        </Link>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full justify-start gap-3 bg-gray-100 hover:bg-gray-200 text-black border-0">
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <p className="text-sm font-medium text-black truncate">
                  {userData?.name || user?.email || 'User'}
                </p>
                {userRole && (
                  <p className="text-xs text-gray-600">{getRoleDisplayName(userRole)}</p>
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 bg-white border-2 border-gray-200 shadow-lg">
            <DropdownMenuLabel className="bg-gray-50 font-semibold">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-200" />
            <DropdownMenuItem asChild className="focus:bg-gray-100">
              <Link href="/profile" className="cursor-pointer">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="focus:bg-gray-100">
              <Link href="/settings" className="cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-200" />
            <DropdownMenuItem onClick={() => signOut()} className="text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-700">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedItems.includes(item.label);
            const accessibleChildren = item.children?.filter(hasAccessToChild) || [];

            if (hasChildren && accessibleChildren.length === 0) {
              // Don't show parent if no accessible children
              return null;
            }

            return (
              <div key={item.label}>
                {hasChildren ? (
                  <>
                    <button
                      onClick={() => toggleExpanded(item.label)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        active
                          ? 'bg-black text-white'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                      )}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 transition-transform',
                          isExpanded && 'transform rotate-180'
                        )}
                      />
                    </button>
                    {isExpanded && (
                      <div className="ml-8 mt-1 space-y-1">
                        {accessibleChildren.map((child) => {
                          const ChildIcon = child.icon;
                          const childActive = isActive(child.href);

                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setIsMobileOpen(false)}
                              className={cn(
                                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                                childActive
                                  ? 'bg-gray-100 text-black font-medium'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                              )}
                            >
                              <ChildIcon className="w-4 h-4 flex-shrink-0" />
                              <span>{child.label}</span>
                              {child.badge && (
                                <Badge variant="secondary" className="ml-auto">
                                  {child.badge}
                                </Badge>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      active
                        ? 'bg-black text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <p>Lorenzo Dry Cleaners</p>
          <p className="mt-1">v1.0.0</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Hamburger Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-white shadow-md"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-30 bg-white border-r border-gray-200">
        <SidebarContent />
      </aside>

      {/* Sidebar - Mobile Drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:hidden',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
