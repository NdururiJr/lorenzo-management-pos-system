/**
 * Admin Config API - Providers List
 *
 * GET /api/admin/config/providers - Get all provider configurations
 *
 * @module app/api/admin/config/providers/route
 */

import { NextResponse } from 'next/server';
import { getAllProvidersForClient } from '@/lib/config';

export async function GET() {
  try {
    const providers = await getAllProvidersForClient();
    return NextResponse.json(providers);
  } catch (error) {
    console.error('Error fetching providers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch providers' },
      { status: 500 }
    );
  }
}
