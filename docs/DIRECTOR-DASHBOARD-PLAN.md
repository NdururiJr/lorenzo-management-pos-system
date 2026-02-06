# Plan: Lorenzo Insights Command - Director's Dashboard Redesign

## Overview
Redesign the Director's Dashboard to match the "Lorenzo Insights Command" reference design - a dark-themed, AI-powered executive dashboard for Lawrence Njiru (Director). This is a complete visual and functional overhaul from the current light-themed operational dashboard.

## Reference File
`C:\POS\reference\lorenzo-director-dashboard.jsx` (750 lines)

---

## Design Vision

### Key Differences from Current Implementation
| Aspect | Current | New Design |
|--------|---------|------------|
| Theme | Light (lorenzo teal/cream) | Dark (#0A1A1F gradient) |
| Focus | Operational metrics | Executive/Strategic insights |
| KPIs | 5 operational cards | 4 strategic KPIs |
| Charts | Revenue trends line | Predictive performance bars |
| AI | None | Morning briefing + recommendations |
| Search | None | Natural language query bar |
| Alerts | Basic delayed orders | Risk Radar with anomalies |

### Visual Identity
- **Background**: Dark gradient (`#0A1A1F` to `#0D2329`)
- **Cards**: Glass-morphic with teal borders (`rgba(45, 212, 191, 0.12)`)
- **Accent**: Lorenzo teal (`#2DD4BF`) and gold (`#C9A962`)
- **Font**: DM Sans + JetBrains Mono (numbers)

---

## Components to Build

### 1. Lorenzo Insights Command Header
- Logo with Sparkles icon
- "Lorenzo Insights Command / DIRECTOR VIEW" branding
- Natural language search bar ("Ask anything...")
- Timeframe dropdown (This Quarter, etc.)
- Branch filter dropdown
- User profile pill (Lawrence Njiru - Director)

### 2. Executive Narrative (AI Morning Briefing)
- "MORNING BRIEFING" label in gold
- AI-generated paragraph with:
  - Business health score (0-100)
  - Revenue performance vs forecast
  - Key wins (highlighted in teal)
  - Areas needing attention (highlighted in gold)
- Data source: Aggregated from orders, transactions, feedback

### 3. KPI Cards (4 cards)
| KPI | Value Format | Data Source |
|-----|--------------|-------------|
| Revenue | KES X.XM | `sum(transactions.amount)` |
| Operating Margin | XX% | `(revenue - costs) / revenue` |
| Customer Retention | XX% | `repeat customers / total customers` |
| Avg Order Value | KES X,XXX | `revenue / order count` |

Each card shows:
- Label (uppercase, small, muted)
- Icon in teal circle
- Large value (JetBrains Mono)
- Change indicator (↑/↓ vs Goal or vs LY)
- Subtitle explanation

### 4. Predictive Performance Chart
- Bar chart: Historical (solid teal) + Projected (semi-transparent)
- Goal line (dashed gold)
- Confidence corridor (shaded purple area)
- Trajectory line connecting projections
- Annotation callout ("Projected to beat goal by KES 200K")
- Legend: Historical, Current Trajectory, Confidence Corridor, Goal

### 5. Key Drivers & Root Causes
- Horizontal bar chart (waterfall-style)
- Positive drivers (teal gradient)
- Negative drivers (red gradient)
- Values in JetBrains Mono
- Examples:
  - Corporate Accounts: +KES 380,000
  - Premium Services: +KES 220,000
  - Walk-in Decline: -KES 85,000
  - Seasonal Dip: -KES 120,000

### 6. Risk Radar (Watchlist)
- AlertTriangle icon header
- Risk cards with severity colors:
  - Gold border: Medium risk
  - Red border: High risk
- Pulsing dot indicator
- Action buttons: "View Mitigation", "Assign to Manager"

### 7. AI Recommended Actions
- Lightbulb icon with purple gradient
- "POWERED BY AI" badge
- Opportunity cards (purple accent)
- Optimization cards (purple accent)
- Action buttons: "Model Scenarios", "Approve Shift"

### 8. Footer
- Last updated timestamp
- Auto-refresh countdown
- System status indicator (pulse dot)

---

## Implementation Steps

### Step 1: Create Dark Theme CSS Variables
**File:** `app/globals.css`
- Add `.director-dark` theme class
- Define dark gradient backgrounds
- Glass-morphic card styles
- Pulse animation

### Step 2: Create Main Dashboard Page
**File:** `app/(dashboard)/director/page.tsx` (replace existing)
- Dark theme wrapper
- Full-width layout (no sidebar interference)
- Role check for director/admin only

### Step 3: Create Header Component
**File:** `components/features/director/InsightsHeader.tsx`
- Logo + branding
- Search bar with placeholder
- Dropdowns for timeframe/branch/currency
- User profile pill

### Step 4: Create Executive Narrative Component
**File:** `components/features/director/ExecutiveNarrative.tsx`
- AI-generated morning briefing
- Uses LLM client to generate narrative
- Caches for 6 hours (refreshes morning)

### Step 5: Create KPI Cards Component
**File:** `components/features/director/DirectorKPICards.tsx`
- 4-column grid
- Glass-morphic cards
- Real data from Firestore queries

### Step 6: Create Predictive Performance Chart
**File:** `components/features/director/PredictivePerformanceChart.tsx`
- SVG-based chart (or Recharts with custom styling)
- Historical bars + projected bars
- Goal line + confidence corridor

### Step 7: Create Key Drivers Component
**File:** `components/features/director/KeyDriversChart.tsx`
- Horizontal bar chart
- Positive/negative color coding
- Data from analytics calculations

### Step 8: Create Risk Radar Component
**File:** `components/features/director/RiskRadar.tsx`
- Watchlist cards
- Severity-based styling
- Action buttons (non-functional placeholders)

### Step 9: Create AI Recommendations Component
**File:** `components/features/director/AIRecommendations.tsx`
- AI-generated recommendations
- Uses LLM client for insights
- Action buttons

### Step 10: Create API Route for Director Insights
**File:** `app/api/analytics/director/insights/route.ts`
- Fetches aggregated data
- Calls LLM for narrative generation
- Returns combined response

---

## Files to Create/Modify

### Create New Files (~10):
1. `components/features/director/InsightsHeader.tsx`
2. `components/features/director/ExecutiveNarrative.tsx`
3. `components/features/director/DirectorKPICards.tsx`
4. `components/features/director/PredictivePerformanceChart.tsx`
5. `components/features/director/KeyDriversChart.tsx`
6. `components/features/director/RiskRadar.tsx`
7. `components/features/director/AIRecommendations.tsx`
8. `components/features/director/DirectorFooter.tsx`
9. `app/api/analytics/director/insights/route.ts`
10. `app/api/analytics/director/ai-narrative/route.ts`

### Replace Existing Files (1):
1. `app/(dashboard)/director/page.tsx` - Complete rewrite

### Modify Files (2):
1. `app/globals.css` - Add director dark theme styles
2. `components/features/director/index.ts` - Update exports

### Keep Existing (for other dashboards):
- `components/features/director/BranchComparison.tsx` - May reuse
- `components/features/director/RevenueTrends.tsx` - May reuse
- `components/features/director/OperationalHealth.tsx` - May reuse
- `components/features/director/ExecutiveSummary.tsx` - Replace with new

---

## Data Requirements

### Real-Time Queries
| Data Point | Collection | Query |
|------------|------------|-------|
| Total Revenue | transactions | `sum(amount) where status='completed'` |
| Order Count | orders | `count(*)` in period |
| Customer Retention | customers | Repeat order rate calculation |
| Avg Order Value | orders | `sum(totalAmount) / count(*)` |
| Pipeline Status | orders | Group by status |
| Delayed Orders | orders | `where estimatedCompletion < now` |

### AI-Generated Content
| Content | Source Data | LLM Prompt |
|---------|-------------|------------|
| Morning Briefing | All metrics | "Generate executive summary..." |
| Key Drivers | Revenue breakdown | "Analyze revenue drivers..." |
| Risk Alerts | Anomaly detection | "Identify business risks..." |
| Recommendations | Performance gaps | "Suggest optimizations..." |

---

## Personalization for Lawrence Njiru
- Header displays "LN" avatar initials
- Greeting uses "Lawrence Njiru" name
- Role badge shows "Director"
- Accessible only to users with `role: 'director'` or `isSuperAdmin: true`

---

## Priority Order
1. Dark theme CSS + page layout
2. Header with search (non-functional initially)
3. KPI Cards with real data
4. Executive Narrative (static first, then AI)
5. Predictive Performance Chart
6. Key Drivers Chart
7. Risk Radar
8. AI Recommendations
9. Natural language search (connect to chatbot)

---

## Claude Skills Required

The following specialized agents are needed to implement this plan:

| Skill | Purpose |
|-------|---------|
| **ui-designer** | Dark theme CSS, glass-morphic cards, responsive layout |
| **firebase-architect** | Firestore queries for KPIs, data aggregation |
| **integrations-specialist** | LLM client integration for AI narratives |
| **performance-optimizer** | Query optimization, caching strategies |

---

## Status
- [ ] Step 1: Dark Theme CSS
- [ ] Step 2: Main Dashboard Page
- [ ] Step 3: Header Component
- [ ] Step 4: Executive Narrative
- [ ] Step 5: KPI Cards
- [ ] Step 6: Predictive Performance Chart
- [ ] Step 7: Key Drivers Chart
- [ ] Step 8: Risk Radar
- [ ] Step 9: AI Recommendations
- [ ] Step 10: API Routes
