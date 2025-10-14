/**
 * Order Details Component
 *
 * Displays detailed information about an order including garments.
 *
 * @module components/features/customer/OrderDetails
 */

'use client';

import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/formatters';
import { Separator } from '@/components/ui/separator';
import type { OrderExtended } from '@/lib/db/schema';

interface OrderDetailsProps {
  order: OrderExtended;
}

export function OrderDetails({ order }: OrderDetailsProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Order Details</h2>

      <div className="space-y-4">
        {/* Garments */}
        {order.garments.map((garment, index) => (
          <div key={garment.garmentId}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-medium">
                  {garment.type} ({garment.color})
                </div>
                {garment.brand && (
                  <div className="text-sm text-gray-600">
                    Brand: {garment.brand}
                  </div>
                )}
                <div className="text-sm text-gray-600 mt-1">
                  Services: {garment.services.join(', ')}
                </div>
                {garment.specialInstructions && (
                  <div className="text-sm text-gray-600 mt-1 italic">
                    Note: {garment.specialInstructions}
                  </div>
                )}
              </div>
              <div className="font-semibold">
                {formatCurrency(garment.price)}
              </div>
            </div>

            {index < order.garments.length - 1 && (
              <Separator className="my-4" />
            )}
          </div>
        ))}

        {/* Special Instructions */}
        {order.specialInstructions && (
          <>
            <Separator />
            <div>
              <h3 className="font-medium text-sm mb-1">Special Instructions</h3>
              <p className="text-sm text-gray-600">{order.specialInstructions}</p>
            </div>
          </>
        )}

        {/* Delivery Address */}
        {order.deliveryAddress && (
          <>
            <Separator />
            <div>
              <h3 className="font-medium text-sm mb-1">Delivery Address</h3>
              <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
