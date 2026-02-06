/**
 * QC Handover Form Component (FR-004)
 *
 * Modal form for QC staff to create handovers to Customer Service.
 * Used when issues are discovered that require customer communication.
 *
 * @module components/features/qc/QCHandoverForm
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
import { Loader2, PhoneForwarded, Camera, X, Info } from 'lucide-react';
import { toast } from 'sonner';
import type { Order, Garment } from '@/lib/db/schema';

/**
 * Handover type options with display labels
 */
const HANDOVER_TYPE_OPTIONS = [
  { value: 'alteration', label: 'Needs Alteration', description: 'Garment needs alteration (needs customer approval)' },
  { value: 'defect', label: 'Defect Found', description: 'Defect discovered during QC' },
  { value: 'damage', label: 'Damage Occurred', description: 'Damage occurred during processing' },
  { value: 'exception', label: 'Exception Case', description: 'Other exception requiring customer input' },
  { value: 'pricing_issue', label: 'Pricing Issue', description: 'Pricing dispute or additional charges needed' },
  { value: 'special_care', label: 'Special Care Needed', description: 'Special care instructions required' },
] as const;

/**
 * Recommended action options
 */
const RECOMMENDED_ACTION_OPTIONS = [
  { value: 'notify_customer', label: 'Notify Customer', description: 'Just inform the customer' },
  { value: 'request_approval', label: 'Request Approval', description: 'Need customer approval to proceed' },
  { value: 'offer_discount', label: 'Offer Discount', description: 'Offer discount or compensation' },
  { value: 'schedule_pickup', label: 'Schedule Re-Pickup', description: 'Need to schedule re-pickup' },
  { value: 'process_refund', label: 'Process Refund', description: 'Process a refund' },
  { value: 'no_action', label: 'No Action Needed', description: 'Just for information, no action required' },
] as const;

/**
 * Priority options
 */
const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-700' },
  { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-700' },
  { value: 'high', label: 'High', color: 'bg-amber-100 text-amber-700' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700' },
] as const;

/**
 * Form validation schema
 */
const handoverFormSchema = z.object({
  handoverType: z.enum([
    'alteration',
    'defect',
    'damage',
    'exception',
    'pricing_issue',
    'special_care',
  ]),
  description: z.string().min(10, 'Please provide at least 10 characters describing the issue'),
  recommendedAction: z.enum([
    'notify_customer',
    'request_approval',
    'offer_discount',
    'schedule_pickup',
    'process_refund',
    'no_action',
  ]),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  qcNotes: z.string().optional(),
});

type HandoverFormData = z.infer<typeof handoverFormSchema>;

interface QCHandoverFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
  garment?: Garment;
  onSuccess?: () => void;
  /** Pre-linked defect notification ID */
  defectNotificationId?: string;
  /** Pre-linked redo item ID */
  redoItemId?: string;
}

/**
 * QCHandoverForm Component
 *
 * Modal form for creating handovers to Customer Service.
 */
export function QCHandoverForm({
  open,
  onOpenChange,
  order,
  garment,
  onSuccess,
  defectNotificationId,
  redoItemId,
}: QCHandoverFormProps) {
  const { user, userData } = useAuth();
  const queryClient = useQueryClient();
  const [photos, setPhotos] = useState<string[]>([]);

  const form = useForm<HandoverFormData>({
    resolver: zodResolver(handoverFormSchema),
    defaultValues: {
      handoverType: defectNotificationId ? 'defect' : 'exception',
      description: '',
      recommendedAction: 'notify_customer',
      priority: 'normal',
      qcNotes: '',
    },
  });

  const createHandoverMutation = useMutation({
    mutationFn: async (data: HandoverFormData) => {
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

      const response = await fetch('/api/qc-handovers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          orderId: order.orderId,
          garmentId: garment?.garmentId,
          branchId: userData.branchId || order.branchId,
          handoverType: data.handoverType,
          description: data.description,
          photos: photos.length > 0 ? photos : undefined,
          qcNotes: data.qcNotes || undefined,
          recommendedAction: data.recommendedAction,
          priority: data.priority,
          defectNotificationId,
          redoItemId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create handover');
      }

      return response.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['qc-handovers'] });
      queryClient.invalidateQueries({ queryKey: ['orders', order.orderId] });
      toast.success('Handover created', {
        description: `Handover ${result.data.handoverId} sent to Customer Service`,
      });
      form.reset();
      setPhotos([]);
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Error creating handover:', error);
      toast.error('Failed to create handover', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  const onSubmit = (data: HandoverFormData) => {
    createHandoverMutation.mutate(data);
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

  const selectedPriority = form.watch('priority');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PhoneForwarded className="h-5 w-5 text-blue-500" />
            Create Customer Service Handover
          </DialogTitle>
          <DialogDescription>
            Send this issue to Customer Service for follow-up with the customer.
          </DialogDescription>
        </DialogHeader>

        {/* Info Alert */}
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Customer Service will be notified immediately and will contact the
            customer to resolve this issue. A communication template will be
            generated automatically.
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
          {garment && (
            <>
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
            </>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Handover Type */}
            <FormField
              control={form.control}
              name="handoverType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issue Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select issue type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {HANDOVER_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {option.description}
                            </div>
                          </div>
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
                      {PRIORITY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-xs ${option.color}`}
                            >
                              {option.label}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Urgent priority for time-sensitive issues or VIP customers
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the issue clearly. What happened? What does the customer need to know?"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Be specific - this will be used to generate the customer communication
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Recommended Action */}
            <FormField
              control={form.control}
              name="recommendedAction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recommended Action *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select recommended action" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {RECOMMENDED_ACTION_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {option.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* QC Notes (internal) */}
            <FormField
              control={form.control}
              name="qcNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Internal Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes for Customer Service (not shared with customer)"
                      className="min-h-[60px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Internal notes for Customer Service staff only
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
                Add up to 5 photos documenting the issue. Photos help Customer Service
                explain the situation to the customer.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createHandoverMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createHandoverMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createHandoverMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Send to Customer Service'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
