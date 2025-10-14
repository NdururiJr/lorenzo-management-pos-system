/**
 * Create Customer Modal Component
 *
 * Modal form for creating new customers
 *
 * @module components/features/pos/CreateCustomerModal
 */

'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createCustomerSchema, type CreateCustomerInput } from '@/lib/validations/orders';
import { createCustomer } from '@/lib/db/customers';
import { toast } from 'sonner';

interface CreateCustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerCreated: (customerId: string) => void;
}

export function CreateCustomerModal({
  open,
  onOpenChange,
  onCustomerCreated,
}: CreateCustomerModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<CreateCustomerInput>({
    resolver: zodResolver(createCustomerSchema),
  });

  const notifications = watch('preferences.notifications');

  const onSubmit = async (data: CreateCustomerInput) => {
    try {
      const customerId = await createCustomer(data);
      toast.success('Customer created successfully');
      reset();
      onOpenChange(false);
      onCustomerCreated(customerId);
    } catch (error) {
      console.error('Error creating customer:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to create customer'
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Customer</DialogTitle>
          <DialogDescription>
            Add a new customer to the system. Phone number is required for order
            notifications.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="John Doe"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+254712345678 or 0712345678"
              {...register('phone')}
            />
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Format: +254XXXXXXXXX or 07XXXXXXXX
            </p>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Preferences */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium text-sm">Preferences</h4>

            {/* Notifications */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="notifications"
                checked={notifications}
                onCheckedChange={(checked) =>
                  setValue('preferences.notifications', checked as boolean)
                }
              />
              <Label
                htmlFor="notifications"
                className="text-sm font-normal cursor-pointer"
              >
                Send WhatsApp notifications for order updates
              </Label>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label htmlFor="language">Preferred Language</Label>
              <Select
                defaultValue="en"
                onValueChange={(value: 'en' | 'sw') =>
                  setValue('preferences.language', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="sw">Swahili</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Customer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
