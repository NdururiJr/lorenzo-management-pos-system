/**
 * Edit Item Modal Component
 *
 * Modal form for editing existing inventory items.
 *
 * @module components/features/inventory/EditItemModal
 */

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { InventoryItem } from '@/app/(dashboard)/inventory/page';

const inventoryItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.enum(['detergents', 'softeners', 'hangers', 'packaging', 'stain_removers', 'others']),
  unit: z.enum(['kg', 'liters', 'pieces']),
  reorderLevel: z.coerce.number().min(0, 'Reorder level must be positive'),
  costPerUnit: z.coerce.number().min(0).optional(),
  supplier: z.string().optional(),
});

type InventoryItemForm = z.infer<typeof inventoryItemSchema>;

interface EditItemModalProps {
  item: InventoryItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditItemModal({ item, open, onOpenChange }: EditItemModalProps) {
  const queryClient = useQueryClient();

  const form = useForm<InventoryItemForm>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: {
      name: item.name,
      category: item.category,
      unit: item.unit,
      reorderLevel: item.reorderLevel,
      costPerUnit: item.costPerUnit || 0,
      supplier: item.supplier || '',
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async (data: InventoryItemForm) => {
      await updateDoc(doc(db, 'inventory', item.itemId), {
        ...data,
        updatedAt: Timestamp.now(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Item updated successfully!');
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    },
  });

  const onSubmit = (data: InventoryItemForm) => {
    updateItemMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Inventory Item</DialogTitle>
          <DialogDescription>
            Update the details for {item.name}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="detergents">Detergents</SelectItem>
                        <SelectItem value="softeners">Softeners</SelectItem>
                        <SelectItem value="hangers">Hangers</SelectItem>
                        <SelectItem value="packaging">Packaging</SelectItem>
                        <SelectItem value="stain_removers">Stain Removers</SelectItem>
                        <SelectItem value="others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="kg">Kilograms (kg)</SelectItem>
                        <SelectItem value="liters">Liters</SelectItem>
                        <SelectItem value="pieces">Pieces</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reorderLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reorder Level *</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormDescription>Alert when stock is below this</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="costPerUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost Per Unit (Optional)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="supplier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                disabled={updateItemMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateItemMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {updateItemMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Item'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
