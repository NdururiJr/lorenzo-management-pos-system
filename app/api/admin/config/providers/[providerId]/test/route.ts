/**
 * Admin Config API - Test Provider Connection
 *
 * POST /api/admin/config/providers/[providerId]/test - Test provider connection
 *
 * @module app/api/admin/config/providers/[providerId]/test/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { testAndUpdateProviderStatus } from '@/lib/config';
import type { LLMProvider } from '@/lib/db/schema';

interface RouteParams {
  params: Promise<{
    providerId: string;
  }>;
}

const VALID_PROVIDERS: LLMProvider[] = ['openai', 'anthropic', 'google', 'local'];

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { providerId } = await params;

    if (!VALID_PROVIDERS.includes(providerId as LLMProvider)) {
      return NextResponse.json(
        { error: 'Invalid provider ID' },
        { status: 400 }
      );
    }

    // TODO: Get actual user ID from session
    const updatedBy = 'admin';

    const result = await testAndUpdateProviderStatus(providerId as LLMProvider, updatedBy);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error testing provider:', error);
    return NextResponse.json(
      { success: false, error: 'Connection test failed' },
      { status: 500 }
    );
  }
}
