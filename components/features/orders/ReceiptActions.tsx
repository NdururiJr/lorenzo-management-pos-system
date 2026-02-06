/**
 * Receipt Actions Component
 *
 * Provides download, email, and print actions for receipts.
 *
 * @module components/features/orders/ReceiptActions
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Mail, Printer, Loader2 } from 'lucide-react';
import { downloadReceipt, printReceipt } from '@/lib/receipts/pdf-generator';
import { sendReceiptEmail } from '@/lib/email/receipt-mailer';
import { toast } from 'sonner';

interface ReceiptActionsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  order: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customer: any;
  className?: string;
}

export function ReceiptActions({ order, customer, className = '' }: ReceiptActionsProps) {
  const [isEmailing, setIsEmailing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadReceipt(order, customer);
      toast.success(`Receipt for order ${order.orderId} has been downloaded.`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error downloading receipt:', error);
      toast.error(error.message || 'Failed to download receipt. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEmail = async () => {
    if (!customer?.email) {
      toast.error('Customer email address is not available.');
      return;
    }

    setIsEmailing(true);
    try {
      const result = await sendReceiptEmail(
        customer.email,
        customer.name || 'Customer',
        order,
        customer
      );

      if (result.success) {
        toast.success(`Receipt has been sent to ${customer.email}`);
      } else {
        toast.error(result.error || 'Failed to send receipt email.');
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error emailing receipt:', error);
      toast.error(error.message || 'Failed to send receipt email.');
    } finally {
      setIsEmailing(false);
    }
  };

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      await printReceipt(order, customer);
      toast.success('Receipt is ready to print.');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error printing receipt:', error);
      toast.error(error.message || 'Failed to print receipt. Please try again.');
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        onClick={handleDownload}
        variant="outline"
        size="sm"
        className="flex-1"
        disabled={isDownloading}
      >
        {isDownloading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </>
        )}
      </Button>

      <Button
        onClick={handleEmail}
        variant="outline"
        size="sm"
        className="flex-1"
        disabled={isEmailing || !customer?.email}
      >
        {isEmailing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Mail className="w-4 h-4 mr-2" />
            Email Receipt
          </>
        )}
      </Button>

      <Button
        onClick={handlePrint}
        variant="outline"
        size="sm"
        className="flex-1"
        disabled={isPrinting}
      >
        {isPrinting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Preparing...
          </>
        ) : (
          <>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </>
        )}
      </Button>
    </div>
  );
}
