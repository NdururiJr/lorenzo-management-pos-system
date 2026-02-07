/**
 * Garment Tag Generation System
 *
 * Generates printable garment tags with QR codes for tracking.
 * V2.0: Auto-generated tag numbers, batch printing support.
 *
 * @module lib/printing/garment-tag
 */

import QRCode from 'qrcode';

/**
 * Garment tag data structure
 */
export interface GarmentTagData {
  /** Unique tag number */
  tagNumber: string;
  /** Order ID this garment belongs to */
  orderId: string;
  /** Garment ID within the order */
  garmentId: string;
  /** Garment type (Shirt, Pants, etc.) */
  garmentType: string;
  /** Garment color */
  color: string;
  /** Brand name or "No Brand" */
  brand: string;
  /** Category (Adult/Children) */
  category?: 'Adult' | 'Children';
  /** Services requested */
  services: string[];
  /** Special instructions */
  specialInstructions?: string;
  /** Customer name */
  customerName: string;
  /** Branch ID */
  branchId: string;
  /** Date received */
  dateReceived: Date;
  /** QR code data URL */
  qrCodeDataUrl?: string;
}

/**
 * Tag generation options
 */
export interface TagGenerationOptions {
  /** Include QR code */
  includeQr: boolean;
  /** QR code size in pixels */
  qrSize?: number;
  /** Tag size: small (1x2"), medium (2x3"), large (3x4") */
  tagSize: 'small' | 'medium' | 'large';
  /** Include special instructions */
  includeInstructions?: boolean;
  /** Include services list */
  includeServices?: boolean;
}

/**
 * Default tag generation options
 */
export const DEFAULT_TAG_OPTIONS: TagGenerationOptions = {
  includeQr: true,
  qrSize: 100,
  tagSize: 'medium',
  includeInstructions: true,
  includeServices: true,
};

/**
 * Tag size dimensions in pixels (at 96 DPI)
 */
export const TAG_DIMENSIONS: Record<string, { width: number; height: number }> = {
  small: { width: 192, height: 96 },   // 2x1 inches
  medium: { width: 288, height: 192 }, // 3x2 inches
  large: { width: 384, height: 288 },  // 4x3 inches
};

/**
 * Generate a unique tag number
 *
 * Format: TAG-[BRANCH]-[DATE]-[SEQUENCE]
 * Example: TAG-KIL-20251201-0001
 */
export function generateTagNumber(
  branchId: string,
  sequence: number,
  date: Date = new Date()
): string {
  const branchCode = branchId.substring(0, 3).toUpperCase();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const seqStr = sequence.toString().padStart(4, '0');
  return `TAG-${branchCode}-${dateStr}-${seqStr}`;
}

/**
 * Generate QR code data URL for a garment
 *
 * The QR code contains a URL to track the garment
 */
export async function generateGarmentQrCode(
  tagData: GarmentTagData,
  baseUrl: string = process.env.NEXT_PUBLIC_APP_URL || 'https://lorenzo-dry-cleaners.com'
): Promise<string> {
  const trackingUrl = `${baseUrl}/track/${tagData.orderId}?garment=${tagData.garmentId}`;

  try {
    const qrCodeDataUrl = await QRCode.toDataURL(trackingUrl, {
      width: 150,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    throw new Error('Failed to generate QR code for garment tag');
  }
}

/**
 * Generate HTML for a single garment tag
 */
export async function generateTagHtml(
  tagData: GarmentTagData,
  options: TagGenerationOptions = DEFAULT_TAG_OPTIONS
): Promise<string> {
  const dimensions = TAG_DIMENSIONS[options.tagSize];
  let qrCodeDataUrl = '';

  if (options.includeQr) {
    qrCodeDataUrl = await generateGarmentQrCode(tagData);
  }

  const formattedDate = tagData.dateReceived.toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const servicesText = tagData.services.join(', ');
  const qrSize = options.qrSize || 80;

  return `
    <div class="garment-tag" style="
      width: ${dimensions.width}px;
      height: ${dimensions.height}px;
      border: 1px solid #000;
      padding: 8px;
      font-family: 'Arial', sans-serif;
      font-size: ${options.tagSize === 'small' ? '8px' : options.tagSize === 'medium' ? '10px' : '12px'};
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      background: #fff;
      page-break-inside: avoid;
    ">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
        <div style="font-weight: bold; font-size: ${options.tagSize === 'small' ? '10px' : '14px'};">
          Lorenzo DC
        </div>
        <div style="text-align: right; font-size: ${options.tagSize === 'small' ? '7px' : '9px'};">
          ${formattedDate}
        </div>
      </div>

      <div style="display: flex; gap: 8px; flex: 1;">
        ${options.includeQr ? `
          <div style="flex-shrink: 0;">
            <img src="${qrCodeDataUrl}" width="${qrSize}" height="${qrSize}" style="display: block;" />
          </div>
        ` : ''}

        <div style="flex: 1; overflow: hidden;">
          <div style="font-weight: bold; font-size: ${options.tagSize === 'small' ? '9px' : '11px'}; margin-bottom: 2px;">
            ${tagData.tagNumber}
          </div>
          <div style="margin-bottom: 2px;">
            <strong>Order:</strong> ${tagData.orderId}
          </div>
          <div style="margin-bottom: 2px;">
            <strong>Item:</strong> ${tagData.garmentType} (${tagData.color})
          </div>
          ${tagData.brand !== 'No Brand' ? `
            <div style="margin-bottom: 2px;">
              <strong>Brand:</strong> ${tagData.brand}
            </div>
          ` : ''}
          ${tagData.category ? `
            <div style="margin-bottom: 2px;">
              <strong>Cat:</strong> ${tagData.category}
            </div>
          ` : ''}
          ${options.includeServices && servicesText ? `
            <div style="margin-bottom: 2px; font-size: ${options.tagSize === 'small' ? '7px' : '8px'};">
              <strong>Svc:</strong> ${servicesText}
            </div>
          ` : ''}
        </div>
      </div>

      ${options.includeInstructions && tagData.specialInstructions ? `
        <div style="
          border-top: 1px dashed #000;
          padding-top: 4px;
          margin-top: 4px;
          font-size: ${options.tagSize === 'small' ? '7px' : '8px'};
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        ">
          <strong>Note:</strong> ${tagData.specialInstructions}
        </div>
      ` : ''}

      <div style="
        text-align: center;
        font-size: ${options.tagSize === 'small' ? '6px' : '7px'};
        color: #666;
        margin-top: auto;
        padding-top: 2px;
      ">
        ${tagData.customerName}
      </div>
    </div>
  `;
}

/**
 * Generate HTML for batch tag printing
 */
export async function generateBatchTagsHtml(
  tags: GarmentTagData[],
  options: TagGenerationOptions = DEFAULT_TAG_OPTIONS
): Promise<string> {
  const tagsHtml = await Promise.all(
    tags.map(tag => generateTagHtml(tag, options))
  );

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Garment Tags - Lorenzo Dry Cleaners</title>
      <style>
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            margin: 0;
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
        }

        body {
          font-family: Arial, sans-serif;
          background: #f5f5f5;
          padding: 20px;
          margin: 0;
        }

        .print-header {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid #ddd;
        }

        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          justify-content: flex-start;
          background: #fff;
          padding: 20px;
          border-radius: 8px;
        }

        .garment-tag {
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .print-controls {
          margin-bottom: 20px;
          text-align: center;
        }

        .print-btn {
          background: #000;
          color: #fff;
          border: none;
          padding: 12px 24px;
          font-size: 16px;
          cursor: pointer;
          border-radius: 4px;
          margin: 0 8px;
        }

        .print-btn:hover {
          background: #333;
        }

        .tag-count {
          color: #666;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="print-header no-print">
        <h1>Lorenzo Dry Cleaners - Garment Tags</h1>
        <div class="tag-count">Total Tags: ${tags.length}</div>
      </div>

      <div class="print-controls no-print">
        <button class="print-btn" onclick="window.print()">Print Tags</button>
        <button class="print-btn" onclick="window.close()">Close</button>
      </div>

      <div class="tags-container">
        ${tagsHtml.join('\n')}
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate tag data from order and garment information
 */
export function createTagDataFromGarment(
  orderId: string,
  garment: {
    garmentId: string;
    type: string;
    color: string;
    brand?: string;
    noBrand?: boolean;
    category?: 'Adult' | 'Children';
    services: string[];
    specialInstructions?: string;
    tagNumber?: string;
  },
  customerName: string,
  branchId: string,
  dateReceived: Date,
  tagSequence: number
): GarmentTagData {
  return {
    tagNumber: garment.tagNumber || generateTagNumber(branchId, tagSequence, dateReceived),
    orderId,
    garmentId: garment.garmentId,
    garmentType: garment.type,
    color: garment.color,
    brand: garment.noBrand ? 'No Brand' : (garment.brand || 'No Brand'),
    category: garment.category,
    services: garment.services,
    specialInstructions: garment.specialInstructions,
    customerName,
    branchId,
    dateReceived,
  };
}

/**
 * Open print dialog for tags
 */
export function printTags(htmlContent: string): void {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}

/**
 * Generate tags for all garments in an order
 */
export async function generateOrderTags(
  orderId: string,
  garments: Array<{
    garmentId: string;
    type: string;
    color: string;
    brand?: string;
    noBrand?: boolean;
    category?: 'Adult' | 'Children';
    services: string[];
    specialInstructions?: string;
    tagNumber?: string;
  }>,
  customerName: string,
  branchId: string,
  dateReceived: Date,
  options: TagGenerationOptions = DEFAULT_TAG_OPTIONS
): Promise<string> {
  const tagDataList = garments.map((garment, index) =>
    createTagDataFromGarment(
      orderId,
      garment,
      customerName,
      branchId,
      dateReceived,
      index + 1
    )
  );

  return generateBatchTagsHtml(tagDataList, options);
}
