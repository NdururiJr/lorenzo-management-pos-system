/**
 * Biometric Webhook API Endpoint
 *
 * Receives clock events from biometric devices (ZKTeco, Suprema, Hikvision, etc.)
 * and processes them into attendance records.
 *
 * @module app/api/webhooks/biometric/route
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getAdapter,
  getDevice,
  getDeviceByIP,
  getDeviceBySerial,
  getEmployeeByBiometricId,
  recordBiometricEvent,
  processClockEvent,
  updateDeviceHeartbeat,
} from '@/services/biometric';

// Environment variables
const WEBHOOK_SECRET = process.env.BIOMETRIC_WEBHOOK_SECRET;

/**
 * Handle biometric device webhook
 *
 * Devices can identify themselves via:
 * - Query param: ?deviceId=xxx or ?serial=xxx
 * - Header: X-Device-ID or X-Device-Serial
 * - IP address (if configured)
 */
export async function POST(request: NextRequest) {
  try {
    // Get client IP (for device identification)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIP = forwardedFor?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Parse request body
    let payload: unknown;
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      payload = await request.json();
    } else if (contentType.includes('application/xml') || contentType.includes('text/xml')) {
      // For XML payloads (some Hikvision devices)
      const text = await request.text();
      // Simple XML to object conversion - in production, use a proper XML parser
      payload = { rawXml: text };
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      payload = Object.fromEntries(formData.entries());
    } else {
      payload = await request.json().catch(() => ({}));
    }

    // Identify the device
    const deviceIdParam = request.nextUrl.searchParams.get('deviceId');
    const serialParam = request.nextUrl.searchParams.get('serial');
    const deviceIdHeader = request.headers.get('x-device-id');
    const serialHeader = request.headers.get('x-device-serial');

    let device = null;

    // Try to find device by various identifiers
    if (deviceIdParam) {
      device = await getDevice(deviceIdParam);
    } else if (deviceIdHeader) {
      device = await getDevice(deviceIdHeader);
    } else if (serialParam) {
      device = await getDeviceBySerial(serialParam);
    } else if (serialHeader) {
      device = await getDeviceBySerial(serialHeader);
    } else if (clientIP !== 'unknown') {
      device = await getDeviceByIP(clientIP);
    }

    if (!device) {
      console.warn('[Biometric Webhook] Unknown device:', {
        ip: clientIP,
        deviceId: deviceIdParam || deviceIdHeader,
        serial: serialParam || serialHeader,
      });

      return NextResponse.json(
        { error: 'Unknown device', ip: clientIP },
        { status: 401 }
      );
    }

    if (!device.active) {
      return NextResponse.json(
        { error: 'Device is inactive' },
        { status: 403 }
      );
    }

    // Validate webhook signature (if configured)
    const signature = request.headers.get('x-signature') ||
      request.headers.get('x-webhook-signature') ||
      request.headers.get('authorization');

    const adapter = getAdapter(device.vendor);

    if (adapter.validateSignature && WEBHOOK_SECRET) {
      const isValid = adapter.validateSignature(payload, signature || '', WEBHOOK_SECRET);
      if (!isValid) {
        console.warn('[Biometric Webhook] Invalid signature:', { deviceId: device.deviceId });
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    // Parse event data using the appropriate adapter
    const eventData = adapter.parseWebhookPayload(payload);

    if (!eventData.biometricId) {
      console.warn('[Biometric Webhook] Missing biometric ID:', payload);
      return NextResponse.json(
        { error: 'Missing biometric ID in payload' },
        { status: 400 }
      );
    }

    // Find employee by biometric ID
    const employee = await getEmployeeByBiometricId(eventData.biometricId);

    // Record the biometric event (even if employee not found)
    const event = await recordBiometricEvent(
      device.deviceId,
      device.branchId,
      eventData,
      employee?.employeeId
    );

    // Update device heartbeat
    await updateDeviceHeartbeat(device.deviceId);

    // Process the clock event if employee is found
    let processingResult = null;
    if (employee) {
      processingResult = await processClockEvent(event);
    }

    // Log the event
    console.log('[Biometric Webhook] Event processed:', {
      deviceId: device.deviceId,
      branchId: device.branchId,
      biometricId: eventData.biometricId,
      eventType: eventData.eventType,
      employeeId: employee?.employeeId,
      employeeName: employee?.name,
      processed: processingResult?.success ?? false,
      error: processingResult?.error,
    });

    return NextResponse.json({
      success: true,
      eventId: event.eventId,
      deviceId: device.deviceId,
      employeeFound: !!employee,
      employeeName: employee?.name,
      eventType: eventData.eventType,
      processed: processingResult?.success ?? false,
      attendanceId: processingResult?.attendanceId,
      error: processingResult?.error,
    });
  } catch (error) {
    console.error('[Biometric Webhook] Error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development'
          ? (error instanceof Error ? error.message : String(error))
          : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Handle device heartbeat/ping
 */
export async function GET(request: NextRequest) {
  const deviceId = request.nextUrl.searchParams.get('deviceId');

  if (!deviceId) {
    return NextResponse.json(
      { error: 'Missing deviceId parameter' },
      { status: 400 }
    );
  }

  const device = await getDevice(deviceId);

  if (!device) {
    return NextResponse.json(
      { error: 'Device not found' },
      { status: 404 }
    );
  }

  // Update heartbeat
  await updateDeviceHeartbeat(deviceId);

  return NextResponse.json({
    success: true,
    deviceId: device.deviceId,
    branchId: device.branchId,
    status: device.active ? 'active' : 'inactive',
  });
}

/**
 * Handle OPTIONS for CORS
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Device-ID, X-Device-Serial, X-Signature, X-Webhook-Signature, Authorization',
    },
  });
}
