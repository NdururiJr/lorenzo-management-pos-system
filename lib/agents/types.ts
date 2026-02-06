/**
 * Multi-Agent AI System Type Definitions
 *
 * Defines types for agent communication, requests, responses, and shared interfaces
 * used across all agents in the system.
 *
 * @module lib/agents/types
 */

/**
 * Available specialist agents in the system
 */
export type AgentName =
  | 'orchestrator-agent'
  | 'order-agent'
  | 'customer-agent'
  | 'booking-agent'
  | 'pricing-agent'
  | 'support-agent'
  | 'analytics-agent'
  | 'onboarding-agent'
  | 'logistics-agent';

/**
 * Source interfaces that can call agents
 */
export type AgentSource =
  | 'website-chatbot'
  | 'staff-assistant'
  | 'customer-portal'
  | 'system';

/**
 * User types for access control
 */
export type UserType = 'guest' | 'customer' | 'staff';

/**
 * Staff roles for role-based access control
 */
export type StaffRole =
  | 'admin'
  | 'director'
  | 'general_manager'
  | 'store_manager'
  | 'workstation_manager'
  | 'workstation_staff'
  | 'satellite_staff'
  | 'front_desk'
  | 'driver';

/**
 * Authentication context passed with agent requests
 */
export interface AgentAuth {
  /** User type (guest, customer, staff) */
  userType: UserType;
  /** Customer ID if authenticated customer */
  customerId?: string;
  /** Staff UID if authenticated staff */
  staffId?: string;
  /** Staff role if authenticated staff */
  staffRole?: StaffRole;
  /** Branch ID if staff member */
  branchId?: string;
  /** Additional branches for multi-branch access */
  branchAccess?: string[];
  /** Session ID for tracking */
  sessionId: string;
}

/**
 * Request sent to an agent
 */
export interface AgentRequest {
  /** Unique request identifier */
  requestId: string;
  /** Source of the request */
  fromAgent: AgentSource;
  /** Target agent to handle the request */
  toAgent: AgentName;
  /** Action to perform */
  action: string;
  /** Parameters for the action */
  params: Record<string, unknown>;
  /** Authentication context */
  auth: AgentAuth;
  /** Request timestamp */
  timestamp: string;
}

/**
 * Response status types
 */
export type AgentResponseStatus = 'success' | 'error' | 'unauthorized' | 'not_found';

/**
 * Response from an agent
 */
export interface AgentResponse {
  /** Request ID this is responding to */
  requestId: string;
  /** Agent that processed the request */
  fromAgent: AgentName;
  /** Response status */
  status: AgentResponseStatus;
  /** Response data if successful */
  data?: unknown;
  /** Error message if failed */
  error?: string;
  /** Human-readable message */
  message?: string;
  /** Response timestamp */
  timestamp: string;
}

/**
 * Chat message structure
 */
export interface ChatMessage {
  /** Unique message ID */
  id: string;
  /** Role: user, assistant, or system */
  role: 'user' | 'assistant' | 'system';
  /** Message content */
  content: string;
  /** Timestamp when message was sent */
  timestamp: Date;
  /** Agent that generated this response (if assistant) */
  agentSource?: AgentName;
  /** Metadata for UI rendering */
  metadata?: {
    /** Suggested quick actions */
    quickActions?: string[];
    /** Whether this requires login */
    requiresLogin?: boolean;
    /** Data cards to display */
    dataCards?: Array<{
      type: 'order' | 'customer' | 'pricing' | 'booking';
      data: Record<string, unknown>;
    }>;
  };
}

/**
 * Agent interaction log entry
 */
export interface AgentInteraction {
  /** Request ID */
  requestId: string;
  /** Agent that handled the request */
  agent: AgentName;
  /** Action performed */
  action: string;
  /** Whether it was successful */
  success: boolean;
  /** Timestamp of interaction */
  timestamp: Date;
  /** Response time in milliseconds */
  responseTime?: number;
}

/**
 * Chat conversation structure for Firestore
 */
export interface ChatConversation {
  /** Unique conversation ID */
  id: string;
  /** Customer ID (if authenticated) */
  customerId?: string;
  /** Staff ID (if staff assistant) */
  staffId?: string;
  /** User type */
  userType: UserType;
  /** Conversation title */
  title: string;
  /** Messages in the conversation */
  messages: ChatMessage[];
  /** Log of agent interactions */
  agentInteractions: AgentInteraction[];
  /** Conversation status */
  status: 'active' | 'closed' | 'escalated';
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
  /** Interface source */
  source: AgentSource;
}

/**
 * Intent types for message classification
 */
export type Intent =
  // FAQ Intents
  | 'FAQ_SERVICES'
  | 'FAQ_PRICING'
  | 'FAQ_LOCATIONS'
  | 'FAQ_HOURS'
  | 'FAQ_CONTACT'
  // Order Intents
  | 'ORDER_TRACKING'
  | 'ORDER_HISTORY'
  | 'ORDER_DETAILS'
  | 'ORDER_STATUS'
  // Booking Intents
  | 'BOOKING_PICKUP'
  | 'BOOKING_DELIVERY'
  | 'BOOKING_SLOTS'
  | 'BOOKING_CANCEL'
  | 'BOOKING_STATUS'
  // Onboarding Intents
  | 'ONBOARDING_REGISTER'
  | 'ONBOARDING_VERIFY_PHONE'
  | 'ONBOARDING_VERIFY_EMAIL'
  | 'ONBOARDING_COMPLETE'
  | 'ONBOARDING_RESEND_OTP'
  // Support Intents
  | 'SUPPORT_REQUEST'
  | 'SUPPORT_COMPLAINT'
  | 'SUPPORT_ESCALATE'
  // Pricing Intents
  | 'PRICING_QUOTE'
  | 'PRICING_LIST'
  | 'PRICING_PROMOTIONS'
  // Customer Intents
  | 'CUSTOMER_PROFILE'
  | 'CUSTOMER_PREFERENCES'
  // Staff-Only Intents
  | 'STAFF_ANALYTICS'
  | 'STAFF_REPORTS'
  | 'STAFF_PERFORMANCE'
  // General
  | 'GENERAL_GREETING'
  | 'GENERAL_THANKS'
  | 'GENERAL_GOODBYE'
  | 'GENERAL_HELP'
  | 'GENERAL_UNKNOWN';

/**
 * Agent capability descriptor
 */
export interface AgentCapability {
  /** Action name */
  action: string;
  /** Description of what this action does */
  description: string;
  /** Required parameters */
  requiredParams: string[];
  /** Optional parameters */
  optionalParams?: string[];
  /** Whether this requires authentication */
  requiresAuth: boolean;
  /** User types that can access this (empty = all) */
  allowedUserTypes?: UserType[];
  /** Staff roles that can access this (if staff-only) */
  allowedStaffRoles?: StaffRole[];
}

/**
 * Agent definition interface
 */
export interface AgentDefinition {
  /** Agent name/identifier */
  name: AgentName;
  /** Human-readable description */
  description: string;
  /** System prompt for this agent */
  systemPrompt: string;
  /** List of capabilities */
  capabilities: AgentCapability[];
}

/**
 * Order data for agent responses
 */
export interface OrderSummary {
  orderId: string;
  status: string;
  statusLabel: string;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: string;
  garmentCount: number;
  estimatedCompletion: Date;
  createdAt: Date;
  customerName?: string;
  branchId?: string;
}

/**
 * Customer data for agent responses
 */
export interface CustomerSummary {
  customerId: string;
  name: string;
  phone: string;
  email?: string;
  orderCount: number;
  totalSpent: number;
  memberSince: Date;
}

/**
 * Pricing data for agent responses
 */
export interface PricingInfo {
  garmentType: string;
  services: {
    wash: number;
    dryClean: number;
    iron: number;
    starch: number;
  };
}

/**
 * Booking slot data
 */
export interface BookingSlot {
  date: string;
  time: string;
  available: boolean;
}

/**
 * Support ticket data
 */
export interface SupportTicket {
  ticketId: string;
  customerId: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
}

/**
 * Helper function to generate unique request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Helper function to check if user has staff access
 */
export function hasStaffAccess(auth: AgentAuth): boolean {
  return auth.userType === 'staff' && !!auth.staffId;
}

/**
 * Helper function to check if user has management access
 */
export function hasManagementAccess(auth: AgentAuth): boolean {
  if (!hasStaffAccess(auth)) return false;
  const managementRoles: StaffRole[] = ['admin', 'director', 'general_manager', 'store_manager'];
  return !!auth.staffRole && managementRoles.includes(auth.staffRole);
}

/**
 * Helper function to check if user can access branch data
 */
export function canAccessBranch(auth: AgentAuth, branchId: string): boolean {
  if (!hasStaffAccess(auth)) return false;
  if (auth.staffRole === 'admin' || auth.staffRole === 'director') return true;
  if (auth.branchId === branchId) return true;
  return auth.branchAccess?.includes(branchId) ?? false;
}

/**
 * Status labels for human-readable display
 */
export const ORDER_STATUS_LABELS: Record<string, string> = {
  received: 'Order Received',
  inspection: 'Under Inspection',
  queued: 'In Queue',
  washing: 'Being Washed',
  drying: 'Drying',
  ironing: 'Being Ironed',
  quality_check: 'Quality Check',
  packaging: 'Being Packaged',
  ready: 'Ready for Collection',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  collected: 'Collected',
};

/**
 * Lorenzo company information for FAQs
 */
export const LORENZO_INFO = {
  name: 'Lorenzo Dry Cleaners',
  established: 2013,
  branches: '21+',
  location: 'Nairobi and environs',
  phone: '0728 400 200',
  whatsapp: '+254728400200',
  email: 'hello@lorenzo.co.ke',
  website: 'https://lorenzo.co.ke',
  expressService: {
    duration: '2 hours',
    cost: 'FREE',
  },
  pickupDelivery: 'FREE',
  hours: {
    weekdays: '7:00 AM - 8:00 PM',
    saturday: '8:00 AM - 6:00 PM',
    sunday: '9:00 AM - 5:00 PM',
  },
};

/**
 * Verification request status
 */
export type VerificationStatus =
  | 'pending'
  | 'phone_verified'
  | 'email_verified'
  | 'completed'
  | 'expired';

/**
 * Verification request data
 */
export interface VerificationRequest {
  requestId: string;
  customerId: string;
  name: string;
  phone: string;
  email: string;
  whatsappOTP: string; // Hashed
  whatsappOTPExpiry: Date;
  whatsappVerified: boolean;
  emailToken: string;
  emailTokenExpiry: Date;
  emailVerified: boolean;
  status: VerificationStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Pickup request time slots
 */
export type TimeSlot = 'morning' | 'afternoon' | 'evening';

/**
 * Pickup request status
 */
export type PickupRequestStatus =
  | 'pending'
  | 'confirmed'
  | 'assigned'
  | 'in_transit'
  | 'picked_up'
  | 'at_facility'
  | 'converted'
  | 'cancelled';

/**
 * Pickup request data for agent responses
 */
export interface PickupRequestSummary {
  requestId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  serviceTypes: string[];
  itemDescription: string;
  expressService: boolean;
  pickupAddress: {
    label: string;
    address: string;
    coordinates?: { lat: number; lng: number };
  };
  preferredDate: Date;
  timeSlot: TimeSlot;
  status: PickupRequestStatus;
  assignedDriverId?: string;
  assignedDriverName?: string;
  confirmedTime?: Date;
  convertedOrderId?: string;
  source: 'website' | 'chatbot' | 'phone';
  createdAt: Date;
}

/**
 * Time slot display info
 */
export const TIME_SLOT_LABELS: Record<TimeSlot, { label: string; range: string }> = {
  morning: { label: 'Morning', range: '8:00 AM - 12:00 PM' },
  afternoon: { label: 'Afternoon', range: '12:00 PM - 4:00 PM' },
  evening: { label: 'Evening', range: '4:00 PM - 7:00 PM' },
};

/**
 * Pickup request status labels
 */
export const PICKUP_STATUS_LABELS: Record<PickupRequestStatus, string> = {
  pending: 'Pending Confirmation',
  confirmed: 'Confirmed',
  assigned: 'Driver Assigned',
  in_transit: 'Driver En Route',
  picked_up: 'Picked Up',
  at_facility: 'At Facility',
  converted: 'Order Created',
  cancelled: 'Cancelled',
};
