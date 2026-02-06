/**
 * Branch Info Card Component
 *
 * Displays branch information for an order including name, address,
 * contact details, and operating hours fetched from branch config.
 *
 * Issue 82 Fix: Operating hours are now dynamically fetched from branch config
 * instead of being hardcoded.
 *
 * @module components/features/customer/BranchInfoCard
 */

'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { MapPin, Phone, Clock } from 'lucide-react';
import { getBranchData } from '@/lib/utils/branch-lookup';
import { getBranchOperatingHours, DEFAULT_OPERATING_HOURS } from '@/lib/db/company-settings';
import type { Branch, BranchOperatingHours } from '@/lib/db/schema';

interface BranchInfoCardProps {
  branchId: string;
}

/**
 * Format time from 24h format (HH:MM) to 12h format (H:MM AM/PM)
 */
function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Format operating hours for a day
 */
function formatDayHours(hours: { open: string; close: string } | null): string {
  if (!hours) return 'Closed';
  return `${formatTime(hours.open)} - ${formatTime(hours.close)}`;
}

export function BranchInfoCard({ branchId }: BranchInfoCardProps) {
  const [branch, setBranch] = useState<Branch | null>(null);
  const [operatingHours, setOperatingHours] = useState<BranchOperatingHours>(DEFAULT_OPERATING_HOURS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBranchData() {
      setIsLoading(true);
      try {
        // Fetch branch data and operating hours in parallel
        const [branchData, hours] = await Promise.all([
          getBranchData(branchId),
          getBranchOperatingHours(branchId)
        ]);
        setBranch(branchData);
        setOperatingHours(hours);
      } catch (error) {
        console.error('Failed to fetch branch data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (branchId) {
      fetchBranchData();
    }
  }, [branchId]);

  if (isLoading) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Branch Information</h2>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
        </div>
      </Card>
    );
  }

  if (!branch) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Branch Information</h2>
        <p className="text-gray-500">Branch information unavailable</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Branch Information</h2>

      <div className="space-y-4">
        {/* Branch Name */}
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Branch</p>
          <p className="font-medium text-gray-900">{branch.name}</p>
          <span className="inline-block px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded mt-1">
            {branch.branchType === 'main' ? 'Main Store' : 'Satellite'}
          </span>
        </div>

        {/* Address */}
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Address</p>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-900">
              {branch.location.address}
            </p>
          </div>
        </div>

        {/* Contact Phone */}
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Contact</p>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <a
              href={`tel:${branch.contactPhone}`}
              className="text-sm text-brand-blue hover:underline"
            >
              {branch.contactPhone}
            </a>
          </div>
        </div>

        {/* Operating Hours (Issue 82 Fix: dynamically fetched from branch config) */}
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Hours</p>
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
            <div className="text-sm text-gray-900">
              {operatingHours.is24Hours ? (
                <p className="font-medium text-green-600">Open 24 Hours</p>
              ) : (
                <>
                  <p>Mon - Fri: {formatDayHours(operatingHours.weekday)}</p>
                  <p>Sat: {formatDayHours(operatingHours.saturday)}</p>
                  <p>Sun: {formatDayHours(operatingHours.sunday)}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
