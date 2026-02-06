/**
 * Phone Validation API (FR-014)
 *
 * Provides phone number validation endpoint for frontend use.
 *
 * @module app/api/phone/validate
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  validatePhoneNumber,
  getSMSGateway,
  isWhatsAppAvailable,
  SUPPORTED_COUNTRIES,
} from '@/lib/utils/phone-validator';
import type { CountryCode } from 'libphonenumber-js';

/**
 * POST /api/phone/validate
 *
 * Validates a phone number and returns formatting/metadata
 *
 * Request body:
 * - phone: string (required) - Phone number to validate
 * - defaultCountry: string (optional) - Default country code (e.g., 'KE')
 *
 * Response:
 * - valid: boolean
 * - formatted: string (international format)
 * - e164: string (E.164 format for storage)
 * - country: string (country code)
 * - countryCallingCode: string
 * - nationalNumber: string
 * - isMobile: boolean
 * - gateway: string (recommended SMS gateway)
 * - whatsappAvailable: boolean
 * - error: string (if invalid)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, defaultCountry = 'KE' } = body;

    if (!phone) {
      return NextResponse.json(
        { valid: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Validate the phone number
    const result = validatePhoneNumber(phone, defaultCountry as CountryCode);

    if (!result.valid) {
      return NextResponse.json(
        { valid: false, error: result.error },
        { status: 200 }
      );
    }

    // Get additional metadata
    const gateway = getSMSGateway(phone);
    const whatsappAvailable = isWhatsAppAvailable(phone);

    return NextResponse.json({
      valid: true,
      formatted: result.formatted,
      e164: result.e164,
      country: result.country,
      countryCallingCode: result.countryCallingCode,
      nationalNumber: result.nationalNumber,
      isMobile: result.isMobile,
      gateway,
      whatsappAvailable,
    });
  } catch (error) {
    console.error('Error validating phone:', error);
    return NextResponse.json(
      { valid: false, error: 'Failed to validate phone number' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/phone/validate
 *
 * Returns list of supported countries for phone validation
 */
export async function GET() {
  return NextResponse.json({
    countries: SUPPORTED_COUNTRIES,
    defaultCountry: 'KE',
  });
}
