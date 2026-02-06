# Laundry Management System - Upgrade Project Guide

PROJECT COMPULSORY CHECKLIST
Always read PLANNING.md at the start of every new conversation.
Check TASKS.md before starting your work.
Mark completed tasks immediately.
Add newly discovered tasks.

## Project Overview

**Project Name:** Lorenzo Dry Cleaners - System Enhancement (Version 2.0)
**Project Type:** Feature Enhancement & System Upgrade
**Approach:** Building on Existing Foundation
**Target Users:** Dry cleaning business with multiple branches, staff roles, and customer management

## Business Context

Lorenzo Dry Cleaners currently operates a functional laundry management system managing multiple locations across Nairobi, Kenya. This upgrade adds 18 major feature enhancements to improve operations, compliance, automation, and reporting capabilities while maintaining backward compatibility with existing workflows.

### Upgrade Objectives

- Enhance existing order creation workflow with mandatory fields and brand tracking
- Add comprehensive role-based dashboards (GM, Finance, Auditor, Logistics)
- Implement automated customer reminder system
- Add complete inventory management module
- Enhance receipt system with QR codes and compliance notices
- Implement delivery classification and logistics tracking
- Add voucher system with approval workflows
- Improve audit trail and reconciliation capabilities

---

## What's New in Version 2.0

### Quick Reference: Existing vs New Features

#### Existing Features (v1.0) - To Be Preserved

✓ Order creation and management
✓ Customer management
✓ Basic receipt printing
✓ Payment processing
✓ Basic reporting
✓ User management
✓ Branch management
✓ Service/pricing management

#### New Features (v2.0) - To Be Added

**1. Enhanced Order Management**

- ✨ Mandatory brand field with "No Brand" option
- ✨ Mandatory "Checked By" inspector field
- ✨ Adult/Children category tracking
- ✨ Express vs Normal service type
- ✨ Delivery type classification (Small/Bulk)

**2. Improved Receipts**

- ✨ QR code with order tracking
- ✨ "CLEANED AT OWNER'S RISK" notice
- ✨ Terms & Conditions link
- ✨ Enhanced layout with all order details
- ✨ Reprint capability

**3. Automated Reminders** (Completely New)

- ✨ 7-day, 14-day, 30-day reminders
- ✨ Monthly reminders after 30 days
- ✨ 90-day disposal eligibility
- ✨ SMS integration
- ✨ GM approval for disposal

**4. Rewash System** (Completely New)

- ✨ 24-hour rewash eligibility
- ✨ Linked to original order
- ✨ "REWASH" tagging
- ✨ Dedicated rewash button
- ✨ Statistics tracking

**5. Delivery Classification** (Completely New)

- ✨ Auto-classify: Small (Motorcycle) vs Bulk (Van)
- ✨ Based on garment count, weight, or value
- ✨ Manager override capability
- ✨ Delivery tracking

**6. Inventory Management** (Completely New)

- ✨ Track detergents, chemicals, packaging
- ✨ Stock in/out tracking
- ✨ Branch-based inventory
- ✨ Low stock alerts
- ✨ Inventory reconciliation
- ✨ Valuation reports

**7. Voucher System** (Completely New)

- ✨ Unique voucher codes
- ✨ QR code generation
- ✨ GM approval workflow
- ✨ Single-use tracking
- ✨ Expiry date management

**8. Delivery Notes** (Completely New)

- ✨ Tailor delivery notes
- ✨ Inter-store transfer notes
- ✨ Status tracking
- ✨ Expected vs actual return dates

**9. Role-Based Dashboards** (Completely New)

**General Manager Dashboard:**

- ✨ Target setting (daily/weekly/monthly)
- ✨ Staff appraisals and performance
- ✨ Audit logs viewer
- ✨ Approval queue

**Finance Manager Dashboard:**

- ✨ Cash out request system
- ✨ Uncollected garments management
- ✨ Discount/compensation tracking
- ✨ Financial reports access

**Auditors Dashboard:**

- ✨ Read-only financial reports
- ✨ Inventory reconciliation
- ✨ Variance tracking
- ✨ Comprehensive audit logs

**Logistics Manager Dashboard:**

- ✨ Delivery tracking
- ✨ Delivery classification overview
- ✨ Complaint management
- ✨ Driver management

**10. Super Admin Controls** (Completely New)

- ✨ Staff account creation
- ✨ Role & permission management
- ✨ Approval workflow configuration
- ✨ System settings

**11. Security Enhancements**

- ✨ Auto-lock on inactivity
- ✨ Shift-based auto-logout
- ✨ Enhanced audit logging
- ✨ Session management

**12. Enhanced Reporting**

- ✨ Express vs Normal comparison
- ✨ Rewash reports
- ✨ Delivery type reports
- ✨ Staff performance reports
- ✨ Voucher usage reports
- ✨ Export to PDF/Excel

**13. Customer Enhancements**

- ✨ Customer type (Regular/Corporate/VIP)
- ✨ Loyalty points system
- ✨ Last order tracking

**14. Printing Enhancements**

- ✨ Garment tag printing with QR codes
- ✨ Enhanced receipt templates

**15. Approval Workflows**

- ✨ Two-tier approval (GM + Director)
- ✨ Voucher approvals
- ✨ Cash out approvals
- ✨ Disposal approvals

### Summary Statistics

- **Existing Tables to Extend:** 5 tables
- **New Tables to Add:** 14 tables
- **New API Endpoints:** ~60 endpoints
- **New Frontend Components:** ~35 components
- **New User Roles:** 8 defined roles
- **Total Features:** 18 major feature categories

---

## Existing System Foundation

### Current Tech Stack (To Be Confirmed)

**Frontend:**

- [Current Framework - e.g., React.js/Next.js/Vue.js]
- [Current Styling - e.g., Tailwind CSS/Bootstrap/Material-UI]
- [Current State Management - e.g., Redux/Context API/Vuex]
- [Current UI Components]

**Backend:**

- [Current Backend - e.g., Node.js/Express, Python/Django, PHP/Laravel]
- [Current Database - e.g., PostgreSQL/MySQL/MongoDB]
- [Current Authentication - e.g., JWT/Sessions]
- [Current API Architecture - e.g., REST/GraphQL]

**Infrastructure:**

- [Current Hosting - e.g., VPS/Cloud Provider]
- [Current Web Server - e.g., nginx/Apache]
- [Current Process Manager - e.g., PM2/Systemd]

**Existing Services:**

- [Current SMS Provider - e.g., Africa's Talking]
- [Current Email Service]
- [Current Payment Integration - e.g., M-Pesa]
- [Current Printer Setup]

### Architecture Approach

**Enhancement Strategy:**

1. **Preserve Core Functionality:** Maintain all existing features and workflows
2. **Extend Database Schema:** Add new tables and columns without breaking existing ones
3. **Backward Compatible APIs:** Ensure existing API endpoints continue to work
4. **Modular Development:** Build new features as independent modules
5. **Incremental Deployment:** Roll out features in phases with rollback capability

**Integration Points:**

- Use existing authentication system for new role-based access
- Extend current order management with new fields and workflows
- Integrate new dashboards with existing reporting infrastructure
- Connect inventory module to existing order processing
- Link reminder system to existing customer database

---

## Current System Architecture Documentation

> **Action Required:** Fill in this section with details from your existing Lorenzo Dry Cleaners system

### Frontend Architecture

**Framework/Library:**

- [ ] React.js (version: \_\_\_)
- [ ] Next.js (version: \_\_\_)
- [ ] Vue.js (version: \_\_\_)
- [ ] Angular (version: \_\_\_)
- [ ] Other: ****\_\_\_****

**Styling:**

- [ ] Tailwind CSS
- [ ] Bootstrap
- [ ] Material-UI
- [ ] Custom CSS
- [ ] Other: ****\_\_\_****

**State Management:**

- [ ] Redux
- [ ] Context API
- [ ] Vuex
- [ ] MobX
- [ ] Other: ****\_\_\_****

**Current Components/Pages:**

- Dashboard: ****\_\_\_****
- Order Management: ****\_\_\_****
- Customer Management: ****\_\_\_****
- Reports: ****\_\_\_****
- Settings: ****\_\_\_****
- Other: ****\_\_\_****

### Backend Architecture

**Language & Framework:**

- [ ] Node.js with Express
- [ ] Python with Django
- [ ] Python with Flask
- [ ] PHP with Laravel
- [ ] Ruby on Rails
- [ ] Java with Spring Boot
- [ ] Other: ****\_\_\_****

**API Architecture:**

- [ ] RESTful API
- [ ] GraphQL
- [ ] Other: ****\_\_\_****

**Authentication:**

- [ ] JWT
- [ ] Session-based
- [ ] OAuth
- [ ] Other: ****\_\_\_****

**Current API Endpoints:** (List main endpoints)

```
GET  /api/orders
POST /api/orders
GET  /api/customers
POST /api/customers
GET  /api/reports
... (add more)
```

### Database

**Database System:**

- [ ] PostgreSQL (version: \_\_\_)
- [ ] MySQL (version: \_\_\_)
- [ ] MongoDB (version: \_\_\_)
- [ ] SQL Server
- [ ] Other: ****\_\_\_****

**Current Tables:** (List main tables)

1. users
2. customers
3. orders
4. order_items
5. branches
6. services
7. payments
   ... (add more)

**Database Hosting:**

- [ ] Same server as application
- [ ] Separate database server
- [ ] Cloud database (provider: \_\_\_)
- [ ] Other: ****\_\_\_****

### Infrastructure

**Hosting Provider:**

- [ ] VPS (DigitalOcean, Linode, etc.)
- [ ] Cloud (AWS, Google Cloud, Azure)
- [ ] Shared Hosting
- [ ] On-premises server
- Provider: ****\_\_\_****

**Web Server:**

- [ ] nginx
- [ ] Apache
- [ ] IIS
- [ ] Other: ****\_\_\_****

**Process Manager:**

- [ ] PM2
- [ ] systemd
- [ ] Supervisor
- [ ] Docker
- [ ] Other: ****\_\_\_****

**Domain & SSL:**

- Domain: ****\_\_\_****
- SSL Certificate: [ ] Yes [ ] No
- Provider: ****\_\_\_****

### Third-Party Services

**SMS Service:**

- [ ] Africa's Talking
- [ ] Twilio
- [ ] Other: ****\_\_\_****
- API Key Location: ****\_\_\_****

**Email Service:**

- [ ] Gmail SMTP
- [ ] SendGrid
- [ ] Mailgun
- [ ] Other: ****\_\_\_****

**Payment Integration:**

- [ ] M-Pesa (Safaricom API)
- [ ] PayPal
- [ ] Stripe
- [ ] Other: ****\_\_\_****

**Printer Setup:**

- Thermal Printer Model: ****\_\_\_****
- Connection Type: [ ] USB [ ] Network [ ] Bluetooth
- Current Integration: ****\_\_\_****

### Current User Roles

List existing user roles and their permissions:

1. **Admin:** ****\_\_\_****
2. **Manager:** ****\_\_\_****
3. **Staff:** ****\_\_\_****
4. **Other:** ****\_\_\_****

### Current Features

**Implemented Features:**

- [ ] Order Creation
- [ ] Customer Management
- [ ] Receipt Printing
- [ ] Payment Processing
- [ ] Basic Reporting
- [ ] User Management
- [ ] Branch Management
- [ ] Service Management
- [ ] Other: ****\_\_\_****

**Missing Features (to be added in v2.0):**

- [ ] Inventory Management
- [ ] Automated Reminders
- [ ] Delivery Classification
- [ ] Voucher System
- [ ] Role-based Dashboards
- [ ] Audit Logs
- [ ] All other features in PRD

### Access & Credentials

**Development Environment:**

- URL: ****\_\_\_****
- Admin Username: ****\_\_\_****
- Database Access: ****\_\_\_****

**Staging Environment:**

- URL: ****\_\_\_****
- Database: ****\_\_\_****

**Production Environment:**

- URL: ****\_\_\_****
- Server IP: ****\_\_\_****
- SSH Access: ****\_\_\_****

**Code Repository:**

- [ ] GitHub
- [ ] GitLab
- [ ] Bitbucket
- [ ] Other: ****\_\_\_****
- Repository URL: ****\_\_\_****

---

## Integration Approach for New Features

### Working with Existing Code

**File Structure Assessment:**

```
/your-existing-app/
├── /src (or /app)
│   ├── /components
│   ├── /pages (or /views)
│   ├── /services (or /api)
│   ├── /utils
│   └── /models
├── /database
├── /config
└── /public
```

**Adding New Features:**

1. **Frontend Components:** Add to existing `/components` directory

   ```
   /components
   ├── /existing-components
   └── /v2-features (new)
       ├── /gm-dashboard
       ├── /inventory
       ├── /vouchers
       └── /logistics
   ```

2. **Backend Routes:** Extend existing API routes

   ```
   /routes (or /api)
   ├── /orders.js (existing - extend)
   ├── /customers.js (existing - extend)
   ├── /inventory.js (new)
   ├── /vouchers.js (new)
   ├── /reminders.js (new)
   └── /reports.js (extend)
   ```

3. **Database Migrations:** Create migration directory if not exists
   ```
   /database
   ├── /migrations (create if not exists)
   │   └── /v2.0
   │       ├── 001_add_roles_table.sql
   │       ├── 002_extend_orders.sql
   │       └── ...
   └── /seeds
   ```

### Code Integration Pattern

**Example: Extending Order Creation**

**Current Code (preserve):**

```javascript
// Existing order creation
app.post('/api/orders', async (req, res) => {
  const { customerId, items, total } = req.body;
  // ... existing logic
});
```

**Enhanced Code (extend):**

```javascript
// Enhanced order creation with v2.0 features
app.post('/api/orders', async (req, res) => {
  const {
    customerId,
    items,
    total,
    // New v2.0 fields
    checkedBy,
    serviceType = 'Normal',
    deliveryType,
  } = req.body;

  // Existing validation
  // ... existing logic

  // New v2.0 validations
  if (!checkedBy) {
    return res.status(400).json({ error: 'Checked by is required' });
  }

  // Calculate express pricing if applicable
  if (serviceType === 'Express') {
    total = total * 1.5;
  }

  // Auto-classify delivery
  const classification = await classifyDelivery(items, total);

  // ... rest of logic
});
```

### Environment Variables

**Add to your `.env` file:**

```bash
# Existing variables
DATABASE_URL=...
SMS_API_KEY=...

# New v2.0 variables
EXPRESS_SERVICE_MULTIPLIER=1.5
INACTIVITY_TIMEOUT_MINUTES=10
REMINDER_ENABLED=true
INVENTORY_ALERTS_ENABLED=true
AUDIT_LOGS_RETENTION_DAYS=365
```

### Testing Integration

**Create separate test suites for v2.0:**

```
/tests
├── /existing-tests
└── /v2.0-features
    ├── inventory.test.js
    ├── vouchers.test.js
    ├── reminders.test.js
    └── dashboards.test.js
```

---

## Database Schema Enhancements

### Migration Strategy

**Approach:**

1. **Non-Breaking Changes:** Add new tables and columns without modifying existing ones
2. **Gradual Migration:** Phase migration to minimize downtime
3. **Data Preservation:** Ensure all existing data remains intact
4. **Rollback Plan:** Maintain ability to revert changes if needed
5. **Testing:** Test migrations on staging environment first

### Existing Tables to Extend

**Assumption:** Your current system likely has tables for:

- Users/Staff
- Customers
- Orders
- Order Items
- Branches
- Services/Pricing
- Payments

### New Columns for Existing Tables

#### Extend Users Table

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS shift_start_time TIME;
ALTER TABLE users ADD COLUMN IF NOT EXISTS shift_end_time TIME;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
```

#### Extend Orders Table

```sql
ALTER TABLE orders ADD COLUMN IF NOT EXISTS checked_by UUID REFERENCES users(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_rewash BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS original_order_id UUID REFERENCES orders(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS rewash_requested_at TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_type VARCHAR(20); -- 'Small' or 'Bulk'
```

#### Extend Order_Items Table

```sql
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS brand VARCHAR(100);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS category VARCHAR(20); -- 'Adult' or 'Children'
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS tag_number VARCHAR(50) UNIQUE;
```

#### Extend Customers Table

```sql
ALTER TABLE customers ADD COLUMN IF NOT EXISTS customer_type VARCHAR(20) DEFAULT 'Regular'; -- 'Regular', 'Corporate', 'VIP'
ALTER TABLE customers ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_order_date DATE;
```

#### Extend Branches Table

```sql
ALTER TABLE branches ADD COLUMN IF NOT EXISTS branch_type VARCHAR(30); -- 'Main Store', 'Collection Point'
ALTER TABLE branches ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES users(id);
```

### New Tables to Add

#### 1. Roles (if not exists)

```sql
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    permissions JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial roles insert
INSERT INTO roles (role_name, permissions) VALUES
('POS Attendant', '{"orders": {"create": true, "read": true}}'),
('Inspector', '{"orders": {"read": true, "update": true}}'),
('General Manager', '{"all": true}'),
('Director', '{"all": true, "multibranchAccess": true}'),
('Finance Manager', '{"financial": true}'),
('Auditor', '{"readonly": true, "audit": true}'),
('Logistics Manager', '{"deliveries": true, "logistics": true}'),
('Super Admin', '{"admin": true}')
ON CONFLICT (role_name) DO NOTHING;
```

#### 2. Receipts

```sql
CREATE TABLE IF NOT EXISTS receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    order_id UUID REFERENCES orders(id),
    receipt_type VARCHAR(30) NOT NULL,
    qr_code_data TEXT,
    terms_url VARCHAR(255),
    printed_by UUID REFERENCES users(id),
    printed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_receipts_order ON receipts(order_id);
```

#### 3. Reminders

```sql
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    customer_id UUID REFERENCES customers(id),
    reminder_type VARCHAR(30) NOT NULL,
    scheduled_date DATE NOT NULL,
    sent_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'Pending',
    message_content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reminders_scheduled ON reminders(scheduled_date, status);
CREATE INDEX idx_reminders_order ON reminders(order_id);
```

#### 4. Vouchers

```sql
CREATE TABLE IF NOT EXISTS vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voucher_code VARCHAR(50) UNIQUE NOT NULL,
    qr_code_data TEXT,
    discount_type VARCHAR(20) NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approval_status VARCHAR(20) DEFAULT 'Pending',
    expiry_date DATE NOT NULL,
    is_used BOOLEAN DEFAULT false,
    used_by_customer UUID REFERENCES customers(id),
    used_date TIMESTAMP,
    order_id UUID REFERENCES orders(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vouchers_code ON vouchers(voucher_code);
CREATE INDEX idx_vouchers_status ON vouchers(approval_status, is_used);
```

#### 5. Deliveries

```sql
CREATE TABLE IF NOT EXISTS deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    delivery_type VARCHAR(20) NOT NULL,
    delivery_date DATE,
    delivery_address TEXT,
    driver_id UUID REFERENCES users(id),
    delivery_status VARCHAR(30) DEFAULT 'Pending',
    classification_basis VARCHAR(30),
    garment_count INTEGER,
    total_weight DECIMAL(10,2),
    total_value DECIMAL(10,2),
    override_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_deliveries_status ON deliveries(delivery_status);
CREATE INDEX idx_deliveries_date ON deliveries(delivery_date);
```

#### 6. Delivery_Notes

```sql
CREATE TABLE IF NOT EXISTS delivery_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_number VARCHAR(50) UNIQUE NOT NULL,
    note_type VARCHAR(30) NOT NULL,
    from_location VARCHAR(100),
    to_location VARCHAR(100),
    order_ids UUID[],
    date_sent DATE,
    expected_return_date DATE,
    actual_return_date DATE,
    authorized_by UUID REFERENCES users(id),
    received_by VARCHAR(100),
    status VARCHAR(30) DEFAULT 'Sent',
    items_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_delivery_notes_status ON delivery_notes(status);
```

#### 7. Inventory

```sql
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id INTEGER REFERENCES branches(id),
    item_name VARCHAR(100) NOT NULL,
    item_category VARCHAR(50) NOT NULL,
    current_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
    minimum_level DECIMAL(10,2) NOT NULL,
    unit_of_measure VARCHAR(20),
    unit_cost DECIMAL(10,2),
    total_value DECIMAL(10,2),
    last_restocked_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(branch_id, item_name)
);

CREATE INDEX idx_inventory_branch ON inventory(branch_id);
CREATE INDEX idx_inventory_low_stock ON inventory(current_stock, minimum_level);
```

#### 8. Inventory_Transactions

```sql
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID REFERENCES inventory(id),
    transaction_type VARCHAR(30) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    performed_by UUID REFERENCES users(id),
    notes TEXT,
    reference_number VARCHAR(50),
    from_branch_id INTEGER REFERENCES branches(id),
    to_branch_id INTEGER REFERENCES branches(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inventory_trans_inventory ON inventory_transactions(inventory_id);
CREATE INDEX idx_inventory_trans_date ON inventory_transactions(transaction_date);
```

#### 9. Audit_Logs

```sql
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action_type VARCHAR(50) NOT NULL,
    table_name VARCHAR(50),
    record_id VARCHAR(100),
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_action ON audit_logs(action_type);
```

#### 10. Targets

```sql
CREATE TABLE IF NOT EXISTS targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_type VARCHAR(20) NOT NULL,
    branch_id INTEGER REFERENCES branches(id),
    user_id UUID REFERENCES users(id),
    target_amount DECIMAL(12,2) NOT NULL,
    target_period_start DATE NOT NULL,
    target_period_end DATE NOT NULL,
    actual_amount DECIMAL(12,2) DEFAULT 0,
    achievement_percentage DECIMAL(5,2),
    set_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_targets_period ON targets(target_period_start, target_period_end);
```

#### 11. Staff_Performance

```sql
CREATE TABLE IF NOT EXISTS staff_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    evaluation_period_start DATE NOT NULL,
    evaluation_period_end DATE NOT NULL,
    orders_booked INTEGER DEFAULT 0,
    rewash_count INTEGER DEFAULT 0,
    complaints_count INTEGER DEFAULT 0,
    discounts_issued DECIMAL(10,2) DEFAULT 0,
    performance_score DECIMAL(10,2),
    evaluated_by UUID REFERENCES users(id),
    evaluation_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_staff_perf_user ON staff_performance(user_id);
```

#### 12. Cash_Out_Transactions

```sql
CREATE TABLE IF NOT EXISTS cash_out_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_type VARCHAR(50) NOT NULL,
    order_id UUID REFERENCES orders(id),
    amount DECIMAL(10,2) NOT NULL,
    reason TEXT,
    requested_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approval_status VARCHAR(20) DEFAULT 'Pending',
    approval_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cashout_status ON cash_out_transactions(approval_status);
```

#### 13. Reports

```sql
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type VARCHAR(50) NOT NULL,
    generated_by UUID REFERENCES users(id),
    report_period_start DATE,
    report_period_end DATE,
    branch_id INTEGER REFERENCES branches(id),
    report_data JSONB,
    file_path VARCHAR(255),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_type ON reports(report_type);
CREATE INDEX idx_reports_date ON reports(generated_at);
```

#### 14. System_Settings

```sql
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('inactivity_timeout', '600', 'Inactivity timeout in seconds (default: 10 minutes)'),
('express_multiplier', '1.5', 'Express service price multiplier'),
('reminder_intervals', '{"7days": true, "14days": true, "30days": true, "monthly": true}', 'Reminder schedule configuration'),
('disposal_threshold_days', '90', 'Days before order eligible for disposal'),
('delivery_classification', '{"small": {"maxGarments": 5, "maxWeight": 10, "maxValue": 5000}, "bulk": {"minGarments": 6}}', 'Delivery classification rules')
ON CONFLICT (setting_key) DO NOTHING;
```

### Migration Scripts Location

Store migration scripts in: `/database/migrations/v2.0/`

**Naming Convention:**

- `001_add_user_shifts.sql`
- `002_extend_orders_table.sql`
- `003_create_inventory_tables.sql`
- etc.

### Data Migration Considerations

**Existing Data Handling:**

1. **Brand Field:** Existing orders without brand → set to "No Brand"
2. **Customer Type:** Existing customers → default to "Regular"
3. **Loyalty Points:** Existing customers → calculate retroactive points (optional)
4. **Service Type:** Existing orders → default to "Normal" service
5. **Checked By:** Historical orders → set to null (not applicable)

```sql
- id (UUID, Primary Key)
- username
- email
- password_hash
- role_id (Foreign Key → Roles)
- branch_id (Foreign Key → Branches)
- full_name
- phone_number
- is_active
- shift_start_time
- shift_end_time
- created_at
- updated_at
- last_login
```

#### 2. Roles

```sql
- id (Primary Key)
- role_name (POS Attendant, Inspector, GM, Director, Finance Manager, Auditor, Logistics Manager, Super Admin)
- permissions (JSONB)
- created_at
```

#### 3. Branches

```sql
- id (Primary Key)
- branch_name
- branch_type (Main Store, Collection Point)
- address
- phone_number
- manager_id (Foreign Key → Users)
- is_active
- created_at
```

#### 4. Customers

```sql
- id (UUID, Primary Key)
- customer_number (Auto-generated, Unique)
- full_name
- phone_number
- email
- address
- customer_type (Regular, Corporate, VIP)
- loyalty_points
- registration_date
- last_order_date
- created_at
- updated_at
```

#### 5. Orders

```sql
- id (UUID, Primary Key)
- order_number (Auto-generated, Unique)
- customer_id (Foreign Key → Customers)
- branch_id (Foreign Key → Branches)
- order_date
- promised_date
- delivery_date
- order_status (Pending, In Progress, Ready, Delivered, Rewash, Cancelled)
- service_type (Normal, Express)
- total_amount
- amount_paid
- balance
- payment_status (Pending, Partial, Paid)
- payment_method (Cash, M-Pesa, Card, Voucher)
- booked_by (Foreign Key → Users)
- checked_by (Foreign Key → Users)
- is_rewash
- original_order_id (Foreign Key → Orders, for rewash)
- rewash_requested_at
- notes
- created_at
- updated_at
```

#### 6. Order_Items

```sql
- id (UUID, Primary Key)
- order_id (Foreign Key → Orders)
- garment_name
- brand (or "No Brand")
- color
- category (Adult, Children)
- service_id (Foreign Key → Services)
- quantity
- unit_price
- total_price
- status (Pending, Cleaned, Quality Checked, Ready)
- tag_number (Auto-generated)
- created_at
```

#### 7. Services

```sql
- id (Primary Key)
- service_name (e.g., Shirt, Suit, Dress, Blanket)
- normal_price
- express_multiplier (default 1.5)
- is_active
- created_at
- updated_at
```

#### 8. Receipts

```sql
- id (UUID, Primary Key)
- receipt_number (Auto-generated)
- order_id (Foreign Key → Orders)
- receipt_type (Order Receipt, Delivery Note, Tailor Note)
- qr_code_data
- terms_url
- printed_by (Foreign Key → Users)
- printed_at
- created_at
```

#### 9. Reminders

```sql
- id (UUID, Primary Key)
- order_id (Foreign Key → Orders)
- customer_id (Foreign Key → Customers)
- reminder_type (7_days, 14_days, 30_days, monthly, disposal_eligible)
- scheduled_date
- sent_date
- status (Pending, Sent, Failed)
- message_content
- created_at
```

#### 10. Vouchers

```sql
- id (UUID, Primary Key)
- voucher_code (Unique)
- qr_code_data
- discount_type (Percentage, Fixed Amount)
- discount_value
- created_by (Foreign Key → Users)
- approved_by (Foreign Key → Users)
- approval_status (Pending, Approved, Rejected)
- expiry_date
- is_used
- used_by_customer (Foreign Key → Customers)
- used_date
- order_id (Foreign Key → Orders)
- created_at
```

#### 11. Deliveries

```sql
- id (UUID, Primary Key)
- order_id (Foreign Key → Orders)
- delivery_type (Small - Motorcycle, Bulk - Van)
- delivery_date
- delivery_address
- driver_id (Foreign Key → Users)
- delivery_status (Pending, In Transit, Delivered, Failed)
- classification_basis (Garment Count, Weight, Value, Manual)
- garment_count
- total_weight
- total_value
- override_by (Foreign Key → Users, if manually overridden)
- notes
- created_at
- updated_at
```

#### 12. Delivery_Notes

```sql
- id (UUID, Primary Key)
- note_number (Auto-generated)
- note_type (Tailor Transfer, Inter-Store Transfer)
- from_location (Branch ID or Tailor)
- to_location (Branch ID or Tailor)
- order_ids (Array of Order IDs)
- date_sent
- expected_return_date
- actual_return_date
- authorized_by (Foreign Key → Users)
- received_by
- status (Sent, In Transit, Received, Returned)
- items_description
- created_at
- updated_at
```

#### 13. Inventory

```sql
- id (UUID, Primary Key)
- branch_id (Foreign Key → Branches)
- item_name
- item_category (Detergent, Chemical, Packaging, Hanger, Tag)
- current_stock
- minimum_level
- unit_of_measure
- unit_cost
- total_value
- last_restocked_date
- created_at
- updated_at
```

#### 14. Inventory_Transactions

```sql
- id (UUID, Primary Key)
- inventory_id (Foreign Key → Inventory)
- transaction_type (Stock In, Stock Out, Transfer, Adjustment)
- quantity
- transaction_date
- performed_by (Foreign Key → Users)
- notes
- reference_number
- from_branch_id (for transfers)
- to_branch_id (for transfers)
- created_at
```

#### 15. Audit_Logs

```sql
- id (UUID, Primary Key)
- user_id (Foreign Key → Users)
- action_type (Order Edit, Voucher Approval, Cash Adjustment, Inventory Change, etc.)
- table_name
- record_id
- old_value (JSONB)
- new_value (JSONB)
- ip_address
- timestamp
- description
```

#### 16. Targets

```sql
- id (UUID, Primary Key)
- target_type (Daily, Weekly, Monthly)
- branch_id (Foreign Key → Branches)
- user_id (Foreign Key → Users, for individual targets)
- target_amount
- target_period_start
- target_period_end
- actual_amount
- achievement_percentage
- set_by (Foreign Key → Users)
- created_at
```

#### 17. Staff_Performance

```sql
- id (UUID, Primary Key)
- user_id (Foreign Key → Users)
- evaluation_period_start
- evaluation_period_end
- orders_booked
- rewash_count
- complaints_count
- discounts_issued
- performance_score
- evaluated_by (Foreign Key → Users)
- evaluation_date
- notes
- created_at
```

#### 18. Cash_Out_Transactions

```sql
- id (UUID, Primary Key)
- transaction_type (Uncollected Garment, Discount, Compensation, Order Cancellation)
- order_id (Foreign Key → Orders)
- amount
- reason
- requested_by (Foreign Key → Users)
- approved_by (Foreign Key → Users)
- approval_status (Pending, Approved, Rejected)
- approval_date
- created_at
```

#### 19. Reports

```sql
- id (UUID, Primary Key)
- report_type (Daily Revenue, Weekly Revenue, Monthly Revenue, Express vs Normal, Rewash, Delivery Type, Staff Performance, Voucher Usage)
- generated_by (Foreign Key → Users)
- report_period_start
- report_period_end
- branch_id (Foreign Key → Branches)
- report_data (JSONB)
- file_path (for PDF/Excel exports)
- generated_at
```

#### 20. System_Settings

```sql
- id (Primary Key)
- setting_key (e.g., inactivity_timeout, express_multiplier, reminder_intervals)
- setting_value (JSONB)
- description
- updated_by (Foreign Key → Users)
- updated_at
```

---

## Feature Implementation Details

### 1. Order Creation Improvements

**Components:**

- OrderForm.jsx (with brand field logic)
- BrandCheckbox.jsx
- MandatoryFieldIndicator.jsx

**Business Logic:**

- Brand field is mandatory by default
- "No Brand" checkbox disables brand input and stores "No Brand" as value
- All mandatory fields must be validated before order submission
- Real-time field validation with error messages

**Validation Rules:**

```javascript
{
  garmentName: { required: true, minLength: 2 },
  brand: { required: true },
  color: { required: true },
  category: { required: true, enum: ['Adult', 'Children'] },
  serviceType: { required: true, enum: ['Normal', 'Express'] },
  bookedBy: { required: true },
  checkedBy: { required: true }
}
```

**API Endpoints:**

- POST `/api/orders` - Create new order
- PUT `/api/orders/:id` - Update order
- GET `/api/orders/:id` - Get order details

---

### 2. Receipt Enhancements

**Components:**

- ReceiptTemplate.jsx
- ReceiptPrinter.jsx
- QRCodeGenerator.jsx

**Receipt Layout Requirements:**

1. Header Section:
   - Company logo (centered)
   - Company name
   - Branch address and contact

2. Order Information:
   - Order number (prominently displayed)
   - Date and time
   - Service type badge

3. Customer Details:
   - Customer name
   - Phone number
   - Customer type

4. Garment Details Table:
   | Item | Brand | Color | Category | Price |
   |------|-------|-------|----------|-------|

5. Summary Section:
   - Subtotal
   - Discounts (if any)
   - Total Amount
   - Amount Paid
   - Balance

6. Footer:
   - **CLEANED AT OWNER'S RISK** (bold, centered)
   - Terms & Conditions link
   - QR code (linking to T&C page)
   - Booked by and Checked by staff names
   - "Thank you for your business"

**Technical Implementation:**

- Use thermal printer library for POS receipt printing
- Generate QR code with order tracking URL
- Store receipt as PDF in database
- Support reprint functionality

**API Endpoints:**

- POST `/api/receipts/generate` - Generate receipt
- GET `/api/receipts/:id/print` - Print receipt
- GET `/api/receipts/:id/pdf` - Download receipt PDF

---

### 3. Delivery Classification System

**Components:**

- DeliveryClassifier.jsx
- DeliveryTypeSelector.jsx
- ManualOverrideModal.jsx

**Classification Logic:**

```javascript
function classifyDelivery(order) {
  const rules = {
    small: { maxGarments: 5, maxWeight: 10, maxValue: 5000 },
    bulk: { minGarments: 6, minWeight: 10.1, minValue: 5001 },
  };

  // Auto-classify based on configurable rules
  // Allow manager override
}
```

**Business Rules:**

- Small Delivery (Motorcycle): ≤5 garments OR ≤10kg OR ≤KES 5,000
- Bulk Delivery (Van): >5 garments OR >10kg OR >KES 5,000
- Manager can manually override classification
- Log all manual overrides in audit trail

**API Endpoints:**

- POST `/api/deliveries/classify` - Auto-classify delivery
- PUT `/api/deliveries/:id/override` - Manual override
- GET `/api/deliveries/pending` - Get pending deliveries

---

### 4. General Manager Dashboard

**Components:**

- GMDashboard.jsx
- TargetsSetting.jsx
- StaffAppraisalPanel.jsx
- AuditLogsViewer.jsx
- PerformanceCharts.jsx

**Dashboard Sections:**

**A. Targets Setting:**

- Daily target input (revenue goal)
- Weekly target input
- Monthly target input
- Individual staff targets
- Progress tracking with visual indicators

**B. Staff Appraisals:**
Display metrics for each staff member:

- Orders booked (count and total value)
- Rewash rate (%)
- Complaints received
- Discounts issued
- Performance score calculation

**Performance Score Formula:**

```javascript
score =
  ordersBooked * 10 - rewashRate * 5 - complaints * 15 - discountsIssued * 2;
```

**C. Audit Logs:**

- Real-time log viewer
- Filter by action type, user, date range
- Export audit logs
- Highlight critical actions (voucher approvals, cash adjustments)

**Data Visualizations:**

- Line chart: Daily revenue trend
- Bar chart: Staff performance comparison
- Pie chart: Service type distribution
- Gauge: Target achievement percentage

**API Endpoints:**

- GET `/api/gm/dashboard` - Dashboard summary
- POST `/api/gm/targets` - Set targets
- GET `/api/gm/staff-performance` - Staff metrics
- GET `/api/gm/audit-logs` - Audit trail

---

### 5. Client Reminder System

**Components:**

- ReminderScheduler.jsx
- ReminderTemplates.jsx
- DisposalApprovalModal.jsx

**Reminder Schedule:**

1. 7 days after promised date: "Your order is ready for collection"
2. 14 days: "Reminder: Please collect your order"
3. 30 days: "Final reminder: Your order awaits collection"
4. Monthly reminders after 30 days
5. 90 days: Mark as "Eligible for Disposal" + GM notification

**SMS Template Examples:**

```
7-day: "Hi [Name], your order #[OrderNo] is ready! Collect at [Branch]. Lorenzo Dry Cleaners"
14-day: "Reminder: Order #[OrderNo] awaiting collection. Contact us: [Phone]"
30-day: "FINAL NOTICE: Order #[OrderNo] must be collected soon. Risk of disposal. [Phone]"
90-day (GM): "Order #[OrderNo] ([Customer]) eligible for disposal. Approve via dashboard."
```

**Technical Implementation:**

- Use Bull Queue for scheduled jobs
- Cron job checks daily for due reminders
- SMS sent via Africa's Talking API
- Track reminder status (Sent, Failed, Bounced)
- GM approval required before disposal

**Database Tracking:**

- Store all sent reminders
- Link reminders to orders
- Flag orders eligible for disposal
- Audit trail for disposal approvals

**API Endpoints:**

- POST `/api/reminders/schedule` - Schedule reminder
- GET `/api/reminders/pending` - Get pending reminders
- POST `/api/reminders/send` - Manual send
- GET `/api/reminders/disposal-eligible` - Orders for disposal
- POST `/api/reminders/approve-disposal` - GM approval

---

### 6. Service Reports

**Components:**

- ReportsHub.jsx
- ReportGenerator.jsx
- ReportExporter.jsx
- DateRangePicker.jsx

**Report Types:**

**A. Daily Revenue Report:**

- Total revenue
- Orders count
- Average order value
- Payment method breakdown
- Hourly revenue distribution

**B. Weekly Revenue Report:**

- 7-day trend analysis
- Day-over-day comparison
- Peak days identification
- Week-over-week growth

**C. Monthly Revenue Report:**

- Monthly totals
- Category breakdown
- Branch comparison
- Month-over-month analysis

**D. Express vs Normal Service:**

- Count comparison
- Revenue comparison
- Average value comparison
- Conversion rate (normal → express)

**E. Rewash Report:**

- Total rewash count
- Rewash rate by staff
- Rewash reasons
- Cost impact analysis

**F. Delivery Type Report:**

- Small vs Bulk delivery count
- Cost analysis
- Delivery success rate
- Average delivery time

**G. Staff Performance Report:**

- Individual staff metrics
- Team rankings
- Performance trends
- Top performers

**H. Voucher Usage Report:**

- Vouchers issued
- Vouchers redeemed
- Redemption rate
- Discount impact on revenue

**Export Features:**

- PDF export with company branding
- Excel export with raw data
- Scheduled email reports
- Print-friendly formats

**API Endpoints:**

- POST `/api/reports/generate` - Generate report
- GET `/api/reports/:type/:period` - Get specific report
- GET `/api/reports/:id/export/pdf` - Export PDF
- GET `/api/reports/:id/export/excel` - Export Excel

---

### 7. Auto-Lock & Shift Control

**Components:**

- SessionManager.jsx
- InactivityDetector.jsx
- ShiftValidator.jsx
- LockScreen.jsx

**Inactivity Lock:**

- Configurable timeout (default: 10 minutes)
- Mouse/keyboard activity detection
- Warning before lock (1 minute countdown)
- Require re-authentication to unlock
- Session persistence (work not lost)

**Shift Lock:**

- Define shift times in user profile
- Auto-logout at shift end
- Grace period (5 minutes) with warning
- Manager override capability
- Log shift violations

**Implementation:**

```javascript
// Inactivity detector
const inactivityTimeout = getSystemSetting('inactivity_timeout'); // minutes
let activityTimer;

function resetActivityTimer() {
  clearTimeout(activityTimer);
  activityTimer = setTimeout(lockScreen, inactivityTimeout * 60000);
}

// Shift validator
function validateShift(user) {
  const currentTime = new Date();
  const shiftEnd = user.shift_end_time;

  if (currentTime > shiftEnd) {
    if (!hasManagerOverride()) {
      logoutUser();
    }
  }
}
```

**API Endpoints:**

- POST `/api/session/lock` - Lock session
- POST `/api/session/unlock` - Unlock session
- POST `/api/session/shift-override` - Manager override
- GET `/api/settings/inactivity-timeout` - Get timeout setting

---

### 8. Delivery Notes

**Components:**

- DeliveryNoteGenerator.jsx
- TailorNoteForm.jsx
- InterStoreTransferForm.jsx
- DeliveryNoteTracker.jsx

**A. Tailor Delivery Note:**

**Required Fields:**

- Delivery note number (auto-generated: TDN-YYYYMMDD-XXX)
- From: Store name and address
- To: Tailor name and address
- Date sent
- Expected return date
- Order numbers included
- Garment details (list)
- Authorized by (staff name and signature)
- Received by (space for tailor signature)

**Workflow:**

1. Create delivery note
2. Print note (3 copies: store, tailor, filing)
3. Mark orders as "With Tailor"
4. Track return
5. Update status on return
6. Close delivery note

**B. Inter-Store Transfer:**

**Transfer Types:**

- Collection Point → Main Store
- Main Store → Collection Point
- Store → Store (lateral transfer)

**Required Fields:**

- Transfer note number (auto-generated: TRN-YYYYMMDD-XXX)
- From branch
- To branch
- Transfer date
- Order IDs
- Garment count
- Authorized by
- Sent by (driver)
- Received by
- Status (Sent, In Transit, Received)

**Status Tracking:**

- Pending: Note created, not yet sent
- Sent: Items dispatched
- In Transit: Driver confirmed pickup
- Received: Destination confirmed receipt
- Discrepancy: Issues reported

**API Endpoints:**

- POST `/api/delivery-notes/tailor` - Create tailor note
- POST `/api/delivery-notes/transfer` - Create transfer note
- PUT `/api/delivery-notes/:id/status` - Update status
- GET `/api/delivery-notes/pending` - Get pending notes
- GET `/api/delivery-notes/:id/print` - Print note

---

### 9. Express Service Pricing

**Components:**

- PriceCalculator.jsx
- ServiceTypeSelector.jsx
- PriceDisplay.jsx

**Pricing Logic:**

```javascript
function calculatePrice(serviceId, serviceType, quantity = 1) {
  const service = getServiceById(serviceId);
  const basePrice = service.normal_price;
  const multiplier = serviceType === 'Express' ? 1.5 : 1.0;

  return basePrice * multiplier * quantity;
}
```

**Business Rules:**

- Express service is always 1.5× normal price
- Multiplier is system-wide (configurable in settings)
- Auto-calculate on service type change
- Display breakdown: "Normal: KES 500 | Express: KES 750"
- Real-time price updates in order form

**Display Format:**

```
Service: Shirt Laundry
Normal Price: KES 200
Express Price: KES 300 (1.5×)
Selected: Express
Total: KES 300
```

**API Endpoints:**

- GET `/api/services` - Get all services with prices
- GET `/api/services/:id/price` - Calculate price
- PUT `/api/settings/express-multiplier` - Update multiplier

---

### 10. Rewash System

**Components:**

- RewashRequestForm.jsx
- RewashButton.jsx
- RewashTracker.jsx
- RewashReportGenerator.jsx

**Rewash Rules:**

- Must be requested within 24 hours of delivery
- Uses same order number with "-R" suffix
- Tagged clearly as "REWASH" in system
- No charge to customer
- Original order linked
- Track rewash reason
- Count towards staff performance metrics

**Workflow:**

1. Customer reports issue within 24 hours
2. Staff verifies eligibility (time window)
3. Staff creates rewash request
4. System creates new order linked to original
5. Order marked as "REWASH" with special tag
6. Processing priority (high)
7. Quality check mandatory before return
8. Close original order
9. Update rewash statistics

**Rewash Request Form:**

- Original order number
- Customer complaint/reason
- Garments affected (select from original order)
- Requested by (customer name)
- Received by (staff name)
- Notes
- Approval (auto-approved if within 24hrs)

**Tracking Metrics:**

- Rewash count by staff member
- Rewash rate (rewashes / total orders)
- Most common rewash reasons
- Cost impact
- Time to resolve

**Database Schema:**

```javascript
{
  orderId: "ORD-20250203-001-R",
  isRewash: true,
  originalOrderId: "ORD-20250203-001",
  rewashReason: "Stain not removed",
  rewashRequestedAt: "2025-02-04T10:30:00Z",
  requestedBy: "John Customer",
  receivedBy: "userId-staff",
  status: "In Progress"
}
```

**API Endpoints:**

- POST `/api/orders/rewash` - Create rewash request
- GET `/api/orders/:id/rewash-eligibility` - Check if eligible
- GET `/api/reports/rewash` - Rewash statistics
- GET `/api/staff/:id/rewash-rate` - Staff rewash metrics

---

### 11. Voucher System

**Components:**

- VoucherCreator.jsx
- VoucherApprovalPanel.jsx
- VoucherValidator.jsx
- VoucherQRGenerator.jsx

**Voucher Creation:**

**Form Fields:**

- Voucher code (auto-generated: VCH-YYYYMMDD-XXXXX)
- Discount type (Percentage, Fixed Amount)
- Discount value
- Expiry date
- Usage limit (single-use)
- Terms and conditions
- Created by
- Requires approval (if from call center)

**Approval Workflow:**

1. Call center creates voucher
2. Status: Pending Approval
3. Notification sent to GM
4. GM reviews and approves/rejects
5. If approved: Generate QR code and activate
6. If rejected: Mark as rejected with reason

**QR Code:**

- Contains voucher code
- Links to validation page
- Scannable at POS
- Validates expiry and usage

**Validation Rules:**

- Check expiry date
- Check if already used
- Check if approved
- Verify discount doesn't exceed order total
- Log all validation attempts

**Usage Tracking:**

- Who used it (customer)
- When used (datetime)
- Order ID
- Discount amount applied
- Used at which branch

**API Endpoints:**

- POST `/api/vouchers/create` - Create voucher
- PUT `/api/vouchers/:id/approve` - GM approval
- POST `/api/vouchers/validate` - Validate voucher code
- POST `/api/vouchers/:id/redeem` - Redeem voucher
- GET `/api/vouchers/pending-approval` - Get pending vouchers
- GET `/api/reports/vouchers` - Voucher usage report

---

### 12. Inventory Management System

**Components:**

- InventoryDashboard.jsx
- StockInForm.jsx
- StockOutForm.jsx
- InventoryAlertsPanel.jsx
- InventoryReports.jsx

**A. Consumables Tracking:**

**Categories:**

1. Detergents (Liquid, Powder, Specialty)
2. Chemicals (Stain removers, Softeners, Bleach)
3. Packaging Materials (Bags, Wrapping paper, Hangers)
4. Hangers (Wire, Plastic, Wood)
5. Tags (Price tags, Garment tags)

**For Each Item:**

- Item name
- Category
- Current stock quantity
- Unit of measure (kg, liters, pieces)
- Minimum stock level (alert threshold)
- Unit cost
- Total value
- Supplier information
- Last restock date

**B. Branch-Based Inventory:**

- Each branch has separate inventory
- Independent stock levels
- Branch-specific minimum levels
- Inter-branch transfers tracked

**C. Stock Transactions:**

**Stock In:**

- Supplier delivery
- Branch transfer (receiving)
- Stock adjustment (count correction)

**Stock Out:**

- Usage/consumption
- Branch transfer (sending)
- Waste/damage
- Stock adjustment

**Alerts:**

- Low stock alert (below minimum level)
- Out of stock alert
- Expiry date warnings (for chemicals)
- Unusual usage patterns

**D. Inventory Reports:**

**Stock Valuation Report:**

- Current stock by category
- Total inventory value
- Value by branch
- Value trends

**Usage Report:**

- Consumption by item
- Usage rate (per day/week/month)
- Cost of goods used
- Comparison with previous periods

**Shrinkage Report:**

- Expected vs actual stock
- Variance analysis
- Loss/damage tracking
- Reconciliation notes

**API Endpoints:**

- GET `/api/inventory/branch/:id` - Get branch inventory
- POST `/api/inventory/stock-in` - Record stock in
- POST `/api/inventory/stock-out` - Record stock out
- POST `/api/inventory/transfer` - Inter-branch transfer
- GET `/api/inventory/alerts` - Get low stock alerts
- GET `/api/inventory/reports/valuation` - Valuation report
- GET `/api/inventory/reports/usage` - Usage report
- GET `/api/inventory/reports/shrinkage` - Shrinkage report

---

### 13. Printing & Audit Reconciliation

**Components:**

- PrintManager.jsx
- ReceiptPrinter.jsx
- TagPrinter.jsx
- AuditorInterface.jsx
- ReconciliationTool.jsx

**A. Printing System:**

**Receipt Printing:**

- Thermal printer support (80mm)
- Network printer configuration
- Print queue management
- Reprint functionality
- Print history

**Garment Tag Printing:**

- Tag contains:
  - Order number
  - Tag number (unique)
  - Garment name
  - Brand
  - Color
  - Customer name
  - Service type
  - Barcode/QR code
- Tag size: 2" × 3" (configurable)
- Batch printing for multi-garment orders

**B. Auditor Features:**

**Manual Stock Entry:**

- Physical count interface
- Item-by-item entry
- Branch selection
- Count date and time
- Auditor name
- Notes field

**Reconciliation Process:**

1. Auditor performs physical count
2. Enter counts into system
3. System compares with database stock
4. Generate variance report
5. Investigate discrepancies
6. Adjust stock if approved
7. Document findings

**Variance Report:**

- Item name
- System stock
- Physical count
- Variance (difference)
- Variance %
- Variance value (financial impact)
- Status (Under Investigation, Resolved, Adjusted)
- Notes

**Reconciliation Actions:**

- Accept physical count (adjust system)
- Reject (keep system count, investigate)
- Partial adjustment
- Require manager approval for large variances

**API Endpoints:**

- POST `/api/printing/receipt` - Print receipt
- POST `/api/printing/tag` - Print tag
- POST `/api/printing/batch-tags` - Batch print tags
- POST `/api/audit/manual-count` - Submit physical count
- POST `/api/audit/reconcile` - Run reconciliation
- GET `/api/audit/variance-report` - Get variance report
- POST `/api/audit/adjust-stock` - Approve stock adjustment

---

### 14. Customer Page Enhancements

**Components:**

- CustomerProfile.jsx
- CustomerHistory.jsx
- LoyaltyPointsDisplay.jsx
- CustomerTypeBadge.jsx

**Customer Profile Display:**

**Header Section:**

- Customer name
- Customer number
- Customer type badge (Regular/Corporate/VIP)
- Loyalty points balance (prominent display)
- Registration date

**Last Order Information:**

- Last order date (highlight if recent)
- Last order value
- Last order status
- Days since last order
- "Reorder" quick action button

**Order History:**

- Paginated list of orders
- Filter by status, date range
- Quick view order details
- Repeat order functionality

**Loyalty Points:**

- Current balance (large display)
- Points earned history
- Points redeemed history
- Points expiry date (if applicable)
- Conversion rate (e.g., 1 point = KES 1)

**Customer Insights:**

- Total lifetime value
- Order frequency
- Average order value
- Favorite services
- Preferred branch
- Payment method preference

**Quick Actions:**

- Create new order
- View all orders
- Apply loyalty discount
- Send message/reminder
- Update customer type
- View account statement

**Customer Type Features:**

**Regular Customer:**

- Standard pricing
- Basic loyalty points (1% of order value)

**Corporate Customer:**

- Volume discounts
- Dedicated account manager
- Monthly invoicing
- Extended payment terms
- Enhanced loyalty (2% of order value)

**VIP Customer:**

- Priority service
- Exclusive discounts (5-10%)
- Free express upgrades
- Complimentary delivery
- Premium loyalty (3% of order value)
- Personal account manager

**API Endpoints:**

- GET `/api/customers/:id/profile` - Full customer profile
- GET `/api/customers/:id/orders` - Order history
- GET `/api/customers/:id/loyalty` - Loyalty points details
- PUT `/api/customers/:id/type` - Update customer type
- POST `/api/customers/:id/loyalty/redeem` - Redeem points

---

### 15. Finance Manager Page

**Components:**

- FinanceManagerDashboard.jsx
- CashOutPanel.jsx
- FinancialReports.jsx
- ApprovalQueue.jsx

**A. Cash Out Button:**

**Purpose:**
Handle financial adjustments and refunds requiring GM approval

**Use Cases:**

**1. Uncollected Garments:**

- Customer never collected items after 90+ days
- GM approved disposal
- Cash out to clear liability
- Form fields:
  - Order number
  - Uncollected since date
  - Total value
  - Reason for cash out
  - GM approval reference

**2. Discounts:**

- Goodwill discounts
- Service failure compensation
- Loyalty rewards
- Form fields:
  - Order number
  - Original amount
  - Discount amount
  - Discount reason
  - Approved by GM

**3. Compensation:**

- Damaged garments
- Lost items
- Service delays
- Customer complaints
- Form fields:
  - Order number
  - Issue description
  - Compensation amount
  - Evidence (photos if applicable)
  - GM approval

**4. Order Cancellation:**

- Customer cancellation before processing
- System errors
- Duplicate orders
- Form fields:
  - Order number
  - Cancellation reason
  - Refund amount
  - Refund method
  - GM approval

**Approval Workflow:**

1. Finance Manager creates cash out request
2. Request goes to GM approval queue
3. GM reviews details and evidence
4. GM approves/rejects with notes
5. If approved: Transaction processed
6. System updates financial records
7. Audit log created
8. Customer notification (if applicable)

**Financial Controls:**

- All cash outs require GM approval
- Maximum limits per transaction type
- Daily cash out limits
- Approval audit trail
- Monthly cash out reports

**B. Finance Dashboard:**

**Key Metrics:**

- Daily cash position
- Outstanding payments
- Pending approvals count
- Cash out summary (current month)
- Revenue vs targets

**Reports Access:**

- Daily revenue reports
- Cash flow statements
- Payment method analysis
- Outstanding balances
- Refunds and adjustments report

**API Endpoints:**

- POST `/api/finance/cash-out/request` - Create cash out request
- PUT `/api/finance/cash-out/:id/approve` - GM approval
- GET `/api/finance/cash-out/pending` - Pending approvals
- GET `/api/finance/dashboard` - Finance dashboard data
- GET `/api/finance/reports/:type` - Financial reports

---

### 16. Auditors Page

**Components:**

- AuditorsDashboard.jsx
- FinancialReportsViewer.jsx
- InventoryReconciliation.jsx
- AuditLogsExplorer.jsx
- VarianceTracker.jsx

**A. Access to Financial Reports:**

**Available Reports:**

- Profit & Loss Statement
- Cash Flow Report
- Revenue Analysis
- Expense Breakdown
- Payment Method Analysis
- Outstanding Payments Report
- Refunds and Adjustments
- Daily Cash Reconciliation

**Report Features:**

- Date range selection
- Branch filtering
- Export to Excel/PDF
- Drill-down capability
- Comparison views (period over period)
- Trend analysis

**B. Inventory Reconciliation:**

**Functions:**

- View inventory by branch
- Compare system vs physical counts
- Variance analysis
- Approve/reject stock adjustments
- Track reconciliation history
- Schedule regular audits

**Reconciliation Workflow:**

1. Select branch and date
2. Review physical count data
3. Compare with system records
4. Analyze variances
5. Investigate discrepancies
6. Approve adjustments
7. Generate reconciliation report
8. Archive for compliance

**C. Audit Logs:**

**Log Categories:**

- Financial transactions
- Order modifications
- User access logs
- System changes
- Approval workflows
- Inventory adjustments

**Search and Filter:**

- Date range
- User/staff member
- Action type
- Branch
- Severity level
- Keywords

**Log Details:**

- Timestamp
- User who performed action
- Action type
- Before/after values
- IP address
- Related records
- Notes

**D. Variance Tracking:**

**Variance Types:**

- Inventory variances
- Cash variances
- Revenue discrepancies
- Pricing errors
- System errors

**Tracking Features:**

- Variance identification
- Root cause analysis
- Corrective actions
- Responsibility assignment
- Resolution tracking
- Trend analysis

**Monthly Audit Tasks:**

- Review all financial transactions
- Verify inventory reconciliations
- Analyze unusual patterns
- Check approval compliance
- Review access logs
- Generate audit report for management

**API Endpoints:**

- GET `/api/auditor/financial-reports` - Access financial reports
- GET `/api/auditor/inventory/reconciliation` - Reconciliation data
- GET `/api/auditor/audit-logs` - Comprehensive audit logs
- GET `/api/auditor/variances` - Variance tracking
- POST `/api/auditor/inventory/approve-adjustment` - Approve adjustment
- GET `/api/auditor/monthly-summary` - Monthly audit summary

---

### 17. Logistics Manager Page

**Components:**

- LogisticsDashboard.jsx
- DeliveryTracker.jsx
- DeliveryClassificationPanel.jsx
- ComplaintManager.jsx
- RouteOptimizer.jsx

**A. Delivery Tracking:**

**Real-Time Tracking:**

- Live delivery status
- Driver location (if GPS enabled)
- Estimated arrival time
- Delivery history
- Failed delivery tracking

**Delivery Metrics:**

- Total deliveries (daily/weekly/monthly)
- On-time delivery rate
- Failed delivery rate
- Average delivery time
- Customer satisfaction scores

**Delivery Status Flow:**

```
Pending → Assigned → Picked Up → In Transit → Delivered
                                            → Failed → Rescheduled
```

**B. Delivery Classification Overview:**

**Classification Dashboard:**

- Small deliveries (Motorcycle) count
- Bulk deliveries (Van) count
- Classification accuracy
- Override rate
- Cost analysis per delivery type

**Visual Analytics:**

- Pie chart: Small vs Bulk distribution
- Line chart: Delivery trends over time
- Bar chart: Deliveries by branch
- Heat map: Peak delivery times

**Manual Classification Review:**

- View auto-classified deliveries
- Override incorrect classifications
- Set classification preferences
- Update classification rules

**C. Complaint Management:**

**Complaint Categories:**

- Late delivery
- Wrong address
- Damaged items during delivery
- Missing items
- Poor driver conduct
- Delivery fee disputes

**Complaint Workflow:**

1. Customer/staff logs complaint
2. Auto-assigned to Logistics Manager
3. Investigation
4. Resolution actions
5. Customer notification
6. Case closure
7. Follow-up

**Complaint Details:**

- Complaint ID
- Related order number
- Customer details
- Delivery details (driver, date, time)
- Complaint description
- Supporting evidence (photos)
- Status (Open, In Progress, Resolved, Closed)
- Resolution notes
- Customer satisfaction rating

**Resolution Actions:**

- Re-delivery
- Refund
- Compensation
- Driver counseling
- Process improvement

**D. Driver Management:**

**Driver Dashboard:**

- Active drivers
- Driver performance metrics
- Delivery assignments
- Driver availability
- Driver ratings

**Performance Metrics:**

- Deliveries completed
- On-time delivery rate
- Customer ratings
- Complaints received
- Revenue generated

**E. Route Optimization:**

**Features:**

- Group deliveries by area
- Optimize delivery routes
- Minimize travel time
- Reduce fuel costs
- Suggest efficient sequences

**API Endpoints:**

- GET `/api/logistics/deliveries` - All deliveries
- GET `/api/logistics/deliveries/pending` - Pending deliveries
- PUT `/api/logistics/deliveries/:id/status` - Update status
- GET `/api/logistics/classification/overview` - Classification stats
- POST `/api/logistics/complaints` - Log complaint
- GET `/api/logistics/complaints` - All complaints
- PUT `/api/logistics/complaints/:id/resolve` - Resolve complaint
- GET `/api/logistics/drivers` - Driver management
- POST `/api/logistics/route-optimize` - Optimize routes

---

### 18. Super Admin Controls

**Components:**

- SuperAdminDashboard.jsx
- StaffAccountCreator.jsx
- RolePermissionManager.jsx
- ApprovalWorkflowEditor.jsx
- SystemSettings.jsx

**A. Staff Account Creation:**

**Create User Form:**

- Full name
- Email address
- Phone number
- Username
- Temporary password
- Role selection
- Branch assignment
- Shift times (start/end)
- Reporting manager
- Employment start date

**Account Activation:**

- Send welcome email with credentials
- Force password change on first login
- Setup multi-factor authentication (optional)
- Assign initial permissions

**B. Role & Permission Management:**

**System Roles:**

1. **POS Attendant**
   - Create orders
   - Process payments
   - Print receipts
   - View customers
   - Limited reporting

2. **Inspector**
   - Quality check orders
   - Approve rewash requests
   - Tag garments
   - View order details
   - Quality reports

3. **General Manager**
   - Full branch access
   - Approve vouchers
   - Approve cash outs
   - Set targets
   - Staff appraisals
   - All reports
   - Override capabilities

4. **Director**
   - Multi-branch access
   - Strategic reports
   - Approve major expenses
   - Staff appointments
   - System-wide settings
   - Audit trail access

5. **Finance Manager**
   - Financial reports
   - Cash out requests
   - Payment reconciliation
   - Expense management
   - Invoice generation

6. **Auditor**
   - Read-only access to all data
   - Audit logs
   - Inventory reconciliation
   - Variance reports
   - Financial reports
   - No modification rights

7. **Logistics Manager**
   - Delivery management
   - Driver assignments
   - Route optimization
   - Complaint handling
   - Logistics reports

8. **Super Admin**
   - Full system access
   - User management
   - Role configuration
   - System settings
   - Backup & restore
   - Security settings

**Permission Structure:**

```javascript
{
  role: "General Manager",
  permissions: {
    orders: { create: true, read: true, update: true, delete: false },
    customers: { create: true, read: true, update: true, delete: false },
    reports: { view: "all", export: true },
    approvals: { vouchers: true, cashOut: true, disposal: true },
    staff: { view: true, appraise: true, manage: false },
    settings: { view: true, modify: false },
    inventory: { view: true, adjust: true },
    branches: { access: ["own_branch"], switch: false }
  }
}
```

**C. Approval Workflow:**

**Two-Tier Approval System:**

**GM Approval Required For:**

- Voucher creation (from call center)
- Cash out transactions
- Garment disposal (90+ days)
- Large discounts (>10%)
- Staff leave requests
- Inventory adjustments (>threshold)

**Director Approval Required For:**

- New staff appointments
- Staff role changes
- Salary adjustments
- Branch policy changes
- Major system changes
- Bulk data modifications

**Approval Flow:**

```
Request Created → GM Review → GM Approval/Rejection
                           ↓
                     (if required) → Director Review → Director Approval/Rejection
```

**D. System Settings:**

**Configurable Settings:**

1. **Security:**
   - Inactivity timeout duration
   - Password policy
   - Session timeout
   - Multi-factor authentication
   - IP whitelist

2. **Business:**
   - Express service multiplier
   - Loyalty points rate
   - Reminder intervals
   - Disposal threshold (days)
   - Delivery classification rules

3. **Financial:**
   - Tax rates
   - Payment methods
   - Currency settings
   - Cash out limits
   - Discount limits

4. **Operational:**
   - Branch operating hours
   - Holiday calendar
   - Shift schedules
   - Service types
   - Pricing tiers

5. **Notifications:**
   - SMS provider settings
   - Email templates
   - Notification triggers
   - Alert thresholds

6. **Integration:**
   - M-Pesa API credentials
   - SMS gateway credentials
   - Email service credentials
   - Printer configurations

**E. User Activity Monitoring:**

**Monitor:**

- Active users
- Login/logout times
- Failed login attempts
- Permission violations
- Unusual activity patterns
- Data export activities

**Security Actions:**

- Suspend user account
- Reset password
- Revoke access
- Send security alert
- Force re-authentication

**API Endpoints:**

- POST `/api/admin/users/create` - Create user account
- PUT `/api/admin/users/:id/role` - Update user role
- GET `/api/admin/roles` - Get all roles
- PUT `/api/admin/roles/:id/permissions` - Update permissions
- GET `/api/admin/approvals/pending` - Pending approvals
- POST `/api/admin/approvals/:id/approve` - Approve request
- GET `/api/admin/settings` - Get all settings
- PUT `/api/admin/settings` - Update settings
- GET `/api/admin/users/activity` - User activity logs

---

## Security Considerations

### Authentication

- JWT-based authentication
- Refresh token rotation
- Secure password hashing (bcrypt)
- Multi-factor authentication (optional)
- Session management

### Authorization

- Role-Based Access Control (RBAC)
- Granular permissions
- Resource-level access control
- Action-level permissions
- Branch-level data isolation

### Data Protection

- Encrypt sensitive data at rest
- HTTPS for data in transit
- SQL injection prevention (parameterized queries)
- XSS protection
- CSRF tokens

### Audit Trail

- Log all critical actions
- Immutable audit logs
- Timestamp with user ID
- IP address logging
- Change tracking (before/after)

### Compliance

- GDPR compliance (if applicable)
- Data retention policies
- Right to deletion
- Data export capability
- Privacy policy enforcement

---

## Performance Optimization

### Database

- Proper indexing on frequently queried fields
- Query optimization
- Connection pooling
- Database partitioning (for large datasets)
- Regular maintenance (VACUUM, ANALYZE)

### Caching

- Redis for session data
- Cache frequently accessed data
- Cache invalidation strategy
- API response caching

### Frontend

- Code splitting
- Lazy loading
- Image optimization
- Minification and compression
- CDN for static assets

### Backend

- API rate limiting
- Request throttling
- Background job processing
- Load balancing (for scale)
- Asynchronous processing for heavy tasks

---

## Testing Strategy

### Unit Tests

- Business logic functions
- Utility functions
- Service methods
- Minimum 80% code coverage

### Integration Tests

- API endpoints
- Database operations
- Third-party integrations
- Authentication flows

### End-to-End Tests

- Critical user flows
- Order creation and processing
- Payment processing
- Report generation

### Manual Testing

- User acceptance testing
- Cross-browser testing
- Mobile responsiveness
- Printer compatibility

---

## Deployment Strategy

### Development Environment

- Local development setup
- Docker containers
- Seed data for testing
- Mock external services

### Staging Environment

- Mirror of production
- Integration testing
- UAT (User Acceptance Testing)
- Performance testing

### Production Environment

- High availability setup
- Automated backups
- Monitoring and alerting
- Disaster recovery plan

### CI/CD Pipeline

- Automated testing on commit
- Code quality checks
- Automated deployment to staging
- Manual approval for production
- Rollback capability

---

## Monitoring & Maintenance

### Application Monitoring

- Error tracking (Sentry or similar)
- Performance monitoring (APM)
- User analytics
- API usage metrics

### System Monitoring

- Server health checks
- Database performance
- Disk space alerts
- Memory usage
- CPU utilization

### Backup Strategy

- Daily database backups
- Retention: 30 days
- Test restore procedure monthly
- Off-site backup storage
- Backup encryption

### Maintenance Tasks

- Database optimization (weekly)
- Log rotation and cleanup
- Security updates
- Dependency updates
- Performance tuning

---

## Development Priorities & Upgrade Roadmap

### Pre-Development Phase (Week 0)

1. **System Audit**
   - Document current tech stack
   - Map existing database schema
   - Identify existing APIs and endpoints
   - Review current user roles and permissions
   - Document current workflows

2. **Environment Setup**
   - Set up staging environment (mirror of production)
   - Configure development database with production data copy
   - Set up version control branching strategy
   - Prepare rollback procedures

### Phase 1: Foundation & Critical Enhancements (Weeks 1-3)

**Database Migrations:**

- Run schema extension scripts
- Add new tables (Roles, Audit_Logs, System_Settings)
- Test migrations on staging
- Create rollback scripts

**Core Updates:**

1. Order Creation Improvements
   - Add brand field to order form
   - Implement "No Brand" checkbox logic
   - Add checked_by field
   - Update validation rules
   - Extend existing order API

2. Receipt Enhancements
   - Update receipt template
   - Add QR code generation
   - Add "CLEANED AT OWNER'S RISK" notice
   - Implement T&C link
   - Integrate with existing print system

3. Express Service Pricing
   - Add service type selector to existing order form
   - Implement 1.5× auto-calculation
   - Update pricing display logic
   - Extend pricing API

**Deliverables:**

- Updated order creation flow
- Enhanced receipt system
- Express pricing implementation

### Phase 2: Business Automation (Weeks 4-6)

**New Features:**

1. Delivery Classification System
   - Build classification algorithm
   - Add manual override interface
   - Integrate with existing order system
   - Create delivery dashboard

2. Rewash System
   - Add rewash request form
   - Implement 24-hour eligibility check
   - Link to original orders
   - Add rewash tracking
   - Update order status workflow

3. Client Reminder System
   - Set up job scheduler (Bull Queue or similar)
   - Integrate with existing SMS service
   - Create reminder templates
   - Build reminder dashboard
   - Implement 90-day disposal workflow

**Deliverables:**

- Automated delivery classification
- Complete rewash workflow
- Automated reminder system

### Phase 3: Inventory & Vouchers (Weeks 7-9)

**New Modules:**

1. Inventory Management System
   - Create inventory tables
   - Build inventory dashboard
   - Implement stock in/out workflows
   - Add low stock alerts
   - Create branch-based inventory views
   - Build inventory reports

2. Voucher System
   - Create voucher tables
   - Build voucher creation form
   - Implement GM approval workflow
   - Add QR code generation
   - Build voucher validation API
   - Create voucher redemption interface

3. Delivery Notes
   - Create delivery note tables
   - Build tailor note generator
   - Build inter-store transfer form
   - Add status tracking
   - Integrate with existing order tracking

**Deliverables:**

- Functional inventory module
- Complete voucher system
- Delivery note system

### Phase 4: Role-Based Dashboards (Weeks 10-13)

**Dashboard Development:**

1. General Manager Dashboard
   - Target setting interface
   - Staff appraisal panel
   - Audit logs viewer
   - Performance charts
   - Approval queue

2. Finance Manager Page
   - Cash out request system
   - GM approval workflow
   - Financial reports access
   - Payment reconciliation tools

3. Auditors Page
   - Read-only financial reports
   - Inventory reconciliation interface
   - Variance tracking
   - Comprehensive audit logs

4. Logistics Manager Page
   - Delivery tracking dashboard
   - Delivery classification overview
   - Complaint management system
   - Driver management
   - Route optimization tools

**Deliverables:**

- 4 role-specific dashboards
- Approval workflow system
- Enhanced reporting suite

### Phase 5: Advanced Features & Admin (Weeks 14-16)

**Admin & Security:**

1. Super Admin Controls
   - Staff account creation interface
   - Role & permission management
   - Approval workflow configuration
   - System settings panel
   - User activity monitoring

2. Auto-Lock & Shift Control
   - Inactivity detection
   - Auto-logout system
   - Session management
   - Shift validation
   - Manager override capability

3. Enhanced Reporting
   - Daily/Weekly/Monthly revenue reports
   - Express vs Normal comparison
   - Rewash reports
   - Delivery type reports
   - Staff performance reports
   - Voucher usage reports
   - Export to PDF/Excel

4. Customer Page Enhancements
   - Customer type categorization
   - Loyalty points display
   - Last order tracking
   - Enhanced customer profile

**Deliverables:**

- Complete admin panel
- Session security features
- Comprehensive reporting suite
- Enhanced customer management

### Phase 6: Testing & Refinement (Weeks 17-18)

**Comprehensive Testing:**

1. **Integration Testing**
   - Test all new features with existing system
   - Verify backward compatibility
   - Test role-based access control
   - Validate data flow across modules

2. **User Acceptance Testing**
   - GM dashboard testing
   - Finance workflows testing
   - POS attendant workflows
   - Logistics workflows
   - Admin functions testing

3. **Performance Testing**
   - Load testing on new features
   - Database query optimization
   - API response time testing
   - Report generation performance

4. **Security Testing**
   - Permission validation
   - Session security testing
   - Audit log verification
   - Data access control testing

**Bug Fixes & Optimization:**

- Address all critical bugs
- Optimize database queries
- Improve UI/UX based on feedback
- Performance tuning

### Phase 7: Training & Deployment (Weeks 19-20)

**Training Materials:**

- Create user manuals for each role
- Record video tutorials
- Prepare FAQ documentation
- Create quick reference guides

**Staff Training:**

- POS Attendants training (2 days)
- Managers training (2 days)
- Admin training (1 day)
- Support staff training (1 day)

**Deployment Strategy:**

1. **Staging Deployment** (Week 19)
   - Deploy to staging environment
   - Final UAT with actual users
   - Performance validation
   - Fix any last-minute issues

2. **Production Deployment** (Week 20)
   - Database migration during off-peak hours
   - Deploy application updates
   - Monitor system closely
   - Provide on-site support

3. **Post-Deployment**
   - Monitor error logs
   - Gather user feedback
   - Quick bug fixes
   - Performance monitoring

**Rollback Plan:**

- Database snapshot before migration
- Application version backup
- Rollback scripts ready
- Communication plan if rollback needed

### Deployment Checklist

**Pre-Deployment:**

- [ ] All tests passing
- [ ] Code review completed
- [ ] Database migrations tested on staging
- [ ] Backup of production database
- [ ] Rollback scripts prepared
- [ ] Staff training completed
- [ ] Documentation finalized

**Deployment Day:**

- [ ] Notify all users of maintenance window
- [ ] Stop application (gracefully)
- [ ] Backup current database
- [ ] Run database migrations
- [ ] Deploy new application version
- [ ] Run smoke tests
- [ ] Verify all critical features
- [ ] Open system to users
- [ ] Monitor for 4 hours minimum

**Post-Deployment:**

- [ ] Verify all features working
- [ ] Check error logs
- [ ] Gather initial user feedback
- [ ] Address urgent issues
- [ ] Schedule follow-up review

---

## Backward Compatibility Guarantees

### Existing Features

- All current order creation flows remain functional
- Existing customer data accessible and unmodified
- Current payment processing unchanged
- Existing reports continue to work
- All current user accounts remain active

### API Compatibility

- Existing API endpoints unchanged
- New endpoints added with `/api/v2/` prefix (if needed)
- Response formats maintain backward compatibility
- Deprecated features clearly marked

### Data Integrity

- No existing data deleted or corrupted
- All historical orders remain accessible
- Customer records preserved with enhancements
- Audit trail for all data changes

### User Experience

- Familiar workflows preserved
- New features opt-in where possible
- Gradual feature adoption supported
- Training provided before forced adoption

---

## Success Metrics

### Business Metrics

- Order processing time (target: <5 minutes)
- Customer satisfaction score (target: >4.5/5)
- Rewash rate (target: <2%)
- On-time delivery rate (target: >95%)
- Staff efficiency (orders per hour)

### Technical Metrics

- System uptime (target: 99.9%)
- Page load time (target: <2 seconds)
- API response time (target: <500ms)
- Error rate (target: <0.1%)
- Database query performance

### Financial Metrics

- Operational cost reduction
- Revenue increase
- Inventory shrinkage reduction
- Cash flow improvement
- ROI on system investment

---

## Support & Documentation

### User Documentation

- User manuals (role-specific)
- Video tutorials
- FAQ section
- Troubleshooting guide
- Best practices guide

### Technical Documentation

- API documentation
- Database schema documentation
- Deployment guide
- System architecture documentation
- Code documentation (inline comments)

### Training

- Initial staff training (hands-on)
- Role-specific training modules
- Ongoing support sessions
- Train-the-trainer program
- Refresher courses

---

## Future Enhancements (Post-Launch)

### Mobile Application

- Native mobile app (iOS/Android)
- Customer order tracking
- Push notifications
- Mobile payments

### Advanced Analytics

- Predictive analytics
- Customer behavior insights
- Demand forecasting
- Revenue optimization

### AI Integration

- Intelligent order routing
- Price optimization
- Customer service chatbot
- Anomaly detection

### Third-Party Integrations

- Accounting software integration
- CRM integration
- Marketing automation
- Delivery partner APIs

---

## Project Summary

### Scope of Work

This is a **system upgrade project** that adds 18 major feature enhancements to the existing Lorenzo Dry Cleaners management system. The approach prioritizes:

- Zero disruption to existing operations
- Backward compatibility with all current features
- Gradual feature rollout with user training
- Data integrity and security throughout migration
- Quick rollback capability if issues arise

### Estimated Timeline

**Total Duration:** 18-20 weeks (4.5-5 months)

**Breakdown:**

- Pre-Development & System Audit: 1 week
- Phase 1 (Foundation): 3 weeks
- Phase 2 (Automation): 3 weeks
- Phase 3 (Inventory & Vouchers): 3 weeks
- Phase 4 (Dashboards): 4 weeks
- Phase 5 (Advanced Features): 3 weeks
- Phase 6 (Testing): 2 weeks
- Phase 7 (Training & Deployment): 2 weeks

**Critical Path Items:**

1. Database migration scripts
2. Role-based dashboard development
3. Inventory module integration
4. Reminder system automation
5. Staff training completion

### Budget Considerations

**Development Costs:**

- Database migration & schema design
- Frontend development (new components)
- Backend API extensions
- Integration work with existing system
- Testing & quality assurance

**Infrastructure Costs:**

- Staging environment setup
- Increased database storage
- Job scheduler (for reminders)
- Additional API calls (SMS for reminders)
- Backup storage increase

**Training & Support:**

- User training materials
- On-site training sessions
- Post-deployment support (4 weeks)
- Documentation development

**Risk Mitigation:**

- Buffer time for unexpected issues (10% of timeline)
- Rollback procedures and testing
- Data backup and recovery systems

---

## Risk Management

### Technical Risks

**Database Migration:**

- **Risk:** Data loss or corruption during migration
- **Mitigation:**
  - Multiple backups before migration
  - Test migrations on staging environment
  - Rollback scripts prepared and tested
  - Migration during low-traffic hours

**Integration Issues:**

- **Risk:** New features conflict with existing code
- **Mitigation:**
  - Comprehensive integration testing
  - Feature flags for gradual rollout
  - Code review process
  - Staging environment mirrors production

**Performance Degradation:**

- **Risk:** New features slow down the system
- **Mitigation:**
  - Performance testing before deployment
  - Database query optimization
  - Caching implementation
  - Load testing on staging

### Business Risks

**User Adoption:**

- **Risk:** Staff resistance to new features
- **Mitigation:**
  - Comprehensive training program
  - Gradual feature introduction
  - User feedback sessions
  - On-site support during launch

**Operational Disruption:**

- **Risk:** System downtime during deployment
- **Mitigation:**
  - Deployment during off-peak hours
  - Minimal-downtime migration strategy
  - Quick rollback capability
  - Communication plan for users

**Cost Overruns:**

- **Risk:** Project exceeds budget
- **Mitigation:**
  - Detailed project planning
  - Phase-based development
  - Regular progress reviews
  - Scope management

---

## Contact & Support

**Project Lead:** Ndururi (Freelance Developer)
**Specialization:** MQL5, Business Automation, Full-Stack Development
**Location:** Nairobi, Kenya

**Client:** Lorenzo Dry Cleaners Management Team
**Project Type:** System Upgrade (v1.0 → v2.0)
**Project Status:** Planning & Documentation Phase

**Support Structure:**

**During Development (Weeks 1-18):**

- Weekly progress meetings
- Daily updates via project management tool
- Dedicated communication channel
- Code reviews and demos

**During Deployment (Weeks 19-20):**

- On-site support available
- 24/7 emergency support
- Real-time monitoring
- Immediate bug fixes

**Post-Deployment (4 weeks):**

- Daily check-ins (week 1)
- Weekly check-ins (weeks 2-4)
- Bug fix SLA: 24 hours for critical, 72 hours for normal
- User support and troubleshooting

**Long-Term Support:**

- Monthly system health checks
- Quarterly feature enhancements
- Annual security updates
- On-call support (SLA to be defined)

**Communication Channels:**

- Email: [To be provided]
- Phone/WhatsApp: [To be provided]
- Project Management: [Tool to be decided]
- Code Repository: [GitHub/GitLab URL]

---

## Next Steps

### Immediate Actions (Week 0)

1. **System Audit**
   - [ ] Document current tech stack
   - [ ] Export database schema
   - [ ] List all existing API endpoints
   - [ ] Identify current user roles
   - [ ] Map current workflows

2. **Environment Setup**
   - [ ] Set up Git repository (if not exists)
   - [ ] Create staging environment
   - [ ] Clone production database to staging
   - [ ] Configure development environment
   - [ ] Set up project management tool

3. **Stakeholder Alignment**
   - [ ] Present this document to management
   - [ ] Get approval on timeline and scope
   - [ ] Assign project sponsor
   - [ ] Define success criteria
   - [ ] Set up communication plan

4. **Technical Preparation**
   - [ ] Fill in "Current System Architecture Documentation" section
   - [ ] Review and approve database migration strategy
   - [ ] Identify integration points
   - [ ] Plan feature flags strategy
   - [ ] Prepare rollback procedures

### Week 1 Kickoff

- Initial meeting with all stakeholders
- Finalize project timeline
- Assign responsibilities
- Set up development environment
- Begin Phase 1 development

---

## Success Metrics

### Technical Success Criteria

**System Performance:**

- Page load time: <2 seconds (existing benchmark maintained)
- API response time: <500ms
- Database query time: <100ms
- System uptime: 99.9%
- Zero data loss during migration

**Code Quality:**

- Test coverage: >80%
- Zero critical bugs in production
- All security vulnerabilities addressed
- Documentation completeness: 100%

### Business Success Criteria

**Operational Efficiency:**

- Order processing time reduced by 20%
- Inventory shrinkage reduced by 30%
- Rewash rate reduced to <2%
- On-time delivery rate >95%
- Customer complaint resolution improved by 40%

**User Adoption:**

- 100% staff trained within 2 weeks of deployment
- 80% feature adoption within 1 month
- User satisfaction score >4/5
- Support ticket volume <10 per week after month 1

**Financial Impact:**

- ROI achieved within 12 months
- Operational cost reduction: 15%
- Revenue increase: 10% (from improved customer satisfaction)
- Inventory management savings: KES 50,000/month

### Milestone Deliverables

**Phase 1 Completion:**

- ✓ Enhanced order creation flow
- ✓ Improved receipt system
- ✓ Express pricing implemented

**Phase 2 Completion:**

- ✓ Delivery classification working
- ✓ Rewash system functional
- ✓ Reminder automation active

**Phase 3 Completion:**

- ✓ Inventory module deployed
- ✓ Voucher system operational
- ✓ Delivery notes implemented

**Phase 4 Completion:**

- ✓ All role-based dashboards live
- ✓ Approval workflows functional
- ✓ Enhanced reporting available

**Phase 5 Completion:**

- ✓ Admin controls operational
- ✓ Security features active
- ✓ All reports generated successfully

**Final Deployment:**

- ✓ All features in production
- ✓ Staff trained
- ✓ Documentation complete
- ✓ System stable for 2 weeks

---

## Appendices

### A. Glossary of Terms

- **POS:** Point of Sale
- **GM:** General Manager
- **Rewash:** Re-cleaning of garments due to quality issues
- **Express Service:** Faster service at premium price
- **Voucher:** Discount code for customers
- **Shrinkage:** Inventory loss/damage

### B. Technical References

- PostgreSQL Documentation
- React Documentation
- Express.js Documentation
- JWT Authentication Guide
- SMS API Documentation

### C. Change Log

- Version 2.0: Complete system requirements documented
- [Future versions to be tracked here]

---

**Document Type:** System Upgrade Project Guide
**Version:** 2.0 (Upgrade Specification)
**Based On:** Laundry Management System Upgrade PRD v2.0
**Last Updated:** February 3, 2025
**Prepared By:** Claude AI Assistant for Ndururi
**Project Status:** Planning & Documentation Phase
**Approach:** Upgrade existing system with 18 major enhancements
**Deployment Strategy:** Phased rollout with backward compatibility

---

## Document Usage

**For Developers:**

- Use as complete technical reference
- Follow integration patterns for code consistency
- Reference database migration scripts
- Implement features per phase priority

**For Project Managers:**

- Track progress against phase deliverables
- Monitor milestone completion
- Manage stakeholder communication
- Ensure timeline adherence

**For Stakeholders:**

- Understand project scope and timeline
- Review feature specifications
- Track ROI and success metrics
- Plan for training and adoption

**For AI Assistants:**

- Complete context for code generation
- Reference for API endpoint creation
- Database schema for query generation
- Business logic for implementation

---

# End of Claude.md Upgrade Guide
