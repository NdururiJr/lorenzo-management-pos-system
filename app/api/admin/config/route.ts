/**
 * Admin Config API - Main Endpoint
 *
 * GET /api/admin/config - Get complete LLM configuration
 *
 * @module app/api/admin/config/route
 */

import { NextResponse } from 'next/server';
import { getAdminConfigState } from '@/lib/config';

export async function GET() {
  try {
    const config = await getAdminConfigState();
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching admin config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch configuration' },
      { status: 500 }
    );
  }
}
