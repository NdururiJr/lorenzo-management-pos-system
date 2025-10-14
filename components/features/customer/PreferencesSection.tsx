/**
 * Preferences Section Component
 *
 * Manages customer notification preferences.
 *
 * @module components/features/customer/PreferencesSection
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { updateCustomerPreferences } from '@/lib/db/customers';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import type { Customer } from '@/lib/db/schema';

interface PreferencesSectionProps {
  customer: Customer;
  onUpdate: () => void;
}

export function PreferencesSection({
  customer,
  onUpdate,
}: PreferencesSectionProps) {
  const [notifications, setNotifications] = useState(
    customer.preferences?.notifications ?? true
  );
  const [language, setLanguage] = useState(
    customer.preferences?.language || 'en'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleNotificationsChange = (value: boolean) => {
    setNotifications(value);
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      await updateCustomerPreferences(customer.customerId, {
        notifications,
        language,
      });

      toast.success('Preferences updated successfully');
      setHasChanges(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Notification Preferences</h2>

      <div className="space-y-6">
        {/* All Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex-1 pr-4">
            <Label htmlFor="notifications" className="text-base">
              Enable Notifications
            </Label>
            <p className="text-sm text-gray-600 mt-1">
              Receive order updates via WhatsApp, email, and SMS
            </p>
          </div>
          <Switch
            id="notifications"
            checked={notifications}
            onCheckedChange={handleNotificationsChange}
          />
        </div>

        {/* Save Button */}
        {hasChanges && (
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>
        )}
      </div>
    </Card>
  );
}
