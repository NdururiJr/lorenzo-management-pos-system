/**
 * Email Utilities for Cloud Functions
 * Uses Resend API for sending emails
 */

import axios from 'axios';
import * as functions from 'firebase-functions';

const RESEND_API_KEY = process.env.RESEND_API_KEY || functions.config().resend?.api_key;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || functions.config().resend?.from_email || 'noreply@lorenzo-dry-cleaners.com';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

/**
 * Send an email using Resend API
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!RESEND_API_KEY) {
      throw new Error('Resend API key not configured');
    }

    const response = await axios.post(
      'https://api.resend.com/emails',
      {
        from: RESEND_FROM_EMAIL,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo,
      },
      {
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      messageId: response.data.id,
    };
  } catch (error: any) {
    console.error('Error sending email:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(
  customerEmail: string,
  orderDetails: {
    orderId: string;
    customerName: string;
    garmentCount: number;
    totalAmount: number;
    estimatedCompletion: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: #fff; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .order-details { background: #fff; padding: 15px; margin: 20px 0; border-left: 4px solid #000; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmation</h1>
        </div>
        <div class="content">
          <p>Dear ${orderDetails.customerName},</p>
          <p>Thank you for choosing Lorenzo Dry Cleaners! Your order has been received.</p>

          <div class="order-details">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
            <p><strong>Number of Items:</strong> ${orderDetails.garmentCount}</p>
            <p><strong>Total Amount:</strong> KES ${orderDetails.totalAmount.toLocaleString()}</p>
            <p><strong>Estimated Completion:</strong> ${orderDetails.estimatedCompletion}</p>
          </div>

          <p>We'll notify you when your order is ready for pickup or delivery.</p>
          <p>Track your order at: <a href="${process.env.NEXT_PUBLIC_APP_URL}/customer/orders/${orderDetails.orderId}">View Order</a></p>
        </div>
        <div class="footer">
          <p>Lorenzo Dry Cleaners, Kilimani, Nairobi</p>
          <p>This is an automated message. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `Order Confirmation - ${orderDetails.orderId}`,
    html,
  });
}

/**
 * Send order ready notification email
 */
export async function sendOrderReadyEmail(
  customerEmail: string,
  orderDetails: {
    orderId: string;
    customerName: string;
    pickupMethod: 'customer_collects' | 'delivery';
  }
): Promise<{ success: boolean; error?: string }> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: #fff; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .cta-button { display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Order is Ready!</h1>
        </div>
        <div class="content">
          <p>Dear ${orderDetails.customerName},</p>
          <p>Great news! Your order <strong>${orderDetails.orderId}</strong> is ready.</p>

          ${orderDetails.pickupMethod === 'customer_collects'
            ? '<p>You can collect your items at your convenience during our business hours.</p>'
            : '<p>Your order will be delivered to you shortly. We\'ll notify you when the driver is on the way.</p>'
          }

          <a href="${process.env.NEXT_PUBLIC_APP_URL}/customer/orders/${orderDetails.orderId}" class="cta-button">View Order Details</a>
        </div>
        <div class="footer">
          <p>Lorenzo Dry Cleaners, Kilimani, Nairobi</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `Order Ready - ${orderDetails.orderId}`,
    html,
  });
}

/**
 * Send payment receipt email
 */
export async function sendPaymentReceiptEmail(
  customerEmail: string,
  receiptData: {
    orderId: string;
    customerName: string;
    amount: number;
    paymentMethod: string;
    transactionId: string;
    date: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: #fff; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .receipt { background: #fff; padding: 20px; margin: 20px 0; border: 1px solid #ddd; }
        .receipt-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .receipt-total { font-size: 18px; font-weight: bold; margin-top: 10px; padding-top: 10px; border-top: 2px solid #000; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Receipt</h1>
        </div>
        <div class="content">
          <p>Dear ${receiptData.customerName},</p>
          <p>Thank you for your payment. Here's your receipt:</p>

          <div class="receipt">
            <div class="receipt-row">
              <span>Order ID:</span>
              <span>${receiptData.orderId}</span>
            </div>
            <div class="receipt-row">
              <span>Transaction ID:</span>
              <span>${receiptData.transactionId}</span>
            </div>
            <div class="receipt-row">
              <span>Payment Method:</span>
              <span>${receiptData.paymentMethod}</span>
            </div>
            <div class="receipt-row">
              <span>Date:</span>
              <span>${receiptData.date}</span>
            </div>
            <div class="receipt-total">
              <div class="receipt-row">
                <span>Amount Paid:</span>
                <span>KES ${receiptData.amount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <p>Keep this receipt for your records.</p>
        </div>
        <div class="footer">
          <p>Lorenzo Dry Cleaners, Kilimani, Nairobi</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `Payment Receipt - ${receiptData.orderId}`,
    html,
  });
}
