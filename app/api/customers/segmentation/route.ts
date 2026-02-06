/**
 * Customer Segmentation API (FR-017)
 *
 * Manages customer segments and statistics.
 *
 * @module app/api/customers/segmentation
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// VIP thresholds
const VIP_THRESHOLDS = {
  minOrders: 10,
  minSpend: 50000,
  periodMonths: 12,
};

// Helper function to evaluate customer segment (avoids recursive POST call)
async function evaluateCustomerSegmentInternal(
  customerId: string
): Promise<{ segment: string; qualified: boolean; message: string }> {
  const customerRef = adminDb.collection('customers').doc(customerId);
  const customerDoc = await customerRef.get();

  if (!customerDoc.exists) {
    throw new Error('Customer not found');
  }

  const customer = customerDoc.data();

  // Check corporate status
  if (customer?.corporateAgreementId) {
    const agreementDoc = await adminDb
      .collection('corporateAgreements')
      .doc(customer.corporateAgreementId)
      .get();

    if (agreementDoc.exists && agreementDoc.data()?.isActive) {
      await customerRef.update({
        segment: 'corporate',
        lastSegmentEvaluation: Timestamp.now(),
      });

      return {
        segment: 'corporate',
        qualified: true,
        message: 'Customer segment: corporate (from agreement)',
      };
    }
  }

  // Check VIP criteria
  const statsDoc = await adminDb.collection('customerStatistics').doc(customerId).get();
  const stats = statsDoc.exists ? statsDoc.data() : { last12MonthsOrders: 0, last12MonthsSpend: 0 };

  const qualifiesForVIP =
    (stats?.last12MonthsOrders || 0) >= VIP_THRESHOLDS.minOrders ||
    (stats?.last12MonthsSpend || 0) >= VIP_THRESHOLDS.minSpend;

  const newSegment = qualifiesForVIP ? 'vip' : 'regular';
  const updates: Record<string, unknown> = {
    segment: newSegment,
    lastSegmentEvaluation: Timestamp.now(),
  };

  if (newSegment === 'vip' && customer?.segment !== 'vip') {
    updates.vipQualifiedAt = Timestamp.now();
  }

  await customerRef.update(updates);

  return {
    segment: newSegment,
    qualified: qualifiesForVIP,
    message: `Customer segment: ${newSegment}`,
  };
}

// ============================================
// GET /api/customers/segmentation - Get segment info
// ============================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const type = searchParams.get('type'); // 'summary', 'vip', 'approaching', 'segment'
    const segment = searchParams.get('segment');
    const limitParam = searchParams.get('limit');
    const limitCount = limitParam ? parseInt(limitParam, 10) : 50;

    // Get segment summary
    if (type === 'summary') {
      const [regularSnap, vipSnap, corporateSnap] = await Promise.all([
        adminDb.collection('customers').where('segment', '==', 'regular').count().get(),
        adminDb.collection('customers').where('segment', '==', 'vip').count().get(),
        adminDb.collection('customers').where('segment', '==', 'corporate').count().get(),
      ]);

      return NextResponse.json({
        success: true,
        summary: {
          regular: regularSnap.data().count,
          vip: vipSnap.data().count,
          corporate: corporateSnap.data().count,
          total: regularSnap.data().count + vipSnap.data().count + corporateSnap.data().count,
        },
        thresholds: VIP_THRESHOLDS,
      });
    }

    // Get customers by segment
    if (type === 'segment' || segment) {
      const targetSegment = segment || 'regular';
      const snapshot = await adminDb
        .collection('customers')
        .where('segment', '==', targetSegment)
        .orderBy('totalSpent', 'desc')
        .limit(limitCount)
        .get();

      const customers = snapshot.docs.map((doc) => ({
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || null,
        vipQualifiedAt: doc.data().vipQualifiedAt?.toDate?.() || null,
      }));

      return NextResponse.json({
        success: true,
        segment: targetSegment,
        customers,
        count: customers.length,
      });
    }

    // Get single customer's segment info
    if (customerId) {
      const customerDoc = await adminDb.collection('customers').doc(customerId).get();

      if (!customerDoc.exists) {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        );
      }

      const customer = customerDoc.data();

      // Get statistics
      const statsDoc = await adminDb.collection('customerStatistics').doc(customerId).get();
      const stats = statsDoc.exists ? statsDoc.data() : null;

      // Calculate VIP progress
      const orderProgress = stats
        ? Math.round((stats.last12MonthsOrders / VIP_THRESHOLDS.minOrders) * 100)
        : 0;
      const spendProgress = stats
        ? Math.round((stats.last12MonthsSpend / VIP_THRESHOLDS.minSpend) * 100)
        : 0;

      return NextResponse.json({
        success: true,
        customerId,
        segment: customer?.segment || 'regular',
        vipQualifiedAt: customer?.vipQualifiedAt?.toDate?.() || null,
        corporateAgreementId: customer?.corporateAgreementId || null,
        statistics: stats
          ? {
              totalOrders: stats.totalOrders,
              totalSpend: stats.totalSpend,
              last12MonthsOrders: stats.last12MonthsOrders,
              last12MonthsSpend: stats.last12MonthsSpend,
              avgOrderValue: stats.avgOrderValue,
              daysSinceLastOrder: stats.daysSinceLastOrder,
              lastOrderDate: stats.lastOrderDate?.toDate?.() || null,
            }
          : null,
        vipProgress: {
          orders: Math.min(100, orderProgress),
          spend: Math.min(100, spendProgress),
          qualifiesForVIP: orderProgress >= 100 || spendProgress >= 100,
        },
        thresholds: VIP_THRESHOLDS,
      });
    }

    // Get customers approaching VIP
    if (type === 'approaching') {
      const snapshot = await adminDb
        .collection('customers')
        .where('segment', '==', 'regular')
        .orderBy('totalSpent', 'desc')
        .limit(100)
        .get();

      const approaching = [];

      for (const doc of snapshot.docs) {
        const customer = doc.data();
        const statsDoc = await adminDb
          .collection('customerStatistics')
          .doc(customer.customerId)
          .get();

        if (!statsDoc.exists) continue;

        const stats = statsDoc.data();
        const orderProgress = (stats?.last12MonthsOrders || 0) / VIP_THRESHOLDS.minOrders * 100;
        const spendProgress = (stats?.last12MonthsSpend || 0) / VIP_THRESHOLDS.minSpend * 100;

        if (orderProgress >= 60 || spendProgress >= 60) {
          approaching.push({
            customerId: customer.customerId,
            name: customer.name,
            phone: customer.phone,
            totalSpent: customer.totalSpent,
            orderCount: customer.orderCount,
            vipProgress: {
              orders: Math.round(orderProgress),
              spend: Math.round(spendProgress),
            },
          });
        }

        if (approaching.length >= limitCount) break;
      }

      return NextResponse.json({
        success: true,
        approaching,
        count: approaching.length,
        thresholds: VIP_THRESHOLDS,
      });
    }

    return NextResponse.json(
      { error: 'Invalid request. Use type=summary, type=segment, type=approaching, or provide customerId' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching segmentation data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch segmentation data' },
      { status: 500 }
    );
  }
}

// ============================================
// POST /api/customers/segmentation - Segment operations
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, customerId, agreementId, segment } = body;

    // Evaluate segment
    if (action === 'evaluate') {
      if (!customerId) {
        return NextResponse.json(
          { error: 'customerId is required' },
          { status: 400 }
        );
      }

      try {
        const result = await evaluateCustomerSegmentInternal(customerId);
        return NextResponse.json({
          success: true,
          segment: result.segment,
          message: result.message,
          qualified: result.qualified,
        });
      } catch (error) {
        if (error instanceof Error && error.message === 'Customer not found') {
          return NextResponse.json(
            { error: 'Customer not found' },
            { status: 404 }
          );
        }
        throw error;
      }
    }

    // Manually set segment
    if (action === 'set_segment') {
      if (!customerId || !segment) {
        return NextResponse.json(
          { error: 'customerId and segment are required' },
          { status: 400 }
        );
      }

      if (!['regular', 'vip', 'corporate'].includes(segment)) {
        return NextResponse.json(
          { error: 'Invalid segment. Must be: regular, vip, or corporate' },
          { status: 400 }
        );
      }

      const updates: Record<string, unknown> = {
        segment,
        lastSegmentEvaluation: Timestamp.now(),
      };

      if (segment === 'vip') {
        updates.vipQualifiedAt = Timestamp.now();
      }

      await adminDb.collection('customers').doc(customerId).update(updates);

      return NextResponse.json({
        success: true,
        segment,
        message: `Customer segment manually set to: ${segment}`,
      });
    }

    // Link to corporate agreement
    if (action === 'link_corporate') {
      if (!customerId || !agreementId) {
        return NextResponse.json(
          { error: 'customerId and agreementId are required' },
          { status: 400 }
        );
      }

      const agreementDoc = await adminDb.collection('corporateAgreements').doc(agreementId).get();

      if (!agreementDoc.exists) {
        return NextResponse.json(
          { error: 'Corporate agreement not found' },
          { status: 404 }
        );
      }

      if (!agreementDoc.data()?.isActive) {
        return NextResponse.json(
          { error: 'Corporate agreement is not active' },
          { status: 400 }
        );
      }

      await adminDb.collection('customers').doc(customerId).update({
        segment: 'corporate',
        corporateAgreementId: agreementId,
        lastSegmentEvaluation: Timestamp.now(),
      });

      return NextResponse.json({
        success: true,
        message: 'Customer linked to corporate agreement',
        segment: 'corporate',
        agreementId,
      });
    }

    // Unlink from corporate
    if (action === 'unlink_corporate') {
      if (!customerId) {
        return NextResponse.json(
          { error: 'customerId is required' },
          { status: 400 }
        );
      }

      await adminDb.collection('customers').doc(customerId).update({
        corporateAgreementId: null,
        lastSegmentEvaluation: Timestamp.now(),
      });

      // Re-evaluate segment using helper function
      const evalResult = await evaluateCustomerSegmentInternal(customerId);

      return NextResponse.json({
        success: true,
        message: 'Customer unlinked from corporate agreement',
        newSegment: evalResult.segment,
      });
    }

    // Update customer statistics
    if (action === 'update_statistics') {
      if (!customerId) {
        return NextResponse.json(
          { error: 'customerId is required' },
          { status: 400 }
        );
      }

      const customerDoc = await adminDb.collection('customers').doc(customerId).get();
      if (!customerDoc.exists) {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        );
      }

      const customer = customerDoc.data();

      // Calculate 12 months ago
      const now = new Date();
      const twelveMonthsAgo = new Date(now);
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      // Get recent orders
      const ordersSnapshot = await adminDb
        .collection('orders')
        .where('customerId', '==', customerId)
        .where('createdAt', '>=', Timestamp.fromDate(twelveMonthsAgo))
        .where('status', 'in', ['delivered', 'collected'])
        .orderBy('createdAt', 'desc')
        .limit(500)
        .get();

      // Process orders to calculate statistics
      const orders = ordersSnapshot.docs.map((doc) => doc.data());
      let last12MonthsSpend = 0;
      let lastOrderDate: Date | undefined;

      for (const order of orders) {
        last12MonthsSpend += order.totalAmount || 0;
        if (!lastOrderDate && order.createdAt?.toDate) {
          lastOrderDate = order.createdAt.toDate();
        }
      }

      const totalOrders = customer?.orderCount || 0;
      const totalSpend = customer?.totalSpent || 0;
      const avgOrderValue = totalOrders > 0 ? Math.round(totalSpend / totalOrders) : 0;

      let daysSinceLastOrder: number | null = null;
      if (lastOrderDate) {
        daysSinceLastOrder = Math.floor((now.getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24));
      }

      const stats = {
        customerId,
        totalOrders,
        totalSpend,
        lastOrderDate: lastOrderDate ? Timestamp.fromDate(lastOrderDate) : null,
        last12MonthsOrders: ordersSnapshot.size,
        last12MonthsSpend,
        avgOrderValue,
        daysSinceLastOrder,
        currentSegment: customer?.segment || 'regular',
        updatedAt: Timestamp.now(),
      };

      await adminDb.collection('customerStatistics').doc(customerId).set(stats);

      return NextResponse.json({
        success: true,
        statistics: {
          ...stats,
          lastOrderDate: lastOrderDate ? lastOrderDate.toISOString() : null,
          updatedAt: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use: evaluate, set_segment, link_corporate, unlink_corporate, update_statistics' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing segmentation request:', error);
    return NextResponse.json(
      { error: 'Failed to process segmentation request' },
      { status: 500 }
    );
  }
}
