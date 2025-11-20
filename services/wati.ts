/**
 * Wati.io WhatsApp Business API Integration
 *
 * This service handles all Wati.io API operations for automated WhatsApp notifications including:
 * - Message template sending
 * - Order status notifications
 * - Payment reminders
 * - Retry logic with exponential backoff
 * - Notification logging to Firestore
 *
 * @module services/wati
 */

import axios, { AxiosInstance } from 'axios';
import { adminDb } from '@/lib/firebase-admin';
import type { Notification, NotificationType, Order } from '@/types';
import { Timestamp } from 'firebase/firestore';

// Wati.io API configuration
const WATI_API_URL = process.env.WATI_API_URL || 'https://live-server.wati.io';
const WATI_API_KEY = process.env.WATI_API_KEY || '';

// Retry configuration
const MAX_RETRY_ATTEMPTS = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

/**
 * Create axios instance for Wati.io API
 */
function createWatiClient(): AxiosInstance {
  if (!WATI_API_KEY) {
    throw new Error(
      'WATI_API_KEY environment variable is not set. ' +
        'Please add your Wati.io API key to .env.local'
    );
  }

  return axios.create({
    baseURL: WATI_API_URL,
    headers: {
      'Authorization': `Bearer ${WATI_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    timeout: 30000, // 30 seconds
  });
}

/**
 * Format phone number for Wati.io
 * Converts Kenya format (+254...) to Wati.io format (254...)
 *
 * @param phone - Phone number in any format
 * @returns Formatted phone number without + prefix
 *
 * @example
 * formatPhoneNumber('+254712345678') // returns '254712345678'
 * formatPhoneNumber('0712345678')    // returns '254712345678'
 * formatPhoneNumber('254712345678')  // returns '254712345678'
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');

  // Remove + prefix if present
  cleaned = cleaned.replace(/^\+/, '');

  // If starts with 0, replace with 254
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.substring(1);
  }

  // Ensure it starts with 254
  if (!cleaned.startsWith('254')) {
    cleaned = '254' + cleaned;
  }

  return cleaned;
}

/**
 * Validate Kenya phone number format
 *
 * @param phone - Phone number to validate
 * @returns true if valid Kenya phone number
 */
export function isValidKenyanPhoneNumber(phone: string): boolean {
  const formatted = formatPhoneNumber(phone);

  // Kenya phone numbers: 254 + 9 digits (starting with 7 or 1)
  // Valid patterns: 2547XXXXXXXX or 2541XXXXXXXX
  return /^254[71]\d{8}$/.test(formatted);
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Log notification attempt to Firestore
 */
async function logNotification(
  notificationData: Omit<Notification, 'notificationId'>
): Promise<string> {
  try {
    const notificationRef = adminDb.collection('notifications').doc();
    const notificationId = notificationRef.id;

    await notificationRef.set({
      notificationId,
      ...notificationData,
    });

    return notificationId;
  } catch (error) {
    console.error('Failed to log notification to Firestore:', error);
    throw error;
  }
}

/**
 * Update notification status in Firestore
 */
async function updateNotificationStatus(
  notificationId: string,
  status: 'sent' | 'delivered' | 'failed',
  errorMessage?: string
): Promise<void> {
  try {
    const updateData: any = {
      status,
      updatedAt: Timestamp.now(),
    };

    if (errorMessage) {
      updateData.errorMessage = errorMessage;
    }

    await adminDb
      .collection('notifications')
      .doc(notificationId)
      .update(updateData);
  } catch (error) {
    console.error('Failed to update notification status:', error);
  }
}

/**
 * Send WhatsApp template message via Wati.io API
 * Includes retry logic with exponential backoff
 *
 * @param phone - Recipient phone number (Kenya format)
 * @param templateName - Name of approved Wati.io template
 * @param parameters - Template parameters as key-value pairs
 * @param orderId - Optional order ID for tracking
 * @returns Success status and message details
 */
export async function sendWhatsAppMessage(
  phone: string,
  templateName: string,
  parameters: Record<string, string>,
  orderId?: string
): Promise<{
  success: boolean;
  notificationId?: string;
  error?: string;
  attemptsMade?: number;
}> {
  // Validate phone number
  if (!isValidKenyanPhoneNumber(phone)) {
    console.error('Invalid Kenya phone number:', phone);
    return {
      success: false,
      error: `Invalid Kenya phone number: ${phone}`,
    };
  }

  const formattedPhone = formatPhoneNumber(phone);

  // Create message from template and parameters
  const message = createMessageFromTemplate(templateName, parameters);

  // Log notification attempt
  const notificationId = await logNotification({
    type: mapTemplateToNotificationType(templateName),
    recipientId: '', // Will be filled by caller if available
    recipientPhone: formattedPhone,
    message,
    status: 'pending',
    channel: 'whatsapp',
    timestamp: Timestamp.now(),
    orderId,
  });

  let lastError: string = '';
  let attemptsMade = 0;

  // Retry loop with exponential backoff
  for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
    attemptsMade = attempt;

    try {
      const client = createWatiClient();

      // Convert parameters to array format expected by Wati.io
      const parameterArray = Object.entries(parameters).map(([key, value]) => ({
        name: key,
        value: value,
      }));

      const requestData = {
        whatsappNumber: formattedPhone,
        template_name: templateName,
        broadcast_name: 'Order Notifications',
        parameters: parameterArray,
      };

      console.log(
        `[Wati] Attempt ${attempt}/${MAX_RETRY_ATTEMPTS} - Sending to ${formattedPhone}`
      );

      const response = await client.post('/api/v1/sendTemplateMessage', requestData);

      // Check if response indicates success
      if (response.data && (response.data.result === 'success' || response.status === 200)) {
        console.log(
          `[Wati] Message sent successfully to ${formattedPhone} (template: ${templateName})`
        );

        // Update notification status to sent
        await updateNotificationStatus(notificationId, 'sent');

        return {
          success: true,
          notificationId,
          attemptsMade,
        };
      }

      // If we get here, response was not successful
      lastError = response.data?.message || 'Unknown error from Wati.io';
      console.warn(`[Wati] Attempt ${attempt} failed:`, lastError);
    } catch (error: any) {
      lastError =
        error.response?.data?.message ||
        error.message ||
        'Failed to send WhatsApp message';

      console.error(
        `[Wati] Attempt ${attempt} error:`,
        error.response?.data || error.message
      );

      // Don't retry on authentication errors (401)
      if (error.response?.status === 401) {
        console.error('[Wati] Authentication failed - check API key');
        await updateNotificationStatus(notificationId, 'failed', lastError);

        return {
          success: false,
          error: 'Authentication failed - invalid API key',
          notificationId,
          attemptsMade,
        };
      }

      // Don't retry on bad request errors (400) - likely invalid template or parameters
      if (error.response?.status === 400) {
        console.error('[Wati] Bad request - check template name and parameters');
        await updateNotificationStatus(notificationId, 'failed', lastError);

        return {
          success: false,
          error: `Bad request: ${lastError}`,
          notificationId,
          attemptsMade,
        };
      }
    }

    // Wait before retry (exponential backoff)
    if (attempt < MAX_RETRY_ATTEMPTS) {
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1);
      console.log(`[Wati] Retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }

  // All retries failed
  console.error(
    `[Wati] All ${MAX_RETRY_ATTEMPTS} attempts failed for ${formattedPhone}`
  );

  await updateNotificationStatus(notificationId, 'failed', lastError);

  return {
    success: false,
    error: lastError,
    notificationId,
    attemptsMade,
  };
}

/**
 * Map template name to notification type
 */
function mapTemplateToNotificationType(templateName: string): NotificationType {
  const mapping: Record<string, NotificationType> = {
    order_confirmation: 'order_confirmation',
    order_ready: 'order_ready',
    driver_dispatched: 'driver_dispatched',
    driver_nearby: 'driver_nearby',
    order_delivered: 'delivered',
    payment_reminder: 'payment_reminder',
  };

  return mapping[templateName] || 'order_confirmation';
}

/**
 * Create message from template and parameters
 */
function createMessageFromTemplate(
  templateName: string,
  parameters: Record<string, string>
): string {
  // Template definitions (should match Wati.io approved templates)
  const templates: Record<string, string> = {
    order_confirmation:
      'Hi {{name}}, your order {{orderId}} has been received. Total: KES {{amount}}. Estimated completion: {{date}}. Thank you for choosing Lorenzo Dry Cleaners!',
    order_ready:
      'Great news {{name}}! Your order {{orderId}} is ready for {{collectionMethod}} at {{branchName}}. Thank you for your patience!',
    driver_dispatched:
      'Hi {{name}}, your order {{orderId}} is out for delivery! Driver: {{driverName}}, Phone: {{driverPhone}}. ETA: {{eta}} minutes.',
    driver_nearby:
      'Hi {{name}}, our driver is approximately 5 minutes away with your order {{orderId}}. Please be ready to receive your delivery.',
    order_delivered:
      'Hi {{name}}, your order {{orderId}} has been successfully delivered. Thank you for choosing Lorenzo Dry Cleaners! We look forward to serving you again.',
    payment_reminder:
      'Hi {{name}}, this is a friendly reminder that order {{orderId}} has a pending balance of KES {{balance}}. Please pay at your earliest convenience. Thank you!',
  };

  let message = templates[templateName] || '';

  // Replace parameters in template
  for (const [key, value] of Object.entries(parameters)) {
    message = message.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }

  return message;
}

/**
 * Send order confirmation notification
 *
 * @param phone - Customer phone number
 * @param orderData - Order information
 * @returns Success status
 *
 * @example
 * await sendOrderConfirmation('+254712345678', {
 *   orderId: 'ORD-001-20231015-0001',
 *   customerName: 'John Doe',
 *   amount: 1500,
 *   estimatedCompletion: '2023-10-17'
 * });
 */
export async function sendOrderConfirmation(
  phone: string,
  orderData: {
    orderId: string;
    customerName: string;
    amount: number;
    estimatedCompletion: string;
  }
): Promise<{
  success: boolean;
  notificationId?: string;
  error?: string;
}> {
  console.log(`[Wati] Sending order confirmation for ${orderData.orderId}`);

  return await sendWhatsAppMessage(
    phone,
    'order_confirmation',
    {
      name: orderData.customerName,
      orderId: orderData.orderId,
      amount: orderData.amount.toLocaleString(),
      date: orderData.estimatedCompletion,
    },
    orderData.orderId
  );
}

/**
 * Send order ready notification
 *
 * @param phone - Customer phone number
 * @param orderData - Order information
 * @returns Success status
 *
 * @example
 * await sendOrderReady('+254712345678', {
 *   orderId: 'ORD-001-20231015-0001',
 *   customerName: 'John Doe',
 *   collectionMethod: 'pickup',
 *   branchName: 'Lorenzo Kilimani'
 * });
 */
export async function sendOrderReady(
  phone: string,
  orderData: {
    orderId: string;
    customerName: string;
    collectionMethod: string;
    branchName: string;
  }
): Promise<{
  success: boolean;
  notificationId?: string;
  error?: string;
}> {
  console.log(`[Wati] Sending order ready notification for ${orderData.orderId}`);

  return await sendWhatsAppMessage(
    phone,
    'order_ready',
    {
      name: orderData.customerName,
      orderId: orderData.orderId,
      collectionMethod: orderData.collectionMethod,
      branchName: orderData.branchName,
    },
    orderData.orderId
  );
}

/**
 * Send driver dispatched notification
 *
 * @param phone - Customer phone number
 * @param orderData - Order information
 * @param driverInfo - Driver information
 * @returns Success status
 *
 * @example
 * await sendDriverDispatched('+254712345678', order, {
 *   driverName: 'Peter Mwangi',
 *   driverPhone: '+254723456789',
 *   estimatedArrival: 30
 * });
 */
export async function sendDriverDispatched(
  phone: string,
  orderData: {
    orderId: string;
    customerName: string;
  },
  driverInfo: {
    driverName: string;
    driverPhone: string;
    estimatedArrival: number; // in minutes
  }
): Promise<{
  success: boolean;
  notificationId?: string;
  error?: string;
}> {
  console.log(`[Wati] Sending driver dispatched notification for ${orderData.orderId}`);

  return await sendWhatsAppMessage(
    phone,
    'driver_dispatched',
    {
      name: orderData.customerName,
      orderId: orderData.orderId,
      driverName: driverInfo.driverName,
      driverPhone: driverInfo.driverPhone,
      eta: driverInfo.estimatedArrival.toString(),
    },
    orderData.orderId
  );
}

/**
 * Send driver nearby notification (5 minutes away)
 *
 * @param phone - Customer phone number
 * @param orderData - Order information
 * @returns Success status
 */
export async function sendDriverNearby(
  phone: string,
  orderData: {
    orderId: string;
    customerName: string;
  }
): Promise<{
  success: boolean;
  notificationId?: string;
  error?: string;
}> {
  console.log(`[Wati] Sending driver nearby notification for ${orderData.orderId}`);

  return await sendWhatsAppMessage(
    phone,
    'driver_nearby',
    {
      name: orderData.customerName,
      orderId: orderData.orderId,
    },
    orderData.orderId
  );
}

/**
 * Send order delivered notification
 *
 * @param phone - Customer phone number
 * @param orderData - Order information
 * @returns Success status
 *
 * @example
 * await sendDelivered('+254712345678', {
 *   orderId: 'ORD-001-20231015-0001',
 *   customerName: 'John Doe'
 * });
 */
export async function sendDelivered(
  phone: string,
  orderData: {
    orderId: string;
    customerName: string;
  }
): Promise<{
  success: boolean;
  notificationId?: string;
  error?: string;
}> {
  console.log(`[Wati] Sending delivery confirmation for ${orderData.orderId}`);

  return await sendWhatsAppMessage(
    phone,
    'order_delivered',
    {
      name: orderData.customerName,
      orderId: orderData.orderId,
    },
    orderData.orderId
  );
}

/**
 * Send payment reminder notification
 *
 * @param phone - Customer phone number
 * @param orderData - Order information
 * @param balanceDue - Amount owed
 * @returns Success status
 *
 * @example
 * await sendPaymentReminder('+254712345678', {
 *   orderId: 'ORD-001-20231015-0001',
 *   customerName: 'John Doe'
 * }, 500);
 */
export async function sendPaymentReminder(
  phone: string,
  orderData: {
    orderId: string;
    customerName: string;
  },
  balanceDue: number
): Promise<{
  success: boolean;
  notificationId?: string;
  error?: string;
}> {
  console.log(`[Wati] Sending payment reminder for ${orderData.orderId}`);

  return await sendWhatsAppMessage(
    phone,
    'payment_reminder',
    {
      name: orderData.customerName,
      orderId: orderData.orderId,
      balance: balanceDue.toLocaleString(),
    },
    orderData.orderId
  );
}

/**
 * Test Wati.io API connection
 * Useful for setup verification
 *
 * @returns Success status and message
 */
export async function testWatiConnection(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    if (!WATI_API_KEY) {
      return {
        success: false,
        message: 'WATI_API_KEY environment variable is not set',
      };
    }

    const client = createWatiClient();

    // Try to get account info or templates list
    const response = await client.get('/api/v1/getMessageTemplates');

    if (response.status === 200) {
      return {
        success: true,
        message: 'Successfully connected to Wati.io API',
      };
    }

    return {
      success: false,
      message: `Unexpected response status: ${response.status}`,
    };
  } catch (error: any) {
    console.error('Wati connection test error:', error.response?.data || error.message);

    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Connection test failed',
    };
  }
}

/**
 * Get list of approved message templates from Wati.io
 * Useful for verifying template setup
 *
 * @returns List of template names
 */
export async function getMessageTemplates(): Promise<{
  success: boolean;
  templates?: string[];
  error?: string;
}> {
  try {
    const client = createWatiClient();

    const response = await client.get('/api/v1/getMessageTemplates');

    if (response.data && Array.isArray(response.data)) {
      const templateNames = response.data.map((t: any) => t.name || t.elementName);

      return {
        success: true,
        templates: templateNames,
      };
    }

    return {
      success: false,
      error: 'Invalid response format',
    };
  } catch (error: any) {
    console.error('Get templates error:', error.response?.data || error.message);

    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to get templates',
    };
  }
}

/**
 * Send SMS fallback (placeholder - requires SMS provider integration)
 * This would be called if WhatsApp sending fails after all retries
 *
 * @param phone - Phone number
 * @param message - Message to send
 * @returns Success status
 */
export async function sendSMSFallback(
  phone: string,
  message: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  // TODO: Implement SMS fallback using Africa's Talking or Twilio
  console.warn(
    `[SMS Fallback] Would send SMS to ${phone}: ${message.substring(0, 50)}...`
  );

  return {
    success: false,
    error: 'SMS fallback not yet implemented',
  };
}
