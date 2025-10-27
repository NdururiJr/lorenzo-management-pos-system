/**
 * PDF Receipt Generator
 *
 * Generates professional PDF receipts for orders using jsPDF.
 *
 * @module lib/receipts/pdf-generator
 */

import jsPDF from 'jspdf';
import {
  RECEIPT_CONFIG,
  formatDate,
  formatDateOnly,
  formatPrice,
  formatPhoneNumber,
  getStatusText,
  getPaymentMethodText,
  calculateOrderTotals,
} from './receipt-template';

/**
 * Generate PDF receipt for an order
 */
export function generateReceiptPDF(order: any, customer: any): jsPDF {
  const doc = new jsPDF();
  const { margins, fonts, colors, company } = RECEIPT_CONFIG;

  let yPos = margins.top;

  // Helper function to add text
  const addText = (
    text: string,
    x: number,
    y: number,
    fontSize: number = fonts.body,
    color: number[] = colors.primary,
    align: 'left' | 'center' | 'right' = 'left'
  ) => {
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(text, x, y, { align });
  };

  // Helper function to add line
  const addLine = (y: number, color: number[] = colors.light) => {
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.line(margins.left, y, 210 - margins.right, y);
  };

  // ========== HEADER ==========
  // Company name
  addText(company.name, 105, yPos, fonts.header, colors.primary, 'center');
  yPos += 8;

  // Company details
  addText(company.address, 105, yPos, fonts.small, colors.secondary, 'center');
  yPos += 4;
  addText(`Phone: ${company.phone}`, 105, yPos, fonts.small, colors.secondary, 'center');
  yPos += 4;
  addText(company.email, 105, yPos, fonts.small, colors.secondary, 'center');
  yPos += 8;

  // Divider line
  addLine(yPos);
  yPos += 8;

  // ========== RECEIPT TITLE ==========
  addText('RECEIPT', 105, yPos, fonts.subheader, colors.primary, 'center');
  yPos += 8;

  // ========== ORDER INFORMATION ==========
  const leftCol = margins.left;
  const rightCol = 105;

  // Left column
  addText('Order ID:', leftCol, yPos, fonts.body, colors.secondary);
  addText(order.orderId || 'N/A', leftCol + 30, yPos, fonts.body, colors.primary);
  yPos += 6;

  addText('Date:', leftCol, yPos, fonts.body, colors.secondary);
  addText(formatDate(order.createdAt), leftCol + 30, yPos, fonts.body, colors.primary);
  yPos += 6;

  addText('Status:', leftCol, yPos, fonts.body, colors.secondary);
  addText(getStatusText(order.status), leftCol + 30, yPos, fonts.body, colors.primary);
  yPos += 6;

  // Reset for right column
  yPos -= 18; // Go back up to align with left column

  // Right column
  addText('Customer:', rightCol, yPos, fonts.body, colors.secondary);
  addText(customer?.name || 'N/A', rightCol + 30, yPos, fonts.body, colors.primary);
  yPos += 6;

  addText('Phone:', rightCol, yPos, fonts.body, colors.secondary);
  addText(formatPhoneNumber(customer?.phoneNumber), rightCol + 30, yPos, fonts.body, colors.primary);
  yPos += 6;

  if (order.paymentMethod) {
    addText('Payment:', rightCol, yPos, fonts.body, colors.secondary);
    addText(
      getPaymentMethodText(order.paymentMethod),
      rightCol + 30,
      yPos,
      fonts.body,
      colors.primary
    );
    yPos += 6;
  }

  yPos += 4;

  // Divider line
  addLine(yPos);
  yPos += 8;

  // ========== ITEMS TABLE ==========
  addText('ITEMS', 105, yPos, fonts.subheader, colors.primary, 'center');
  yPos += 6;

  // Table header
  const tableLeft = margins.left;
  const tableWidth = 210 - margins.left - margins.right;

  doc.setFillColor(240, 240, 240);
  doc.rect(tableLeft, yPos - 4, tableWidth, 8, 'F');

  addText('#', tableLeft + 2, yPos + 2, fonts.body, colors.primary);
  addText('Item Description', tableLeft + 10, yPos + 2, fonts.body, colors.primary);
  addText('Services', tableLeft + 80, yPos + 2, fonts.body, colors.primary);
  addText('Price', 210 - margins.right - 2, yPos + 2, fonts.body, colors.primary, 'right');
  yPos += 8;

  // Table rows
  const items = order.items || order.garments || [];
  items.forEach((item: any, index: number) => {
    // Item number
    addText(`${index + 1}`, tableLeft + 2, yPos + 2, fonts.body, colors.primary);

    // Item description
    const description = `${item.type || item.garmentType || 'Item'} - ${item.color || 'N/A'}${
      item.brand ? ` (${item.brand})` : ''
    }`;
    addText(description, tableLeft + 10, yPos + 2, fonts.body, colors.primary);

    // Services
    const services = Array.isArray(item.services)
      ? item.services.join(', ')
      : item.service || 'Standard';
    addText(services, tableLeft + 80, yPos + 2, fonts.small, colors.secondary);

    // Price
    addText(
      formatPrice(item.price),
      210 - margins.right - 2,
      yPos + 2,
      fonts.body,
      colors.primary,
      'right'
    );

    yPos += 6;

    // Add special instructions if present
    if (item.specialInstructions) {
      addText(
        `Note: ${item.specialInstructions}`,
        tableLeft + 10,
        yPos + 2,
        fonts.small,
        colors.secondary
      );
      yPos += 5;
    }
  });

  yPos += 4;

  // Divider line
  addLine(yPos);
  yPos += 6;

  // ========== TOTALS ==========
  const totals = calculateOrderTotals(order);
  const totalsLeft = 120;

  // Subtotal
  addText('Subtotal:', totalsLeft, yPos, fonts.body, colors.secondary);
  addText(
    formatPrice(totals.subtotal),
    210 - margins.right - 2,
    yPos,
    fonts.body,
    colors.primary,
    'right'
  );
  yPos += 6;

  // Tax (if applicable)
  if (totals.tax > 0) {
    addText('Tax:', totalsLeft, yPos, fonts.body, colors.secondary);
    addText(
      formatPrice(totals.tax),
      210 - margins.right - 2,
      yPos,
      fonts.body,
      colors.primary,
      'right'
    );
    yPos += 6;
  }

  // Discount (if applicable)
  if (totals.discount > 0) {
    addText('Discount:', totalsLeft, yPos, fonts.body, colors.secondary);
    addText(
      `- ${formatPrice(totals.discount)}`,
      210 - margins.right - 2,
      yPos,
      fonts.body,
      colors.primary,
      'right'
    );
    yPos += 6;
  }

  yPos += 2;

  // Total (bold/larger)
  doc.setFont('helvetica', 'bold');
  addText('TOTAL:', totalsLeft, yPos, fonts.subheader, colors.primary);
  addText(
    formatPrice(totals.total),
    210 - margins.right - 2,
    yPos,
    fonts.subheader,
    colors.primary,
    'right'
  );
  doc.setFont('helvetica', 'normal');
  yPos += 8;

  // Amount paid
  addText('Amount Paid:', totalsLeft, yPos, fonts.body, colors.secondary);
  addText(
    formatPrice(totals.paid),
    210 - margins.right - 2,
    yPos,
    fonts.body,
    colors.primary,
    'right'
  );
  yPos += 6;

  // Balance (if any)
  if (totals.balance > 0) {
    addText('Balance Due:', totalsLeft, yPos, fonts.body, colors.secondary);
    addText(
      formatPrice(totals.balance),
      210 - margins.right - 2,
      yPos,
      fonts.body,
      [255, 0, 0], // Red for balance
      'right'
    );
    yPos += 6;
  }

  yPos += 8;

  // ========== ADDITIONAL INFORMATION ==========
  if (order.estimatedCompletion) {
    addLine(yPos);
    yPos += 6;

    addText('Estimated Completion:', margins.left, yPos, fonts.body, colors.secondary);
    addText(
      formatDateOnly(order.estimatedCompletion),
      margins.left + 55,
      yPos,
      fonts.body,
      colors.primary
    );
    yPos += 8;
  }

  if (order.notes) {
    addText('Notes:', margins.left, yPos, fonts.body, colors.secondary);
    yPos += 5;
    addText(order.notes, margins.left, yPos, fonts.small, colors.secondary);
    yPos += 8;
  }

  // ========== FOOTER ==========
  yPos = 280; // Position near bottom

  addLine(yPos - 4);

  addText(
    'Thank you for choosing Lorenzo Dry Cleaners!',
    105,
    yPos,
    fonts.body,
    colors.secondary,
    'center'
  );
  yPos += 5;

  addText(
    'For inquiries, please contact us at the details above.',
    105,
    yPos,
    fonts.small,
    colors.secondary,
    'center'
  );
  yPos += 4;

  addText(
    `Generated on: ${formatDate(new Date())}`,
    105,
    yPos,
    fonts.footer,
    colors.light,
    'center'
  );

  return doc;
}

/**
 * Download receipt PDF to device
 */
export function downloadReceipt(order: any, customer: any): void {
  const pdf = generateReceiptPDF(order, customer);
  const filename = `receipt-${order.orderId}.pdf`;
  pdf.save(filename);
}

/**
 * Generate receipt as Blob (for email attachments)
 */
export function generateReceiptBlob(order: any, customer: any): Blob {
  const pdf = generateReceiptPDF(order, customer);
  return pdf.output('blob');
}

/**
 * Generate receipt as base64 string
 */
export function generateReceiptBase64(order: any, customer: any): string {
  const pdf = generateReceiptPDF(order, customer);
  return pdf.output('dataurlstring');
}

/**
 * Open receipt in new window for printing
 */
export function printReceipt(order: any, customer: any): void {
  const pdf = generateReceiptPDF(order, customer);
  const pdfBlob = pdf.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);

  const printWindow = window.open(pdfUrl);
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}
