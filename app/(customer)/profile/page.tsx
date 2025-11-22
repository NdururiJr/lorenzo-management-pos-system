/**
 * Customer Profile Page
 *
 * Customer can view and edit their profile information.
 *
 * @module app/(customer)/profile/page
 */

'use client';

import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { getCustomer } from '@/lib/db/customers';
import { PersonalInfoSection } from '@/components/features/customer/PersonalInfoSection';
import { AddressesSection } from '@/components/features/customer/AddressesSection';
import { PreferencesSection } from '@/components/features/customer/PreferencesSection';
import { StatisticsSection } from '@/components/features/customer/StatisticsSection';
import { ModernSection } from '@/components/modern/ModernLayout';
import { ModernCard, ModernCardContent } from '@/components/modern/ModernCard';
import { FloatingOrbs } from '@/components/auth/FloatingOrbs';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const { user } = useAuth();

  // Fetch customer data
  const { data: customer, isLoading, error, refetch } = useQuery({
    queryKey: ['customer', user?.uid],
    queryFn: async () => {
      if (!user?.uid) throw new Error('Not authenticated');
      return getCustomer(user.uid);
    },
    enabled: !!user?.uid,
  });

  if (isLoading) {
    return (
      <ModernSection animate>
        <FloatingOrbs />
        <div className="flex items-center justify-center py-12">
          <ModernCard className="p-8">
            <div className="text-center space-y-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="h-8 w-8 mx-auto text-brand-blue" />
              </motion.div>
              <p className="text-sm text-gray-600">Loading your profile...</p>
            </div>
          </ModernCard>
        </div>
      </ModernSection>
    );
  }

  if (error || !customer) {
    return (
      <ModernSection animate>
        <FloatingOrbs />
        <ModernCard className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
          <ModernCardContent className="!p-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                <UserX className="w-8 h-8 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-amber-900">
                  Customer Profile Not Found
                </h3>
                <p className="text-sm text-amber-700 mb-4">
                  {process.env.NODE_ENV === 'development'
                    ? 'Your account doesn\'t have a customer profile yet. This is normal if you\'re a staff member testing the portal.'
                    : 'We couldn\'t find your customer profile. Please contact support for assistance.'}
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Retry
                </Button>
                {process.env.NODE_ENV === 'development' && (
                  <Button
                    variant="default"
                    onClick={() => window.location.href = '/dashboard'}
                    className="bg-brand-blue hover:bg-brand-blue-dark"
                  >
                    Go to Dashboard
                  </Button>
                )}
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
      </ModernSection>
    );
  }

  return (
    <ModernSection animate>
      <FloatingOrbs />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">
          Manage your account information and preferences
        </p>
      </motion.div>

      <div className="space-y-6">
        {/* Personal Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <PersonalInfoSection customer={customer} onUpdate={refetch} />
        </motion.div>

        {/* Addresses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <AddressesSection customer={customer} onUpdate={refetch} />
        </motion.div>

        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <PreferencesSection customer={customer} onUpdate={refetch} />
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <StatisticsSection customer={customer} />
        </motion.div>
      </div>
    </ModernSection>
  );
}
