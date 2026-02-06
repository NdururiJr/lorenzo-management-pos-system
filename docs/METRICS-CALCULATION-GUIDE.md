# Metrics Calculation Guide

**Last Updated:** January 8, 2026
**Purpose:** Document all dashboard metric calculations for consistency and transparency.

---

## Branch Efficiency Formula

**Overall Branch Efficiency** = Weighted Average of 5 Components:

| Component | Weight | Formula |
|-----------|--------|---------|
| Turnaround Efficiency | 25% | `min(100, 100 + ((Target - Actual) / Target × 100))` |
| Staff Productivity | 25% | `min(100, (Orders / (Staff × Hours)) / Target Rate × 100)` |
| Equipment Utilization | 20% | `(Running Hours / Available Hours) / Optimal × 100` |
| Revenue Achievement | 20% | `(Actual Revenue / Target Revenue) × 100` |
| Customer Satisfaction | 10% | `(Average Rating / 5.0) × 100` |

---

## Component 1: Turnaround Efficiency (25%)

**Purpose:** Measures how quickly orders are completed vs target time.

**Formula:**
```
If Actual <= Target:
  Score = 100% (capped - beating target)

If Actual > Target:
  Score = 100 - ((Actual - Target) / Target × 100)
```

**Example - Kilimani:**
- Target: 24 hours
- Actual Average: 18.5 hours
- Score: 100% (beating target by 5.5 hours)

**Example - Westlands:**
- Target: 24 hours
- Actual Average: 22.8 hours
- Score: 100% (still within target)

**Code Implementation:**
```typescript
function calculateTurnaroundEfficiency(actualHours: number, targetHours: number): number {
  if (actualHours <= targetHours) {
    return 100; // Capped at 100% when beating target
  }
  const score = 100 - ((actualHours - targetHours) / targetHours * 100);
  return Math.max(0, score); // Don't go below 0
}
```

---

## Component 2: Staff Productivity (25%)

**Purpose:** Measures orders completed per staff hour vs target rate.

**Formula:**
```
Productivity Rate = Orders Completed / (Staff × Hours Worked)
Score = min(100, (Productivity Rate / Target Rate) × 100)
```

**Target Rate:** 1.5 orders per staff-hour (configurable)

**Example - Kilimani:**
- Orders: 68
- Staff: 5
- Hours: 8 (standard shift)
- Rate: 68 / (5 × 8) = 1.7 orders/hour
- Score: (1.7 / 1.5) × 100 = 113% → **capped at 100%**

**Example - Westlands:**
- Orders: 59
- Staff: 4
- Hours: 8
- Rate: 59 / (4 × 8) = 1.84 orders/hour
- Score: (1.84 / 1.5) × 100 = 123% → **capped at 100%**

**Code Implementation:**
```typescript
function calculateStaffProductivity(
  ordersCompleted: number,
  staffCount: number,
  hoursWorked: number,
  targetRate: number = 1.5
): number {
  const productivityRate = ordersCompleted / (staffCount * hoursWorked);
  const score = (productivityRate / targetRate) * 100;
  return Math.min(100, score); // Cap at 100%
}
```

---

## Component 3: Equipment Utilization (20%)

**Purpose:** Measures how effectively equipment is being used.

**Formula:**
```
Utilization = (Equipment Running Hours / Total Available Hours) × 100
Score = (Utilization / Optimal Utilization) × 100
```

**Optimal Range:** 70-85% (75% is target)
- **100% utilization is BAD** (no buffer for peak times or emergencies)
- **<60% is underutilized** (equipment sitting idle)
- **Sweet spot: 70-85%**

**Example - Kilimani:**
- Machines: 10
- Running: 6 machines × 6 hours each = 36 running hours
- Capacity: 10 machines × 8 hours = 80 total hours
- Utilization: (36 / 80) × 100 = 45%
- Score: (45 / 75 target) × 100 = **60%**

**Example - Westlands:**
- Machines: 10 (1 under maintenance)
- Running: 5 machines × 7 hours = 35 running hours
- Capacity: 9 machines × 8 hours = 72 total hours
- Utilization: (35 / 72) × 100 = 49%
- Score: (49 / 75 target) × 100 = **65%**

**Code Implementation:**
```typescript
function calculateEquipmentUtilization(
  runningHours: number,
  totalAvailableHours: number,
  optimalUtilization: number = 75
): number {
  const actualUtilization = (runningHours / totalAvailableHours) * 100;
  const score = (actualUtilization / optimalUtilization) * 100;
  return Math.min(100, score); // Cap at 100%
}
```

---

## Component 4: Revenue Achievement (20%)

**Purpose:** Measures actual revenue vs daily target.

**Formula:**
```
Score = (Actual Revenue / Target Revenue) × 100
```

**Example - Kilimani:**
- Actual: KES 124,500
- Target: KES 140,000
- Score: (124,500 / 140,000) × 100 = **89%**

**Example - Westlands:**
- Actual: KES 109,500
- Target: KES 145,000
- Score: (109,500 / 145,000) × 100 = **75%**

**Code Implementation:**
```typescript
function calculateRevenueAchievement(
  actualRevenue: number,
  targetRevenue: number
): number {
  return (actualRevenue / targetRevenue) * 100;
}
```

---

## Component 5: Customer Satisfaction (10%)

**Purpose:** Measures customer feedback scores.

**Formula:**
```
Score = (Average Rating / 5.0) × 100
```

**Example - Kilimani:**
- Average Rating: 4.8/5.0
- Score: (4.8 / 5.0) × 100 = **96%**

**Example - Westlands:**
- Average Rating: 4.6/5.0
- Score: (4.6 / 5.0) × 100 = **92%**

**Code Implementation:**
```typescript
function calculateSatisfactionScore(averageRating: number): number {
  return (averageRating / 5.0) * 100;
}
```

---

## Full Calculation Examples

### Kilimani Branch

| Component | Score | Weight | Contribution |
|-----------|-------|--------|--------------|
| Turnaround Efficiency | 100% | 25% | 25.0 |
| Staff Productivity | 100% | 25% | 25.0 |
| Equipment Utilization | 60% | 20% | 12.0 |
| Revenue Achievement | 89% | 20% | 17.8 |
| Customer Satisfaction | 96% | 10% | 9.6 |
| **Total** | | | **89.4% ≈ 89%** |

### Westlands Branch

| Component | Score | Weight | Contribution |
|-----------|-------|--------|--------------|
| Turnaround Efficiency | 95% | 25% | 23.75 |
| Staff Productivity | 100% | 25% | 25.0 |
| Equipment Utilization | 65% | 20% | 13.0 |
| Revenue Achievement | 75% | 20% | 15.0 |
| Customer Satisfaction | 92% | 10% | 9.2 |
| **Total** | | | **85.95% ≈ 86%** |

### Why Westlands is Lower

1. **Slower turnaround** - 22.8hrs vs 18.5hrs average
2. **Equipment #3 under maintenance** - Reducing utilization
3. **Lower revenue target achievement** - 75% vs 89%
4. **Slightly lower customer satisfaction** - 4.6★ vs 4.8★

---

## Complete Branch Efficiency Calculation

```typescript
interface BranchEfficiencyData {
  // Turnaround
  avgTurnaroundHours: number;
  targetTurnaroundHours: number;

  // Staff Productivity
  ordersCompleted: number;
  staffOnDuty: number;
  hoursWorked: number;
  targetOrdersPerStaffHour: number;

  // Equipment
  equipmentRunningHours: number;
  equipmentTotalHours: number;
  optimalEquipmentUtilization: number;

  // Revenue
  actualRevenue: number;
  targetRevenue: number;

  // Satisfaction
  avgCustomerRating: number;
}

function calculateBranchEfficiency(data: BranchEfficiencyData): {
  overall: number;
  breakdown: {
    turnaround: number;
    productivity: number;
    equipment: number;
    revenue: number;
    satisfaction: number;
  };
} {
  // Calculate each component
  const turnaround = calculateTurnaroundEfficiency(
    data.avgTurnaroundHours,
    data.targetTurnaroundHours
  );

  const productivity = calculateStaffProductivity(
    data.ordersCompleted,
    data.staffOnDuty,
    data.hoursWorked,
    data.targetOrdersPerStaffHour
  );

  const equipment = calculateEquipmentUtilization(
    data.equipmentRunningHours,
    data.equipmentTotalHours,
    data.optimalEquipmentUtilization
  );

  const revenue = calculateRevenueAchievement(
    data.actualRevenue,
    data.targetRevenue
  );

  const satisfaction = calculateSatisfactionScore(data.avgCustomerRating);

  // Calculate weighted average
  const overall = (
    (turnaround * 0.25) +
    (productivity * 0.25) +
    (equipment * 0.20) +
    (revenue * 0.20) +
    (satisfaction * 0.10)
  );

  return {
    overall: Math.round(overall),
    breakdown: {
      turnaround: Math.round(turnaround),
      productivity: Math.round(productivity),
      equipment: Math.round(equipment),
      revenue: Math.round(revenue),
      satisfaction: Math.round(satisfaction)
    }
  };
}
```

---

## Other Dashboard Metrics

### Orders Today

```typescript
// Total Orders
const totalOrders = orders.filter(o =>
  o.createdAt >= todayStart && o.createdAt <= todayEnd
).length;

// Completed Orders
const completedOrders = orders.filter(o =>
  o.status in ['delivered', 'collected'] &&
  o.completedAt >= todayStart && o.completedAt <= todayEnd
).length;

// In Progress
const inProgressOrders = totalOrders - completedOrders;

// Completion Rate
const completionRate = (completedOrders / totalOrders) * 100;
```

### Revenue Today

```typescript
// Today's Revenue
const todaysRevenue = transactions
  .filter(t => t.timestamp >= todayStart && t.timestamp <= todayEnd)
  .reduce((sum, t) => sum + t.amount, 0);

// Target from branch config
const target = branch.dailyTarget;

// Achievement percentage
const achievement = (todaysRevenue / target) * 100;
```

### Average Turnaround Time

```typescript
// Get completed orders today
const completedToday = orders.filter(o =>
  o.status in ['delivered', 'collected'] &&
  o.completedAt >= todayStart
);

// Calculate average turnaround in hours
const totalHours = completedToday.reduce((sum, order) => {
  const turnaround = order.completedAt.toMillis() - order.createdAt.toMillis();
  return sum + (turnaround / (1000 * 60 * 60)); // Convert to hours
}, 0);

const avgTurnaround = totalHours / completedToday.length;
```

### Staff on Duty

```typescript
// Query attendance for today
const staffOnDuty = attendance.filter(a =>
  a.date === today &&
  a.checkIn != null &&
  (a.checkOut == null || a.checkOut > now)
).length;
```

### Customer Satisfaction Score

```typescript
// Query feedback for today
const todayFeedback = customerFeedback.filter(f =>
  f.createdAt >= todayStart
);

// Calculate average
const avgRating = todayFeedback.reduce((sum, f) => sum + f.rating, 0)
  / todayFeedback.length;

// Count reviews
const totalReviews = todayFeedback.length;
```

---

## Configuration Values

Store these in Firestore `branches` collection or a `systemSettings` collection:

| Setting | Default | Location | Description |
|---------|---------|----------|-------------|
| `targetTurnaroundHours` | 24 | `branch.targetTurnaroundHours` | Target order completion time |
| `targetOrdersPerStaffHour` | 1.5 | `systemSettings` | Target productivity rate |
| `optimalEquipmentUtilization` | 75 | `systemSettings` | Target equipment usage (%) |
| `dailyRevenueTarget` | Per branch | `branch.dailyTarget` | Daily revenue target in KES |

---

## Database Schema Requirements

### Branch Collection Updates

```typescript
interface Branch {
  // ... existing fields

  // Performance targets
  dailyTarget: number;           // Daily revenue target in KES
  targetTurnaroundHours: number; // Target completion time (default: 24)
}
```

### System Settings Collection (Optional)

```typescript
interface SystemSettings {
  id: 'default';

  // Performance targets
  targetOrdersPerStaffHour: number;      // Default: 1.5
  optimalEquipmentUtilization: number;   // Default: 75

  // Alert thresholds
  turnaroundWarningHours: number;        // Alert if > this value
  lowEquipmentUtilization: number;       // Alert if < this value
  lowRevenueAchievement: number;         // Alert if < this value
}
```

---

## Files to Modify

| File | Change |
|------|--------|
| `lib/db/gm-dashboard.ts` | Implement `calculateBranchEfficiency()` function |
| `lib/db/schema.ts` | Add `targetOrdersPerStaffHour` to Branch or create SystemSettings |
| `components/features/gm/BranchDetailView.tsx` | Display efficiency breakdown UI |
| `components/dashboard/gm/GMBranchPerformance.tsx` | Use real efficiency calculation |

---

## References

- **GM Dashboard Reference:** `reference/lorenzo-gm-dashboard-full.jsx` (lines 1176-1723)
- **Branch Performance Component:** `PerformancePage()` function
- **Efficiency Breakdown:** `BranchDetailView()` component

---

*Document Created: January 8, 2026*
