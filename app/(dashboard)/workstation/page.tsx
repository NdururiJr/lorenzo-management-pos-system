/**
 * Workstation Management Page
 *
 * Main interface for managing garment processing at the workstation.
 * Includes inspection queue, batch management, and active process monitoring.
 *
 * Access Control:
 * - Workstation Manager: Full access to all tabs
 * - Workstation Staff: Limited to assigned stages
 * - Store Manager: Full access (monitoring)
 * - Director/General Manager: Full access to all branches
 *
 * @module app/(dashboard)/workstation/page
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Settings, ClipboardList, Layers, Activity, CheckCircle, Users, Award, BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WorkstationOverview } from '@/components/features/workstation/WorkstationOverview';
import { InspectionQueue } from '@/components/features/workstation/InspectionQueue';
import { QueueManagement } from '@/components/features/workstation/QueueManagement';
import { ActiveProcesses } from '@/components/features/workstation/ActiveProcesses';
import { StaffAssignment } from '@/components/features/workstation/StaffAssignment';
import { StaffPerformance } from '@/components/features/workstation/StaffPerformance';
import { WorkstationAnalytics } from '@/components/features/workstation/WorkstationAnalytics';

export default function WorkstationPage() {
  const { user, userData } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Check user permissions
  const hasWorkstationAccess =
    userData?.role === 'workstation_manager' ||
    userData?.role === 'workstation_staff' ||
    userData?.role === 'store_manager' ||
    userData?.role === 'director' ||
    userData?.role === 'general_manager';

  const isWorkstationManager =
    userData?.role === 'workstation_manager' ||
    userData?.role === 'store_manager' ||
    userData?.role === 'director' ||
    userData?.role === 'general_manager';

  if (!hasWorkstationAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-6">
          <Alert variant="destructive">
            <AlertDescription>
              You do not have permission to access the Workstation Management System.
              Please contact your administrator if you believe this is an error.
            </AlertDescription>
          </Alert>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b mb-6 rounded-lg shadow-sm">
        <div className="px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black rounded-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black">Workstation Management</h1>
              <p className="text-gray-600 text-sm">
                Manage garment processing, inspection, and quality control
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 sm:grid-cols-8 mb-4 sm:mb-8 gap-1">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="inspection" className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">Inspection</span>
            </TabsTrigger>
            <TabsTrigger value="queue" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Queue</span>
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Active</span>
            </TabsTrigger>
            <TabsTrigger value="staff" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Staff</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">Performance</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Completed</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <WorkstationOverview />
          </TabsContent>

          {/* Inspection Queue Tab */}
          <TabsContent value="inspection">
            <InspectionQueue />
          </TabsContent>

          {/* Queue Management Tab */}
          <TabsContent value="queue">
            {isWorkstationManager ? (
              <QueueManagement />
            ) : (
              <Card className="p-6">
                <Alert>
                  <AlertDescription>
                    Only Workstation Managers can create and manage batches.
                  </AlertDescription>
                </Alert>
              </Card>
            )}
          </TabsContent>

          {/* Active Processes Tab */}
          <TabsContent value="active">
            <ActiveProcesses />
          </TabsContent>

          {/* Staff Management Tab */}
          <TabsContent value="staff">
            <StaffAssignment />
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            {isWorkstationManager ? (
              <StaffPerformance />
            ) : (
              <Card className="p-6">
                <Alert>
                  <AlertDescription>
                    Only Workstation Managers can view staff performance metrics.
                  </AlertDescription>
                </Alert>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            {isWorkstationManager ? (
              <WorkstationAnalytics />
            ) : (
              <Card className="p-6">
                <Alert>
                  <AlertDescription>
                    Only Workstation Managers can view workstation analytics.
                  </AlertDescription>
                </Alert>
              </Card>
            )}
          </TabsContent>

          {/* Completed Tab */}
          <TabsContent value="completed">
            <Card className="p-6">
              <div className="text-center py-12 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Completed Orders</h3>
                <p className="text-sm">View archived completed orders and historical reports</p>
                <p className="text-xs text-gray-400 mt-2">Coming soon</p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
