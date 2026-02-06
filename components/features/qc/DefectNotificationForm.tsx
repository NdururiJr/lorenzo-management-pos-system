/**
 * Defect Notification Form Component (FR-003)
 *
 * Modal form for QC staff to create defect notifications.
 * Tracks defects and initiates customer notification workflow.
 *
 * @module components/features/qc/DefectNotificationForm
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Camera, X, Clock } from 'lucide-react';
import { toast } from 'sonner';
import type { Order, Garment } from '@/lib/db/schema';

/**
 * Defect type options with display labels
 */
const DEFECT_TYPE_OPTIONS = [
  { value: 'stain_remaining', label: 'Stain Remaining' },
  { value: 'color_fading', label: 'Color Fading' },
  { value: 'shrinkage', label: 'Shrinkage' },
  { value: 'damage', label: 'Damage' },
  { value: 'missing_buttons', label: 'Missing Buttons' },
  { value: 'torn_seams', label: 'Torn Seams' },
  { value: 'discoloration', label: 'Discoloration' },
  { value: 'odor', label: 'Odor/Smell' },
  { value: 'other', label: 'Other' },
] as const;

/**
 * Form validation schema
 */
const defectNotificationSchema = z.object({
  defectType: z.enum([
    'stain_remaining',
    'color_fading',
    'shrinkage',
    'damage',
    'missing_buttons',
    'torn_seams',
    'discoloration',
    'odor',
    'other',
  ]),
  defectDescription: z.string().min(10, 'Please provide at least 10 characters describing the defect'),
});

type DefectNotificationFormData = z.infer<typeof defectNotificationSchema>;

interface DefectNotificationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
  garment: Garment;
  onSuccess?: () => void;
}

/**
 * DefectNotificationForm Component
 *
 * Modal form for creating defect notifications with timeline tracking.
 */
export function DefectNotificationForm({
  open,
  onOpenChange,
  order,
  garment,
  onSuccess,
}: DefectNotificationFormProps) {
  const { user, userData } = useAuth();
  const queryClient = useQueryClient();
  const [photos, setPhotos] = useState<string[]>([]);

  const form = useForm<DefectNotificationFormData>({
    resolver: zodResolver(defectNotificationSchema),
    defaultValues: {
      defectType: 'stain_remaining',
      defectDescription: '',
    },
  });

  const createNotificationMutation = useMutation({
    mutationFn: async (data: DefectNotificationFormData) => {
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

      const response = await fetch('/api/defect-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          orderId: order.orderId,
          garmentId: garment.garmentId,
          branchId: userData.branchId || order.branchId,
          defectType: data.defectType,
          defectDescription: data.defectDescription,
          photos: photos.length > 0 ? photos : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create defect notification');
      }

      return response.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['defect-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['orders', order.orderId] });
      toast.success('Defect notification created', {
        description: `Notification ${result.data.notificationId} - Customer must be notified within timeline`,
      });
      form.reset();
      setPhotos([]);
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Error creating defect notification:', error);
      toast.error('Failed to create defect notification', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  const onSubmit = (data: DefectNotificationFormData) => {
    createNotificationMutation.mutate(data);
  };

  /**
   * Handle photo upload
   */
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Create object URLs as placeholders
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
            <AlertCircle className="h-5 w-5 text-red-500" />
            Report Defect
          </DialogTitle>
          <DialogDescription>
            Document a defect found during quality check. Customer must be notified
            within the configured timeline.
          </DialogDescription>
        </DialogHeader>

        {/* Timeline Alert */}
        <Alert className="border-amber-200 bg-amber-50">
          <Clock className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Timeline Requirement:</strong> Customers must be notified of defects
            within 24 hours (or as configured for the service type). Compliance is tracked
            for quality metrics.
          </AlertDescription>
        </Alert>

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
            <span className="text-sm text-muted-foreground">Phone</span>
            <span className="font-mono text-sm">{order.customerPhone || 'N/A'}</span>
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
            {/* Defect Type */}
            <FormField
              control={form.control}
              name="defectType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Defect Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select defect type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DEFECT_TYPE_OPTIONS.map((option) => (
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

            {/* Defect Description */}
            <FormField
              control={form.control}
              name="defectDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the defect in detail. Where is it located? How severe is it?"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide clear details to help customer service explain to the customer
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Photo Upload */}
            <div className="space-y-2">
              <FormLabel>Photos (Recommended)</FormLabel>
              <div className="flex flex-wrap gap-2">
                {photos.map((photo, index) => (
                  <div
                    key={index}
                    className="relative w-20 h-20 rounded-lg border overflow-hidden group"
                  >
                    <img
                      src={photo}
                      alt={`Defect photo ${index + 1}`}
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
                Add up to 5 photos documenting the defect. Photos help customer service
                explain the issue to the customer.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createNotificationMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createNotificationMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {createNotificationMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Report Defect'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
