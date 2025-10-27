/**
 * Attendance View Component
 *
 * Displays attendance records and clock in/out functionality.
 *
 * @module components/features/employees/AttendanceView
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import type { Employee } from '@/app/(dashboard)/employees/page';

interface AttendanceViewProps {
  employees: Employee[];
}

export function AttendanceView({ employees }: AttendanceViewProps) {
  return (
    <div className="space-y-6">
      {/* Clock In/Out Section */}
      <Card>
        <CardHeader>
          <CardTitle>Clock In/Out</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Clock className="w-16 h-16 text-gray-400" />
            <div className="text-center">
              <p className="text-2xl font-bold">
                {new Date().toLocaleTimeString()}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="flex gap-4">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Clock In
              </Button>
              <Button size="lg" variant="outline" disabled>
                <XCircle className="w-5 h-5 mr-2" />
                Clock Out
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              You are not currently clocked in
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Today's Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {employees.slice(0, 5).map((employee) => (
              <div
                key={employee.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{employee.displayName}</p>
                  <p className="text-sm text-gray-600">{employee.role}</p>
                </div>
                <Badge variant="outline" className="border-gray-300 text-gray-600">
                  Not Clocked In
                </Badge>
              </div>
            ))}
          </div>
          {employees.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No attendance records for today</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
