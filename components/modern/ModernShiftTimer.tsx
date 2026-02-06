'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Clock, Coffee, AlertCircle, Loader2 } from 'lucide-react';
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AttendanceRecord } from '@/lib/db/schema';
import { startOfDay, endOfDay, format } from 'date-fns';

interface ModernShiftTimerProps {
  /** Employee ID to track (required for real data) */
  employeeId?: string;
  /** Initial seconds (fallback when no attendance data) */
  initialSeconds?: number;
  /** Shift duration in seconds (default 8 hours) */
  shiftDuration?: number;
  className?: string;
  /** Callback when time updates */
  onTimeUpdate?: (seconds: number) => void;
}

export function ModernShiftTimer({
  employeeId,
  initialSeconds = 0,
  shiftDuration = 28800, // 8 hours in seconds
  className = '',
  onTimeUpdate,
}: ModernShiftTimerProps) {
  const [timerSeconds, setTimerSeconds] = useState(initialSeconds);
  const [isWorking, setIsWorking] = useState(false);
  const [loading, setLoading] = useState(!!employeeId);
  const [attendance, setAttendance] = useState<AttendanceRecord | null>(null);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);

  // Subscribe to real-time attendance updates
  useEffect(() => {
    if (!employeeId) {
      setLoading(false);
      return;
    }

    const today = startOfDay(new Date());
    const tomorrow = endOfDay(new Date());

    // Query today's attendance for this employee
    const attendanceQuery = query(
      collection(db, 'attendance'),
      where('employeeId', '==', employeeId),
      where('date', '>=', Timestamp.fromDate(today)),
      where('date', '<=', Timestamp.fromDate(tomorrow))
    );

    const unsubscribe = onSnapshot(
      attendanceQuery,
      (snapshot) => {
        setLoading(false);

        if (snapshot.empty) {
          // No attendance record today
          setAttendance(null);
          setIsWorking(false);
          setCheckInTime(null);
          setTimerSeconds(0);
          return;
        }

        // Get the most recent attendance record
        const records = snapshot.docs.map(doc => doc.data() as AttendanceRecord);
        const latestRecord = records[0];

        setAttendance(latestRecord);

        // Check if currently working (clocked in but not clocked out)
        if (latestRecord.checkIn && !latestRecord.checkOut) {
          setIsWorking(true);
          const checkIn = latestRecord.checkIn instanceof Timestamp
            ? latestRecord.checkIn.toDate()
            : new Date(latestRecord.checkIn as unknown as string);
          setCheckInTime(checkIn);

          // Calculate elapsed time
          const elapsed = Math.floor((Date.now() - checkIn.getTime()) / 1000);
          setTimerSeconds(elapsed);
        } else if (latestRecord.checkOut) {
          // Already clocked out
          setIsWorking(false);
          const checkIn = latestRecord.checkIn instanceof Timestamp
            ? latestRecord.checkIn.toDate()
            : new Date(latestRecord.checkIn as unknown as string);
          const checkOut = latestRecord.checkOut instanceof Timestamp
            ? latestRecord.checkOut.toDate()
            : new Date(latestRecord.checkOut as unknown as string);

          setCheckInTime(checkIn);
          const totalWorked = Math.floor((checkOut.getTime() - checkIn.getTime()) / 1000);
          setTimerSeconds(totalWorked);
        } else {
          // No check-in yet
          setIsWorking(false);
          setCheckInTime(null);
          setTimerSeconds(0);
        }
      },
      (error) => {
        console.error('Error listening to attendance:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [employeeId]);

  // Update timer every second while working
  useEffect(() => {
    if (!isWorking || !checkInTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - checkInTime.getTime()) / 1000);
      setTimerSeconds(elapsed);
      onTimeUpdate?.(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [isWorking, checkInTime, onTimeUpdate]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins.toString().padStart(2, '0')}m`;
  };

  const progress = Math.min((timerSeconds / shiftDuration) * 100, 100);
  const circumference = 2 * Math.PI * 52; // radius of 52
  const strokeDashoffset = circumference - (circumference * progress) / 100;

  // Get status text and color
  const getStatusInfo = useCallback(() => {
    if (loading) {
      return { text: 'Loading...', color: 'text-gray-400', bg: 'bg-gray-100' };
    }
    if (!attendance) {
      return { text: 'Not Clocked In', color: 'text-amber-600', bg: 'bg-amber-100' };
    }
    if (isWorking) {
      return { text: 'On Shift', color: 'text-green-600', bg: 'bg-green-100' };
    }
    if (attendance.checkOut) {
      return { text: 'Shift Completed', color: 'text-blue-600', bg: 'bg-blue-100' };
    }
    return { text: 'Unknown', color: 'text-gray-600', bg: 'bg-gray-100' };
  }, [loading, attendance, isWorking]);

  const status = getStatusInfo();

  return (
    <div
      className={cn(
        'bg-white rounded-3xl p-6 shadow-card-teal border border-lorenzo-teal/10',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-lorenzo-dark-teal">Shift Timer</h3>
        <span
          className={cn(
            'w-2 h-2 rounded-full',
            isWorking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
          )}
        />
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="w-8 h-8 animate-spin text-lorenzo-teal/50" />
        </div>
      ) : (
        <>
          {/* Circular Timer */}
          <div className="flex justify-center mb-4">
            <div className="relative w-32 h-32">
              <svg width="128" height="128" className="transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="64"
                  cy="64"
                  r="52"
                  fill="none"
                  stroke="#0F3D38"
                  strokeOpacity="0.1"
                  strokeWidth="8"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="64"
                  cy="64"
                  r="52"
                  fill="none"
                  stroke={isWorking ? '#10B981' : '#0F3D38'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 0.5 }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="text-2xl font-light text-lorenzo-dark-teal tabular-nums"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {formatTime(timerSeconds)}
                </span>
                <span className="text-[10px] text-lorenzo-teal/50">
                  of {formatDuration(shiftDuration)}
                </span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center mb-3">
            <span className={cn('px-3 py-1 rounded-full text-xs font-medium', status.bg, status.color)}>
              {status.text}
            </span>
          </div>

          {/* Check-in Info */}
          {checkInTime && (
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-xs text-lorenzo-teal/70">
                <Clock className="w-3 h-3" />
                <span>Clocked in at {format(checkInTime, 'h:mm a')}</span>
              </div>
              {attendance?.checkOut && (
                <div className="flex items-center justify-center gap-1.5 text-xs text-lorenzo-teal/70">
                  <Coffee className="w-3 h-3" />
                  <span>
                    Clocked out at{' '}
                    {format(
                      attendance.checkOut instanceof Timestamp
                        ? attendance.checkOut.toDate()
                        : new Date(attendance.checkOut as unknown as string),
                      'h:mm a'
                    )}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Not Clocked In Message */}
          {!attendance && (
            <div className="flex items-center justify-center gap-2 text-xs text-amber-600">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Clock in via biometric to start</span>
            </div>
          )}

          {/* Attendance Status */}
          {attendance && attendance.status && (
            <div className="mt-3 pt-3 border-t border-lorenzo-teal/10">
              <div className="flex justify-between items-center text-xs">
                <span className="text-lorenzo-teal/60">Status</span>
                <span
                  className={cn(
                    'capitalize font-medium',
                    attendance.status === 'present' && 'text-green-600',
                    attendance.status === 'late' && 'text-amber-600',
                    attendance.status === 'half_day' && 'text-orange-600',
                    attendance.status === 'absent' && 'text-red-600'
                  )}
                >
                  {attendance.status.replace('_', ' ')}
                </span>
              </div>
              {attendance.hoursWorked && (
                <div className="flex justify-between items-center text-xs mt-1">
                  <span className="text-lorenzo-teal/60">Hours Worked</span>
                  <span className="font-medium text-lorenzo-dark-teal">
                    {attendance.hoursWorked.toFixed(1)}h
                  </span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
