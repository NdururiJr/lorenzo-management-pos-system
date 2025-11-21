/**
 * Add Pricing Modal Component
 *
 * Modal form for adding/editing garment pricing.
 * Only accessible to super administrators.
 *
 * @module components/features/pricing/AddPricingModal
 */

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { setPricing, updatePricingServices } from '@/lib/db/pricing';
import { getActiveBranches } from '@/lib/db/index';
import type { Pricing, Branch } from '@/lib/db/schema';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const pricingSchema = z.object({
  branchId: z.string().min(1, 'Branch is required'),
  garmentType: z.string().min(1, 'Garment type is required'),
  wash: z.coerce.number().min(0, 'Wash price must be 0 or greater'),
  dryClean: z.coerce.number().min(0, 'Dry clean price must be 0 or greater'),
  iron: z.coerce.number().min(0, 'Iron price must be 0 or greater'),
  starch: z.coerce.number().min(0, 'Starch price must be 0 or greater'),
  express: z.coerce.number().min(0, 'Express % must be 0 or greater').max(100, 'Express % cannot exceed 100'),
  active: z.boolean(),
});

type PricingForm = z.infer<typeof pricingSchema>;

interface AddPricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editPricing?: Pricing | null;
}

export function AddPricingModal({ open, onOpenChange, editPricing }: AddPricingModalProps) {
  const { userData } = useAuth();
  const queryClient = useQueryClient();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(true);

  const isSuperAdmin = userData?.isSuperAdmin || false;
  const isEditMode = !!editPricing;

  const form = useForm<PricingForm>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      branchId: editPricing?.branchId || userData?.branchId || '',
      garmentType: editPricing?.garmentType || '',
      wash: editPricing?.services.wash || 0,
      dryClean: editPricing?.services.dryClean || 0,
      iron: editPricing?.services.iron || 0,
      starch: editPricing?.services.starch || 0,
      express: editPricing?.services.express || 50,
      active: editPricing?.active ?? true,
    },
  });

  // Load branches for super admin
  useEffect(() => {
    async function loadBranches() {
      if (!isSuperAdmin) {
        setLoadingBranches(false);
        return;
      }

      try {
        const allBranches = await getActiveBranches();
        setBranches(allBranches);
      } catch (error) {
        console.error('Error loading branches:', error);
        toast.error('Failed to load branches');
      } finally {
        setLoadingBranches(false);
      }
    }

    if (open) {
      loadBranches();
    }
  }, [open, isSuperAdmin]);

  // Reset form when edit pricing changes
  useEffect(() => {
    if (editPricing) {
      form.reset({
        branchId: editPricing.branchId,
        garmentType: editPricing.garmentType,
        wash: editPricing.services.wash,
        dryClean: editPricing.services.dryClean,
        iron: editPricing.services.iron,
        starch: editPricing.services.starch,
        express: editPricing.services.express,
        active: editPricing.active,
      });
    } else {
      form.reset({
        branchId: userData?.branchId || '',
        garmentType: '',
        wash: 0,
        dryClean: 0,
        iron: 0,
        starch: 0,
        express: 50,
        active: true,
      });
    }
  }, [editPricing, form, userData?.branchId]);

  const savePricingMutation = useMutation({
    mutationFn: async (data: PricingForm) => {
      const pricingData = {
        branchId: data.branchId,
        garmentType: data.garmentType,
        services: {
          wash: data.wash,
          dryClean: data.dryClean,
          iron: data.iron,
          starch: data.starch,
          express: data.express,
        },
        active: data.active,
      };

      if (isEditMode && editPricing) {
        // Update existing pricing
        await updatePricingServices(editPricing.pricingId, pricingData.services);
      } else {
        // Create new pricing
        await setPricing(pricingData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
      toast.success(isEditMode ? 'Pricing updated successfully!' : 'Pricing added successfully!');
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error saving pricing:', error);
      toast.error(isEditMode ? 'Failed to update pricing' : 'Failed to add pricing');
    },
  });

  const onSubmit = (data: PricingForm) => {
    savePricingMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Pricing' : 'Add New Pricing'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update pricing for this garment type.'
              : 'Add pricing for a garment type. Fill in the required details below.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Branch Selector (Super Admin Only) */}
            {isSuperAdmin && (
              <FormField
                control={form.control}
                name="branchId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isEditMode || loadingBranches}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch.branchId} value={branch.branchId}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {isEditMode ? 'Branch cannot be changed after creation' : 'Select the branch for this pricing'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Garment Type */}
            <FormField
              control={form.control}
              name="garmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Garment Type *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Shirt, Pants, Dress"
                      {...field}
                      disabled={isEditMode}
                    />
                  </FormControl>
                  <FormDescription>
                    {isEditMode ? 'Garment type cannot be changed after creation' : 'Enter the type of garment'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Service Prices Grid */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="wash"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wash Price (KES) *</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dryClean"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dry Clean Price (KES) *</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="iron"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Iron Price (KES) *</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="starch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Starch Price (KES) *</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Express Surcharge */}
            <FormField
              control={form.control}
              name="express"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Express Surcharge (%) *</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" max="100" step="1" placeholder="50" {...field} />
                  </FormControl>
                  <FormDescription>
                    Percentage surcharge for express service (e.g., 50 = 50%)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Active Toggle */}
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <FormDescription>
                      Enable this pricing to make it available for orders
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={savePricingMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={savePricingMutation.isPending}
                className="bg-black hover:bg-gray-800"
              >
                {savePricingMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isEditMode ? 'Updating...' : 'Adding...'}
                  </>
                ) : isEditMode ? (
                  'Update Pricing'
                ) : (
                  'Add Pricing'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
