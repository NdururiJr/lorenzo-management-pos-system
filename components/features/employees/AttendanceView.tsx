/**
 * Attendance View Component
 *
 * Displays real-time attendance records and clock in/out functionality.
 * Connects to biometric attendance data from the attendance service.
 *
 * @module components/features/employees/AttendanceView
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Clock,
  CheckCircle2,
  XCircle,
  CalendarIcon,
  Loader2,
  AlertCircle,
  Fingerprint,
  RefreshCw,
} from 'lucide-react';
import { format, startOfDay, endOfDay, isToday, subDays } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  clockIn,
  clockOut,
  getAttendanceHistory,
} from '@/lib/db/attendance';
import type { AttendanceRecord } from '@/lib/db/schema';

interface AttendanceViewProps {
  /** Current user's employee ID (for manual clock in/out) */
  employeeId?: string;
  /** Branch ID to filter attendance */
  branchId?: string;
  /** Show clock in/out section */
  showClockInOut?: boolean;
  /** Show team attendance list */
  showTeamAttendance?: boolean;
  /** Callback when attendance changes */
  onAttendanceChange?: () => void;
}

export function AttendanceView({
  employeeId,
  branchId,
  showClockInOut = true,
  showTeamAttendance = true,
  onAttendanceChange,
}: AttendanceViewProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [teamAttendance, setTeamAttendance] = useState<AttendanceRecord[]>([]);
  const queryClient = useQueryClient();

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Subscribe to real-time attendance updates for current employee
  useEffect(() => {
    if (!employeeId) return;

    const today = startOfDay(new Date());
    const tomorrow = endOfDay(new Date());

    const attendanceQuery = query(
      collection(db, 'attendance'),
      where('employeeId', '==', employeeId),
      where('date', '>=', Timestamp.fromDate(today)),
      where('date', '<=', Timestamp.fromDate(tomorrow))
    );

    const unsubscribe = onSnapshot(attendanceQuery, (snapshot) => {
      if (!snapshot.empty) {
        const record = snapshot.docs[0].data() as AttendanceRecord;
        setTodayAttendance(record);
      } else {
        setTodayAttendance(null);
      }
    });

    return () => unsubscribe();
  }, [employeeId]);

  // Subscribe to real-time team attendance updates
  useEffect(() => {
    if (!branchId) return;

    const selectedStart = startOfDay(selectedDate);
    const selectedEnd = endOfDay(selectedDate);

    const teamQuery = query(
      collection(db, 'attendance'),
      where('branchId', '==', branchId),
      where('date', '>=', Timestamp.fromDate(selectedStart)),
      where('date', '<=', Timestamp.fromDate(selectedEnd))
    );

    const unsubscribe = onSnapshot(teamQuery, (snapshot) => {
      const records = snapshot.docs.map((doc) => doc.data() as AttendanceRecord);
      setTeamAttendance(records);
    });

    return () => unsubscribe();
  }, [branchId, selectedDate]);

  // Fetch attendance history for selected date
  const { data: _historyData, isLoading: _historyLoading } = useQuery({
    queryKey: ['attendance-history', employeeId, selectedDate.toISOString()],
    queryFn: () =>
      employeeId
        ? getAttendanceHistory({
            employeeId,
            startDate: subDays(selectedDate, 7),
            endDate: selectedDate,
          })
        : Promise.resolve([]),
    enabled: !!employeeId && !isToday(selectedDate),
    staleTime: 5 * 60 * 1000,
  });

  // Manual clock in mutation
  const clockInMutation = useMutation({
    mutationFn: async () => {
      if (!employeeId || !branchId) {
        throw new Error('Employee ID and Branch ID required');
      }
      return clockIn({
        employeeId,
        branchId,
        source: 'manual',
        recordedBy: employeeId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      onAttendanceChange?.();
    },
  });

  // Manual clock out mutation
  const clockOutMutation = useMutation({
    mutationFn: async () => {
      if (!todayAttendance?.attendanceId) {
        throw new Error('No active attendance record');
      }
      return clockOut({
        attendanceId: todayAttendance.attendanceId,
        recordedBy: employeeId || 'system',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      onAttendanceChange?.();
    },
  });

  // Determine clock status
  const isClockedIn = !!todayAttendance?.checkIn && !todayAttendance?.checkOut;
  const isClockedOut = !!todayAttendance?.checkIn && !!todayAttendance?.checkOut;

  // Format check-in/out times
  const formatTime = (timestamp: unknown) => {
    if (!timestamp) return null;
    const date =
      timestamp instanceof Timestamp
        ? timestamp.toDate()
        : new Date(timestamp as string);
    return format(date, 'h:mm a');
  };

  // Get status badge variant and text
  const getStatusBadge = (record: AttendanceRecord | null) => {
    if (!record) {
      return { variant: 'outline' as const, text: 'Not Clocked In', className: 'border-gray-300 text-gray-600' };
    }
    if (record.checkIn && !record.checkOut) {
      return { variant: 'default' as const, text: 'Working', className: 'bg-green-100 text-green-800 border-green-200' };
    }
    if (record.status === 'present') {
      return { variant: 'default' as const, text: 'Present', className: 'bg-blue-100 text-blue-800 border-blue-200' };
    }
    if (record.status === 'late') {
      return { variant: 'default' as const, text: 'Late', className: 'bg-amber-100 text-amber-800 border-amber-200' };
    }
    if (record.status === 'half_day') {
      return { variant: 'default' as const, text: 'Half Day', className: 'bg-orange-100 text-orange-800 border-orange-200' };
    }
    if (record.status === 'absent') {
      return { variant: 'destructive' as const, text: 'Absent', className: 'bg-red-100 text-red-800 border-red-200' };
    }
    return { variant: 'outline' as const, text: record.status || 'Unknown', className: '' };
  };

  return (
    <div className="space-y-6">
      {/* Clock In/Out Section */}
      {showClockInOut && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Clock In/Out
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Clock className="w-16 h-16 text-gray-400" />
              <div className="text-center">
                <p className="text-3xl font-bold tabular-nums">
                  {format(currentTime, 'h:mm:ss a')}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {format(currentTime, 'EEEE, MMMM d, yyyy')}
                </p>
              </div>

              {/* Status Info */}
              {todayAttendance && (
                <div className="text-center space-y-1">
                  {todayAttendance.checkIn && (
                    <p className="text-sm text-gray-600">
                      Clocked in at {formatTime(todayAttendance.checkIn)}
                      {todayAttendance.source === 'biometric' && (
                        <span className="ml-1">
                          <Fingerprint className="w-3 h-3 inline" />
                        </span>
                      )}
                    </p>
                  )}
                  {todayAttendance.checkOut && (
                    <p className="text-sm text-gray-600">
                      Clocked out at {formatTime(todayAttendance.checkOut)}
                    </p>
                  )}
                  {todayAttendance.hoursWorked && (
                    <p className="text-sm font-medium text-gray-800">
                      Hours worked: {todayAttendance.hoursWorked.toFixed(1)}h
                    </p>
                  )}
                </div>
              )}

              {/* Clock Buttons */}
              <div className="flex gap-4">
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isClockedIn || isClockedOut || clockInMutation.isPending || !employeeId}
                  onClick={() => clockInMutation.mutate()}
                >
                  {clockInMutation.isPending ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                  )}
                  Clock In
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  disabled={!isClockedIn || clockOutMutation.isPending}
                  onClick={() => clockOutMutation.mutate()}
                >
                  {clockOutMutation.isPending ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="w-5 h-5 mr-2" />
                  )}
                  Clock Out
                </Button>
              </div>

              {/* Status Message */}
              <p className="text-xs text-gray-500 flex items-center gap-1">
                {!employeeId ? (
                  <>
                    <AlertCircle className="w-3 h-3" />
                    Employee ID required for manual clock in/out
                  </>
                ) : isClockedOut ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    Shift completed for today
                  </>
                ) : isClockedIn ? (
                  <>
                    <Clock className="w-3 h-3 text-green-600" />
                    Currently on shift
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3" />
                    You are not currently clocked in
                  </>
                )}
              </p>

              {/* Biometric Note */}
              <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded-lg">
                <Fingerprint className="w-4 h-4" />
                <span>Biometric clock-in is preferred for accurate time tracking</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Attendance */}
      {showTeamAttendance && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              {isToday(selectedDate) ? "Today's" : format(selectedDate, 'MMM d')} Attendance
            </CardTitle>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {format(selectedDate, 'MMM d, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDate(new Date())}
                disabled={isToday(selectedDate)}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teamAttendance.length > 0 ? (
                teamAttendance.map((record) => {
                  const status = getStatusBadge(record);
                  return (
                    <div
                      key={record.attendanceId}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{record.employeeId}</p>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          {record.checkIn && (
                            <span>In: {formatTime(record.checkIn)}</span>
                          )}
                          {record.checkOut && (
                            <span>Out: {formatTime(record.checkOut)}</span>
                          )}
                          {record.hoursWorked && (
                            <span className="font-medium">
                              {record.hoursWorked.toFixed(1)}h
                            </span>
                          )}
                          {record.source === 'biometric' && (
                            <Fingerprint className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <Badge variant={status.variant} className={status.className}>
                        {status.text}
                      </Badge>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>
                    {isToday(selectedDate)
                      ? 'No attendance records for today yet'
                      : `No records for ${format(selectedDate, 'MMMM d, yyyy')}`}
                  </p>
                </div>
              )}
            </div>

            {/* Summary Stats */}
            {teamAttendance.length > 0 && (
              <div className="mt-4 pt-4 border-t grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {teamAttendance.filter((r) => r.status === 'present').length}
                  </p>
                  <p className="text-xs text-gray-500">Present</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">
                    {teamAttendance.filter((r) => r.status === 'late').length}
                  </p>
                  <p className="text-xs text-gray-500">Late</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {teamAttendance.filter((r) => r.checkIn && !r.checkOut).length}
                  </p>
                  <p className="text-xs text-gray-500">Working</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-600">
                    {teamAttendance.length}
                  </p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
