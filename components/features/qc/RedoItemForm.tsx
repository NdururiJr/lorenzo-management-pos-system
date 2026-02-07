/**
 * Redo Item Form Component (FR-002)
 *
 * Modal form for QC staff to flag garments that need redo processing.
 * Creates a redo item that goes through approval workflow before
 * generating a zero-cost redo order.
 *
 * @module components/features/qc/RedoItemForm
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getAuth } from 'firebase/auth';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, Camera, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Order, Garment } from '@/lib/db/schema';

/**
 * Redo reason codes with display labels
 */
const REDO_REASON_OPTIONS = [
  { value: 'quality_issue', label: 'Quality Issue' },
  { value: 'damage', label: 'Damage' },
  { value: 'incomplete_service', label: 'Incomplete Service' },
  { value: 'wrong_service', label: 'Wrong Service Applied' },
  { value: 'customer_complaint', label: 'Customer Complaint' },
  { value: 'stain_not_removed', label: 'Stain Not Removed' },
  { value: 'shrinkage', label: 'Shrinkage' },
  { value: 'color_damage', label: 'Color Damage' },
  { value: 'other', label: 'Other' },
] as const;

/**
 * Form validation schema
 */
const redoItemSchema = z.object({
  reasonCode: z.enum([
    'quality_issue',
    'damage',
    'incomplete_service',
    'wrong_service',
    'customer_complaint',
    'stain_not_removed',
    'shrinkage',
    'color_damage',
    'other',
  ]),
  reasonDescription: z.string().min(10, 'Please provide at least 10 characters describing the issue'),
  priority: z.enum(['high', 'urgent']),
});

type RedoItemFormData = z.infer<typeof redoItemSchema>;

interface RedoItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
  garment: Garment;
  onSuccess?: () => void;
}

/**
 * RedoItemForm Component
 *
 * Modal form for flagging garments that need redo processing.
 * Used by QC staff during quality check stage.
 */
export function RedoItemForm({
  open,
  onOpenChange,
  order,
  garment,
  onSuccess,
}: RedoItemFormProps) {
  const { user, userData } = useAuth();
  const queryClient = useQueryClient();
  const [photos, setPhotos] = useState<string[]>([]);

  const form = useForm<RedoItemFormData>({
    resolver: zodResolver(redoItemSchema),
    defaultValues: {
      reasonCode: 'quality_issue',
      reasonDescription: '',
      priority: 'high',
    },
  });

  const createRedoItemMutation = useMutation({
    mutationFn: async (data: RedoItemFormData) => {
      if (!user || !userData) {
        throw new Error('Not authenticated');
      }

      // Get fresh ID token for API authentication
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Not authenticated');
      }
      const idToken = await currentUser.getIdToken();

      const response = await fetch('/api/redo-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          originalOrderId: order.orderId,
          originalGarmentId: garment.garmentId,
          branchId: userData.branchId || order.branchId,
          reasonCode: data.reasonCode,
          reasonDescription: data.reasonDescription,
          photos: photos.length > 0 ? photos : undefined,
          priority: data.priority,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create redo item');
      }

      return response.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['redo-items'] });
      queryClient.invalidateQueries({ queryKey: ['orders', order.orderId] });
      toast.success('Redo item created successfully', {
        description: `Redo request ${result.data.redoItemId} is pending approval`,
      });
      form.reset();
      setPhotos([]);
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Error creating redo item:', error);
      toast.error('Failed to create redo item', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  const onSubmit = (data: RedoItemFormData) => {
    createRedoItemMutation.mutate(data);
  };

  /**
   * Handle photo upload (placeholder - would integrate with Firebase Storage)
   */
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // For now, create object URLs as placeholders
    // In production, this would upload to Firebase Storage
    const newPhotos = Array.from(files).map((file) => URL.createObjectURL(file));
    setPhotos((prev) => [...prev, ...newPhotos].slice(0, 5)); // Max 5 photos

    toast.info('Photo added', {
      description: 'Photo will be uploaded when form is submitted',
    });
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Flag for Redo
          </DialogTitle>
          <DialogDescription>
            Flag this garment for reprocessing. A redo order will be created at zero cost
            once approved by management.
          </DialogDescription>
        </DialogHeader>

        {/* Order & Garment Info */}
        <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Order</span>
            <span className="font-mono font-medium">{order.orderId}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Customer</span>
            <span className="font-medium">{order.customerName || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Garment</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">{garment.type}</span>
              {garment.color && (
                <Badge variant="outline" className="text-xs">
                  {garment.color}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Services</span>
            <div className="flex gap-1 flex-wrap justify-end">
              {garment.services.map((service) => (
                <Badge key={service} variant="secondary" className="text-xs">
                  {service}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Reason Code */}
            <FormField
              control={form.control}
              name="reasonCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Redo *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {REDO_REASON_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Priority */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          High - Standard redo processing
                        </div>
                      </SelectItem>
                      <SelectItem value="urgent">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500" />
                          Urgent - Customer waiting
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Urgent priority for cases where the customer is waiting
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reason Description */}
            <FormField
              control={form.control}
              name="reasonDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the issue in detail. What went wrong? What needs to be redone?"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide detailed information to help with reprocessing
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Photo Upload */}
            <div className="space-y-2">
              <FormLabel>Photos (Optional)</FormLabel>
              <div className="flex flex-wrap gap-2">
                {photos.map((photo, index) => (
                  <div
                    key={index}
                    className="relative w-20 h-20 rounded-lg border overflow-hidden group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo}
                      alt={`Issue photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {photos.length < 5 && (
                  <label className="w-20 h-20 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                    <Camera className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">Add</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Add up to 5 photos documenting the issue
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createRedoItemMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createRedoItemMutation.isPending}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {createRedoItemMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Redo Request'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
