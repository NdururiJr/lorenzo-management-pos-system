'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
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
import { ModernButton } from './ModernButton';
import { ModernBadge } from './ModernBadge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  roles?: UserRole[];
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

export function ModernSidebar() {
  const pathname = usePathname();
  const { user, userData, signOut } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const userRole = userData?.role;

  // Filter navigation items based on user role
  const filteredNavItems = navigationItems.filter((item) => {
    if (!item.roles) return true;
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
      {/* Glassmorphic background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-blue/5 via-transparent to-brand-blue/5 pointer-events-none" />

      {/* Logo/Brand */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative p-6 border-b border-brand-blue/10"
      >
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="w-10 h-10 bg-gradient-to-br from-brand-blue to-brand-blue-dark rounded-2xl flex items-center justify-center shadow-glow-blue/30"
          >
            <span className="text-white font-bold text-lg">L</span>
          </motion.div>
          <div>
            <h2 className="font-bold text-lg bg-gradient-to-r from-brand-blue-dark to-brand-blue bg-clip-text text-transparent">
              Lorenzo
            </h2>
            <p className="text-xs text-gray-500">Dry Cleaners</p>
          </div>
        </Link>
      </motion.div>

      {/* User Info */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative p-4 border-b border-brand-blue/10"
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-brand-blue/10 transition-all duration-300 group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-brand-blue-dark flex items-center justify-center shadow-glow-blue/20">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {userData?.name || user?.email || 'User'}
                </p>
                {userRole && (
                  <p className="text-xs text-gray-600">{getRoleDisplayName(userRole)}</p>
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-brand-blue transition-colors" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 bg-white/95 backdrop-blur-xl border-2 border-brand-blue/20 shadow-glow-blue/10">
            <DropdownMenuLabel className="bg-gradient-to-r from-brand-blue/10 to-brand-blue/5 font-semibold">
              My Account
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-brand-blue/10" />
            <DropdownMenuItem asChild className="focus:bg-brand-blue/10 cursor-pointer">
              <Link href="/profile">
                <User className="w-4 h-4 mr-2 text-brand-blue" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="focus:bg-brand-blue/10 cursor-pointer">
              <Link href="/settings">
                <Settings className="w-4 h-4 mr-2 text-brand-blue" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-brand-blue/10" />
            <DropdownMenuItem onClick={() => signOut()} className="text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-700">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4 relative">
        <nav className="space-y-1">
          {filteredNavItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedItems.includes(item.label);
            const accessibleChildren = item.children?.filter(hasAccessToChild) || [];

            if (hasChildren && accessibleChildren.length === 0) {
              return null;
            }

            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                {hasChildren ? (
                  <>
                    <button
                      onClick={() => toggleExpanded(item.label)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300',
                        active
                          ? 'bg-gradient-to-r from-brand-blue to-brand-blue-dark text-white shadow-glow-blue/30'
                          : 'text-gray-700 hover:bg-brand-blue/10 hover:text-brand-blue'
                      )}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <ModernBadge size="sm" variant="secondary">
                          {item.badge}
                        </ModernBadge>
                      )}
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
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
                                    'flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-300',
                                    childActive
                                      ? 'bg-brand-blue/20 text-brand-blue font-medium'
                                      : 'text-gray-600 hover:bg-brand-blue/10 hover:text-brand-blue'
                                  )}
                                >
                                  <ChildIcon className="w-4 h-4 flex-shrink-0" />
                                  <span>{child.label}</span>
                                  {child.badge && (
                                    <ModernBadge size="sm" variant="secondary">
                                      {child.badge}
                                    </ModernBadge>
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300',
                      active
                        ? 'bg-gradient-to-r from-brand-blue to-brand-blue-dark text-white shadow-glow-blue/30'
                        : 'text-gray-700 hover:bg-brand-blue/10 hover:text-brand-blue'
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <ModernBadge size="sm" variant="secondary">
                        {item.badge}
                      </ModernBadge>
                    )}
                  </Link>
                )}
              </motion.div>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative p-4 border-t border-brand-blue/10"
      >
        <div className="text-xs text-gray-500 text-center">
          <p className="font-medium">Lorenzo Dry Cleaners</p>
          <p className="mt-1 text-brand-blue/60">v1.0.0</p>
        </div>
      </motion.div>
    </div>
  );

  return (
    <>
      {/* Mobile Hamburger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-white/80 backdrop-blur-xl rounded-2xl shadow-glow-blue/20 border-2 border-brand-blue/20"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="w-5 h-5 text-brand-blue" /> : <Menu className="w-5 h-5 text-brand-blue" />}
      </motion.button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-30 bg-white/80 backdrop-blur-xl border-r-2 border-brand-blue/10 shadow-glow-blue/5">
        <SidebarContent />
      </aside>

      {/* Sidebar - Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-xl border-r-2 border-brand-blue/10 shadow-glow-blue/10 lg:hidden"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}