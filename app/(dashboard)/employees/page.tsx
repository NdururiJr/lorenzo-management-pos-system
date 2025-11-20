/**
 * Employees Management Page
 *
 * Modern employee management interface with glassmorphic design and blue theme.
 * Features attendance tracking and productivity metrics with smooth animations.
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  UserPlus,
  Clock,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModernCard, ModernCardHeader, ModernCardContent } from '@/components/modern/ModernCard';
import { ModernButton } from '@/components/modern/ModernButton';
import { ModernSection } from '@/components/modern/ModernLayout';
import { ModernStatCard } from '@/components/modern/ModernStatCard';
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
  const { userData } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');

  // Fetch employees
  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ['employees', userData?.branchId],
    queryFn: async () => {
      if (!userData?.branchId) return [];

      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('branchId', '==', userData.branchId),
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
    enabled: !!userData?.branchId,
  });

  const activeEmployees = employees.filter((e) => e.status === 'active').length;
  const totalEmployees = employees.length;

  return (
    <ModernSection animate>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-blue-dark via-brand-blue to-brand-blue-dark bg-clip-text text-transparent flex items-center gap-3">
              <motion.div
                initial={{ rotate: -10 }}
                animate={{ rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <Users className="w-8 h-8 text-brand-blue" />
              </motion.div>
              Employee Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage employees, track attendance, and monitor productivity
            </p>
          </div>
          <ModernButton
            onClick={() => setShowAddModal(true)}
            leftIcon={<UserPlus className="h-4 w-4" />}
          >
            Add Employee
          </ModernButton>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <ModernStatCard
          title="Total Employees"
          value={totalEmployees}
          icon={<Users className="h-5 w-5" />}
          changeLabel="All staff members"
          delay={0.1}
        />
        <ModernStatCard
          title="Active"
          value={activeEmployees}
          icon={<Users className="h-5 w-5" />}
          changeLabel="Currently active"
          trend="up"
          delay={0.2}
        />
        <ModernStatCard
          title="Clocked In Today"
          value="--"
          icon={<Clock className="h-5 w-5" />}
          changeLabel="On duty now"
          delay={0.3}
        />
        <ModernStatCard
          title="Avg Productivity"
          value="--"
          icon={<TrendingUp className="h-5 w-5" />}
          changeLabel="Orders per day"
          delay={0.4}
        />
      </div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="bg-white/70 backdrop-blur-xl border border-brand-blue/20">
            <TabsTrigger value="all">All Employees</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="productivity">Productivity</TabsTrigger>
          </TabsList>

          {/* All Employees Tab */}
          <TabsContent value="all" className="mt-6">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ModernCard>
                    <ModernCardContent className="py-12">
                      <div className="text-center space-y-4">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        >
                          <Loader2 className="w-8 h-8 mx-auto text-brand-blue" />
                        </motion.div>
                        <p className="text-sm text-gray-600">Loading employees...</p>
                      </div>
                    </ModernCardContent>
                  </ModernCard>
                </motion.div>
              ) : employees.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <ModernCard className="bg-gradient-to-br from-gray-50 to-gray-100/50 border-dashed border-2 border-gray-300">
                    <ModernCardContent className="py-12">
                      <div className="text-center space-y-4">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          <Users className="w-16 h-16 mx-auto text-gray-300" />
                        </motion.div>
                        <div>
                          <p className="font-semibold text-gray-900">No employees found</p>
                          <p className="text-sm text-gray-500 mt-1">Add your first employee to get started</p>
                        </div>
                        <ModernButton
                          onClick={() => setShowAddModal(true)}
                          leftIcon={<UserPlus className="h-4 w-4" />}
                        >
                          Add Employee
                        </ModernButton>
                      </div>
                    </ModernCardContent>
                  </ModernCard>
                </motion.div>
              ) : (
                <motion.div
                  key="table"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <EmployeeTable employees={employees} />
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AttendanceView employees={employees} />
            </motion.div>
          </TabsContent>

          {/* Productivity Tab */}
          <TabsContent value="productivity" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ProductivityDashboard employees={employees} />
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Add Employee Modal */}
      <AddEmployeeModal open={showAddModal} onOpenChange={setShowAddModal} />
    </ModernSection>
  );
}
