/**
 * Delivery Fee Calculation API Route (FR-013)
 *
 * Calculates delivery fee based on order details and active rules.
 *
 * @module app/api/orders/calculate-delivery-fee/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, verifyIdToken } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';

const COLLECTION_NAME = 'deliveryFeeRules';

/** Default delivery fee when no rules match */
const DEFAULT_DELIVERY_FEE = 200;

/**
 * Validation schema for fee calculation request
 */
const calculateFeeSchema = z.object({
  branchId: z.string().min(1),
  orderAmount: z.number().min(0),
  customerSegment: z.enum(['regular', 'vip', 'corporate']).optional(),
  distanceKm: z.number().min(0).optional(),
});

/**
 * Check if current time is within a time range
 */
function isWithinTimeRange(startTime?: string, endTime?: string): boolean {
  if (!startTime || !endTime) return true;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  if (endMinutes < startMinutes) {
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

/**
 * Check if current day is in the allowed days
 */
function isAllowedDay(daysOfWeek?: number[]): boolean {
  if (!daysOfWeek || daysOfWeek.length === 0) return true;
  const today = new Date().getDay();
  return daysOfWeek.includes(today);
}

interface RuleData {
  ruleId: string;
  name: string;
  branchId: string;
  priority: number;
  active: boolean;
  validFrom: FirebaseFirestore.Timestamp;
  validUntil?: FirebaseFirestore.Timestamp;
  conditions: {
    minOrderAmount?: number;
    customerSegments?: string[];
    maxDistanceKm?: number;
    daysOfWeek?: number[];
    startTime?: string;
    endTime?: string;
  };
  feeCalculation: {
    type: 'free' | 'fixed' | 'per_km' | 'percentage';
    value: number;
    minFee?: number;
    maxFee?: number;
  };
}

/**
 * POST /api/orders/calculate-delivery-fee
 *
 * Calculate delivery fee for an order
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Missing or invalid token' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    try {
      await verifyIdToken(idToken);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = calculateFeeSchema.safeParse(body);

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

    const { branchId, orderAmount, customerSegment, distanceKm } = validationResult.data;
    const now = Timestamp.now();

    // Get all active rules, sorted by priority descending
    const snapshot = await adminDb
      .collection(COLLECTION_NAME)
      .where('active', '==', true)
      .orderBy('priority', 'desc')
      .get();

    // Filter rules by branch and validity
    const rules = snapshot.docs
      .map((doc) => doc.data() as RuleData)
      .filter((rule) => {
        // Check branch
        if (rule.branchId !== 'ALL' && rule.branchId !== branchId) {
          return false;
        }

        // Check validFrom
        if (rule.validFrom && rule.validFrom.toMillis() > now.toMillis()) {
          return false;
        }

        // Check validUntil
        if (rule.validUntil && rule.validUntil.toMillis() < now.toMillis()) {
          return false;
        }

        return true;
      });

    // Find the first matching rule
    for (const rule of rules) {
      const { conditions } = rule;

      // Check minimum order amount
      if (conditions.minOrderAmount !== undefined) {
        if (orderAmount < conditions.minOrderAmount) {
          continue;
        }
      }

      // Check customer segment
      if (conditions.customerSegments && conditions.customerSegments.length > 0) {
        if (!customerSegment || !conditions.customerSegments.includes(customerSegment)) {
          continue;
        }
      }

      // Check distance
      if (conditions.maxDistanceKm !== undefined && distanceKm !== undefined) {
        if (distanceKm > conditions.maxDistanceKm) {
          continue;
        }
      }

      // Check day of week
      if (!isAllowedDay(conditions.daysOfWeek)) {
        continue;
      }

      // Check time range
      if (!isWithinTimeRange(conditions.startTime, conditions.endTime)) {
        continue;
      }

      // Rule matches - calculate fee
      const { feeCalculation } = rule;
      let fee = 0;

      switch (feeCalculation.type) {
        case 'free':
          fee = 0;
          break;

        case 'fixed':
          fee = feeCalculation.value;
          break;

        case 'per_km':
          if (distanceKm !== undefined) {
            fee = feeCalculation.value * distanceKm;
          } else {
            fee = feeCalculation.value * 5; // Default 5km
          }
          break;

        case 'percentage':
          fee = (feeCalculation.value / 100) * orderAmount;
          break;
      }

      // Apply min/max constraints
      if (feeCalculation.minFee !== undefined && fee < feeCalculation.minFee) {
        fee = feeCalculation.minFee;
      }
      if (feeCalculation.maxFee !== undefined && fee > feeCalculation.maxFee) {
        fee = feeCalculation.maxFee;
      }

      fee = Math.round(fee);

      return NextResponse.json({
        success: true,
        data: {
          fee,
          isFree: fee === 0,
          ruleApplied: rule.ruleId,
          ruleName: rule.name,
          feeType: feeCalculation.type,
          reason: fee === 0
            ? `Free delivery: ${rule.name}`
            : `${rule.name}`,
        },
      });
    }

    // No rules matched - return default fee
    return NextResponse.json({
      success: true,
      data: {
        fee: DEFAULT_DELIVERY_FEE,
        isFree: false,
        ruleApplied: null,
        ruleName: null,
        feeType: 'fixed',
        reason: 'Standard delivery fee',
      },
    });
  } catch (error) {
    console.error('Error calculating delivery fee:', error);
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
