'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Progress } from '@/components/ui/progress';
import { getTransactionsByBranch } from '@/lib/db/transactions';
import type { Transaction } from '@/lib/db/schema';
import { formatDistanceToNow } from 'date-fns';
import { CreditCard, Smartphone, Banknote, TrendingUp } from 'lucide-react';

interface RevenueBreakdownContentProps {
  branchId: string;
}

interface RevenueBreakdown {
  byPaymentMethod: Record<string, number>;
  totalRevenue: number;
  target: number;
  topTransactions: Transaction[];
}

const PAYMENT_METHOD_ICONS: Record<string, React.ReactNode> = {
  mpesa: <Smartphone className="w-4 h-4 text-green-600" />,
  card: <CreditCard className="w-4 h-4 text-blue-600" />,
  cash: <Banknote className="w-4 h-4 text-amber-600" />,
  credit: <TrendingUp className="w-4 h-4 text-purple-600" />,
};

const PAYMENT_METHOD_COLORS: Record<string, string> = {
  mpesa: 'bg-green-100 text-green-800',
  card: 'bg-blue-100 text-blue-800',
  cash: 'bg-amber-100 text-amber-800',
  credit: 'bg-purple-100 text-purple-800',
};

export function RevenueBreakdownContent({ branchId }: RevenueBreakdownContentProps) {
  const [data, setData] = useState<RevenueBreakdown | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Get today's transactions
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const transactions = await getTransactionsByBranch(branchId, {
          startDate: today,
          endDate: new Date(),
        });

        // Calculate by payment method
        const byPaymentMethod: Record<string, number> = {
          mpesa: 0,
          card: 0,
          cash: 0,
          credit: 0,
        };

        let totalRevenue = 0;

        transactions.forEach((tx) => {
          if (tx.status === 'completed' && tx.amount > 0) {
            // Default to 'mpesa' for new transactions (cashless system)
            // Note: Historical cash transactions still display correctly
            const method = tx.method || 'mpesa';
            byPaymentMethod[method] = (byPaymentMethod[method] || 0) + tx.amount;
            totalRevenue += tx.amount;
          }
        });

        // Get top transactions (sorted by amount)
        const topTransactions = [...transactions]
          .filter((tx) => tx.status === 'completed')
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 5);

        // TODO: Get actual target from branch config
        const target = 100000; // Default daily target

        setData({
          byPaymentMethod,
          totalRevenue,
          target,
          topTransactions,
        });
      } catch (error) {
        console.error('Error loading revenue breakdown:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [branchId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton className="h-24 w-full" />
        <LoadingSkeleton className="h-32 w-full" />
        <LoadingSkeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-gray-500">
        No revenue data available
      </div>
    );
  }

  const targetProgress = data.target > 0
    ? Math.min((data.totalRevenue / data.target) * 100, 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Target Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Daily Target Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  KES {data.totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  of KES {data.target.toLocaleString()} target
                </p>
              </div>
              <div
                className={`text-lg font-semibold ${
                  targetProgress >= 100
                    ? 'text-green-600'
                    : targetProgress >= 75
                    ? 'text-blue-600'
                    : targetProgress >= 50
                    ? 'text-amber-600'
                    : 'text-red-600'
                }`}
              >
                {targetProgress.toFixed(1)}%
              </div>
            </div>
            <Progress value={targetProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Revenue by Payment Method */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">By Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(data.byPaymentMethod)
              .filter(([, amount]) => amount > 0)
              .sort((a, b) => b[1] - a[1])
              .map(([method, amount]) => {
                const percentage =
                  data.totalRevenue > 0
                    ? (amount / data.totalRevenue) * 100
                    : 0;
                return (
                  <div key={method} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {PAYMENT_METHOD_ICONS[method]}
                        <span className="text-sm font-medium capitalize">
                          {method === 'mpesa' ? 'M-Pesa' : method}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">
                          KES {amount.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            {Object.values(data.byPaymentMethod).every((v) => v === 0) && (
              <p className="text-sm text-gray-500 text-center py-2">
                No transactions today
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Transactions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Top Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.topTransactions.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No transactions today
              </p>
            ) : (
              data.topTransactions.map((tx) => (
                <div
                  key={tx.transactionId}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">
                      {tx.orderId || tx.transactionId}
                    </span>
                    <span className="text-xs text-gray-500">
                      {tx.timestamp?.toDate
                        ? formatDistanceToNow(tx.timestamp.toDate(), {
                            addSuffix: true,
                          })
                        : 'Recently'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={PAYMENT_METHOD_COLORS[tx.method] || 'bg-gray-100'}
                    >
                      {tx.method === 'mpesa' ? 'M-Pesa' : tx.method}
                    </Badge>
                    <span className="font-semibold text-green-600">
                      +KES {tx.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
