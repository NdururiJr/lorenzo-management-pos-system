# 👥 Developer Work Distribution - Lorenzo Dry Cleaners

**Date:** October 14, 2025
**Project:** Lorenzo Dry Cleaners Management System
**Phase:** Milestone 3 - Advanced Features

---

## 📊 Quick Overview

| Developer | Focus Area | Branch | Estimated Time | Key Deliverables |
|-----------|------------|--------|----------------|------------------|
| **Arthur Tutu** | Backend & Integrations | `feature/milestone-3-backend` | 3-4 weeks | POS Page, WhatsApp, AI, Payments |
| **Jerry Nduriri** | Operations & Management | `feature/milestone-3-operations` | 3-4 weeks | Drivers, Inventory, Employees, Receipts |
| **Gachengoh Marugu** | Code Review & Integration | `main` | Ongoing | PR reviews, merges, testing, deployment |

---

## 🎯 Developer 1: Arthur Tutu (Backend & Integrations)

### Branch: `feature/milestone-3-backend`

### Responsibilities:
1. **Complete POS System** (Priority P0) - 4-6 hours
2. **WhatsApp Integration** - 8-12 hours
3. **AI Features** - 12-16 hours
4. **Payment Integration Completion** - 6-8 hours

---

### Week 2: POS System & Payment Integration

#### Tasks:
```
Priority P0: Complete POS Page
□ Create /app/(dashboard)/pos/page.tsx file
□ Import and arrange POS components:
  - CustomerSearch (top section)
  - CreateCustomerModal (modal)
  - CustomerCard (selected customer display)
  - GarmentEntryForm (middle section)
  - GarmentCard (garment list)
  - OrderSummary (right sidebar)
  - PaymentModal (modal)
  - ReceiptPreview (modal)
□ Implement state management:
  - selectedCustomer state
  - garments array state
  - totalAmount calculation
  - paymentMethod state
□ Wire up database functions:
  - searchCustomers() from lib/db/customers.ts
  - createCustomer() from lib/db/customers.ts
  - createOrder() from lib/db/orders.ts
  - calculatePrice() from lib/db/pricing.ts
  - createTransaction() from lib/db/transactions.ts
□ Implement workflow:
  - Step 1: Search/Create customer
  - Step 2: Add garments
  - Step 3: Auto-calculate pricing
  - Step 4: Process payment (cash/m-pesa/card)
  - Step 5: Generate and show receipt
□ Add validation and error handling
□ Test complete order creation flow (create 10+ test orders)
□ Ensure mobile responsiveness
□ Create PR: "feat(pos): complete POS page implementation"
```

#### Payment Integration:
```
□ Test Pesapal M-Pesa integration:
  - Initiate payment
  - Handle redirect
  - Process callback
  - Verify payment status
□ Test Pesapal card payment integration
□ Verify payment callbacks and webhooks (IPN)
□ Test payment error handling
□ Test partial payment flow
□ Document payment testing results
□ Create PR: "feat(payments): complete Pesapal integration testing"
```

#### Testing Checklist:
```
□ Create 10+ test orders with different payment methods
□ Test cash payment
□ Test M-Pesa payment (sandbox)
□ Test card payment (sandbox)
□ Test credit payment
□ Test partial payment
□ Verify receipt generation
□ Verify order appears in pipeline
□ Test mobile UI on phone
□ Document any bugs in GitHub Issues
```

---

### Week 3: WhatsApp Integration (Wati.io)

#### Setup:
```
□ Create Wati.io account (https://wati.io)
□ Link WhatsApp Business number (+254...)
□ Get API key and base URL
□ Add to .env.local:
  WATI_API_KEY=your_api_key
  WATI_API_URL=https://live-server.wati.io
```

#### Implementation:
```
□ Create services/wati.ts service file:
  - sendMessage() function
  - sendTemplateMessage() function
  - Error handling with retry logic
□ Create lib/notifications/notification-service.ts:
  - queueNotification() function
  - processNotificationQueue() function
  - logNotification() to Firestore
□ Create message templates in Wati.io dashboard:
  - order_confirmation: "Hi {{1}}, your order {{2}} has been received..."
  - order_ready: "Hi {{1}}, your order {{2}} is ready for pickup..."
  - driver_dispatched: "Hi {{1}}, driver is on the way with order {{2}}..."
  - driver_nearby: "Hi {{1}}, driver is 5 minutes away..."
  - order_delivered: "Hi {{1}}, order {{2}} delivered successfully..."
  - payment_reminder: "Hi {{1}}, you have pending payment for order {{2}}..."
□ Submit templates for WhatsApp approval (2-3 days)
□ Create Cloud Functions (functions/src/):
  - onOrderCreated trigger
  - onOrderStatusChanged trigger
  - onPaymentReceived trigger
□ Implement notification queue in Firestore (notifications collection)
□ Add retry logic (3 attempts) for failed messages
□ Log all notification attempts
□ Test notification sending (send 20+ test messages)
□ Create PR: "feat(notifications): integrate WhatsApp via Wati.io"
```

#### Testing Checklist:
```
□ Send order confirmation notification
□ Send order ready notification
□ Send driver dispatched notification
□ Send order delivered notification
□ Test with real phone number (+254...)
□ Verify message delivery in Wati.io dashboard
□ Test retry mechanism (disconnect internet, reconnect)
□ Check Firestore logs (notifications collection)
□ Document WhatsApp template approval process
```

---

### Week 4: AI Features (OpenAI Integration)

#### Setup:
```
□ Create OpenAI account (https://platform.openai.com)
□ Add payment method
□ Get API key
□ Set usage limit ($50/month recommended)
□ Add to .env.local:
  OPENAI_API_KEY=your_api_key
□ Install OpenAI SDK: npm install openai
```

#### Implementation:
```
□ Create services/openai.ts service file:
  - estimateCompletionTime() function
  - generateInsights() function
  - summarizeReport() function
  - Error handling with fallback
□ Feature 1: Order Completion Time Estimation
  - Collect historical order data (50+ orders)
  - Create AI prompt with order details (garment count, services, etc.)
  - Call OpenAI API to get estimated completion time
  - Display estimated time on POS order creation
  - Store prediction for validation
□ Feature 2: Analytics Insights Generation
  - Create AI insights dashboard page (app/(dashboard)/analytics/insights/page.tsx)
  - Generate weekly/monthly business insights
  - Identify patterns (busy hours, popular services, etc.)
  - Predict demand trends
  - Display insights in dashboard
□ Feature 3: Report Summarization
  - Create report summary generator
  - Generate executive summaries for reports
  - Summarize daily/weekly performance
  - Highlight key metrics and trends
□ Test AI predictions (test with 50+ historical orders)
□ Monitor API usage and costs (set up billing alerts)
□ Document AI performance and accuracy
□ Create PR: "feat(ai): integrate OpenAI for predictions and insights"
```

#### Testing Checklist:
```
□ Test completion time estimation (compare with actual times)
□ Generate 5+ daily insights
□ Generate 5+ weekly insights
□ Test report summarization
□ Verify AI responses make sense
□ Test edge cases (very large orders, rush orders)
□ Check OpenAI API usage in dashboard
□ Document accuracy metrics
```

---

### Git Workflow (Arthur):

**Daily:**
```bash
# Morning
git pull origin feature/milestone-3-backend
git checkout -b feature/milestone-3-backend/[feature-name]

# During work (commit often)
git add .
git commit -m "feat(scope): description"
git push origin feature/milestone-3-backend/[feature-name]

# End of day
git checkout feature/milestone-3-backend
git merge feature/milestone-3-backend/[feature-name]
git push origin feature/milestone-3-backend
```

**Weekly:**
```bash
# Friday - Create PR
# Go to GitHub → New Pull Request
# Base: main ← Compare: feature/milestone-3-backend
# Fill PR description:
#   - What was built
#   - How to test
#   - Screenshots (if UI)
#   - Known issues
# Request review from: gachengoh
```

---

## 🎯 Developer 2: Jerry Nduriri (Operations & Management)

### Branch: `feature/milestone-3-operations`

### Responsibilities:
1. **Receipt PDF Completion** - 4-6 hours
2. **Driver & Delivery Management** - 12-16 hours
3. **Inventory Management** - 10-12 hours
4. **Employee Management** - 10-12 hours

---

### Week 2: Receipt PDF & Driver Foundation

#### Receipt PDF:
```
□ Complete receipt PDF download (lib/receipts/)
□ Install jsPDF if needed: npm install jspdf
□ Implement generateReceiptPDF() function:
  - Company logo and details
  - Order details (ID, date, customer)
  - Itemized garment list with prices
  - Payment details
  - Total amount
  - QR code for order tracking (optional)
□ Add download button in ReceiptPreview component
□ Test PDF generation (generate 20+ receipts)
□ Test PDF download on mobile
□ Implement email receipt functionality (using Resend)
□ Test print functionality
□ Create PR: "feat(receipts): complete PDF download and email"
```

#### Google Maps Setup:
```
□ Set up Google Maps API credentials:
  - Go to Google Cloud Console
  - Enable APIs: Maps JavaScript, Directions, Distance Matrix, Geocoding, Places
  - Create API key with restrictions
  - Add to .env.local: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key
□ Install Google Maps React: npm install @react-google-maps/api
□ Create components/features/driver/Map.tsx component
□ Test map display
□ Implement address geocoding (convert address → coordinates)
□ Test geocoding with Kenya addresses
□ Create PR: "feat(maps): set up Google Maps integration"
```

---

### Week 3: Driver & Delivery Management

#### Implementation:
```
□ Create app/(dashboard)/deliveries/page.tsx
□ Create delivery batch UI:
  - List orders ready for delivery (status: 'ready')
  - Group by delivery area/zone
  - Multi-select orders
  - Assign driver dropdown
  - Set delivery date picker
□ Implement route optimization:
  - Extract delivery addresses from selected orders
  - Geocode addresses to coordinates
  - Call Google Directions API with waypoints
  - Use waypoint_order optimization (max 25 stops)
  - Calculate total distance and estimated time
  - Display optimized route on map
□ Create driver dashboard (app/(dashboard)/drivers/page.tsx):
  - Display assigned deliveries for logged-in driver
  - Show route on map
  - List stops in order
  - Display customer names and addresses
  - Add "Navigate" button (opens Google Maps app)
□ Implement delivery status updates:
  - "In Progress" when driver starts
  - "Completed" at each stop
  - "Failed" if customer not home
  - Photo/signature capture (optional)
□ Create mobile-optimized driver interface
□ Handle cash on delivery (COD) payments
□ Test route optimization (create 10+ delivery batches)
□ Create PR: "feat(delivery): complete driver and delivery management"
```

#### Cloud Functions:
```
□ Create functions/src/onDeliveryCreated.ts trigger
□ Send "driver dispatched" WhatsApp notification
□ Create functions/src/onDeliveryStatusChanged.ts trigger
□ Send "driver nearby" notification when 5 min away (use Distance Matrix API)
□ Send "delivered" notification on completion
□ Test all delivery notifications
```

#### Testing Checklist:
```
□ Create 5+ delivery batches with different addresses
□ Test route optimization with 5, 10, 20 stops
□ Verify routes display correctly on map
□ Test driver mobile interface on phone
□ Test delivery status updates
□ Test notifications (dispatched, nearby, delivered)
□ Test COD payment collection
□ Document any issues
```

---

### Week 4: Inventory & Employee Management

#### Inventory Management:
```
□ Create app/(dashboard)/inventory/page.tsx
□ Design inventory UI:
  - Table with columns: Item Name, Category, Quantity, Unit, Reorder Level
  - Add Item button
  - Search and filter
  - Stock level indicators (red/yellow/green)
□ Create add/edit item modal:
  - Item name, category, unit, quantity, reorder level, cost per unit
  - Supplier info (optional)
  - Expiry date (optional)
□ Implement item categories:
  - Detergents
  - Softeners
  - Hangers
  - Packaging materials
  - Stain removers
  - Others
□ Create stock adjustment functionality:
  - Add stock (restock)
  - Remove stock (usage)
  - Log all adjustments with timestamp and user
□ Implement low stock alerts:
  - Check stock levels daily (Cloud Function scheduled job)
  - Send notification when stock < reorder level
  - Display alert badge in dashboard
□ Create inventory reports:
  - Stock summary
  - Usage analytics (most used items)
  - Items below reorder level
  - Stock value
□ Test inventory system (add 50+ items)
□ Create PR: "feat(inventory): complete inventory management system"
```

#### Employee Management:
```
□ Create app/(dashboard)/employees/page.tsx
□ Design employee UI:
  - Table: Name, Role, Branch, Status, Attendance
  - Add Employee button (admin only)
  - Filter by branch, role
□ Create add/edit employee form:
  - Name, email, phone
  - Role (admin, manager, front_desk, workstation, driver)
  - Branch assignment
  - Status (active/inactive)
□ Create attendance tracking:
  - Clock-in button (records timestamp)
  - Clock-out button (records timestamp)
  - Display current status (clocked in/out)
  - Calculate hours worked
□ Create shift management:
  - Define shifts (morning, afternoon, night)
  - Assign employees to shifts
  - Display shift schedule (calendar view)
□ Track productivity metrics:
  - Orders processed per employee
  - Average processing time
  - Orders completed per day/week
  - Quality issues (returns/complaints)
□ Create reports:
  - Attendance report (by date range)
  - Productivity report (by employee)
  - Hours worked report
  - Late arrivals/early departures
□ Test employee system (add 10+ employees)
□ Create PR: "feat(employees): complete employee management and tracking"
```

#### Testing Checklist:
```
Inventory:
□ Add 50+ inventory items
□ Test stock adjustments (add/remove)
□ Test low stock alerts
□ Generate inventory reports
□ Verify calculations

Employees:
□ Add 10+ employees
□ Test clock-in/out (multiple times)
□ Test shift assignments
□ Track 20+ orders to employees
□ Generate productivity reports
□ Verify hour calculations
```

---

### Git Workflow (Jerry):

**Daily:**
```bash
# Morning
git pull origin feature/milestone-3-operations
git checkout -b feature/milestone-3-operations/[feature-name]

# During work
git add .
git commit -m "feat(scope): description"
git push origin feature/milestone-3-operations/[feature-name]

# End of day
git checkout feature/milestone-3-operations
git merge feature/milestone-3-operations/[feature-name]
git push origin feature/milestone-3-operations
```

**Weekly:**
```bash
# Friday - Create PR
# Go to GitHub → New Pull Request
# Base: main ← Compare: feature/milestone-3-operations
# Request review from: gachengoh
```

---

## 👨‍💼 Team Lead: Gachengoh Marugu (Code Review & Integration)

### Responsibilities:
1. **Code Review** - Review all PRs from Arthur and Jerry
2. **Merge Management** - Merge approved PRs to main
3. **Integration Testing** - Test features together
4. **Architecture Decisions** - Guide technical decisions
5. **Deployment** - Deploy to staging and production
6. **Client Communication** - UAT coordination

---

### Daily Tasks (15-30 min):
```
□ Check GitHub notifications
□ Review commits from developers
□ Answer questions on WhatsApp
□ Monitor for blockers
□ Update project board
```

### Weekly Tasks (Friday, 2-3 hours):
```
□ Review PRs:
  - Check code quality
  - Review for security issues
  - Verify tests pass
  - Test features locally
□ Merge approved PRs to main
□ Deploy to staging:
  git checkout main
  git pull
  npm run build
  firebase deploy --only hosting
□ Integration testing:
  - Test Arthur's + Jerry's features together
  - Verify no conflicts
  - Test complete workflows
□ Schedule next week's work
□ Update TASKS.md
```

### Integration Testing Checklist:
```
After merging both PRs:
□ Test complete order workflow:
  - Create order in POS (Arthur)
  - Assign to driver (Jerry)
  - Optimize route (Jerry)
  - Deliver order (Jerry)
  - Verify WhatsApp notifications (Arthur)
  - Check inventory updated (Jerry)
□ Test AI features with delivery data
□ Performance testing (< 2s page load)
□ Mobile testing (all features)
□ Security audit
□ Create issues for any bugs found
```

---

## 📞 Communication Protocol

### Daily Standup (Async, WhatsApp Group)
**Time:** 9:00 AM (each developer posts)

**Format:**
```
Yesterday:
- [Completed task 1]
- [Completed task 2]

Today:
- [Task 1 to work on]
- [Task 2 to work on]

Blockers:
- [Blocker] or "None"
```

### Weekly Sync (Video Call, Google Meet)
**Time:** Friday 3:00 PM
**Duration:** 1 hour

**Agenda:**
1. **Demo Time (30 min):**
   - Arthur demos features (15 min)
   - Jerry demos features (15 min)
2. **Discussion (15 min):**
   - Challenges faced
   - Learnings
   - Questions
3. **Planning (15 min):**
   - Review next week's tasks
   - Identify dependencies
   - Assign priorities

### Ad-hoc Communication:
- **WhatsApp:** Quick questions, clarifications
- **GitHub Issues:** Bug reports, feature requests
- **GitHub PR Comments:** Code review discussions
- **Email:** Client communication, formal updates

---

## 🔄 Collaboration & Dependencies

### Arthur → Jerry Dependencies:

**Orders Flow:**
- Arthur's POS creates orders → Jerry's driver system delivers them
- Arthur's notifications trigger on Jerry's delivery status updates

**Action:**
- Use shared types in `/types/index.ts`
- Document order schema in code comments
- Weekly sync to align on data structures

### Shared Resources:

**Database Schema:**
- Both use `orders` collection
- Both use `notifications` collection
- Arthur creates, Jerry updates

**Solution:**
- Define clear update rules in CLAUDE.md
- Use Firestore transactions for concurrent updates
- Test conflict scenarios

---

## 📦 Weekly Deliverables

### Week 1 (Oct 14-20): Setup & Familiarization
**Arthur:**
- [ ] Environment setup complete
- [ ] Tested existing features (Milestone 1, Portal, Pipeline)
- [ ] Read all documentation

**Jerry:**
- [ ] Environment setup complete
- [ ] Tested existing features
- [ ] Read all documentation

---

### Week 2 (Oct 21-27):
**Arthur:**
- [ ] POS page complete and tested
- [ ] Payment integration tested
- [ ] PR #1 created: "feat(pos): complete POS page"
- [ ] PR #2 created: "feat(payments): complete Pesapal testing"

**Jerry:**
- [ ] Receipt PDF complete and tested
- [ ] Google Maps integration set up
- [ ] PR #1 created: "feat(receipts): complete PDF download"
- [ ] PR #2 created: "feat(maps): set up Google Maps"

**Gachengoh:**
- [ ] Review and merge Arthur's PRs
- [ ] Review and merge Jerry's PRs
- [ ] Deploy POS page to staging
- [ ] Test POS + Receipt generation together

---

### Week 3 (Oct 28 - Nov 3):
**Arthur:**
- [ ] WhatsApp integration complete
- [ ] Message templates approved
- [ ] Cloud Function triggers deployed
- [ ] PR created: "feat(notifications): integrate WhatsApp"

**Jerry:**
- [ ] Driver & delivery management complete
- [ ] Route optimization working
- [ ] Driver mobile interface tested
- [ ] PR created: "feat(delivery): complete driver system"

**Gachengoh:**
- [ ] Review and merge both PRs
- [ ] Test complete order → delivery → notification flow
- [ ] Deploy to staging
- [ ] Client demo of delivery features

---

### Week 4 (Nov 4-10):
**Arthur:**
- [ ] AI features complete
- [ ] Completion time estimation tested
- [ ] Analytics insights generated
- [ ] PR created: "feat(ai): integrate OpenAI"

**Jerry:**
- [ ] Inventory management complete
- [ ] Employee tracking complete
- [ ] Reports generated and tested
- [ ] PR created: "feat(operations): inventory & employees"

**Gachengoh:**
- [ ] Review and merge both PRs
- [ ] Complete integration testing
- [ ] Performance optimization
- [ ] All Milestone 3 features deployed to staging

---

### Week 5 (Nov 11-17): Integration & Bug Fixes
**All:**
- [ ] Integration testing complete
- [ ] All critical bugs fixed
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Documentation updated

**Gachengoh:**
- [ ] Schedule UAT with client
- [ ] Prepare training materials

---

### Week 6 (Nov 18-24): UAT & Launch Prep
**All:**
- [ ] UAT completed
- [ ] All UAT feedback implemented
- [ ] Final testing complete
- [ ] Production deployment ready

**Gachengoh:**
- [ ] Deploy to production
- [ ] Post-deployment monitoring
- [ ] Client training

---

## ✅ Success Criteria

### Arthur (Backend & Integrations):
- [ ] POS page fully functional (10+ test orders created successfully)
- [ ] All payment methods tested (Cash, M-Pesa, Card)
- [ ] WhatsApp notifications sending (20+ test messages delivered)
- [ ] AI predictions showing reasonable accuracy (< 20% error)
- [ ] Code reviewed and merged to main
- [ ] Documentation complete

### Jerry (Operations & Management):
- [ ] Receipt PDFs generating correctly (20+ PDFs generated)
- [ ] Delivery routes optimized (10+ batches created)
- [ ] Driver interface functional on mobile (tested on actual phone)
- [ ] Inventory tracking 50+ items
- [ ] Employee tracking 10+ staff members
- [ ] Code reviewed and merged to main
- [ ] Documentation complete

### Project (Overall):
- [ ] All Milestone 3 features complete
- [ ] No critical bugs
- [ ] Performance < 2s page load
- [ ] Client UAT approved
- [ ] Production deployment successful
- [ ] Team trained on new features

---

## 🚨 Emergency Contacts

**Team Lead:** Gachengoh Marugu
- Email: hello@ai-agentsplus.com
- Phone: +254 725 462 859
- WhatsApp: +254 725 462 859

**Developer 1:** Arthur Tutu
- Email: arthur@ai-agentsplus.com

**Developer 2:** Jerry Nduriri
- Email: jerry@ai-agentsplus.com
- Phone: +254 725 462 859

---

## 📚 Essential Resources

### Documentation (Must Read):
- [CLAUDE.md](./CLAUDE.md) - Development guidelines
- [PLANNING.md](./PLANNING.md) - Project overview
- [TASKS.md](./TASKS.md) - Task list
- [Documentation/Testing/START_HERE_TESTING.md](./Documentation/Testing/START_HERE_TESTING.md) - Testing guide

### API Documentation:
- [Wati.io API](https://docs.wati.io) - WhatsApp integration
- [Pesapal API v3](https://developer.pesapal.com) - Payments
- [Google Maps API](https://developers.google.com/maps) - Maps & routing
- [OpenAI API](https://platform.openai.com/docs) - AI features
- [Firebase Docs](https://firebase.google.com/docs) - Backend

### Code Examples:
- Existing components: `components/features/`
- Database functions: `lib/db/`
- Example pages: `app/(dashboard)/pipeline/page.tsx`

---

**Last Updated:** October 14, 2025
**Next Review:** Weekly (Every Friday)

---

**Let's build something amazing! 🚀**
