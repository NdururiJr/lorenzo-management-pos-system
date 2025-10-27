/**
 * Productivity Dashboard Component
 *
 * Displays employee productivity metrics and charts.
 *
 * @module components/features/employees/ProductivityDashboard
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Package, DollarSign, Clock, TrendingUp } from 'lucide-react';
import type { Employee } from '@/app/(dashboard)/employees/page';

interface ProductivityDashboardProps {
  employees: Employee[];
}

export function ProductivityDashboard({ employees }: ProductivityDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Employee</label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Time Period</label>
              <Select defaultValue="week">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Metric</label>
              <Select defaultValue="orders">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="orders">Orders Processed</SelectItem>
                  <SelectItem value="revenue">Revenue Generated</SelectItem>
                  <SelectItem value="time">Processing Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Orders Processed
            </CardTitle>
            <Package className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">--</div>
            <p className="text-xs text-gray-600 mt-1">No data available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Revenue Generated
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$--</div>
            <p className="text-xs text-gray-600 mt-1">No data available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg Processing Time
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">-- min</div>
            <p className="text-xs text-gray-600 mt-1">No data available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Efficiency Score
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">--%</div>
            <p className="text-xs text-gray-600 mt-1">No data available</p>
          </CardContent>
        </Card>
      </div>

      {/* Employee Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performers This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {employees.slice(0, 5).map((employee, index) => (
              <div
                key={employee.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{employee.displayName}</p>
                    <p className="text-sm text-gray-600">{employee.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">-- orders</p>
                  <p className="text-sm text-gray-600">$-- revenue</p>
                </div>
              </div>
            ))}
          </div>
          {employees.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No productivity data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
