'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ModernCard } from '@/components/modern/ModernCard';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  FileText,
  ArrowRight,
  Building2,
  DollarSign,
  Package,
  Users,
  Clock
} from 'lucide-react';

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  frequency: string;
  lastGenerated?: string;
}

const reportTypes: ReportType[] = [
  {
    id: 'revenue',
    name: 'Revenue Report',
    description: 'Comprehensive revenue analysis across all branches',
    icon: DollarSign,
    frequency: 'Daily, Weekly, Monthly'
  },
  {
    id: 'operations',
    name: 'Operations Report',
    description: 'Order processing, turnaround times, and efficiency metrics',
    icon: Package,
    frequency: 'Daily, Weekly'
  },
  {
    id: 'branch-performance',
    name: 'Branch Performance',
    description: 'Compare performance across all branches',
    icon: Building2,
    frequency: 'Weekly, Monthly'
  },
  {
    id: 'staff-productivity',
    name: 'Staff Productivity',
    description: 'Individual and team productivity metrics',
    icon: Users,
    frequency: 'Weekly, Monthly'
  },
  {
    id: 'customer-insights',
    name: 'Customer Insights',
    description: 'Customer satisfaction, retention, and feedback analysis',
    icon: TrendingUp,
    frequency: 'Monthly'
  },
  {
    id: 'turnaround',
    name: 'Turnaround Analysis',
    description: 'Order processing times and bottleneck identification',
    icon: Clock,
    frequency: 'Daily, Weekly'
  }
];

export default function DirectorReportsPage() {
  const { userData } = useAuth();
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'quarter'>('month');

  // Verify director role
  useEffect(() => {
    if (userData && userData.role !== 'director') {
      router.push('/dashboard');
    }
  }, [userData, router]);

  const handleGenerateReport = (reportId: string) => {
    // TODO: Implement report generation
    console.log('Generating report:', reportId, 'for period:', selectedPeriod);
  };

  if (userData?.role !== 'director') {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Strategic Reports</h1>
          <p className="text-gray-500 mt-1">Generate and view comprehensive business reports</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <ModernCard className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">Report Period:</span>
          </div>
          <div className="flex gap-2">
            {(['today', 'week', 'month', 'quarter'] as const).map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
                className={selectedPeriod === period ? 'bg-lorenzo-teal hover:bg-lorenzo-teal/90' : ''}
              >
                {period === 'today' ? 'Today' :
                 period === 'week' ? 'This Week' :
                 period === 'month' ? 'This Month' : 'This Quarter'}
              </Button>
            ))}
          </div>
        </div>
      </ModernCard>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ModernCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Reports Generated</p>
              <p className="text-xl font-semibold">24</p>
            </div>
          </div>
        </ModernCard>
        <ModernCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Download className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Downloads</p>
              <p className="text-xl font-semibold">156</p>
            </div>
          </div>
        </ModernCard>
        <ModernCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Scheduled</p>
              <p className="text-xl font-semibold">3</p>
            </div>
          </div>
        </ModernCard>
        <ModernCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Data Points</p>
              <p className="text-xl font-semibold">1.2K</p>
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <ModernCard key={report.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-lorenzo-teal/10 rounded-xl">
                  <Icon className="w-6 h-6 text-lorenzo-teal" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{report.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                  <p className="text-xs text-gray-400 mt-2">Available: {report.frequency}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleGenerateReport(report.id)}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Generate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerateReport(report.id)}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </ModernCard>
          );
        })}
      </div>

      {/* Recent Reports */}
      <ModernCard>
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Reports</h2>
        </div>
        <div className="divide-y divide-gray-100">
          <div className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Weekly Revenue Report</p>
                <p className="text-sm text-gray-500">Generated Jan 12, 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4" />
              </Button>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          <div className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Monthly Branch Performance</p>
                <p className="text-sm text-gray-500">Generated Jan 1, 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4" />
              </Button>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          <div className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Staff Productivity Analysis</p>
                <p className="text-sm text-gray-500">Generated Dec 31, 2025</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4" />
              </Button>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </ModernCard>
    </div>
  );
}
