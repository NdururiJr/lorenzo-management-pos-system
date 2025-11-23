/**
 * Test Wati.io Integration with Custom Template
 *
 * This script sends a test message using an existing approved template
 * Usage: npx ts-node scripts/test-wati-custom-template.ts
 */

import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { sendWhatsAppMessage, isValidKenyanPhoneNumber } from '../services/wati';

// ANSI color codes
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

async function main() {
  console.log('\n' + '='.repeat(60));
  log('Wati.io Custom Template Test', 'cyan');
  console.log('='.repeat(60) + '\n');

  // Configuration
  const testPhone = '+254725462859';
  const templateName = 'onboarding_signoff';
  const parameters = {
    name: 'Gachengoh',
    dashboard_url: 'https://app.wati.io/dashboard',
    tenant_id: '1051875',
    username: 'gachengoh@lorenzo.com',
  };

  log(`Testing with:`, 'blue');
  log(`  Phone: ${testPhone}`, 'yellow');
  log(`  Template: ${templateName}`, 'yellow');
  log(`  Parameters: ${JSON.stringify(parameters, null, 2)}`, 'yellow');
  console.log();

  // Validate phone number
  if (!isValidKenyanPhoneNumber(testPhone)) {
    log(`ERROR: Invalid Kenya phone number: ${testPhone}`, 'red');
    process.exit(1);
  }

  log('Phone number validation: PASSED', 'green');
  console.log();

  // Check environment variables
  const accessToken = process.env.WATI_ACCESS_TOKEN;
  const apiEndpoint = process.env.WATI_API_ENDPOINT;

  if (!accessToken) {
    log('ERROR: WATI_ACCESS_TOKEN not found in .env.local', 'red');
    log('Please add your Wati.io Access Token to .env.local', 'yellow');
    process.exit(1);
  }

  log('Environment variables: OK', 'green');
  log(`  Access Token: ${accessToken.substring(0, 10)}...${accessToken.substring(accessToken.length - 4)}`, 'green');
  log(`  API Endpoint: ${apiEndpoint}`, 'green');
  console.log();

  // Send test message
  log('Sending test message...', 'yellow');
  console.log();

  try {
    const result = await sendWhatsAppMessage(
      testPhone,
      templateName,
      parameters
    );

    if (result.success) {
      console.log('\n' + '='.repeat(60));
      log('SUCCESS! Message sent successfully', 'green');
      console.log('='.repeat(60));
      log(`Notification ID: ${result.notificationId}`, 'cyan');
      log(`Attempts made: ${result.attemptsMade}`, 'cyan');
      log(`Phone: ${testPhone}`, 'cyan');
      log(`Template: ${templateName}`, 'cyan');
      console.log();
      log('Check your WhatsApp to see the message!', 'green');
      console.log('='.repeat(60) + '\n');
    } else {
      console.log('\n' + '='.repeat(60));
      log('FAILED: Could not send message', 'red');
      console.log('='.repeat(60));
      log(`Error: ${result.error}`, 'red');
      log(`Attempts made: ${result.attemptsMade}`, 'yellow');
      console.log('='.repeat(60) + '\n');

      log('Troubleshooting tips:', 'yellow');
      log('1. Verify WATI_ACCESS_TOKEN is correct in .env.local', 'yellow');
      log('2. Check that template "onboarding_signoff" is approved in Wati dashboard', 'yellow');
      log('3. Ensure phone number is registered on WhatsApp', 'yellow');
      log('4. Check Wati.io dashboard for more details', 'yellow');
      console.log();

      process.exit(1);
    }
  } catch (error: any) {
    log('\nERROR: Test failed with exception', 'red');
    log(error.message, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
main().catch((error) => {
  log('\nFATAL ERROR:', 'red');
  console.error(error);
  process.exit(1);
});
