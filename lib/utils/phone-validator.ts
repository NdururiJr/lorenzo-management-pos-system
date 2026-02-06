/**
 * Phone Number Validation Utility (FR-014)
 *
 * Provides international phone number validation using libphonenumber-js.
 * Supports foreign phone numbers while maintaining Kenya as default.
 *
 * @module lib/utils/phone-validator
 */

import {
  parsePhoneNumber,
  isValidPhoneNumber,
  CountryCode,
  PhoneNumber,
  getCountryCallingCode,
} from 'libphonenumber-js';

// ============================================
// TYPES
// ============================================

/**
 * Result of phone number validation
 */
export interface PhoneValidationResult {
  /** Whether the phone number is valid */
  valid: boolean;
  /** International format (+254 712 345 678) */
  formatted?: string;
  /** E.164 format (+254712345678) */
  e164?: string;
  /** Country code (KE, US, UK, etc.) */
  country?: CountryCode;
  /** Country calling code (+254, +1, +44, etc.) */
  countryCallingCode?: string;
  /** National number without country code */
  nationalNumber?: string;
  /** Whether this is a mobile number */
  isMobile?: boolean;
  /** Error message if validation failed */
  error?: string;
}

/**
 * Supported countries with their calling codes
 */
export const SUPPORTED_COUNTRIES: { code: CountryCode; name: string; callingCode: string }[] = [
  { code: 'KE', name: 'Kenya', callingCode: '+254' },
  { code: 'UG', name: 'Uganda', callingCode: '+256' },
  { code: 'TZ', name: 'Tanzania', callingCode: '+255' },
  { code: 'RW', name: 'Rwanda', callingCode: '+250' },
  { code: 'ET', name: 'Ethiopia', callingCode: '+251' },
  { code: 'ZA', name: 'South Africa', callingCode: '+27' },
  { code: 'NG', name: 'Nigeria', callingCode: '+234' },
  { code: 'GH', name: 'Ghana', callingCode: '+233' },
  { code: 'US', name: 'United States', callingCode: '+1' },
  { code: 'GB', name: 'United Kingdom', callingCode: '+44' },
  { code: 'AE', name: 'UAE', callingCode: '+971' },
  { code: 'IN', name: 'India', callingCode: '+91' },
  { code: 'CN', name: 'China', callingCode: '+86' },
  { code: 'DE', name: 'Germany', callingCode: '+49' },
  { code: 'FR', name: 'France', callingCode: '+33' },
];

/** Default country for phone validation */
export const DEFAULT_COUNTRY: CountryCode = 'KE';

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validate and parse a phone number
 *
 * @param phone - Phone number string (can include country code or not)
 * @param defaultCountry - Default country if no country code provided (default: KE)
 * @returns Validation result with formatted number and metadata
 */
export function validatePhoneNumber(
  phone: string,
  defaultCountry: CountryCode = DEFAULT_COUNTRY
): PhoneValidationResult {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Phone number is required' };
  }

  // Clean the input (remove spaces, dashes, parentheses)
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');

  // If number doesn't start with +, try to add country code
  let phoneToValidate = cleaned;
  if (!cleaned.startsWith('+')) {
    // If starts with 0, replace with country code
    if (cleaned.startsWith('0')) {
      try {
        const callingCode = getCountryCallingCode(defaultCountry);
        phoneToValidate = `+${callingCode}${cleaned.substring(1)}`;
      } catch {
        phoneToValidate = cleaned;
      }
    } else {
      // Try adding default country code
      try {
        const callingCode = getCountryCallingCode(defaultCountry);
        phoneToValidate = `+${callingCode}${cleaned}`;
      } catch {
        phoneToValidate = cleaned;
      }
    }
  }

  try {
    // Check if valid first
    if (!isValidPhoneNumber(phoneToValidate)) {
      return { valid: false, error: 'Invalid phone number format' };
    }

    // Parse the number
    const phoneNumber: PhoneNumber = parsePhoneNumber(phoneToValidate);

    if (!phoneNumber.isValid()) {
      return { valid: false, error: 'Phone number is not valid for the specified country' };
    }

    // Get phone type
    const phoneType = phoneNumber.getType();
    const isMobile = phoneType === 'MOBILE' || phoneType === 'FIXED_LINE_OR_MOBILE';

    return {
      valid: true,
      formatted: phoneNumber.formatInternational(),
      e164: phoneNumber.format('E.164'),
      country: phoneNumber.country,
      countryCallingCode: `+${phoneNumber.countryCallingCode}`,
      nationalNumber: phoneNumber.nationalNumber,
      isMobile,
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Failed to validate phone number',
    };
  }
}

/**
 * Check if a phone number is valid (simple boolean check)
 *
 * @param phone - Phone number to validate
 * @param defaultCountry - Default country code
 * @returns True if valid, false otherwise
 */
export function isPhoneValid(
  phone: string,
  defaultCountry: CountryCode = DEFAULT_COUNTRY
): boolean {
  return validatePhoneNumber(phone, defaultCountry).valid;
}

/**
 * Format a phone number to international format
 *
 * @param phone - Phone number to format
 * @param defaultCountry - Default country code
 * @returns Formatted phone number or original if invalid
 */
export function formatPhoneNumber(
  phone: string,
  defaultCountry: CountryCode = DEFAULT_COUNTRY
): string {
  const result = validatePhoneNumber(phone, defaultCountry);
  return result.formatted || phone;
}

/**
 * Format a phone number to E.164 format (for storage)
 *
 * @param phone - Phone number to format
 * @param defaultCountry - Default country code
 * @returns E.164 formatted number or original if invalid
 */
export function formatPhoneE164(
  phone: string,
  defaultCountry: CountryCode = DEFAULT_COUNTRY
): string {
  const result = validatePhoneNumber(phone, defaultCountry);
  return result.e164 || phone;
}

/**
 * Get the country from a phone number
 *
 * @param phone - Phone number
 * @returns Country code or undefined if cannot determine
 */
export function getPhoneCountry(phone: string): CountryCode | undefined {
  const result = validatePhoneNumber(phone);
  return result.country;
}

/**
 * Check if phone number is from Kenya
 *
 * @param phone - Phone number to check
 * @returns True if Kenyan number
 */
export function isKenyanNumber(phone: string): boolean {
  const result = validatePhoneNumber(phone, 'KE');
  return result.valid && result.country === 'KE';
}

/**
 * Check if phone number is international (non-Kenyan)
 *
 * @param phone - Phone number to check
 * @returns True if international number
 */
export function isInternationalNumber(phone: string): boolean {
  const result = validatePhoneNumber(phone);
  return result.valid && result.country !== 'KE';
}

/**
 * Get country information from phone number
 *
 * @param phone - Phone number
 * @returns Country information or null
 */
export function getCountryFromPhone(phone: string): {
  code: CountryCode;
  name: string;
  callingCode: string;
} | null {
  const result = validatePhoneNumber(phone);
  if (!result.valid || !result.country) return null;

  const country = SUPPORTED_COUNTRIES.find((c) => c.code === result.country);
  if (country) return country;

  // Return basic info for unsupported countries
  return {
    code: result.country,
    name: result.country,
    callingCode: result.countryCallingCode || '',
  };
}

// ============================================
// KENYAN PHONE SPECIFIC HELPERS
// ============================================

/**
 * Kenya mobile prefixes
 */
const KENYA_MOBILE_PREFIXES = ['7', '1'];

/**
 * Validate Kenya phone number specifically
 * More strict validation for local numbers
 *
 * @param phone - Phone number to validate
 * @returns Validation result
 */
export function validateKenyanPhone(phone: string): PhoneValidationResult {
  const result = validatePhoneNumber(phone, 'KE');

  if (!result.valid) return result;
  if (result.country !== 'KE') {
    return { valid: false, error: 'Not a Kenyan phone number' };
  }

  // Check if it's a valid mobile prefix
  const nationalNumber = result.nationalNumber || '';
  const firstDigit = nationalNumber.charAt(0);

  if (!KENYA_MOBILE_PREFIXES.includes(firstDigit)) {
    return { valid: false, error: 'Invalid Kenyan mobile number prefix' };
  }

  // Kenyan mobile numbers should be 9 digits (after country code)
  if (nationalNumber.length !== 9) {
    return { valid: false, error: 'Kenyan mobile numbers must be 9 digits' };
  }

  return result;
}

// ============================================
// SMS/WHATSAPP GATEWAY HELPERS
// ============================================

/**
 * SMS gateway type based on phone number country
 */
export type SMSGateway = 'wati_kenya' | 'wati_international' | 'twilio' | 'africas_talking';

/**
 * Determine the best SMS/WhatsApp gateway for a phone number
 *
 * @param phone - Phone number
 * @returns Recommended gateway
 */
export function getSMSGateway(phone: string): SMSGateway {
  const result = validatePhoneNumber(phone);

  if (!result.valid) return 'wati_kenya'; // Default

  // Kenya - use Wati.io Kenya
  if (result.country === 'KE') return 'wati_kenya';

  // East Africa - use Africa's Talking
  const eastAfrica: CountryCode[] = ['UG', 'TZ', 'RW', 'ET'];
  if (result.country && eastAfrica.includes(result.country)) return 'africas_talking';

  // Other African countries
  const otherAfrica: CountryCode[] = ['ZA', 'NG', 'GH'];
  if (result.country && otherAfrica.includes(result.country)) return 'africas_talking';

  // International - use Twilio or Wati International
  return 'wati_international';
}

/**
 * Check if WhatsApp is likely available for this number
 * (Most mobile numbers support WhatsApp, but not all countries)
 *
 * @param phone - Phone number
 * @returns Whether WhatsApp is likely available
 */
export function isWhatsAppAvailable(phone: string): boolean {
  const result = validatePhoneNumber(phone);
  if (!result.valid) return false;

  // WhatsApp requires mobile numbers
  return result.isMobile === true;
}

// ============================================
// DISPLAY HELPERS
// ============================================

/**
 * Format phone number for display (shorter version)
 *
 * @param phone - Phone number
 * @returns Display-friendly format
 */
export function formatPhoneForDisplay(phone: string): string {
  const result = validatePhoneNumber(phone);

  if (!result.valid) return phone;

  // For Kenyan numbers, show in local format
  if (result.country === 'KE') {
    return `0${result.nationalNumber}`;
  }

  // For international, show full format
  return result.formatted || phone;
}

/**
 * Mask phone number for privacy
 *
 * @param phone - Phone number
 * @returns Masked phone number (e.g., +254 7XX XXX X78)
 */
export function maskPhoneNumber(phone: string): string {
  const result = validatePhoneNumber(phone);

  if (!result.valid || !result.e164) return '***';

  const e164 = result.e164;
  // Keep first 4 and last 2 digits visible
  const visible = e164.slice(0, 4) + ' XXX XXX X' + e164.slice(-2);
  return visible;
}
