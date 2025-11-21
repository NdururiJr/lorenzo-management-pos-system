/**
 * Dashboard Home Page
 *
 * Modern dashboard with glassmorphic cards and blue theme.
 * Features animated stat cards and role-based access display.
 *
 * @module app/(dashboard)/dashboard/page
 */

'use client';

import { useAuth } from '@/hooks/useAuth';
import { getRoleDisplayName } from '@/lib/auth/utils';
import { getAllowedBranchesArray } from '@/lib/auth/branch-access';
import {
  getTodayOrdersCountForBranches,
  getPendingOrdersCountForBranches,
  getCompletedTodayCountForBranches,
  getTodayRevenueForBranches,
} from '@/lib/db/orders';
import { ModernButton } from '@/components/modern/ModernButton';
import { ModernCard, ModernCardContent, ModernCardHeader } from '@/components/modern/ModernCard';
import { ModernBadge, StatusBadge } from '@/components/modern/ModernBadge';
import { ModernStatCard, StatCardGroup } from '@/components/modern/ModernStatCard';
import { ModernSection, ModernGrid } from '@/components/modern/ModernLayout';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  LogOut, User, Mail, Phone, Building2, Shield,
  Package, TrendingUp, Users, CheckCircle,
  Clock, DollarSign, Truck, Star, Loader2
} from 'lucide-react';

export default function DashboardPage() {
  const { user, userData, signOut, isAdmin, isManager, isStaff, isCustomer } = useAuth();

  // Get allowed branches for the user (safe to call even if userData is null)
  const allowedBranches = userData ? getAllowedBranchesArray(userData) : [];

  // Fetch real-time stats with branch filtering
  // NOTE: These hooks must be called before any early returns (React rules of hooks)
  const { data: todayOrders = 0, isLoading: loadingToday } = useQuery({
    queryKey: ['dashboard-today-orders', allowedBranches],
    queryFn: () => getTodayOrdersCountForBranches(allowedBranches),
    enabled: !!userData,
  });

  const { data: pendingOrders = 0, isLoading: loadingPending } = useQuery({
    queryKey: ['dashboard-pending-orders', allowedBranches],
    queryFn: () => getPendingOrdersCountForBranches(allowedBranches),
    enabled: !!userData,
  });

  const { data: completedToday = 0, isLoading: loadingCompleted } = useQuery({
    queryKey: ['dashboard-completed-today', allowedBranches],
    queryFn: () => getCompletedTodayCountForBranches(allowedBranches),
    enabled: !!userData,
  });

  const { data: revenue = 0, isLoading: loadingRevenue } = useQuery({
    queryKey: ['dashboard-revenue-today', allowedBranches],
    queryFn: () => getTodayRevenueForBranches(allowedBranches),
    enabled: !!userData,
  });

  const isLoadingStats = loadingToday || loadingPending || loadingCompleted || loadingRevenue;

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (_error) {
      toast.error('Failed to sign out');
    }
  };

  if (!user || !userData) {
    return null;
  }

  const initials = userData.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const stats = {
    todayOrders,
    pendingOrders,
    completedToday,
    revenue,
  };

  return (
    <ModernSection animate>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-blue-dark via-brand-blue to-brand-blue-dark bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {userData.name}!
          </p>
        </div>
        <ModernButton
          onClick={handleSignOut}
          variant="secondary"
          leftIcon={<LogOut className="h-4 w-4" />}
        >
          Sign Out
        </ModernButton>
      </motion.div>

      {/* Quick Stats */}
      {isLoadingStats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <ModernCard key={i} className="h-32">
              <ModernCardContent className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-brand-blue" />
              </ModernCardContent>
            </ModernCard>
          ))}
        </div>
      ) : (
        <StatCardGroup className="mb-8">
          <ModernStatCard
            title="Today's Orders"
            value={stats.todayOrders}
            changeLabel="Orders received today"
            icon={<Package className="h-5 w-5" />}
            delay={0.1}
          />
          <ModernStatCard
            title="Pending Orders"
            value={stats.pendingOrders}
            changeLabel="In progress"
            icon={<Clock className="h-5 w-5" />}
            delay={0.2}
            variant="gradient"
          />
          <ModernStatCard
            title="Completed Today"
            value={stats.completedToday}
            changeLabel="Delivered/Collected"
            icon={<CheckCircle className="h-5 w-5" />}
            delay={0.3}
          />
          <ModernStatCard
            title="Today's Revenue"
            value={stats.revenue}
            changeLabel="Total payments"
            icon={<DollarSign className="h-5 w-5" />}
            format="currency"
            delay={0.4}
            variant="solid"
          />
        </StatCardGroup>
      )}

      <ModernGrid columns={2} gap="lg" className="mb-8">
        {/* User Profile Card */}
        <ModernCard delay={0.5} hover glowIntensity="medium">
          <ModernCardHeader>
            <h2 className="text-xl font-bold text-gray-900">Your Profile</h2>
            <p className="text-sm text-gray-600">Account information and role</p>
          </ModernCardHeader>
          <ModernCardContent className="space-y-6">
            {/* Avatar and Name */}
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
              >
                <Avatar className="h-20 w-20 border-4 border-brand-blue/20 shadow-glow-blue/20">
                  <AvatarFallback className="bg-gradient-to-br from-brand-blue to-brand-blue-dark text-white text-lg font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{userData.name}</h2>
                <ModernBadge variant="primary" gradient>
                  {getRoleDisplayName(userData.role)}
                </ModernBadge>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-brand-blue/20 to-transparent" />

            {/* User Details Grid */}
            <div className="grid gap-4">
              <motion.div
                className="flex items-center space-x-3 text-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="p-2 rounded-xl bg-brand-blue/10">
                  <User className="h-4 w-4 text-brand-blue" />
                </div>
                <div>
                  <p className="text-gray-500">User ID</p>
                  <p className="font-mono text-gray-900">{userData.uid.slice(0, 20)}...</p>
                </div>
              </motion.div>

              {userData.email && (
                <motion.div
                  className="flex items-center space-x-3 text-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="p-2 rounded-xl bg-brand-blue/10">
                    <Mail className="h-4 w-4 text-brand-blue" />
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="text-gray-900">{userData.email}</p>
                  </div>
                </motion.div>
              )}

              <motion.div
                className="flex items-center space-x-3 text-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
              >
                <div className="p-2 rounded-xl bg-brand-blue/10">
                  <Phone className="h-4 w-4 text-brand-blue" />
                </div>
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="text-gray-900">{userData.phone}</p>
                </div>
              </motion.div>

              {userData.branchId && (
                <motion.div
                  className="flex items-center space-x-3 text-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0 }}
                >
                  <div className="p-2 rounded-xl bg-brand-blue/10">
                    <Building2 className="h-4 w-4 text-brand-blue" />
                  </div>
                  <div>
                    <p className="text-gray-500">Branch</p>
                    <p className="text-gray-900">{userData.branchId}</p>
                  </div>
                </motion.div>
              )}

              <motion.div
                className="flex items-center space-x-3 text-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 }}
              >
                <div className="p-2 rounded-xl bg-brand-blue/10">
                  <Shield className="h-4 w-4 text-brand-blue" />
                </div>
                <div className="flex items-center space-x-2">
                  <p className="text-gray-500">Status:</p>
                  <StatusBadge status={userData.isActive ? 'active' : 'inactive'} />
                </div>
              </motion.div>
            </div>
          </ModernCardContent>
        </ModernCard>

        {/* Access Permissions Card */}
        <ModernCard delay={0.6} hover glowIntensity="medium">
          <ModernCardHeader>
            <h2 className="text-xl font-bold text-gray-900">Access Permissions</h2>
            <p className="text-sm text-gray-600">Features available based on your role</p>
          </ModernCardHeader>
          <ModernCardContent>
            <div className="space-y-3">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                className={`flex items-center justify-between p-4 rounded-2xl ${
                  isAdmin
                    ? 'bg-gradient-to-r from-brand-blue/10 to-brand-blue/5 border border-brand-blue/20'
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Star className={`h-5 w-5 ${isAdmin ? 'text-brand-blue' : 'text-gray-400'}`} />
                  <span className="text-sm font-medium text-gray-900">Administrator Access</span>
                </div>
                <ModernBadge variant={isAdmin ? 'primary' : 'secondary'} size="sm">
                  {isAdmin ? 'Granted' : 'Not Available'}
                </ModernBadge>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className={`flex items-center justify-between p-4 rounded-2xl ${
                  isManager || isAdmin
                    ? 'bg-gradient-to-r from-brand-blue/10 to-brand-blue/5 border border-brand-blue/20'
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <TrendingUp className={`h-5 w-5 ${isManager || isAdmin ? 'text-brand-blue' : 'text-gray-400'}`} />
                  <span className="text-sm font-medium text-gray-900">Manager Access</span>
                </div>
                <ModernBadge variant={isManager || isAdmin ? 'primary' : 'secondary'} size="sm">
                  {isManager || isAdmin ? 'Granted' : 'Not Available'}
                </ModernBadge>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 }}
                className={`flex items-center justify-between p-4 rounded-2xl ${
                  isStaff
                    ? 'bg-gradient-to-r from-brand-blue/10 to-brand-blue/5 border border-brand-blue/20'
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Users className={`h-5 w-5 ${isStaff ? 'text-brand-blue' : 'text-gray-400'}`} />
                  <span className="text-sm font-medium text-gray-900">Staff Access</span>
                </div>
                <ModernBadge variant={isStaff ? 'primary' : 'secondary'} size="sm">
                  {isStaff ? 'Granted' : 'Not Available'}
                </ModernBadge>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0 }}
                className={`flex items-center justify-between p-4 rounded-2xl ${
                  isCustomer
                    ? 'bg-gradient-to-r from-brand-blue/10 to-brand-blue/5 border border-brand-blue/20'
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Package className={`h-5 w-5 ${isCustomer ? 'text-brand-blue' : 'text-gray-400'}`} />
                  <span className="text-sm font-medium text-gray-900">Customer Access</span>
                </div>
                <ModernBadge variant={isCustomer ? 'primary' : 'secondary'} size="sm">
                  {isCustomer ? 'Granted' : 'Not Available'}
                </ModernBadge>
              </motion.div>
            </div>
          </ModernCardContent>
        </ModernCard>
      </ModernGrid>

      {/* Quick Actions */}
      <ModernCard delay={0.7} className="bg-gradient-to-br from-brand-blue/10 to-brand-blue/5">
        <ModernCardContent className="py-8">
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
              className="inline-flex p-4 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/30"
            >
              <CheckCircle className="h-8 w-8 text-white" />
            </motion.div>
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                Authentication System Active
              </h3>
              <p className="text-sm text-gray-600 mt-1 max-w-md mx-auto">
                Your authentication system is working correctly. You are logged in and authenticated with full access to your role's features.
              </p>
            </div>
            <div className="flex gap-4 justify-center pt-4">
              <ModernButton
                variant="primary"
                leftIcon={<Package className="h-4 w-4" />}
                onClick={() => window.location.href = '/pos'}
              >
                New Order
              </ModernButton>
              <ModernButton
                variant="secondary"
                leftIcon={<Users className="h-4 w-4" />}
                onClick={() => window.location.href = '/customers'}
              >
                View Customers
              </ModernButton>
              <ModernButton
                variant="ghost"
                leftIcon={<Truck className="h-4 w-4" />}
                onClick={() => window.location.href = '/deliveries'}
              >
                Deliveries
              </ModernButton>
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>
    </ModernSection>
  );
}