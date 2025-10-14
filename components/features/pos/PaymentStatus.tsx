/**
 * Payment Status Component
 *
 * Displays real-time payment status with live updates from Firestore.
 *
 * @module components/features/pos/PaymentStatus
 */

'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import type { TransactionExtended, TransactionStatus } from '@/lib/db/schema';

interface PaymentStatusProps {
  transactionId: string;
  // orderId: string;
  amount: number;
  method: string;
  className?: string;
  showDetails?: boolean;
}

/**
 * Get status icon based on transaction status
 */
function getStatusIcon(status: TransactionStatus) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case 'failed':
      return <XCircle className="h-5 w-5 text-red-600" />;
    case 'pending':
      return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
    default:
      return <Clock className="h-5 w-5 text-gray-600" />;
  }
}

/**
 * Get status badge variant
 */
function getStatusVariant(status: TransactionStatus): 'default' | 'destructive' | 'secondary' {
  switch (status) {
    case 'completed':
      return 'default'; // Will use default with green icon
    case 'failed':
      return 'destructive';
    case 'pending':
      return 'secondary';
    default:
      return 'secondary';
  }
}

/**
 * Get status label
 */
function getStatusLabel(status: TransactionStatus): string {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'failed':
      return 'Failed';
    case 'pending':
      return 'Processing';
    default:
      return 'Unknown';
  }
}

export function PaymentStatus({
  transactionId,
  amount,
  method,
  className = '',
  showDetails = true,
}: PaymentStatusProps) {
  const [transaction, setTransaction] = useState<TransactionExtended | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set up Firestore listener for real-time updates
    const transactionRef = doc(db, 'transactions', transactionId);

    const unsubscribe = onSnapshot(
      transactionRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setTransaction(snapshot.data() as TransactionExtended);
          setLoading(false);
        } else {
          setError('Transaction not found');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Transaction listener error:', err);
        setError('Failed to load transaction status');
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [transactionId]);

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <LoadingSpinner className="h-4 w-4" />
        <span className="text-sm text-gray-600">Loading payment status...</span>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <AlertCircle className="h-5 w-5 text-red-600" />
        <span className="text-sm text-red-600">{error || 'Transaction not found'}</span>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Status Header */}
      <div className="flex items-center space-x-3">
        {getStatusIcon(transaction.status)}
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-900">
              {getStatusLabel(transaction.status)}
            </span>
            <Badge variant={getStatusVariant(transaction.status)}>
              {transaction.status.toUpperCase()}
            </Badge>
          </div>
          {showDetails && (
            <div className="text-sm text-gray-600 mt-1">
              {method.toUpperCase()} • KES {amount.toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {/* Transaction Details */}
      {showDetails && transaction.status === 'completed' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-1">
          <div className="text-sm text-green-800">
            <strong>Transaction ID:</strong> {transaction.transactionId}
          </div>
          {transaction.metadata?.mpesaTransactionCode && (
            <div className="text-sm text-green-800">
              <strong>M-Pesa Code:</strong> {transaction.metadata.mpesaTransactionCode}
            </div>
          )}
          {transaction.timestamp && (
            <div className="text-sm text-green-800">
              <strong>Time:</strong>{' '}
              {new Date(transaction.timestamp.toDate()).toLocaleString()}
            </div>
          )}
        </div>
      )}

      {/* Pending Status Info */}
      {showDetails && transaction.status === 'pending' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Loader2 className="h-4 w-4 text-blue-600 animate-spin mt-0.5" />
            <div className="text-sm text-blue-800">
              Payment is being processed. Please wait for confirmation...
            </div>
          </div>
        </div>
      )}

      {/* Failed Status Info */}
      {showDetails && transaction.status === 'failed' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="space-y-1">
              <div className="text-sm text-red-800 font-medium">Payment Failed</div>
              {transaction.metadata?.gatewayResponse && (
                <div className="text-sm text-red-700">
                  {transaction.metadata.gatewayResponse}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact payment status badge (for lists)
 */
export function PaymentStatusBadge({ status }: { status: TransactionStatus }) {
  return (
    <Badge variant={getStatusVariant(status)} className="flex items-center space-x-1">
      {status === 'pending' && <Loader2 className="h-3 w-3 animate-spin" />}
      {status === 'completed' && <CheckCircle className="h-3 w-3" />}
      {status === 'failed' && <XCircle className="h-3 w-3" />}
      <span>{getStatusLabel(status)}</span>
    </Badge>
  );
}
