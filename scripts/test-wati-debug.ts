/**
 * Debug Wati.io API - Detailed error logging
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import axios from 'axios';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

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
  log('Wati.io API Debug Test', 'cyan');
  console.log('='.repeat(60) + '\n');

  const accessToken = process.env.WATI_ACCESS_TOKEN;
  const apiEndpoint = process.env.WATI_API_ENDPOINT;

  log(`Access Token: ${accessToken?.substring(0, 10)}...`, 'yellow');
  log(`API Endpoint: ${apiEndpoint}`, 'yellow');
  console.log();

  if (!accessToken) {
    log('ERROR: No access token found', 'red');
    process.exit(1);
  }

  // Test 1: Get templates (to verify connection)
  log('Test 1: Fetching templates...', 'blue');
  try {
    const response = await axios.get(`${apiEndpoint}/api/v1/getMessageTemplates`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    log('✓ Connection successful!', 'green');
    log(`Status: ${response.status}`, 'green');
    log(`Templates found: ${JSON.stringify(response.data, null, 2)}`, 'cyan');
    console.log();
  } catch (error: any) {
    log('✗ Connection failed', 'red');
    log(`Status: ${error.response?.status}`, 'red');
    log(`Error: ${JSON.stringify(error.response?.data, null, 2)}`, 'red');
    console.log();
  }

  // Test 2: Send message
  log('Test 2: Sending message...', 'blue');

  const requestData = {
    whatsappNumber: '254725462859',
    template_name: 'onboarding_signoff',
    broadcast_name: 'Order Notifications',
    parameters: [
      {
        name: 'name',
        value: 'Gachengoh',
      },
    ],
  };

  log(`Request URL: ${apiEndpoint}/api/v1/sendTemplateMessage`, 'yellow');
  log(`Request Data: ${JSON.stringify(requestData, null, 2)}`, 'yellow');
  console.log();

  try {
    const response = await axios.post(
      `${apiEndpoint}/api/v1/sendTemplateMessage`,
      requestData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    log('✓ Message sent successfully!', 'green');
    log(`Status: ${response.status}`, 'green');
    log(`Response: ${JSON.stringify(response.data, null, 2)}`, 'cyan');
  } catch (error: any) {
    log('✗ Message send failed', 'red');
    log(`Status: ${error.response?.status}`, 'red');
    log(`Status Text: ${error.response?.statusText}`, 'red');
    log(`Headers: ${JSON.stringify(error.response?.headers, null, 2)}`, 'yellow');
    log(`Error Data: ${JSON.stringify(error.response?.data, null, 2)}`, 'red');
    log(`Full URL attempted: ${error.config?.url}`, 'yellow');
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

main().catch(console.error);
