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
  /** Branch ID (for staff members) */
  branchId?: string;
  /** Account creation timestamp */
  createdAt: Timestamp;
  /** Whether the account is active */
  active: boolean;
}

/**
 * Address structure for customers
 */
export interface Address {
  /** Address label (e.g., "Home", "Office") */
  label: string;
  /** Full address string */
  address: string;
  /** Geographic coordinates */
  coordinates: {
    lat: number;
    lng: number;
  };
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
  /** Assigned driver UID (for deliveries) */
  driverId?: string;
  /** Delivery address */
  deliveryAddress?: string;
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
