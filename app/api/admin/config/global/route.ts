/**
 * Admin Config API - Global Settings
 *
 * GET /api/admin/config/global - Get global LLM settings
 * PATCH /api/admin/config/global - Update global LLM settings
 *
 * @module app/api/admin/config/global/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getGlobalLLMConfig, updateGlobalLLMConfig } from '@/lib/db/config';
import { invalidateConfigCache } from '@/lib/config';

export async function GET() {
  try {
    const config = await getGlobalLLMConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching global config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch global configuration' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const updates = await request.json();

    // TODO: Get actual user ID from session
    const updatedBy = 'admin';

    await updateGlobalLLMConfig(updates, updatedBy);
    invalidateConfigCache();

    const config = await getGlobalLLMConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error updating global config:', error);
    return NextResponse.json(
      { error: 'Failed to update global configuration' },
      { status: 500 }
    );
  }
}
