/**
 * Test script for Firebase Cloud Functions
 * Run with: npx ts-node scripts/test-functions.ts
 */

import * as admin from 'firebase-admin';
import { sendOrderConfirmationEmail } from '../src/utils/email';
import { sendOrderConfirmationWhatsApp, formatPhoneNumber, isValidKenyanPhoneNumber } from '../src/utils/whatsapp';
import { logAnalyticsEvent } from '../src/utils/analytics';

// Initialize Firebase Admin
admin.initializeApp({
  projectId: process.env.FIREBASE_PROJECT_ID || 'lorenzo-dry-cleaners-dev',
});

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message: string, color: keyof typeof COLORS = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function section(title: string) {
  console.log('\n' + '='.repeat(60));
  log(title, 'blue');
  console.log('='.repeat(60) + '\n');
}

async function testPhoneValidation() {
  section('Testing Phone Number Validation');

  const testCases = [
    { input: '+254712345678', expected: true },
    { input: '254712345678', expected: true },
    { input: '0712345678', expected: true },
    { input: '712345678', expected: true },
    { input: '1234567890', expected: false },
    { input: '+1234567890', expected: false },
  ];

  for (const testCase of testCases) {
    const formatted = formatPhoneNumber(testCase.input);
    const isValid = isValidKenyanPhoneNumber(testCase.input);
    const passed = isValid === testCase.expected;

    log(
      `Input: ${testCase.input} → Formatted: ${formatted} → Valid: ${isValid} ${passed ? '✓' : '✗'}`,
      passed ? 'green' : 'red'
    );
  }
}

async function testEmailUtility() {
  section('Testing Email Utility');

  log('Attempting to send test order confirmation email...', 'yellow');

  try {
    const result = await sendOrderConfirmationEmail(
      'test@example.com',
      {
        orderId: 'TEST-001',
        customerName: 'John Doe',
        garmentCount: 5,
        totalAmount: 2500,
        estimatedCompletion: 'November 16, 2025',
      }
    );

    if (result.success) {
      log(`✓ Email sent successfully!`, 'green');
    } else {
      log(`✗ Email failed: ${result.error}`, 'red');
    }
  } catch (error: any) {
    log(`✗ Email error: ${error.message}`, 'red');
  }
}

async function testWhatsAppUtility() {
  section('Testing WhatsApp Utility');

  log('Attempting to send test order confirmation WhatsApp...', 'yellow');
  log('Note: This will only work if Wati.io API key is configured', 'yellow');

  try {
    const result = await sendOrderConfirmationWhatsApp(
      '+254712345678', // Test number
      {
        orderId: 'TEST-001',
        customerName: 'John Doe',
        garmentCount: 5,
        totalAmount: 2500,
        estimatedCompletion: 'November 16, 2025',
      }
    );

    if (result.success) {
      log(`✓ WhatsApp sent successfully!`, 'green');
    } else {
      log(`✗ WhatsApp failed: ${result.error}`, 'red');
    }
  } catch (error: any) {
    log(`✗ WhatsApp error: ${error.message}`, 'red');
  }
}

async function testAnalyticsUtility() {
  section('Testing Analytics Utility');

  log('Attempting to log test analytics event...', 'yellow');

  try {
    await logAnalyticsEvent({
      eventType: 'test_event',
      orderId: 'TEST-001',
      metadata: {
        source: 'test_script',
        timestamp: new Date().toISOString(),
      },
    });

    log('✓ Analytics event logged successfully!', 'green');
  } catch (error: any) {
    log(`✗ Analytics error: ${error.message}`, 'red');
  }
}

async function testFirestoreConnection() {
  section('Testing Firestore Connection');

  log('Attempting to read from Firestore...', 'yellow');

  try {
    const branchesSnapshot = await admin.firestore()
      .collection('branches')
      .limit(1)
      .get();

    log(`✓ Firestore connected! Found ${branchesSnapshot.size} branch(es)`, 'green');

    if (!branchesSnapshot.empty) {
      const branch = branchesSnapshot.docs[0].data();
      log(`Sample branch: ${branch.name || 'Unnamed'}`, 'green');
    }
  } catch (error: any) {
    log(`✗ Firestore error: ${error.message}`, 'red');
  }
}

async function runTests() {
  log('Lorenzo Dry Cleaners - Functions Test Suite', 'blue');
  log('=============================================\n', 'blue');

  const tests = [
    { name: 'Phone Validation', fn: testPhoneValidation },
    { name: 'Firestore Connection', fn: testFirestoreConnection },
    { name: 'Analytics Utility', fn: testAnalyticsUtility },
    { name: 'Email Utility', fn: testEmailUtility },
    { name: 'WhatsApp Utility', fn: testWhatsAppUtility },
  ];

  for (const test of tests) {
    try {
      await test.fn();
    } catch (error: any) {
      log(`\n✗ Test "${test.name}" failed: ${error.message}`, 'red');
    }
  }

  section('Test Summary');
  log('All tests completed. Review results above.', 'blue');
  log('\nNote: Email and WhatsApp tests may fail if API keys are not configured.', 'yellow');
  log('This is expected in local development environments.\n', 'yellow');

  process.exit(0);
}

// Run tests
runTests().catch((error) => {
  log(`\n✗ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
