/**
 * Wati.io Integration Test Script
 *
 * This script tests the Wati.io WhatsApp integration:
 * - Connection test
 * - Template verification
 * - Test message sending (optional)
 *
 * Usage:
 *   npx ts-node scripts/test-wati.ts
 *   npm run test:wati
 */

import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import {
  testWatiConnection,
  getMessageTemplates,
  sendOrderConfirmation,
  isValidKenyanPhoneNumber,
  formatPhoneNumber,
} from '../services/wati';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title: string) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60) + '\n');
}

async function main() {
  log('Lorenzo Dry Cleaners - Wati.io Integration Test', 'blue');
  log('Started at: ' + new Date().toLocaleString(), 'blue');

  // Check environment variables
  section('1. Environment Variables Check');

  const accessToken = process.env.WATI_ACCESS_TOKEN;
  const apiEndpoint = process.env.WATI_API_ENDPOINT;

  if (!accessToken) {
    log('ERROR: WATI_ACCESS_TOKEN not found in .env.local', 'red');
    log('Please add your Wati.io Access Token to .env.local', 'yellow');
    process.exit(1);
  }

  log(`Access Token: ${accessToken.substring(0, 10)}...${accessToken.substring(accessToken.length - 4)}`, 'green');
  log(`API Endpoint: ${apiEndpoint}`, 'green');

  // Test connection
  section('2. Connection Test');

  try {
    const connectionResult = await testWatiConnection();

    if (connectionResult.success) {
      log('SUCCESS: Connected to Wati.io API', 'green');
      log(connectionResult.message, 'green');
    } else {
      log('FAILED: Could not connect to Wati.io API', 'red');
      log(connectionResult.message, 'red');
      process.exit(1);
    }
  } catch (error: any) {
    log('ERROR: Connection test failed', 'red');
    log(error.message, 'red');
    process.exit(1);
  }

  // Get templates
  section('3. Message Templates Verification');

  try {
    const templatesResult = await getMessageTemplates();

    if (templatesResult.success && templatesResult.templates) {
      log(`Found ${templatesResult.templates.length} approved templates:`, 'green');

      const requiredTemplates = [
        'order_confirmation',
        'order_ready',
        'driver_dispatched',
        'driver_nearby',
        'order_delivered',
        'payment_reminder',
      ];

      templatesResult.templates.forEach((template) => {
        const isRequired = requiredTemplates.includes(template);
        const symbol = isRequired ? '✓' : '○';
        const color = isRequired ? 'green' : 'yellow';
        log(`  ${symbol} ${template}`, color);
      });

      // Check if all required templates are present
      const missingTemplates = requiredTemplates.filter(
        (t) => !templatesResult.templates!.includes(t)
      );

      if (missingTemplates.length > 0) {
        log('\nWARNING: Missing required templates:', 'yellow');
        missingTemplates.forEach((t) => log(`  - ${t}`, 'yellow'));
        log('\nPlease create and approve these templates in Wati.io dashboard', 'yellow');
      } else {
        log('\nSUCCESS: All required templates are approved', 'green');
      }
    } else {
      log('FAILED: Could not retrieve templates', 'red');
      log(templatesResult.error || 'Unknown error', 'red');
    }
  } catch (error: any) {
    log('ERROR: Template verification failed', 'red');
    log(error.message, 'red');
  }

  // Phone number validation test
  section('4. Phone Number Validation Test');

  const testPhoneNumbers = [
    '+254712345678',
    '0712345678',
    '254712345678',
    '+254123456789', // Invalid (should start with 7 or 1)
    '712345678', // Missing country code
  ];

  testPhoneNumbers.forEach((phone) => {
    const isValid = isValidKenyanPhoneNumber(phone);
    const formatted = formatPhoneNumber(phone);
    const symbol = isValid ? '✓' : '✗';
    const color = isValid ? 'green' : 'red';

    log(`  ${symbol} ${phone.padEnd(20)} → ${formatted}`, color);
  });

  // Optional: Send test message
  section('5. Send Test Message (Optional)');

  const shouldSendTest = process.argv.includes('--send-test');

  if (shouldSendTest) {
    const testPhone = process.argv.find((arg) => arg.startsWith('--phone='))?.split('=')[1];

    if (!testPhone) {
      log('ERROR: Please provide a test phone number:', 'red');
      log('  npx ts-node scripts/test-wati.ts --send-test --phone=+254712345678', 'yellow');
    } else if (!isValidKenyanPhoneNumber(testPhone)) {
      log(`ERROR: Invalid Kenya phone number: ${testPhone}`, 'red');
    } else {
      log(`Sending test notification to ${testPhone}...`, 'yellow');

      try {
        const result = await sendOrderConfirmation(testPhone, {
          orderId: 'ORD-TEST-' + Date.now(),
          customerName: 'Test Customer',
          amount: 1500,
          estimatedCompletion: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        });

        if (result.success) {
          log('SUCCESS: Test message sent', 'green');
          log(`Notification ID: ${result.notificationId}`, 'green');
        } else {
          log('FAILED: Could not send test message', 'red');
          log(result.error || 'Unknown error', 'red');
        }
      } catch (error: any) {
        log('ERROR: Test message failed', 'red');
        log(error.message, 'red');
      }
    }
  } else {
    log('Skipping test message send.', 'yellow');
    log('To send a test message, run:', 'yellow');
    log('  npx ts-node scripts/test-wati.ts --send-test --phone=+254712345678', 'cyan');
  }

  // Summary
  section('Test Summary');

  log('Test completed successfully!', 'green');
  log('\nNext steps:', 'cyan');
  log('1. Ensure all required templates are approved in Wati.io dashboard', 'yellow');
  log('2. Test sending messages with --send-test flag', 'yellow');
  log('3. Integrate notifications into order workflow', 'yellow');
  log('4. Monitor notification logs in Firestore', 'yellow');

  log('\nFinished at: ' + new Date().toLocaleString(), 'blue');
}

// Run the test
main().catch((error) => {
  log('\nFATAL ERROR:', 'red');
  console.error(error);
  process.exit(1);
});
