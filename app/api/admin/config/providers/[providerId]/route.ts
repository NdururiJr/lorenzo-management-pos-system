/**
 * Admin Config API - Single Provider
 *
 * GET /api/admin/config/providers/[providerId] - Get provider config
 * PATCH /api/admin/config/providers/[providerId] - Update provider config
 *
 * @module app/api/admin/config/providers/[providerId]/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getProviderForClient, invalidateConfigCache } from '@/lib/config';
import { updateProvider } from '@/lib/db/config';
import type { LLMProvider } from '@/lib/db/schema';

interface RouteParams {
  params: Promise<{
    providerId: string;
  }>;
}

const VALID_PROVIDERS: LLMProvider[] = ['openai', 'anthropic', 'google', 'local'];

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { providerId } = await params;

    if (!VALID_PROVIDERS.includes(providerId as LLMProvider)) {
      return NextResponse.json(
        { error: 'Invalid provider ID' },
        { status: 400 }
      );
    }

    const provider = await getProviderForClient(providerId as LLMProvider);
    return NextResponse.json(provider);
  } catch (error) {
    console.error('Error fetching provider:', error);
    return NextResponse.json(
      { error: 'Failed to fetch provider' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { providerId } = await params;

    if (!VALID_PROVIDERS.includes(providerId as LLMProvider)) {
      return NextResponse.json(
        { error: 'Invalid provider ID' },
        { status: 400 }
      );
    }

    const updates = await request.json();

    // TODO: Get actual user ID from session
    const updatedBy = 'admin';

    // Don't allow updating encrypted API key through this endpoint
    delete updates.encryptedApiKey;
    delete updates.keyIV;
    delete updates.keyAuthTag;

    await updateProvider(providerId as LLMProvider, updates, updatedBy);
    invalidateConfigCache();

    const provider = await getProviderForClient(providerId as LLMProvider);
    return NextResponse.json(provider);
  } catch (error) {
    console.error('Error updating provider:', error);
    return NextResponse.json(
      { error: 'Failed to update provider' },
      { status: 500 }
    );
  }
}
