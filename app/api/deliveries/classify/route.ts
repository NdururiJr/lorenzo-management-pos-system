/**
 * Delivery Classification API
 *
 * Endpoints for classifying deliveries and handling manager overrides.
 * V2.0: Auto-classification and manual override support.
 *
 * @module app/api/deliveries/classify/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDocument, updateDocument } from '@/lib/db';
import {
  classifyDelivery,
  canOverrideClassification,
  validateOverrideRequest,
  createOverrideRecord,
} from '@/lib/delivery/classification';
import type { Order, DeliveryClassification } from '@/lib/db/schema';

/**
 * POST /api/deliveries/classify
 *
 * Classify an order for delivery or apply a manual override
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, override, userId, userName, userRole, reason } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get the order
    const order = await getDocument<Order>('orders', orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // If override is requested
    if (override) {
      // Validate user can override
      if (!userId || !userRole) {
        return NextResponse.json(
          { success: false, error: 'User information required for override' },
          { status: 400 }
        );
      }

      if (!canOverrideClassification(userRole)) {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions to override classification' },
          { status: 403 }
        );
      }

      const newClassification = body.newClassification as DeliveryClassification;
      const currentClassification = order.deliveryClassification || classifyDelivery(order).classification;

      // Validate the override request
      const validation = validateOverrideRequest(currentClassification, newClassification, reason);
      if (!validation.valid) {
        return NextResponse.json(
          { success: false, error: validation.error },
          { status: 400 }
        );
      }

      // Create override record for audit
      const overrideRecord = createOverrideRecord(
        orderId,
        currentClassification,
        newClassification,
        userId,
        userName || 'Unknown',
        reason
      );

      // Update the order with the override
      await updateDocument('orders', orderId, {
        deliveryClassification: newClassification,
        classificationBasis: 'manual',
        classificationOverrideBy: userId,
        classificationOverrideReason: reason,
        classificationOverrideAt: overrideRecord.override.overrideAt,
      });

      return NextResponse.json({
        success: true,
        data: {
          orderId,
          classification: newClassification,
          basis: 'manual',
          override: overrideRecord.override,
          message: `Classification overridden from ${currentClassification} to ${newClassification}`,
        },
      });
    }

    // Auto-classify the order
    const result = classifyDelivery(order);

    // Update the order with the classification if not already set
    if (!order.deliveryClassification) {
      await updateDocument('orders', orderId, {
        deliveryClassification: result.classification,
        classificationBasis: result.basis,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        ...result,
      },
    });
  } catch (error) {
    console.error('Delivery classification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Classification failed',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/deliveries/classify?orderId=xxx
 *
 * Get classification for an order without saving
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

    // Get the order
    const order = await getDocument<Order>('orders', orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // If order already has a classification, return it
    if (order.deliveryClassification) {
      return NextResponse.json({
        success: true,
        data: {
          orderId,
          classification: order.deliveryClassification,
          basis: order.classificationBasis || 'unknown',
          isOverridden: order.classificationBasis === 'manual',
          details: {
            garmentCount: order.garments?.length || 0,
            orderValue: order.totalAmount || 0,
          },
        },
      });
    }

    // Calculate classification without saving
    const result = classifyDelivery(order);

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        ...result,
        isOverridden: false,
      },
    });
  } catch (error) {
    console.error('Get classification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get classification',
      },
      { status: 500 }
    );
  }
}
