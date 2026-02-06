/**
 * Excel Export Utility (FR-012)
 *
 * Provides Excel export functionality for payment reports.
 *
 * @module lib/reports/export-excel
 */

import * as XLSX from 'xlsx';
import type { Transaction } from '@/lib/db/schema';

export interface ExportTransaction extends Partial<Transaction> {
  customerName?: string;
  branchName?: string;
}

export interface ExcelExportOptions {
  filename?: string;
  sheetName?: string;
  includeSummary?: boolean;
  dateFormat?: string;
}

/**
 * Format a Firestore timestamp to a readable date string
 */
function formatTimestamp(timestamp: { seconds: number; nanoseconds?: number } | Date): string {
  if (!timestamp) return '';
  const date = 'seconds' in timestamp ? new Date(timestamp.seconds * 1000) : timestamp;
  return date.toLocaleString('en-KE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
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
 * Export transactions to Excel file
 *
 * @param transactions - Array of transactions to export
 * @param options - Export options
 */
export function exportTransactionsToExcel(
  transactions: ExportTransaction[],
  options: ExcelExportOptions = {}
): void {
  const {
    filename = `transactions-${new Date().toISOString().split('T')[0]}.xlsx`,
    sheetName = 'Transactions',
    includeSummary = true,
  } = options;

  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Prepare transactions data
  const transactionData = transactions.map((t) => ({
    'Transaction ID': t.transactionId || '',
    'Order ID': t.orderId || '',
    'Customer': t.customerName || 'Unknown',
    'Amount (KES)': t.amount || 0,
    'Payment Method': formatPaymentMethod(t.method || ''),
    'Status': formatStatus(t.status || ''),
    'Branch': t.branchName || t.branchId || '',
    'Pesapal Ref': t.pesapalRef || '',
    'Processed By': t.processedBy || '',
    'Timestamp': t.timestamp ? formatTimestamp(t.timestamp) : '',
  }));

  // Create transactions worksheet
  const transactionsSheet = XLSX.utils.json_to_sheet(transactionData);

  // Set column widths
  transactionsSheet['!cols'] = [
    { wch: 20 }, // Transaction ID
    { wch: 20 }, // Order ID
    { wch: 25 }, // Customer
    { wch: 15 }, // Amount
    { wch: 15 }, // Method
    { wch: 12 }, // Status
    { wch: 20 }, // Branch
    { wch: 20 }, // Pesapal Ref
    { wch: 20 }, // Processed By
    { wch: 20 }, // Timestamp
  ];

  XLSX.utils.book_append_sheet(workbook, transactionsSheet, sheetName);

  // Add summary sheet if requested
  if (includeSummary) {
    const summary = calculateSummary(transactions);

    const summaryData = [
      { Metric: 'Total Transactions', Value: summary.totalTransactions },
      { Metric: 'Completed Transactions', Value: summary.completedCount },
      { Metric: 'Completed Amount (KES)', Value: summary.completedAmount },
      { Metric: 'Pending Transactions', Value: summary.pendingCount },
      { Metric: 'Pending Amount (KES)', Value: summary.pendingAmount },
      { Metric: 'Failed Transactions', Value: summary.failedCount },
      { Metric: '', Value: '' },
      { Metric: 'Breakdown by Payment Method', Value: '' },
    ];

    // Add method breakdown
    Object.entries(summary.byMethod).forEach(([method, data]) => {
      summaryData.push({
        Metric: `${formatPaymentMethod(method)} - Count`,
        Value: data.count,
      });
      summaryData.push({
        Metric: `${formatPaymentMethod(method)} - Amount (KES)`,
        Value: data.amount,
      });
    });

    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    summarySheet['!cols'] = [{ wch: 30 }, { wch: 20 }];

    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  }

  // Download the file
  XLSX.writeFile(workbook, filename);
}

/**
 * Export payment report with date range info
 */
export function exportPaymentReport(
  transactions: ExportTransaction[],
  dateRange: { start: Date; end: Date },
  branchName?: string
): void {
  const dateStr = `${dateRange.start.toISOString().split('T')[0]}_to_${dateRange.end.toISOString().split('T')[0]}`;
  const branchStr = branchName ? `_${branchName.replace(/\s+/g, '_')}` : '';
  const filename = `payment-report${branchStr}_${dateStr}.xlsx`;

  exportTransactionsToExcel(transactions, {
    filename,
    sheetName: 'Payment Report',
    includeSummary: true,
  });
}
