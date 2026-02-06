/**
 * Corporate Agreements API (FR-017)
 *
 * Manages corporate agreements for business customers.
 *
 * @module app/api/corporate
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// ============================================
// POST /api/corporate - Create agreement
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      companyName,
      agreementNumber,
      contactPerson,
      contactEmail,
      contactPhone,
      employeeCount,
      discountPercentage,
      billingCycle = 'monthly',
      startDate,
      endDate,
      branchId,
      notes,
    } = body;

    // Validation
    if (!companyName || !agreementNumber || discountPercentage === undefined) {
      return NextResponse.json(
        { error: 'companyName, agreementNumber, and discountPercentage are required' },
        { status: 400 }
      );
    }

    if (discountPercentage < 0 || discountPercentage > 100) {
      return NextResponse.json(
        { error: 'discountPercentage must be between 0 and 100' },
        { status: 400 }
      );
    }

    if (!['monthly', 'quarterly', 'annual'].includes(billingCycle)) {
      return NextResponse.json(
        { error: 'billingCycle must be: monthly, quarterly, or annual' },
        { status: 400 }
      );
    }

    // Check for duplicate agreement number
    const existingSnapshot = await adminDb
      .collection('corporateAgreements')
      .where('agreementNumber', '==', agreementNumber)
      .limit(1)
      .get();

    if (!existingSnapshot.empty) {
      return NextResponse.json(
        { error: 'Agreement number already exists' },
        { status: 400 }
      );
    }

    // Generate agreement ID
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 6);
    const agreementId = `AGR-${timestamp}-${random}`.toUpperCase();

    const agreement = {
      agreementId,
      companyName,
      agreementNumber,
      contactPerson: contactPerson || null,
      contactEmail: contactEmail || null,
      contactPhone: contactPhone || null,
      employeeCount: employeeCount || null,
      discountPercentage,
      billingCycle,
      startDate: startDate ? Timestamp.fromDate(new Date(startDate)) : Timestamp.now(),
      endDate: endDate ? Timestamp.fromDate(new Date(endDate)) : null,
      branchId: branchId || null,
      notes: notes || null,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await adminDb.collection('corporateAgreements').doc(agreementId).set(agreement);

    return NextResponse.json({
      success: true,
      agreementId,
      agreement: {
        ...agreement,
        startDate: agreement.startDate.toDate().toISOString(),
        endDate: agreement.endDate?.toDate?.()?.toISOString() || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error creating corporate agreement:', error);
    return NextResponse.json(
      { error: 'Failed to create corporate agreement' },
      { status: 500 }
    );
  }
}

// ============================================
// GET /api/corporate - List agreements
// ============================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agreementId = searchParams.get('agreementId');
    const activeOnly = searchParams.get('activeOnly') !== 'false';
    const branchId = searchParams.get('branchId');
    const includeCustomers = searchParams.get('includeCustomers') === 'true';
    const limitParam = searchParams.get('limit');
    const limitCount = limitParam ? parseInt(limitParam, 10) : 50;

    // Get single agreement
    if (agreementId) {
      const doc = await adminDb.collection('corporateAgreements').doc(agreementId).get();

      if (!doc.exists) {
        return NextResponse.json(
          { error: 'Agreement not found' },
          { status: 404 }
        );
      }

      const agreement = doc.data();

      // Get linked customers if requested
      let customers: object[] = [];
      if (includeCustomers) {
        const customersSnapshot = await adminDb
          .collection('customers')
          .where('corporateAgreementId', '==', agreementId)
          .orderBy('name', 'asc')
          .get();

        customers = customersSnapshot.docs.map((d) => ({
          customerId: d.data().customerId,
          name: d.data().name,
          phone: d.data().phone,
          email: d.data().email,
          totalSpent: d.data().totalSpent,
          orderCount: d.data().orderCount,
        }));
      }

      return NextResponse.json({
        success: true,
        agreement: {
          ...agreement,
          startDate: agreement?.startDate?.toDate?.()?.toISOString() || null,
          endDate: agreement?.endDate?.toDate?.()?.toISOString() || null,
          createdAt: agreement?.createdAt?.toDate?.()?.toISOString() || null,
          updatedAt: agreement?.updatedAt?.toDate?.()?.toISOString() || null,
        },
        customers: includeCustomers ? customers : undefined,
        customerCount: includeCustomers ? customers.length : undefined,
      });
    }

    // List agreements
    let query = adminDb.collection('corporateAgreements') as FirebaseFirestore.Query;

    if (activeOnly) {
      query = query.where('isActive', '==', true);
    }

    if (branchId) {
      query = query.where('branchId', '==', branchId);
    }

    const snapshot = await query
      .orderBy('companyName', 'asc')
      .limit(limitCount)
      .get();

    const agreements = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();

        // Get customer count
        let customerCount = 0;
        if (includeCustomers) {
          const countSnapshot = await adminDb
            .collection('customers')
            .where('corporateAgreementId', '==', data.agreementId)
            .count()
            .get();
          customerCount = countSnapshot.data().count;
        }

        return {
          ...data,
          startDate: data.startDate?.toDate?.()?.toISOString() || null,
          endDate: data.endDate?.toDate?.()?.toISOString() || null,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
          customerCount: includeCustomers ? customerCount : undefined,
        };
      })
    );

    return NextResponse.json({
      success: true,
      agreements,
      count: agreements.length,
    });
  } catch (error) {
    console.error('Error fetching corporate agreements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch corporate agreements' },
      { status: 500 }
    );
  }
}

// ============================================
// PATCH /api/corporate - Update agreement
// ============================================
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { agreementId, ...updates } = body;

    if (!agreementId) {
      return NextResponse.json(
        { error: 'agreementId is required' },
        { status: 400 }
      );
    }

    const docRef = adminDb.collection('corporateAgreements').doc(agreementId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Agreement not found' },
        { status: 404 }
      );
    }

    // Remove fields that shouldn't be updated
    delete updates.agreementId;
    delete updates.createdAt;

    // Convert dates
    if (updates.startDate) {
      updates.startDate = Timestamp.fromDate(new Date(updates.startDate));
    }
    if (updates.endDate) {
      updates.endDate = Timestamp.fromDate(new Date(updates.endDate));
    }

    // Validate discount
    if (updates.discountPercentage !== undefined) {
      if (updates.discountPercentage < 0 || updates.discountPercentage > 100) {
        return NextResponse.json(
          { error: 'discountPercentage must be between 0 and 100' },
          { status: 400 }
        );
      }
    }

    // Validate billing cycle
    if (updates.billingCycle) {
      if (!['monthly', 'quarterly', 'annual'].includes(updates.billingCycle)) {
        return NextResponse.json(
          { error: 'billingCycle must be: monthly, quarterly, or annual' },
          { status: 400 }
        );
      }
    }

    await docRef.update({
      ...updates,
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      agreementId,
      message: 'Agreement updated',
    });
  } catch (error) {
    console.error('Error updating corporate agreement:', error);
    return NextResponse.json(
      { error: 'Failed to update corporate agreement' },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE /api/corporate - Deactivate agreement
// ============================================
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agreementId = searchParams.get('agreementId');
    const unlinkCustomers = searchParams.get('unlinkCustomers') === 'true';
    const hardDelete = searchParams.get('hardDelete') === 'true';

    if (!agreementId) {
      return NextResponse.json(
        { error: 'agreementId is required' },
        { status: 400 }
      );
    }

    const docRef = adminDb.collection('corporateAgreements').doc(agreementId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Agreement not found' },
        { status: 404 }
      );
    }

    // Unlink customers if requested
    if (unlinkCustomers) {
      const customersSnapshot = await adminDb
        .collection('customers')
        .where('corporateAgreementId', '==', agreementId)
        .get();

      const batch = adminDb.batch();
      customersSnapshot.forEach((customerDoc) => {
        batch.update(customerDoc.ref, {
          corporateAgreementId: null,
          segment: 'regular', // Reset to regular (will be re-evaluated later)
          lastSegmentEvaluation: Timestamp.now(),
        });
      });

      await batch.commit();
    }

    if (hardDelete) {
      await docRef.delete();
      return NextResponse.json({
        success: true,
        message: 'Agreement permanently deleted',
      });
    } else {
      await docRef.update({
        isActive: false,
        updatedAt: Timestamp.now(),
      });
      return NextResponse.json({
        success: true,
        message: 'Agreement deactivated',
      });
    }
  } catch (error) {
    console.error('Error deleting corporate agreement:', error);
    return NextResponse.json(
      { error: 'Failed to delete corporate agreement' },
      { status: 500 }
    );
  }
}
