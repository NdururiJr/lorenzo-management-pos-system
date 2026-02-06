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
  Boxes,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  Store,
  Wrench,
  Building2,
  Shield,
  Target,
  Activity,
  PieChart,
  Clock,
  AlertTriangle,
  PhoneForwarded,
  Wallet,
  ClipboardCheck,
  MapPin,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
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

// Director-specific navigation - Strategic oversight (9 items)
const directorNavigationItems: NavItem[] = [
  {
    label: 'Executive Overview',
    href: '/dashboard',
    icon: Home,
  },
  {
    label: 'Branch Performance',
    href: '/director/branches',
    icon: Building2,
  },
  {
    label: 'Financial Overview',
    href: '/director/financials',
    icon: DollarSign,
  },
  {
    label: 'Staff Overview',
    href: '/director/staff',
    icon: Users,
  },
  {
    label: 'Strategic Reports',
    href: '/director/reports',
    icon: PieChart,
  },
  {
    label: 'Quality Metrics',
    href: '/director/quality',
    icon: Target,
  },
  {
    label: 'Approvals',
    href: '/director/approvals',
    icon: Shield,
    badge: 'New',
  },
  {
    label: 'AI Insights',
    href: '/director/insights',
    icon: Activity,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

// GM-specific navigation - Operational management (7 items)
const gmNavigationItems: NavItem[] = [
  {
    label: 'Overview',
    href: '/dashboard',
    icon: Home,
  },
  {
    label: 'Live Orders',
    href: '/gm/orders',
    icon: Package,
    badge: 'Live',
  },
  {
    label: 'Staff',
    href: '/gm/staff',
    icon: Users,
  },
  {
    label: 'Equipment',
    href: '/gm/equipment',
    icon: Wrench,
  },
  {
    label: 'Performance',
    href: '/gm/performance',
    icon: BarChart3,
  },
  {
    label: 'My Requests',
    href: '/gm/requests',
    icon: Shield,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

// Finance Manager navigation - Financial oversight
const financeNavigationItems: NavItem[] = [
  {
    label: 'Finance Dashboard',
    href: '/finance',
    icon: DollarSign,
  },
  {
    label: 'Cash Outs',
    href: '/finance/cash-out',
    icon: Wallet,
    badge: 'New',
  },
  {
    label: 'Uncollected Orders',
    href: '/finance/uncollected',
    icon: AlertTriangle,
  },
  {
    label: 'Transactions',
    href: '/transactions',
    icon: FileText,
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: BarChart3,
  },
  {
    label: 'Audit Logs',
    href: '/auditor/audit-logs',
    icon: ClipboardCheck,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

// Auditor navigation - Read-only oversight
const auditorNavigationItems: NavItem[] = [
  {
    label: 'Auditor Dashboard',
    href: '/auditor',
    icon: Eye,
  },
  {
    label: 'Audit Logs',
    href: '/auditor/audit-logs',
    icon: ClipboardCheck,
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: BarChart3,
  },
  {
    label: 'Finance Overview',
    href: '/finance',
    icon: DollarSign,
  },
  {
    label: 'Inventory',
    href: '/inventory',
    icon: Boxes,
  },
  {
    label: 'Transactions',
    href: '/transactions',
    icon: FileText,
  },
];

// Logistics Manager navigation - Delivery management
const logisticsNavigationItems: NavItem[] = [
  {
    label: 'Logistics Dashboard',
    href: '/logistics',
    icon: Truck,
  },
  {
    label: 'Deliveries',
    href: '/deliveries',
    icon: MapPin,
  },
  {
    label: 'Pickups',
    href: '/pickups',
    icon: Package,
  },
  {
    label: 'Drivers',
    href: '/drivers',
    icon: Users,
  },
  {
    label: 'All Orders',
    href: '/orders',
    icon: Package,
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: BarChart3,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

// Standard staff navigation - Operational access
const navigationItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    label: 'POS',
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
        href: '/pos',
        icon: ShoppingBag,
        roles: [
          'admin',
          'store_manager',
          'manager',
          'front_desk',
        ],
      },
      {
        label: 'Pipeline',
        href: '/pipeline',
        icon: TrendingUp,
        roles: [
          'admin',
          'store_manager',
          'workstation_manager',
          'manager',
        ],
      },
      {
        label: 'Quotations',
        href: '/quotations',
        icon: FileText,
        roles: [
          'admin',
          'director',
          'general_manager',
          'store_manager',
          'front_desk',
        ],
      },
    ],
  },
  {
    label: 'Workstation',
    href: '/workstation',
    icon: Wrench,
    roles: [
      'admin',
      'store_manager',
      'workstation_manager',
      'workstation_staff',
    ],
  },
  {
    label: 'Customer Service',
    href: '/customer-service',
    icon: PhoneForwarded,
    roles: [
      'admin',
      'store_manager',
      'manager',
      'front_desk',
    ],
  },
  {
    label: 'Customers',
    href: '/customers',
    icon: Users,
    roles: [
      'admin',
      'store_manager',
      'manager',
      'front_desk',
    ],
  },
  {
    label: 'Deliveries',
    href: '/deliveries',
    icon: Truck,
    roles: [
      'admin',
      'store_manager',
      'manager',
      'driver',
      'logistics_manager',
    ],
  },
  {
    label: 'Inventory',
    href: '/inventory',
    icon: Boxes,
    roles: ['admin', 'store_manager', 'manager', 'auditor'],
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: BarChart3,
    roles: ['admin', 'store_manager', 'manager', 'finance_manager', 'auditor', 'logistics_manager'],
  },
  {
    label: 'Staff',
    href: '/employees',
    icon: Calendar,
    roles: ['admin', 'store_manager', 'manager'],
  },
  {
    label: 'Pricing',
    href: '/pricing',
    icon: DollarSign,
    roles: ['admin', 'store_manager', 'manager'],
  },
  {
    label: 'Transactions',
    href: '/transactions',
    icon: FileText,
    roles: ['admin', 'store_manager', 'manager', 'finance_manager', 'auditor'],
  },
  {
    label: 'Branches',
    href: '/branches',
    icon: Store,
    roles: ['admin'],
  },
  {
    label: 'User Management',
    href: '/admin/users',
    icon: Users,
    roles: ['admin', 'director'],
  },
  {
    label: 'System Settings',
    href: '/admin/settings',
    icon: Shield,
    roles: ['admin', 'director'],
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['admin', 'store_manager'],
  },
];

export function ModernSidebar() {
  const pathname = usePathname();
  const { user, userData, signOut } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const userRole = userData?.role;

  // Get navigation items based on user role
  const getNavigationItems = (): NavItem[] => {
    if (userRole === 'director') {
      return directorNavigationItems;
    }
    if (userRole === 'general_manager') {
      return gmNavigationItems;
    }
    if (userRole === 'finance_manager') {
      return financeNavigationItems;
    }
    if (userRole === 'auditor') {
      return auditorNavigationItems;
    }
    if (userRole === 'logistics_manager') {
      return logisticsNavigationItems;
    }
    // Default staff navigation with role filtering
    return navigationItems.filter((item) => {
      if (!item.roles) return true;
      return userRole && item.roles.includes(userRole);
    });
  };

  const filteredNavItems = getNavigationItems();

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
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

  // Check if user is director for dark theme
  const isDirector = userRole === 'director';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Glassmorphic background overlay */}
      <div className={cn(
        "absolute inset-0 pointer-events-none",
        isDirector
          ? "bg-gradient-to-b from-lorenzo-accent-teal/5 via-transparent to-lorenzo-gold/5"
          : "bg-linear-to-b from-lorenzo-teal/5 via-transparent to-lorenzo-teal/5"
      )} />

      {/* Logo/Brand */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "relative p-6 border-b",
          isDirector
            ? "border-white/10 bg-gradient-to-br from-[#0A1A1F] to-[#0D2329]"
            : "border-lorenzo-teal/10 bg-linear-to-br from-lorenzo-dark-teal to-lorenzo-deep-teal"
        )}
      >
        <Link href="/dashboard" className="flex flex-col">
          <span className="text-2xl tracking-[0.25em] text-white font-light">
            LORENZO
          </span>
          <span className={cn(
            "text-[10px] tracking-[0.3em] uppercase mt-1",
            isDirector ? "text-lorenzo-gold/80" : "text-lorenzo-accent-teal/80"
          )}>
            {isDirector ? 'Executive Portal' : 'Dry Cleaners'}
          </span>
        </Link>
      </motion.div>

      {/* User Info */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={cn(
          "relative p-4 border-b",
          isDirector ? "border-white/10" : "border-lorenzo-teal/10"
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-2xl backdrop-blur-sm transition-all duration-300 group",
              isDirector
                ? "bg-white/5 hover:bg-white/10"
                : "bg-white/50 hover:bg-lorenzo-teal/10"
            )}>
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-lorenzo-gold to-lorenzo-gold-dark flex items-center justify-center shadow-glow-gold/20">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <p className={cn(
                  "text-sm font-medium truncate",
                  isDirector ? "text-white" : "text-gray-900"
                )}>
                  {userData?.name || user?.email || 'User'}
                </p>
                {userRole && (
                  <p className={cn(
                    "text-xs",
                    isDirector ? "text-lorenzo-gold" : "text-gray-600"
                  )}>
                    {getRoleDisplayName(userRole)}
                  </p>
                )}
              </div>
              <ChevronDown className={cn(
                "w-4 h-4 transition-colors",
                isDirector
                  ? "text-white/50 group-hover:text-white"
                  : "text-gray-500 group-hover:text-lorenzo-teal"
              )} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className={cn(
              "w-56 backdrop-blur-xl border-2",
              isDirector
                ? "bg-[#0D2329]/95 border-white/10"
                : "bg-white/95 border-lorenzo-teal/20 shadow-glow-teal/10"
            )}
          >
            <DropdownMenuLabel className={cn(
              "font-semibold",
              isDirector
                ? "bg-gradient-to-r from-white/10 to-white/5 text-white"
                : "bg-linear-to-r from-lorenzo-teal/10 to-lorenzo-teal/5"
            )}>
              My Account
            </DropdownMenuLabel>
            <DropdownMenuSeparator className={isDirector ? "bg-white/10" : "bg-lorenzo-teal/10"} />
            <DropdownMenuItem
              asChild
              className={cn(
                "cursor-pointer",
                isDirector
                  ? "text-white/80 focus:bg-white/10 focus:text-white"
                  : "focus:bg-lorenzo-teal/10"
              )}
            >
              <Link href="/profile">
                <User className={cn("w-4 h-4 mr-2", isDirector ? "text-lorenzo-accent-teal" : "text-lorenzo-teal")} />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              asChild
              className={cn(
                "cursor-pointer",
                isDirector
                  ? "text-white/80 focus:bg-white/10 focus:text-white"
                  : "focus:bg-lorenzo-teal/10"
              )}
            >
              <Link href="/settings">
                <Settings className={cn("w-4 h-4 mr-2", isDirector ? "text-lorenzo-accent-teal" : "text-lorenzo-teal")} />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className={isDirector ? "bg-white/10" : "bg-lorenzo-teal/10"} />
            <DropdownMenuItem
              onClick={() => signOut()}
              className="text-red-400 cursor-pointer focus:bg-red-500/10 focus:text-red-300"
            >
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
            const accessibleChildren =
              item.children?.filter(hasAccessToChild) || [];

            if (hasChildren && accessibleChildren.length === 0) {
              return null;
            }

            // Director dark theme badge
            const DirectorBadge = ({ children }: { children: React.ReactNode }) => (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-lorenzo-gold/20 text-lorenzo-gold border border-lorenzo-gold/30">
                {children}
              </span>
            );

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
                        isDirector
                          ? active
                            ? 'bg-gradient-to-r from-lorenzo-accent-teal/30 to-lorenzo-accent-teal/10 text-white border border-lorenzo-accent-teal/30'
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                          : active
                            ? 'bg-linear-to-r from-lorenzo-accent-teal to-lorenzo-light-teal text-lorenzo-dark-teal shadow-glow-teal/30'
                            : 'text-gray-700 hover:bg-lorenzo-teal/10 hover:text-lorenzo-teal'
                      )}
                    >
                      <Icon className={cn("w-5 h-5 shrink-0", isDirector && active && "text-lorenzo-accent-teal")} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        isDirector ? (
                          <DirectorBadge>{item.badge}</DirectorBadge>
                        ) : (
                          <ModernBadge size="sm" variant="secondary">
                            {item.badge}
                          </ModernBadge>
                        )
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
                                    isDirector
                                      ? childActive
                                        ? 'bg-lorenzo-accent-teal/20 text-lorenzo-accent-teal font-medium'
                                        : 'text-white/60 hover:bg-white/10 hover:text-white'
                                      : childActive
                                        ? 'bg-lorenzo-teal/20 text-lorenzo-teal font-medium'
                                        : 'text-gray-600 hover:bg-lorenzo-teal/10 hover:text-lorenzo-teal'
                                  )}
                                >
                                  <ChildIcon className="w-4 h-4 shrink-0" />
                                  <span>{child.label}</span>
                                  {child.badge && (
                                    isDirector ? (
                                      <DirectorBadge>{child.badge}</DirectorBadge>
                                    ) : (
                                      <ModernBadge size="sm" variant="secondary">
                                        {child.badge}
                                      </ModernBadge>
                                    )
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
                      isDirector
                        ? active
                          ? 'bg-gradient-to-r from-lorenzo-accent-teal/30 to-lorenzo-accent-teal/10 text-white border border-lorenzo-accent-teal/30'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                        : active
                          ? 'bg-linear-to-r from-lorenzo-accent-teal to-lorenzo-light-teal text-lorenzo-dark-teal shadow-glow-teal/30'
                          : 'text-gray-700 hover:bg-lorenzo-teal/10 hover:text-lorenzo-teal'
                    )}
                  >
                    <Icon className={cn("w-5 h-5 shrink-0", isDirector && active && "text-lorenzo-accent-teal")} />
                    <span>{item.label}</span>
                    {item.badge && (
                      isDirector ? (
                        <DirectorBadge>{item.badge}</DirectorBadge>
                      ) : (
                        <ModernBadge size="sm" variant="secondary">
                          {item.badge}
                        </ModernBadge>
                      )
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
        className={cn(
          "relative p-4 border-t",
          isDirector ? "border-white/10" : "border-lorenzo-teal/10"
        )}
      >
        <div className={cn(
          "text-xs text-center",
          isDirector ? "text-white/50" : "text-gray-500"
        )}>
          <p className="font-medium">Lorenzo Dry Cleaners</p>
          <p className={cn(
            "mt-1",
            isDirector ? "text-lorenzo-gold/60" : "text-lorenzo-teal/60"
          )}>v1.0.0</p>
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
        className={cn(
          "fixed top-4 left-4 z-50 lg:hidden p-2 backdrop-blur-xl rounded-2xl border-2",
          isDirector
            ? "bg-[#0D2329]/80 border-white/10"
            : "bg-white/80 shadow-glow-teal/20 border-lorenzo-teal/20"
        )}
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <X className={cn("w-5 h-5", isDirector ? "text-white" : "text-lorenzo-teal")} />
        ) : (
          <Menu className={cn("w-5 h-5", isDirector ? "text-white" : "text-lorenzo-teal")} />
        )}
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
      <aside className={cn(
        "hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-30 backdrop-blur-xl border-r-2",
        isDirector
          ? "bg-gradient-to-b from-[#0A1A1F] to-[#0D2329] border-white/10"
          : "bg-white/80 border-lorenzo-teal/10 shadow-glow-teal/5"
      )}>
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
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-64 backdrop-blur-xl border-r-2 lg:hidden",
              isDirector
                ? "bg-gradient-to-b from-[#0A1A1F]/95 to-[#0D2329]/95 border-white/10"
                : "bg-white/95 border-lorenzo-teal/10 shadow-glow-teal/10"
            )}
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
