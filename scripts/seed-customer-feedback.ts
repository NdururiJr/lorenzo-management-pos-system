/**
 * Seed Customer Feedback Script
 *
 * Populates customer satisfaction data for GM Dashboard
 * Creates ratings and comments linked to orders
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountKey) {
      try {
        const serviceAccount = JSON.parse(serviceAccountKey);
        initializeApp({ credential: cert(serviceAccount) });
      } catch (error) {
        console.error('Failed to parse service account key');
        initializeApp();
      }
    } else {
      initializeApp();
    }
  }
}

type Rating = 1 | 2 | 3 | 4 | 5;
type FeedbackType = 'order' | 'service' | 'delivery';

interface CustomerFeedback {
  feedbackId: string;
  orderId: string;
  customerId: string;
  customerName: string;
  branchId: string;
  rating: Rating;
  comment?: string;
  feedbackType: FeedbackType;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Positive comments for high ratings (4-5 stars)
const positiveComments = [
  'Excellent service! My clothes came back looking brand new.',
  'Very impressed with the quality of work. Will definitely return!',
  'Fast turnaround and great attention to detail.',
  'The stain removal was incredible. Thank you!',
  'Always consistent quality. Lorenzo is the best!',
  'Staff was very friendly and helpful.',
  'My suits always look perfect after visiting here.',
  'Great service, reasonable prices. Highly recommend!',
  'They took extra care with my delicate items.',
  'Professional service from start to finish.',
  'Love the convenience of pickup and delivery!',
  'Quick, efficient, and high quality work.',
  'Best dry cleaners in Nairobi!',
  'They went above and beyond for my wedding dress.',
  'Impeccable ironing and pressing.',
];

// Neutral comments for medium ratings (3 stars)
const neutralComments = [
  'Service was okay, nothing special.',
  'Good quality but took longer than expected.',
  'Prices are a bit high but quality is decent.',
  'Had to return one item for re-cleaning.',
  'Staff could be more attentive.',
  'Generally satisfied but room for improvement.',
];

// Negative comments for low ratings (1-2 stars)
const negativeComments = [
  'Disappointed with the service this time.',
  'Item was damaged during cleaning.',
  'Took too long and communication was poor.',
  'Had to complain to get proper service.',
];

// Rating distribution weights (biased towards positive)
const ratingWeights: Record<Rating, number> = {
  5: 0.40, // 40% get 5 stars
  4: 0.35, // 35% get 4 stars
  3: 0.15, // 15% get 3 stars
  2: 0.07, // 7% get 2 stars
  1: 0.03, // 3% get 1 star
};

// Main branches
const branches = [
  'VILLAGE_MARKET',
  'WESTGATE',
  'DENNIS_PRITT',
  'MUTHAIGA',
  'NAIVAS_KILIMANI',
  'HURLINGHAM',
  'LAVINGTON',
  'WATERFRONT_KAREN',
  'KILELESHWA',
  'ADLIFE',
];

function pickWeightedRating(): Rating {
  const random = Math.random();
  let cumulative = 0;
  for (const [rating, weight] of Object.entries(ratingWeights)) {
    cumulative += weight;
    if (random < cumulative) {
      return parseInt(rating) as Rating;
    }
  }
  return 5;
}

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getCommentForRating(rating: Rating): string | undefined {
  // 70% chance of having a comment
  if (Math.random() > 0.7) return undefined;

  if (rating >= 4) {
    return getRandomElement(positiveComments);
  } else if (rating === 3) {
    return getRandomElement(neutralComments);
  } else {
    return getRandomElement(negativeComments);
  }
}

function getDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  // Add random hours/minutes for variation
  date.setHours(Math.floor(Math.random() * 14) + 8); // 8 AM to 10 PM
  date.setMinutes(Math.floor(Math.random() * 60));
  return date;
}

function generateFeedbackId(branchId: string, index: number): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  return `FDBK-${branchId.substring(0, 4)}-${dateStr}-${String(index).padStart(4, '0')}`;
}

// Mock customer data
const mockCustomers = [
  { id: 'cust-001', name: 'Wanjiru Kamau' },
  { id: 'cust-002', name: 'Peter Omondi' },
  { id: 'cust-003', name: 'Grace Mwangi' },
  { id: 'cust-004', name: 'David Otieno' },
  { id: 'cust-005', name: 'Sarah Wambui' },
  { id: 'cust-006', name: 'James Kipchoge' },
  { id: 'cust-007', name: 'Elizabeth Njeri' },
  { id: 'cust-008', name: 'Michael Mutua' },
  { id: 'cust-009', name: 'Nancy Chebet' },
  { id: 'cust-010', name: 'John Ochieng' },
  { id: 'cust-011', name: 'Faith Akinyi' },
  { id: 'cust-012', name: 'Samuel Kosgei' },
  { id: 'cust-013', name: 'Caroline Wangari' },
  { id: 'cust-014', name: 'Dennis Kipruto' },
  { id: 'cust-015', name: 'Alice Moraa' },
];

async function getExistingData(db: FirebaseFirestore.Firestore): Promise<{
  orders: Array<{ id: string; customerId: string; branchId: string }>;
  customers: Array<{ id: string; name: string }>;
}> {
  // Try to get real orders
  const ordersSnapshot = await db.collection('orders')
    .orderBy('createdAt', 'desc')
    .limit(100)
    .get();

  const orders: Array<{ id: string; customerId: string; branchId: string }> = [];
  const customerIds = new Set<string>();

  ordersSnapshot.forEach(doc => {
    const data = doc.data();
    if (data.customerId && data.branchId) {
      orders.push({
        id: doc.id,
        customerId: data.customerId,
        branchId: data.branchId,
      });
      customerIds.add(data.customerId);
    }
  });

  // Try to get real customers
  const customers: Array<{ id: string; name: string }> = [];

  if (customerIds.size > 0) {
    const customerPromises = Array.from(customerIds).slice(0, 20).map(async (customerId) => {
      const customerDoc = await db.collection('customers').doc(customerId).get();
      if (customerDoc.exists) {
        const data = customerDoc.data();
        return { id: customerId, name: data?.name || 'Unknown Customer' };
      }
      return null;
    });

    const resolvedCustomers = await Promise.all(customerPromises);
    resolvedCustomers.forEach(c => {
      if (c) customers.push(c);
    });
  }

  // If no real data, use mocks
  if (orders.length === 0) {
    // Generate mock orders
    for (let i = 0; i < 50; i++) {
      const branch = getRandomElement(branches);
      const customer = getRandomElement(mockCustomers);
      orders.push({
        id: `ORD-${branch}-MOCK-${String(i + 1).padStart(4, '0')}`,
        customerId: customer.id,
        branchId: branch,
      });
    }
  }

  if (customers.length === 0) {
    customers.push(...mockCustomers);
  }

  return { orders, customers };
}

async function seedCustomerFeedback() {
  console.log('⭐ Seeding customer feedback data...\n');

  try {
    initializeFirebaseAdmin();
    const db = getFirestore();

    // Get existing orders and customers
    const { orders, customers } = await getExistingData(db);
    console.log(`📊 Found ${orders.length} orders and ${customers.length} customers\n`);

    const customerMap = new Map(customers.map(c => [c.id, c.name]));

    let created = 0;
    let updated = 0;
    let feedbackIndex = 1;

    // Create feedback for orders spread across the last 30 days
    // Target: ~50 feedback entries
    const targetFeedback = 50;
    const ordersToRate = orders.slice(0, Math.min(orders.length, targetFeedback));

    // Rating stats for summary
    const ratingCounts: Record<Rating, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    for (const order of ordersToRate) {
      const feedbackId = generateFeedbackId(order.branchId, feedbackIndex++);
      const feedbackRef = db.collection('customerFeedback').doc(feedbackId);
      const existingDoc = await feedbackRef.get();

      const now = Timestamp.now();
      const rating = pickWeightedRating();
      ratingCounts[rating]++;

      const feedbackTypes: FeedbackType[] = ['order', 'order', 'order', 'service', 'delivery'];
      const feedbackType = getRandomElement(feedbackTypes);

      // Spread feedback over last 30 days, with more recent ones
      const daysAgo = Math.floor(Math.pow(Math.random(), 2) * 30); // Skewed towards recent
      const createdAt = Timestamp.fromDate(getDaysAgo(daysAgo));

      const customerName = customerMap.get(order.customerId) || 'Unknown Customer';

      const feedbackData: CustomerFeedback = {
        feedbackId,
        orderId: order.id,
        customerId: order.customerId,
        customerName,
        branchId: order.branchId,
        rating,
        feedbackType,
        createdAt,
        updatedAt: now,
      };

      const comment = getCommentForRating(rating);
      if (comment) {
        feedbackData.comment = comment;
      }

      if (existingDoc.exists) {
        await feedbackRef.update(feedbackData as any);
        console.log(`  ✓ Updated: ${rating}⭐ from ${customerName} (${order.branchId})`);
        updated++;
      } else {
        await feedbackRef.set(feedbackData);
        console.log(`  ✓ Created: ${rating}⭐ from ${customerName} (${order.branchId})`);
        created++;
      }
    }

    // Calculate average rating
    const totalRatings = Object.values(ratingCounts).reduce((a, b) => a + b, 0);
    const weightedSum = Object.entries(ratingCounts).reduce(
      (sum, [rating, count]) => sum + parseInt(rating) * count,
      0
    );
    const avgRating = (weightedSum / totalRatings).toFixed(2);

    console.log(`\n✅ Customer feedback seed completed!`);
    console.log(`📊 Summary:`);
    console.log(`   - Created: ${created} feedback entries`);
    console.log(`   - Updated: ${updated} feedback entries`);
    console.log(`   - Total: ${created + updated} feedback entries`);
    console.log(`\n⭐ Rating Distribution:`);
    console.log(`   - 5 stars: ${ratingCounts[5]} (${((ratingCounts[5] / totalRatings) * 100).toFixed(1)}%)`);
    console.log(`   - 4 stars: ${ratingCounts[4]} (${((ratingCounts[4] / totalRatings) * 100).toFixed(1)}%)`);
    console.log(`   - 3 stars: ${ratingCounts[3]} (${((ratingCounts[3] / totalRatings) * 100).toFixed(1)}%)`);
    console.log(`   - 2 stars: ${ratingCounts[2]} (${((ratingCounts[2] / totalRatings) * 100).toFixed(1)}%)`);
    console.log(`   - 1 star: ${ratingCounts[1]} (${((ratingCounts[1] / totalRatings) * 100).toFixed(1)}%)`);
    console.log(`   - Average: ${avgRating} ⭐`);

  } catch (error) {
    console.error('\n❌ Error seeding customer feedback:', error);
    process.exit(1);
  }
}

seedCustomerFeedback()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
