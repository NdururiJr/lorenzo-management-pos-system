/**
 * Branch Configuration API (FR-007)
 *
 * Handles branch-specific configuration including:
 * - Sorting window hours
 * - Daily targets
 * - Turnaround time targets
 *
 * @module app/api/branches/[branchId]/config
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

// ============================================
// GET /api/branches/[branchId]/config
// ============================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ branchId: string }> }
) {
  try {
    const { branchId } = await params;

    if (!branchId) {
      return NextResponse.json(
        { error: 'Branch ID is required' },
        { status: 400 }
      );
    }

    const branchDoc = await adminDb.collection('branches').doc(branchId).get();

    if (!branchDoc.exists) {
      return NextResponse.json(
        { error: 'Branch not found' },
        { status: 404 }
      );
    }

    const branch = branchDoc.data();

    return NextResponse.json({
      success: true,
      branchId,
      config: {
        sortingWindowHours: branch?.sortingWindowHours || 6,
        dailyTarget: branch?.dailyTarget || 0,
        targetTurnaroundHours: branch?.targetTurnaroundHours || 24,
        driverAvailability: branch?.driverAvailability || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching branch config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch branch configuration' },
      { status: 500 }
    );
  }
}

// ============================================
// PATCH /api/branches/[branchId]/config
// ============================================
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ branchId: string }> }
) {
  try {
    const { branchId } = await params;
    const body = await request.json();

    if (!branchId) {
      return NextResponse.json(
        { error: 'Branch ID is required' },
        { status: 400 }
      );
    }

    // Verify branch exists
    const branchDoc = await adminDb.collection('branches').doc(branchId).get();

    if (!branchDoc.exists) {
      return NextResponse.json(
        { error: 'Branch not found' },
        { status: 404 }
      );
    }

    // Validate and build update object
    const updates: Record<string, unknown> = {};

    // Sorting window hours (FR-007)
    if (body.sortingWindowHours !== undefined) {
      const hours = Number(body.sortingWindowHours);
      if (isNaN(hours) || hours < 1 || hours > 48) {
        return NextResponse.json(
          { error: 'Sorting window must be between 1 and 48 hours' },
          { status: 400 }
        );
      }
      updates.sortingWindowHours = hours;
    }

    // Daily revenue target
    if (body.dailyTarget !== undefined) {
      const target = Number(body.dailyTarget);
      if (isNaN(target) || target < 0) {
        return NextResponse.json(
          { error: 'Daily target must be a non-negative number' },
          { status: 400 }
        );
      }
      updates.dailyTarget = target;
    }

    // Target turnaround time
    if (body.targetTurnaroundHours !== undefined) {
      const hours = Number(body.targetTurnaroundHours);
      if (isNaN(hours) || hours < 1 || hours > 168) {
        return NextResponse.json(
          { error: 'Target turnaround must be between 1 and 168 hours' },
          { status: 400 }
        );
      }
      updates.targetTurnaroundHours = hours;
    }

    // Driver availability
    if (body.driverAvailability !== undefined) {
      const availability = Number(body.driverAvailability);
      if (isNaN(availability) || availability < 0) {
        return NextResponse.json(
          { error: 'Driver availability must be a non-negative number' },
          { status: 400 }
        );
      }
      updates.driverAvailability = availability;
    }

    // Check if there's anything to update
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update the branch
    await adminDb.collection('branches').doc(branchId).update(updates);

    // Get the updated branch
    const updatedDoc = await adminDb.collection('branches').doc(branchId).get();
    const updatedBranch = updatedDoc.data();

    return NextResponse.json({
      success: true,
      branchId,
      config: {
        sortingWindowHours: updatedBranch?.sortingWindowHours || 6,
        dailyTarget: updatedBranch?.dailyTarget || 0,
        targetTurnaroundHours: updatedBranch?.targetTurnaroundHours || 24,
        driverAvailability: updatedBranch?.driverAvailability || 0,
      },
      message: 'Branch configuration updated successfully',
    });
  } catch (error) {
    console.error('Error updating branch config:', error);
    return NextResponse.json(
      { error: 'Failed to update branch configuration' },
      { status: 500 }
    );
  }
}
