/**
 * Stock Adjustment Modal Component
 *
 * Modal for adjusting inventory stock levels (add/remove stock).
 *
 * @module components/features/inventory/StockAdjustmentModal
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { doc, getDoc, updateDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';
import type { InventoryItem } from '@/app/(dashboard)/inventory/page';

const adjustmentSchema = z.object({
  type: z.enum(['restock', 'usage']),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  reason: z.string().optional(),
});

type AdjustmentForm = z.infer<typeof adjustmentSchema>;

interface StockAdjustmentModalProps {
  item: InventoryItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function generateLogId(): string {
  return `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function StockAdjustmentModal({ item, open, onOpenChange }: StockAdjustmentModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [adjustmentType, setAdjustmentType] = useState<'restock' | 'usage'>('restock');

  const form = useForm<AdjustmentForm>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      type: 'restock',
      amount: 0,
      reason: '',
    },
  });

  const amount = form.watch('amount') || 0;
  const newQuantity =
    adjustmentType === 'restock' ? item.quantity + amount : item.quantity - amount;

  const adjustStockMutation = useMutation({
    mutationFn: async (data: AdjustmentForm) => {
      const itemRef = doc(db, 'inventory', item.itemId);
      const itemDoc = await getDoc(itemRef);
      const currentQuantity = itemDoc.data()?.quantity || 0;
      const calculatedNewQuantity =
        data.type === 'restock'
          ? currentQuantity + data.amount
          : currentQuantity - data.amount;

      if (calculatedNewQuantity < 0) {
        throw new Error('Cannot reduce stock below zero');
      }

      // Update inventory item
      await updateDoc(itemRef, {
        quantity: calculatedNewQuantity,
        lastRestocked: data.type === 'restock' ? Timestamp.now() : itemDoc.data()?.lastRestocked,
        updatedAt: Timestamp.now(),
      });

      // Log adjustment
      const log = {
        logId: generateLogId(),
        itemId: item.itemId,
        itemName: item.name,
        type: data.type,
        oldQuantity: currentQuantity,
        newQuantity: calculatedNewQuantity,
        amount: data.amount,
        reason: data.reason || '',
        userId: user?.uid || '',
        userName: user?.displayName || user?.email || 'Unknown',
        timestamp: Timestamp.now(),
      };

      await setDoc(doc(db, 'inventory_logs', log.logId), log);

      return { item, log };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-logs', item.itemId] });
      toast.success(
        `Stock ${data.log.type === 'restock' ? 'added' : 'removed'} successfully!`
      );
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      console.error('Error adjusting stock:', error);
      toast.error(error.message || 'Failed to adjust stock');
    },
  });

  const onSubmit = (data: AdjustmentForm) => {
    adjustStockMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
          <DialogDescription>
            Add or remove stock for {item.name}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Current Stock Display */}
            <div className="p-4 bg-gray-50 rounded-lg border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Current Stock:</span>
                <span className="text-lg font-bold text-black">
                  {item.quantity} {item.unit}
                </span>
              </div>
              {amount > 0 && (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Adjustment:</span>
                    <span className={`text-lg font-semibold ${
                      adjustmentType === 'restock' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {adjustmentType === 'restock' ? '+' : '-'}{amount} {item.unit}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm font-medium text-gray-900">New Stock:</span>
                    <span className={`text-lg font-bold ${
                      newQuantity < 0
                        ? 'text-red-600'
                        : newQuantity < item.reorderLevel
                        ? 'text-yellow-600'
                        : 'text-green-600'
                    }`}>
                      {newQuantity.toFixed(2)} {item.unit}
                    </span>
                  </div>
                  {newQuantity < 0 && (
                    <p className="text-xs text-red-600 mt-2">
                      Error: Stock cannot be negative
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Adjustment Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adjustment Type *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => {
                        field.onChange(value);
                        setAdjustmentType(value as 'restock' | 'usage');
                      }}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="relative">
                        <RadioGroupItem
                          value="restock"
                          id="restock"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="restock"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-green-600 peer-data-[state=checked]:bg-green-50 cursor-pointer"
                        >
                          <Plus className="mb-2 h-6 w-6 text-green-600" />
                          <span className="text-sm font-semibold">Add Stock</span>
                        </Label>
                      </div>
                      <div className="relative">
                        <RadioGroupItem value="usage" id="usage" className="peer sr-only" />
                        <Label
                          htmlFor="usage"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-red-600 peer-data-[state=checked]:bg-red-50 cursor-pointer"
                        >
                          <Minus className="mb-2 h-6 w-6 text-red-600" />
                          <span className="text-sm font-semibold">Remove Stock</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="0"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Amount in {item.unit}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Weekly restock, Used for order #123"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={adjustStockMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={adjustStockMutation.isPending || newQuantity < 0}
                className={
                  adjustmentType === 'restock'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }
              >
                {adjustStockMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adjusting...
                  </>
                ) : (
                  <>
                    {adjustmentType === 'restock' ? (
                      <Plus className="w-4 h-4 mr-2" />
                    ) : (
                      <Minus className="w-4 h-4 mr-2" />
                    )}
                    {adjustmentType === 'restock' ? 'Add Stock' : 'Remove Stock'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
