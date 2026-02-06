/**
 * Rewash Orders API
 *
 * Endpoints for checking rewash eligibility and creating rewash orders.
 * V2.0: 24-hour eligibility window for rewash requests.
 *
 * @module app/api/orders/rewash/route
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  checkRewashEligibility,
  createRewashOrder,
  getRewashOrders,
  COMMON_REWASH_REASONS,
} from '@/lib/db/rewash';

/**
 * GET /api/orders/rewash?orderId=xxx
 *
 * Check rewash eligibility for an order
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Check eligibility
    const eligibility = await checkRewashEligibility(orderId);

    // Get any existing rewash orders
    const existingRewashOrders = await getRewashOrders(orderId);

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        eligibility,
        existingRewashOrders: existingRewashOrders.map(o => ({
          orderId: o.orderId,
          status: o.status,
          reason: o.rewashReason,
          createdAt: o.createdAt,
          garmentCount: o.garments?.length || 0,
        })),
        commonReasons: COMMON_REWASH_REASONS,
      },
    });
  } catch (error) {
    console.error('Get rewash eligibility error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check eligibility',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders/rewash
 *
 * Create a rewash order
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { originalOrderId, garmentIds, reason, customerId, requestedBy, notes } = body;

    // Validate required fields
    if (!originalOrderId) {
      return NextResponse.json(
        { success: false, error: 'Original order ID is required' },
        { status: 400 }
      );
    }

    if (!garmentIds || !Array.isArray(garmentIds) || garmentIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one garment must be selected' },
        { status: 400 }
      );
    }

    if (!reason || reason.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Reason must be at least 10 characters' },
        { status: 400 }
      );
    }

    if (!customerId) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    if (!requestedBy) {
      return NextResponse.json(
        { success: false, error: 'Requester ID is required' },
        { status: 400 }
      );
    }

    // Create the rewash order
    const rewashOrderId = await createRewashOrder({
      originalOrderId,
      garmentIds,
      reason,
      customerId,
      requestedBy,
      notes,
    });

    return NextResponse.json({
      success: true,
      data: {
        rewashOrderId,
        message: `Rewash order ${rewashOrderId} created successfully`,
        garmentCount: garmentIds.length,
      },
    });
  } catch (error) {
    console.error('Create rewash order error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create rewash order',
      },
      { status: 500 }
    );
  }
}
