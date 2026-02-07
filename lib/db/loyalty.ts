/**
 * Loyalty Points System Database Operations (FR-011)
 *
 * Provides CRUD operations and business logic for the loyalty program.
 * Supports:
 * - Program configuration with tiered benefits
 * - Customer enrollment and tier management
 * - Points earning, redemption, and expiration
 * - Referral tracking
 *
 * @module lib/db/loyalty
 */

import { Timestamp, where, orderBy, limit } from 'firebase/firestore';
import {
  getDocument,
  getDocuments,
  setDocument,
  updateDocument,
  DatabaseError,
} from './index';
import type {
  LoyaltyProgram,
  LoyaltyTier,
  CustomerLoyalty,
  LoyaltyTransaction,
} from './schema';

// ============================================
// CONSTANTS
// ============================================

/** Collections */
const PROGRAMS_COLLECTION = 'loyaltyPrograms';
const LOYALTY_COLLECTION = 'customerLoyalty';
const TRANSACTIONS_COLLECTION = 'loyaltyTransactions';

/** Default points earning rate */
export const DEFAULT_POINTS_PER_KES = 1; // 1 point per KES 10 spent

/** Default points to KES ratio */
export const DEFAULT_POINTS_TO_KES_RATIO = 10; // 100 points = 10 KES

/** Default points expiry */
export const DEFAULT_POINTS_EXPIRY_YEARS = 2;

/** Default tier structure */
export const DEFAULT_TIERS: LoyaltyTier[] = [
  {
    tierId: 'bronze',
    name: 'bronze',
    displayName: 'Bronze Member',
    minPoints: 0,
    benefits: {
      discountPercentage: 0,
      freeDelivery: false,
      priorityProcessing: false,
      pointsMultiplier: 1,
    },
    color: '#CD7F32',
  },
  {
    tierId: 'silver',
    name: 'silver',
    displayName: 'Silver Member',
    minPoints: 500,
    benefits: {
      discountPercentage: 5,
      freeDelivery: false,
      priorityProcessing: false,
      birthdayBonus: 100,
      referralBonus: 50,
      pointsMultiplier: 1.25,
    },
    color: '#C0C0C0',
  },
  {
    tierId: 'gold',
    name: 'gold',
    displayName: 'Gold Member',
    minPoints: 2000,
    benefits: {
      discountPercentage: 10,
      freeDelivery: true,
      priorityProcessing: true,
      birthdayBonus: 250,
      referralBonus: 100,
      pointsMultiplier: 1.5,
    },
    color: '#FFD700',
  },
  {
    tierId: 'platinum',
    name: 'platinum',
    displayName: 'Platinum Member',
    minPoints: 5000,
    benefits: {
      discountPercentage: 15,
      freeDelivery: true,
      freePickup: true,
      priorityProcessing: true,
      birthdayBonus: 500,
      referralBonus: 200,
      pointsMultiplier: 2,
    },
    color: '#E5E4E2',
  },
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generate a unique loyalty account ID
 */
export function generateLoyaltyId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `LOY-${timestamp}-${random}`.toUpperCase();
}

/**
 * Generate a unique loyalty transaction ID
 */
export function generateLoyaltyTransactionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `LTX-${timestamp}-${random}`.toUpperCase();
}

/**
 * Generate a unique referral code
 */
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Determine tier based on total points earned
 */
export function determineTier(
  totalPointsEarned: number,
  tiers: LoyaltyTier[]
): LoyaltyTier {
  // Sort tiers by minPoints descending and find the highest matching tier
  const sortedTiers = [...tiers].sort((a, b) => b.minPoints - a.minPoints);
  for (const tier of sortedTiers) {
    if (totalPointsEarned >= tier.minPoints) {
      return tier;
    }
  }
  // Default to first tier (lowest)
  return tiers[0];
}

/**
 * Calculate points for an order amount
 */
export function calculatePointsForOrder(
  orderAmount: number,
  pointsPerKES: number,
  multiplier: number = 1
): number {
  const basePoints = Math.floor(orderAmount / 10) * pointsPerKES;
  return Math.floor(basePoints * multiplier);
}

// ============================================
// PROGRAM MANAGEMENT
// ============================================

/**
 * Create a new loyalty program
 *
 * @param data - Program data without generated fields
 * @returns Created program ID
 */
export async function createLoyaltyProgram(
  data: Omit<LoyaltyProgram, 'programId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const programId = `PROG-${Date.now().toString(36)}`.toUpperCase();
  const now = Timestamp.now();

  const program: LoyaltyProgram = {
    programId,
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  await setDocument<LoyaltyProgram>(PROGRAMS_COLLECTION, programId, program);
  return programId;
}

/**
 * Get a loyalty program by ID
 */
export async function getLoyaltyProgram(programId: string): Promise<LoyaltyProgram> {
  return getDocument<LoyaltyProgram>(PROGRAMS_COLLECTION, programId);
}

/**
 * Get the active loyalty program for a branch
 */
export async function getActiveLoyaltyProgram(
  branchId: string
): Promise<LoyaltyProgram | null> {
  const programs = await getDocuments<LoyaltyProgram>(
    PROGRAMS_COLLECTION,
    where('active', '==', true),
    orderBy('createdAt', 'desc'),
    limit(10)
  );

  // Find program for this branch or global program
  const branchProgram = programs.find((p) => p.branchId === branchId);
  const globalProgram = programs.find((p) => p.branchId === 'ALL');

  return branchProgram || globalProgram || null;
}

/**
 * Update a loyalty program
 */
export async function updateLoyaltyProgram(
  programId: string,
  data: Partial<Omit<LoyaltyProgram, 'programId' | 'createdAt'>>
): Promise<void> {
  await updateDocument<LoyaltyProgram>(PROGRAMS_COLLECTION, programId, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

// ============================================
// CUSTOMER LOYALTY MANAGEMENT
// ============================================

/**
 * Enroll a customer in the loyalty program
 *
 * @param customerId - Customer ID
 * @param programId - Program to enroll in
 * @param birthday - Optional birthday (MM-DD format)
 * @returns Created loyalty account
 */
export async function enrollCustomer(
  customerId: string,
  programId: string,
  birthday?: string
): Promise<CustomerLoyalty> {
  const now = Timestamp.now();
  const loyaltyId = generateLoyaltyId();
  const referralCode = generateReferralCode();

  // Get program to apply welcome bonus
  const program = await getLoyaltyProgram(programId);
  const welcomeBonus = program.welcomeBonus || 0;

  // Get initial tier
  const initialTier = determineTier(welcomeBonus, program.tiers);

  const loyalty: CustomerLoyalty = {
    loyaltyId,
    customerId,
    programId,
    totalPointsEarned: welcomeBonus,
    totalPointsRedeemed: 0,
    currentBalance: welcomeBonus,
    currentTierId: initialTier.tierId,
    currentTierName: initialTier.name,
    tierHistory: [
      {
        tierId: initialTier.tierId,
        tierName: initialTier.name,
        achievedAt: now,
      },
    ],
    birthday,
    referralCode,
    referralCount: 0,
    enrolledAt: now,
    lastActivityAt: now,
  };

  await setDocument<CustomerLoyalty>(LOYALTY_COLLECTION, loyaltyId, loyalty);

  // Create welcome bonus transaction if applicable
  if (welcomeBonus > 0) {
    await createLoyaltyTransaction({
      customerId,
      loyaltyId,
      type: 'bonus',
      points: welcomeBonus,
      balanceAfter: welcomeBonus,
      reason: 'welcome_bonus',
      description: 'Welcome bonus for joining the loyalty program',
    });
  }

  return loyalty;
}

/**
 * Get a customer's loyalty account
 */
export async function getCustomerLoyalty(
  customerId: string
): Promise<CustomerLoyalty | null> {
  const accounts = await getDocuments<CustomerLoyalty>(
    LOYALTY_COLLECTION,
    where('customerId', '==', customerId),
    limit(1)
  );

  return accounts.length > 0 ? accounts[0] : null;
}

/**
 * Get a loyalty account by ID
 */
export async function getLoyaltyAccount(loyaltyId: string): Promise<CustomerLoyalty> {
  return getDocument<CustomerLoyalty>(LOYALTY_COLLECTION, loyaltyId);
}

/**
 * Update a customer's loyalty account
 */
export async function updateCustomerLoyalty(
  loyaltyId: string,
  data: Partial<Omit<CustomerLoyalty, 'loyaltyId' | 'customerId' | 'enrolledAt'>>
): Promise<void> {
  await updateDocument<CustomerLoyalty>(LOYALTY_COLLECTION, loyaltyId, {
    ...data,
    lastActivityAt: Timestamp.now(),
  });
}

// ============================================
// POINTS OPERATIONS
// ============================================

/**
 * Create a loyalty transaction
 */
async function createLoyaltyTransaction(
  data: Omit<LoyaltyTransaction, 'transactionId' | 'createdAt'>
): Promise<string> {
  const transactionId = generateLoyaltyTransactionId();
  const now = Timestamp.now();

  const transaction: LoyaltyTransaction = {
    transactionId,
    ...data,
    createdAt: now,
  };

  await setDocument<LoyaltyTransaction>(TRANSACTIONS_COLLECTION, transactionId, transaction);
  return transactionId;
}

/**
 * Award points to a customer
 *
 * @param customerId - Customer ID
 * @param points - Points to award
 * @param reason - Reason for awarding points
 * @param orderId - Optional order reference
 * @param referralCode - Optional referral code used
 * @returns Updated loyalty account
 */
export async function awardPoints(
  customerId: string,
  points: number,
  reason: string,
  orderId?: string,
  referralCode?: string
): Promise<CustomerLoyalty> {
  const loyalty = await getCustomerLoyalty(customerId);
  if (!loyalty) {
    throw new DatabaseError(`Customer ${customerId} not enrolled in loyalty program`);
  }

  const program = await getLoyaltyProgram(loyalty.programId);

  // Calculate expiry date
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + program.pointsExpiryYears);

  // Update balances
  const newTotalEarned = loyalty.totalPointsEarned + points;
  const newBalance = loyalty.currentBalance + points;

  // Check for tier upgrade
  const newTier = determineTier(newTotalEarned, program.tiers);
  const tierUpgraded = newTier.tierId !== loyalty.currentTierId;

  // Update loyalty account
  const updates: Partial<CustomerLoyalty> = {
    totalPointsEarned: newTotalEarned,
    currentBalance: newBalance,
  };

  if (tierUpgraded) {
    updates.currentTierId = newTier.tierId;
    updates.currentTierName = newTier.name;
    updates.tierHistory = [
      ...loyalty.tierHistory,
      {
        tierId: newTier.tierId,
        tierName: newTier.name,
        achievedAt: Timestamp.now(),
      },
    ];
  }

  await updateCustomerLoyalty(loyalty.loyaltyId, updates);

  // Create transaction record
  await createLoyaltyTransaction({
    customerId,
    loyaltyId: loyalty.loyaltyId,
    type: 'earned',
    points,
    balanceAfter: newBalance,
    reason,
    orderId,
    referralCode,
    expiresAt: Timestamp.fromDate(expiresAt),
  });

  return getLoyaltyAccount(loyalty.loyaltyId);
}

/**
 * Award points for a completed order
 *
 * @param customerId - Customer ID
 * @param orderAmount - Order total in KES
 * @param orderId - Order ID
 * @returns Points awarded and updated loyalty account
 */
export async function awardPointsForOrder(
  customerId: string,
  orderAmount: number,
  orderId: string
): Promise<{ pointsAwarded: number; loyalty: CustomerLoyalty }> {
  const loyalty = await getCustomerLoyalty(customerId);
  if (!loyalty) {
    throw new DatabaseError(`Customer ${customerId} not enrolled in loyalty program`);
  }

  const program = await getLoyaltyProgram(loyalty.programId);
  const tier = program.tiers.find((t) => t.tierId === loyalty.currentTierId);
  const multiplier = tier?.benefits.pointsMultiplier || 1;

  const pointsAwarded = calculatePointsForOrder(
    orderAmount,
    program.pointsPerKES,
    multiplier
  );

  const updatedLoyalty = await awardPoints(
    customerId,
    pointsAwarded,
    'order_completed',
    orderId
  );

  return { pointsAwarded, loyalty: updatedLoyalty };
}

/**
 * Redeem points for a reward
 *
 * @param customerId - Customer ID
 * @param points - Points to redeem
 * @param reason - Redemption reason
 * @param orderId - Optional order to apply redemption to
 * @returns Updated loyalty account
 */
export async function redeemPoints(
  customerId: string,
  points: number,
  reason: string,
  orderId?: string
): Promise<CustomerLoyalty> {
  const loyalty = await getCustomerLoyalty(customerId);
  if (!loyalty) {
    throw new DatabaseError(`Customer ${customerId} not enrolled in loyalty program`);
  }

  const program = await getLoyaltyProgram(loyalty.programId);

  // Validate redemption
  if (loyalty.currentBalance < points) {
    throw new DatabaseError(
      `Insufficient points. Available: ${loyalty.currentBalance}, Requested: ${points}`
    );
  }

  if (points < program.minPointsToRedeem) {
    throw new DatabaseError(
      `Minimum ${program.minPointsToRedeem} points required for redemption`
    );
  }

  // Update balances
  const newBalance = loyalty.currentBalance - points;
  const newTotalRedeemed = loyalty.totalPointsRedeemed + points;

  await updateCustomerLoyalty(loyalty.loyaltyId, {
    currentBalance: newBalance,
    totalPointsRedeemed: newTotalRedeemed,
  });

  // Create transaction record
  await createLoyaltyTransaction({
    customerId,
    loyaltyId: loyalty.loyaltyId,
    type: 'redeemed',
    points: -points,
    balanceAfter: newBalance,
    reason,
    orderId,
  });

  return getLoyaltyAccount(loyalty.loyaltyId);
}

/**
 * Award referral bonus
 *
 * @param referrerCustomerId - Customer who referred
 * @param referredCustomerId - New customer who was referred
 * @returns Updated referrer loyalty account
 */
export async function awardReferralBonus(
  referrerCustomerId: string,
  referredCustomerId: string
): Promise<CustomerLoyalty | null> {
  const referrerLoyalty = await getCustomerLoyalty(referrerCustomerId);
  if (!referrerLoyalty) {
    return null;
  }

  const program = await getLoyaltyProgram(referrerLoyalty.programId);
  const tier = program.tiers.find((t) => t.tierId === referrerLoyalty.currentTierId);
  const referralBonus = tier?.benefits.referralBonus || 50;

  // Update referral count
  await updateCustomerLoyalty(referrerLoyalty.loyaltyId, {
    referralCount: referrerLoyalty.referralCount + 1,
  });

  // Award bonus points
  return awardPoints(
    referrerCustomerId,
    referralBonus,
    'referral_bonus',
    undefined,
    referredCustomerId
  );
}

/**
 * Award birthday bonus
 *
 * @param customerId - Customer ID
 * @returns Updated loyalty account
 */
export async function awardBirthdayBonus(
  customerId: string
): Promise<CustomerLoyalty | null> {
  const loyalty = await getCustomerLoyalty(customerId);
  if (!loyalty) {
    return null;
  }

  const program = await getLoyaltyProgram(loyalty.programId);
  const tier = program.tiers.find((t) => t.tierId === loyalty.currentTierId);
  const birthdayBonus = tier?.benefits.birthdayBonus || 0;

  if (birthdayBonus === 0) {
    return loyalty;
  }

  // Create transaction record
  const newBalance = loyalty.currentBalance + birthdayBonus;

  await updateCustomerLoyalty(loyalty.loyaltyId, {
    currentBalance: newBalance,
    totalPointsEarned: loyalty.totalPointsEarned + birthdayBonus,
  });

  await createLoyaltyTransaction({
    customerId,
    loyaltyId: loyalty.loyaltyId,
    type: 'bonus',
    points: birthdayBonus,
    balanceAfter: newBalance,
    reason: 'birthday_bonus',
    description: 'Happy Birthday! Enjoy your bonus points.',
  });

  return getLoyaltyAccount(loyalty.loyaltyId);
}

/**
 * Award review bonus
 *
 * @param customerId - Customer ID
 * @param orderId - Order that was reviewed
 * @returns Updated loyalty account
 */
export async function awardReviewBonus(
  customerId: string,
  orderId: string
): Promise<CustomerLoyalty | null> {
  const loyalty = await getCustomerLoyalty(customerId);
  if (!loyalty) {
    return null;
  }

  const program = await getLoyaltyProgram(loyalty.programId);
  const reviewBonus = program.reviewBonus || 0;

  if (reviewBonus === 0) {
    return loyalty;
  }

  return awardPoints(customerId, reviewBonus, 'review_bonus', orderId);
}

// ============================================
// QUERIES
// ============================================

/**
 * Get loyalty transaction history for a customer
 */
export async function getCustomerLoyaltyTransactions(
  customerId: string,
  limitCount: number = 50
): Promise<LoyaltyTransaction[]> {
  return getDocuments<LoyaltyTransaction>(
    TRANSACTIONS_COLLECTION,
    where('customerId', '==', customerId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
}

/**
 * Find a customer by their referral code
 */
export async function findCustomerByReferralCode(
  referralCode: string
): Promise<CustomerLoyalty | null> {
  const accounts = await getDocuments<CustomerLoyalty>(
    LOYALTY_COLLECTION,
    where('referralCode', '==', referralCode),
    limit(1)
  );

  return accounts.length > 0 ? accounts[0] : null;
}

/**
 * Get top loyalty customers by points
 */
export async function getTopLoyaltyCustomers(
  limitCount: number = 10
): Promise<CustomerLoyalty[]> {
  return getDocuments<CustomerLoyalty>(
    LOYALTY_COLLECTION,
    orderBy('totalPointsEarned', 'desc'),
    limit(limitCount)
  );
}

/**
 * Get customers with expiring points
 */
export async function getCustomersWithExpiringPoints(
  daysAhead: number = 30
): Promise<CustomerLoyalty[]> {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + daysAhead);

  const accounts = await getDocuments<CustomerLoyalty>(
    LOYALTY_COLLECTION,
    orderBy('lastActivityAt', 'desc'),
    limit(100)
  );

  // Filter for accounts with expiring points
  return accounts.filter((account) => {
    if (!account.pointsExpiringNext) return false;
    const expiresAt = account.pointsExpiringNext.expiresAt;
    if ('toDate' in expiresAt) {
      return expiresAt.toDate() <= expiryDate;
    }
    return false;
  });
}

/**
 * Calculate discount value from points
 */
export function calculateDiscountFromPoints(
  points: number,
  pointsToKESRatio: number
): number {
  return Math.floor(points / pointsToKESRatio) * 10;
}

// ============================================
// SEED DATA
// ============================================

/**
 * Create default loyalty program
 */
export async function createDefaultLoyaltyProgram(
  branchId: string = 'ALL'
): Promise<string> {
  return createLoyaltyProgram({
    branchId,
    name: 'Lorenzo Rewards',
    pointsPerKES: DEFAULT_POINTS_PER_KES,
    minPointsToRedeem: 100,
    pointsToKESRatio: DEFAULT_POINTS_TO_KES_RATIO,
    pointsExpiryYears: DEFAULT_POINTS_EXPIRY_YEARS,
    welcomeBonus: 100,
    reviewBonus: 50,
    tiers: DEFAULT_TIERS,
    active: true,
  });
}
