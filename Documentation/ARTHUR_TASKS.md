# 👨‍💻 Arthur Tutu - Task Breakdown

**Role:** Backend Developer & Integrations Specialist
**Branch:** `feature/milestone-3-backend`
**Timeline:** 4 weeks (Oct 14 - Nov 10, 2025)
**Focus:** POS System, WhatsApp, AI Features, Payments

---

## 📋 Quick Task Overview

| Week | Focus | Hours | Status |
|------|-------|-------|--------|
| Week 1 | Setup & Learning | 8-10h | ❌ Not Started |
| Week 2 | POS Page & Payments | 16-20h | ❌ Not Started |
| Week 3 | WhatsApp Integration | 16-20h | ❌ Not Started |
| Week 4 | AI Features | 16-20h | ❌ Not Started |

**Total Estimated Time:** 56-70 hours (~4 weeks)

---

## Week 1: Setup & Familiarization (Oct 14-20)

### Monday-Tuesday: Environment Setup
- [ ] Clone repository: `git clone https://github.com/[org]/lorenzo-dry-cleaners.git`
- [ ] Install dependencies: `npm install`
- [ ] Create `.env.local` file (ask Gachengoh for credentials)
- [ ] Run dev server: `npm run dev`
- [ ] Verify localhost:3000 loads
- [ ] Create feature branch: `git checkout -b feature/milestone-3-backend`

### Wednesday-Thursday: Documentation & Testing
- [ ] Read CLAUDE.md (development guidelines)
- [ ] Read PLANNING.md (project overview)
- [ ] Read TASKS.md (current tasks)
- [ ] Test existing features:
  - [ ] Login as staff (use dev credentials)
  - [ ] Test customer portal (use dev quick login)
  - [ ] Test pipeline board
  - [ ] Create 2-3 test orders manually in Firebase Console
- [ ] Review existing POS components in `components/features/pos/`
- [ ] Review database functions in `lib/db/`

### Friday: Planning & Questions
- [ ] Review Week 2 tasks in detail
- [ ] Ask questions in WhatsApp group
- [ ] Weekly sync call (3:00 PM)

---

## Week 2: POS System & Payment Integration (Oct 21-27)

### Priority P0: Complete POS Page (12-16 hours)

#### Monday-Tuesday: Create POS Page Structure
- [ ] Create file: `app/(dashboard)/pos/page.tsx`
- [ ] Set up page layout:
```typescript
"use client";

import { useState } from "react";
import CustomerSearch from "@/components/features/pos/CustomerSearch";
import GarmentEntryForm from "@/components/features/pos/GarmentEntryForm";
import OrderSummary from "@/components/features/pos/OrderSummary";
// ... other imports

export default function POSPage() {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [garments, setGarments] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Your implementation here

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Point of Sale</h1>
      {/* Your UI here */}
    </div>
  );
}
```

#### Tuesday-Wednesday: Wire Up Components
- [ ] Import and render CustomerSearch
- [ ] Implement customer selection handler
- [ ] Import and render GarmentEntryForm
- [ ] Implement add garment handler
- [ ] Display garment list with GarmentCard
- [ ] Import and render OrderSummary in sidebar
- [ ] Implement total calculation (use `lib/db/pricing.ts`)

#### Wednesday-Thursday: Implement Order Creation
- [ ] Wire up `createOrder()` from `lib/db/orders.ts`
- [ ] Wire up `createCustomer()` from `lib/db/customers.ts`
- [ ] Implement payment modal
- [ ] Wire up `createTransaction()` from `lib/db/transactions.ts`
- [ ] Show receipt preview after successful order
- [ ] Add error handling and validation
- [ ] Test complete flow: search customer → add garments → calculate price → payment → receipt

#### Thursday-Friday: Testing & PR
- [ ] Create 10+ test orders with different scenarios:
  - [ ] New customer
  - [ ] Existing customer
  - [ ] 1 garment
  - [ ] 5+ garments
  - [ ] Different services (wash, iron, etc.)
- [ ] Test on mobile (Chrome DevTools)
- [ ] Test error cases (empty fields, etc.)
- [ ] Fix any bugs
- [ ] Commit code: `git commit -m "feat(pos): complete POS page implementation"`
- [ ] Push: `git push origin feature/milestone-3-backend`
- [ ] Create PR on GitHub (request review from Gachengoh)

### Payment Integration Testing (4-6 hours)

#### Friday: Pesapal Testing
- [ ] Review `lib/payments/payment-service.ts`
- [ ] Test M-Pesa payment flow:
  - [ ] Initiate payment in POS
  - [ ] Follow redirect to Pesapal
  - [ ] Complete payment in sandbox
  - [ ] Verify callback received
  - [ ] Verify order status updated
- [ ] Test card payment flow (same as above)
- [ ] Test error scenarios:
  - [ ] Payment cancellation
  - [ ] Payment failure
  - [ ] Timeout
- [ ] Document test results in PR description
- [ ] Create PR: "feat(payments): complete Pesapal integration testing"

**End of Week Deliverables:**
- ✅ POS page complete and functional
- ✅ 10+ test orders created
- ✅ Payment integration tested
- ✅ 2 PRs created and submitted for review

---

## Week 3: WhatsApp Integration (Oct 28 - Nov 3)

### Setup (4 hours)

#### Monday Morning: Wati.io Account
- [ ] Go to https://wati.io and sign up
- [ ] Link WhatsApp Business number (ask Gachengoh for number)
- [ ] Get API key and base URL from Wati.io dashboard
- [ ] Add to `.env.local`:
```
WATI_API_KEY=your_api_key_here
WATI_API_URL=https://live-server.wati.io
```
- [ ] Document credentials in team password manager

#### Monday Afternoon: Create Service File
- [ ] Create `services/wati.ts`:
```typescript
const WATI_API_KEY = process.env.WATI_API_KEY;
const WATI_API_URL = process.env.WATI_API_URL;

export async function sendWhatsAppMessage(
  phone: string,
  message: string
) {
  // Implementation
}

export async function sendTemplateMessage(
  phone: string,
  templateName: string,
  variables: string[]
) {
  // Implementation with retry logic
}
```

### Message Templates (6 hours)

#### Tuesday: Create Templates in Wati.io
- [ ] Login to Wati.io dashboard
- [ ] Go to "Message Templates" section
- [ ] Create template: **order_confirmation**
```
Hi {{1}}, your order {{2}} has been received. Estimated completion: {{3}}. Track your order at {{4}}
```
- [ ] Create template: **order_ready**
```
Hi {{1}}, great news! Your order {{2}} is ready for pickup at {{3}}. Please visit us during business hours.
```
- [ ] Create template: **driver_dispatched**
```
Hi {{1}}, our driver is on the way with your order {{2}}. Expected arrival: {{3}}.
```
- [ ] Create template: **driver_nearby**
```
Hi {{1}}, our driver is 5 minutes away with your order {{2}}. Please be ready to receive your order.
```
- [ ] Create template: **order_delivered**
```
Hi {{1}}, your order {{2}} has been delivered successfully. Thank you for choosing Lorenzo Dry Cleaners!
```
- [ ] Create template: **payment_reminder**
```
Hi {{1}}, this is a reminder about pending payment for order {{2}}. Amount: KES {{3}}. Please visit us or call {{4}}.
```
- [ ] Submit all templates for WhatsApp approval (takes 2-3 days)
- [ ] Follow up on approval status

### Notification Service (6 hours)

#### Wednesday: Create Notification System
- [ ] Create `lib/notifications/notification-service.ts`:
```typescript
export async function queueNotification(
  type: NotificationType,
  recipientPhone: string,
  orderId: string,
  variables: string[]
) {
  // Add to Firestore notifications collection
}

export async function processNotificationQueue() {
  // Get pending notifications
  // Send via Wati.io
  // Update status
  // Retry failed messages (max 3 times)
}
```
- [ ] Create Firestore `notifications` collection structure
- [ ] Implement retry logic (3 attempts)
- [ ] Log all notification attempts

### Cloud Functions (8 hours)

#### Thursday-Friday: Create Triggers
- [ ] Set up Firebase Cloud Functions project (if not done):
```bash
cd functions
npm install
```
- [ ] Create `functions/src/onOrderCreated.ts`:
```typescript
import * as functions from "firebase-functions";
import { queueNotification } from "./notifications";

export const onOrderCreated = functions.firestore
  .document("orders/{orderId}")
  .onCreate(async (snap, context) => {
    const order = snap.data();
    // Send order confirmation
    await queueNotification(
      "order_confirmation",
      order.customerPhone,
      order.orderId,
      [order.customerName, order.orderId, order.estimatedCompletion]
    );
  });
```
- [ ] Create `functions/src/onOrderStatusChanged.ts`:
```typescript
export const onOrderStatusChanged = functions.firestore
  .document("orders/{orderId}")
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const oldData = change.before.data();

    if (newData.status !== oldData.status) {
      // Send appropriate notification based on new status
      if (newData.status === "ready") {
        // Send order_ready notification
      } else if (newData.status === "out_for_delivery") {
        // Send driver_dispatched notification
      } else if (newData.status === "delivered") {
        // Send order_delivered notification
      }
    }
  });
```
- [ ] Create `functions/src/onPaymentReceived.ts` (for payment reminders)
- [ ] Deploy Cloud Functions:
```bash
firebase deploy --only functions
```

### Testing (4 hours)

#### Friday: Integration Testing
- [ ] Create test order in POS
- [ ] Verify order_confirmation notification sent
- [ ] Update order status to "ready" in pipeline
- [ ] Verify order_ready notification sent
- [ ] Update status to "out_for_delivery"
- [ ] Verify driver_dispatched notification sent
- [ ] Test with real phone number
- [ ] Check Wati.io dashboard for delivery status
- [ ] Test retry mechanism (disconnect internet)
- [ ] Check Firestore logs
- [ ] Document test results
- [ ] Create PR: "feat(notifications): integrate WhatsApp via Wati.io"

**End of Week Deliverables:**
- ✅ Wati.io integration complete
- ✅ 6 message templates created and approved
- ✅ Cloud Function triggers deployed
- ✅ 20+ test notifications sent
- ✅ PR created and submitted

---

## Week 4: AI Features (Nov 4-10)

### Setup (3 hours)

#### Monday Morning: OpenAI Account
- [ ] Go to https://platform.openai.com and sign up
- [ ] Add payment method
- [ ] Create API key
- [ ] Set usage limit ($50/month)
- [ ] Add to `.env.local`:
```
OPENAI_API_KEY=your_api_key_here
```
- [ ] Install OpenAI SDK:
```bash
npm install openai
```

#### Monday Afternoon: Create Service File
- [ ] Create `services/openai.ts`:
```typescript
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function estimateCompletionTime(
  garmentCount: number,
  services: string[],
  historicalData: any[]
) {
  // Implementation
}

export async function generateInsights(
  period: "daily" | "weekly" | "monthly",
  data: any
) {
  // Implementation
}

export async function summarizeReport(reportData: any) {
  // Implementation
}
```

### Feature 1: Completion Time Estimation (8 hours)

#### Tuesday-Wednesday: Implement Prediction
- [ ] Collect historical order data (50+ orders) from Firestore
- [ ] Create AI prompt:
```typescript
const prompt = `Based on the following historical data:
${JSON.stringify(historicalData, null, 2)}

Estimate the completion time for a new order with:
- Garment count: ${garmentCount}
- Services: ${services.join(", ")}

Provide estimate in hours. Consider:
1. Type of garments
2. Number of services
3. Current queue load
4. Historical average times

Respond in JSON format: { "estimatedHours": number, "confidence": "low"|"medium"|"high" }`;
```
- [ ] Call OpenAI API:
```typescript
const completion = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: prompt }],
  temperature: 0.3,
});
```
- [ ] Parse response and extract estimated hours
- [ ] Display in POS page when creating order
- [ ] Store prediction for later validation
- [ ] Test with 20+ different order combinations

### Feature 2: Analytics Insights (8 hours)

#### Thursday: Create Insights Dashboard
- [ ] Create `app/(dashboard)/analytics/insights/page.tsx`
- [ ] Fetch order data for specified period (daily/weekly/monthly)
- [ ] Create AI prompt:
```typescript
const prompt = `Analyze this dry cleaning business data:

Orders: ${ordersData}
Revenue: ${revenueData}
Peak hours: ${peakHoursData}
Popular services: ${servicesData}

Generate 5-7 key business insights including:
1. Busiest times and recommended staffing
2. Most profitable services
3. Customer trends
4. Revenue patterns
5. Operational efficiency recommendations

Format as bullet points.`;
```
- [ ] Call OpenAI API
- [ ] Display insights in dashboard with nice UI
- [ ] Add date range selector
- [ ] Test with different time periods

### Feature 3: Report Summarization (6 hours)

#### Friday: Implement Summarization
- [ ] Create report summary generator function
- [ ] Generate sample report data (orders, revenue, etc.)
- [ ] Create AI prompt:
```typescript
const prompt = `Summarize this business report:

${reportData}

Provide:
1. Executive summary (2-3 sentences)
2. Key highlights (3-5 bullets)
3. Areas of concern (if any)
4. Recommendations (2-3 bullets)`;
```
- [ ] Call OpenAI API
- [ ] Display summary above full report
- [ ] Test with different report types

### Testing & Documentation (3 hours)

#### Friday Afternoon:
- [ ] Test all AI features:
  - [ ] Completion time estimates (compare with actual times)
  - [ ] Generate 5+ daily insights
  - [ ] Generate 5+ weekly insights
  - [ ] Summarize 5+ reports
- [ ] Monitor OpenAI API usage in dashboard
- [ ] Calculate accuracy of predictions
- [ ] Document findings in PR:
  - Prediction accuracy: X%
  - Average response time: Xms
  - Cost per prediction: $X
  - Useful insights vs generic: X:Y ratio
- [ ] Create PR: "feat(ai): integrate OpenAI for predictions and insights"

**End of Week Deliverables:**
- ✅ OpenAI integration complete
- ✅ Completion time estimation working
- ✅ Insights dashboard created
- ✅ Report summarization working
- ✅ PR created with performance metrics

---

## Daily Routine

### Morning (9:00 AM):
- [ ] Post standup in WhatsApp group:
```
Yesterday: [what you completed]
Today: [what you'll work on]
Blockers: [any issues] or "None"
```
- [ ] Pull latest changes: `git pull origin feature/milestone-3-backend`
- [ ] Review GitHub notifications

### During Day:
- [ ] Code and test features
- [ ] Commit frequently: `git commit -m "description"`
- [ ] Push changes: `git push origin feature/milestone-3-backend`
- [ ] Ask questions in WhatsApp if stuck

### End of Day (5:00 PM):
- [ ] Push all changes to GitHub
- [ ] Update TASKS.md if completed major task
- [ ] Document any blockers

---

## Git Commands Reference

```bash
# Start new feature
git checkout feature/milestone-3-backend
git pull
git checkout -b feature/milestone-3-backend/pos-page

# Work and commit
git add .
git commit -m "feat(pos): add customer search"
git push origin feature/milestone-3-backend/pos-page

# Merge to main branch
git checkout feature/milestone-3-backend
git merge feature/milestone-3-backend/pos-page
git push origin feature/milestone-3-backend

# Create PR on GitHub
# Go to repository → Pull Requests → New Pull Request
# Base: main ← Compare: feature/milestone-3-backend
```

---

## Testing Checklist

### POS Page:
- [ ] Can search existing customers
- [ ] Can create new customers
- [ ] Can add multiple garments
- [ ] Price calculates automatically
- [ ] Can process cash payment
- [ ] Can process M-Pesa payment (sandbox)
- [ ] Can process card payment (sandbox)
- [ ] Receipt displays correctly
- [ ] Order appears in pipeline board
- [ ] Mobile UI works well

### WhatsApp:
- [ ] Order confirmation sends
- [ ] Order ready notification sends
- [ ] Driver dispatched notification sends
- [ ] Driver nearby notification sends
- [ ] Order delivered notification sends
- [ ] Retry mechanism works
- [ ] Logs stored in Firestore
- [ ] Real phone number receives messages

### AI Features:
- [ ] Completion time estimates make sense
- [ ] Insights are relevant and actionable
- [ ] Report summaries are accurate
- [ ] API responses are fast (< 5s)
- [ ] Costs are within budget ($50/month)

---

## Resources

### Documentation:
- [CLAUDE.md](../CLAUDE.md) - Development guidelines
- [PLANNING.md](../PLANNING.md) - Project overview
- [TASKS.md](../TASKS.md) - Main task list
- [DEVELOPER_WORK_DISTRIBUTION.md](../DEVELOPER_WORK_DISTRIBUTION.md) - Full distribution plan

### API Docs:
- [Wati.io API](https://docs.wati.io)
- [Pesapal API v3](https://developer.pesapal.com)
- [OpenAI API](https://platform.openai.com/docs)
- [Firebase Docs](https://firebase.google.com/docs)

### Code References:
- POS components: `components/features/pos/`
- Database functions: `lib/db/`
- Payment service: `lib/payments/`
- Example page: `app/(dashboard)/pipeline/page.tsx`

---

## Support

**Team Lead:** Gachengoh Marugu
- Email: hello@ai-agentsplus.com
- Phone/WhatsApp: +254 725 462 859

**Teammate:** Jerry Nduriri
- Email: jerry@ai-agentsplus.com
- Phone/WhatsApp: +254 725 462 859

---

**Last Updated:** October 14, 2025
**Status:** Ready to start!

**Good luck, Arthur! Let's build something amazing! 🚀**
