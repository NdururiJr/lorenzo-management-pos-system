/**
 * GM Dashboard Type Definitions
 *
 * Types for the General Manager Operations Dashboard
 * @module types/gm-dashboard
 */

import type { Timestamp } from 'firebase/firestore';

/**
 * Order metrics for the day
 */
export interface OrderMetrics {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  express: number;
  trend: number; // Percentage change from previous day
}

/**
 * Revenue metrics with target tracking
 * Note: target and progress may be null if branch targets are not configured
 */
export interface RevenueMetrics {
  today: number;
  target: number | null;  // null if not configured
  progress: number | null; // Percentage of target achieved, null if target not set
  currency: string;
  previousDay: number;
  trend: number; // Percentage change
}

/**
 * Turnaround time metrics
 * Note: values may be null if no completed orders or no target configured
 */
export interface TurnaroundMetrics {
  averageHours: number | null;  // null if no completed orders
  target: number | null;  // null if not configured
  performance: 'good' | 'warning' | 'critical' | null;  // null if data insufficient
  previousDay: number | null;
}

/**
 * Staff on duty information
 */
export interface StaffOnDuty {
  id: string;
  name: string;
  role: string;
  branchId: string;
  branchName: string;
  avatarUrl?: string;
  status: 'active' | 'on_break' | 'idle';
  ordersHandled: number;
  rating: number;
  clockInTime: Date | Timestamp;
}

/**
 * Staff summary metrics
 */
export interface StaffMetrics {
  onDuty: number;
  total: number;
  onBreak: number;
  productivity: number; // Average productivity percentage
}

/**
 * Customer satisfaction metrics
 */
export interface SatisfactionMetrics {
  score: number; // Out of 5
  totalReviews: number;
  trend: number; // Change from previous period
}

/**
 * Equipment status information
 */
export interface Equipment {
  id: string;
  name: string;
  type: 'washer' | 'dryer' | 'press' | 'steamer' | 'folder';
  status: 'running' | 'idle' | 'maintenance' | 'offline';
  branchId: string;
  currentLoad?: number; // Current items being processed
  lastMaintenance?: Date | Timestamp;
  nextMaintenance?: Date | Timestamp;
  uptime?: number; // Percentage
}

/**
 * Equipment summary by type
 */
export interface EquipmentSummary {
  washers: { running: number; total: number };
  dryers: { running: number; total: number };
  presses: { running: number; total: number };
  steamers: { running: number; total: number };
  folders: { running: number; total: number };
}

/**
 * Urgent issue requiring attention
 */
export interface UrgentIssue {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  type: 'equipment' | 'order' | 'staff' | 'customer' | 'inventory';
  branchId: string;
  branchName: string;
  createdAt: Date | Timestamp;
  orderId?: string;
  assignedTo?: string;
  status: 'open' | 'in_progress' | 'resolved';
}

/**
 * Branch performance data
 */
export interface BranchPerformance {
  branchId: string;
  name: string;
  ordersToday: number;
  revenue: number;
  target: number;
  targetProgress: number; // Percentage
  efficiency: number; // Percentage
  activeIssues: number;
  staffOnDuty: number;
  status: 'on_track' | 'behind' | 'ahead';
}

/**
 * Order queue item for live order table
 */
export interface OrderQueueItem {
  orderId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: number;
  services: string[];
  status: string;
  priority: 'express' | 'standard' | 'economy';
  createdAt: Date | Timestamp;
  estimatedCompletion: Date | Timestamp;
  eta: string; // Formatted time remaining
  branchId: string;
  branchName: string;
  assignedTo?: string;
}

/**
 * Quick action types available in the dashboard
 */
export type QuickActionType =
  | 'new_order'
  | 'add_staff'
  | 'log_issue'
  | 'send_alert'
  | 'view_reports'
  | 'manage_equipment';

/**
 * Quick action button configuration
 */
export interface QuickAction {
  type: QuickActionType;
  label: string;
  icon: string;
  href?: string;
  onClick?: () => void;
}

/**
 * GM Dashboard theme modes
 */
export type GMDashboardTheme = 'operations' | 'light';

/**
 * Filter options for the dashboard
 */
export interface DashboardFilters {
  branchId: string | 'all';
  dateRange: 'today' | 'week' | 'month';
  search: string;
}

/**
 * Complete GM dashboard data structure
 */
export interface GMDashboardData {
  orders: OrderMetrics;
  revenue: RevenueMetrics;
  turnaround: TurnaroundMetrics;
  staff: StaffMetrics;
  satisfaction: SatisfactionMetrics;
  equipment: Equipment[];
  equipmentSummary: EquipmentSummary;
  issues: UrgentIssue[];
  branches: BranchPerformance[];
  liveOrders: OrderQueueItem[];
  staffOnDuty: StaffOnDuty[];
  lastUpdated: Date;
}

/**
 * Props for the main GM Operations Dashboard component
 */
export interface GMOperationsDashboardProps {
  themeMode: GMDashboardTheme;
  onThemeToggle: () => void;
  initialBranchFilter?: string;
}

/**
 * Notification/alert for the GM dashboard
 */
export interface DashboardNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date | Timestamp;
  read: boolean;
  actionUrl?: string;
}
