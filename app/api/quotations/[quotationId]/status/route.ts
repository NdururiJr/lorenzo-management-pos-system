/**
 * Quotation Status Update API Route (FR-001)
 *
 * Handles status transitions for quotations (accept, reject, expire).
 *
 * @module app/api/quotations/[quotationId]/status/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, verifyIdToken } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';

const COLLECTION_NAME = 'quotations';

/**
 * Roles allowed to update quotation status
 */
const STATUS_UPDATE_ALLOWED_ROLES = [
  'admin',
  'director',
  'general_manager',
  'store_manager',
  'front_desk',
];

/**
 * Valid status transitions
 */
const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ['sent', 'rejected', 'expired'],
  sent: ['accepted', 'rejected', 'expired'],
  accepted: ['converted', 'rejected'],
  rejected: [], // Terminal state
  expired: [], // Terminal state
  converted: [], // Terminal state
};

/**
 * Validation schema for status update
 */
const statusUpdateSchema = z.object({
  action: z.enum(['accept', 'reject', 'expire']),
  reason: z.string().optional(),
});

/**
 * PUT /api/quotations/[quotationId]/status
 *
 * Update quotation status (accept, reject, expire)
 */
export async function PUT(
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

    // For accept action, allow customer role as well
    // Parse body first to check action
    const body = await request.json();
    const validationResult = statusUpdateSchema.safeParse(body);

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

    const { action, reason } = validationResult.data;

    // Check permissions
    const isCustomerAction = action === 'accept' || action === 'reject';
    const isStaffRole = STATUS_UPDATE_ALLOWED_ROLES.includes(userData?.role || '');
    const isCustomerRole = userData?.role === 'customer';

    if (!isStaffRole && !(isCustomerAction && isCustomerRole)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get existing quotation
    const quotationDoc = await adminDb.collection(COLLECTION_NAME).doc(quotationId).get();
    if (!quotationDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Quotation not found' },
        { status: 404 }
      );
    }

    const quotation = quotationDoc.data();
    const currentStatus = quotation?.status || 'draft';

    // If customer, verify they own this quotation
    if (isCustomerRole && quotation?.customerId !== decodedToken.uid) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - This quotation belongs to another customer' },
        { status: 403 }
      );
    }

    // Determine new status based on action
    let newStatus: string;
    switch (action) {
      case 'accept':
        newStatus = 'accepted';
        break;
      case 'reject':
        newStatus = 'rejected';
        break;
      case 'expire':
        newStatus = 'expired';
        break;
      default:
        return NextResponse.json(
          { success: false, error: `Invalid action: ${action}` },
          { status: 400 }
        );
    }

    // Validate transition
    const allowedTransitions = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowedTransitions.includes(newStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot ${action} quotation with status: ${currentStatus}`,
        },
        { status: 400 }
      );
    }

    // For accept action, check if not expired
    if (action === 'accept') {
      const validUntil = quotation?.validUntil?.toDate() || new Date();
      if (new Date() > validUntil) {
        return NextResponse.json(
          { success: false, error: 'Cannot accept - quotation has expired' },
          { status: 400 }
        );
      }
    }

    // Build update data
    const now = Timestamp.now();
    const updateData: Record<string, unknown> = {
      status: newStatus,
      updatedAt: now,
    };

    if (action === 'accept') {
      updateData.acceptedAt = now;
    } else if (action === 'reject') {
      updateData.rejectedAt = now;
      if (reason) {
        updateData.rejectionReason = reason;
      }
    }

    // Update quotation
    await adminDb.collection(COLLECTION_NAME).doc(quotationId).update(updateData);

    // Create notification for status change
    if (action === 'accept') {
      await adminDb.collection('notifications').add({
        type: 'quotation_accepted',
        recipientId: quotation?.createdBy, // Notify staff
        recipientPhone: null,
        orderId: null,
        quotationId: quotationId,
        message: `Quotation ${quotationId} has been accepted by ${quotation?.customerName}`,
        status: 'pending',
        channel: 'internal',
        timestamp: now,
      });
    }

    // Get updated quotation
    const updatedDoc = await adminDb.collection(COLLECTION_NAME).doc(quotationId).get();
    const updatedQuotation = {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    };

    return NextResponse.json({
      success: true,
      data: updatedQuotation,
      message: `Quotation ${action}ed successfully`,
    });
  } catch (error) {
    console.error('Error updating quotation status:', error);
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
