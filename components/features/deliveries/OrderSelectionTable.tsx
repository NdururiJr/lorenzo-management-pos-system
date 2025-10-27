/**
 * Order Selection Table Component
 *
 * Displays orders with status "ready" for delivery and allows multi-selection
 * to create delivery batches.
 *
 * @module components/features/deliveries/OrderSelectionTable
 */

'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, MapPin, Phone, DollarSign, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface Order {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string;
  totalAmount: number;
  createdAt: any;
  estimatedCompletion: any;
}

interface OrderSelectionTableProps {
  selectedOrders: string[];
  onSelectionChange: (orderIds: string[]) => void;
  onCreateBatch: () => void;
}

export function OrderSelectionTable({
  selectedOrders,
  onSelectionChange,
  onCreateBatch,
}: OrderSelectionTableProps) {
  // Fetch ready orders and filter for delivery required on client-side
  // This avoids needing a composite index in Firestore
  const { data: orders = [], isLoading, error } = useQuery<Order[]>({
    queryKey: ['ready-orders'],
    queryFn: async () => {
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('status', '==', 'ready'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
    },
  });

  // Filter orders that require delivery and have delivery addresses
  const deliverableOrders = useMemo(() => {
    return orders.filter(
      (order: any) =>
        order.returnMethod === 'delivery_required' &&
        order.deliveryAddress
    );
  }, [orders]);

  const handleSelectAll = () => {
    if (selectedOrders.length === deliverableOrders.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(deliverableOrders.map((order) => order.id));
    }
  };

  const handleSelect = (orderId: string) => {
    if (selectedOrders.includes(orderId)) {
      onSelectionChange(selectedOrders.filter((id) => id !== orderId));
    } else {
      onSelectionChange([...selectedOrders, orderId]);
    }
  };

  const isAllSelected =
    deliverableOrders.length > 0 &&
    selectedOrders.length === deliverableOrders.length;
  const isSomeSelected = selectedOrders.length > 0 && !isAllSelected;

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <p className="text-sm text-gray-600">Loading ready orders...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8">
        <div className="text-center text-red-600">
          <p className="font-semibold">Error loading orders</p>
          <p className="text-sm mt-1">
            {error instanceof Error ? error.message : 'Failed to load orders'}
          </p>
        </div>
      </Card>
    );
  }

  if (deliverableOrders.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-gray-500">
          <p className="font-semibold">No orders ready for delivery</p>
          <p className="text-sm mt-1">
            Orders will appear here once they are marked as "ready" and have a delivery
            address
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        {/* Table Header */}
        <div className="border-b bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                aria-label="Select all orders"
                className="border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black"
                style={
                  isSomeSelected
                    ? { backgroundColor: '#000', opacity: 0.5 }
                    : undefined
                }
              />
              <span className="text-sm font-semibold text-black">
                {selectedOrders.length > 0
                  ? `${selectedOrders.length} selected`
                  : 'Select orders'}
              </span>
            </div>
            {selectedOrders.length > 0 && (
              <Button
                onClick={onCreateBatch}
                className="bg-black hover:bg-gray-800 text-white"
              >
                Create Delivery Batch ({selectedOrders.length})
              </Button>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="divide-y">
          {deliverableOrders.map((order) => {
            const isSelected = selectedOrders.includes(order.id);

            return (
              <div
                key={order.id}
                className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                  isSelected ? 'bg-blue-50 hover:bg-blue-100' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <div className="pt-1">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleSelect(order.id)}
                      aria-label={`Select order ${order.orderId}`}
                      className="border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black"
                    />
                  </div>

                  {/* Order Details */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Order Info */}
                    <div>
                      <div className="font-semibold text-black text-sm">
                        {order.orderId}
                      </div>
                      <div className="text-sm text-gray-600 mt-0.5">
                        {order.customerName}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Phone className="w-3 h-3" />
                        {order.customerPhone}
                      </div>
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-gray-700">
                          {order.deliveryAddress || 'No delivery address'}
                        </div>
                      </div>
                    </div>

                    {/* Amount & Date */}
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1 text-sm font-semibold text-black">
                        <DollarSign className="w-4 h-4" />
                        KES {order.totalAmount.toLocaleString()}
                      </div>
                      <div className="flex items-center justify-end gap-1 text-xs text-gray-500 mt-1">
                        <Calendar className="w-3 h-3" />
                        {order.estimatedCompletion
                          ? format(order.estimatedCompletion.toDate(), 'MMM d, yyyy')
                          : 'Not set'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
