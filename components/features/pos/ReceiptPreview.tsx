/**
 * Receipt Preview Component
 *
 * Displays receipt preview with drag and resize functionality.
 * Provides download/print/email options.
 *
 * @module components/features/pos/ReceiptPreview
 */

'use client';

import { useState, useRef, useEffect } from 'react';
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
  X,
  GripVertical,
} from 'lucide-react';
import {
  generateReceiptBlob,
  downloadReceipt as downloadReceiptPDF,
  printReceipt as printReceiptPDF,
} from '@/lib/receipts/pdf-generator';
import { sendReceiptEmail } from '@/lib/email/receipt-mailer';
import { toast } from 'sonner';

interface ReceiptPreviewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  order: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customer: any;
  open: boolean;
  onClose: () => void;
}

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

const MIN_WIDTH = 400;
const MIN_HEIGHT = 400;
const MAX_WIDTH_VW = 95;
const MAX_HEIGHT_VH = 90;

export function ReceiptPreview({
  order,
  customer,
  open,
  onClose,
}: ReceiptPreviewProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Draggable and resizable state
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  // Calculate initial size based on viewport (for laptop screens like 1366x768)
  const getInitialSize = () => {
    if (typeof window === 'undefined') return { width: 800, height: 600 };
    const maxW = Math.min(900, window.innerWidth * 0.9);
    const maxH = Math.min(700, window.innerHeight * 0.85);
    return { width: maxW, height: maxH };
  };
  const [size, setSize] = useState<Size>(getInitialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number; width: number; height: number }>({ x: 0, y: 0, width: 0, height: 0 });
  const [resizeDirection, setResizeDirection] = useState<string>('');

  const modalRef = useRef<HTMLDivElement>(null);

  // Center modal on open and recalculate size for viewport
  useEffect(() => {
    if (open) {
      // Recalculate size for current viewport
      const newSize = getInitialSize();
      setSize(newSize);

      // Center the modal ensuring it stays within viewport bounds
      const centerX = Math.max(10, (window.innerWidth - newSize.width) / 2);
      const centerY = Math.max(10, (window.innerHeight - newSize.height) / 2);
      setPosition({ x: centerX, y: centerY });
    }
  }, [open]);

  // Mouse move handler for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        setPosition(prev => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY,
        }));

        setDragStart({ x: e.clientX, y: e.clientY });
      }

      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;

        const maxWidth = (window.innerWidth * MAX_WIDTH_VW) / 100;
        const maxHeight = (window.innerHeight * MAX_HEIGHT_VH) / 100;

        let newWidth = resizeStart.width;
        let newHeight = resizeStart.height;
        let newX = position.x;
        let newY = position.y;

        if (resizeDirection.includes('e')) {
          newWidth = Math.max(MIN_WIDTH, Math.min(maxWidth, resizeStart.width + deltaX));
        }
        if (resizeDirection.includes('s')) {
          newHeight = Math.max(MIN_HEIGHT, Math.min(maxHeight, resizeStart.height + deltaY));
        }
        if (resizeDirection.includes('w')) {
          const widthDelta = resizeStart.width - deltaX;
          if (widthDelta >= MIN_WIDTH && widthDelta <= maxWidth) {
            newWidth = widthDelta;
            newX = position.x + (resizeStart.width - newWidth);
          }
        }
        if (resizeDirection.includes('n')) {
          const heightDelta = resizeStart.height - deltaY;
          if (heightDelta >= MIN_HEIGHT && heightDelta <= maxHeight) {
            newHeight = heightDelta;
            newY = position.y + (resizeStart.height - newHeight);
          }
        }

        setSize({ width: newWidth, height: newHeight });
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, resizeStart, position, resizeDirection]);

  // Start dragging
  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  // Start resizing
  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    });
  };

  // Generate PDF preview when modal opens
  const handleGeneratePreview = async () => {
    if (pdfUrl) return;

    setLoading(true);
    setError(null);

    try {
      // V2.0: Now async for QR code generation
      const blob = await generateReceiptBlob(order, customer);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
      console.error('Receipt generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate receipt');
    } finally {
      setLoading(false);
    }
  };

  // Handle download (V2.0: Now async)
  const handleDownload = async () => {
    try {
      await downloadReceiptPDF(order, customer);
      toast.success('Receipt downloaded successfully');
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download receipt');
    }
  };

  // Handle print (V2.0: Now async)
  const handlePrint = async () => {
    try {
      await printReceiptPDF(order, customer);
      toast.success('Opening print dialog');
    } catch (err) {
      console.error('Print error:', err);
      toast.error('Failed to print receipt');
    }
  };

  // Handle email
  const handleEmail = async () => {
    if (!customer?.email) {
      toast.error('Customer email not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await sendReceiptEmail(
        customer.email,
        customer.name || 'Customer',
        order,
        customer
      );

      if (result.success) {
        toast.success(`Receipt emailed to ${customer.email}`);
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

  // Handle WhatsApp share (placeholder for Phase 2)
  const handleWhatsAppShare = () => {
    toast.info('WhatsApp integration coming in Phase 2');
  };

  // Generate preview when modal opens
  if (open && !pdfUrl && !loading && !error) {
    handleGeneratePreview();
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/80 animate-in fade-in-0"
        onClick={onClose}
      />

      {/* Draggable Modal */}
      <div
        ref={modalRef}
        className="fixed z-50 bg-white rounded-lg shadow-lg overflow-hidden"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${size.width}px`,
          height: `${size.height}px`,
          cursor: isDragging ? 'grabbing' : 'default',
        }}
      >
        {/* Resize Handles */}
        {/* Top-left corner */}
        <div
          className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize hover:bg-blue-500/20"
          onMouseDown={(e) => handleResizeStart(e, 'nw')}
        />
        {/* Top edge */}
        <div
          className="absolute top-0 left-4 right-4 h-1 cursor-n-resize hover:bg-blue-500/20"
          onMouseDown={(e) => handleResizeStart(e, 'n')}
        />
        {/* Top-right corner */}
        <div
          className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize hover:bg-blue-500/20"
          onMouseDown={(e) => handleResizeStart(e, 'ne')}
        />
        {/* Right edge */}
        <div
          className="absolute top-4 bottom-4 right-0 w-1 cursor-e-resize hover:bg-blue-500/20"
          onMouseDown={(e) => handleResizeStart(e, 'e')}
        />
        {/* Bottom-right corner */}
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize hover:bg-blue-500/20"
          onMouseDown={(e) => handleResizeStart(e, 'se')}
        />
        {/* Bottom edge */}
        <div
          className="absolute bottom-0 left-4 right-4 h-1 cursor-s-resize hover:bg-blue-500/20"
          onMouseDown={(e) => handleResizeStart(e, 's')}
        />
        {/* Bottom-left corner */}
        <div
          className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize hover:bg-blue-500/20"
          onMouseDown={(e) => handleResizeStart(e, 'sw')}
        />
        {/* Left edge */}
        <div
          className="absolute top-4 bottom-4 left-0 w-1 cursor-w-resize hover:bg-blue-500/20"
          onMouseDown={(e) => handleResizeStart(e, 'w')}
        />

        {/* Header (Draggable) */}
        <div
          className="flex items-center justify-between p-4 border-b bg-gray-50 cursor-grab active:cursor-grabbing"
          onMouseDown={handleDragStart}
        >
          <div className="flex items-center gap-2">
            <GripVertical className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold">Receipt Preview</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="overflow-auto p-6 space-y-4" style={{ height: 'calc(100% - 64px)' }}>
          {/* Order Summary */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-medium">{order.orderId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Customer:</span>
              <span className="font-medium">{customer?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium">{customer?.phoneNumber || 'N/A'}</span>
            </div>
            {customer?.email && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{customer.email}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-semibold border-t pt-2">
              <span>Total:</span>
              <span>KES {order.totalAmount?.toLocaleString() || '0'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Paid:</span>
              <span className="font-medium text-green-600">
                KES {order.amountPaid?.toLocaleString() || '0'}
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
                className="w-full"
                style={{ height: `${Math.max(200, size.height - 450)}px`, minHeight: '200px' }}
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
              disabled={loading || !pdfUrl || !customer?.email}
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
        </div>
      </div>
    </>
  );
}