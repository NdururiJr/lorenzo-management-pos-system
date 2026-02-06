/**
 * QR Code Generator Utility
 *
 * Generates QR codes for receipts and order tracking.
 * QR codes can be embedded in PDF receipts and garment tags.
 *
 * @module lib/receipts/qr-generator
 */

import QRCode from 'qrcode';

/**
 * Options for QR code generation
 */
interface QRCodeOptions {
  /** Width/height of the QR code in pixels (default: 200) */
  size?: number;
  /** Error correction level: L (7%), M (15%), Q (25%), H (30%) */
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  /** Margin (quiet zone) in modules (default: 2) */
  margin?: number;
  /** Dark color in hex format (default: '#000000') */
  darkColor?: string;
  /** Light color in hex format (default: '#FFFFFF') */
  lightColor?: string;
}

/**
 * Default options for QR code generation
 */
const DEFAULT_OPTIONS: Required<QRCodeOptions> = {
  size: 200,
  errorCorrectionLevel: 'M',
  margin: 2,
  darkColor: '#000000',
  lightColor: '#FFFFFF',
};

/**
 * Base URL for the customer portal (order tracking)
 * Should be configured via environment variable in production
 */
const getPortalBaseUrl = (): string => {
  // Use environment variable if available
  if (process.env.NEXT_PUBLIC_PORTAL_URL) {
    return process.env.NEXT_PUBLIC_PORTAL_URL;
  }
  // Default to localhost for development
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  // Production default (should be overridden by env var)
  return 'https://lorenzo.example.com';
};

/**
 * Generate a QR code as a data URL (base64 PNG)
 *
 * @param content - The text/URL content to encode in the QR code
 * @param options - Optional configuration for QR code generation
 * @returns Promise<string> - Data URL of the QR code image (base64 PNG)
 *
 * @example
 * ```typescript
 * const qrDataUrl = await generateQRCode('https://example.com/order/123');
 * // Returns: data:image/png;base64,iVBORw0KGgoAAAANS...
 * ```
 */
export async function generateQRCode(
  content: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  try {
    const dataUrl = await QRCode.toDataURL(content, {
      width: mergedOptions.size,
      errorCorrectionLevel: mergedOptions.errorCorrectionLevel,
      margin: mergedOptions.margin,
      color: {
        dark: mergedOptions.darkColor,
        light: mergedOptions.lightColor,
      },
    });

    return dataUrl;
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    throw new Error(`QR code generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate a QR code for order tracking
 *
 * Creates a QR code that links to the customer portal order tracking page.
 *
 * @param orderId - The order ID to generate a tracking QR code for
 * @param options - Optional QR code configuration
 * @returns Promise<string> - Data URL of the QR code image
 *
 * @example
 * ```typescript
 * const trackingQR = await generateOrderTrackingQRCode('ORD-KLM-20241015-0001');
 * // Encodes URL: https://portal.lorenzo.com/portal/orders/ORD-KLM-20241015-0001
 * ```
 */
export async function generateOrderTrackingQRCode(
  orderId: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const baseUrl = getPortalBaseUrl();
  const trackingUrl = `${baseUrl}/portal/orders/${orderId}`;
  return generateQRCode(trackingUrl, options);
}

/**
 * Generate a QR code for a receipt
 *
 * Creates a QR code with receipt-specific data including order tracking URL.
 *
 * @param receiptData - Data to encode in the receipt QR code
 * @param options - Optional QR code configuration
 * @returns Promise<string> - Data URL of the QR code image
 */
export async function generateReceiptQRCode(
  receiptData: {
    orderId: string;
    receiptNumber?: string;
    customerId?: string;
  },
  options: QRCodeOptions = {}
): Promise<string> {
  const baseUrl = getPortalBaseUrl();

  // Create tracking URL with optional receipt reference
  let trackingUrl = `${baseUrl}/portal/orders/${receiptData.orderId}`;

  // Add receipt reference as query param if available
  if (receiptData.receiptNumber) {
    trackingUrl += `?receipt=${encodeURIComponent(receiptData.receiptNumber)}`;
  }

  return generateQRCode(trackingUrl, {
    ...options,
    // Use higher error correction for receipts (may get damaged)
    errorCorrectionLevel: options.errorCorrectionLevel || 'Q',
  });
}

/**
 * Generate a QR code for a garment tag
 *
 * Creates a QR code for individual garment tracking.
 *
 * @param garmentData - Data to encode in the garment tag QR code
 * @param options - Optional QR code configuration
 * @returns Promise<string> - Data URL of the QR code image
 */
export async function generateGarmentTagQRCode(
  garmentData: {
    orderId: string;
    garmentId: string;
    tagNumber?: string;
  },
  options: QRCodeOptions = {}
): Promise<string> {
  const baseUrl = getPortalBaseUrl();

  // Create a compact URL for garment tracking
  const garmentUrl = `${baseUrl}/portal/orders/${garmentData.orderId}?garment=${garmentData.garmentId}`;

  return generateQRCode(garmentUrl, {
    ...options,
    // Smaller size for garment tags
    size: options.size || 100,
    // Higher error correction for physical tags
    errorCorrectionLevel: options.errorCorrectionLevel || 'H',
    // Smaller margin for compact tags
    margin: options.margin || 1,
  });
}

/**
 * Generate a QR code for a voucher
 *
 * Creates a QR code that contains the voucher code for easy scanning.
 *
 * @param voucherCode - The voucher code to encode
 * @param options - Optional QR code configuration
 * @returns Promise<string> - Data URL of the QR code image
 */
export async function generateVoucherQRCode(
  voucherCode: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const baseUrl = getPortalBaseUrl();

  // Create a URL that can be used to apply the voucher
  const voucherUrl = `${baseUrl}/pos?voucher=${encodeURIComponent(voucherCode)}`;

  return generateQRCode(voucherUrl, {
    ...options,
    // Higher error correction for printed vouchers
    errorCorrectionLevel: options.errorCorrectionLevel || 'Q',
  });
}

/**
 * Generate QR code as SVG string
 *
 * @param content - The text/URL content to encode
 * @param options - Optional configuration
 * @returns Promise<string> - SVG string representation of the QR code
 */
export async function generateQRCodeSVG(
  content: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  try {
    const svg = await QRCode.toString(content, {
      type: 'svg',
      width: mergedOptions.size,
      errorCorrectionLevel: mergedOptions.errorCorrectionLevel,
      margin: mergedOptions.margin,
      color: {
        dark: mergedOptions.darkColor,
        light: mergedOptions.lightColor,
      },
    });

    return svg;
  } catch (error) {
    console.error('Failed to generate QR code SVG:', error);
    throw new Error(`QR code SVG generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get the tracking URL for an order (without generating QR code)
 *
 * @param orderId - The order ID
 * @returns string - The tracking URL
 */
export function getOrderTrackingUrl(orderId: string): string {
  const baseUrl = getPortalBaseUrl();
  return `${baseUrl}/portal/orders/${orderId}`;
}
