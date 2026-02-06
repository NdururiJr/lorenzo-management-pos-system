/**
 * Risk Radar Component
 *
 * Displays a "Watchlist (Anomalies & Risks)" panel for the director dashboard.
 * Detects and displays various business risks:
 * - Delayed Orders (past estimatedCompletion)
 * - Walk-in Decline (week-over-week order drop > 15%)
 * - Equipment/Capacity Issues (orders in processing > 80% capacity)
 * - Payment Overdue (pending payments older than 7 days)
 *
 * @module components/features/director/RiskRadar
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AlertTriangle, Loader2, Eye, UserCog } from 'lucide-react';
import type { Order } from '@/lib/db/schema';

interface RiskRadarProps {
  branchId: string; // 'all' or specific branch
}

type RiskSeverity = 'medium' | 'high';

interface Risk {
  id: string;
  title: string;
  description: string;
  severity: RiskSeverity;
  category: 'delayed' | 'walk-in-decline' | 'capacity' | 'payment-overdue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
}

interface RiskData {
  risks: Risk[];
  summary: {
    total: number;
    high: number;
    medium: number;
  };
}

/**
 * Get orders for the current week and previous week for comparison
 */
async function getWeeklyOrderData(branchId: string) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Current week start (Monday)
  const currentWeekStart = new Date(today);
  currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay() + 1);
  if (currentWeekStart > today) {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
  }

  // Previous week start and end
  const previousWeekStart = new Date(currentWeekStart);
  previousWeekStart.setDate(previousWeekStart.getDate() - 7);
  const previousWeekEnd = new Date(currentWeekStart);
  previousWeekEnd.setMilliseconds(-1);

  const ordersRef = collection(db, 'orders');

  // Current week orders
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentConstraints: any[] = [
    where('createdAt', '>=', Timestamp.fromDate(currentWeekStart)),
    where('createdAt', '<=', Timestamp.fromDate(now)),
  ];
  if (branchId !== 'all') {
    currentConstraints.push(where('branchId', '==', branchId));
  }

  const currentQuery = query(ordersRef, ...currentConstraints);
  const currentSnapshot = await getDocs(currentQuery);
  const currentOrders = currentSnapshot.docs.map((doc) => doc.data() as Order);

  // Previous week orders
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const previousConstraints: any[] = [
    where('createdAt', '>=', Timestamp.fromDate(previousWeekStart)),
    where('createdAt', '<=', Timestamp.fromDate(previousWeekEnd)),
  ];
  if (branchId !== 'all') {
    previousConstraints.push(where('branchId', '==', branchId));
  }

  const previousQuery = query(ordersRef, ...previousConstraints);
  const previousSnapshot = await getDocs(previousQuery);
  const previousOrders = previousSnapshot.docs.map((doc) => doc.data() as Order);

  return { currentOrders, previousOrders };
}

/**
 * Fetch all active orders for analysis
 */
async function getActiveOrders(branchId: string): Promise<Order[]> {
  const ordersRef = collection(db, 'orders');
  const activeStatuses = ['received', 'inspection', 'queued', 'washing', 'drying', 'ironing', 'quality_check', 'packaging', 'ready', 'out_for_delivery'];

  // Firestore 'in' operator supports up to 10 values, so we need to split
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const constraints: any[] = [
    where('status', 'in', activeStatuses.slice(0, 10)),
    orderBy('createdAt', 'desc'),
  ];

  if (branchId !== 'all') {
    constraints.unshift(where('branchId', '==', branchId));
  }

  const ordersQuery = query(ordersRef, ...constraints);
  const snapshot = await getDocs(ordersQuery);
  return snapshot.docs.map((doc) => doc.data() as Order);
}

/**
 * Fetch orders with pending payments older than specified days
 */
async function getOverduePaymentOrders(branchId: string, daysOld: number): Promise<Order[]> {
  const ordersRef = collection(db, 'orders');
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const constraints: any[] = [
    where('paymentStatus', '==', 'pending'),
    where('createdAt', '<=', Timestamp.fromDate(cutoffDate)),
  ];

  if (branchId !== 'all') {
    constraints.unshift(where('branchId', '==', branchId));
  }

  const ordersQuery = query(ordersRef, ...constraints);
  const snapshot = await getDocs(ordersQuery);
  return snapshot.docs.map((doc) => doc.data() as Order);
}

export function RiskRadar({ branchId }: RiskRadarProps) {
  const { data: riskData, isLoading } = useQuery<RiskData>({
    queryKey: ['risk-radar', branchId],
    queryFn: async () => {
      const risks: Risk[] = [];
      const now = Timestamp.now();

      // 1. Detect Delayed Orders (past estimatedCompletion)
      const activeOrders = await getActiveOrders(branchId);
      const delayedOrders = activeOrders.filter((order) => {
        if (!order.estimatedCompletion) return false;
        return order.estimatedCompletion.seconds < now.seconds;
      });

      if (delayedOrders.length > 0) {
        risks.push({
          id: 'delayed-orders',
          title: `${delayedOrders.length} Delayed Orders`,
          description: `${delayedOrders.length} order${delayedOrders.length > 1 ? 's are' : ' is'} past their estimated completion date. Immediate attention required.`,
          severity: 'high',
          category: 'delayed',
          metadata: { count: delayedOrders.length },
        });
      }

      // 2. Detect Walk-in Decline (>15% week-over-week drop)
      const { currentOrders, previousOrders } = await getWeeklyOrderData(branchId);
      const currentCount = currentOrders.length;
      const previousCount = previousOrders.length;

      if (previousCount > 0) {
        const changePercent = ((currentCount - previousCount) / previousCount) * 100;

        if (changePercent < -15) {
          risks.push({
            id: 'walk-in-decline',
            title: 'Walk-in Traffic Decline',
            description: `Order volume dropped ${Math.abs(changePercent).toFixed(0)}% week-over-week. Consider investigating local competition or marketing.`,
            severity: 'medium',
            category: 'walk-in-decline',
            metadata: { changePercent, currentCount, previousCount },
          });
        }
      }

      // 3. Detect Capacity Issues (>80% utilization)
      // Assuming 100 orders/day capacity per branch
      const dailyCapacity = branchId === 'all' ? 300 : 100;
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayOrders = currentOrders.filter((order) => {
        if (!order.createdAt) return false;
        return order.createdAt.seconds >= Timestamp.fromDate(todayStart).seconds;
      });

      const utilizationPercent = (todayOrders.length / dailyCapacity) * 100;

      if (utilizationPercent > 80) {
        risks.push({
          id: 'capacity-warning',
          title: 'High Capacity Utilization',
          description: `Operating at ${utilizationPercent.toFixed(0)}% capacity. Consider load balancing or extending operational hours.`,
          severity: utilizationPercent > 95 ? 'high' : 'medium',
          category: 'capacity',
          metadata: { utilizationPercent, todayOrders: todayOrders.length, dailyCapacity },
        });
      }

      // 4. Detect Payment Overdue (pending > 7 days)
      const overdueOrders = await getOverduePaymentOrders(branchId, 7);

      if (overdueOrders.length > 0) {
        const totalOverdue = overdueOrders.reduce((sum, order) => sum + (order.totalAmount - order.paidAmount), 0);

        risks.push({
          id: 'payment-overdue',
          title: `${overdueOrders.length} Overdue Payments`,
          description: `KES ${totalOverdue.toLocaleString()} in outstanding payments older than 7 days. Consider sending payment reminders.`,
          severity: totalOverdue > 50000 ? 'high' : 'medium',
          category: 'payment-overdue',
          metadata: { count: overdueOrders.length, totalOverdue },
        });
      }

      // Calculate summary
      const summary = {
        total: risks.length,
        high: risks.filter((r) => r.severity === 'high').length,
        medium: risks.filter((r) => r.severity === 'medium').length,
      };

      return { risks, summary };
    },
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000, // Consider data stale after 30 seconds
  });

  const handleViewMitigation = (risk: Risk) => {
    // In production, this would open a modal or navigate to a detailed view
    console.log('View mitigation for:', risk);
    // TODO: Implement mitigation modal/drawer
  };

  const handleAssignToManager = (risk: Risk) => {
    // In production, this would open an assignment dialog
    console.log('Assign to manager:', risk);
    // TODO: Implement assignment functionality
  };

  return (
    <div className="glass-card-dark" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <AlertTriangle size={18} color="#FF6B6B" />
        <span style={{ fontSize: '15px', fontWeight: '600', color: '#E8F0F2' }}>
          Watchlist (Anomalies & Risks)
        </span>
        {riskData && riskData.summary.total > 0 && (
          <span
            style={{
              marginLeft: 'auto',
              padding: '4px 10px',
              background: 'rgba(255, 107, 107, 0.15)',
              borderRadius: '12px',
              fontSize: '11px',
              color: '#FF6B6B',
              fontWeight: '500',
            }}
          >
            {riskData.summary.total} Active
          </span>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
          <Loader2 className="animate-spin" size={24} color="rgba(232, 240, 242, 0.5)" />
        </div>
      ) : riskData && riskData.risks.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {riskData.risks.map((risk) => (
            <RiskCard
              key={risk.id}
              risk={risk}
              onViewMitigation={() => handleViewMitigation(risk)}
              onAssignToManager={() => handleAssignToManager(risk)}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: '32px 16px',
            color: 'rgba(232, 240, 242, 0.5)',
            fontSize: '13px',
          }}
        >
          <AlertTriangle size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
          <p>No active risks detected</p>
          <p style={{ fontSize: '12px', marginTop: '4px', opacity: 0.7 }}>
            System is monitoring for anomalies
          </p>
        </div>
      )}
    </div>
  );
}

interface RiskCardProps {
  risk: Risk;
  onViewMitigation: () => void;
  onAssignToManager: () => void;
}

function RiskCard({ risk, onViewMitigation, onAssignToManager }: RiskCardProps) {
  const isHighRisk = risk.severity === 'high';

  // Severity-based styling
  const cardStyle: React.CSSProperties = isHighRisk
    ? {
        background: 'rgba(255, 107, 107, 0.08)',
        border: '1px solid rgba(255, 107, 107, 0.25)',
        borderRadius: '10px',
        padding: '16px',
      }
    : {
        background: 'rgba(201, 169, 98, 0.08)',
        border: '1px solid rgba(201, 169, 98, 0.2)',
        borderRadius: '10px',
        padding: '16px',
      };

  const severityColor = isHighRisk ? '#FF6B6B' : '#C9A962';
  const severityLabel = isHighRisk ? 'High Risk' : 'Medium Risk';

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        {/* Pulsing dot indicator */}
        <div
          className={isHighRisk ? 'pulse-dot-error' : 'pulse-dot-gold'}
          style={{ marginTop: '4px', flexShrink: 0 }}
        />

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: '600',
              fontSize: '13px',
              marginBottom: '4px',
              color: '#E8F0F2',
            }}
          >
            {risk.title}
          </div>
          <div
            style={{
              fontSize: '12px',
              color: 'rgba(232, 240, 242, 0.7)',
              lineHeight: '1.5',
            }}
          >
            {risk.description}
            <span style={{ color: severityColor, marginLeft: '4px' }}>
              ({severityLabel})
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
          <button
            className="director-action-btn"
            style={{ fontSize: '11px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={onViewMitigation}
          >
            <Eye size={12} />
            View Mitigation
          </button>
          <button
            className="director-action-btn"
            style={{ fontSize: '11px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={onAssignToManager}
          >
            <UserCog size={12} />
            Assign to Manager
          </button>
        </div>
      </div>
    </div>
  );
}

export default RiskRadar;
