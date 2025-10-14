/**
 * Pesapal Payment Gateway Integration
 *
 * This service handles all Pesapal API v3 operations including:
 * - OAuth 2.0 authentication
 * - Payment initialization
 * - Payment status queries
 * - IPN (Instant Payment Notification) handling
 *
 * @module services/pesapal
 */

import axios, { AxiosInstance } from 'axios';

// Pesapal API configuration
const PESAPAL_API_URL = process.env.PESAPAL_API_URL || 'https://cybqa.pesapal.com/pesapalv3';
const PESAPAL_CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY || '';
const PESAPAL_CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET || '';
const PESAPAL_IPN_URL = process.env.PESAPAL_IPN_URL || '';

// Token cache
let accessToken: string | null = null;
let tokenExpiry: Date | null = null;

/**
 * Create axios instance for Pesapal API
 */
function createPesapalClient(token?: string): AxiosInstance {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return axios.create({
    baseURL: PESAPAL_API_URL,
    headers,
    timeout: 30000, // 30 seconds
  });
}

/**
 * Get OAuth 2.0 access token from Pesapal
 * Tokens are cached and reused until expiry
 */
export async function getPesapalAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (accessToken && tokenExpiry && new Date() < tokenExpiry) {
    return accessToken;
  }

  try {
    const client = createPesapalClient();

    const response = await client.post('/api/Auth/RequestToken', {
      consumer_key: PESAPAL_CONSUMER_KEY,
      consumer_secret: PESAPAL_CONSUMER_SECRET,
    });

    if (response.data && response.data.token) {
      const token = response.data.token as string;
      accessToken = token;

      // Set token expiry (Pesapal tokens typically expire in 5 minutes)
      tokenExpiry = new Date(Date.now() + 4 * 60 * 1000); // 4 minutes to be safe

      return token;
    }

    throw new Error('No token received from Pesapal');
  } catch (error) {
    console.error('Pesapal authentication error:', error);
    throw new Error('Failed to authenticate with Pesapal');
  }
}

/**
 * Payment submission data interface
 */
export interface PesapalPaymentData {
  orderId: string;
  amount: number;
  customerPhone: string;
  customerEmail: string;
  description: string;
  callbackUrl?: string;
}

/**
 * Payment submission response interface
 */
export interface PesapalPaymentResponse {
  success: boolean;
  orderTrackingId?: string;
  redirectUrl?: string;
  error?: string;
  merchantReference?: string;
}

/**
 * Submit order request to Pesapal
 * Returns redirect URL for customer to complete payment
 */
export async function submitOrderRequest(
  paymentData: PesapalPaymentData
): Promise<PesapalPaymentResponse> {
  try {
    const token = await getPesapalAccessToken();
    const client = createPesapalClient(token);

    // Format phone number for Pesapal (remove + and ensure it starts with 254)
    let phone = paymentData.customerPhone.replace(/\+/g, '');
    if (!phone.startsWith('254')) {
      // If it starts with 0, replace with 254
      if (phone.startsWith('0')) {
        phone = '254' + phone.substring(1);
      }
    }

    const requestData = {
      id: paymentData.orderId,
      currency: 'KES',
      amount: paymentData.amount,
      description: paymentData.description,
      callback_url: paymentData.callbackUrl || PESAPAL_IPN_URL,
      notification_id: process.env.PESAPAL_IPN_ID || '', // IPN registration ID
      billing_address: {
        phone_number: phone,
        email_address: paymentData.customerEmail || 'customer@lorenzo-dry-cleaners.com',
        country_code: 'KE',
      },
    };

    const response = await client.post('/api/Transactions/SubmitOrderRequest', requestData);

    if (response.data && response.data.redirect_url) {
      return {
        success: true,
        orderTrackingId: response.data.order_tracking_id,
        redirectUrl: response.data.redirect_url,
        merchantReference: paymentData.orderId,
      };
    }

    return {
      success: false,
      error: response.data?.message || 'Failed to initiate payment',
    };
  } catch (error: any) {
    console.error('Pesapal payment submission error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to submit payment request',
    };
  }
}

/**
 * Payment status response interface
 */
export interface PesapalPaymentStatus {
  orderTrackingId: string;
  merchantReference: string;
  paymentMethod: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'INVALID' | 'REVERSED';
  statusDescription: string;
  paymentAccount?: string;
  confirmationCode?: string;
  paymentStatusDescription?: string;
}

/**
 * Get payment status by order tracking ID
 */
export async function getTransactionStatus(
  orderTrackingId: string
): Promise<PesapalPaymentStatus | null> {
  try {
    const token = await getPesapalAccessToken();
    const client = createPesapalClient(token);

    const response = await client.get(
      `/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`
    );

    if (response.data) {
      return {
        orderTrackingId: response.data.order_tracking_id,
        merchantReference: response.data.merchant_reference,
        paymentMethod: response.data.payment_method,
        amount: response.data.amount,
        status: response.data.payment_status_description,
        statusDescription: response.data.description || '',
        paymentAccount: response.data.payment_account,
        confirmationCode: response.data.confirmation_code,
        paymentStatusDescription: response.data.payment_status_description,
      };
    }

    return null;
  } catch (error: any) {
    console.error('Pesapal status query error:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Verify IPN callback signature
 * Important for security to ensure callback is from Pesapal
 */
export function verifyPesapalSignature(
  orderTrackingId: string,
  merchantReference: string,
  signature: string
): boolean {
  // In production, implement proper signature verification
  // This is a placeholder - Pesapal documentation will have the exact algorithm

  // For now, just check that required fields are present
  if (!orderTrackingId || !merchantReference) {
    return false;
  }

  // TODO: Implement actual signature verification based on Pesapal docs
  // This typically involves creating a hash of certain fields with your secret

  return true;
}

/**
 * Register IPN URL with Pesapal
 * This should be done once during setup
 */
export async function registerIPNUrl(
  ipnUrl: string,
  ipnType: 'GET' | 'POST' = 'POST'
): Promise<{ success: boolean; ipnId?: string; error?: string }> {
  try {
    const token = await getPesapalAccessToken();
    const client = createPesapalClient(token);

    const response = await client.post('/api/URLSetup/RegisterIPN', {
      url: ipnUrl,
      ipn_notification_type: ipnType,
    });

    if (response.data && response.data.ipn_id) {
      return {
        success: true,
        ipnId: response.data.ipn_id,
      };
    }

    return {
      success: false,
      error: 'Failed to register IPN URL',
    };
  } catch (error: any) {
    console.error('IPN registration error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to register IPN URL',
    };
  }
}

/**
 * Get list of registered IPN URLs
 */
export async function getRegisteredIPNs(): Promise<any[]> {
  try {
    const token = await getPesapalAccessToken();
    const client = createPesapalClient(token);

    const response = await client.get('/api/URLSetup/GetIpnList');

    return response.data || [];
  } catch (error: any) {
    console.error('Get IPNs error:', error.response?.data || error.message);
    return [];
  }
}

/**
 * Test connection to Pesapal API
 */
export async function testPesapalConnection(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const token = await getPesapalAccessToken();

    if (token) {
      return {
        success: true,
        message: 'Successfully connected to Pesapal API',
      };
    }

    return {
      success: false,
      message: 'Failed to get access token',
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Connection test failed',
    };
  }
}

/**
 * Map Pesapal payment status to application transaction status
 */
export function mapPesapalStatus(
  pesapalStatus: string
): 'pending' | 'completed' | 'failed' {
  const status = pesapalStatus.toUpperCase();

  if (status === 'COMPLETED') {
    return 'completed';
  }

  if (status === 'FAILED' || status === 'INVALID' || status === 'REVERSED') {
    return 'failed';
  }

  return 'pending';
}

/**
 * Refund transaction (future feature)
 */
export async function refundTransaction(
  orderTrackingId: string,
  amount: number,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  // TODO: Implement refund functionality
  // This requires additional Pesapal API integration
  console.warn('Refund functionality not yet implemented');

  return {
    success: false,
    error: 'Refund functionality not yet implemented',
  };
}
