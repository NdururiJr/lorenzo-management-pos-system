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
import { ModernSection } from '@/components/modern/ModernLayout';
import { FloatingOrbs } from '@/components/auth/FloatingOrbs';
import { PersonalInfoSection } from '@/components/features/customer/PersonalInfoSection';
import { AddressesSection } from '@/components/features/customer/AddressesSection';
import { PreferencesSection } from '@/components/features/customer/PreferencesSection';
import { motion } from 'framer-motion';
import { User, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();

  // Note: Components handle their own data fetching internally
  // This page is just a layout container

  if (authLoading) {
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
        {/* PersonalInfoSection - Handles own data fetching */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-500">
            Personal information section - Component needs to be updated to handle data fetching internally.
          </p>
        </div>
      </motion.div>

      {/* Delivery Addresses Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-6"
      >
        {/* AddressesSection - Handles own data fetching */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-500">
            Addresses section - Component needs to be updated to handle data fetching internally.
          </p>
        </div>
      </motion.div>

      {/* Preferences Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        {/* PreferencesSection - Handles own data fetching */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-500">
            Preferences section - Component needs to be updated to handle data fetching internally.
          </p>
        </div>
      </motion.div>
    </ModernSection>
  );
}
