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
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-black" />
          <p className="text-sm text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load profile. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-sm text-gray-600">
          Manage your account information and preferences
        </p>
      </div>

      {/* Personal Information */}
      <PersonalInfoSection customer={customer} onUpdate={refetch} />

      {/* Addresses */}
      <AddressesSection customer={customer} onUpdate={refetch} />

      {/* Preferences */}
      <PreferencesSection customer={customer} onUpdate={refetch} />

      {/* Statistics */}
      <StatisticsSection customer={customer} />
    </div>
  );
}
