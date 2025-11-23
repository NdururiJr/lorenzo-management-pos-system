/**
 * Test Wati API without instance ID in URL
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import axios from 'axios';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  const accessToken = process.env.WATI_ACCESS_TOKEN;

  log('\nTesting WITHOUT instance ID in URL path...', 'cyan');
  log('Using base URL: https://live-server.wati.io', 'yellow');
  console.log();

  try {
    const response = await axios.get(`https://live-server.wati.io/api/v1/getMessageTemplates`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    log('✓ SUCCESS! Connection works WITHOUT instance ID in URL', 'green');
    log(`Templates: ${JSON.stringify(response.data, null, 2)}`, 'cyan');
  } catch (error: any) {
    log('✗ Failed without instance ID', 'red');
    log(`Status: ${error.response?.status}`, 'red');
  }

  console.log('\n' + '='.repeat(60) + '\n');

  log('Testing WITH instance ID in URL path...', 'cyan');
  log('Using base URL: https://live-server.wati.io/1051875', 'yellow');
  console.log();

  try {
    const response = await axios.get(`https://live-server.wati.io/1051875/api/v1/getMessageTemplates`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    log('✓ SUCCESS! Connection works WITH instance ID in URL', 'green');
    log(`Templates: ${JSON.stringify(response.data, null, 2)}`, 'cyan');
  } catch (error: any) {
    log('✗ Failed with instance ID', 'red');
    log(`Status: ${error.response?.status}`, 'red');
  }
}

main().catch(console.error);
