'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ModernCard } from '@/components/modern/ModernCard';
import { ModernBadge } from '@/components/modern/ModernBadge';
import { Button } from '@/components/ui/button';
import {
  Users,
  UserCheck,
  Building2,
  TrendingUp,
  RefreshCw,
  Search,
  Award
} from 'lucide-react';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Input } from '@/components/ui/input';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  branchId: string;
  branchName: string;
  isOnDuty: boolean;
  ordersProcessed: number;
  productivity: number;
}

interface StaffSummary {
  totalStaff: number;
  onDuty: number;
  avgProductivity: number;
  topPerformers: number;
}

const roleDisplayNames: Record<string, string> = {
  'admin': 'Admin',
  'director': 'Director',
  'general_manager': 'General Manager',
  'store_manager': 'Store Manager',
  'workstation_manager': 'Workstation Manager',
  'front_desk': 'Front Desk',
  'workstation_staff': 'Workstation Staff',
  'driver': 'Driver',
  'satellite_staff': 'Satellite Staff'
};

export default function DirectorStaffPage() {
  const { userData } = useAuth();
  const router = useRouter();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [summary, setSummary] = useState<StaffSummary>({
    totalStaff: 0,
    onDuty: 0,
    avgProductivity: 0,
    topPerformers: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);

  // Verify director role
  useEffect(() => {
    if (userData && userData.role !== 'director') {
      router.push('/dashboard');
    }
  }, [userData, router]);

  const fetchStaffData = async () => {
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

      // Fetch all staff (excluding customers)
      const usersSnap = await getDocs(
        query(collection(db, 'users'), where('role', '!=', 'customer'))
      );

      // Fetch today's attendance
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const attendanceMap: Record<string, boolean> = {};
      try {
        const attendanceSnap = await getDocs(
          query(
            collection(db, 'attendance'),
            where('date', '>=', Timestamp.fromDate(today)),
            where('clockOut', '==', null)
          )
        );
        attendanceSnap.docs.forEach(doc => {
          const data = doc.data();
          if (data.userId) {
            attendanceMap[data.userId] = true;
          }
        });
      } catch {
        // Attendance collection might not exist yet
      }

      // Fetch today's orders to calculate productivity
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const ordersSnap = await getDocs(
        query(
          collection(db, 'orders'),
          where('createdAt', '>=', Timestamp.fromDate(today)),
          where('createdAt', '<', Timestamp.fromDate(tomorrow))
        )
      );

      const ordersByProcessor: Record<string, number> = {};
      ordersSnap.docs.forEach(doc => {
        const data = doc.data();
        if (data.createdBy) {
          ordersByProcessor[data.createdBy] = (ordersByProcessor[data.createdBy] || 0) + 1;
        }
      });

      const staffList: StaffMember[] = usersSnap.docs.map(doc => {
        const data = doc.data();
        const ordersProcessed = ordersByProcessor[doc.id] || 0;
        return {
          id: doc.id,
          name: data.name || 'Unknown',
          email: data.email || '',
          role: data.role || 'staff',
          branchId: data.branchId || '',
          branchName: branchMap[data.branchId] || 'Unassigned',
          isOnDuty: !!attendanceMap[doc.id],
          ordersProcessed,
          productivity: Math.min(100, ordersProcessed * 10) // Simplified productivity calc
        };
      });

      setStaff(staffList);

      // Calculate summary
      const onDutyCount = staffList.filter(s => s.isOnDuty).length;
      const avgProd = staffList.length > 0
        ? Math.round(staffList.reduce((a, b) => a + b.productivity, 0) / staffList.length)
        : 0;
      const topPerformers = staffList.filter(s => s.productivity >= 80).length;

      setSummary({
        totalStaff: staffList.length,
        onDuty: onDutyCount,
        avgProductivity: avgProd,
        topPerformers
      });
    } catch (error) {
      console.error('Error fetching staff data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStaffData();
  };

  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = filterBranch === 'all' || s.branchId === filterBranch;
    return matchesSearch && matchesBranch;
  });

  if (userData?.role !== 'director') {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Staff Overview</h1>
          <p className="text-gray-500 mt-1">Monitor staff across all branches</p>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ModernCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Staff</p>
              <p className="text-xl font-semibold">{summary.totalStaff}</p>
            </div>
          </div>
        </ModernCard>
        <ModernCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">On Duty</p>
              <p className="text-xl font-semibold">{summary.onDuty}</p>
            </div>
          </div>
        </ModernCard>
        <ModernCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Productivity</p>
              <p className="text-xl font-semibold">{summary.avgProductivity}%</p>
            </div>
          </div>
        </ModernCard>
        <ModernCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Top Performers</p>
              <p className="text-xl font-semibold">{summary.topPerformers}</p>
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search staff..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
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

      {/* Staff List */}
      <ModernCard>
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            Staff Directory ({filteredStaff.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading staff data...</div>
          ) : filteredStaff.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No staff found</div>
          ) : (
            filteredStaff.map((member) => (
              <div key={member.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      member.isOnDuty ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <span className="text-sm font-medium">
                        {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{member.name}</h3>
                        {member.isOnDuty && (
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span>{roleDisplayNames[member.role] || member.role}</span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {member.branchName}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{member.ordersProcessed} orders</p>
                      <p className="text-xs text-gray-500">Today</p>
                    </div>
                    <div className="w-20">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>Productivity</span>
                        <span className="font-medium">{member.productivity}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            member.productivity >= 80 ? 'bg-green-500' :
                            member.productivity >= 50 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${member.productivity}%` }}
                        />
                      </div>
                    </div>
                    <ModernBadge
                      variant={member.isOnDuty ? 'success' : 'secondary'}
                    >
                      {member.isOnDuty ? 'On Duty' : 'Off Duty'}
                    </ModernBadge>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ModernCard>
    </div>
  );
}
