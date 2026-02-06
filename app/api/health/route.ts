/**
 * Health Check API Endpoint
 *
 * Provides system health status for monitoring and load balancers.
 * Returns service availability and basic diagnostics.
 *
 * @module app/api/health
 */

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

/**
 * Check Firebase Firestore connectivity
 */
async function checkFirestore(): Promise<'ok' | 'error'> {
  try {
    // Simple read operation to verify connection
    await adminDb.collection('_health').doc('check').get();
    return 'ok';
  } catch {
    return 'error';
  }
}

/**
 * GET /api/health
 *
 * Returns system health status
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // Check services
    const firestoreStatus = await checkFirestore();

    const checks = {
      status: firestoreStatus === 'ok' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      responseTime: Date.now() - startTime,
      services: {
        firestore: firestoreStatus,
      },
    };

    const allHealthy = Object.values(checks.services).every((s) => s === 'ok');

    return NextResponse.json(checks, {
      status: allHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Health check error:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        responseTime: Date.now() - startTime,
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}
