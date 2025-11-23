/**
 * Customer Profile Page
 *
 * Allows customers to view and edit their profile information,
 * manage delivery addresses, and update preferences.
 *
 * @module app/(customer)/portal/profile/page
 */

'use client';

import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { ModernSection } from '@/components/modern/ModernLayout';
import { FloatingOrbs } from '@/components/auth/FloatingOrbs';
import { PersonalInfoSection } from '@/components/features/customer/PersonalInfoSection';
import { AddressesSection } from '@/components/features/customer/AddressesSection';
import { PreferencesSection } from '@/components/features/customer/PreferencesSection';
import { motion } from 'framer-motion';
import { User, Loader2, AlertCircle } from 'lucide-react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Customer } from '@/lib/db/schema';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();

  // Fetch customer record by email
  const {
    data: customer,
    isLoading: customerLoading,
    error,
    refetch,
  } = useQuery<Customer | null>({
    queryKey: ['customer-profile', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;

      const customersRef = collection(db, 'customers');
      const q = query(customersRef, where('email', '==', user.email), limit(1));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        return {
          customerId: snapshot.docs[0].id,
          ...snapshot.docs[0].data(),
        } as Customer;
      }
      return null;
    },
    enabled: !!user?.email,
  });

  const isLoading = authLoading || customerLoading;

  if (isLoading) {
    return (
      <ModernSection animate>
        <FloatingOrbs />
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="h-8 w-8 mx-auto text-brand-blue" />
            </motion.div>
            <p className="text-sm text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </ModernSection>
    );
  }

  // Show error if customer not found
  if (error || !customer) {
    return (
      <ModernSection animate>
        <FloatingOrbs />
        <div className="bg-white rounded-lg border border-red-200 p-8">
          <div className="text-center space-y-4">
            <div className="p-3 rounded-full bg-red-100 w-16 h-16 mx-auto flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-red-900 text-lg">
                Profile Not Found
              </h3>
              <p className="text-sm text-red-700 mt-2">
                We couldn't find your customer profile. Please contact support.
              </p>
            </div>
          </div>
        </div>
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
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand-blue to-brand-blue-dark flex items-center justify-center text-white shadow-md">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600 mt-1">
              Manage your personal information and preferences
            </p>
          </div>
        </div>
      </motion.div>

      {/* Note: Profile sections are self-contained components */}
      {/* They handle their own data fetching and state management */}

      {/* Personal Information Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-6"
      >
        <PersonalInfoSection customer={customer} onUpdate={() => refetch()} />
      </motion.div>

      {/* Delivery Addresses Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-6"
      >
        <AddressesSection customer={customer} onUpdate={() => refetch()} />
      </motion.div>

      {/* Preferences Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <PreferencesSection customer={customer} onUpdate={() => refetch()} />
      </motion.div>
    </ModernSection>
  );
}
