/**
 * Delivery Batch Form Component
 *
 * Form for creating a new delivery batch with driver assignment and scheduling.
 *
 * @module components/features/deliveries/DeliveryBatchForm
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, getDocs, Timestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { createDelivery, generateDeliveryId } from '@/lib/db/deliveries';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, Truck, User, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const batchFormSchema = z.object({
  driverId: z.string().min(1, 'Driver is required'),
  scheduledDate: z.date(),
  notes: z.string().optional(),
});

type BatchFormData = z.infer<typeof batchFormSchema>;

interface DeliveryBatchFormProps {
  selectedOrderIds: string[];
  onCancel: () => void;
  onSuccess: () => void;
}

interface Driver {
  uid: string;
  name: string;
  email: string;
}

export function DeliveryBatchForm({
  selectedOrderIds,
  onCancel,
  onSuccess,
}: DeliveryBatchFormProps) {
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  // Fetch available drivers
  const { data: drivers = [], isLoading: loadingDrivers } = useQuery<Driver[]>({
    queryKey: ['drivers'],
    queryFn: async () => {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', 'driver'), where('active', '==', true));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      })) as Driver[];
    },
  });

  const form = useForm<BatchFormData>({
    resolver: zodResolver(batchFormSchema),
    defaultValues: {
      driverId: '',
      scheduledDate: new Date(),
      notes: '',
    },
  });

  const { register, handleSubmit, formState: { errors }, setValue, watch } = form;
  const selectedDate = watch('scheduledDate');
  const selectedDriverId = watch('driverId');

  const onSubmit = async (data: BatchFormData) => {
    setIsCreating(true);
    try {
      const deliveryId = generateDeliveryId();

      // Create delivery batch
      await createDelivery({
        deliveryId,
        driverId: data.driverId,
        orders: selectedOrderIds,
        route: {
          optimized: false,
          stops: [],
          distance: 0,
          estimatedDuration: 0,
        },
        status: 'pending',
        scheduledDate: Timestamp.fromDate(data.scheduledDate),
        notes: data.notes,
      });

      // Update order statuses to 'out_for_delivery'
      const updatePromises = selectedOrderIds.map(async (orderId) => {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, {
          status: 'out_for_delivery',
          deliveryId,
          updatedAt: Timestamp.now(),
        });
      });

      await Promise.all(updatePromises);

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['ready-orders'] });
      queryClient.invalidateQueries({ queryKey: ['active-deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['ready-orders-count'] });
      queryClient.invalidateQueries({ queryKey: ['pending-deliveries-count'] });

      toast.success(`Delivery batch ${deliveryId} created successfully!`);
      onSuccess();
    } catch (error) {
      console.error('Error creating delivery batch:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to create delivery batch'
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-black">Create Delivery Batch</h3>
        <p className="text-sm text-gray-600 mt-1">
          Assign {selectedOrderIds.length} order{selectedOrderIds.length !== 1 ? 's' : ''} to a
          driver for delivery
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Driver Selection */}
        <div className="space-y-2">
          <Label htmlFor="driver" className="text-black flex items-center gap-2">
            <User className="w-4 h-4" />
            Assign Driver *
          </Label>
          {loadingDrivers ? (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading drivers...
            </div>
          ) : drivers.length === 0 ? (
            <div className="text-sm text-red-600">
              No active drivers available. Please add drivers first.
            </div>
          ) : (
            <Select
              value={selectedDriverId}
              onValueChange={(value) => setValue('driverId', value)}
            >
              <SelectTrigger className="h-10 border-gray-300 focus:border-black">
                <SelectValue placeholder="Select a driver" />
              </SelectTrigger>
              <SelectContent>
                {drivers.map((driver) => (
                  <SelectItem key={driver.uid} value={driver.uid}>
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      <span>{driver.name}</span>
                      <span className="text-xs text-gray-500">({driver.email})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {errors.driverId && (
            <p className="text-sm text-red-600">{errors.driverId.message}</p>
          )}
        </div>

        {/* Scheduled Date */}
        <div className="space-y-2">
          <Label className="text-black flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Scheduled Delivery Date *
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal border-gray-300 hover:border-black',
                  !selectedDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setValue('scheduledDate', date)}
                initialFocus
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              />
            </PopoverContent>
          </Popover>
          {errors.scheduledDate && (
            <p className="text-sm text-red-600">{errors.scheduledDate.message}</p>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-gray-700 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Notes / Instructions (Optional)
          </Label>
          <Textarea
            id="notes"
            placeholder="Add any special instructions for the driver..."
            rows={3}
            className="border-gray-300 focus:border-black resize-none"
            {...register('notes')}
          />
        </div>

        {/* Summary */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-sm text-black mb-2">Batch Summary</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div>Orders: <span className="font-semibold text-black">{selectedOrderIds.length}</span></div>
            <div>Driver: <span className="font-semibold text-black">
              {selectedDriverId
                ? drivers.find((d) => d.uid === selectedDriverId)?.name || 'Unknown'
                : 'Not selected'}
            </span></div>
            <div>Scheduled: <span className="font-semibold text-black">
              {selectedDate ? format(selectedDate, 'PPP') : 'Not selected'}
            </span></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isCreating}
            className="flex-1 border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isCreating || drivers.length === 0}
            className="flex-1 bg-black hover:bg-gray-800 text-white"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Batch...
              </>
            ) : (
              <>
                <Truck className="mr-2 h-4 w-4" />
                Create Delivery Batch
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
