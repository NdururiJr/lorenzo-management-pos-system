/**
 * PDF Export Utility (FR-012)
 *
 * Provides PDF export functionality for payment reports.
 *
 * @module lib/reports/export-pdf
 */

import { jsPDF } from 'jspdf';
import type { Transaction } from '@/lib/db/schema';

export interface ExportTransaction extends Partial<Transaction> {
  customerName?: string;
  branchName?: string;
}

export interface PDFExportOptions {
  filename?: string;
  title?: string;
  dateRange?: { start: Date; end: Date };
  branchName?: string;
  showSummary?: boolean;
}

/**
 * Format a Firestore timestamp to a readable date string
 */
function formatTimestamp(timestamp: { seconds: number; nanoseconds?: number } | Date): string {
  if (!timestamp) return '';
  const date = 'seconds' in timestamp ? new Date(timestamp.seconds * 1000) : timestamp;
  return date.toLocaleDateString('en-KE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Format currency value
 */
function formatCurrency(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format payment method for display
 */
function formatPaymentMethod(method: string): string {
  const methods: Record<string, string> = {
    mpesa: 'M-Pesa',
    card: 'Card',
    cash: 'Cash',
    credit: 'Credit',
    customer_credit: 'Store Credit',
  };
  return methods[method] || method;
}

/**
 * Format transaction status for display
 */
function formatStatus(status: string): string {
  const statuses: Record<string, string> = {
    completed: 'Completed',
    pending: 'Pending',
    failed: 'Failed',
    refunded: 'Refunded',
  };
  return statuses[status] || status;
}

/**
 * Calculate summary statistics from transactions
 */
function calculateSummary(transactions: ExportTransaction[]) {
  const completed = transactions.filter((t) => t.status === 'completed');
  const pending = transactions.filter((t) => t.status === 'pending');
  const failed = transactions.filter((t) => t.status === 'failed');

  const byMethod: Record<string, { count: number; amount: number }> = {};
  completed.forEach((t) => {
    const method = t.method || 'unknown';
    if (!byMethod[method]) {
      byMethod[method] = { count: 0, amount: 0 };
    }
    byMethod[method].count++;
    byMethod[method].amount += t.amount || 0;
  });

  return {
    totalTransactions: transactions.length,
    completedCount: completed.length,
    completedAmount: completed.reduce((sum, t) => sum + (t.amount || 0), 0),
    pendingCount: pending.length,
    pendingAmount: pending.reduce((sum, t) => sum + (t.amount || 0), 0),
    failedCount: failed.length,
    byMethod,
  };
}

/**
 * Export transactions to PDF file
 *
 * @param transactions - Array of transactions to export
 * @param options - Export options
 */
export function exportTransactionsToPDF(
  transactions: ExportTransaction[],
  options: PDFExportOptions = {}
): void {
  const {
    filename = `transactions-${new Date().toISOString().split('T')[0]}.pdf`,
    title = 'Payment Report',
    dateRange,
    branchName,
    showSummary = true,
  } = options;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let yPosition = 20;

  // Helper to add new page if needed
  const checkPageBreak = (neededHeight: number) => {
    if (yPosition + neededHeight > 280) {
      doc.addPage();
      yPosition = 20;
    }
  };

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;

  // Subheader with date range and branch
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  let subheader = `Generated: ${new Date().toLocaleString('en-KE')}`;
  if (dateRange) {
    subheader += ` | Period: ${dateRange.start.toLocaleDateString('en-KE')} to ${dateRange.end.toLocaleDateString('en-KE')}`;
  }
  if (branchName) {
    subheader += ` | Branch: ${branchName}`;
  }
  doc.text(subheader, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 12;

  // Divider line
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  // Summary Section
  if (showSummary) {
    const summary = calculateSummary(transactions);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // Summary grid
    const summaryData = [
      ['Total Transactions:', summary.totalTransactions.toString()],
      ['Completed:', `${summary.completedCount} (${formatCurrency(summary.completedAmount)})`],
      ['Pending:', `${summary.pendingCount} (${formatCurrency(summary.pendingAmount)})`],
      ['Failed:', summary.failedCount.toString()],
    ];

    summaryData.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, margin, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(value, margin + 45, yPosition);
      yPosition += 6;
    });

    yPosition += 4;

    // Payment method breakdown
    doc.setFont('helvetica', 'bold');
    doc.text('By Payment Method:', margin, yPosition);
    yPosition += 6;
    doc.setFont('helvetica', 'normal');

    Object.entries(summary.byMethod).forEach(([method, data]) => {
      doc.text(
        `  ${formatPaymentMethod(method)}: ${data.count} transactions (${formatCurrency(data.amount)})`,
        margin,
        yPosition
      );
      yPosition += 5;
    });

    yPosition += 8;

    // Divider
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;
  }

  // Transactions Table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Transaction Details', margin, yPosition);
  yPosition += 8;

  // Table header
  const colWidths = [35, 30, 30, 25, 25, 35];
  const headers = ['Transaction ID', 'Customer', 'Amount', 'Method', 'Status', 'Date'];

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPosition - 4, pageWidth - 2 * margin, 8, 'F');

  let xPos = margin;
  headers.forEach((header, i) => {
    doc.text(header, xPos + 2, yPosition);
    xPos += colWidths[i];
  });
  yPosition += 6;

  // Table rows
  doc.setFont('helvetica', 'normal');
  transactions.forEach((t) => {
    checkPageBreak(8);

    xPos = margin;
    const rowData = [
      (t.transactionId || '').substring(0, 15),
      (t.customerName || 'Unknown').substring(0, 15),
      formatCurrency(t.amount || 0),
      formatPaymentMethod(t.method || ''),
      formatStatus(t.status || ''),
      t.timestamp ? formatTimestamp(t.timestamp) : '',
    ];

    // Alternate row background
    if (transactions.indexOf(t) % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, yPosition - 4, pageWidth - 2 * margin, 6, 'F');
    }

    rowData.forEach((cell, i) => {
      doc.text(cell, xPos + 2, yPosition);
      xPos += colWidths[i];
    });
    yPosition += 6;
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Page ${i} of ${pageCount} | Lorenzo Dry Cleaners`,
      pageWidth / 2,
      290,
      { align: 'center' }
    );
  }

  // Download
  doc.save(filename);
}

/**
 * Export payment report with date range info
 */
export function exportPaymentReportPDF(
  transactions: ExportTransaction[],
  dateRange: { start: Date; end: Date },
  branchName?: string
): void {
  const dateStr = `${dateRange.start.toISOString().split('T')[0]}_to_${dateRange.end.toISOString().split('T')[0]}`;
  const branchStr = branchName ? `_${branchName.replace(/\s+/g, '_')}` : '';
  const filename = `payment-report${branchStr}_${dateStr}.pdf`;

  exportTransactionsToPDF(transactions, {
    filename,
    title: 'Lorenzo Dry Cleaners - Payment Report',
    dateRange,
    branchName,
    showSummary: true,
  });
}
