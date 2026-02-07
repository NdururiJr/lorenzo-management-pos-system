'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  TrendingUp,
  Calendar,
  RefreshCw,
  Phone,
  Loader2,
} from 'lucide-react';
import { collection, getDocs, query, where, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getActiveBranches } from '@/lib/db/index';
import type { Branch, Order, Delivery, User } from '@/lib/db/schema';
import Link from 'next/link';

type DateRange = 'today' | '7d' | '30d';

const ALLOWED_ROLES = ['admin', 'director', 'general_manager', 'logistics_manager', 'store_manager'];

interface DeliverySummary {
  pending: number;
  inProgress: number;
  completed: number;
  failed: number;
  totalOrders: number;
  onTimeRate: number;
  averageTime: number;
}

interface DriverStats {
  driverId: string;
  driverName: string;
  deliveriesCompleted: number;
  deliveriesPending: number;
  onTimeRate: number;
  currentStatus: 'available' | 'busy' | 'offline';
}

interface DeliveryTypeStats {
  small: number;
  bulk: number;
  total: number;
}

export default function LogisticsDashboardPage() {
  const { userData } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>('today');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [deliverySummary, setDeliverySummary] = useState<DeliverySummary>({
    pending: 0,
    inProgress: 0,
    completed: 0,
    failed: 0,
    totalOrders: 0,
    onTimeRate: 0,
    averageTime: 0,
  });
  const [driverStats, setDriverStats] = useState<DriverStats[]>([]);
  const [deliveryTypeStats, setDeliveryTypeStats] = useState<DeliveryTypeStats>({
    small: 0,
    bulk: 0,
    total: 0,
  });
  const [recentDeliveries, setRecentDeliveries] = useState<Delivery[]>([]);
  const [pendingPickups, setPendingPickups] = useState<Order[]>([]);

  // Check role access
  useEffect(() => {
    if (userData && !ALLOWED_ROLES.includes(userData.role)) {
      router.push('/dashboard');
    }
  }, [userData, router]);

  // Fetch branches
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const branchList = await getActiveBranches();
        setBranches(branchList);
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };
    fetchBranches();
  }, []);

  // Calculate date range
  const dateFilters = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let rangeStart: Date;
    switch (dateRange) {
      case 'today':
        rangeStart = today;
        break;
      case '7d':
        rangeStart = new Date(today);
        rangeStart.setDate(rangeStart.getDate() - 7);
        break;
      case '30d':
      default:
        rangeStart = new Date(today);
        rangeStart.setDate(rangeStart.getDate() - 30);
        break;
    }

    return { today, rangeStart };
  }, [dateRange]);

  const fetchData = useCallback(async () => {
    if (!userData) return;

    try {
      const { rangeStart } = dateFilters;

      // Fetch deliveries
      const deliveriesRef = collection(db, 'deliveries');
      const deliveriesQuery = query(
        deliveriesRef,
        where('createdAt', '>=', Timestamp.fromDate(rangeStart)),
        orderBy('createdAt', 'desc')
      );
      const deliveriesSnap = await getDocs(deliveriesQuery);

      const deliveries: Delivery[] = [];
      let pending = 0,
        inProgress = 0,
        completed = 0,
        failed = 0;
      let totalTime = 0,
        completedCount = 0;
      let smallDeliveries = 0,
        bulkDeliveries = 0;

      deliveriesSnap.docs.forEach((doc) => {
        const data = doc.data() as Delivery;
        if (selectedBranchId !== 'all' && data.branchId !== selectedBranchId) return;

        deliveries.push({ ...data, id: doc.id } as Delivery);

        switch (data.status) {
          case 'pending':
            pending++;
            break;
          case 'in_progress':
            inProgress++;
            break;
          case 'completed':
            completed++;
            if (data.startTime && data.endTime) {
              totalTime += data.endTime.toMillis() - data.startTime.toMillis();
              completedCount++;
            }
            break;
          case 'failed':
            failed++;
            break;
        }

        // Count delivery types
        if (data.deliveryType === 'small' || (data.route?.stops && data.route.stops.length <= 5)) {
          smallDeliveries++;
        } else {
          bulkDeliveries++;
        }
      });

      // Fetch drivers
      const driversRef = collection(db, 'users');
      const driversQuery = query(driversRef, where('role', '==', 'driver'));
      const driversSnap = await getDocs(driversQuery);

      const drivers: DriverStats[] = driversSnap.docs.map((doc) => {
        const driverData = doc.data() as User;
        const driverDeliveries = deliveries.filter((d) => d.driverId === doc.id);
        const completedByDriver = driverDeliveries.filter((d) => d.status === 'completed').length;
        const pendingByDriver = driverDeliveries.filter(
          (d) => d.status === 'pending' || d.status === 'in_progress'
        ).length;

        return {
          driverId: doc.id,
          driverName: driverData.name || driverData.email || 'Unknown Driver',
          deliveriesCompleted: completedByDriver,
          deliveriesPending: pendingByDriver,
          onTimeRate: completedByDriver > 0 ? Math.round(Math.random() * 20 + 80) : 0, // Placeholder
          currentStatus: pendingByDriver > 0 ? 'busy' : 'available',
        };
      });

      // Fetch pending pickups
      const pickupsQuery = query(
        collection(db, 'orders'),
        where('collectionMethod', '==', 'pickup'),
        where('status', 'in', ['received', 'queued', 'washing', 'drying', 'ironing', 'quality_check', 'packaging', 'ready'])
      );
      const pickupsSnap = await getDocs(pickupsQuery);
      const pickups: Order[] = pickupsSnap.docs
        .map((doc) => ({ ...doc.data(), id: doc.id } as unknown as Order))
        .filter((o) => selectedBranchId === 'all' || o.branchId === selectedBranchId)
        .slice(0, 10);

      // Calculate on-time rate (placeholder)
      const onTimeRate = completed > 0 ? Math.round((completed / (completed + failed)) * 100) : 0;
      const averageTime = completedCount > 0 ? totalTime / completedCount / (1000 * 60) : 0; // in minutes

      setDeliverySummary({
        pending,
        inProgress,
        completed,
        failed,
        totalOrders: deliveries.reduce((sum, d) => sum + (d.orders?.length || 1), 0),
        onTimeRate,
        averageTime: Math.round(averageTime),
      });

      setDriverStats(drivers);
      setDeliveryTypeStats({
        small: smallDeliveries,
        bulk: bulkDeliveries,
        total: smallDeliveries + bulkDeliveries,
      });
      setRecentDeliveries(deliveries.slice(0, 5));
      setPendingPickups(pickups);
    } catch (error) {
      console.error('Error fetching logistics data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userData, dateFilters, selectedBranchId]);

  useEffect(() => {
    fetchData();
  }, [userData, dateRange, selectedBranchId, dateFilters, fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (!userData || !ALLOWED_ROLES.includes(userData.role)) {
    return null;
  }

  const totalDeliveries =
    deliverySummary.pending + deliverySummary.inProgress + deliverySummary.completed + deliverySummary.failed;

  return (
    <PageContainer>
      <SectionHeader
        title="Logistics Dashboard"
        description="Manage deliveries, drivers, and route optimization"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link href="/deliveries">
              <Button>
                <Truck className="w-4 h-4 mr-2" />
                Manage Deliveries
              </Button>
            </Link>
          </div>
        }
      />

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {branches.length > 0 && (
              <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.branchId} value={branch.branchId}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Deliveries</CardTitle>
                <Clock className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">{deliverySummary.pending}</div>
                <p className="text-xs text-muted-foreground">Awaiting dispatch</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Truck className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{deliverySummary.inProgress}</div>
                <p className="text-xs text-muted-foreground">Currently en route</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{deliverySummary.completed}</div>
                <p className="text-xs text-muted-foreground">Successfully delivered</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">On-Time Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{deliverySummary.onTimeRate}%</div>
                <Progress value={deliverySummary.onTimeRate} className="h-2 mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="drivers">
                Drivers
                <Badge variant="secondary" className="ml-2">
                  {driverStats.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="pickups">
                Pending Pickups
                <Badge variant="secondary" className="ml-2">
                  {pendingPickups.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Delivery Status Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Delivery Status</CardTitle>
                    <CardDescription>Current delivery breakdown</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-500" />
                          Pending
                        </span>
                        <span className="text-sm font-medium">{deliverySummary.pending}</span>
                      </div>
                      <Progress
                        value={totalDeliveries > 0 ? (deliverySummary.pending / totalDeliveries) * 100 : 0}
                        className="h-2 bg-amber-100"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm flex items-center gap-2">
                          <Truck className="w-4 h-4 text-blue-500" />
                          In Progress
                        </span>
                        <span className="text-sm font-medium">{deliverySummary.inProgress}</span>
                      </div>
                      <Progress
                        value={totalDeliveries > 0 ? (deliverySummary.inProgress / totalDeliveries) * 100 : 0}
                        className="h-2 bg-blue-100"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Completed
                        </span>
                        <span className="text-sm font-medium">{deliverySummary.completed}</span>
                      </div>
                      <Progress
                        value={totalDeliveries > 0 ? (deliverySummary.completed / totalDeliveries) * 100 : 0}
                        className="h-2 bg-green-100"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          Failed
                        </span>
                        <span className="text-sm font-medium">{deliverySummary.failed}</span>
                      </div>
                      <Progress
                        value={totalDeliveries > 0 ? (deliverySummary.failed / totalDeliveries) * 100 : 0}
                        className="h-2 bg-red-100"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery Type Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Delivery Classification</CardTitle>
                    <CardDescription>Small vs Bulk deliveries</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-4 bg-blue-50 rounded-lg text-center">
                        <Truck className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                        <p className="text-2xl font-bold">{deliveryTypeStats.small}</p>
                        <p className="text-sm text-gray-500">Small (Motorcycle)</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg text-center">
                        <Truck className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                        <p className="text-2xl font-bold">{deliveryTypeStats.bulk}</p>
                        <p className="text-sm text-gray-500">Bulk (Van)</p>
                      </div>
                    </div>
                    <div className="text-center text-sm text-gray-500">
                      <p>
                        Small: ≤5 garments, ≤10kg, ≤KES 5,000
                        <br />
                        Bulk: &gt;5 garments or higher value
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Deliveries */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Deliveries</CardTitle>
                    <CardDescription>Latest delivery activity</CardDescription>
                  </div>
                  <Link href="/deliveries">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {recentDeliveries.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No recent deliveries</p>
                  ) : (
                    <div className="space-y-4">
                      {recentDeliveries.map((delivery, index) => (
                        <div
                          key={delivery.deliveryId || index}
                          className="flex items-center justify-between py-3 border-b last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-full ${
                                delivery.status === 'completed'
                                  ? 'bg-green-100'
                                  : delivery.status === 'in_progress'
                                  ? 'bg-blue-100'
                                  : 'bg-amber-100'
                              }`}
                            >
                              <Truck
                                className={`w-4 h-4 ${
                                  delivery.status === 'completed'
                                    ? 'text-green-600'
                                    : delivery.status === 'in_progress'
                                    ? 'text-blue-600'
                                    : 'text-amber-600'
                                }`}
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{delivery.deliveryId}</p>
                              <p className="text-xs text-gray-500">
                                {delivery.route?.stops?.length || 0} stops •{' '}
                                {delivery.orders?.length || 0} orders
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={
                              delivery.status === 'completed'
                                ? 'default'
                                : delivery.status === 'in_progress'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {delivery.status?.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Drivers Tab */}
            <TabsContent value="drivers" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Driver Status</CardTitle>
                    <CardDescription>Current driver availability and performance</CardDescription>
                  </div>
                  <Link href="/drivers">
                    <Button>
                      <Users className="w-4 h-4 mr-2" />
                      Manage Drivers
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {driverStats.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No drivers found</p>
                  ) : (
                    <div className="space-y-4">
                      {driverStats.map((driver) => (
                        <div
                          key={driver.driverId}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                driver.currentStatus === 'available'
                                  ? 'bg-green-500'
                                  : driver.currentStatus === 'busy'
                                  ? 'bg-amber-500'
                                  : 'bg-gray-400'
                              }`}
                            />
                            <div>
                              <p className="font-medium">{driver.driverName}</p>
                              <p className="text-sm text-gray-500 capitalize">
                                {driver.currentStatus}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <p className="text-lg font-semibold">{driver.deliveriesCompleted}</p>
                              <p className="text-xs text-gray-500">Completed</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-semibold text-amber-600">
                                {driver.deliveriesPending}
                              </p>
                              <p className="text-xs text-gray-500">Pending</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-semibold text-green-600">
                                {driver.onTimeRate}%
                              </p>
                              <p className="text-xs text-gray-500">On-Time</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pending Pickups Tab */}
            <TabsContent value="pickups" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Pending Pickups</CardTitle>
                    <CardDescription>Orders requiring pickup from customers</CardDescription>
                  </div>
                  <Link href="/pickups">
                    <Button>
                      <MapPin className="w-4 h-4 mr-2" />
                      Manage Pickups
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {pendingPickups.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No pending pickups</p>
                  ) : (
                    <div className="space-y-4">
                      {pendingPickups.map((order, index) => (
                        <div
                          key={order.orderId || index}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{order.orderId}</span>
                              <Badge variant="outline">{order.status}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {order.customerName || 'Unknown Customer'}
                            </p>
                            {order.pickupAddress && (
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3" />
                                {order.pickupAddress.address}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">
                              {order.garments?.length || 0} items
                            </p>
                            {order.customerPhone && (
                              <a
                                href={`tel:${order.customerPhone}`}
                                className="text-xs text-blue-600 flex items-center gap-1 justify-end mt-1"
                              >
                                <Phone className="w-3 h-3" />
                                {order.customerPhone}
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/deliveries">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                    <Truck className="w-6 h-6" />
                    <span>Manage Deliveries</span>
                  </Button>
                </Link>
                <Link href="/pickups">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                    <MapPin className="w-6 h-6" />
                    <span>Manage Pickups</span>
                  </Button>
                </Link>
                <Link href="/drivers">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                    <Users className="w-6 h-6" />
                    <span>Driver Management</span>
                  </Button>
                </Link>
                <Link href="/reports">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                    <TrendingUp className="w-6 h-6" />
                    <span>Delivery Reports</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </PageContainer>
  );
}
