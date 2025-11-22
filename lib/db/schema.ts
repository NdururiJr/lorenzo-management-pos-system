/**
 * Database Schema Type Definitions
 *
 * This file contains TypeScript interfaces for all Firestore collections.
 * These types ensure type safety throughout the application.
 *
 * @module lib/db/schema
 */

import { Timestamp } from 'firebase/firestore';

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
  | 'customer';

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
  /** Customer's phone number (unique, Kenyan format) */
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
}

/**
 * Order status types
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
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'collected';

/**
 * Payment status types
 */
export type PaymentStatus = 'pending' | 'partial' | 'paid';

/**
 * Payment method types
 */
export type PaymentMethod = 'cash' | 'mpesa' | 'card' | 'credit';

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
export interface Garment {
  /** Unique garment identifier (format: ORDER-ID-G##) */
  garmentId: string;
  /** Garment type (e.g., "Shirt", "Dress", "Suit") */
  type: string;
  /** Garment color */
  color: string;
  /** Brand name (optional) */
  brand?: string;
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
}

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
  /** Amount paid so far (in KES) */
  paidAmount: number;
  /** Payment status */
  paymentStatus: PaymentStatus;
  /** Payment method used */
  paymentMethod?: PaymentMethod;
  /** Estimated completion timestamp */
  estimatedCompletion: Timestamp;
  /** Actual completion timestamp */
  actualCompletion?: Timestamp;
  /** Order creation timestamp */
  createdAt: Timestamp;
  /** UID of user who created the order */
  createdBy: string;

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

  // ===== Legacy/Deprecated Fields =====
  /** @deprecated Use deliveryAssignedTo instead */
  driverId?: string;
  /** Special instructions for the order */
  specialInstructions?: string;
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
export type DeliveryStatus = 'pending' | 'in_progress' | 'completed';

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
  /** Reference to order */
  orderId: string;
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
  /** Pesapal reference (for card/M-Pesa payments) */
  pesapalRef?: string;
  /** Transaction timestamp */
  timestamp: Timestamp;
  /** UID of user who processed the transaction */
  processedBy: string;
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
 */
export function isOrderReady(status: OrderStatus): boolean {
  return ['ready', 'out_for_delivery', 'delivered', 'collected'].includes(
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
    /** Express service surcharge (percentage) */
    express: number;
  };
  /** Whether this pricing is active */
  active: boolean;
  /** Creation timestamp */
  createdAt: Timestamp;
  /** Last update timestamp */
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
 * Receipt document structure
 * Collection: receipts
 */
export interface Receipt {
  /** Unique receipt identifier */
  receiptId: string;
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
