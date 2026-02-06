/**
 * Admin Config API - Provider API Key
 *
 * POST /api/admin/config/providers/[providerId]/key - Update provider API key
 * DELETE /api/admin/config/providers/[providerId]/key - Remove provider API key
 *
 * @module app/api/admin/config/providers/[providerId]/key/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateProviderApiKey, removeProviderApiKey, invalidateConfigCache, getProviderForClient } from '@/lib/config';
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

    const { apiKey } = await request.json();

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    // TODO: Get actual user ID from session
    const updatedBy = 'admin';

    const result = await updateProviderApiKey(providerId as LLMProvider, apiKey, updatedBy);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update API key' },
        { status: 400 }
      );
    }

    invalidateConfigCache();

    const provider = await getProviderForClient(providerId as LLMProvider);
    return NextResponse.json(provider);
  } catch (error) {
    console.error('Error updating API key:', error);
    return NextResponse.json(
      { error: 'Failed to update API key' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    await removeProviderApiKey(providerId as LLMProvider, updatedBy);
    invalidateConfigCache();

    const provider = await getProviderForClient(providerId as LLMProvider);
    return NextResponse.json(provider);
  } catch (error) {
    console.error('Error removing API key:', error);
    return NextResponse.json(
      { error: 'Failed to remove API key' },
      { status: 500 }
    );
  }
}
