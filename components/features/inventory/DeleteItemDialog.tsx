/**
 * Delete Item Dialog Component
 *
 * Confirmation dialog for deleting inventory items.
 *
 * @module components/features/inventory/DeleteItemDialog
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { InventoryItem } from '@/app/(dashboard)/inventory/page';

interface DeleteItemDialogProps {
  item: InventoryItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteItemDialog({ item, open, onOpenChange }: DeleteItemDialogProps) {
  const queryClient = useQueryClient();

  const deleteItemMutation = useMutation({
    mutationFn: async () => {
      await deleteDoc(doc(db, 'inventory', item.itemId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Item deleted successfully!');
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Inventory Item?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{item.name}"? This action cannot be undone.
            <br />
            <br />
            Current stock: <strong>{item.quantity} {item.unit}</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteItemMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteItemMutation.mutate()}
            disabled={deleteItemMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteItemMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Item'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
