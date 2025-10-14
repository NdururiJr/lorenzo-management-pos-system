/**
 * Personal Info Section Component
 *
 * Displays and edits customer personal information.
 *
 * @module components/features/customer/PersonalInfoSection
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateCustomer } from '@/lib/db/customers';
import { toast } from 'sonner';
import { Edit2, Save, X } from 'lucide-react';
import type { Customer } from '@/lib/db/schema';

interface PersonalInfoSectionProps {
  customer: Customer;
  onUpdate: () => void;
}

export function PersonalInfoSection({
  customer,
  onUpdate,
}: PersonalInfoSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(customer.name);
  const [email, setEmail] = useState(customer.email || '');

  const handleSave = async () => {
    try {
      setIsSaving(true);

      await updateCustomer(customer.customerId, {
        name: name.trim(),
        email: email.trim() || undefined,
      });

      toast.success('Profile updated successfully');
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setName(customer.name);
    setEmail(customer.email || '');
    setIsEditing(false);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Personal Information</h2>
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <Label htmlFor="name">Name</Label>
          {isEditing ? (
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
          ) : (
            <div className="mt-1 text-sm font-medium">{customer.name}</div>
          )}
        </div>

        {/* Phone (view only) */}
        <div>
          <Label>Phone</Label>
          <div className="mt-1 text-sm font-medium flex items-center gap-2">
            {customer.phone}
            <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
              Verified
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Contact support to change your phone number
          </p>
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email">Email (optional)</Label>
          {isEditing ? (
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="mt-1"
            />
          ) : (
            <div className="mt-1 text-sm font-medium">
              {customer.email || (
                <span className="text-gray-400 italic">Not set</span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSave}
              disabled={isSaving || !name.trim()}
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
