/**
 * Convert Quotation to Order API Route (FR-001)
 *
 * Converts an accepted quotation into an actual order.
 *
 * @module app/api/quotations/[quotationId]/convert/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, verifyIdToken } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';

const QUOTATIONS_COLLECTION = 'quotations';
const ORDERS_COLLECTION = 'orders';

/**
 * Roles allowed to convert quotations
 */
const CONVERT_ALLOWED_ROLES = [
  'admin',
  'director',
  'general_manager',
  'store_manager',
  'front_desk',
];

/**
 * Validation schema for converting a quotation
 */
const convertQuotationSchema = z.object({
  collectionMethod: z.enum(['drop_off', 'pickup']).optional().default('drop_off'),
  returnMethod: z.enum(['customer_collects', 'delivery']).optional().default('customer_collects'),
  deliveryAddress: z
    .object({
      label: z.string(),
      address: z.string(),
      coordinates: z
        .object({
          lat: z.number(),
          lng: z.number(),
        })
        .optional(),
    })
    .optional(),
  pickupAddress: z
    .object({
      label: z.string(),
      address: z.string(),
      coordinates: z
        .object({
          lat: z.number(),
          lng: z.number(),
        })
        .optional(),
    })
    .optional(),
  paymentMethod: z.enum(['cash', 'mpesa', 'card', 'pesapal', 'credit']).optional(),
  paidAmount: z.number().min(0).optional().default(0),
  specialInstructions: z.string().optional(),
});

/**
 * Generate unique order ID
 */
async function generateOrderId(branchId: string): Promise<string> {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);

  const snapshot = await adminDb
    .collection(ORDERS_COLLECTION)
    .where('branchId', '==', branchId)
    .where('createdAt', '>=', Timestamp.fromDate(todayStart))
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();

  let sequence = 1;
  if (!snapshot.empty) {
    const lastDoc = snapshot.docs[0].data();
    const lastSequence = parseInt(lastDoc.orderId?.split('-').pop() || '0', 10);
    sequence = lastSequence + 1;
  }

  const sequenceStr = String(sequence).padStart(4, '0');
  return `ORD-${branchId}-${dateStr}-${sequenceStr}`;
}

/**
 * Generate garment ID
 */
function generateGarmentId(orderId: string, index: number): string {
  const indexStr = String(index + 1).padStart(2, '0');
  return `${orderId}-G${indexStr}`;
}

/**
 * Convert quotation items to order garments
 */
function convertItemsToGarments(
  orderId: string,
  items: Array<{
    garmentType: string;
    quantity: number;
    services: string[];
    unitPrice: number;
    totalPrice: number;
    specialInstructions?: string;
  }>
): Array<{
  garmentId: string;
  type: string;
  color: string;
  brand: string;
  services: string[];
  price: number;
  status: string;
  specialInstructions?: string;
}> {
  const garments: Array<{
    garmentId: string;
    type: string;
    color: string;
    brand: string;
    services: string[];
    price: number;
    status: string;
    specialInstructions?: string;
  }> = [];

  let garmentIndex = 0;
  for (const item of items) {
    // Create one garment entry per quantity
    for (let i = 0; i < item.quantity; i++) {
      garments.push({
        garmentId: generateGarmentId(orderId, garmentIndex),
        type: item.garmentType,
        color: '', // To be filled at drop-off
        brand: '', // To be filled at drop-off
        services: item.services,
        price: item.unitPrice,
        status: 'pending',
        specialInstructions: item.specialInstructions,
      });
      garmentIndex++;
    }
  }

  return garments;
}

/**
 * POST /api/quotations/[quotationId]/convert
 *
 * Convert a quotation to an order
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ quotationId: string }> }
) {
  try {
    const { quotationId } = await params;

    // Authenticate request
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Missing or invalid token' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;

    try {
      decodedToken = await verifyIdToken(idToken);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Get user document to check role
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - User not found' },
        { status: 401 }
      );
    }

    const userData = userDoc.data();
    if (!userData?.role || !CONVERT_ALLOWED_ROLES.includes(userData.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get existing quotation
    const quotationDoc = await adminDb
      .collection(QUOTATIONS_COLLECTION)
      .doc(quotationId)
      .get();
    if (!quotationDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Quotation not found' },
        { status: 404 }
      );
    }

    const quotation = quotationDoc.data();

    // Only allow conversion of accepted quotations (or sent for flexibility)
    if (!['accepted', 'sent'].includes(quotation?.status || '')) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot convert quotation with status: ${quotation?.status}. Only accepted or sent quotations can be converted.`,
        },
        { status: 400 }
      );
    }

    // Check if quotation is not expired
    const validUntil = quotation?.validUntil?.toDate() || new Date();
    if (new Date() > validUntil && quotation?.status !== 'accepted') {
      return NextResponse.json(
        { success: false, error: 'Quotation has expired' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json().catch(() => ({}));
    const validationResult = convertQuotationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const conversionData = validationResult.data;

    // Generate order ID
    const orderId = await generateOrderId(quotation?.branchId);
    const now = Timestamp.now();

    // Convert quotation items to garments
    const garments = convertItemsToGarments(orderId, quotation?.items || []);

    // Determine payment status
    let paymentStatus: 'pending' | 'partial' | 'paid' = 'pending';
    if (conversionData.paidAmount >= (quotation?.totalAmount || 0)) {
      paymentStatus = 'paid';
    } else if (conversionData.paidAmount > 0) {
      paymentStatus = 'partial';
    }

    // Create the order
    const order = {
      orderId,
      customerId: quotation?.customerId,
      customerName: quotation?.customerName,
      customerPhone: quotation?.customerPhone,
      branchId: quotation?.branchId,
      status: 'received',
      garments,
      totalAmount: quotation?.totalAmount || 0,
      paidAmount: conversionData.paidAmount,
      paymentStatus,
      paymentMethod: conversionData.paymentMethod || null,
      collectionMethod: conversionData.collectionMethod,
      returnMethod: conversionData.returnMethod,
      deliveryAddress: conversionData.deliveryAddress || null,
      pickupAddress: conversionData.pickupAddress || null,
      deliveryFee: quotation?.deliveryFee || 0,
      discountAmount: quotation?.discountAmount || 0,
      discountReason: quotation?.discountReason || null,
      estimatedCompletion: quotation?.estimatedCompletion,
      specialInstructions: conversionData.specialInstructions || quotation?.notes || null,
      quotationId: quotationId, // Link back to quotation
      createdBy: decodedToken.uid,
      createdByName: userData.name || userData.email || 'Unknown',
      createdAt: now,
      updatedAt: now,
      statusHistory: [
        {
          status: 'received',
          timestamp: now,
          updatedBy: decodedToken.uid,
          updatedByName: userData.name || userData.email || 'Unknown',
          notes: `Converted from quotation ${quotationId}`,
        },
      ],
    };

    // Use a transaction to ensure both operations succeed
    await adminDb.runTransaction(async (transaction) => {
      // Create the order
      transaction.set(adminDb.collection(ORDERS_COLLECTION).doc(orderId), order);

      // Update quotation status
      transaction.update(adminDb.collection(QUOTATIONS_COLLECTION).doc(quotationId), {
        status: 'converted',
        convertedOrderId: orderId,
        convertedAt: now,
        updatedAt: now,
      });

      // Update customer stats
      // Note: totalSpent should reflect the order's totalAmount (not paidAmount)
      // because totalSpent tracks the total value of services used, regardless of current payment status
      const customerRef = adminDb.collection('customers').doc(quotation?.customerId);
      const customerDoc = await transaction.get(customerRef);
      if (customerDoc.exists) {
        const customerData = customerDoc.data();
        transaction.update(customerRef, {
          orderCount: (customerData?.orderCount || 0) + 1,
          totalSpent: (customerData?.totalSpent || 0) + (quotation?.totalAmount || 0),
          lastOrderDate: now,
          updatedAt: now,
        });
      }
    });

    // Create a transaction record if payment was made
    if (conversionData.paidAmount > 0 && conversionData.paymentMethod) {
      await adminDb.collection('transactions').add({
        orderId,
        customerId: quotation?.customerId,
        amount: conversionData.paidAmount,
        method: conversionData.paymentMethod,
        type: 'payment',
        status: 'completed',
        branchId: quotation?.branchId,
        processedBy: decodedToken.uid,
        processedByName: userData.name || userData.email || 'Unknown',
        notes: `Payment for order converted from quotation ${quotationId}`,
        timestamp: now,
        createdAt: now,
      });
    }

    // Log the conversion
    await adminDb.collection('notifications').add({
      type: 'quotation_converted',
      recipientId: quotation?.customerId,
      recipientPhone: quotation?.customerPhone,
      orderId: orderId,
      quotationId: quotationId,
      message: `Quotation ${quotationId} converted to order ${orderId}`,
      status: 'pending',
      channel: 'whatsapp',
      timestamp: now,
    });

    return NextResponse.json({
      success: true,
      data: {
        order,
        quotationId,
        message: `Quotation ${quotationId} successfully converted to order ${orderId}`,
      },
    });
  } catch (error) {
    console.error('Error converting quotation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
