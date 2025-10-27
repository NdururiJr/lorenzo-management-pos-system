/**
 * Employees Management Page
 *
 * Comprehensive employee management, attendance tracking,
 * and productivity metrics.
 *
 * @module app/(dashboard)/employees/page
 */

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  UserPlus,
  Clock,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { EmployeeTable } from '@/components/features/employees/EmployeeTable';
import { AddEmployeeModal } from '@/components/features/employees/AddEmployeeModal';
import { AttendanceView } from '@/components/features/employees/AttendanceView';
import { ProductivityDashboard } from '@/components/features/employees/ProductivityDashboard';

export interface Employee {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  role: 'front_desk' | 'workstation' | 'driver' | 'manager' | 'admin';
  branchId: string;
  status: 'active' | 'inactive';
  createdAt: any;
}

export default function EmployeesPage() {
  const { user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');

  // Fetch employees
  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ['employees', user?.branchId],
    queryFn: async () => {
      if (!user?.branchId) return [];

      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('branchId', '==', user.branchId),
        where('role', 'in', ['front_desk', 'workstation', 'driver', 'manager']),
        orderBy('displayName', 'asc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        uid: doc.id,
        ...doc.data(),
      })) as Employee[];
    },
    enabled: !!user?.branchId,
  });

  const activeEmployees = employees.filter((e) => e.status === 'active').length;
  const totalEmployees = employees.length;

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-black">Employee Management</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage employees, track attendance, and monitor productivity
              </p>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Employees
              </CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">{totalEmployees}</div>
              <p className="text-xs text-gray-600 mt-1">All staff members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active
              </CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeEmployees}</div>
              <p className="text-xs text-gray-600 mt-1">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Clocked In Today
              </CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">--</div>
              <p className="text-xs text-gray-600 mt-1">On duty now</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Avg Productivity
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">--</div>
              <p className="text-xs text-gray-600 mt-1">Orders per day</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="all">All Employees</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="productivity">Productivity</TabsTrigger>
          </TabsList>

          {/* All Employees Tab */}
          <TabsContent value="all" className="mt-6">
            {isLoading ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                    <p className="text-sm text-gray-600 mt-2">Loading employees...</p>
                  </div>
                </CardContent>
              </Card>
            ) : employees.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="font-semibold">No employees found</p>
                    <p className="text-sm mt-1">Add your first employee to get started</p>
                    <Button
                      onClick={() => setShowAddModal(true)}
                      className="mt-4 bg-blue-600 hover:bg-blue-700"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Employee
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <EmployeeTable employees={employees} />
            )}
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="mt-6">
            <AttendanceView employees={employees} />
          </TabsContent>

          {/* Productivity Tab */}
          <TabsContent value="productivity" className="mt-6">
            <ProductivityDashboard employees={employees} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Employee Modal */}
      <AddEmployeeModal open={showAddModal} onOpenChange={setShowAddModal} />
    </div>
  );
}
