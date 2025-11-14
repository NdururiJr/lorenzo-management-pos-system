/**
 * WhatsApp Utilities for Cloud Functions
 * Uses Wati.io API for sending WhatsApp messages
 */

import axios from 'axios';
import * as functions from 'firebase-functions';

const WATI_API_KEY = process.env.WATI_API_KEY || functions.config().wati?.api_key;
const WATI_API_URL = process.env.WATI_API_URL || functions.config().wati?.api_url || 'https://live-server.wati.io';

interface WhatsAppMessageOptions {
  phone: string;
  template: string;
  parameters: Array<{ name: string; value: string }>;
}

/**
 * Format Kenyan phone number to international format
 */
export function formatPhoneNumber(phone: string): string {
  // Remove any spaces, dashes, or parentheses
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');

  // Handle different Kenyan number formats
  if (cleaned.startsWith('254')) {
    return cleaned;
  } else if (cleaned.startsWith('0')) {
    return '254' + cleaned.substring(1);
  } else if (cleaned.startsWith('+254')) {
    return cleaned.substring(1);
  } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
    return '254' + cleaned;
  }

  return cleaned;
}

/**
 * Validate Kenyan phone number
 */
export function isValidKenyanPhoneNumber(phone: string): boolean {
  const formatted = formatPhoneNumber(phone);
  // Kenyan numbers: 254 + 9 digits (7xx, 1xx)
  return /^254[71]\d{8}$/.test(formatted);
}

/**
 * Send WhatsApp message using template
 */
export async function sendWhatsAppMessage(options: WhatsAppMessageOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!WATI_API_KEY) {
      throw new Error('Wati API key not configured');
    }

    const formattedPhone = formatPhoneNumber(options.phone);

    if (!isValidKenyanPhoneNumber(formattedPhone)) {
      throw new Error(`Invalid Kenyan phone number: ${options.phone}`);
    }

    const response = await axios.post(
      `${WATI_API_URL}/api/v1/sendTemplateMessage`,
      {
        whatsappNumber: formattedPhone,
        template_name: options.template,
        broadcast_name: 'lorenzo_dry_cleaners',
        parameters: options.parameters,
      },
      {
        headers: {
          'Authorization': `Bearer ${WATI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    return {
      success: true,
      messageId: response.data.result?.id,
    };
  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
}

/**
 * Send order confirmation WhatsApp
 */
export async function sendOrderConfirmationWhatsApp(
  phone: string,
  orderDetails: {
    orderId: string;
    customerName: string;
    garmentCount: number;
    totalAmount: number;
    estimatedCompletion: string;
  }
): Promise<{ success: boolean; error?: string }> {
  return sendWhatsAppMessage({
    phone,
    template: 'order_confirmation',
    parameters: [
      { name: 'customer_name', value: orderDetails.customerName },
      { name: 'order_id', value: orderDetails.orderId },
      { name: 'garment_count', value: orderDetails.garmentCount.toString() },
      { name: 'total_amount', value: `KES ${orderDetails.totalAmount.toLocaleString()}` },
      { name: 'estimated_completion', value: orderDetails.estimatedCompletion },
    ],
  });
}

/**
 * Send order ready WhatsApp
 */
export async function sendOrderReadyWhatsApp(
  phone: string,
  orderDetails: {
    orderId: string;
    customerName: string;
  }
): Promise<{ success: boolean; error?: string }> {
  return sendWhatsAppMessage({
    phone,
    template: 'order_ready',
    parameters: [
      { name: 'customer_name', value: orderDetails.customerName },
      { name: 'order_id', value: orderDetails.orderId },
    ],
  });
}

/**
 * Send driver dispatched WhatsApp
 */
export async function sendDriverDispatchedWhatsApp(
  phone: string,
  orderDetails: {
    orderId: string;
    customerName: string;
    driverName: string;
    driverPhone: string;
  }
): Promise<{ success: boolean; error?: string }> {
  return sendWhatsAppMessage({
    phone,
    template: 'driver_dispatched',
    parameters: [
      { name: 'customer_name', value: orderDetails.customerName },
      { name: 'order_id', value: orderDetails.orderId },
      { name: 'driver_name', value: orderDetails.driverName },
      { name: 'driver_phone', value: orderDetails.driverPhone },
    ],
  });
}

/**
 * Send driver nearby WhatsApp
 */
export async function sendDriverNearbyWhatsApp(
  phone: string,
  orderDetails: {
    orderId: string;
    customerName: string;
    eta: string;
  }
): Promise<{ success: boolean; error?: string }> {
  return sendWhatsAppMessage({
    phone,
    template: 'driver_nearby',
    parameters: [
      { name: 'customer_name', value: orderDetails.customerName },
      { name: 'order_id', value: orderDetails.orderId },
      { name: 'eta', value: orderDetails.eta },
    ],
  });
}

/**
 * Send delivery confirmation WhatsApp
 */
export async function sendDeliveryConfirmationWhatsApp(
  phone: string,
  orderDetails: {
    orderId: string;
    customerName: string;
  }
): Promise<{ success: boolean; error?: string }> {
  return sendWhatsAppMessage({
    phone,
    template: 'order_delivered',
    parameters: [
      { name: 'customer_name', value: orderDetails.customerName },
      { name: 'order_id', value: orderDetails.orderId },
    ],
  });
}

/**
 * Send payment reminder WhatsApp
 */
export async function sendPaymentReminderWhatsApp(
  phone: string,
  orderDetails: {
    orderId: string;
    customerName: string;
    outstandingAmount: number;
  }
): Promise<{ success: boolean; error?: string }> {
  return sendWhatsAppMessage({
    phone,
    template: 'payment_reminder',
    parameters: [
      { name: 'customer_name', value: orderDetails.customerName },
      { name: 'order_id', value: orderDetails.orderId },
      { name: 'outstanding_amount', value: `KES ${orderDetails.outstandingAmount.toLocaleString()}` },
    ],
  });
}
