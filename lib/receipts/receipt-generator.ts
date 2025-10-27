/**
 * Receipt PDF Generator
 *
 * This service generates PDF receipts for orders using jsPDF.
 *
 * @module lib/receipts/receipt-generator
 */

import jsPDF from 'jspdf';
import { getOrder } from '../db/orders';
import { getCustomer } from '../db/customers';
import { getTransactionsByOrder } from '../db/transactions';

/**
 * Company information for receipts
 */
const COMPANY_INFO = {
  name: 'LORENZO DRY CLEANERS',
  address: 'Kilimani, Nairobi',
  phone: '+254 700 075 810', // TODO: Replace with actual phone
  email: 'info@lorenzo-dry-cleaners.com',
  website: 'www.lorenzo-dry-cleaners.com',
};

/**
 * Format currency in KES
 */
function formatCurrency(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format date for receipt
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Generate receipt PDF for an order
 *
 * @param orderId - Order ID
 * @returns PDF blob
 */
export async function generateReceipt(orderId: string): Promise<Blob> {
  try {
    // Fetch order, customer, and transaction data
    const order = await getOrder(orderId);
    const customer = await getCustomer(order.customerId);
    const transactions = await getTransactionsByOrder(orderId);

    // Create PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Company Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(COMPANY_INFO.name, pageWidth / 2, yPos, { align: 'center' });

    yPos += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(COMPANY_INFO.address, pageWidth / 2, yPos, { align: 'center' });

    yPos += 5;
    doc.text(
      `Tel: ${COMPANY_INFO.phone}  |  Email: ${COMPANY_INFO.email}`,
      pageWidth / 2,
      yPos,
      { align: 'center' }
    );

    // Divider line
    yPos += 8;
    doc.setLineWidth(0.5);
    doc.line(20, yPos, pageWidth - 20, yPos);

    // Receipt Title
    yPos += 10;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('RECEIPT', pageWidth / 2, yPos, { align: 'center' });

    // Order Information
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Order ID: ${order.orderId}`, 20, yPos);

    yPos += 6;
    doc.text(`Date: ${formatDate(order.createdAt.toDate())}`, 20, yPos);

    // Divider line
    yPos += 8;
    doc.setLineWidth(0.3);
    doc.line(20, yPos, pageWidth - 20, yPos);

    // Customer Information
    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Customer:', 20, yPos);

    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${customer.name}`, 20, yPos);

    yPos += 6;
    doc.text(`Phone: ${customer.phone}`, 20, yPos);

    // Divider line
    yPos += 8;
    doc.line(20, yPos, pageWidth - 20, yPos);

    // Items Header
    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('ITEMS:', 20, yPos);

    yPos += 8;
    doc.setFont('helvetica', 'normal');

    // Items List
    order.garments.forEach((garment, index) => {
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.text(`${index + 1}. ${garment.type} (${garment.color})`, 25, yPos);
      yPos += 5;
      doc.text(`   Services: ${garment.services.join(', ')}`, 25, yPos);
      yPos += 5;
      doc.text(formatCurrency(garment.price), pageWidth - 40, yPos - 5);

      if (garment.specialInstructions) {
        yPos += 5;
        doc.setFontSize(9);
        doc.text(
          `   Note: ${garment.specialInstructions}`,
          25,
          yPos,
          { maxWidth: pageWidth - 70 }
        );
        doc.setFontSize(10);
      }

      yPos += 8;
    });

    // Divider line
    yPos += 2;
    doc.line(20, yPos, pageWidth - 20, yPos);

    // Totals
    yPos += 8;
    doc.setFont('helvetica', 'normal');

    // Subtotal
    doc.text('Subtotal:', pageWidth - 70, yPos);
    doc.text(formatCurrency(order.totalAmount), pageWidth - 40, yPos, {
      align: 'right',
    });

    yPos += 6;
    doc.text('Tax (0%):', pageWidth - 70, yPos);
    doc.text(formatCurrency(0), pageWidth - 40, yPos, { align: 'right' });

    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Total:', pageWidth - 70, yPos);
    doc.text(formatCurrency(order.totalAmount), pageWidth - 40, yPos, {
      align: 'right',
    });

    // Payment Information
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // Calculate total paid from transactions
    const totalPaid = transactions
      .filter((t) => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = order.totalAmount - totalPaid;

    doc.text('Paid:', pageWidth - 70, yPos);
    doc.text(formatCurrency(totalPaid), pageWidth - 40, yPos, {
      align: 'right',
    });

    yPos += 6;
    doc.text('Balance:', pageWidth - 70, yPos);
    doc.text(formatCurrency(balance), pageWidth - 40, yPos, { align: 'right' });

    // Payment method
    if (transactions.length > 0) {
      yPos += 6;
      const paymentMethods = transactions
        .map((t) => t.method.toUpperCase())
        .join(', ');
      doc.text(`Payment Method: ${paymentMethods}`, 20, yPos);
    }

    // Divider line
    yPos += 8;
    doc.line(20, yPos, pageWidth - 20, yPos);

    // Estimated Completion
    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Estimated Completion:', 20, yPos);

    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(
      formatDate(order.estimatedCompletion.toDate()),
      20,
      yPos
    );

    // Footer
    yPos += 15;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Thank you for your business!', pageWidth / 2, yPos, {
      align: 'center',
    });

    yPos += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Track your order at:', pageWidth / 2, yPos, { align: 'center' });

    yPos += 5;
    doc.text(COMPANY_INFO.website, pageWidth / 2, yPos, { align: 'center' });

    // Barcode/QR Code placeholder (future enhancement)
    // yPos += 10;
    // doc.text(`Scan QR code to track: [QR Code]`, pageWidth / 2, yPos, { align: 'center' });

    // Return PDF as blob
    return doc.output('blob');
  } catch (error) {
    console.error('Receipt generation error:', error);
    throw new Error('Failed to generate receipt');
  }
}

/**
 * Download receipt to user's device
 */
export async function downloadReceipt(orderId: string): Promise<void> {
  try {
    const blob = await generateReceipt(orderId);
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `lorenzo-receipt-${orderId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Receipt download error:', error);
    throw error;
  }
}

/**
 * Print receipt
 */
export async function printReceipt(orderId: string): Promise<void> {
  try {
    const blob = await generateReceipt(orderId);
    const url = URL.createObjectURL(blob);

    // Open in new window for printing
    const printWindow = window.open(url);
    if (printWindow) {
      printWindow.addEventListener('load', () => {
        printWindow.print();
      });
    }
  } catch (error) {
    console.error('Receipt print error:', error);
    throw error;
  }
}

/**
 * Email receipt using Resend service
 */
export async function emailReceipt(
  orderId: string,
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Import email service dynamically to avoid circular dependencies
    const { sendReceiptEmail } = await import('./email-service');

    // Send receipt email with PDF attachment
    const result = await sendReceiptEmail(orderId, email);

    return result;
  } catch (error) {
    console.error('Receipt email error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to email receipt',
    };
  }
}

/**
 * Share receipt via WhatsApp (future feature)
 */
export async function shareReceiptWhatsApp(
  orderId: string,
  phone: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Remove any non-digit characters from phone
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Add Kenya country code if not present
    const formattedPhone = cleanPhone.startsWith('254') 
      ? cleanPhone 
      : `254${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}`;
    
    // Create message with order details
    const message = `Lorenzo Dry Cleaners Receipt\n\nOrder ID: ${orderId}\n\nYour garments have been received and are being processed.\n\nThank you for choosing Lorenzo Dry Cleaners!`;
    
    // Open WhatsApp Web
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    return { success: true };
  } catch (error) {
    console.error('WhatsApp share error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to share receipt',
    };
  }
}