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
import { Loader2, UserPlus } from 'lucide-react';
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
import {
  createCustomerSchema,
  type CreateCustomerInput,
} from '@/lib/validations/orders';
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
    defaultValues: {
      preferences: {
        notifications: true,
        language: 'en',
      },
    },
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
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <DialogHeader className="bg-brand-blue/5 p-6 border-b border-brand-blue/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl text-brand-blue">
                Create New Customer
              </DialogTitle>
              <DialogDescription className="text-gray-500 mt-1">
                Add a new customer profile to the system.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700 font-medium">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g. John Doe"
              {...register('name')}
              className="focus-visible:ring-brand-blue"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-gray-700 font-medium">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="e.g. 0712 345 678"
              {...register('phone')}
              className="focus-visible:ring-brand-blue"
            />
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Required for order notifications and lookup.
            </p>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 font-medium">
              Email (Optional)
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g. john@example.com"
              {...register('email')}
              className="focus-visible:ring-brand-blue"
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Preferences */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h4 className="font-medium text-sm text-gray-900">Preferences</h4>

            <div className="grid grid-cols-2 gap-4">
              {/* Language */}
              <div className="space-y-2">
                <Label
                  htmlFor="language"
                  className="text-xs uppercase text-gray-500 font-semibold"
                >
                  Language
                </Label>
                <Select
                  defaultValue="en"
                  onValueChange={(value: 'en' | 'sw') =>
                    setValue('preferences.language', value)
                  }
                >
                  <SelectTrigger className="focus:ring-brand-blue">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="sw">Swahili</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notifications */}
              <div className="flex flex-col justify-end pb-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notifications"
                    checked={notifications}
                    onCheckedChange={(checked) =>
                      setValue('preferences.notifications', checked as boolean)
                    }
                    className="data-[state=checked]:bg-brand-blue data-[state=checked]:border-brand-blue"
                  />
                  <Label
                    htmlFor="notifications"
                    className="text-sm font-normal cursor-pointer text-gray-700"
                  >
                    WhatsApp Updates
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-blue hover:bg-brand-blue/90 text-white"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Customer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
