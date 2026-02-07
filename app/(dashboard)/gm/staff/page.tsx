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
  Clock,
  Building2,
  TrendingUp,
  RefreshCw,
  Search,
  Award,
  Pause
} from 'lucide-react';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Input } from '@/components/ui/input';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  branchId: string;
  branchName: string;
  isOnDuty: boolean;
  clockInTime?: Date;
  currentTask?: string;
  ordersCompleted: number;
  productivity: number;
}

interface ShiftSummary {
  totalStaff: number;
  onDuty: number;
  onBreak: number;
  avgProductivity: number;
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

export default function GMStaffPage() {
  const { userData } = useAuth();
  const router = useRouter();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [summary, setSummary] = useState<ShiftSummary>({
    totalStaff: 0,
    onDuty: 0,
    onBreak: 0,
    avgProductivity: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);

  // Verify GM role
  useEffect(() => {
    if (userData && userData.role !== 'general_manager') {
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

      // Fetch all staff (excluding customers and executives)
      const usersSnap = await getDocs(
        query(collection(db, 'users'), where('role', 'not-in', ['customer', 'director', 'general_manager']))
      );

      // Fetch today's attendance
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const attendanceMap: Record<string, { clockIn: Date; onBreak: boolean }> = {};
      try {
        const attendanceSnap = await getDocs(
          query(
            collection(db, 'attendance'),
            where('date', '>=', Timestamp.fromDate(today))
          )
        );
        attendanceSnap.docs.forEach(doc => {
          const data = doc.data();
          if (data.userId && !data.clockOut) {
            attendanceMap[data.userId] = {
              clockIn: data.clockIn?.toDate() || new Date(),
              onBreak: data.onBreak || false
            };
          }
        });
      } catch {
        // Attendance collection might not exist yet
      }

      // Fetch today's orders for productivity
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
        const attendance = attendanceMap[doc.id];
        const ordersCompleted = ordersByProcessor[doc.id] || 0;
        return {
          id: doc.id,
          name: data.name || 'Unknown',
          role: data.role || 'staff',
          branchId: data.branchId || '',
          branchName: branchMap[data.branchId] || 'Unassigned',
          isOnDuty: !!attendance,
          clockInTime: attendance?.clockIn,
          currentTask: attendance ? 'Active' : undefined,
          ordersCompleted,
          productivity: Math.min(100, ordersCompleted * 12) // Simplified
        };
      });

      setStaff(staffList);

      // Calculate summary
      const onDutyCount = staffList.filter(s => s.isOnDuty).length;
      const onBreakCount = Object.values(attendanceMap).filter(a => a.onBreak).length;
      const avgProd = onDutyCount > 0
        ? Math.round(staffList.filter(s => s.isOnDuty).reduce((a, b) => a + b.productivity, 0) / onDutyCount)
        : 0;

      setSummary({
        totalStaff: staffList.length,
        onDuty: onDutyCount,
        onBreak: onBreakCount,
        avgProductivity: avgProd
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
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = filterBranch === 'all' || s.branchId === filterBranch;
    return matchesSearch && matchesBranch;
  });

  if (userData?.role !== 'general_manager') {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Staff Management</h1>
          <p className="text-gray-500 mt-1">Monitor staff attendance and productivity</p>
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
              <p className="text-xl font-semibold text-green-600">{summary.onDuty}</p>
            </div>
          </div>
        </ModernCard>
        <ModernCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Pause className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">On Break</p>
              <p className="text-xl font-semibold">{summary.onBreak}</p>
            </div>
          </div>
        </ModernCard>
        <ModernCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Productivity</p>
              <p className="text-xl font-semibold">{summary.avgProductivity}%</p>
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

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-8 text-center text-gray-500">Loading staff data...</div>
        ) : filteredStaff.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-500">No staff found</div>
        ) : (
          filteredStaff.map((member) => (
            <ModernCard key={member.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    member.isOnDuty ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <span className="text-lg font-medium">
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-500">
                      {roleDisplayNames[member.role] || member.role}
                    </p>
                  </div>
                </div>
                <ModernBadge variant={member.isOnDuty ? 'success' : 'secondary'}>
                  {member.isOnDuty ? 'Active' : 'Off'}
                </ModernBadge>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    Branch
                  </span>
                  <span className="font-medium">{member.branchName}</span>
                </div>

                {member.isOnDuty && member.clockInTime && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Clock In
                    </span>
                    <span className="font-medium">
                      {member.clockInTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    Orders Today
                  </span>
                  <span className="font-medium">{member.ordersCompleted}</span>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500">Productivity</span>
                    <span className={`font-medium ${
                      member.productivity >= 80 ? 'text-green-600' :
                      member.productivity >= 50 ? 'text-amber-600' : 'text-red-600'
                    }`}>{member.productivity}%</span>
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
              </div>
            </ModernCard>
          ))
        )}
      </div>
    </div>
  );
}
