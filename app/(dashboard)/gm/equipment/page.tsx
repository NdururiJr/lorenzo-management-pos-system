'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ModernCard } from '@/components/modern/ModernCard';
import { ModernBadge } from '@/components/modern/ModernBadge';
import { Button } from '@/components/ui/button';
import {
  Wrench,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Building2,
  Clock,
  Thermometer,
  Zap,
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SetupRequired } from '@/components/ui/setup-required';
import { NoDataAvailable } from '@/components/ui/no-data-available';

interface Equipment {
  id: string;
  name: string;
  type: string;
  branchId: string;
  branchName: string;
  status: 'operational' | 'maintenance' | 'offline';
  utilizationRate: number;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  hoursToday: number;
}

interface EquipmentSummary {
  total: number;
  operational: number;
  maintenance: number;
  offline: number;
  avgUtilization: number;
}

const equipmentIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'washer': Wrench,
  'dryer': Thermometer,
  'ironer': Zap,
  'default': Wrench
};

export default function GMEquipmentPage() {
  const { userData } = useAuth();
  const router = useRouter();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [summary, setSummary] = useState<EquipmentSummary>({
    total: 0,
    operational: 0,
    maintenance: 0,
    offline: 0,
    avgUtilization: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);

  // Verify GM role
  useEffect(() => {
    if (userData && userData.role !== 'general_manager') {
      router.push('/dashboard');
    }
  }, [userData, router]);

  const fetchEquipmentData = async () => {
    try {
      // Fetch branches
      const branchesSnap = await getDocs(collection(db, 'branches'));
      const branchMap: Record<string, string> = {};
      const branchList = branchesSnap.docs.map(doc => {
        const data = doc.data() as { name?: string };
        branchMap[doc.id] = data.name || doc.id;
        return { id: doc.id, name: data.name || doc.id };
      });
      setBranches(branchList);

      // Fetch equipment from database - NO MOCK DATA
      let equipmentList: Equipment[] = [];
      try {
        const equipmentSnap = await getDocs(collection(db, 'equipment'));
        equipmentList = equipmentSnap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || 'Unknown Equipment',
            type: data.type || 'default',
            branchId: data.branchId || '',
            branchName: branchMap[data.branchId] || 'Unknown',
            status: data.status || 'operational',
            // Use real utilization rate from database, or null if not available
            // NO Math.random() - show actual data or 0 if not tracked
            utilizationRate: typeof data.utilizationRate === 'number' ? data.utilizationRate : 0,
            lastMaintenance: data.lastMaintenance?.toDate(),
            nextMaintenance: data.nextMaintenance?.toDate(),
            // Use real hoursToday from database, or 0 if not tracked
            // NO Math.random() - show actual data or 0
            hoursToday: typeof data.hoursToday === 'number' ? data.hoursToday : 0
          } as Equipment;
        });
      } catch {
        // If equipment collection doesn't exist or error occurs,
        // show empty state instead of mock data
        equipmentList = [];
      }

      setEquipment(equipmentList);

      // Calculate summary from real data only
      const operational = equipmentList.filter(e => e.status === 'operational').length;
      const maintenance = equipmentList.filter(e => e.status === 'maintenance').length;
      const offline = equipmentList.filter(e => e.status === 'offline').length;

      // Only calculate average utilization from equipment that has real utilization data
      const equipmentWithUtilization = equipmentList.filter(
        e => e.status === 'operational' && e.utilizationRate > 0
      );
      const avgUtil = equipmentWithUtilization.length > 0
        ? Math.round(
            equipmentWithUtilization.reduce((a, b) => a + b.utilizationRate, 0) /
            equipmentWithUtilization.length
          )
        : 0;

      setSummary({
        total: equipmentList.length,
        operational,
        maintenance,
        offline,
        avgUtilization: avgUtil
      });
    } catch (error) {
      console.error('Error fetching equipment data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEquipmentData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEquipmentData();
  };

  const filteredEquipment = equipment.filter(e =>
    filterBranch === 'all' || e.branchId === filterBranch
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'maintenance':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'offline':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Wrench className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'danger' => {
    switch (status) {
      case 'operational':
        return 'success';
      case 'maintenance':
        return 'warning';
      case 'offline':
        return 'danger';
      default:
        return 'warning';
    }
  };

  if (userData?.role !== 'general_manager') {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Equipment Status</h1>
          <p className="text-gray-500 mt-1">Monitor equipment across all branches</p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <ModernCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Wrench className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Equipment</p>
              <p className="text-xl font-semibold">{summary.total}</p>
            </div>
          </div>
        </ModernCard>
        <ModernCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Operational</p>
              <p className="text-xl font-semibold text-green-600">{summary.operational}</p>
            </div>
          </div>
        </ModernCard>
        <ModernCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Maintenance</p>
              <p className="text-xl font-semibold text-amber-600">{summary.maintenance}</p>
            </div>
          </div>
        </ModernCard>
        <ModernCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Offline</p>
              <p className="text-xl font-semibold text-red-600">{summary.offline}</p>
            </div>
          </div>
        </ModernCard>
        <ModernCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Utilization</p>
              <p className="text-xl font-semibold">{summary.avgUtilization}%</p>
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Filter */}
      <div className="flex gap-4">
        <select
          value={filterBranch}
          onChange={(e) => setFilterBranch(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
        >
          <option value="all">All Branches</option>
          {branches.map(branch => (
            <option key={branch.id} value={branch.id}>{branch.name}</option>
          ))}
        </select>
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-8 text-center text-gray-500">Loading equipment data...</div>
        ) : equipment.length === 0 ? (
          <div className="col-span-full">
            <SetupRequired
              feature="Equipment"
              description="No equipment has been configured in the system. Equipment needs to be added before utilization metrics can be tracked."
              configPath="/settings/equipment"
              actionLabel="Add Equipment"
              variant="warning"
            />
          </div>
        ) : filteredEquipment.length === 0 ? (
          <div className="col-span-full">
            <NoDataAvailable
              metric="Equipment"
              guidance={{
                message: 'No equipment found for the selected branch. Try selecting a different branch or "All Branches".',
              }}
            />
          </div>
        ) : (
          filteredEquipment.map((item) => {
            const Icon = equipmentIcons[item.type] || equipmentIcons['default'];
            return (
              <ModernCard key={item.id} className={`p-4 ${
                item.status === 'offline' ? 'border-red-200 bg-red-50/30' :
                item.status === 'maintenance' ? 'border-amber-200 bg-amber-50/30' : ''
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${
                      item.status === 'operational' ? 'bg-green-100' :
                      item.status === 'maintenance' ? 'bg-amber-100' : 'bg-red-100'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        item.status === 'operational' ? 'text-green-600' :
                        item.status === 'maintenance' ? 'text-amber-600' : 'text-red-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {item.branchName}
                      </p>
                    </div>
                  </div>
                  {getStatusIcon(item.status)}
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Status</span>
                    <ModernBadge variant={getStatusColor(item.status)}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </ModernBadge>
                  </div>

                  {item.status === 'operational' && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Hours Today
                        </span>
                        <span className="font-medium">{item.hoursToday}h</span>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-500">Utilization</span>
                          <span className={`font-medium ${
                            item.utilizationRate >= 80 ? 'text-green-600' :
                            item.utilizationRate >= 50 ? 'text-amber-600' : 'text-red-600'
                          }`}>{item.utilizationRate}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.utilizationRate >= 80 ? 'bg-green-500' :
                              item.utilizationRate >= 50 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${item.utilizationRate}%` }}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {item.status === 'maintenance' && (
                    <div className="p-2 bg-amber-50 rounded-lg text-sm text-amber-700">
                      Scheduled maintenance in progress
                    </div>
                  )}

                  {item.status === 'offline' && (
                    <div className="p-2 bg-red-50 rounded-lg text-sm text-red-700">
                      Equipment offline - requires attention
                    </div>
                  )}
                </div>
              </ModernCard>
            );
          })
        )}
      </div>
    </div>
  );
}
