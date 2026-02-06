/**
 * Pricing Rules API (FR-015)
 *
 * Manages pricing rules for load-based pricing.
 *
 * @module app/api/pricing/rules
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// ============================================
// POST /api/pricing/rules - Create pricing rule
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      ruleName,
      branchId,
      serviceType,
      customerSegment = 'regular',
      pricingType,
      basePrice,
      pricePerKg,
      minWeightKg,
      maxWeightKg,
      discountPercentage,
      priority = 10,
    } = body;

    // Validation
    if (!ruleName || !branchId || !serviceType || !pricingType) {
      return NextResponse.json(
        { error: 'Missing required fields: ruleName, branchId, serviceType, pricingType' },
        { status: 400 }
      );
    }

    if (!['per_item', 'per_kg', 'hybrid'].includes(pricingType)) {
      return NextResponse.json(
        { error: 'Invalid pricingType. Must be: per_item, per_kg, or hybrid' },
        { status: 400 }
      );
    }

    if (!['regular', 'vip', 'corporate'].includes(customerSegment)) {
      return NextResponse.json(
        { error: 'Invalid customerSegment. Must be: regular, vip, or corporate' },
        { status: 400 }
      );
    }

    // Generate rule ID
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 6);
    const ruleId = `RULE-${timestamp}-${random}`.toUpperCase();

    const rule = {
      ruleId,
      ruleName,
      branchId,
      serviceType,
      customerSegment,
      pricingType,
      basePrice: basePrice || 0,
      pricePerKg: pricePerKg || 0,
      minWeightKg: minWeightKg || null,
      maxWeightKg: maxWeightKg || null,
      discountPercentage: discountPercentage || 0,
      priority,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await adminDb.collection('pricingRules').doc(ruleId).set(rule);

    return NextResponse.json({
      success: true,
      ruleId,
      rule,
    });
  } catch (error) {
    console.error('Error creating pricing rule:', error);
    return NextResponse.json(
      { error: 'Failed to create pricing rule' },
      { status: 500 }
    );
  }
}

// ============================================
// GET /api/pricing/rules - Get pricing rules
// ============================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const serviceType = searchParams.get('serviceType');
    const customerSegment = searchParams.get('customerSegment');
    const activeOnly = searchParams.get('activeOnly') !== 'false';

    let query = adminDb.collection('pricingRules') as FirebaseFirestore.Query;

    if (activeOnly) {
      query = query.where('isActive', '==', true);
    }

    if (branchId) {
      query = query.where('branchId', 'in', [branchId, 'ALL']);
    }

    if (serviceType) {
      query = query.where('serviceType', '==', serviceType);
    }

    if (customerSegment) {
      query = query.where('customerSegment', '==', customerSegment);
    }

    const snapshot = await query.orderBy('priority', 'desc').get();

    const rules = snapshot.docs.map((doc) => ({
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || null,
      updatedAt: doc.data().updatedAt?.toDate?.() || null,
    }));

    return NextResponse.json({
      success: true,
      rules,
      count: rules.length,
    });
  } catch (error) {
    console.error('Error fetching pricing rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricing rules' },
      { status: 500 }
    );
  }
}

// ============================================
// PATCH /api/pricing/rules - Update pricing rule
// ============================================
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { ruleId, ...updates } = body;

    if (!ruleId) {
      return NextResponse.json(
        { error: 'Rule ID is required' },
        { status: 400 }
      );
    }

    const ruleRef = adminDb.collection('pricingRules').doc(ruleId);
    const ruleDoc = await ruleRef.get();

    if (!ruleDoc.exists) {
      return NextResponse.json(
        { error: 'Pricing rule not found' },
        { status: 404 }
      );
    }

    // Remove fields that shouldn't be updated
    delete updates.ruleId;
    delete updates.createdAt;

    await ruleRef.update({
      ...updates,
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      ruleId,
      message: 'Pricing rule updated',
    });
  } catch (error) {
    console.error('Error updating pricing rule:', error);
    return NextResponse.json(
      { error: 'Failed to update pricing rule' },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE /api/pricing/rules - Deactivate rule
// ============================================
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ruleId = searchParams.get('ruleId');
    const hardDelete = searchParams.get('hardDelete') === 'true';

    if (!ruleId) {
      return NextResponse.json(
        { error: 'Rule ID is required' },
        { status: 400 }
      );
    }

    const ruleRef = adminDb.collection('pricingRules').doc(ruleId);
    const ruleDoc = await ruleRef.get();

    if (!ruleDoc.exists) {
      return NextResponse.json(
        { error: 'Pricing rule not found' },
        { status: 404 }
      );
    }

    if (hardDelete) {
      await ruleRef.delete();
      return NextResponse.json({
        success: true,
        message: 'Pricing rule deleted permanently',
      });
    } else {
      await ruleRef.update({
        isActive: false,
        updatedAt: Timestamp.now(),
      });
      return NextResponse.json({
        success: true,
        message: 'Pricing rule deactivated',
      });
    }
  } catch (error) {
    console.error('Error deleting pricing rule:', error);
    return NextResponse.json(
      { error: 'Failed to delete pricing rule' },
      { status: 500 }
    );
  }
}
