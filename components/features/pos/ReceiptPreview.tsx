/**
 * Receipt Preview Component
 *
 * Displays receipt preview and provides download/print/email options.
 *
 * @module components/features/pos/ReceiptPreview
 */

'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Download,
  Printer,
  Mail,
  MessageSquare,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import {
  generateReceipt,
  downloadReceipt,
  printReceipt,
  emailReceipt,
  shareReceiptWhatsApp,
} from '@/lib/receipts/receipt-generator';
import { toast } from 'sonner';

interface ReceiptPreviewProps {
  orderId: string;
  orderDetails: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    totalAmount: number;
    paidAmount: number;
  };
  open: boolean;
  onClose: () => void;
}

export function ReceiptPreview({
  orderId,
  orderDetails,
  open,
  onClose,
}: ReceiptPreviewProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Generate PDF preview when modal opens
  const handleGeneratePreview = async () => {
    if (pdfUrl) return; // Already generated

    setLoading(true);
    setError(null);

    try {
      const blob = await generateReceipt(orderId);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
      console.error('Receipt generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate receipt');
    } finally {
      setLoading(false);
    }
  };

  // Handle download
  const handleDownload = async () => {
    setLoading(true);
    setError(null);

    try {
      await downloadReceipt(orderId);
      toast.success('Receipt downloaded successfully');
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download receipt');
    } finally {
      setLoading(false);
    }
  };

  // Handle print
  const handlePrint = async () => {
    setLoading(true);
    setError(null);

    try {
      await printReceipt(orderId);
      toast.success('Receipt sent to printer');
    } catch (err) {
      console.error('Print error:', err);
      toast.error('Failed to print receipt');
    } finally {
      setLoading(false);
    }
  };

  // Handle email
  const handleEmail = async () => {
    if (!orderDetails.customerEmail) {
      toast.error('Customer email not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await emailReceipt(orderId, orderDetails.customerEmail);

      if (result.success) {
        toast.success('Receipt emailed successfully');
      } else {
        toast.error(result.error || 'Failed to email receipt');
      }
    } catch (err) {
      console.error('Email error:', err);
      toast.error('Failed to email receipt');
    } finally {
      setLoading(false);
    }
  };

  // Handle WhatsApp share
  const handleWhatsAppShare = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await shareReceiptWhatsApp(orderId, orderDetails.customerPhone);

      if (result.success) {
        toast.success('Receipt shared via WhatsApp');
      } else {
        toast.error(result.error || 'Failed to share receipt');
      }
    } catch (err) {
      console.error('WhatsApp share error:', err);
      toast.error('Failed to share receipt');
    } finally {
      setLoading(false);
    }
  };

  // Generate preview when modal opens
  if (open && !pdfUrl && !loading && !error) {
    handleGeneratePreview();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Receipt Preview</DialogTitle>
        </DialogHeader>

        {/* Order Summary */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Order ID:</span>
            <span className="font-medium">{orderId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Customer:</span>
            <span className="font-medium">{orderDetails.customerName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Phone:</span>
            <span className="font-medium">{orderDetails.customerPhone}</span>
          </div>
          {orderDetails.customerEmail && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{orderDetails.customerEmail}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-semibold border-t pt-2">
            <span>Total:</span>
            <span>KES {orderDetails.totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Paid:</span>
            <span className="font-medium text-green-600">
              KES {orderDetails.paidAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && !pdfUrl && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <LoadingSpinner className="h-12 w-12" />
            <p className="text-gray-600">Generating receipt...</p>
          </div>
        )}

        {/* PDF Preview */}
        {pdfUrl && (
          <div className="border rounded-lg overflow-hidden bg-gray-100">
            <iframe
              src={pdfUrl}
              className="w-full h-[60vh]"
              title="Receipt Preview"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={loading || !pdfUrl}
            className="w-full"
          >
            {loading ? (
              <LoadingSpinner className="h-4 w-4 mr-2" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download
          </Button>

          <Button
            variant="outline"
            onClick={handlePrint}
            disabled={loading || !pdfUrl}
            className="w-full"
          >
            {loading ? (
              <LoadingSpinner className="h-4 w-4 mr-2" />
            ) : (
              <Printer className="h-4 w-4 mr-2" />
            )}
            Print
          </Button>

          <Button
            variant="outline"
            onClick={handleEmail}
            disabled={loading || !pdfUrl || !orderDetails.customerEmail}
            className="w-full"
          >
            {loading ? (
              <LoadingSpinner className="h-4 w-4 mr-2" />
            ) : (
              <Mail className="h-4 w-4 mr-2" />
            )}
            Email
          </Button>

          <Button
            variant="outline"
            onClick={handleWhatsAppShare}
            disabled={loading || !pdfUrl}
            className="w-full"
          >
            {loading ? (
              <LoadingSpinner className="h-4 w-4 mr-2" />
            ) : (
              <MessageSquare className="h-4 w-4 mr-2" />
            )}
            WhatsApp
          </Button>
        </div>

        {/* Success Info */}
        {pdfUrl && !loading && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Receipt generated successfully. You can download, print, or share it.
            </AlertDescription>
          </Alert>
        )}

        {/* Close Button */}
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
