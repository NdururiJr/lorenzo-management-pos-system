/**
 * Email Service Test Script
 *
 * This script helps test the email service configuration and templates.
 * Run with: npm run test:email or tsx scripts/test-email-service.ts
 *
 * Usage:
 *   tsx scripts/test-email-service.ts --test-connection
 *   tsx scripts/test-email-service.ts --send-password-reset your-email@example.com
 *   tsx scripts/test-email-service.ts --send-order-confirmation your-email@example.com
 *   tsx scripts/test-email-service.ts --send-receipt your-email@example.com
 */

import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// Import email service functions
import {
  sendPasswordReset,
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendReceipt,
  testEmailConnection,
} from '../services/email';

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];
const email = args[1];

async function main() {
  console.log('🧪 Lorenzo Dry Cleaners - Email Service Test\n');

  // Validate environment variables
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is not set in .env.local');
    console.log('Please add: RESEND_API_KEY=re_your_api_key_here\n');
    process.exit(1);
  }

  if (!process.env.RESEND_FROM_EMAIL) {
    console.error('❌ RESEND_FROM_EMAIL is not set in .env.local');
    console.log(
      'Please add: RESEND_FROM_EMAIL=Lorenzo Dry Cleaners <noreply@lorenzo-dry-cleaners.com>\n'
    );
    process.exit(1);
  }

  console.log('✅ Environment variables configured\n');

  // Execute command
  switch (command) {
    case '--test-connection':
      await testConnection();
      break;

    case '--send-password-reset':
      if (!email) {
        console.error('❌ Please provide an email address');
        console.log('Usage: tsx scripts/test-email-service.ts --send-password-reset your-email@example.com\n');
        process.exit(1);
      }
      await testPasswordReset(email);
      break;

    case '--send-order-confirmation':
      if (!email) {
        console.error('❌ Please provide an email address');
        console.log(
          'Usage: tsx scripts/test-email-service.ts --send-order-confirmation your-email@example.com\n'
        );
        process.exit(1);
      }
      await testOrderConfirmation(email);
      break;

    case '--send-status-update':
      if (!email) {
        console.error('❌ Please provide an email address');
        console.log(
          'Usage: tsx scripts/test-email-service.ts --send-status-update your-email@example.com\n'
        );
        process.exit(1);
      }
      await testStatusUpdate(email);
      break;

    case '--send-receipt':
      if (!email) {
        console.error('❌ Please provide an email address');
        console.log('Usage: tsx scripts/test-email-service.ts --send-receipt your-email@example.com\n');
        process.exit(1);
      }
      await testReceipt(email);
      break;

    case '--send-all':
      if (!email) {
        console.error('❌ Please provide an email address');
        console.log('Usage: tsx scripts/test-email-service.ts --send-all your-email@example.com\n');
        process.exit(1);
      }
      await testAll(email);
      break;

    default:
      console.log('Available commands:');
      console.log('  --test-connection                        Test Resend API connection');
      console.log('  --send-password-reset <email>           Send test password reset email');
      console.log('  --send-order-confirmation <email>       Send test order confirmation email');
      console.log('  --send-status-update <email>            Send test order status update email');
      console.log('  --send-receipt <email>                  Send test receipt email');
      console.log('  --send-all <email>                      Send all test emails\n');
      console.log('Example:');
      console.log('  tsx scripts/test-email-service.ts --test-connection');
      console.log('  tsx scripts/test-email-service.ts --send-all your-email@example.com\n');
  }
}

async function testConnection() {
  console.log('🔗 Testing Resend API connection...\n');

  const result = await testEmailConnection('test@example.com');

  if (result.success) {
    console.log('✅ Connection successful!');
    console.log(`Email ID: ${result.id}\n`);
  } else {
    console.error('❌ Connection failed:', result.error, '\n');
    process.exit(1);
  }
}

async function testPasswordReset(toEmail: string) {
  console.log(`📧 Sending password reset email to ${toEmail}...\n`);

  const result = await sendPasswordReset(
    toEmail,
    'https://lorenzo-dry-cleaners.com/reset?token=test_token_123',
    'Test User'
  );

  if (result.success) {
    console.log('✅ Password reset email sent!');
    console.log(`Email ID: ${result.id}`);
    console.log(`Retry count: ${result.retryCount}\n`);
  } else {
    console.error('❌ Failed to send password reset email:', result.error, '\n');
  }
}

async function testOrderConfirmation(toEmail: string) {
  console.log(`📧 Sending order confirmation email to ${toEmail}...\n`);

  const result = await sendOrderConfirmation({
    orderId: 'ORD-KIL-20251114-TEST',
    customerName: 'Test Customer',
    customerEmail: toEmail,
    garmentCount: 5,
    totalAmount: 2500,
    estimatedCompletion: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    branchName: 'Kilimani Branch',
    branchPhone: '+254 725 462 859',
    orderDate: new Date(),
    trackingUrl: 'https://lorenzo-dry-cleaners.com/track/ORD-KIL-20251114-TEST',
  });

  if (result.success) {
    console.log('✅ Order confirmation email sent!');
    console.log(`Email ID: ${result.id}`);
    console.log(`Retry count: ${result.retryCount}\n`);
  } else {
    console.error('❌ Failed to send order confirmation email:', result.error, '\n');
  }
}

async function testStatusUpdate(toEmail: string) {
  console.log(`📧 Sending order status update email to ${toEmail}...\n`);

  const result = await sendOrderStatusUpdate({
    orderId: 'ORD-KIL-20251114-TEST',
    customerName: 'Test Customer',
    customerEmail: toEmail,
    oldStatus: 'washing',
    newStatus: 'ready',
    statusMessage: 'Great news! Your order is ready for pickup at our Kilimani branch.',
    trackingUrl: 'https://lorenzo-dry-cleaners.com/track/ORD-KIL-20251114-TEST',
    estimatedCompletion: new Date(),
  });

  if (result.success) {
    console.log('✅ Order status update email sent!');
    console.log(`Email ID: ${result.id}`);
    console.log(`Retry count: ${result.retryCount}\n`);
  } else {
    console.error('❌ Failed to send order status update email:', result.error, '\n');
  }
}

async function testReceipt(toEmail: string) {
  console.log(`📧 Sending receipt email to ${toEmail}...\n`);

  const result = await sendReceipt({
    orderId: 'ORD-KIL-20251114-TEST',
    customerName: 'Test Customer',
    customerEmail: toEmail,
    totalAmount: 2500,
    paidAmount: 2500,
    paymentMethod: 'mpesa',
    transactionDate: new Date(),
    receiptUrl: 'https://lorenzo-dry-cleaners.com/receipts/ORD-KIL-20251114-TEST',
  });

  if (result.success) {
    console.log('✅ Receipt email sent!');
    console.log(`Email ID: ${result.id}`);
    console.log(`Retry count: ${result.retryCount}\n`);
  } else {
    console.error('❌ Failed to send receipt email:', result.error, '\n');
  }
}

async function testAll(toEmail: string) {
  console.log(`🚀 Sending all test emails to ${toEmail}...\n`);

  await testPasswordReset(toEmail);
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds

  await testOrderConfirmation(toEmail);
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds

  await testStatusUpdate(toEmail);
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds

  await testReceipt(toEmail);

  console.log('✅ All test emails sent!\n');
}

// Run the script
main().catch((error) => {
  console.error('❌ Error running email test:', error);
  process.exit(1);
});
