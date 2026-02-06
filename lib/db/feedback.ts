/**
 * Customer Feedback Service
 *
 * Handles customer feedback collection, storage, and analysis.
 * Supports multiple collection methods: WhatsApp, SMS, QR code, and manual.
 *
 * @module lib/db/feedback
 */

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  CustomerFeedback,
  StaffRating,
  FeedbackResponse,
  FeedbackSource,
  ProcessingStage,
  Order,
} from './schema';
import { startOfDay, endOfDay, subDays } from 'date-fns';

// Collection references
const FEEDBACK_COLLECTION = 'customerFeedback';
const ORDERS_COLLECTION = 'orders';

/**
 * Create feedback parameters
 */
export interface CreateFeedbackParams {
  orderId: string;
  customerId: string;
  branchId: string;
  overallRating: number;
  staffRatings?: StaffRating[];
  responses?: FeedbackResponse[];
  source: FeedbackSource;
  deviceInfo?: string;
  comment?: string;
  wouldRecommend?: boolean;
}

/**
 * Feedback query parameters
 */
export interface FeedbackQueryParams {
  branchId?: string;
  staffId?: string;
  source?: FeedbackSource;
  minRating?: number;
  maxRating?: number;
  startDate: Date;
  endDate: Date;
}

/**
 * Feedback statistics
 */
export interface FeedbackStats {
  totalFeedback: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
  recommendRate: number;
  bySource: Record<FeedbackSource, number>;
}

/**
 * Generate unique feedback ID
 */
function generateFeedbackId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `FB-${timestamp}-${random}`.toUpperCase();
}

/**
 * Create a new customer feedback record
 */
export async function createFeedback(
  params: CreateFeedbackParams
): Promise<CustomerFeedback> {
  const feedbackId = generateFeedbackId();

  // Validate rating is between 1-5
  if (params.overallRating < 1 || params.overallRating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  // Validate staff ratings if provided
  if (params.staffRatings) {
    for (const rating of params.staffRatings) {
      if (rating.rating < 1 || rating.rating > 5) {
        throw new Error('Staff ratings must be between 1 and 5');
      }
    }
  }

  const feedback: CustomerFeedback = {
    feedbackId,
    orderId: params.orderId,
    customerId: params.customerId,
    branchId: params.branchId,
    overallRating: params.overallRating,
    staffRatings: params.staffRatings,
    responses: params.responses,
    source: params.source,
    submittedAt: Timestamp.now(),
    deviceInfo: params.deviceInfo,
    comment: params.comment,
    wouldRecommend: params.wouldRecommend,
  };

  await addDoc(collection(db, FEEDBACK_COLLECTION), feedback);

  return feedback;
}

/**
 * Get feedback for a specific order
 */
export async function getFeedbackForOrder(
  orderId: string
): Promise<CustomerFeedback | null> {
  const feedbackQuery = query(
    collection(db, FEEDBACK_COLLECTION),
    where('orderId', '==', orderId),
    limit(1)
  );

  const snapshot = await getDocs(feedbackQuery);
  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0].data() as CustomerFeedback;
}

/**
 * Get feedback by ID
 */
export async function getFeedbackById(
  feedbackId: string
): Promise<CustomerFeedback | null> {
  const feedbackQuery = query(
    collection(db, FEEDBACK_COLLECTION),
    where('feedbackId', '==', feedbackId),
    limit(1)
  );

  const snapshot = await getDocs(feedbackQuery);
  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0].data() as CustomerFeedback;
}

/**
 * Get all feedback for a staff member
 */
export async function getStaffFeedback(
  staffId: string,
  startDate: Date,
  endDate: Date
): Promise<CustomerFeedback[]> {
  const feedbackQuery = query(
    collection(db, FEEDBACK_COLLECTION),
    where('submittedAt', '>=', Timestamp.fromDate(startOfDay(startDate))),
    where('submittedAt', '<=', Timestamp.fromDate(endOfDay(endDate))),
    orderBy('submittedAt', 'desc')
  );

  const snapshot = await getDocs(feedbackQuery);
  const allFeedback = snapshot.docs.map(doc => doc.data() as CustomerFeedback);

  // Filter feedback that includes this staff member
  return allFeedback.filter(feedback =>
    feedback.staffRatings?.some(rating => rating.staffId === staffId)
  );
}

/**
 * Get feedback by query parameters
 */
export async function getFeedback(
  params: FeedbackQueryParams
): Promise<CustomerFeedback[]> {
  const { branchId, staffId, source, minRating, maxRating, startDate, endDate } = params;

  const feedbackQuery = query(
    collection(db, FEEDBACK_COLLECTION),
    where('submittedAt', '>=', Timestamp.fromDate(startOfDay(startDate))),
    where('submittedAt', '<=', Timestamp.fromDate(endOfDay(endDate))),
    orderBy('submittedAt', 'desc')
  );

  const snapshot = await getDocs(feedbackQuery);
  let results = snapshot.docs.map(doc => doc.data() as CustomerFeedback);

  // Apply additional filters
  if (branchId) {
    results = results.filter(f => f.branchId === branchId);
  }

  if (staffId) {
    results = results.filter(f =>
      f.staffRatings?.some(rating => rating.staffId === staffId)
    );
  }

  if (source) {
    results = results.filter(f => f.source === source);
  }

  if (minRating !== undefined) {
    results = results.filter(f => f.overallRating >= minRating);
  }

  if (maxRating !== undefined) {
    results = results.filter(f => f.overallRating <= maxRating);
  }

  return results;
}

/**
 * Calculate customer satisfaction score for a staff member
 */
export async function calculateStaffSatisfactionScore(
  staffId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  score: number;
  totalRatings: number;
  averageRating: number;
}> {
  const feedback = await getStaffFeedback(staffId, startDate, endDate);

  if (feedback.length === 0) {
    return { score: 0, totalRatings: 0, averageRating: 0 };
  }

  let totalRatings = 0;
  let ratingSum = 0;

  for (const fb of feedback) {
    if (fb.staffRatings) {
      for (const rating of fb.staffRatings) {
        if (rating.staffId === staffId) {
          totalRatings++;
          ratingSum += rating.rating;
        }
      }
    }
  }

  const averageRating = totalRatings > 0 ? ratingSum / totalRatings : 0;
  const score = (averageRating / 5) * 100;

  return {
    score: Math.round(score * 10) / 10,
    totalRatings,
    averageRating: Math.round(averageRating * 10) / 10,
  };
}

/**
 * Get feedback statistics for a branch
 */
export async function getFeedbackStats(
  branchId: string,
  startDate: Date,
  endDate: Date
): Promise<FeedbackStats> {
  const feedback = await getFeedback({
    branchId,
    startDate,
    endDate,
  });

  if (feedback.length === 0) {
    return {
      totalFeedback: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      recommendRate: 0,
      bySource: { whatsapp: 0, sms: 0, qr_code: 0, manual: 0 },
    };
  }

  // Calculate average rating
  const ratingSum = feedback.reduce((sum, f) => sum + f.overallRating, 0);
  const averageRating = ratingSum / feedback.length;

  // Calculate rating distribution
  const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const f of feedback) {
    ratingDistribution[f.overallRating] = (ratingDistribution[f.overallRating] || 0) + 1;
  }

  // Calculate recommendation rate
  const wouldRecommendCount = feedback.filter(f => f.wouldRecommend === true).length;
  const recommendableCount = feedback.filter(f => f.wouldRecommend !== undefined).length;
  const recommendRate = recommendableCount > 0
    ? (wouldRecommendCount / recommendableCount) * 100
    : 0;

  // Count by source
  const bySource: Record<FeedbackSource, number> = {
    whatsapp: 0,
    sms: 0,
    qr_code: 0,
    manual: 0,
  };
  for (const f of feedback) {
    bySource[f.source] = (bySource[f.source] || 0) + 1;
  }

  return {
    totalFeedback: feedback.length,
    averageRating: Math.round(averageRating * 10) / 10,
    ratingDistribution,
    recommendRate: Math.round(recommendRate * 10) / 10,
    bySource,
  };
}

/**
 * Get recent feedback for a branch (for dashboard)
 */
export async function getRecentFeedback(
  branchId: string,
  limitCount: number = 10
): Promise<CustomerFeedback[]> {
  const feedbackQuery = query(
    collection(db, FEEDBACK_COLLECTION),
    where('branchId', '==', branchId),
    orderBy('submittedAt', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(feedbackQuery);
  return snapshot.docs.map(doc => doc.data() as CustomerFeedback);
}

/**
 * Get staff who handled an order (for feedback form)
 */
export async function getStaffForOrder(
  orderId: string
): Promise<{
  staffId: string;
  staffName: string;
  stage: ProcessingStage;
}[]> {
  const orderQuery = query(
    collection(db, ORDERS_COLLECTION),
    where('orderId', '==', orderId),
    limit(1)
  );

  const snapshot = await getDocs(orderQuery);
  if (snapshot.empty) {
    return [];
  }

  const order = snapshot.docs[0].data() as Order;
  const staffList: { staffId: string; staffName: string; stage: ProcessingStage }[] = [];
  const seenStaff = new Set<string>();

  // Extract staff from garment stage handlers
  if (order.garments) {
    for (const garment of order.garments) {
      if (garment.stageHandlers) {
        for (const [stage, handlers] of Object.entries(garment.stageHandlers)) {
          if (handlers) {
            for (const handler of handlers) {
              if (!seenStaff.has(handler.uid)) {
                seenStaff.add(handler.uid);
                staffList.push({
                  staffId: handler.uid,
                  staffName: handler.name,
                  stage: stage as ProcessingStage,
                });
              }
            }
          }
        }
      }
    }
  }

  return staffList;
}

/**
 * Check if feedback already exists for an order
 */
export async function hasFeedback(orderId: string): Promise<boolean> {
  const existing = await getFeedbackForOrder(orderId);
  return existing !== null;
}

/**
 * Generate feedback URL for QR code
 */
export function generateFeedbackUrl(orderId: string, baseUrl: string): string {
  return `${baseUrl}/feedback/${orderId}`;
}

/**
 * Get orders pending feedback (delivered but no feedback)
 */
export async function getOrdersPendingFeedback(
  branchId: string,
  daysAgo: number = 7
): Promise<Order[]> {
  const startDate = subDays(new Date(), daysAgo);

  // Get recent delivered orders
  const ordersQuery = query(
    collection(db, ORDERS_COLLECTION),
    where('branchId', '==', branchId),
    where('status', 'in', ['delivered', 'collected']),
    where('createdAt', '>=', Timestamp.fromDate(startDate)),
    orderBy('createdAt', 'desc')
  );

  const ordersSnapshot = await getDocs(ordersQuery);
  const orders = ordersSnapshot.docs.map(doc => doc.data() as Order);

  // Get feedback for these orders
  const orderIds = orders.map(o => o.orderId);

  // Check which orders have feedback
  const ordersWithFeedback = new Set<string>();

  // We need to check each order since Firestore doesn't support 'in' queries with large arrays
  for (const orderId of orderIds) {
    const has = await hasFeedback(orderId);
    if (has) {
      ordersWithFeedback.add(orderId);
    }
  }

  // Return orders without feedback
  return orders.filter(o => !ordersWithFeedback.has(o.orderId));
}

/**
 * Get low-rated feedback (for manager attention)
 */
export async function getLowRatedFeedback(
  branchId: string,
  threshold: number = 3,
  limitCount: number = 10
): Promise<CustomerFeedback[]> {
  const feedback = await getFeedback({
    branchId,
    maxRating: threshold,
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
  });

  return feedback.slice(0, limitCount);
}

/**
 * Update feedback (for adding manager responses)
 */
export async function updateFeedback(
  feedbackId: string,
  updates: {
    managerResponse?: string;
    resolved?: boolean;
    resolvedBy?: string;
    resolvedAt?: Date;
  }
): Promise<void> {
  const feedbackQuery = query(
    collection(db, FEEDBACK_COLLECTION),
    where('feedbackId', '==', feedbackId),
    limit(1)
  );

  const snapshot = await getDocs(feedbackQuery);
  if (snapshot.empty) {
    throw new Error(`Feedback not found: ${feedbackId}`);
  }

  const docRef = snapshot.docs[0].ref;

  const updateData: Record<string, unknown> = { ...updates };
  if (updates.resolvedAt) {
    updateData.resolvedAt = Timestamp.fromDate(updates.resolvedAt);
  }

  await updateDoc(docRef, updateData);
}
