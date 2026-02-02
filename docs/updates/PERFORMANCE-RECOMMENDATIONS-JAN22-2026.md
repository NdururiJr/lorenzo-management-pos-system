# Performance & Real-Time Recommendations

**Source:** `docs/COMPLETE-SYSTEM-ANALYSIS.md`
**Date:** January 22, 2026
**Status:** ✅ Captured in Test Plan v2.1 (Section 2.6 & 2.7) - January 24, 2026

---

## Executive Summary

These recommendations address **system responsiveness and scalability** issues that will impact production performance, especially as order volume grows.

---

## Recommendation 1: Real-Time Listeners (HIGH PRIORITY)

### Current State
- Dashboards use **polling** every 15-60 seconds
- No Firestore `onSnapshot` listeners used
- Staff unaware of new orders for up to 60 seconds

### Production Impact: HIGH

| Issue | Real-World Impact |
|-------|-------------------|
| 15-60 second delays | Staff appears unresponsive to customers |
| No instant updates | Customer at counter waiting while staff refreshes |
| Multiple API calls/minute | Higher Firestore read costs at scale |

### Solution

Replace polling with Firestore `onSnapshot` listeners for critical data.

**Files to modify:**
| File | Change |
|------|--------|
| `hooks/useGMDashboard.ts` | Add real-time listeners for live order queue |
| `components/features/director/DirectorKPICards.tsx` | Add listeners for KPIs |
| `lib/db/gm-dashboard.ts` | Convert polling queries to onSnapshot |

**Implementation Example:**
```typescript
// Real-time order count (replaces polling)
useEffect(() => {
  const unsubscribe = onSnapshot(
    query(collection(db, 'orders'), where('createdAt', '>=', startOfDay)),
    (snapshot) => {
      setTodayOrderCount(snapshot.size);
    }
  );
  return unsubscribe;
}, []);
```

### Priority: **P1 - MUST FIX for production**

---

## Recommendation 2: Pre-Computed Daily Aggregates (MEDIUM-HIGH PRIORITY)

### Current State
- Every dashboard refresh queries ALL orders for the day
- No caching of computed stats
- All calculations done client-side

### Production Impact: MEDIUM-HIGH (scales with volume)

| Order Volume | Dashboard Load Time | Firestore Reads/Day |
|--------------|--------------------|--------------------|
| 20 orders/day | ~2 seconds ✅ | ~50K |
| 100 orders/day | ~4 seconds ⚠️ | ~250K |
| 500 orders/day | ~8+ seconds ❌ | ~1.2M |

**Cost Projection:**
```
20 branches × 60 refreshes/hour × 8 hours × 500 orders = 4.8M reads/day
At $0.06 per 100K reads = ~$2.88/day = $86/month just for dashboard
```

### Solution

Cloud Function updates daily stats atomically on order create.

**New collection:** `dailyStats/{branchId}_{date}`
```typescript
{
  branchId: string,
  date: '2025-01-21',
  orderCount: number,
  revenue: number,
  completedCount: number,
  avgTurnaround: number,
  hourlyRevenue: Record<string, number>, // { "09": 5000, "10": 8000 }
  lastUpdated: timestamp
}
```

**Files to modify:**
- `functions/src/triggers/orders.ts` - Add counter increment logic
- `lib/db/gm-dashboard.ts` - Read from dailyStats instead of recalculating

### Priority: **P2 - Fix within 30 days of launch**

---

## Recommendation 3: Dashboard Toast Notifications (LOW-MEDIUM PRIORITY)

### Current State
- No visual alert when new orders arrive
- Staff must actively watch dashboard

### Production Impact: LOW-MEDIUM (UX improvement)

| Issue | Real-World Impact |
|-------|-------------------|
| Silent order arrivals | Orders sit unnoticed if staff multitasking |
| No audio/visual cue | Slower response to new orders |

### Solution

Use Firestore listener to show toast notifications.

```typescript
// In GMOperationsDashboard.tsx
useEffect(() => {
  const unsubscribe = onSnapshot(
    query(collection(db, 'orders'), where('createdAt', '>=', sessionStartTime)),
    (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          toast.info(`New order: ${change.doc.data().orderId}`);
        }
      });
    }
  );
  return unsubscribe;
}, []);
```

### Priority: **P3 - Nice to have**

---

## Recommendation 4: Historical Trend Storage (MEDIUM PRIORITY)

### Current State
- Recalculates trends on every view
- No stored historical snapshots
- Period comparisons query raw data each time

### Production Impact: MEDIUM

| Issue | Real-World Impact |
|-------|-------------------|
| Slow Director dashboard | Every "vs yesterday" requires full query |
| No point-in-time snapshots | Can't answer "what was revenue last Tuesday at 3pm?" |
| Expensive period comparisons | Increases with data volume |

### Solution

Store daily snapshots in `dailyStats` collection (see Recommendation 2).

### Priority: **P3 - Nice to have**

---

## Recommendation 5: Revenue by Hour Tracking (LOW PRIORITY)

### Current State
- No hourly revenue breakdown stored
- Can't identify peak hours

### Production Impact: LOW-MEDIUM (analytics limitation)

| Issue | Real-World Impact |
|-------|-------------------|
| No "lunch rush" visibility | Inefficient staff scheduling |
| No time-based insights | Missing optimization opportunities |

### Solution

Add `hourlyRevenue` field to `dailyStats` (see Recommendation 2).

### Priority: **P4 - Future enhancement**

---

## Summary: Priority Matrix

| Recommendation | Priority | When to Fix | Why |
|---------------|----------|-------------|-----|
| **Real-Time Listeners** | **P1** | **Before launch** | 60s delays unacceptable for live ops |
| **Pre-Computed Aggregates** | **P2** | Within 30 days | System slows as volume grows |
| **Toast Notifications** | P3 | Post-launch | UX improvement, not critical |
| **Historical Trend Storage** | P3 | Post-launch | Can work with slower queries |
| **Revenue by Hour** | P4 | Future | Analytics feature, not blocking |

---

## Files Summary

### Must Modify for P1 (Real-Time Listeners)
- `hooks/useGMDashboard.ts`
- `components/features/director/DirectorKPICards.tsx`
- `lib/db/gm-dashboard.ts`

### Must Create/Modify for P2 (Pre-Computed Aggregates)
- `functions/src/triggers/orders.ts`
- `lib/db/gm-dashboard.ts`
- `lib/db/schema.ts` (add DailyStats interface)

---

## Verification After Implementation

1. **Real-Time Listeners:**
   - Create order in POS
   - GM Dashboard should update within 2 seconds (not 15-60)
   - No page refresh needed

2. **Pre-Computed Aggregates:**
   - Dashboard load time should remain <3 seconds even with 500+ orders
   - Firestore reads should decrease by ~80%

3. **Toast Notifications:**
   - Create order in POS
   - Toast should appear on GM dashboard immediately

---

**Document Created:** January 22, 2026
**To be merged with:** CONSOLIDATED-FIX-PLAN-JAN22-2026.md