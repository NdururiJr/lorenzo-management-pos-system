/**
 * Database Schema Type Definitions
 *
 * This file contains TypeScript interfaces for all Firestore collections.
 * These types ensure type safety throughout the application.
 *
 * @module lib/db/schema
 */

import { Timestamp as ClientTimestamp } from 'firebase/firestore';
import type { Timestamp as AdminTimestamp } from 'firebase-admin/firestore';

/**
 * Unified Timestamp type that works with both client and admin SDKs
 * This allows the same schema to be used in both client and server code
 */
export type Timestamp = ClientTimestamp | AdminTimestamp;

/**
 * User roles in the system
 */
export type UserRole =
  | 'admin'
  | 'director'
  | 'general_manager'
  | 'store_manager'
  | 'workstation_manager'
  | 'workstation_staff'
  | 'satellite_staff'
  | 'manager'
  | 'front_desk'
  | 'workstation'
  | 'driver'
  | 'customer'
  // ===== V2.0 New Roles =====
  | 'finance_manager'    // Financial reports, cash out approvals
  | 'auditor'            // Read-only financial access, audit logs
  | 'logistics_manager'  // Delivery tracking, driver management
  | 'inspector';         // Order inspection at reception

/**
 * User document structure
 * Collection: users
 */
export interface User {
  /** Firebase Auth UID */
  uid: string;
  /** User's email address */
  email: string;
  /** User's phone number (Kenyan format: +254...) */
  phone: string;
  /** User's role in the system */
  role: UserRole;
  /** User's full name */
  name: string;
  /** Primary branch ID (for staff members) */
  branchId?: string;
  /** Additional branches this user can access (for multi-branch managers) */
  branchAccess?: string[];
  /** Whether user has super admin privileges (system-wide access) */
  isSuperAdmin?: boolean;
  /** Account creation timestamp */
  createdAt: Timestamp;
  /** Whether the account is active */
  active: boolean;

  // ===== V2.0: Shift Management =====
  /** Shift start time (HH:MM format) */
  shiftStartTime?: string;
  /** Shift end time (HH:MM format) */
  shiftEndTime?: string;
  /** Last login timestamp */
  lastLogin?: Timestamp;
}

/**
 * Address structure for customers
 */
export interface Address {
  /** Address label (e.g., "Home", "Office", "Shared via WhatsApp") */
  label: string;
  /** Full address string */
  address: string;
  /** Geographic coordinates */
  coordinates?: {
    lat: number;
    lng: number;
  };
  /** Source of the address (manual, whatsapp, google_autocomplete) */
  source?: 'manual' | 'whatsapp' | 'google_autocomplete';
  /** Timestamp when address was added (for WhatsApp addresses) */
  receivedAt?: Timestamp;
}

/**
 * Customer preferences
 */
export interface CustomerPreferences {
  /** Whether to receive notifications */
  notifications: boolean;
  /** Preferred language */
  language: 'en' | 'sw';
}

/**
 * Customer document structure
 * Collection: customers
 */
export interface Customer {
  /** Unique customer identifier */
  customerId: string;
  /** Customer's full name */
  name: string;
  /** Customer's phone number in E.164 format (+254712345678) */
  phone: string;
  /** Customer's email address (optional) */
  email?: string;
  /** Customer's saved addresses */
  addresses: Address[];
  /** Customer preferences */
  preferences: CustomerPreferences;
  /** Account creation timestamp */
  createdAt: Timestamp;
  /** Total number of orders placed */
  orderCount: number;
  /** Total amount spent (in KES) */
  totalSpent: number;
  /** Customer credit balance (FR-005: advance payments/store credit) */
  creditBalance?: number;
  /** Last credit transaction timestamp */
  lastCreditUpdate?: Timestamp;

  // ===== International Phone Support (FR-014) =====

  /** ISO 3166-1 alpha-2 country code (e.g., 'KE', 'US', 'GB') */
  countryCode?: string;
  /** Whether the phone number has been validated */
  phoneValidated?: boolean;
  /** National phone number without country code */
  nationalNumber?: string;
  /** Phone number in international format for display (+254 712 345 678) */
  phoneFormatted?: string;

  // ===== Customer Segmentation (FR-017) =====

  /** Customer segment: regular, vip, corporate */
  segment?: 'regular' | 'vip' | 'corporate';
  /** When customer qualified for VIP status */
  vipQualifiedAt?: Timestamp;
  /** Reference to corporate agreement (if corporate customer) */
  corporateAgreementId?: string;
  /** Last segment evaluation timestamp */
  lastSegmentEvaluation?: Timestamp;

  // ===== V2.0: Customer Enhancement Fields =====
  /** Customer type classification (V2.0) */
  customerType?: 'Regular' | 'Corporate' | 'VIP';
  /** Loyalty points balance (V2.0) */
  loyaltyPoints?: number;
  /** Last order date (V2.0) */
  lastOrderDate?: Timestamp;
}

// ============================================
// CORPORATE AGREEMENT TYPES (FR-017)
// ============================================

/**
 * Billing cycle for corporate agreements
 */
export type BillingCycle = 'monthly' | 'quarterly' | 'annual';

/**
 * Corporate agreement document structure
 * Collection: corporateAgreements
 */
export interface CorporateAgreement {
  /** Unique agreement identifier */
  agreementId: string;
  /** Company name */
  companyName: string;
  /** Agreement number (unique) */
  agreementNumber: string;
  /** Contact person name */
  contactPerson?: string;
  /** Contact email */
  contactEmail?: string;
  /** Contact phone */
  contactPhone?: string;
  /** Number of employees covered */
  employeeCount?: number;
  /** Discount percentage (0-100) */
  discountPercentage: number;
  /** Billing cycle */
  billingCycle: BillingCycle;
  /** Agreement start date */
  startDate: Timestamp;
  /** Agreement end date (optional) */
  endDate?: Timestamp;
  /** Whether agreement is active */
  isActive: boolean;
  /** Branch where agreement was created */
  branchId?: string;
  /** Creation timestamp */
  createdAt: Timestamp;
  /** Last update timestamp */
  updatedAt: Timestamp;
  /** Notes about the agreement */
  notes?: string;
}

/**
 * Customer statistics for segment evaluation
 * Collection: customerStatistics
 */
export interface CustomerStatistics {
  /** Customer ID (also document ID) */
  customerId: string;
  /** Total orders ever placed */
  totalOrders: number;
  /** Total amount spent ever */
  totalSpend: number;
  /** Last order date */
  lastOrderDate?: Timestamp;
  /** Orders in last 12 months */
  last12MonthsOrders: number;
  /** Spend in last 12 months */
  last12MonthsSpend: number;
  /** Average order value */
  avgOrderValue: number;
  /** Days since last order */
  daysSinceLastOrder?: number;
  /** Current segment */
  currentSegment: 'regular' | 'vip' | 'corporate';
  /** When statistics were last updated */
  updatedAt: Timestamp;
}

/**
 * Order status types
 * FR-008: 'ready' renamed to 'queued_for_delivery' for clearer terminology
 */
export type OrderStatus =
  | 'received'
  | 'inspection'
  | 'queued'
  | 'washing'
  | 'drying'
  | 'ironing'
  | 'quality_check'
  | 'packaging'
  | 'queued_for_delivery' // FR-008: Previously 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'collected';

/**
 * Payment status types
 */
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'overpaid';

/**
 * Payment method types
 * Note: Cash payment removed - this is a cashless system (M-Pesa 78%, Card 15%, Credit 7%)
 */
export type PaymentMethod = 'mpesa' | 'card' | 'credit' | 'customer_credit';

/**
 * Payment type classification (FR-005)
 */
export type PaymentType = 'partial' | 'full' | 'advance' | 'refund' | 'credit_applied';

/**
 * Order routing status (FR-006)
 * Tracks order progress through the routing and processing system
 */
export type RoutingStatus =
  | 'pending'          // Order created, awaiting routing decision
  | 'in_transit'       // Being transferred between branches
  | 'received'         // Received at processing branch
  | 'assigned'         // Assigned to workstation
  | 'processing'       // Being processed at workstation
  | 'ready_for_return'; // Processing complete, ready for sorting/delivery

/**
 * Stain detail structure
 */
export interface StainDetail {
  /** Location on garment (e.g., "collar", "sleeve", "front") */
  location: string;
  /** Type of stain (e.g., "oil", "wine", "ink") */
  type: string;
  /** Severity of stain */
  severity: 'light' | 'medium' | 'heavy';
}

/**
 * Rip/tear detail structure
 */
export interface RipDetail {
  /** Location on garment */
  location: string;
  /** Size of rip (e.g., "2cm", "small", "large") */
  size: string;
}

/**
 * Staff handler record for stage tracking
 */
export interface StaffHandler {
  /** Staff UID */
  uid: string;
  /** Staff name */
  name: string;
  /** Timestamp when stage was completed */
  completedAt: Timestamp;
}

/**
 * Garment item in an order
 */
/**
 * Garment category type (V2.0)
 */
export type GarmentCategory = 'Adult' | 'Children';

/**
 * Garment item in an order
 */
export interface Garment {
  /** Unique garment identifier (format: ORDER-ID-G##) */
  garmentId: string;
  /** Garment type (e.g., "Shirt", "Dress", "Suit") */
  type: string;
  /** Garment color */
  color: string;
  /** Brand name (V2.0: now mandatory - use "No Brand" if unknown) */
  brand: string;
  /** Whether "No Brand" was selected (V2.0) */
  noBrand?: boolean;
  /** Services requested (e.g., ["Dry Cleaning", "Ironing"]) */
  services: string[];
  /** Price for this garment (in KES) */
  price: number;
  /** Current status of this garment */
  status: string;
  /** Special handling instructions */
  specialInstructions?: string;
  /** Photo URLs of the garment */
  photos?: string[];

  // ===== V2.0: New Mandatory Fields =====
  /** Category: Adult or Children (V2.0: mandatory) */
  category: GarmentCategory;
  /** Auto-generated tag number for garment identification and printing */
  tagNumber?: string;
  /** Original garment ID (for rewash orders - links to garment in original order) */
  originalGarmentId?: string;

  // ===== Initial Inspection (at POS - Stage 1) =====
  /** Whether notable damage was detected during initial inspection */
  hasNotableDamage?: boolean;
  /** Notes from initial inspection at POS */
  initialInspectionNotes?: string;
  /** Photos from initial inspection */
  initialInspectionPhotos?: string[];

  // ===== Workstation Inspection (Stage 2) =====
  /** Whether detailed workstation inspection is completed */
  inspectionCompleted?: boolean;
  /** UID of staff who completed inspection */
  inspectionCompletedBy?: string;
  /** Timestamp when inspection was completed */
  inspectionCompletedAt?: Timestamp;
  /** Overall condition assessment */
  conditionAssessment?: 'good' | 'minor_issues' | 'major_issues';
  /** Number of missing buttons */
  missingButtonsCount?: number;
  /** Detailed stain information */
  stainDetails?: StainDetail[];
  /** Detailed rip/tear information */
  ripDetails?: RipDetail[];
  /** Photos of damage (required for major issues) */
  damagePhotos?: string[];
  /** Recommended actions for processing */
  recommendedActions?: ('repair' | 'special_treatment' | 'standard_process' | 'other')[];
  /** Additional notes if "other" is selected in recommended actions (max 200 words) */
  recommendedActionsOther?: string;
  /** Estimated additional time needed (in hours) */
  estimatedAdditionalTime?: number;

  // ===== Process Stage Tracking =====
  /** Staff who handled each stage (supports multiple staff per stage) */
  stageHandlers?: {
    inspection?: StaffHandler[];
    washing?: StaffHandler[];
    drying?: StaffHandler[];
    ironing?: StaffHandler[];
    quality_check?: StaffHandler[];
    packaging?: StaffHandler[];
  };

  /** Time spent at each stage (in seconds) for performance metrics */
  stageDurations?: {
    inspection?: number;
    washing?: number;
    drying?: number;
    ironing?: number;
    quality_check?: number;
    packaging?: number;
  };

  // ===== Load-Based Pricing (FR-015) =====

  /** Weight in kilograms (for load-based pricing) */
  weightKg?: number;
  /** Whether weight was measured or estimated */
  weightMeasured?: boolean;
  /** Price breakdown showing calculation details */
  priceBreakdown?: {
    basePrice: number;
    weightPortion?: number;
    discount?: number;
    pricingRuleId?: string;
  };
}

/**
 * Service type for orders (V2.0)
 */
export type ServiceType = 'Normal' | 'Express';

/**
 * Delivery classification type (V2.0)
 */
export type DeliveryClassification = 'Small' | 'Bulk';

/**
 * Order document structure
 * Collection: orders
 */
export interface Order {
  /** Unique order identifier (format: ORD-[BRANCH]-[YYYYMMDD]-[####]) */
  orderId: string;
  /** Reference to customer */
  customerId: string;
  /** Customer name (denormalized for quick display) */
  customerName?: string;
  /** Customer phone (denormalized for quick display) */
  customerPhone?: string;
  /** Reference to branch */
  branchId: string;
  /** Current order status */
  status: OrderStatus;
  /** List of garments in the order */
  garments: Garment[];
  /** Total order amount (in KES) */
  totalAmount: number;
  /** V2.0: Subtotal before express surcharge (in KES) */
  subtotal?: number;
  /** V2.0: Express surcharge amount (0 for normal service) */
  expressSurcharge?: number;
  /** Amount paid so far (in KES) */
  paidAmount: number;
  /** Payment status */
  paymentStatus: PaymentStatus;
  /** Payment method used */
  paymentMethod?: PaymentMethod;
  /** Reference to delivery (when order is out for delivery) */
  deliveryId?: string;
  /** Estimated completion timestamp */
  estimatedCompletion: Timestamp;
  /** Actual completion timestamp */
  actualCompletion?: Timestamp;
  /** Order creation timestamp */
  createdAt: Timestamp;
  /** UID of user who created the order */
  createdBy: string;

  // ===== V2.0: Order Enhancement Fields =====
  /** User ID of staff who checked/inspected the order at reception (V2.0: mandatory) */
  checkedBy: string;
  /** Name of inspector (denormalized for display) */
  checkedByName?: string;
  /** Service type: Normal or Express (V2.0) */
  serviceType: ServiceType;
  /** Delivery classification: Small (Motorcycle) or Bulk (Van) (V2.0) */
  deliveryClassification?: DeliveryClassification;
  /** Basis for delivery classification (garment_count, weight, value, manual) */
  classificationBasis?: 'garment_count' | 'weight' | 'value' | 'manual';
  /** User ID who manually overrode classification */
  classificationOverrideBy?: string;

  // ===== V2.0: Rewash System =====
  /** Whether this is a rewash order (V2.0) */
  isRewash?: boolean;
  /** Reference to original order ID (if this is a rewash) */
  originalOrderId?: string;
  /** Timestamp when rewash was requested */
  rewashRequestedAt?: Timestamp;
  /** Reason for rewash */
  rewashReason?: string;
  /** Whether this order has rewash requests (for original order tracking) */
  hasRewashRequest?: boolean;
  /** List of rewash order IDs created from this order */
  rewashOrderIds?: string[];

  // ===== Garment Collection =====
  /** How garments are collected: customer drops off or staff picks up */
  collectionMethod: 'dropped_off' | 'pickup_required';
  /** Address for pickup (only if collectionMethod === 'pickup_required') */
  pickupAddress?: Address;
  /** Special instructions for pickup */
  pickupInstructions?: string;
  /** Scheduled pickup time */
  pickupScheduledTime?: Timestamp;
  /** Actual pickup completion time */
  pickupCompletedTime?: Timestamp;
  /** Employee ID assigned to pickup */
  pickupAssignedTo?: string;

  // ===== Garment Return =====
  /** How garments are returned: customer collects or staff delivers */
  returnMethod: 'customer_collects' | 'delivery_required';
  /** Address for delivery (only if returnMethod === 'delivery_required') */
  deliveryAddress?: Address;
  /** Special instructions for delivery */
  deliveryInstructions?: string;
  /** Scheduled delivery time */
  deliveryScheduledTime?: Timestamp;
  /** Actual delivery completion time */
  deliveryCompletedTime?: Timestamp;
  /** Employee ID assigned to delivery */
  deliveryAssignedTo?: string;

  // ===== Satellite Store Transfer =====
  /** Original branch ID (if created at satellite store) */
  originBranchId?: string;
  /** Destination main store branch ID */
  destinationBranchId?: string;
  /** Reference to transfer batch ID */
  transferBatchId?: string;
  /** Timestamp when transferred from satellite */
  transferredAt?: Timestamp;
  /** Timestamp when received at main store */
  receivedAtMainStoreAt?: Timestamp;

  // ===== Workstation Status =====
  /** Whether major issues were detected during inspection */
  majorIssuesDetected?: boolean;
  /** UID of Workstation Manager who reviewed major issues */
  majorIssuesReviewedBy?: string;
  /** Timestamp when major issues were approved */
  majorIssuesApprovedAt?: Timestamp;

  // ===== Processing Batch =====
  /** Reference to processing batch ID (for washing/drying batches) */
  processingBatchId?: string;

  // ===== Order Routing (FR-006) =====
  /**
   * Routing status for tracking order through the system
   * - pending: Order created, awaiting routing decision
   * - in_transit: Being transferred between branches
   * - received: Received at processing branch
   * - assigned: Assigned to workstation
   * - processing: Being processed at workstation
   * - ready_for_return: Processing complete, ready for sorting/delivery
   */
  routingStatus?: 'pending' | 'in_transit' | 'received' | 'assigned' | 'processing' | 'ready_for_return';
  /** Branch that will process the order (may differ from originating branch for satellites) */
  processingBranchId?: string;
  /** Assigned workstation stage for processing */
  assignedWorkstationStage?: 'inspection' | 'washing' | 'drying' | 'ironing' | 'quality_check' | 'packaging';
  /** Staff member assigned to process this order at workstation */
  assignedWorkstationStaffId?: string;
  /** Timestamp when order was routed to workstation */
  routedAt?: Timestamp;
  /** Timestamp when order arrived at processing branch (for inter-branch transfers) */
  arrivedAtBranchAt?: Timestamp;
  /** Timestamp when sorting was completed (FR-007) */
  sortingCompletedAt?: Timestamp;
  /** Earliest time order can be scheduled for delivery (after sorting window - FR-007) */
  earliestDeliveryTime?: Timestamp;

  // ===== Redo Order Fields (FR-002) =====
  /** Whether this order is a redo order (zero cost to customer) */
  isRedo?: boolean;
  /** Reference to parent redo item ID (if this is a redo order) */
  parentRedoItemId?: string;
  /** Reference to original order ID (if this is a redo order) */
  parentOrderId?: string;

  // ===== Load-Based Pricing (FR-015) =====
  /** Total weight of all garments in kg */
  totalWeightKg?: number;
  /** Customer segment for pricing */
  customerSegment?: 'regular' | 'vip' | 'corporate';
  /** Price breakdown summary */
  pricingSummary?: {
    subtotal: number;
    weightBasedPortion: number;
    discount: number;
    total: number;
  };

  // ===== Legacy/Deprecated Fields =====
  /** @deprecated Use deliveryAssignedTo instead */
  driverId?: string;
  /** Special instructions for the order */
  specialInstructions?: string;
}

/**
 * Operating hours for a single day
 */
export interface DayOperatingHours {
  /** Opening time (24-hour format, e.g., "07:30") */
  open: string;
  /** Closing time (24-hour format, e.g., "20:00") */
  close: string;
}

/**
 * Branch operating hours configuration
 */
export interface BranchOperatingHours {
  /** Weekday hours (Monday-Friday) */
  weekday: DayOperatingHours;
  /** Saturday hours */
  saturday: DayOperatingHours;
  /** Sunday hours (null if closed) */
  sunday: DayOperatingHours | null;
  /** Whether branch operates 24 hours */
  is24Hours: boolean;
}

/**
 * Branch configuration for targets and operational settings
 * These values are configurable per-branch by Director/GM/Systems Admin
 *
 * @see lib/db/company-settings.ts for company-wide defaults
 */
export interface BranchConfig {
  // ===== Revenue Targets =====
  /** Daily revenue target in KES */
  dailyRevenueTarget: number;
  /** Monthly revenue target in KES */
  monthlyRevenueTarget: number;

  // ===== Performance Targets =====
  /** Customer retention target percentage (0-100) */
  retentionTarget: number;
  /** Premium service revenue target percentage (0-100) */
  premiumServiceTarget: number;
  /** Growth target percentage (0-100) */
  growthTarget: number;
  /** Target turnaround time in hours */
  turnaroundTargetHours: number;

  // ===== Operational Settings =====
  /** Operating hours configuration */
  operatingHours: BranchOperatingHours;
  /** Whether branch has processing equipment (main stores only) */
  hasEquipment: boolean;

  // ===== Inventory Settings =====
  /** Low stock threshold multiplier (e.g., 1.2 = alert at 120% of minimum) */
  lowStockThreshold: number;

  // ===== Contact =====
  /** WhatsApp number for customer notifications */
  whatsappNumber?: string;

  // ===== Audit =====
  /** When config was last updated */
  configUpdatedAt?: Timestamp;
  /** User ID who last updated config */
  configUpdatedBy?: string;
}

/**
 * Branch document structure
 * Collection: branches
 */
export interface Branch {
  /** Unique branch identifier */
  branchId: string;
  /** Branch name */
  name: string;
  /** Branch type: main store (with workstation) or satellite (collection point only) */
  branchType: 'main' | 'satellite';
  /** Main store ID (for satellite stores - which main store they transfer to) */
  mainStoreId?: string;
  /** Driver carrying capacity for auto-assignment algorithm */
  driverAvailability?: number;
  /** Daily revenue target in KES (for GM dashboard) - DEPRECATED: Use config.dailyRevenueTarget */
  dailyTarget?: number;
  /** Target turnaround time in hours (for performance metrics) - DEPRECATED: Use config.turnaroundTargetHours */
  targetTurnaroundHours?: number;
  /** Sorting window in hours - time required for sorting after inter-branch arrival (FR-007) */
  sortingWindowHours?: number;
  /** Branch location details */
  location: {
    /** Full address */
    address: string;
    /** Geographic coordinates */
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  /** Contact phone number */
  contactPhone: string;
  /** Whether the branch is active */
  active: boolean;
  /** Branch creation timestamp */
  createdAt: Timestamp;

  // ===== Branch Configuration (FR-074) =====
  /** Per-branch configurable targets and settings */
  config?: BranchConfig;
}

/**
 * Delivery stop status
 */
export type StopStatus = 'pending' | 'completed' | 'failed';

/**
 * Delivery stop details
 */
export interface DeliveryStop {
  /** Reference to order */
  orderId: string;
  /** Delivery address */
  address: string;
  /** Geographic coordinates */
  coordinates: {
    lat: number;
    lng: number;
  };
  /** Stop sequence number */
  sequence: number;
  /** Stop status */
  status: StopStatus;
  /** Completion/failure timestamp */
  timestamp?: Timestamp;
}

/**
 * Delivery route information
 */
export interface DeliveryRoute {
  /** Whether the route has been optimized */
  optimized: boolean;
  /** List of delivery stops */
  stops: DeliveryStop[];
  /** Total distance (in meters) */
  distance: number;
  /** Estimated duration (in seconds) */
  estimatedDuration: number;
}

/**
 * Delivery status types
 */
export type DeliveryStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

/**
 * Delivery document structure
 * Collection: deliveries
 */
export interface Delivery {
  /** Unique delivery identifier */
  deliveryId: string;
  /** Assigned driver UID */
  driverId: string;
  /** Reference to branch (where deliveries originate from) */
  branchId: string;
  /** List of order IDs in this delivery */
  orders: string[];
  /** Delivery route details */
  route: DeliveryRoute;
  /** Current delivery status */
  status: DeliveryStatus;
  /** Delivery start timestamp */
  startTime?: Timestamp;
  /** Delivery completion timestamp */
  endTime?: Timestamp;
  /** V2.0: Delivery classification - Small (Motorcycle) or Bulk (Van) */
  deliveryType?: 'small' | 'bulk';
}

/**
 * Inventory item document structure
 * Collection: inventory
 */
export interface InventoryItem {
  /** Unique item identifier */
  itemId: string;
  /** Branch reference */
  branchId: string;
  /** Item name */
  name: string;
  /** Item category */
  category: string;
  /** Unit of measurement (e.g., "kg", "liters", "pieces") */
  unit: string;
  /** Current quantity */
  quantity: number;
  /** Minimum quantity before reorder alert */
  reorderLevel: number;
  /** Cost per unit (in KES) */
  costPerUnit: number;
  /** Supplier name */
  supplier?: string;
  /** Last restock timestamp */
  lastRestocked: Timestamp;
  /** Expiry date (for perishable items) */
  expiryDate?: Timestamp;
}

/**
 * Transaction status types
 */
export type TransactionStatus = 'pending' | 'completed' | 'failed';

/**
 * Transaction document structure
 * Collection: transactions
 */
export interface Transaction {
  /** Unique transaction identifier */
  transactionId: string;
  /** Reference to order (optional for advance payments/credits) */
  orderId?: string;
  /** Reference to customer */
  customerId: string;
  /** Reference to branch (where transaction occurred) */
  branchId: string;
  /** Transaction amount (in KES) */
  amount: number;
  /** Payment method */
  method: PaymentMethod;
  /** Transaction status */
  status: TransactionStatus;
  /** Payment type classification (FR-005) */
  paymentType: PaymentType;
  /** Pesapal reference (for card/M-Pesa payments) */
  pesapalRef?: string;
  /** Transaction timestamp */
  timestamp: Timestamp;
  /** UID of user who processed the transaction */
  processedBy: string;
  /** Note/description for the payment */
  note?: string;
}

/**
 * Notification types
 */
export type NotificationType =
  | 'order_confirmation'
  | 'order_ready'
  | 'driver_dispatched'
  | 'driver_nearby'
  | 'delivered'
  | 'payment_reminder';

/**
 * Notification status types
 */
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed';

/**
 * Notification channel types
 */
export type NotificationChannel = 'whatsapp' | 'sms' | 'email';

/**
 * Notification document structure
 * Collection: notifications
 */
export interface Notification {
  /** Unique notification identifier */
  notificationId: string;
  /** Type of notification */
  type: NotificationType;
  /** Recipient user/customer ID */
  recipientId: string;
  /** Recipient phone number */
  recipientPhone: string;
  /** Notification message */
  message: string;
  /** Notification status */
  status: NotificationStatus;
  /** Delivery channel */
  channel: NotificationChannel;
  /** Creation timestamp */
  timestamp: Timestamp;
  /** Reference to related order (if applicable) */
  orderId?: string;
}

/**
 * Type guard to check if a user is staff
 */
export function isStaffRole(role: UserRole): boolean {
  return ['admin', 'manager', 'front_desk', 'workstation', 'driver'].includes(
    role
  );
}

/**
 * Type guard to check if a user is admin or manager
 */
export function isManagementRole(role: UserRole): boolean {
  return ['admin', 'manager'].includes(role);
}

/**
 * Type guard to check if an order is in active processing
 */
export function isOrderInProgress(status: OrderStatus): boolean {
  return [
    'received',
    'queued',
    'washing',
    'drying',
    'ironing',
    'quality_check',
    'packaging',
  ].includes(status);
}

/**
 * Type guard to check if an order is ready for customer
 * FR-008: Updated to use 'queued_for_delivery' instead of 'ready'
 */
export function isOrderReady(status: OrderStatus): boolean {
  return ['queued_for_delivery', 'out_for_delivery', 'delivered', 'collected'].includes(
    status
  );
}

/**
 * Pricing document structure for garment types
 * Collection: pricing
 */
export interface Pricing {
  /** Unique pricing ID */
  pricingId: string;
  /** Branch reference */
  branchId: string;
  /** Garment type (e.g., "Shirt", "Dress", "Suit") */
  garmentType: string;
  /** Service prices */
  services: {
    /** Wash service price */
    wash: number;
    /** Dry clean service price */
    dryClean: number;
    /** Iron service price */
    iron: number;
    /** Starch service price */
    starch: number;
    /** Express service - FREE (2hr turnaround, no extra cost) */
    express: number;
  };
  /** Whether this pricing is active */
  active: boolean;
  /** Creation timestamp */
  createdAt: Timestamp;
  /** Last update timestamp */
  updatedAt: Timestamp;
}

// ============================================
// LOAD-BASED PRICING TYPES (FR-015)
// ============================================

/**
 * Pricing type determines how price is calculated
 */
export type PricingType = 'per_item' | 'per_kg' | 'hybrid';

/**
 * Customer segment for tiered pricing
 */
export type CustomerSegment = 'regular' | 'vip' | 'corporate';

/**
 * Pricing rule document structure (FR-015)
 * Collection: pricingRules
 *
 * Defines flexible pricing rules that can be per-item, per-kg, or hybrid
 */
export interface PricingRule {
  /** Unique rule identifier */
  ruleId: string;
  /** Rule name for display */
  ruleName: string;
  /** Branch reference (or 'ALL' for global rules) */
  branchId: string;
  /** Service type (e.g., 'wash', 'dry_clean', 'laundry_kg') */
  serviceType: string;
  /** Customer segment this rule applies to */
  customerSegment: CustomerSegment;
  /** How pricing is calculated */
  pricingType: PricingType;
  /** Base price (for per_item and hybrid) */
  basePrice: number;
  /** Price per kilogram (for per_kg and hybrid) */
  pricePerKg?: number;
  /** Minimum weight for this rule to apply */
  minWeightKg?: number;
  /** Maximum weight for this rule (optional cap) */
  maxWeightKg?: number;
  /** Discount percentage (0-100) */
  discountPercentage?: number;
  /** Priority for rule matching (higher = checked first) */
  priority: number;
  /** Whether this rule is active */
  isActive: boolean;
  /** Creation timestamp */
  createdAt: Timestamp;
  /** Last update timestamp */
  updatedAt: Timestamp;
}

/**
 * Weight tracking for orders (FR-015)
 * Added to order_items/garments
 */
export interface WeightInfo {
  /** Weight in kilograms */
  weightKg: number;
  /** Whether weight was measured or estimated */
  measured: boolean;
  /** Timestamp when weight was recorded */
  recordedAt?: Timestamp;
  /** Staff who recorded the weight */
  recordedBy?: string;
}

/**
 * Price breakdown for transparent pricing display
 */
export interface PriceBreakdown {
  /** Base calculation (item price or base + weight) */
  baseCalculation: number;
  /** Weight-based portion */
  weightPortion?: number;
  /** Discount applied */
  discount?: number;
  /** Final price after all calculations */
  finalPrice: number;
  /** Rule used for calculation */
  pricingRuleId?: string;
  /** Rule name for display */
  pricingRuleName?: string;
  /** Customer segment applied */
  customerSegment: CustomerSegment;
}

/**
 * Load metrics for capacity planning
 */
export interface LoadMetrics {
  /** Total weight processed */
  totalWeightKg: number;
  /** Number of orders */
  orderCount: number;
  /** Average weight per order */
  avgWeightPerOrder: number;
  /** By service type breakdown */
  byServiceType: Record<string, number>;
  /** By branch breakdown */
  byBranch?: Record<string, number>;
  /** Time period */
  period: {
    start: Date;
    end: Date;
  };
}

/**
 * Workstation capacity for load balancing
 */
export interface WorkstationCapacity {
  /** Workstation identifier */
  workstationId: string;
  /** Branch reference */
  branchId: string;
  /** Maximum daily capacity in kg */
  maxDailyKg: number;
  /** Current day's load in kg */
  currentLoadKg: number;
  /** Utilization percentage */
  utilizationPercent: number;
  /** Last updated timestamp */
  updatedAt: Timestamp;
}

/**
 * Status history entry for orders
 */
export interface StatusHistoryEntry {
  /** Order status */
  status: OrderStatus;
  /** Timestamp of status change */
  timestamp: Timestamp;
  /** UID of user who made the change */
  updatedBy: string;
}

/**
 * Extended Order interface with denormalized fields and status history
 */
export interface OrderExtended extends Order {
  /** Customer name (denormalized for quick display) */
  customerName: string;
  /** Customer phone (denormalized for quick display) */
  customerPhone: string;
  /** Last update timestamp */
  updatedAt: Timestamp;
  /** Status change history */
  statusHistory: StatusHistoryEntry[];
}

/**
 * Extended Transaction interface with additional metadata
 */
export interface TransactionExtended extends Transaction {
  /** Additional payment gateway metadata */
  metadata?: {
    /** M-Pesa transaction code */
    mpesaTransactionCode?: string;
    /** Card last 4 digits */
    cardLast4?: string;
    /** Payment gateway response */
    gatewayResponse?: string;
  };
}

/**
 * Employee shift types
 */
export type ShiftType = 'morning' | 'afternoon' | 'night';

/**
 * Attendance status types
 */
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day';

/**
 * Attendance record source types
 */
export type AttendanceSource = 'biometric' | 'manual' | 'system';

/**
 * Employee document structure
 * Collection: employees
 */
export interface Employee {
  /** Unique employee identifier */
  employeeId: string;
  /** Firebase Auth UID (links to users collection) */
  uid: string;
  /** Employee's full name */
  name: string;
  /** Employee's role */
  role: UserRole;
  /** Branch assignment */
  branchId: string;
  /** Employee's phone number */
  phone: string;
  /** Employee's email */
  email: string;
  /** Scheduled shift */
  shift: ShiftType;
  /** Hourly wage (in KES) */
  hourlyWage: number;
  /** Date of hire */
  hireDate: Timestamp;
  /** Whether employee is active */
  active: boolean;
  /** Emergency contact information */
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  /** Employee photo URL */
  photoUrl?: string;
  /** Last attendance timestamp */
  lastAttendance?: Timestamp;
  /** Array of registered biometric IDs (fingerprint/card/face) */
  biometricIds?: string[];
  /** Whether employee has enrolled biometrics */
  biometricEnrolled?: boolean;
}

/**
 * Attendance record document structure
 * Collection: attendance
 */
export interface AttendanceRecord {
  /** Unique attendance record ID */
  attendanceId: string;
  /** Reference to employee */
  employeeId: string;
  /** Employee name (denormalized) */
  employeeName: string;
  /** Reference to branch */
  branchId: string;
  /** Attendance date */
  date: Timestamp;
  /** Check-in timestamp */
  checkIn?: Timestamp;
  /** Check-out timestamp */
  checkOut?: Timestamp;
  /** Attendance status */
  status: AttendanceStatus;
  /** Hours worked (calculated on checkout) */
  hoursWorked?: number;
  /** Notes about the attendance */
  notes?: string;
  /** Recorded by (UID of manager/admin) */
  recordedBy: string;
  /** Source of attendance record */
  source: AttendanceSource;
  /** Link to original biometric event (if source is biometric) */
  biometricEventId?: string;
  /** Device that recorded this attendance (if source is biometric) */
  deviceId?: string;
}

/**
 * Inventory usage/transaction types
 */
export type InventoryTransactionType = 'usage' | 'restock' | 'adjustment' | 'waste';

/**
 * Inventory transaction document structure
 * Collection: inventory_transactions
 */
export interface InventoryTransaction {
  /** Unique transaction ID */
  transactionId: string;
  /** Reference to inventory item */
  itemId: string;
  /** Reference to branch */
  branchId: string;
  /** Transaction type */
  type: InventoryTransactionType;
  /** Quantity change (positive for restock, negative for usage) */
  quantityChange: number;
  /** Quantity after transaction */
  quantityAfter: number;
  /** Related order ID (for usage transactions) */
  orderId?: string;
  /** Notes about the transaction */
  notes?: string;
  /** Transaction timestamp */
  timestamp: Timestamp;
  /** UID of user who performed the transaction */
  performedBy: string;
}

/**
 * Receipt type (V2.0)
 */
export type ReceiptType = 'order' | 'delivery_note' | 'tailor_note';

/**
 * Receipt document structure
 * Collection: receipts
 */
export interface Receipt {
  /** Unique receipt identifier */
  receiptId: string;
  /** Auto-generated receipt number (V2.0) */
  receiptNumber?: string;
  /** Reference to order */
  orderId: string;
  /** Reference to customer */
  customerId: string;
  /** PDF file URL in Firebase Storage */
  pdfUrl: string;
  /** Receipt generation timestamp */
  generatedAt: Timestamp;
  /** Whether receipt was emailed */
  emailSent: boolean;
  /** Email sent timestamp */
  emailSentAt?: Timestamp;
  /** UID of user who generated the receipt */
  generatedBy: string;

  // ===== V2.0: Receipt Enhancement Fields =====
  /** Receipt type (V2.0) */
  receiptType?: ReceiptType;
  /** QR code data URL for order tracking (V2.0) */
  qrCodeData?: string;
  /** URL to Terms & Conditions page (V2.0) */
  termsUrl?: string;
  /** Timestamp when receipt was printed (V2.0) */
  printedAt?: Timestamp;
  /** UID of user who printed the receipt (V2.0) */
  printedBy?: string;
  /** Reprint count (V2.0) */
  reprintCount?: number;
}

/**
 * Transfer batch status types
 */
export type TransferBatchStatus = 'pending' | 'in_transit' | 'received';

/**
 * Transfer batch document structure
 * Collection: transferBatches
 *
 * Manages batches of orders transferred from satellite stores to main stores
 */
export interface TransferBatch {
  /** Unique batch identifier (format: TRF-[SATELLITE]-[YYYYMMDD]-[####]) */
  batchId: string;
  /** Source satellite branch ID */
  satelliteBranchId: string;
  /** Destination main store branch ID */
  mainStoreBranchId: string;
  /** Array of order IDs in this batch */
  orderIds: string[];
  /** Current batch status */
  status: TransferBatchStatus;
  /** UID of driver assigned to transport this batch */
  assignedDriverId?: string;
  /** Batch creation timestamp */
  createdAt: Timestamp;
  /** Timestamp when batch was dispatched from satellite */
  dispatchedAt?: Timestamp;
  /** Timestamp when batch was received at main store */
  receivedAt?: Timestamp;
  /** Total number of orders in batch */
  totalOrders: number;
  /** UID of user who created the batch */
  createdBy: string;
}

/**
 * Processing batch status types
 */
export type ProcessingBatchStatus = 'pending' | 'in_progress' | 'completed';

/**
 * Processing batch stage types
 */
export type ProcessingBatchStage = 'washing' | 'drying' | 'ironing';

/**
 * Processing batch document structure
 * Collection: processingBatches
 *
 * Manages batches of orders processed together through washing/drying stages
 */
export interface ProcessingBatch {
  /** Unique batch identifier (format: PROC-[STAGE]-[YYYYMMDD]-[####]) */
  batchId: string;
  /** Processing stage for this batch */
  stage: ProcessingBatchStage;
  /** Array of order IDs in this batch */
  orderIds: string[];
  /** Total number of garments in batch */
  garmentCount: number;
  /** Array of staff UIDs assigned to process this batch */
  assignedStaffIds: string[];
  /** Current batch status */
  status: ProcessingBatchStatus;
  /** UID of user (Workstation Manager) who created the batch */
  createdBy: string;
  /** Batch creation timestamp */
  createdAt: Timestamp;
  /** Timestamp when batch processing started */
  startedAt?: Timestamp;
  /** Timestamp when batch processing completed */
  completedAt?: Timestamp;
  /** Branch ID where batch is being processed */
  branchId: string;
}

/**
 * Workstation assignment document structure
 * Collection: workstationAssignments
 *
 * Manages permanent staff assignments to workstation stages
 */
export interface WorkstationAssignment {
  /** Unique assignment identifier */
  assignmentId: string;
  /** UID of assigned staff member */
  staffId: string;
  /** Name of assigned staff member */
  staffName: string;
  /** Permanently assigned stage (null if no permanent assignment) */
  permanentStage?: 'inspection' | 'washing' | 'drying' | 'ironing' | 'quality_check' | 'packaging';
  /** Branch ID where staff is assigned */
  branchId: string;
  /** Whether this assignment is currently active */
  isActive: boolean;
  /** Assignment creation timestamp */
  createdAt: Timestamp;
  /** UID of user (Workstation Manager) who created the assignment */
  createdBy: string;
  /** Timestamp when assignment was last modified */
  updatedAt?: Timestamp;
}

/**
 * Inventory transfer status types
 */
export type InventoryTransferStatus =
  | 'draft'
  | 'requested'
  | 'approved'
  | 'in_transit'
  | 'received'
  | 'reconciled'
  | 'rejected'
  | 'cancelled';

/**
 * Inventory transfer item structure
 */
export interface InventoryTransferItem {
  /** Reference to inventory item ID */
  inventoryItemId: string;
  /** Item name (denormalized) */
  name: string;
  /** Unit of measurement */
  unit: string;
  /** Quantity being transferred */
  quantity: number;
  /** Cost per unit */
  costPerUnit: number;
  /** Actual quantity received (may differ from requested) */
  receivedQuantity?: number;
}

/**
 * Audit trail entry for inventory transfers
 */
export interface TransferAuditEntry {
  /** Status at this point */
  status: InventoryTransferStatus;
  /** Timestamp of this action */
  timestamp: Timestamp;
  /** UID of user who performed this action */
  userId: string;
  /** User name (denormalized) */
  userName: string;
  /** Notes about this action */
  notes?: string;
}

/**
 * Inventory transfer document structure
 * Collection: inventoryTransfers
 *
 * Manages inventory transfers between branches
 */
export interface InventoryTransfer {
  /** Unique transfer identifier (format: TRF-INV-[YYYYMMDD]-[####]) */
  transferId: string;
  /** Source branch ID (sender) */
  fromBranchId: string;
  /** Destination branch ID (receiver) */
  toBranchId: string;
  /** Items being transferred */
  items: InventoryTransferItem[];
  /** Current transfer status */
  status: InventoryTransferStatus;
  /** UID of user who created/requested the transfer */
  requestedBy: string;
  /** UID of user who approved the transfer (required before dispatch) */
  approvedBy?: string;
  /** Timestamp when transfer was dispatched from sender */
  dispatchedAt?: Timestamp;
  /** Timestamp when transfer was received at destination */
  receivedAt?: Timestamp;
  /** Timestamp when transfer was reconciled (quantities verified) */
  reconciledAt?: Timestamp;
  /** Additional notes about the transfer */
  notes?: string;
  /** Audit trail of all status changes */
  auditTrail: TransferAuditEntry[];
  /** Creation timestamp */
  createdAt: Timestamp;
  /** Last update timestamp */
  updatedAt?: Timestamp;
  /** Discrepancies found during reconciliation */
  discrepancies?: {
    itemId: string;
    expected: number;
    actual: number;
    notes?: string;
  }[];
}

/**
 * Updated Inventory item with transfer tracking fields
 */
export interface InventoryItemExtended extends InventoryItem {
  /** Quantity on hand (available for use) */
  onHand: number;
  /** Quantity reserved (allocated but not yet used) */
  reserved?: number;
  /** Quantity pending transfer out (approved transfers not yet dispatched) */
  pendingTransferOut?: number;
  /** Quantity in transit (dispatched but not yet received) */
  inTransit?: number;
}

/**
 * Audit log action types
 */
export type AuditLogAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'transfer'
  | 'approve'
  | 'reject'
  | 'role_change'
  | 'branch_access_change'
  | 'permission_change';

/**
 * Audit log document structure
 * Collection: auditLogs
 *
 * Tracks all administrative and cross-branch actions for compliance
 */
export interface AuditLog {
  /** Unique audit log ID */
  auditLogId: string;
  /** Action performed */
  action: AuditLogAction;
  /** Resource type (e.g., 'order', 'inventory', 'user', 'transfer') */
  resourceType: string;
  /** Resource ID */
  resourceId: string;
  /** UID of user who performed the action */
  performedBy: string;
  /** User name (denormalized) */
  performedByName: string;
  /** User role at time of action */
  performedByRole: UserRole;
  /** Branch ID where action was performed (null for global actions) */
  branchId?: string;
  /** Additional branch IDs involved (for transfers) */
  additionalBranchIds?: string[];
  /** Description of the action */
  description: string;
  /** Changes made (before/after snapshot) */
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
  /** IP address of the user */
  ipAddress?: string;
  /** User agent string */
  userAgent?: string;
  /** Timestamp when action was performed */
  timestamp: Timestamp;
}

/**
 * Driver Location document structure
 * Collection: driverLocations
 *
 * Used for real-time tracking of drivers during active deliveries.
 * Document ID matches deliveryId for easy lookup.
 */
export interface DriverLocation {
  /** Delivery ID (also the document ID) */
  deliveryId: string;
  /** Driver UID */
  driverId: string;
  /** Current location coordinates */
  location: {
    lat: number;
    lng: number;
  };
  /** Heading/direction in degrees (0-360, 0 = North) */
  heading?: number;
  /** Speed in meters per second */
  speed?: number;
  /** Last update timestamp */
  lastUpdated: Timestamp;
  /** Whether location tracking is active */
  isActive: boolean;
}

// ============================================
// LLM CONFIGURATION TYPES
// ============================================

/**
 * LLM Provider types supported by the system
 */
export type LLMProvider = 'openai' | 'anthropic' | 'google' | 'local';

/**
 * Agent function types that use LLMs
 */
export type AgentFunction =
  | 'chat_response'
  | 'intent_classification'
  | 'data_response'
  | 'analytics_insights'
  | 'time_estimation';

/**
 * Agent type identifiers for LLM configuration
 */
export type LLMAgentType =
  | 'orchestrator'
  | 'order'
  | 'pricing'
  | 'customer'
  | 'support'
  | 'onboarding'
  | 'logistics'
  | 'analytics';

/**
 * Connection status for providers
 */
export type ProviderConnectionStatus = 'connected' | 'disconnected' | 'error' | 'untested';

/**
 * Provider configuration stored in Firestore
 * Collection: system_config/providers/{providerId}
 */
export interface ProviderConfig {
  /** Provider identifier */
  providerId: LLMProvider;
  /** Display name for UI */
  displayName: string;
  /** Whether this provider is enabled */
  enabled: boolean;
  /** API key (encrypted with AES-256-GCM) */
  encryptedApiKey?: string;
  /** Initialization vector for decryption */
  keyIV?: string;
  /** Authentication tag for verification */
  keyAuthTag?: string;
  /** API base URL (for local models or custom endpoints) */
  baseUrl?: string;
  /** Available models for this provider */
  availableModels: string[];
  /** Default model for this provider */
  defaultModel: string;
  /** Connection status */
  connectionStatus: ProviderConnectionStatus;
  /** Last connection test timestamp */
  lastTestedAt?: Timestamp;
  /** Last test error message */
  lastTestError?: string;
  /** Created timestamp */
  createdAt: Timestamp;
  /** Updated timestamp */
  updatedAt: Timestamp;
  /** Who last updated this config */
  updatedBy: string;
}

/**
 * Model assignment configuration
 * Collection: system_config/model_assignments/{assignmentId}
 */
export interface ModelAssignment {
  /** Unique assignment ID */
  assignmentId: string;
  /** Agent type this applies to ('*' for global default) */
  agentType: LLMAgentType | '*';
  /** Function this applies to ('*' for all functions in agent) */
  agentFunction: AgentFunction | '*';
  /** Provider to use */
  provider: LLMProvider;
  /** Model to use */
  model: string;
  /** Priority (lower = higher priority, for fallback chain) */
  priority: number;
  /** Whether this assignment is active */
  enabled: boolean;
  /** Temperature setting (0-2) */
  temperature?: number;
  /** Max tokens */
  maxTokens?: number;
  /** Additional model parameters */
  additionalParams?: Record<string, unknown>;
  /** Created timestamp */
  createdAt: Timestamp;
  /** Updated timestamp */
  updatedAt: Timestamp;
  /** Who created/updated */
  updatedBy: string;
}

/**
 * Global LLM configuration settings
 * Collection: system_config/global/llm_settings
 */
export interface GlobalLLMConfig {
  /** Document ID: 'llm_settings' */
  configId: 'llm_settings';
  /** Default provider when no specific assignment exists */
  defaultProvider: LLMProvider;
  /** Default model for default provider */
  defaultModel: string;
  /** Enable fallback to next provider on error */
  enableFallback: boolean;
  /** Fallback provider order */
  fallbackOrder: LLMProvider[];
  /** Request timeout in milliseconds */
  requestTimeoutMs: number;
  /** Enable request logging */
  enableRequestLogging: boolean;
  /** Max retry attempts */
  maxRetries: number;
  /** Rate limit per minute (0 = unlimited) */
  rateLimitPerMinute: number;
  /** Created timestamp */
  createdAt: Timestamp;
  /** Updated timestamp */
  updatedAt: Timestamp;
  /** Who last updated */
  updatedBy: string;
}

// ============================================
// BIOMETRIC INTEGRATION TYPES
// ============================================

/**
 * Biometric device vendor types
 */
export type BiometricVendor = 'zkteco' | 'suprema' | 'hikvision' | 'generic';

/**
 * Biometric device types
 */
export type BiometricDeviceType = 'fingerprint' | 'facial' | 'rfid' | 'multi';

/**
 * Biometric event types
 */
export type BiometricEventType = 'clock_in' | 'clock_out' | 'unknown';

/**
 * Biometric device document structure
 * Collection: biometricDevices
 *
 * Manages biometric devices (fingerprint, facial recognition, RFID) used for
 * employee attendance tracking across branches.
 */
export interface BiometricDevice {
  /** Unique device identifier */
  deviceId: string;
  /** Branch where device is installed */
  branchId: string;
  /** Human-readable device name */
  name: string;
  /** Device vendor/manufacturer */
  vendor: BiometricVendor;
  /** Type of biometric recognition */
  deviceType: BiometricDeviceType;
  /** Physical location (e.g., "Main Entrance", "Back Door") */
  location: string;
  /** Device IP address (for network devices) */
  ipAddress?: string;
  /** Device serial number */
  serialNumber?: string;
  /** API endpoint for device communication */
  apiEndpoint?: string;
  /** API key for device authentication */
  apiKey?: string;
  /** Last successful data sync timestamp */
  lastSync: Timestamp;
  /** Last heartbeat/ping timestamp */
  lastHeartbeat?: Timestamp;
  /** Whether device is active and operational */
  active: boolean;
  /** Vendor-specific configuration */
  config?: Record<string, unknown>;
  /** Device creation timestamp */
  createdAt: Timestamp;
  /** Last update timestamp */
  updatedAt?: Timestamp;
  /** Who added this device */
  createdBy: string;
}

/**
 * Biometric event document structure
 * Collection: biometricEvents
 *
 * Raw events received from biometric devices. These are processed
 * to create attendance records.
 */
export interface BiometricEvent {
  /** Unique event identifier */
  eventId: string;
  /** Device that generated this event */
  deviceId: string;
  /** Branch where event occurred */
  branchId: string;
  /** Employee ID (null if unrecognized biometric) */
  employeeId?: string;
  /** Biometric identifier from device (fingerprint ID, card number, etc.) */
  biometricId: string;
  /** Type of clock event */
  eventType: BiometricEventType;
  /** When the event occurred */
  timestamp: Timestamp;
  /** Original payload from device */
  rawData?: Record<string, unknown>;
  /** Whether this event has been processed into attendance */
  processed: boolean;
  /** Link to created attendance record */
  attendanceRecordId?: string;
  /** Processing error message (if any) */
  processingError?: string;
}

// ============================================
// CUSTOMER FEEDBACK TYPES
// ============================================

/**
 * Processing stage types for staff ratings
 */
export type ProcessingStage =
  | 'reception'
  | 'inspection'
  | 'washing'
  | 'drying'
  | 'ironing'
  | 'quality_check'
  | 'packaging'
  | 'delivery';

/**
 * Feedback source types
 */
export type FeedbackSource = 'whatsapp' | 'sms' | 'qr_code' | 'manual';

/**
 * Staff rating within customer feedback
 */
export interface StaffRating {
  /** Staff member UID */
  staffId: string;
  /** Staff member name (denormalized) */
  staffName: string;
  /** Which processing stage they handled */
  stage: ProcessingStage;
  /** Rating (1-5 stars) */
  rating: number;
  /** Optional comment about this staff */
  comment?: string;
}

/**
 * Questionnaire response within customer feedback
 */
export interface FeedbackResponse {
  /** Question text */
  question: string;
  /** Answer (text or numeric rating) */
  answer: string | number;
  /** Staff member this question relates to (if applicable) */
  relatedStaffId?: string;
}

/**
 * Customer feedback document structure
 * Collection: customerFeedback
 *
 * Captures customer satisfaction data collected via WhatsApp,
 * SMS, or QR code on receipts.
 */
export interface CustomerFeedback {
  /** Unique feedback identifier */
  feedbackId: string;
  /** Reference to order */
  orderId: string;
  /** Reference to customer */
  customerId: string;
  /** Branch where order was processed */
  branchId: string;
  /** Overall rating (1-5 stars) */
  overallRating: number;
  /** Individual staff ratings (from questionnaire) */
  staffRatings?: StaffRating[];
  /** Questionnaire responses */
  responses?: FeedbackResponse[];
  /** How feedback was collected */
  source: FeedbackSource;
  /** When feedback was submitted */
  submittedAt: Timestamp;
  /** Device/browser info (for fraud detection) */
  deviceInfo?: string;
  /** Customer's optional comment */
  comment?: string;
  /** Whether customer recommends the service */
  wouldRecommend?: boolean;
}

// ============================================
// REDO ITEMS TYPES (FR-002)
// ============================================

/**
 * Redo reason code types
 */
export type RedoReasonCode =
  | 'quality_issue'
  | 'damage'
  | 'incomplete_service'
  | 'wrong_service'
  | 'customer_complaint'
  | 'stain_not_removed'
  | 'shrinkage'
  | 'color_damage'
  | 'other';

/**
 * Redo item status types
 */
export type RedoItemStatus =
  | 'pending'
  | 'approved'
  | 'in_progress'
  | 'completed'
  | 'rejected';

/**
 * Redo item document structure
 * Collection: redoItems
 *
 * Manages items that need to be re-processed due to quality issues.
 * Redo orders are created at zero cost to the customer.
 */
export interface RedoItem {
  /** Unique redo item identifier */
  redoItemId: string;
  /** Reference to original order */
  originalOrderId: string;
  /** Reference to original garment within the order */
  originalGarmentId: string;
  /** Reference to the redo order (created when approved) */
  redoOrderId?: string;
  /** Branch where issue was identified */
  branchId: string;
  /** Reason code for the redo */
  reasonCode: RedoReasonCode;
  /** Detailed description of the issue */
  reasonDescription?: string;
  /** Photo evidence of the issue */
  photos?: string[];
  /** Staff UID who identified the issue */
  identifiedBy: string;
  /** Staff name (denormalized) */
  identifiedByName: string;
  /** Timestamp when issue was identified */
  identifiedAt: Timestamp;
  /** Current status of the redo item */
  status: RedoItemStatus;
  /** Staff UID who approved/rejected */
  reviewedBy?: string;
  /** Timestamp when reviewed */
  reviewedAt?: Timestamp;
  /** Notes from reviewer */
  reviewNotes?: string;
  /** Priority level (redo items are typically high priority) */
  priority: 'high' | 'urgent';
  /** Customer name (denormalized for display) */
  customerName?: string;
  /** Customer phone (denormalized for display) */
  customerPhone?: string;
  /** Creation timestamp */
  createdAt: Timestamp;
  /** Last update timestamp */
  updatedAt?: Timestamp;
}

/**
 * Extended Order interface fields for redo tracking
 * These fields are added to the Order interface
 */
export interface OrderRedoFields {
  /** Whether this order is a redo order (zero cost) */
  isRedo?: boolean;
  /** Reference to parent redo item ID (if this is a redo order) */
  parentRedoItemId?: string;
  /** Reference to original order ID (if this is a redo order) */
  parentOrderId?: string;
}

/**
 * Redo metrics for dashboard display
 */
export interface RedoMetrics {
  /** Total redo items in period */
  totalRedoItems: number;
  /** Breakdown by reason code */
  byReasonCode: Record<RedoReasonCode, number>;
  /** Breakdown by branch */
  byBranch: Record<string, number>;
  /** Redo rate as percentage of total orders */
  redoRate: number;
  /** Average time from identification to completion (hours) */
  avgResolutionTime: number;
  /** Pending redo items count */
  pendingCount: number;
  /** In progress redo items count */
  inProgressCount: number;
}

// ============================================
// DEFECT NOTIFICATION TYPES (FR-003)
// ============================================

/**
 * Defect types that can be identified during QC
 */
export type DefectType =
  | 'stain_remaining'
  | 'color_fading'
  | 'shrinkage'
  | 'damage'
  | 'missing_buttons'
  | 'torn_seams'
  | 'discoloration'
  | 'odor'
  | 'other';

/**
 * Status of a defect notification
 */
export type DefectNotificationStatus =
  | 'pending'        // Defect identified, not yet notified
  | 'notified'       // Customer has been notified
  | 'acknowledged'   // Customer acknowledged the notification
  | 'escalated'      // Escalated due to missed deadline
  | 'resolved';      // Issue resolved

/**
 * Defect notification record
 * Tracks when defects are identified and customer notification timelines
 */
export interface DefectNotification {
  /** Unique notification ID */
  notificationId: string;
  /** Reference to the order */
  orderId: string;
  /** Reference to the specific garment */
  garmentId: string;
  /** Branch where defect was identified */
  branchId: string;
  /** Type of defect */
  defectType: DefectType;
  /** Detailed description of the defect */
  defectDescription: string;
  /** Photo evidence of the defect */
  photos?: string[];
  /** When the defect was identified */
  identifiedAt: Timestamp;
  /** Staff who identified the defect */
  identifiedBy: string;
  /** Staff name (denormalized) */
  identifiedByName: string;
  /** Deadline for customer notification */
  notificationDeadline: Timestamp;
  /** When customer was notified (null if not yet) */
  customerNotifiedAt?: Timestamp;
  /** Whether notification was within timeline */
  isWithinTimeline?: boolean;
  /** Staff who notified the customer */
  notifiedBy?: string;
  /** Current status */
  status: DefectNotificationStatus;
  /** Customer acknowledgment timestamp */
  acknowledgedAt?: Timestamp;
  /** Customer's response/decision */
  customerResponse?: string;
  /** Resolution notes */
  resolutionNotes?: string;
  /** When the issue was resolved */
  resolvedAt?: Timestamp;
  /** Staff who resolved the issue */
  resolvedBy?: string;
  /** Customer info (denormalized) */
  customerName?: string;
  customerPhone?: string;
  /** Created timestamp */
  createdAt: Timestamp;
  /** Last updated timestamp */
  updatedAt?: Timestamp;
}

/**
 * Configurable timeline for defect notifications by service type
 */
export interface DefectNotificationTimeline {
  /** Unique timeline ID */
  timelineId: string;
  /** Service type this timeline applies to */
  serviceType: string;
  /** Hours allowed for notification (e.g., 24, 48) */
  notificationWindowHours: number;
  /** Whether this timeline is active */
  isActive: boolean;
  /** Description of the timeline rule */
  description?: string;
  /** Created timestamp */
  createdAt: Timestamp;
  /** Last updated timestamp */
  updatedAt?: Timestamp;
}

/**
 * Metrics for defect notification compliance
 */
export interface DefectNotificationMetrics {
  /** Total defect notifications in period */
  totalNotifications: number;
  /** Notifications within timeline */
  withinTimeline: number;
  /** Notifications that missed deadline */
  missedDeadline: number;
  /** Compliance rate as percentage */
  complianceRate: number;
  /** Breakdown by defect type */
  byDefectType: Record<DefectType, number>;
  /** Breakdown by branch */
  byBranch: Record<string, number>;
  /** Average time to notify (hours) */
  avgTimeToNotify: number;
  /** Pending notifications count */
  pendingCount: number;
}

// ============================================
// QC HANDOVER TYPES (FR-004)
// ============================================

/**
 * Types of QC handovers requiring customer service follow-up
 */
export type QCHandoverType =
  | 'alteration'      // Needs alteration (customer approval needed)
  | 'defect'          // Has defect (linked to defect notification)
  | 'damage'          // Damaged during processing
  | 'exception'       // Other exceptions requiring customer decision
  | 'pricing_issue'   // Pricing dispute or additional charges
  | 'special_care';   // Special care instructions needed

/**
 * Status of QC handover
 */
export type QCHandoverStatus =
  | 'pending'         // Waiting for customer service acknowledgement
  | 'acknowledged'    // Customer service acknowledged
  | 'in_progress'     // Customer service working on it
  | 'customer_contacted' // Customer has been contacted
  | 'resolved'        // Issue resolved
  | 'cancelled';      // Handover cancelled

/**
 * Recommended actions for customer service
 */
export type RecommendedAction =
  | 'notify_customer'    // Just notify customer
  | 'request_approval'   // Need customer approval to proceed
  | 'offer_discount'     // Offer discount/compensation
  | 'schedule_pickup'    // Schedule re-pickup
  | 'process_refund'     // Process refund
  | 'no_action';         // No action needed, just FYI

/**
 * QC Handover document structure (FR-004)
 * Collection: qcHandovers
 *
 * Created by QC staff when issues need customer service follow-up.
 */
export interface QCHandover {
  /** Unique handover ID (format: HO-[BRANCH]-[YYYYMMDD]-[####]) */
  handoverId: string;
  /** Order ID this handover relates to */
  orderId: string;
  /** Garment ID if specific to a garment */
  garmentId?: string;
  /** Branch ID where handover was created */
  branchId: string;
  /** Type of handover */
  handoverType: QCHandoverType;
  /** Detailed description of the issue */
  description: string;
  /** Photo URLs documenting the issue */
  photos?: string[];
  /** QC staff notes for customer service */
  qcNotes?: string;
  /** Recommended action for customer service */
  recommendedAction: RecommendedAction;
  /** Pre-filled template for customer communication */
  customerCommunicationTemplate?: string;
  /** Priority level */
  priority: 'low' | 'normal' | 'high' | 'urgent';
  /** Current status */
  status: QCHandoverStatus;
  /** QC staff who created the handover */
  createdBy: string;
  /** Name of QC staff */
  createdByName: string;
  /** When handover was created */
  createdAt: Timestamp;
  /** Customer service staff who acknowledged */
  acknowledgedBy?: string;
  /** Name of CS staff who acknowledged */
  acknowledgedByName?: string;
  /** When acknowledged */
  acknowledgedAt?: Timestamp;
  /** When customer was notified */
  customerNotifiedAt?: Timestamp;
  /** Customer response/decision */
  customerResponse?: string;
  /** Resolution notes */
  resolutionNotes?: string;
  /** When resolved */
  resolvedAt?: Timestamp;
  /** Staff who resolved */
  resolvedBy?: string;
  /** Last update timestamp */
  updatedAt?: Timestamp;
  /** Related defect notification ID (if linked to FR-003) */
  defectNotificationId?: string;
  /** Related redo item ID (if linked to FR-002) */
  redoItemId?: string;
  /** Denormalized customer info for quick display */
  customerName?: string;
  customerPhone?: string;
}

/**
 * QC Handover metrics for dashboard
 */
export interface QCHandoverMetrics {
  /** Total handovers in period */
  totalHandovers: number;
  /** Pending handovers (not yet acknowledged) */
  pendingCount: number;
  /** In progress count */
  inProgressCount: number;
  /** Resolved count */
  resolvedCount: number;
  /** Breakdown by handover type */
  byType: Record<QCHandoverType, number>;
  /** Breakdown by branch */
  byBranch: Record<string, number>;
  /** Average time to acknowledge (hours) */
  avgTimeToAcknowledge: number;
  /** Average time to resolve (hours) */
  avgTimeToResolve: number;
  /** Breakdown by status */
  byStatus: Record<QCHandoverStatus, number>;
}

// ============================================
// PERFORMANCE METRICS TYPES
// ============================================

/**
 * Time period types for performance tracking
 */
export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

/**
 * Staff metrics for a specific time period
 */
export interface StaffMetrics {
  /** Customer satisfaction score (0-100%) */
  customerSatisfaction: number;
  /** Accuracy score (0-100%) */
  accuracy: number;
  /** Efficiency score (0-100%) */
  efficiency: number;
  /** Overall combined score (0-100%) */
  overallScore: number;
  /** When metrics were last calculated */
  updatedAt: Date;
}

/**
 * Quality check data for garment accuracy tracking
 */
export interface QualityCheckData {
  /** Whether garment passed QC */
  passed: boolean;
  /** Staff UID who performed QC */
  checkedBy: string;
  /** When QC was performed */
  checkedAt: Timestamp;
  /** Issues found during QC */
  issues?: string[];
  /** Whether rework is required */
  reworkRequired: boolean;
  /** Staff UID who completed rework (if any) */
  reworkCompletedBy?: string;
  /** When rework was completed */
  reworkCompletedAt?: Timestamp;
}

/**
 * Damage claim status types
 */
export type DamageClaimStatus = 'pending' | 'verified' | 'rejected' | 'resolved';

/**
 * Damage claim structure for order accuracy tracking
 */
export interface DamageClaim {
  /** Unique claim identifier */
  claimId: string;
  /** Reference to damaged garment */
  garmentId: string;
  /** Description of damage */
  description: string;
  /** Photo evidence URLs */
  photos: string[];
  /** Current claim status */
  status: DamageClaimStatus;
  /** Staff who last handled the item before damage */
  responsibleStaffId?: string;
  /** Manager who verified the claim */
  verifiedBy?: string;
  /** When claim was verified */
  verifiedAt?: Timestamp;
  /** How the claim was resolved */
  resolution?: string;
  /** When claim was created */
  createdAt: Timestamp;
  /** Customer who filed the claim */
  filedBy: string;
}

/**
 * Processing time benchmarks (configurable per branch)
 * Collection: settings/processingBenchmarks
 */
export interface ProcessingBenchmarks {
  /** Benchmark ID */
  benchmarkId: string;
  /** Branch this applies to (or 'default' for global) */
  branchId: string;
  /** Time benchmarks in minutes per garment */
  times: {
    inspection: number;
    washing: number;
    drying: number;
    ironing: number;
    quality_check: number;
    packaging: number;
  };
  /** Batch sizes for batch operations */
  batchSizes: {
    washing: number;
    drying: number;
  };
  /** Target garments per hour per staff */
  targetGarmentsPerHour: number;
  /** Target orders per day per staff */
  targetOrdersPerDay: number;
  /** When benchmarks were last updated */
  updatedAt: Timestamp;
  /** Who updated the benchmarks */
  updatedBy: string;
}

// ============================================
// GM DASHBOARD TYPES
// ============================================

/**
 * Equipment status types
 */
export type EquipmentStatus = 'running' | 'idle' | 'maintenance' | 'offline';

/**
 * Equipment type categories
 */
export type EquipmentType = 'washer' | 'dryer' | 'press' | 'steamer' | 'other';

/**
 * Equipment document structure
 * Collection: equipment
 *
 * Tracks laundry equipment status across branches for
 * operational monitoring and maintenance scheduling.
 */
export interface Equipment {
  /** Unique equipment identifier */
  equipmentId: string;
  /** Reference to branch */
  branchId: string;
  /** Equipment name (e.g., "Washer 1", "Industrial Press") */
  name: string;
  /** Equipment type */
  type: EquipmentType;
  /** Current operational status */
  status: EquipmentStatus;
  /** Model/make information */
  model?: string;
  /** Serial number */
  serialNumber?: string;
  /** Last maintenance date */
  lastMaintenanceAt?: Timestamp;
  /** Next scheduled maintenance */
  nextMaintenanceAt?: Timestamp;
  /** Maintenance notes */
  maintenanceNotes?: string;
  /** Whether equipment is active/in service */
  active: boolean;
  /** Equipment installation/registration date */
  createdAt: Timestamp;
  /** Last status update timestamp */
  updatedAt: Timestamp;
  /** UID of user who last updated status */
  updatedBy?: string;
}

/**
 * Issue priority levels
 */
export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Issue status types
 */
export type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

/**
 * Issue category types
 */
export type IssueCategory =
  | 'equipment'
  | 'customer_complaint'
  | 'staff'
  | 'inventory'
  | 'order'
  | 'delivery'
  | 'payment'
  | 'other';

/**
 * Issue document structure
 * Collection: issues
 *
 * Tracks operational issues, customer complaints, and problems
 * requiring management attention.
 */
export interface Issue {
  /** Unique issue identifier */
  issueId: string;
  /** Reference to branch */
  branchId: string;
  /** Issue title/summary */
  title: string;
  /** Detailed description */
  description: string;
  /** Issue category */
  category: IssueCategory;
  /** Priority level */
  priority: IssuePriority;
  /** Current status */
  status: IssueStatus;
  /** Related order ID (if applicable) */
  orderId?: string;
  /** Related customer ID (if applicable) */
  customerId?: string;
  /** Related equipment ID (if applicable) */
  equipmentId?: string;
  /** UID of user who reported the issue */
  reportedBy: string;
  /** Reporter name (denormalized) */
  reportedByName: string;
  /** UID of user assigned to resolve */
  assignedTo?: string;
  /** Assigned user name (denormalized) */
  assignedToName?: string;
  /** Resolution notes */
  resolution?: string;
  /** Photo evidence URLs */
  photos?: string[];
  /** When issue was created */
  createdAt: Timestamp;
  /** When issue was last updated */
  updatedAt: Timestamp;
  /** When issue was resolved */
  resolvedAt?: Timestamp;
  /** UID of user who resolved the issue */
  resolvedBy?: string;
}

/**
 * Performance history item for charts
 */
export interface PerformanceHistoryItem {
  /** Reference date for this data point */
  date: Date;
  /** Short label (e.g., "Mon", "W1", "Jan") */
  label: string;
  /** Full label (e.g., "Monday, Jan 6, 2025") */
  fullLabel: string;
  /** Number of orders processed */
  ordersProcessed: number;
  /** Number of garments processed */
  garmentsProcessed: number;
  /** Metrics for this period */
  metrics: StaffMetrics;
  /** Target orders for comparison */
  targetOrders: number;
}

/**
 * Dashboard metrics with all time periods
 */
export interface DashboardMetrics {
  /** Daily metrics */
  daily: StaffMetrics & { period: string };
  /** Weekly metrics */
  weekly: StaffMetrics & { period: string };
  /** Monthly metrics */
  monthly: StaffMetrics & { period: string };
  /** Quarterly metrics */
  quarterly: StaffMetrics & { period: string };
  /** Yearly metrics */
  yearly: StaffMetrics & { period: string };
  /** Staff rank within branch */
  rank: { rank: number; total: number };
  /** When dashboard data was last fetched */
  lastUpdated: Date;
}

// =============================================================================
// PHASE 3: PAYMENTS & AUTOMATION
// =============================================================================

// -----------------------------------------------------------------------------
// FR-001: Automated Quotation System
// -----------------------------------------------------------------------------

/**
 * Quotation status type
 */
export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';

/**
 * Individual item in a quotation
 */
export interface QuotationItem {
  /** Garment type (e.g., 'shirt', 'suit', 'dress') */
  garmentType: string;
  /** Number of items */
  quantity: number;
  /** Services requested (e.g., ['dry_clean', 'press']) */
  services: string[];
  /** Price per unit */
  unitPrice: number;
  /** Total price for this line (quantity * unitPrice) */
  totalPrice: number;
  /** Special handling instructions */
  specialInstructions?: string;
}

/**
 * Quotation document - Professional estimate that can be converted to order
 */
export interface Quotation {
  /** Unique quotation identifier (Format: QT-[BRANCH]-[YYYYMMDD]-[####]) */
  quotationId: string;
  /** Reference to customer */
  customerId: string;
  /** Customer name (denormalized) */
  customerName: string;
  /** Customer phone (denormalized) */
  customerPhone: string;
  /** Reference to branch */
  branchId: string;
  /** Line items in the quotation */
  items: QuotationItem[];
  /** Subtotal before delivery */
  subtotal: number;
  /** Delivery fee (if applicable) */
  deliveryFee: number;
  /** Discount amount (if any) */
  discountAmount: number;
  /** Discount reason */
  discountReason?: string;
  /** Total amount */
  totalAmount: number;
  /** Current status */
  status: QuotationStatus;
  /** When quotation expires */
  validUntil: Timestamp;
  /** Estimated completion date/time */
  estimatedCompletion: Timestamp;
  /** Additional notes */
  notes?: string;
  /** When quotation was sent to customer */
  sentAt?: Timestamp;
  /** How quotation was sent */
  sentVia?: 'whatsapp' | 'email' | 'sms';
  /** When customer accepted */
  acceptedAt?: Timestamp;
  /** When customer rejected */
  rejectedAt?: Timestamp;
  /** Rejection reason from customer */
  rejectionReason?: string;
  /** Order ID after conversion */
  convertedOrderId?: string;
  /** When converted to order */
  convertedAt?: Timestamp;
  /** UID of staff who created */
  createdBy: string;
  /** Creator name (denormalized) */
  createdByName: string;
  /** When created */
  createdAt: Timestamp;
  /** When last updated */
  updatedAt: Timestamp;
}

// -----------------------------------------------------------------------------
// FR-009: Driver Payment Processing (M-Pesa/PDQ)
// -----------------------------------------------------------------------------

/**
 * Commission calculation type
 */
export type CommissionType = 'per_delivery' | 'percentage' | 'tiered';

/**
 * Payout status
 */
export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * Payout method
 */
export type PayoutMethod = 'mpesa' | 'bank_transfer' | 'cash';

/**
 * Commission tier for tiered commission structures
 */
export interface CommissionTier {
  /** Minimum deliveries for this tier */
  minDeliveries: number;
  /** Maximum deliveries for this tier (inclusive) */
  maxDeliveries: number;
  /** Rate per delivery in this tier */
  ratePerDelivery: number;
}

/**
 * Commission rule configuration for a branch
 */
export interface CommissionRule {
  /** Unique rule identifier */
  ruleId: string;
  /** Reference to branch (or 'ALL' for system-wide) */
  branchId: string;
  /** Rule name for display */
  name: string;
  /** How commission is calculated */
  commissionType: CommissionType;
  /** Base amount (per delivery rate, percentage, or base for tiered) */
  baseAmount: number;
  /** Tiers for tiered commission type */
  tiers?: CommissionTier[];
  /** Number of deliveries needed for bonus */
  bonusThreshold?: number;
  /** Bonus amount when threshold reached */
  bonusAmount?: number;
  /** Whether rule is active */
  active: boolean;
  /** When rule was created */
  createdAt: Timestamp;
  /** When rule was last updated */
  updatedAt: Timestamp;
}

/**
 * Driver payout record
 */
export interface DriverPayout {
  /** Unique payout identifier */
  payoutId: string;
  /** Reference to driver (user) */
  driverId: string;
  /** Driver name (denormalized) */
  driverName: string;
  /** Driver phone for M-Pesa */
  driverPhone: string;
  /** Reference to branch */
  branchId: string;
  /** Total payout amount */
  amount: number;
  /** Payment method used */
  paymentMethod: PayoutMethod;
  /** Current status */
  status: PayoutStatus;
  /** Delivery IDs included in this payout */
  deliveryIds: string[];
  /** Number of deliveries */
  deliveryCount: number;
  /** Commission rate/rule used */
  commissionRuleId: string;
  /** Commission rate at time of payout */
  commissionRate: number;
  /** Base commission amount */
  baseCommission: number;
  /** Bonus amount (if any) */
  bonusAmount: number;
  /** Deductions (if any) */
  deductions: number;
  /** Deduction reasons */
  deductionReasons?: string[];
  /** Settlement period start */
  periodStart: Timestamp;
  /** Settlement period end */
  periodEnd: Timestamp;
  /** M-Pesa transaction reference */
  mpesaRef?: string;
  /** Bank transfer reference */
  bankRef?: string;
  /** Failure reason if failed */
  failureReason?: string;
  /** UID of staff who processed */
  processedBy?: string;
  /** When payout was processed */
  processedAt?: Timestamp;
  /** When record was created */
  createdAt: Timestamp;
  /** When record was last updated */
  updatedAt: Timestamp;
}

// -----------------------------------------------------------------------------
// FR-013: Free Delivery Automation
// -----------------------------------------------------------------------------

/**
 * Delivery fee calculation type
 */
export type DeliveryFeeType = 'free' | 'fixed' | 'per_km' | 'percentage';

/**
 * Delivery fee rule for automatic fee calculation
 */
export interface DeliveryFeeRule {
  /** Unique rule identifier */
  ruleId: string;
  /** Reference to branch (or 'ALL' for system-wide) */
  branchId: string;
  /** Rule name for display */
  name: string;
  /** Priority (higher = checked first) */
  priority: number;
  /** Conditions for this rule to apply */
  conditions: {
    /** Minimum order amount for rule to apply */
    minOrderAmount?: number;
    /** Customer segments this applies to */
    customerSegments?: CustomerSegment[];
    /** Maximum distance in km for rule to apply */
    maxDistanceKm?: number;
    /** Specific days of week (0=Sunday, 6=Saturday) */
    daysOfWeek?: number[];
    /** Start time (HH:mm format) */
    startTime?: string;
    /** End time (HH:mm format) */
    endTime?: string;
  };
  /** How fee is calculated */
  feeCalculation: {
    /** Fee type */
    type: DeliveryFeeType;
    /** Value (0 for free, amount for fixed, rate for per_km, % for percentage) */
    value: number;
    /** Minimum fee (for per_km/percentage) */
    minFee?: number;
    /** Maximum fee cap */
    maxFee?: number;
  };
  /** Whether rule is active */
  active: boolean;
  /** When rule becomes effective */
  validFrom: Timestamp;
  /** When rule expires (optional) */
  validUntil?: Timestamp;
  /** When rule was created */
  createdAt: Timestamp;
  /** When rule was last updated */
  updatedAt: Timestamp;
}

// =============================================================================
// PHASE 4: LOYALTY & INTEGRATION
// =============================================================================

// -----------------------------------------------------------------------------
// FR-011: Loyalty Points System
// -----------------------------------------------------------------------------

/**
 * Loyalty tier names
 */
export type LoyaltyTierName = 'bronze' | 'silver' | 'gold' | 'platinum';

/**
 * Loyalty transaction type
 */
export type LoyaltyTransactionType = 'earned' | 'redeemed' | 'expired' | 'bonus' | 'adjusted';

/**
 * Redemption status
 */
export type RedemptionStatus = 'pending' | 'applied' | 'cancelled' | 'expired';

/**
 * Reward type for redemption
 */
export type RewardType = 'discount' | 'free_service' | 'free_delivery' | 'percentage_off';

/**
 * Loyalty tier configuration
 */
export interface LoyaltyTier {
  /** Tier identifier */
  tierId: string;
  /** Tier name for display */
  name: LoyaltyTierName;
  /** Display name (e.g., "Bronze Member") */
  displayName: string;
  /** Minimum points to reach this tier */
  minPoints: number;
  /** Tier benefits */
  benefits: {
    /** Percentage discount on all orders */
    discountPercentage?: number;
    /** Free delivery */
    freeDelivery?: boolean;
    /** Priority processing */
    priorityProcessing?: boolean;
    /** Bonus points on birthday */
    birthdayBonus?: number;
    /** Points for referring new customer */
    referralBonus?: number;
    /** Points multiplier (e.g., 1.5x) */
    pointsMultiplier?: number;
    /** Free pickup */
    freePickup?: boolean;
  };
  /** Color for UI display */
  color: string;
  /** Icon name */
  icon?: string;
}

/**
 * Loyalty program configuration
 */
export interface LoyaltyProgram {
  /** Unique program identifier */
  programId: string;
  /** Reference to branch (or 'ALL' for system-wide) */
  branchId: string;
  /** Program name */
  name: string;
  /** Points earned per KES spent */
  pointsPerKES: number;
  /** Minimum points required to redeem */
  minPointsToRedeem: number;
  /** Points to KES conversion ratio (e.g., 100 points = 10 KES) */
  pointsToKESRatio: number;
  /** Number of years before points expire */
  pointsExpiryYears: number;
  /** Welcome bonus points for new members */
  welcomeBonus: number;
  /** Points for submitting a review */
  reviewBonus: number;
  /** Tier configurations */
  tiers: LoyaltyTier[];
  /** Whether program is active */
  active: boolean;
  /** When program was created */
  createdAt: Timestamp;
  /** When program was last updated */
  updatedAt: Timestamp;
}

/**
 * Customer's loyalty account
 */
export interface CustomerLoyalty {
  /** Unique loyalty account identifier */
  loyaltyId: string;
  /** Reference to customer */
  customerId: string;
  /** Reference to loyalty program */
  programId: string;
  /** Total points ever earned */
  totalPointsEarned: number;
  /** Total points ever redeemed */
  totalPointsRedeemed: number;
  /** Current available balance */
  currentBalance: number;
  /** Current tier ID */
  currentTierId: string;
  /** Current tier name */
  currentTierName: LoyaltyTierName;
  /** History of tier changes */
  tierHistory: {
    /** Tier ID achieved */
    tierId: string;
    /** Tier name */
    tierName: LoyaltyTierName;
    /** When tier was achieved */
    achievedAt: Timestamp;
  }[];
  /** Points expiring soon */
  pointsExpiringNext?: {
    /** Points amount expiring */
    points: number;
    /** When they expire */
    expiresAt: Timestamp;
  };
  /** Customer's birthday (for birthday bonus) */
  birthday?: string;
  /** Referral code for this customer */
  referralCode: string;
  /** Number of successful referrals */
  referralCount: number;
  /** When customer enrolled */
  enrolledAt: Timestamp;
  /** Last activity timestamp */
  lastActivityAt: Timestamp;
}

/**
 * Individual loyalty points transaction
 */
export interface LoyaltyTransaction {
  /** Unique transaction identifier */
  transactionId: string;
  /** Reference to customer */
  customerId: string;
  /** Reference to loyalty account */
  loyaltyId: string;
  /** Transaction type */
  type: LoyaltyTransactionType;
  /** Points amount (positive for earned/bonus, negative for redeemed/expired) */
  points: number;
  /** Balance after this transaction */
  balanceAfter: number;
  /** Reason for transaction */
  reason: string;
  /** Detailed description */
  description?: string;
  /** Reference to order (if applicable) */
  orderId?: string;
  /** Reference to redemption (if applicable) */
  redemptionId?: string;
  /** Referral code used (for referral bonus) */
  referralCode?: string;
  /** When points expire (for earned points) */
  expiresAt?: Timestamp;
  /** When transaction occurred */
  createdAt: Timestamp;
}

/**
 * Points redemption record
 */
export interface LoyaltyRedemption {
  /** Unique redemption identifier */
  redemptionId: string;
  /** Reference to customer */
  customerId: string;
  /** Reference to loyalty account */
  loyaltyId: string;
  /** Points used */
  pointsUsed: number;
  /** Type of reward */
  rewardType: RewardType;
  /** Reward value (discount amount, percentage, or service value) */
  rewardValue: number;
  /** Description of reward */
  rewardDescription: string;
  /** Current status */
  status: RedemptionStatus;
  /** Order this was applied to */
  appliedToOrderId?: string;
  /** When applied to order */
  appliedAt?: Timestamp;
  /** When redemption expires if not used */
  expiresAt: Timestamp;
  /** When created */
  createdAt: Timestamp;
  /** When last updated */
  updatedAt: Timestamp;
}

// -----------------------------------------------------------------------------
// FR-010: Home Cleaning System Access (SSO)
// -----------------------------------------------------------------------------

/**
 * External system names for SSO integration
 */
export type ExternalSystem = 'home_cleaning' | 'laundry_app' | 'corporate_portal';

/**
 * External system link status
 */
export type ExternalLinkStatus = 'active' | 'revoked' | 'expired';

/**
 * External system account link
 */
export interface ExternalSystemLink {
  /** Unique link identifier */
  linkId: string;
  /** Reference to Lorenzo user */
  userId: string;
  /** User name (denormalized) */
  userName: string;
  /** External system name */
  externalSystem: ExternalSystem;
  /** User ID in the external system */
  externalUserId: string;
  /** External username/email (if different) */
  externalUsername?: string;
  /** Current status */
  status: ExternalLinkStatus;
  /** Permissions granted to external system */
  permissions?: string[];
  /** When link was created */
  linkedAt: Timestamp;
  /** Last time accounts were synced */
  lastSyncAt?: Timestamp;
  /** Last time user accessed external system via SSO */
  lastAccessAt?: Timestamp;
  /** When link was revoked (if applicable) */
  revokedAt?: Timestamp;
  /** Who revoked the link */
  revokedBy?: string;
  /** Revocation reason */
  revocationReason?: string;
}

/**
 * SSO token for external system access
 */
export interface SSOToken {
  /** Token identifier */
  tokenId: string;
  /** Reference to user */
  userId: string;
  /** User email */
  email: string;
  /** User display name */
  name: string;
  /** User role in Lorenzo */
  role: UserRole;
  /** User's branch */
  branchId: string;
  /** Target external system */
  targetSystem: ExternalSystem;
  /** When token was issued */
  issuedAt: number;
  /** When token expires */
  expiresAt: number;
  /** Token signature */
  signature: string;
}

// -----------------------------------------------------------------------------
// Extended User Interface for External Access
// -----------------------------------------------------------------------------

/**
 * External access configuration for users
 */
export interface UserExternalAccess {
  /** Whether home cleaning system access is enabled */
  homeCleaningEnabled?: boolean;
  /** User ID in home cleaning system */
  homeCleaningUserId?: string;
  /** Whether corporate portal access is enabled */
  corporatePortalEnabled?: boolean;
  /** User ID in corporate portal */
  corporatePortalUserId?: string;
  /** Last time user accessed any external system */
  lastExternalAccessAt?: Timestamp;
}

// ============================================
// COMPANY SETTINGS (FR-074)
// ============================================

/**
 * Company-wide settings and default values
 * Collection: system_config/company_settings
 *
 * These are default values used when branch-specific configuration is missing.
 * Director/GM/Admin can modify these settings.
 */
export interface CompanySettings {
  /** Settings document ID (always 'company_settings') */
  settingsId: string;

  // ===== Default Performance Targets =====
  /** Default customer retention target percentage */
  defaultRetentionTarget: number;
  /** Default premium service revenue target percentage */
  defaultPremiumTarget: number;
  /** Default growth target percentage */
  defaultGrowthTarget: number;
  /** Default turnaround time in hours */
  defaultTurnaroundHours: number;

  // ===== Default Inventory Settings =====
  /** Default low stock threshold multiplier */
  defaultLowStockThreshold: number;

  // ===== Payment Settings =====
  /** Minimum M-Pesa payment amount in KES */
  mpesaMinAmount: number;
  /** Maximum M-Pesa payment amount in KES */
  mpesaMaxAmount: number;
  /** Minimum card payment amount in KES */
  cardMinAmount: number;

  // ===== Financial Settings =====
  /** Operating cost ratio for profit calculations (e.g., 0.35 = 35%) */
  operatingCostRatio: number;

  // ===== Delivery Settings =====
  /** Default delivery fee in KES */
  defaultDeliveryFee: number;
  /** Default distance assumption in km when actual distance unavailable */
  defaultDistanceKm: number;

  // ===== Audit =====
  /** User ID who last updated settings */
  lastUpdatedBy: string;
  /** When settings were last updated */
  lastUpdatedAt: Timestamp;
}

/**
 * Branch statistics snapshot
 * Collection: branchStats/{branchId}
 *
 * Pre-computed branch metrics updated by Cloud Functions for fast dashboard queries.
 */
export interface BranchStats {
  /** Branch identifier */
  branchId: string;
  /** Date of these stats (YYYY-MM-DD format) */
  date: string;
  /** Number of orders on this date */
  dailyOrders: number;
  /** Revenue on this date in KES */
  dailyRevenue: number;
  /** On-time completion rate percentage */
  completionRate: number;
  /** Average turnaround time in hours */
  avgTurnaround: number;
  /** Active staff count on this date */
  activeStaffCount?: number;
  /** Equipment utilization percentage */
  equipmentUtilization?: number;
  /** Customer satisfaction average (1-5) */
  customerSatisfaction?: number;
  /** When stats were last computed */
  lastUpdated: Timestamp;
}

// ============================================
// V2.0 NEW COLLECTIONS
// ============================================

/**
 * Reminder type (V2.0)
 */
export type ReminderType = '7_days' | '14_days' | '30_days' | 'monthly' | 'disposal_eligible';

/**
 * Reminder status (V2.0)
 */
export type ReminderStatus = 'pending' | 'sent' | 'failed' | 'cancelled';

/**
 * Reminder document structure (V2.0)
 * Collection: reminders
 *
 * Automated reminders for uncollected orders
 */
export interface Reminder {
  /** Unique reminder identifier */
  reminderId: string;
  /** Reference to order */
  orderId: string;
  /** Reference to customer */
  customerId: string;
  /** Customer phone (denormalized) */
  customerPhone?: string;
  /** Customer name (denormalized) */
  customerName?: string;
  /** Type of reminder */
  reminderType: ReminderType;
  /** When reminder should be sent */
  scheduledDate: Timestamp;
  /** When reminder was actually sent */
  sentDate?: Timestamp;
  /** Current status */
  status: ReminderStatus;
  /** Message content sent to customer */
  messageContent?: string;
  /** Channel used (whatsapp, sms, email) */
  channel?: NotificationChannel;
  /** Error message if failed */
  errorMessage?: string;
  /** Retry count */
  retryCount?: number;
  /** Creation timestamp */
  createdAt: Timestamp;
}

/**
 * Voucher discount type (V2.0)
 */
export type VoucherDiscountType = 'percentage' | 'fixed';

/**
 * Voucher approval status (V2.0)
 */
export type VoucherApprovalStatus = 'pending' | 'approved' | 'rejected';

/**
 * Voucher document structure (V2.0)
 * Collection: vouchers
 *
 * Promotional voucher codes with approval workflow
 */
export interface Voucher {
  /** Unique voucher identifier */
  voucherId: string;
  /** Unique voucher code */
  voucherCode: string;
  /** QR code data for voucher */
  qrCodeData?: string;
  /** Type of discount */
  discountType: VoucherDiscountType;
  /** Discount value (percentage 0-100 or fixed amount in KES) */
  discountValue: number;
  /** Minimum order amount required (optional) */
  minOrderAmount?: number;
  /** User ID who created the voucher */
  createdBy: string;
  /** Name of creator (denormalized) */
  createdByName?: string;
  /** User ID who approved/rejected */
  approvedBy?: string;
  /** Name of approver (denormalized) */
  approvedByName?: string;
  /** Current approval status */
  approvalStatus: VoucherApprovalStatus;
  /** Approval/rejection timestamp */
  approvalDate?: Timestamp;
  /** Rejection reason (if rejected) */
  rejectionReason?: string;
  /** Voucher expiry date */
  expiryDate: Timestamp;
  /** Whether voucher has been used */
  isUsed: boolean;
  /** Customer ID who used the voucher */
  usedByCustomer?: string;
  /** Name of customer who used it (denormalized) */
  usedByCustomerName?: string;
  /** Timestamp when used */
  usedDate?: Timestamp;
  /** Order ID where voucher was applied */
  usedOnOrder?: string;
  /** Creation timestamp */
  createdAt: Timestamp;
  /** Branch ID where voucher was created */
  branchId?: string;
  /** Purpose/reason for creating voucher */
  purpose?: string;
}

/**
 * Delivery note type (V2.0)
 */
export type DeliveryNoteType = 'tailor_transfer' | 'inter_store_transfer';

/**
 * Delivery note status (V2.0)
 */
export type DeliveryNoteStatus = 'sent' | 'in_transit' | 'received' | 'returned';

/**
 * Delivery note document structure (V2.0)
 * Collection: deliveryNotes
 *
 * Notes for tailor and inter-store transfers
 */
export interface DeliveryNote {
  /** Unique note identifier */
  noteId: string;
  /** Auto-generated note number */
  noteNumber: string;
  /** Type of delivery note */
  noteType: DeliveryNoteType;
  /** Origin location (branch ID or tailor name) */
  fromLocation: string;
  /** Destination location (branch ID or tailor name) */
  toLocation: string;
  /** Array of order IDs included */
  orderIds: string[];
  /** Date items were sent */
  dateSent: Timestamp;
  /** Expected return date */
  expectedReturnDate?: Timestamp;
  /** Actual return date */
  actualReturnDate?: Timestamp;
  /** User ID who authorized the transfer */
  authorizedBy: string;
  /** Name of authorizer (denormalized) */
  authorizedByName?: string;
  /** Person who received items */
  receivedBy?: string;
  /** Current status */
  status: DeliveryNoteStatus;
  /** Description of items */
  itemsDescription?: string;
  /** Total number of garments */
  garmentCount?: number;
  /** Notes/instructions */
  notes?: string;
  /** Branch ID where note was created */
  branchId?: string;
  /** Creation timestamp */
  createdAt: Timestamp;
  /** Last update timestamp */
  updatedAt?: Timestamp;
}

/**
 * Target type (V2.0)
 */
export type TargetType = 'daily' | 'weekly' | 'monthly';

/**
 * Target document structure (V2.0)
 * Collection: targets
 *
 * Revenue and performance targets for branches and staff
 */
export interface Target {
  /** Unique target identifier */
  targetId: string;
  /** Type of target period */
  targetType: TargetType;
  /** Branch ID (optional for individual targets) */
  branchId?: string;
  /** Branch name (denormalized) */
  branchName?: string;
  /** User ID for individual targets */
  userId?: string;
  /** User name for individual targets (denormalized) */
  userName?: string;
  /** Target amount in KES */
  targetAmount: number;
  /** Target period start */
  targetPeriodStart: Timestamp;
  /** Target period end */
  targetPeriodEnd: Timestamp;
  /** Actual amount achieved */
  actualAmount: number;
  /** Achievement percentage */
  achievementPercentage: number;
  /** User ID who set the target */
  setBy: string;
  /** Name of user who set target (denormalized) */
  setByName?: string;
  /** Creation timestamp */
  createdAt: Timestamp;
  /** Last update timestamp */
  updatedAt?: Timestamp;
}

/**
 * Staff performance document structure (V2.0)
 * Collection: staffPerformance
 *
 * Performance metrics and appraisals for staff
 */
export interface StaffPerformance {
  /** Unique performance record identifier */
  performanceId: string;
  /** User ID of staff member */
  userId: string;
  /** Staff name (denormalized) */
  userName?: string;
  /** Staff role (denormalized) */
  userRole?: UserRole;
  /** Branch ID where staff works */
  branchId?: string;
  /** Evaluation period start */
  evaluationPeriodStart: Timestamp;
  /** Evaluation period end */
  evaluationPeriodEnd: Timestamp;
  /** Number of orders booked */
  ordersBooked: number;
  /** Total value of orders booked in KES */
  orderValue?: number;
  /** Number of rewash orders */
  rewashCount: number;
  /** Rewash rate percentage */
  rewashRate?: number;
  /** Number of complaints received */
  complaintsCount: number;
  /** Total discounts issued in KES */
  discountsIssued: number;
  /** Calculated performance score */
  performanceScore: number;
  /** User ID of evaluator */
  evaluatedBy?: string;
  /** Evaluator name (denormalized) */
  evaluatedByName?: string;
  /** Evaluation date */
  evaluationDate?: Timestamp;
  /** Performance notes/comments */
  notes?: string;
  /** Creation timestamp */
  createdAt: Timestamp;
}

/**
 * Cash out transaction type (V2.0)
 */
export type CashOutType = 'uncollected_garment' | 'discount' | 'compensation' | 'order_cancellation' | 'refund';

/**
 * Cash out approval status (V2.0)
 */
export type CashOutApprovalStatus = 'pending' | 'approved' | 'rejected';

/**
 * Cash out transaction document structure (V2.0)
 * Collection: cashOutTransactions
 *
 * Tracks all cash-out requests requiring approval
 */
export interface CashOutTransaction {
  /** Unique transaction identifier */
  transactionId: string;
  /** Type of cash out */
  transactionType: CashOutType;
  /** Related order ID (optional) */
  orderId?: string;
  /** Order number (denormalized) */
  orderNumber?: string;
  /** Customer ID (optional) */
  customerId?: string;
  /** Customer name (denormalized) */
  customerName?: string;
  /** Amount in KES */
  amount: number;
  /** Reason for cash out */
  reason: string;
  /** User ID who requested */
  requestedBy: string;
  /** Requester name (denormalized) */
  requestedByName?: string;
  /** User ID who approved/rejected */
  approvedBy?: string;
  /** Approver name (denormalized) */
  approvedByName?: string;
  /** Current approval status */
  approvalStatus: CashOutApprovalStatus;
  /** Approval/rejection timestamp */
  approvalDate?: Timestamp;
  /** Rejection reason (if rejected) */
  rejectionReason?: string;
  /** Branch ID where transaction occurred */
  branchId?: string;
  /** Creation timestamp */
  createdAt: Timestamp;
}

/**
 * System setting document structure (V2.0)
 * Collection: systemSettings
 *
 * Configurable system settings
 */
export interface SystemSetting {
  /** Setting key (document ID) */
  settingKey: string;
  /** Setting value (can be any type) */
  settingValue: unknown;
  /** Description of the setting */
  description: string;
  /** User ID who last updated */
  updatedBy?: string;
  /** Last update timestamp */
  updatedAt: Timestamp;
}

/**
 * Default system settings (V2.0)
 */
export const DEFAULT_SYSTEM_SETTINGS: Record<string, { value: unknown; description: string }> = {
  inactivity_timeout: {
    value: 600,
    description: 'Inactivity timeout in seconds (default: 10 minutes)',
  },
  express_multiplier: {
    value: 1.5,
    description: 'Express service price multiplier',
  },
  reminder_intervals: {
    value: { '7days': true, '14days': true, '30days': true, monthly: true },
    description: 'Reminder schedule configuration',
  },
  disposal_threshold_days: {
    value: 90,
    description: 'Days before order eligible for disposal',
  },
  delivery_classification: {
    value: {
      small: { maxGarments: 5, maxWeight: 10, maxValue: 5000 },
      bulk: { minGarments: 6 },
    },
    description: 'Delivery classification rules',
  },
  rewash_window_hours: {
    value: 24,
    description: 'Hours after delivery when rewash is eligible',
  },
};
