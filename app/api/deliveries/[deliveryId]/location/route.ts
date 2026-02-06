/**
 * Driver Location API Endpoint (Customer Access)
 *
 * Provides secure access to driver location data for customers.
 * Verifies that the requesting customer owns an order in the delivery
 * before returning location information.
 *
 * SECURITY: This endpoint replaces direct Firestore access to prevent
 * unauthorized location data exposure while maintaining functionality.
 *
 * @module app/api/deliveries/[deliveryId]/location
 */

import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { DriverLocation, Delivery } from '@/lib/db/schema';

/**
 * GET /api/deliveries/[deliveryId]/location
 *
 * Returns driver location for a delivery if the requesting customer
 * owns an order in that delivery.
 *
 * Query Parameters:
 * - orderId: The customer's order ID (used to verify ownership)
 *
 * Returns:
 * - 200: Driver location data
 * - 401: Unauthorized (no order ID provided)
 * - 403: Forbidden (order not in this delivery)
 * - 404: Location not found
 * - 500: Server error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ deliveryId: string }> }
) {
  try {
    const { deliveryId } = await params;
    const orderId = request.nextUrl.searchParams.get('orderId');

    // Verify orderId is provided
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 401 }
      );
    }

    // Fetch the delivery to verify order ownership
    const deliveryRef = doc(db, 'deliveries', deliveryId);
    const deliverySnap = await getDoc(deliveryRef);

    if (!deliverySnap.exists()) {
      return NextResponse.json(
        { error: 'Delivery not found' },
        { status: 404 }
      );
    }

    const delivery = deliverySnap.data() as Delivery;

    // Verify the orderId is in this delivery
    if (!delivery.orders || !delivery.orders.includes(orderId)) {
      return NextResponse.json(
        { error: 'Access denied: Order not in this delivery' },
        { status: 403 }
      );
    }

    // Fetch driver location
    const locationRef = doc(db, 'driverLocations', deliveryId);
    const locationSnap = await getDoc(locationRef);

    if (!locationSnap.exists()) {
      return NextResponse.json(
        {
          location: null,
          message: 'Driver location not yet available',
        },
        { status: 200 }
      );
    }

    const location = locationSnap.data() as DriverLocation;

    // Return location data
    return NextResponse.json({
      location: {
        deliveryId: location.deliveryId,
        driverId: location.driverId,
        location: location.location,
        heading: location.heading,
        speed: location.speed,
        lastUpdated: location.lastUpdated,
        isActive: location.isActive,
      },
    });
  } catch (error) {
    console.error('Driver location API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
