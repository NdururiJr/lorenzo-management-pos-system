# Lorenzo Dry Cleaners - End-to-End Testing Guide

**Version:** 1.0
**Last Updated:** November 23, 2025
**Purpose:** Comprehensive manual testing guide for all system features and user roles

---

## Table of Contents

### Part 1: Test Setup & Overview
- [Test Environment Setup](#test-environment-setup)
- [Test Data Reference](#test-data-reference)
- [User Credentials](#user-credentials)
- [Testing Prerequisites](#testing-prerequisites)

### Part 2: Role-Based Testing Checklists
1. [Admin Testing](#1-admin-testing)
2. [Director Testing](#2-director-testing)
3. [General Manager Testing](#3-general-manager-testing)
4. [Store Manager Testing](#4-store-manager-testing)
5. [Workstation Manager Testing](#5-workstation-manager-testing)
6. [Workstation Staff Testing](#6-workstation-staff-testing)
7. [Satellite Staff Testing](#7-satellite-staff-testing)
8. [Front Desk Testing](#8-front-desk-testing)
9. [Driver Testing](#9-driver-testing)
10. [Customer Testing](#10-customer-testing)

### Part 3: End-to-End Integration Tests
- [Complete Order Lifecycle](#complete-order-lifecycle)
- [Pickup & Delivery Flow](#pickup-delivery-flow)
- [Payment Processing](#payment-processing)
- [WhatsApp Notifications](#whatsapp-notifications)
- [Multi-Branch Operations](#multi-branch-operations)

### Part 4: Edge Cases & Error Scenarios
- [Authentication Edge Cases](#authentication-edge-cases)
- [Order Processing Edge Cases](#order-processing-edge-cases)
- [Payment Edge Cases](#payment-edge-cases)
- [Delivery Edge Cases](#delivery-edge-cases)
- [Integration Failures](#integration-failures)

---

## Part 1: Test Setup & Overview

### Test Environment Setup

#### Prerequisites
- [ ] Firebase project configured (staging environment)
- [ ] Test database seeded with sample data
- [ ] All environment variables configured
- [ ] Wati.io sandbox account active
- [ ] Pesapal sandbox credentials configured
- [ ] Google Maps API key with testing quota
- [ ] Test email accounts created
- [ ] Test WhatsApp numbers registered

#### Environment Variables Checklist
```bash
# Firebase (Staging)
NEXT_PUBLIC_FIREBASE_API_KEY=test_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=lorenzo-test.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=lorenzo-test
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=lorenzo-test.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=test_app_id

# Wati.io (Sandbox)
WATI_ACCESS_TOKEN=test_token_here
WATI_API_ENDPOINT=https://live-server.wati.io

# Pesapal (Sandbox)
PESAPAL_CONSUMER_KEY=test_consumer_key
PESAPAL_CONSUMER_SECRET=test_consumer_secret
PESAPAL_API_URL=https://cybqa.pesapal.com/pesapalv3

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=test_maps_key

# OpenAI
OPENAI_API_KEY=test_openai_key

# Resend
RESEND_API_KEY=test_resend_key
```

---

### Test Data Reference

#### Test Branches

```json
{
  "branches": [
    {
      "branchId": "BR-MAIN-001",
      "name": "Kilimani Main Store",
      "branchType": "main",
      "location": {
        "address": "Argwings Kodhek Road, Kilimani, Nairobi",
        "coordinates": {
          "lat": -1.2921,
          "lng": 36.7872
        }
      },
      "contactPhone": "+254725462859",
      "active": true,
      "driverAvailability": 3
    },
    {
      "branchId": "BR-SAT-001",
      "name": "Westlands Satellite",
      "branchType": "satellite",
      "mainStoreId": "BR-MAIN-001",
      "location": {
        "address": "Westlands Road, Westlands, Nairobi",
        "coordinates": {
          "lat": -1.2673,
          "lng": 36.8097
        }
      },
      "contactPhone": "+254712345678",
      "active": true
    },
    {
      "branchId": "BR-SAT-002",
      "name": "Karen Satellite",
      "branchType": "satellite",
      "mainStoreId": "BR-MAIN-001",
      "location": {
        "address": "Karen Road, Karen, Nairobi",
        "coordinates": {
          "lat": -1.3197,
          "lng": 36.7081
        }
      },
      "contactPhone": "+254723456789",
      "active": true
    }
  ]
}
```

#### Test Users & Credentials

```json
{
  "testUsers": [
    {
      "uid": "admin-001",
      "email": "admin@lorenzo.test",
      "password": "Test@1234",
      "phone": "+254725462859",
      "role": "admin",
      "name": "John Admin",
      "branchId": "BR-MAIN-001",
      "active": true
    },
    {
      "uid": "director-001",
      "email": "director@lorenzo.test",
      "password": "Test@1234",
      "phone": "+254725462860",
      "role": "director",
      "name": "Sarah Director",
      "branchId": "BR-MAIN-001",
      "active": true
    },
    {
      "uid": "gm-001",
      "email": "gm@lorenzo.test",
      "password": "Test@1234",
      "phone": "+254725462861",
      "role": "general_manager",
      "name": "Michael Manager",
      "branchId": "BR-MAIN-001",
      "active": true
    },
    {
      "uid": "sm-main-001",
      "email": "sm.main@lorenzo.test",
      "password": "Test@1234",
      "phone": "+254725462862",
      "role": "store_manager",
      "name": "Alice Store Manager",
      "branchId": "BR-MAIN-001",
      "active": true
    },
    {
      "uid": "wm-001",
      "email": "wm@lorenzo.test",
      "password": "Test@1234",
      "phone": "+254725462863",
      "role": "workstation_manager",
      "name": "Bob Workstation Manager",
      "branchId": "BR-MAIN-001",
      "active": true
    },
    {
      "uid": "ws-001",
      "email": "ws1@lorenzo.test",
      "password": "Test@1234",
      "phone": "+254725462864",
      "role": "workstation_staff",
      "name": "Carol Washing Staff",
      "branchId": "BR-MAIN-001",
      "active": true
    },
    {
      "uid": "ws-002",
      "email": "ws2@lorenzo.test",
      "password": "Test@1234",
      "phone": "+254725462865",
      "role": "workstation_staff",
      "name": "David Ironing Staff",
      "branchId": "BR-MAIN-001",
      "active": true
    },
    {
      "uid": "sat-001",
      "email": "sat@lorenzo.test",
      "password": "Test@1234",
      "phone": "+254725462866",
      "role": "satellite_staff",
      "name": "Emma Satellite Staff",
      "branchId": "BR-SAT-001",
      "active": true
    },
    {
      "uid": "fd-001",
      "email": "frontdesk@lorenzo.test",
      "password": "Test@1234",
      "phone": "+254725462867",
      "role": "front_desk",
      "name": "Frank Front Desk",
      "branchId": "BR-MAIN-001",
      "active": true
    },
    {
      "uid": "driver-001",
      "email": "driver1@lorenzo.test",
      "password": "Test@1234",
      "phone": "+254725462868",
      "role": "driver",
      "name": "George Driver",
      "branchId": "BR-MAIN-001",
      "active": true
    },
    {
      "uid": "driver-002",
      "email": "driver2@lorenzo.test",
      "password": "Test@1234",
      "phone": "+254725462869",
      "role": "driver",
      "name": "Henry Driver",
      "branchId": "BR-MAIN-001",
      "active": true
    },
    {
      "uid": "customer-001",
      "email": "customer1@test.com",
      "password": "Test@1234",
      "phone": "+254712345001",
      "role": "customer",
      "name": "Jane Customer",
      "active": true
    },
    {
      "uid": "customer-002",
      "email": "customer2@test.com",
      "password": "Test@1234",
      "phone": "+254712345002",
      "role": "customer",
      "name": "Mark Customer",
      "active": true
    }
  ]
}
```

#### Test Customers

```json
{
  "testCustomers": [
    {
      "customerId": "CUST-001",
      "name": "Jane Customer",
      "phone": "+254712345001",
      "email": "customer1@test.com",
      "addresses": [
        {
          "label": "Home",
          "address": "Lavington Green, Nairobi",
          "coordinates": {
            "lat": -1.2804,
            "lng": 36.7664
          }
        },
        {
          "label": "Office",
          "address": "Westlands Office Park, Nairobi",
          "coordinates": {
            "lat": -1.2656,
            "lng": 36.8088
          }
        }
      ],
      "preferences": {
        "notifications": true,
        "language": "en"
      },
      "orderCount": 5,
      "totalSpent": 12500
    },
    {
      "customerId": "CUST-002",
      "name": "Mark Customer",
      "phone": "+254712345002",
      "email": "customer2@test.com",
      "addresses": [
        {
          "label": "Home",
          "address": "Karen Hardy Estate, Nairobi",
          "coordinates": {
            "lat": -1.3186,
            "lng": 36.7014
          }
        }
      ],
      "preferences": {
        "notifications": true,
        "language": "en"
      },
      "orderCount": 2,
      "totalSpent": 5000
    },
    {
      "customerId": "CUST-003",
      "name": "Sarah Walk-in",
      "phone": "+254712345003",
      "email": null,
      "addresses": [],
      "preferences": {
        "notifications": false,
        "language": "en"
      },
      "orderCount": 1,
      "totalSpent": 2000
    }
  ]
}
```

#### Test Order Data

```json
{
  "testOrders": [
    {
      "orderId": "ORD-BR-MAIN-001-20251123-0001",
      "customerId": "CUST-001",
      "branchId": "BR-MAIN-001",
      "status": "received",
      "collectionMethod": "drop_off",
      "returnMethod": "delivery",
      "garments": [
        {
          "garmentId": "ORD-BR-MAIN-001-20251123-0001-G01",
          "type": "Shirt",
          "color": "White",
          "brand": "Calvin Klein",
          "services": ["dry_clean", "iron"],
          "price": 500,
          "status": "received",
          "specialInstructions": "Extra starch on collar",
          "initialInspection": {
            "inspectedAt": "2025-11-23T10:00:00Z",
            "inspectedBy": "fd-001",
            "condition": "good",
            "notableDamages": []
          }
        },
        {
          "garmentId": "ORD-BR-MAIN-001-20251123-0001-G02",
          "type": "Suit Jacket",
          "color": "Navy Blue",
          "brand": "Hugo Boss",
          "services": ["dry_clean"],
          "price": 1000,
          "status": "received",
          "specialInstructions": null,
          "initialInspection": {
            "inspectedAt": "2025-11-23T10:00:00Z",
            "inspectedBy": "fd-001",
            "condition": "good",
            "notableDamages": [
              {
                "type": "stain",
                "location": "left_sleeve",
                "severity": "minor",
                "description": "Small coffee stain on cuff",
                "photoUrl": "https://storage.googleapis.com/lorenzo-test/damages/damage-001.jpg"
              }
            ]
          }
        },
        {
          "garmentId": "ORD-BR-MAIN-001-20251123-0001-G03",
          "type": "Suit Trousers",
          "color": "Navy Blue",
          "brand": "Hugo Boss",
          "services": ["dry_clean", "iron"],
          "price": 600,
          "status": "received",
          "specialInstructions": null,
          "initialInspection": {
            "inspectedAt": "2025-11-23T10:00:00Z",
            "inspectedBy": "fd-001",
            "condition": "good",
            "notableDamages": []
          }
        }
      ],
      "totalAmount": 2100,
      "paidAmount": 2100,
      "paymentStatus": "paid",
      "paymentMethod": "mpesa",
      "estimatedCompletion": "2025-11-25T17:00:00Z",
      "deliveryAddress": "Lavington Green, Nairobi",
      "deliveryCoordinates": {
        "lat": -1.2804,
        "lng": 36.7664
      },
      "specialInstructions": "Please deliver before 5 PM",
      "createdAt": "2025-11-23T10:00:00Z",
      "createdBy": "fd-001"
    },
    {
      "orderId": "ORD-BR-SAT-001-20251123-0001",
      "customerId": "CUST-002",
      "branchId": "BR-SAT-001",
      "status": "received",
      "collectionMethod": "pickup",
      "returnMethod": "customer_collects",
      "pickupAddress": "Westlands Office Park, Nairobi",
      "pickupCoordinates": {
        "lat": -1.2656,
        "lng": 36.8088
      },
      "pickupScheduled": "2025-11-23T14:00:00Z",
      "garments": [
        {
          "garmentId": "ORD-BR-SAT-001-20251123-0001-G01",
          "type": "Dress",
          "color": "Red",
          "brand": "Zara",
          "services": ["dry_clean"],
          "price": 800,
          "status": "received",
          "specialInstructions": "Handle with care - delicate fabric",
          "initialInspection": {
            "inspectedAt": "2025-11-23T11:00:00Z",
            "inspectedBy": "sat-001",
            "condition": "good",
            "notableDamages": []
          }
        }
      ],
      "totalAmount": 800,
      "paidAmount": 0,
      "paymentStatus": "pending",
      "estimatedCompletion": "2025-11-24T17:00:00Z",
      "createdAt": "2025-11-23T11:00:00Z",
      "createdBy": "sat-001"
    }
  ]
}
```

#### Test Inventory Items

```json
{
  "testInventory": [
    {
      "itemId": "INV-001",
      "branchId": "BR-MAIN-001",
      "name": "Laundry Detergent",
      "category": "chemicals",
      "unit": "liters",
      "quantity": 50,
      "reorderLevel": 20,
      "costPerUnit": 150,
      "supplier": "Clean Supplies Ltd",
      "lastRestocked": "2025-11-20T10:00:00Z"
    },
    {
      "itemId": "INV-002",
      "branchId": "BR-MAIN-001",
      "name": "Dry Cleaning Solvent",
      "category": "chemicals",
      "unit": "liters",
      "quantity": 15,
      "reorderLevel": 25,
      "costPerUnit": 500,
      "supplier": "Chemicals Kenya",
      "lastRestocked": "2025-11-18T10:00:00Z",
      "status": "low_stock"
    },
    {
      "itemId": "INV-003",
      "branchId": "BR-MAIN-001",
      "name": "Hangers",
      "category": "supplies",
      "unit": "pieces",
      "quantity": 200,
      "reorderLevel": 100,
      "costPerUnit": 10,
      "supplier": "Office Mart",
      "lastRestocked": "2025-11-15T10:00:00Z"
    }
  ]
}
```

---

### Testing Prerequisites

#### Browser Requirements
- [ ] Chrome/Edge (latest version)
- [ ] Firefox (latest version)
- [ ] Safari (for Mac/iOS testing)
- [ ] Mobile browsers (Chrome Mobile, Safari Mobile)

#### Device Testing
- [ ] Desktop (1920x1080 resolution)
- [ ] Tablet (iPad - 1024x768)
- [ ] Mobile (375x667 - iPhone SE size)
- [ ] Mobile (390x844 - iPhone 14 size)

#### Network Conditions
- [ ] Test on good connection (WiFi)
- [ ] Test on poor connection (3G simulation)
- [ ] Test offline behavior
- [ ] Test during API timeouts

#### Data Reset Procedure
Before each major test cycle:
1. Clear browser cache and cookies
2. Reset test database to baseline state
3. Verify all test users exist and are active
4. Verify test orders are in correct initial states
5. Clear notification logs
6. Reset inventory to baseline values

---

## Part 2: Role-Based Testing Checklists

---

## 1. Admin Testing

**Role:** Admin
**Email:** admin@lorenzo.test
**Password:** Test@1234
**Access Level:** Full system access

### 1.1 Authentication & Authorization

#### Login Flow
- [ ] Navigate to `/auth/login`
- [ ] Enter email: `admin@lorenzo.test`
- [ ] Enter password: `Test@1234`
- [ ] Click "Sign In"
- [ ] **Expected:** Redirect to `/dashboard`
- [ ] **Expected:** See admin navigation menu
- [ ] **Expected:** See "Admin" role badge in header

#### Authorization Verification
- [ ] Verify access to `/dashboard` ✓
- [ ] Verify access to `/users` ✓
- [ ] Verify access to `/branches` ✓
- [ ] Verify access to `/analytics` ✓
- [ ] Verify access to `/settings` ✓
- [ ] Verify access to `/reports` ✓
- [ ] Verify access to `/audit-logs` ✓
- [ ] Verify access to `/pricing` ✓

#### Negative Tests
- [ ] Try accessing with incorrect password
- [ ] **Expected:** Error message "Invalid credentials"
- [ ] Try accessing locked account
- [ ] **Expected:** Error message "Account locked"

### 1.2 User Management

#### Create New User
- [ ] Navigate to `/users`
- [ ] Click "Add User" button
- [ ] Fill in form:
  ```json
  {
    "name": "Test Store Manager",
    "email": "testsm@lorenzo.test",
    "phone": "+254712345999",
    "role": "store_manager",
    "branchId": "BR-MAIN-001"
  }
  ```
- [ ] Click "Create User"
- [ ] **Expected:** Success message "User created successfully"
- [ ] **Expected:** User appears in list
- [ ] **Expected:** Firebase Auth account created
- [ ] **Expected:** User document created in Firestore

#### Edit User
- [ ] Find user "Test Store Manager" in list
- [ ] Click "Edit" button
- [ ] Change name to "Updated Store Manager"
- [ ] Click "Save Changes"
- [ ] **Expected:** Success message
- [ ] **Expected:** Name updated in list
- [ ] Refresh page
- [ ] **Expected:** Changes persist

#### Deactivate User
- [ ] Find user "Updated Store Manager"
- [ ] Click "Deactivate" button
- [ ] Confirm deactivation in modal
- [ ] **Expected:** User marked as "Inactive"
- [ ] **Expected:** User cannot log in
- [ ] Try logging in as deactivated user
- [ ] **Expected:** Error "Account deactivated"

#### Reactivate User
- [ ] Find deactivated user
- [ ] Click "Activate" button
- [ ] **Expected:** User marked as "Active"
- [ ] Try logging in as user
- [ ] **Expected:** Login successful

#### Filter Users
- [ ] Use role filter: Select "store_manager"
- [ ] **Expected:** Only store managers shown
- [ ] Use branch filter: Select "BR-MAIN-001"
- [ ] **Expected:** Only users from main branch shown
- [ ] Use status filter: Select "Inactive"
- [ ] **Expected:** Only inactive users shown
- [ ] Clear all filters
- [ ] **Expected:** All users shown

#### Search Users
- [ ] Enter search term: "George"
- [ ] **Expected:** "George Driver" appears
- [ ] Clear search
- [ ] Search by phone: "+254725462868"
- [ ] **Expected:** "George Driver" appears
- [ ] Search by email: "driver1@lorenzo.test"
- [ ] **Expected:** "George Driver" appears

### 1.3 Branch Management

#### Create New Branch
- [ ] Navigate to `/branches`
- [ ] Click "Add Branch" button
- [ ] Fill in form:
  ```json
  {
    "name": "Upperhill Satellite",
    "branchType": "satellite",
    "mainStoreId": "BR-MAIN-001",
    "address": "Upperhill Medical Centre, Nairobi",
    "contactPhone": "+254734567890"
  }
  ```
- [ ] Click pin location on map
- [ ] **Expected:** Coordinates auto-populated
- [ ] Click "Create Branch"
- [ ] **Expected:** Success message
- [ ] **Expected:** Branch appears in list
- [ ] **Expected:** Branch document created in Firestore

#### Edit Branch
- [ ] Find "Upperhill Satellite" branch
- [ ] Click "Edit" button
- [ ] Change contact phone to "+254734567891"
- [ ] Update address
- [ ] Click "Save Changes"
- [ ] **Expected:** Success message
- [ ] **Expected:** Changes reflected in list

#### Deactivate Branch
- [ ] Find "Upperhill Satellite" branch
- [ ] Click "Deactivate" button
- [ ] **Expected:** Warning modal appears
- [ ] **Expected:** Warning shows active orders count (if any)
- [ ] Confirm deactivation
- [ ] **Expected:** Branch marked as "Inactive"
- [ ] **Expected:** Branch hidden from active selections

#### View Branch Details
- [ ] Click on "Kilimani Main Store"
- [ ] **Expected:** Branch detail page opens
- [ ] **Expected:** See branch statistics:
  - Total orders processed
  - Active orders
  - Staff count
  - Revenue (today/this week/this month)
- [ ] **Expected:** See list of staff assigned to branch
- [ ] **Expected:** See recent orders from branch

### 1.4 Pricing Management

#### View Service Pricing
- [ ] Navigate to `/pricing`
- [ ] **Expected:** See all services with prices
- [ ] **Expected:** Services grouped by category:
  - Dry Cleaning
  - Washing & Ironing
  - Specialized Services
  - Alteration Services

#### Update Service Price
- [ ] Find "Shirt - Dry Clean"
- [ ] Current price: KES 500
- [ ] Click "Edit Price"
- [ ] Change to: KES 550
- [ ] Click "Save"
- [ ] **Expected:** Success message
- [ ] **Expected:** Price updated in list
- [ ] Create a test order at POS
- [ ] Add "Shirt - Dry Clean" service
- [ ] **Expected:** New price (550) applied

#### Add New Service
- [ ] Click "Add Service" button
- [ ] Fill in form:
  ```json
  {
    "name": "Curtains - Per Panel",
    "category": "specialized",
    "basePrice": 1500,
    "description": "Dry cleaning for curtains, price per panel"
  }
  ```
- [ ] Click "Create Service"
- [ ] **Expected:** Service appears in Specialized category
- [ ] Navigate to POS
- [ ] **Expected:** New service available in dropdown

#### Bulk Price Update
- [ ] Select multiple services (use checkboxes)
- [ ] Click "Bulk Update"
- [ ] Select "Increase by percentage"
- [ ] Enter: 10%
- [ ] Click "Apply"
- [ ] **Expected:** Confirmation modal with preview
- [ ] Confirm update
- [ ] **Expected:** All selected prices increased by 10%

### 1.5 Analytics & Reports

#### Dashboard Overview
- [ ] Navigate to `/analytics`
- [ ] **Expected:** See dashboard with KPIs:
  - Total Revenue (Today/Week/Month/Year)
  - Orders Count (Today/Week/Month/Year)
  - Active Orders
  - Pending Payments
  - Average Order Value
  - Customer Count
- [ ] **Expected:** See charts:
  - Revenue trend (line chart)
  - Orders by status (pie chart)
  - Orders by branch (bar chart)
  - Top services (bar chart)

#### Filter Analytics
- [ ] Use date range picker: Last 7 days
- [ ] **Expected:** All metrics update to show last 7 days
- [ ] Select branch filter: "BR-MAIN-001"
- [ ] **Expected:** Metrics filtered to main branch only
- [ ] Clear filters
- [ ] **Expected:** All data shown

#### Generate Report
- [ ] Click "Generate Report"
- [ ] Select report type: "Financial Summary"
- [ ] Select date range: "Last Month"
- [ ] Select branches: "All"
- [ ] Click "Generate"
- [ ] **Expected:** Report generated (PDF download)
- [ ] Open PDF
- [ ] **Expected:** See:
  - Revenue breakdown by branch
  - Payment method breakdown
  - Service revenue breakdown
  - Daily revenue chart
  - Summary statistics

#### Export Data
- [ ] Click "Export Data"
- [ ] Select format: "CSV"
- [ ] Select data: "All Orders"
- [ ] Select date range: "This Month"
- [ ] Click "Export"
- [ ] **Expected:** CSV file downloads
- [ ] Open CSV
- [ ] **Expected:** All order data with columns:
  - Order ID, Customer, Branch, Status, Total, Payment Status, Created Date

### 1.6 System Settings

#### General Settings
- [ ] Navigate to `/settings`
- [ ] Navigate to "General" tab
- [ ] Update business hours:
  ```json
  {
    "monday": { "open": "08:00", "close": "18:00" },
    "tuesday": { "open": "08:00", "close": "18:00" },
    "wednesday": { "open": "08:00", "close": "18:00" },
    "thursday": { "open": "08:00", "close": "18:00" },
    "friday": { "open": "08:00", "close": "18:00" },
    "saturday": { "open": "09:00", "close": "17:00" },
    "sunday": { "closed": true }
  }
  ```
- [ ] Click "Save Changes"
- [ ] **Expected:** Success message
- [ ] **Expected:** Hours updated system-wide

#### Notification Settings
- [ ] Navigate to "Notifications" tab
- [ ] Toggle WhatsApp notifications: ON
- [ ] Toggle Email notifications: ON
- [ ] Toggle SMS fallback: ON
- [ ] Set notification templates:
  - Order Confirmation: "order_confirmation"
  - Order Ready: "order_ready"
  - Driver Dispatched: "driver_dispatched"
- [ ] Click "Save Changes"
- [ ] **Expected:** Settings saved
- [ ] Create a test order
- [ ] **Expected:** WhatsApp notification sent

#### Integration Settings
- [ ] Navigate to "Integrations" tab
- [ ] Verify Wati.io status: Connected
- [ ] Verify Pesapal status: Connected
- [ ] Verify Google Maps status: Connected
- [ ] Click "Test Connection" for Wati.io
- [ ] **Expected:** Success message "Connection successful"
- [ ] View API usage:
  - WhatsApp messages sent (today/month)
  - Pesapal transactions (today/month)
  - Google Maps API calls (today/month)

#### Payment Settings
- [ ] Navigate to "Payments" tab
- [ ] View accepted payment methods:
  - Cash ✓
  - M-Pesa ✓
  - Card (Pesapal) ✓
  - Credit Account ✓
- [ ] Set M-Pesa Paybill: 123456
- [ ] Set M-Pesa Account: Lorenzo DC
- [ ] Click "Save Changes"
- [ ] **Expected:** Settings saved

### 1.7 Audit Logs

#### View Audit Logs
- [ ] Navigate to `/audit-logs`
- [ ] **Expected:** See list of all system activities:
  - User logins
  - Order creations/updates
  - Payment transactions
  - User management actions
  - Settings changes
- [ ] **Expected:** Each log entry shows:
  - Timestamp
  - User who performed action
  - Action type
  - Resource affected
  - Details

#### Filter Audit Logs
- [ ] Filter by action type: "order_created"
- [ ] **Expected:** Only order creation logs shown
- [ ] Filter by user: "fd-001"
- [ ] **Expected:** Only actions by front desk shown
- [ ] Filter by date range: Today
- [ ] **Expected:** Only today's logs shown

#### Search Audit Logs
- [ ] Search for order ID: "ORD-BR-MAIN-001-20251123-0001"
- [ ] **Expected:** All logs related to that order
- [ ] Search for user: "George Driver"
- [ ] **Expected:** All actions by that user

#### Export Audit Logs
- [ ] Click "Export Logs"
- [ ] Select date range: Last 7 days
- [ ] Select format: CSV
- [ ] Click "Export"
- [ ] **Expected:** CSV download with all log entries

### 1.8 System Monitoring

#### Performance Metrics
- [ ] Navigate to `/system/monitoring`
- [ ] **Expected:** See metrics:
  - API response times (P50, P95, P99)
  - Database query times
  - Active users count
  - Error rate (last hour/day)
  - Uptime percentage

#### Error Logs
- [ ] Navigate to "Errors" tab
- [ ] **Expected:** See recent errors:
  - Timestamp
  - Error type
  - Error message
  - Stack trace
  - User affected
  - Resolution status
- [ ] Click on an error
- [ ] **Expected:** Full error details modal

#### Integration Health
- [ ] Navigate to "Integrations" tab
- [ ] **Expected:** See health status for:
  - Wati.io API: Healthy/Degraded/Down
  - Pesapal API: Healthy/Degraded/Down
  - Google Maps API: Healthy/Degraded/Down
  - Firebase: Healthy/Degraded/Down
- [ ] **Expected:** See last successful call timestamp
- [ ] **Expected:** See error rate per integration

---

## 2. Director Testing

**Role:** Director
**Email:** director@lorenzo.test
**Password:** Test@1234
**Access Level:** High-level oversight and strategic analytics

### 2.1 Authentication & Authorization

#### Login Flow
- [ ] Navigate to `/auth/login`
- [ ] Enter email: `director@lorenzo.test`
- [ ] Enter password: `Test@1234`
- [ ] Click "Sign In"
- [ ] **Expected:** Redirect to `/dashboard`
- [ ] **Expected:** See director navigation menu
- [ ] **Expected:** See "Director" role badge

#### Authorization Verification
- [ ] Verify access to `/dashboard` ✓
- [ ] Verify access to `/analytics` ✓
- [ ] Verify access to `/reports` ✓
- [ ] Verify access to `/branches` (read-only) ✓
- [ ] Verify NO access to `/users/create` ✗
- [ ] Verify NO access to `/settings` ✗
- [ ] Verify NO access to `/pricing/edit` ✗

### 2.2 Executive Dashboard

#### High-Level KPIs
- [ ] Navigate to `/dashboard`
- [ ] **Expected:** See executive-level metrics:
  - Total Revenue (Today/Week/Month/Quarter/Year)
  - YoY Growth %
  - Total Orders (with comparisons)
  - Average Order Value (with trends)
  - Customer Acquisition (new customers)
  - Customer Retention Rate
  - Net Promoter Score (if available)

#### Branch Performance Comparison
- [ ] Scroll to "Branch Performance" section
- [ ] **Expected:** See table with columns:
  - Branch Name
  - Orders (Today/Week/Month)
  - Revenue (Today/Week/Month)
  - Avg Order Value
  - Staff Count
  - Efficiency Score
- [ ] **Expected:** Ability to sort by any column
- [ ] Click on branch name
- [ ] **Expected:** Drill down to branch-specific dashboard

#### Financial Overview
- [ ] Navigate to "Financial Overview" tab
- [ ] **Expected:** See charts:
  - Revenue trend (last 12 months)
  - Profit margin trend
  - Payment method distribution
  - Outstanding payments
  - Revenue by service category
- [ ] **Expected:** See financial ratios:
  - Current month vs target
  - Operating margin
  - Revenue per employee
  - Average collection time

### 2.3 Strategic Reports

#### Business Performance Report
- [ ] Navigate to `/reports`
- [ ] Select "Business Performance"
- [ ] Select date range: "Last Quarter"
- [ ] Click "Generate"
- [ ] **Expected:** Comprehensive PDF report with:
  - Executive Summary
  - Revenue Analysis
  - Order Volume Trends
  - Customer Metrics
  - Branch Performance
  - Service Performance
  - Recommendations (AI-generated)

#### Customer Analytics Report
- [ ] Select "Customer Analytics"
- [ ] Select date range: "Last 6 Months"
- [ ] Click "Generate"
- [ ] **Expected:** Report includes:
  - Customer segmentation
  - Repeat customer rate
  - Customer lifetime value
  - Churn analysis
  - Acquisition channels
  - Customer satisfaction trends

#### Operational Efficiency Report
- [ ] Select "Operational Efficiency"
- [ ] Select branches: "All"
- [ ] Select date range: "Last Month"
- [ ] Click "Generate"
- [ ] **Expected:** Report includes:
  - Average order completion time
  - Bottleneck analysis
  - Staff productivity metrics
  - Capacity utilization
  - On-time delivery rate
  - Quality issue rate

### 2.4 Strategic Analytics

#### Trend Analysis
- [ ] Navigate to `/analytics/trends`
- [ ] **Expected:** See multi-timeframe comparisons:
  - Day over day
  - Week over week
  - Month over month
  - Year over year
- [ ] Select metric: "Revenue"
- [ ] Select timeframe: "Month over Month"
- [ ] **Expected:** Line chart showing monthly revenue
- [ ] **Expected:** Percentage change indicators

#### Forecasting
- [ ] Navigate to `/analytics/forecasting`
- [ ] **Expected:** See AI-generated forecasts:
  - Revenue forecast (next 3 months)
  - Order volume forecast
  - Staffing needs forecast
  - Inventory requirements forecast
- [ ] **Expected:** Confidence intervals shown
- [ ] Click "View Details" on revenue forecast
- [ ] **Expected:** See methodology and assumptions

#### Customer Insights
- [ ] Navigate to `/analytics/customers`
- [ ] **Expected:** See customer analytics:
  - Customer segments (New/Active/At-Risk/Churned)
  - RFM Analysis (Recency, Frequency, Monetary)
  - Customer cohort analysis
  - Lifetime value distribution
- [ ] Click on "At-Risk" segment
- [ ] **Expected:** See list of at-risk customers
- [ ] **Expected:** See recommended actions

### 2.5 Branch Oversight

#### Branch Dashboard (Read-Only)
- [ ] Navigate to `/branches`
- [ ] Click on "Kilimani Main Store"
- [ ] **Expected:** See comprehensive branch metrics:
  - Real-time order status
  - Staff on duty
  - Today's revenue
  - Current capacity utilization
  - Recent alerts/issues
- [ ] **Expected:** Cannot edit branch details (read-only)

#### Multi-Branch Comparison
- [ ] Navigate to `/branches/compare`
- [ ] Select branches: "BR-MAIN-001" and "BR-SAT-001"
- [ ] Select metrics: Revenue, Orders, Efficiency
- [ ] Select date range: "Last 30 Days"
- [ ] Click "Compare"
- [ ] **Expected:** Side-by-side comparison dashboard
- [ ] **Expected:** Highlights showing which branch performs better
- [ ] **Expected:** Variance analysis

### 2.6 Alerts & Notifications

#### Configure Alerts
- [ ] Navigate to `/alerts`
- [ ] **Expected:** See alert configuration options:
  - Revenue drop alert (threshold: -10%)
  - Order volume drop alert
  - Quality issue alert (threshold: >3 per day)
  - Payment overdue alert
  - Staff attendance alert
- [ ] Enable "Revenue drop alert"
- [ ] Set threshold: -15%
- [ ] Set notification method: Email + WhatsApp
- [ ] Click "Save"
- [ ] **Expected:** Alert configured successfully

#### View Active Alerts
- [ ] Navigate to `/alerts/active`
- [ ] **Expected:** See any active alerts
- [ ] **Expected:** Each alert shows:
  - Alert type
  - Severity (Low/Medium/High/Critical)
  - Triggered time
  - Affected resource (branch/order/etc)
  - Recommended action
- [ ] Click on an alert
- [ ] **Expected:** Detailed view with:
  - Full description
  - Historical context
  - Action buttons (Acknowledge/Resolve/Escalate)

### 2.7 Staff Performance Overview

#### Staff Analytics
- [ ] Navigate to `/analytics/staff`
- [ ] **Expected:** See staff performance metrics:
  - Orders processed per staff member
  - Average processing time
  - Quality score
  - Attendance rate
  - Productivity ranking
- [ ] **Expected:** Can filter by:
  - Branch
  - Role
  - Date range
- [ ] Sort by "Orders Processed"
- [ ] **Expected:** Staff ranked by order count

#### Department Performance
- [ ] Navigate to "Departments" tab
- [ ] **Expected:** See performance by department:
  - Front Desk: Order intake speed
  - Workstation: Processing efficiency
  - Drivers: Delivery success rate
  - Quality: Defect detection rate
- [ ] Click on "Workstation" department
- [ ] **Expected:** Drill down to workstation-specific metrics

---

## 3. General Manager Testing

**Role:** General Manager
**Email:** gm@lorenzo.test
**Password:** Test@1234
**Access Level:** Operational management across all branches

### 3.1 Authentication & Authorization

#### Login Flow
- [ ] Navigate to `/auth/login`
- [ ] Enter email: `gm@lorenzo.test`
- [ ] Enter password: `Test@1234`
- [ ] Click "Sign In"
- [ ] **Expected:** Redirect to `/dashboard`
- [ ] **Expected:** See general manager navigation
- [ ] **Expected:** See "General Manager" role badge

#### Authorization Verification
- [ ] Verify access to `/dashboard` ✓
- [ ] Verify access to `/orders` (all branches) ✓
- [ ] Verify access to `/pipeline` (all branches) ✓
- [ ] Verify access to `/inventory` (all branches) ✓
- [ ] Verify access to `/staff` (all branches) ✓
- [ ] Verify access to `/deliveries` (all branches) ✓
- [ ] Verify access to `/analytics` ✓
- [ ] Verify NO access to `/pricing/edit` ✗
- [ ] Verify NO access to `/users/create` ✗

### 3.2 Operations Dashboard

#### Real-Time Overview
- [ ] Navigate to `/dashboard`
- [ ] **Expected:** See operational dashboard:
  - Active orders count (all branches)
  - Orders by status (real-time)
  - Staff on duty (all branches)
  - Deliveries in progress
  - Today's revenue
  - Alerts count
- [ ] **Expected:** Auto-refresh every 30 seconds

#### Branch Status Overview
- [ ] Scroll to "Branch Status" section
- [ ] **Expected:** See card for each branch:
  - Branch name
  - Active orders
  - Staff on duty
  - Current status (Normal/Busy/Critical)
  - Recent alerts
- [ ] **Expected:** Color coding:
  - Green: Normal operations
  - Yellow: Busy
  - Red: Critical (overdue orders/understaffed)

#### Today's Orders Summary
- [ ] View "Today's Orders" widget
- [ ] **Expected:** See breakdown:
  - Total orders created today
  - Orders by status
  - On-time rate
  - Average completion time
- [ ] Click "View All"
- [ ] **Expected:** Navigate to orders list filtered by today

### 3.3 Multi-Branch Order Management

#### View All Orders
- [ ] Navigate to `/orders`
- [ ] **Expected:** See orders from all branches
- [ ] **Expected:** Default filter: Active orders only
- [ ] **Expected:** Table columns:
  - Order ID
  - Customer Name
  - Branch
  - Status
  - Garments Count
  - Total Amount
  - Payment Status
  - Est. Completion
  - Actions

#### Filter Orders
- [ ] Apply branch filter: "BR-MAIN-001"
- [ ] **Expected:** Only main branch orders shown
- [ ] Apply status filter: "washing"
- [ ] **Expected:** Only orders in washing stage shown
- [ ] Apply date range: "Last 7 days"
- [ ] **Expected:** Orders from last week shown
- [ ] Apply payment status: "pending"
- [ ] **Expected:** Only unpaid orders shown

#### Search Orders
- [ ] Search by order ID: "ORD-BR-MAIN-001-20251123-0001"
- [ ] **Expected:** Specific order shown
- [ ] Clear search
- [ ] Search by customer name: "Jane"
- [ ] **Expected:** All Jane's orders shown
- [ ] Search by phone: "+254712345001"
- [ ] **Expected:** Customer's orders shown

#### View Order Details
- [ ] Click on order "ORD-BR-MAIN-001-20251123-0001"
- [ ] **Expected:** Order detail modal/page opens
- [ ] **Expected:** See complete order information:
  - Customer details
  - Garments list with services
  - Payment information
  - Status history (timeline)
  - Assigned staff
  - Delivery details
  - Special instructions
- [ ] **Expected:** Can download receipt PDF
- [ ] Click "Download Receipt"
- [ ] **Expected:** PDF generated and downloaded

#### Update Order Status (if needed)
- [ ] Find an order in "received" status
- [ ] Click "Update Status"
- [ ] Select new status: "queued"
- [ ] Add note: "Manually queued by GM"
- [ ] Click "Update"
- [ ] **Expected:** Status updated
- [ ] **Expected:** Status history shows change
- [ ] **Expected:** Notification sent to customer (if applicable)

### 3.4 Pipeline Management (All Branches)

#### View Multi-Branch Pipeline
- [ ] Navigate to `/pipeline`
- [ ] **Expected:** See Kanban board with all branches
- [ ] **Expected:** Columns for each status:
  - Received, Queued, Washing, Drying, Ironing, Quality Check, Packaging, Ready, Out for Delivery, Delivered
- [ ] **Expected:** Cards show:
  - Order ID
  - Customer name
  - Branch badge
  - Time in current stage
  - Urgency indicator
  - Garments count

#### Filter Pipeline View
- [ ] Select branch filter: "BR-MAIN-001"
- [ ] **Expected:** Only main branch orders in pipeline
- [ ] Select "Show Overdue Only"
- [ ] **Expected:** Only overdue orders shown (highlighted in red)
- [ ] Clear filters
- [ ] **Expected:** All orders shown again

#### Identify Bottlenecks
- [ ] Scroll to "Pipeline Analytics" section
- [ ] **Expected:** See bottleneck analysis:
  - Stages with most orders
  - Average time per stage
  - Slowest stages highlighted
  - Recommendations
- [ ] **Expected:** See chart: "Orders by Stage"
- [ ] Click on "Washing" stage in chart
- [ ] **Expected:** See orders stuck in washing

#### Monitor Overdue Orders
- [ ] Scroll to "Overdue Orders" widget
- [ ] **Expected:** See list of overdue orders:
  - Order ID
  - Customer
  - Branch
  - Current status
  - Hours overdue
  - Assigned staff
- [ ] Click on an overdue order
- [ ] **Expected:** Order details modal
- [ ] **Expected:** Can reassign or escalate

### 3.5 Inventory Management (All Branches)

#### View Inventory
- [ ] Navigate to `/inventory`
- [ ] **Expected:** See inventory items from all branches
- [ ] **Expected:** Table columns:
  - Item Name
  - Category
  - Branch
  - Quantity
  - Unit
  - Reorder Level
  - Status (OK/Low Stock/Out of Stock)
  - Last Restocked

#### Filter Inventory
- [ ] Filter by branch: "BR-MAIN-001"
- [ ] **Expected:** Only main branch items shown
- [ ] Filter by category: "chemicals"
- [ ] **Expected:** Only chemical items shown
- [ ] Filter by status: "Low Stock"
- [ ] **Expected:** Only low stock items shown
- [ ] **Expected:** Items highlighted in yellow/orange

#### View Low Stock Alerts
- [ ] Click "Low Stock Alerts" tab
- [ ] **Expected:** See items below reorder level
- [ ] **Expected:** Each alert shows:
  - Item name
  - Current quantity
  - Reorder level
  - Branch
  - Recommended order quantity
- [ ] Click "Generate Purchase Order"
- [ ] **Expected:** PO draft created with all low stock items

#### Inventory Adjustment
- [ ] Find item "Laundry Detergent" at BR-MAIN-001
- [ ] Click "Adjust Stock"
- [ ] Select adjustment type: "Restocked"
- [ ] Enter quantity: +20 liters
- [ ] Enter supplier: "Clean Supplies Ltd"
- [ ] Enter cost per unit: 150
- [ ] Add note: "Monthly restock"
- [ ] Click "Submit"
- [ ] **Expected:** Quantity updated
- [ ] **Expected:** Adjustment logged
- [ ] **Expected:** Last restocked date updated

#### View Inventory Usage
- [ ] Click "Usage Analytics" tab
- [ ] Select date range: "Last 30 days"
- [ ] **Expected:** See usage report:
  - Items used
  - Quantity consumed
  - Average daily usage
  - Projected days until restock needed
- [ ] **Expected:** See chart: "Top Used Items"

### 3.6 Staff Management (All Branches)

#### View All Staff
- [ ] Navigate to `/staff`
- [ ] **Expected:** See all staff from all branches
- [ ] **Expected:** Table columns:
  - Name
  - Role
  - Branch
  - Status (On Duty/Off Duty)
  - Current Assignment
  - Today's Orders Processed
  - Performance Score

#### Filter Staff
- [ ] Filter by branch: "BR-MAIN-001"
- [ ] **Expected:** Only main branch staff shown
- [ ] Filter by role: "workstation_staff"
- [ ] **Expected:** Only workstation staff shown
- [ ] Filter by status: "On Duty"
- [ ] **Expected:** Only currently working staff shown

#### View Staff Performance
- [ ] Click on "Carol Washing Staff"
- [ ] **Expected:** Staff detail view opens
- [ ] **Expected:** See metrics:
  - Orders processed (Today/Week/Month)
  - Average processing time
  - Quality score
  - Attendance rate (last 30 days)
  - Current assignment
- [ ] **Expected:** See chart: "Daily Orders Processed"
- [ ] **Expected:** See recent activity log

#### Staff Scheduling (if implemented)
- [ ] Navigate to "Schedule" tab
- [ ] **Expected:** See weekly schedule grid
- [ ] **Expected:** Staff names on rows, days on columns
- [ ] **Expected:** Shifts color-coded
- [ ] Click on a shift slot
- [ ] **Expected:** Can view/edit shift details

### 3.7 Delivery Oversight

#### View All Deliveries
- [ ] Navigate to `/deliveries`
- [ ] **Expected:** See deliveries from all branches
- [ ] **Expected:** Three tabs:
  - Pending
  - In Progress
  - Completed
- [ ] **Expected:** Table columns:
  - Delivery ID
  - Driver Name
  - Branch
  - Orders Count
  - Status
  - Start Time
  - Est. Completion

#### Monitor Active Deliveries
- [ ] Click "In Progress" tab
- [ ] **Expected:** See active deliveries
- [ ] Click on a delivery
- [ ] **Expected:** Delivery detail modal opens
- [ ] **Expected:** See map with:
  - Driver's current location (GPS marker)
  - Delivery stops (numbered markers)
  - Optimized route (line)
- [ ] **Expected:** See list of stops:
  - Stop number
  - Address
  - Order ID
  - Status (Pending/Completed/Failed)
- [ ] **Expected:** Real-time position updates

#### Review Completed Deliveries
- [ ] Click "Completed" tab
- [ ] Filter by date: "Today"
- [ ] **Expected:** See today's completed deliveries
- [ ] Click on a completed delivery
- [ ] **Expected:** See summary:
  - Total stops
  - Successful deliveries
  - Failed deliveries (if any)
  - Total distance
  - Total time
  - Driver signature/confirmation

### 3.8 Analytics & Reporting

#### Operations Report
- [ ] Navigate to `/reports`
- [ ] Select "Operations Report"
- [ ] Select branches: "All"
- [ ] Select date range: "This Week"
- [ ] Click "Generate"
- [ ] **Expected:** PDF report with:
  - Orders summary (by branch)
  - Pipeline efficiency
  - Delivery performance
  - Staff productivity
  - Inventory usage
  - Alerts/Issues summary

#### Branch Comparison
- [ ] Select "Branch Comparison Report"
- [ ] Select all branches
- [ ] Select date range: "Last Month"
- [ ] Click "Generate"
- [ ] **Expected:** Report comparing:
  - Order volume
  - Revenue
  - Efficiency metrics
  - Staff performance
  - Customer satisfaction

---

## 4. Store Manager Testing

**Role:** Store Manager
**Email:** sm.main@lorenzo.test
**Password:** Test@1234
**Access Level:** Full management of assigned branch

### 4.1 Authentication & Authorization

#### Login Flow
- [ ] Navigate to `/auth/login`
- [ ] Enter email: `sm.main@lorenzo.test`
- [ ] Enter password: `Test@1234`
- [ ] Click "Sign In"
- [ ] **Expected:** Redirect to `/dashboard`
- [ ] **Expected:** See store manager navigation
- [ ] **Expected:** See "Store Manager - Kilimani Main Store" badge

#### Authorization Verification
- [ ] Verify access to `/dashboard` (own branch) ✓
- [ ] Verify access to `/orders` (own branch) ✓
- [ ] Verify access to `/pipeline` (own branch) ✓
- [ ] Verify access to `/inventory` (own branch) ✓
- [ ] Verify access to `/staff` (own branch) ✓
- [ ] Verify access to `/deliveries` (own branch) ✓
- [ ] Verify access to `/reports` (own branch) ✓
- [ ] Verify NO access to other branches' data ✗
- [ ] Verify NO access to `/pricing/edit` ✗
- [ ] Verify NO access to `/users/create` ✗

### 4.2 Branch Dashboard

#### Daily Overview
- [ ] Navigate to `/dashboard`
- [ ] **Expected:** See branch-specific dashboard:
  - Today's orders count
  - Active orders by status
  - Today's revenue
  - Staff on duty
  - Pending payments
  - Low stock alerts
  - Recent quality issues
- [ ] **Expected:** Only see data for BR-MAIN-001

#### Quick Actions
- [ ] **Expected:** See quick action buttons:
  - Create New Order
  - View Pipeline
  - Check Inventory
  - Manage Staff
  - Generate Report
- [ ] Click each button
- [ ] **Expected:** Navigate to respective pages

### 4.3 Order Management (Branch-Level)

#### View Branch Orders
- [ ] Navigate to `/orders`
- [ ] **Expected:** See only BR-MAIN-001 orders
- [ ] **Expected:** Cannot see orders from other branches
- [ ] Try to access order from satellite branch directly (via URL)
- [ ] **Expected:** Access denied or redirect

#### Create Order (POS Workflow)
- [ ] Navigate to `/pos`
- [ ] Search customer: "+254712345001"
- [ ] **Expected:** Customer "Jane Customer" found
- [ ] Select customer
- [ ] Add garments:
  ```json
  [
    {
      "type": "Dress",
      "color": "Black",
      "brand": "H&M",
      "services": ["dry_clean"],
      "price": 800,
      "specialInstructions": "Delicate fabric"
    },
    {
      "type": "Blouse",
      "color": "White",
      "brand": "Zara",
      "services": ["wash", "iron"],
      "price": 400
    }
  ]
  ```
- [ ] **Expected:** Total: 1200 KES
- [ ] Select collection method: "drop_off"
- [ ] Select return method: "customer_collects"
- [ ] Set estimated completion: 2 days from now
- [ ] Click "Create Order"
- [ ] **Expected:** Order created successfully
- [ ] **Expected:** Order ID generated: ORD-BR-MAIN-001-[DATE]-[####]
- [ ] **Expected:** Receipt PDF modal appears
- [ ] Download receipt
- [ ] **Expected:** PDF with order details

#### Process Payment
- [ ] Find order just created
- [ ] Click "Process Payment"
- [ ] **Expected:** Payment modal opens
- [ ] **Expected:** Shows:
  - Total amount
  - Amount paid
  - Balance
  - Payment methods
- [ ] Select payment method: "cash"
- [ ] Enter amount: 1200
- [ ] Click "Process Payment"
- [ ] **Expected:** Payment successful
- [ ] **Expected:** Payment status updated to "paid"
- [ ] **Expected:** Receipt updated

#### Handle Partial Payment
- [ ] Create new order (total: 2000 KES)
- [ ] Process partial payment:
  - Method: M-Pesa
  - Amount: 1000
- [ ] **Expected:** Payment status: "partial"
- [ ] **Expected:** Balance shown: 1000 KES
- [ ] Process remaining balance:
  - Method: Cash
  - Amount: 1000
- [ ] **Expected:** Payment status: "paid"
- [ ] **Expected:** Balance: 0 KES

### 4.4 Pipeline Management (Branch)

#### View Branch Pipeline
- [ ] Navigate to `/pipeline`
- [ ] **Expected:** See Kanban board for BR-MAIN-001 only
- [ ] **Expected:** All status columns visible
- [ ] **Expected:** Order cards show:
  - Order ID
  - Customer name
  - Garments count
  - Time in stage
  - Urgency color

#### Monitor Processing
- [ ] Check each pipeline stage
- [ ] **Expected:** See order count per stage
- [ ] Identify bottlenecks
- [ ] **Expected:** Stages with 5+ orders highlighted
- [ ] **Expected:** Orders >24h in same stage marked "delayed"

#### Workstation Oversight
- [ ] Click "Workstation View" tab
- [ ] **Expected:** See each workstation:
  - Washing: Orders assigned, Staff, Capacity
  - Drying: Orders assigned, Staff, Capacity
  - Ironing: Orders assigned, Staff, Capacity
  - Quality Check: Orders assigned, Staff
  - Packaging: Orders assigned, Staff
- [ ] **Expected:** Can view but not directly modify assignments

### 4.5 Inventory Management (Branch)

#### View Branch Inventory
- [ ] Navigate to `/inventory`
- [ ] **Expected:** See only BR-MAIN-001 inventory
- [ ] **Expected:** Table shows:
  - Item name
  - Quantity
  - Unit
  - Reorder level
  - Status

#### Handle Low Stock Alert
- [ ] Find "Dry Cleaning Solvent" (low stock)
- [ ] **Expected:** Item highlighted in orange
- [ ] **Expected:** Alert badge
- [ ] Click "Restock"
- [ ] Fill in restock form:
  ```json
  {
    "quantity": 30,
    "supplier": "Chemicals Kenya",
    "costPerUnit": 500,
    "invoiceNumber": "INV-2025-001"
  }
  ```
- [ ] Click "Submit"
- [ ] **Expected:** Quantity updated
- [ ] **Expected:** Status changes from "low_stock" to "ok"
- [ ] **Expected:** Last restocked date updated

#### Request Inventory Transfer
- [ ] Click "Request Transfer"
- [ ] Select item: "Hangers"
- [ ] Select from branch: "BR-SAT-001"
- [ ] Enter quantity: 50
- [ ] Add reason: "Stock depleted faster than expected"
- [ ] Click "Submit Request"
- [ ] **Expected:** Transfer request created
- [ ] **Expected:** Notification sent to other branch manager
- [ ] **Expected:** Request appears in "Pending Transfers"

### 4.6 Staff Management (Branch)

#### View Branch Staff
- [ ] Navigate to `/staff`
- [ ] **Expected:** See only staff assigned to BR-MAIN-001
- [ ] **Expected:** Table shows:
  - Name
  - Role
  - Status (On Duty/Off Duty)
  - Current assignment
  - Today's performance

#### Clock In/Out Staff
- [ ] Find staff "Carol Washing Staff"
- [ ] Current status: Off Duty
- [ ] Click "Clock In"
- [ ] **Expected:** Status changes to "On Duty"
- [ ] **Expected:** Clock-in time recorded
- [ ] Later, click "Clock Out"
- [ ] **Expected:** Status changes to "Off Duty"
- [ ] **Expected:** Total hours calculated

#### Assign Staff to Workstation
- [ ] Find workstation staff not assigned
- [ ] Click "Assign"
- [ ] Select workstation: "Washing"
- [ ] Click "Confirm"
- [ ] **Expected:** Staff assigned to washing
- [ ] **Expected:** Washing workstation shows staff member
- [ ] Navigate to `/pipeline/workstation`
- [ ] **Expected:** Staff appears in washing section

#### View Staff Performance
- [ ] Click on staff name "Carol Washing Staff"
- [ ] **Expected:** Performance dashboard opens:
  - Orders processed today
  - Average processing time
  - Quality score
  - Attendance (this week)
  - Productivity trend chart

### 4.7 Quality Management

#### View Quality Issues
- [ ] Navigate to `/quality`
- [ ] **Expected:** See quality issues for BR-MAIN-001
- [ ] **Expected:** Issues categorized:
  - Pending Review
  - In Progress
  - Resolved
  - Escalated

#### Handle Quality Issue
- [ ] Create test quality issue:
  - Order: ORD-BR-MAIN-001-[DATE]-0001
  - Issue type: "Stain not removed"
  - Severity: "Medium"
  - Reported by: Quality check staff
- [ ] **Expected:** Issue appears in "Pending Review"
- [ ] Click on issue
- [ ] **Expected:** Issue details modal:
  - Order details
  - Garment affected
  - Issue description
  - Photos (if any)
  - Recommended action
- [ ] Select action: "Re-process"
- [ ] Assign to: "Carol Washing Staff"
- [ ] Add notes: "Use stronger solvent"
- [ ] Click "Submit"
- [ ] **Expected:** Issue status: "In Progress"
- [ ] **Expected:** Order moved back to "washing" stage
- [ ] **Expected:** Notification sent to staff

#### Escalate Major Issue
- [ ] Create major issue:
  - Issue type: "Garment damaged"
  - Severity: "High"
  - Description: "Tear in fabric during processing"
- [ ] Click "Escalate"
- [ ] **Expected:** Escalation modal opens
- [ ] **Expected:** Requires:
  - Photos (mandatory for high severity)
  - Detailed description
  - Customer notification plan
- [ ] Upload damage photos
- [ ] Fill in description
- [ ] Select: "Notify customer immediately"
- [ ] Click "Escalate to Workstation Manager"
- [ ] **Expected:** Issue escalated
- [ ] **Expected:** Workstation manager notified
- [ ] **Expected:** Customer notification sent

### 4.8 Deliveries Management (Branch)

#### View Branch Deliveries
- [ ] Navigate to `/deliveries`
- [ ] **Expected:** See deliveries from BR-MAIN-001
- [ ] **Expected:** Three tabs: Pending, In Progress, Completed

#### Create Delivery Route
- [ ] Click "Pending" tab
- [ ] **Expected:** See orders ready for delivery
- [ ] Select multiple orders for delivery
- [ ] Click "Create Delivery Route"
- [ ] **Expected:** Route optimization modal opens
- [ ] **Expected:** See map with all delivery addresses
- [ ] Select driver: "George Driver"
- [ ] Click "Optimize Route"
- [ ] **Expected:** Google Maps API calculates best route
- [ ] **Expected:** Stops numbered in optimal sequence
- [ ] **Expected:** Shows total distance and estimated time
- [ ] Review route
- [ ] Click "Assign to Driver"
- [ ] **Expected:** Delivery created
- [ ] **Expected:** Driver receives notification
- [ ] **Expected:** Delivery appears in "In Progress"

#### Monitor Active Delivery
- [ ] Click "In Progress" tab
- [ ] Find active delivery
- [ ] Click to view details
- [ ] **Expected:** See real-time map:
  - Driver's current GPS location
  - Completed stops (green markers)
  - Pending stops (red markers)
  - Route line
- [ ] **Expected:** Auto-refresh every 30 seconds
- [ ] **Expected:** See delivery progress:
  - Stop 1: Completed at 14:30
  - Stop 2: Completed at 14:45
  - Stop 3: In progress
  - Stop 4: Pending

### 4.9 Reports & Analytics (Branch)

#### Generate Branch Report
- [ ] Navigate to `/reports`
- [ ] Select report type: "Branch Performance"
- [ ] Select date range: "This Week"
- [ ] Click "Generate"
- [ ] **Expected:** PDF report with:
  - Orders summary
  - Revenue breakdown
  - Pipeline efficiency
  - Staff performance
  - Quality issues
  - Inventory status

#### Daily Operations Report
- [ ] Select report: "Daily Operations"
- [ ] **Expected:** Report includes:
  - Today's orders (by status)
  - Revenue (cash/mpesa/card breakdown)
  - Staff attendance
  - Quality issues
  - Deliveries completed
  - Pending payments

#### Export Data
- [ ] Click "Export Orders"
- [ ] Select format: CSV
- [ ] Select date range: "Last 30 days"
- [ ] Click "Export"
- [ ] **Expected:** CSV file downloads
- [ ] Open CSV
- [ ] **Expected:** All order data for BR-MAIN-001

---

## 5. Workstation Manager Testing

**Role:** Workstation Manager
**Email:** wm@lorenzo.test
**Password:** Test@1234
**Access Level:** Workstation operations and staff management

### 5.1 Authentication & Authorization

#### Login Flow
- [ ] Navigate to `/auth/login`
- [ ] Enter email: `wm@lorenzo.test`
- [ ] Enter password: `Test@1234`
- [ ] Click "Sign In"
- [ ] **Expected:** Redirect to `/workstation/dashboard`
- [ ] **Expected:** See "Workstation Manager" role badge

#### Authorization Verification
- [ ] Verify access to `/workstation/dashboard` ✓
- [ ] Verify access to `/workstation/processing` ✓
- [ ] Verify access to `/workstation/batches` ✓
- [ ] Verify access to `/workstation/staff` ✓
- [ ] Verify access to `/workstation/quality` ✓
- [ ] Verify NO access to `/pos` ✗
- [ ] Verify NO access to `/pricing` ✗
- [ ] Verify NO access to `/financial-reports` ✗

### 5.2 Workstation Dashboard

#### Overview
- [ ] Navigate to `/workstation/dashboard`
- [ ] **Expected:** See workstation overview:
  - Active batches count
  - Processing batches (by stage)
  - Staff on duty (by workstation)
  - Today's throughput
  - Quality issues (pending)
  - Capacity utilization

#### Real-Time Monitoring
- [ ] **Expected:** See each workstation status:
  - Inspection: Orders in queue, Staff assigned, Avg time
  - Washing: Batches in progress, Staff, Est. completion
  - Drying: Batches in progress, Staff, Est. completion
  - Ironing: Orders in queue, Staff assigned, Backlog
  - Quality Check: Orders pending, Staff, Issues found
  - Packaging: Orders ready, Staff, Completion rate

### 5.3 Batch Processing

#### View Processing Batches
- [ ] Navigate to `/workstation/batches`
- [ ] **Expected:** See all active batches
- [ ] **Expected:** Table columns:
  - Batch ID
  - Type (Processing/Transfer)
  - Stage
  - Orders count
  - Assigned staff
  - Start time
  - Est. completion
  - Status

#### Create Processing Batch
- [ ] Click "Create Batch"
- [ ] Select stage: "Washing"
- [ ] **Expected:** See available orders for washing
- [ ] Select orders (up to capacity):
  - ORD-BR-MAIN-001-20251123-0001 (3 garments)
  - ORD-BR-MAIN-001-20251123-0002 (2 garments)
  - ORD-BR-MAIN-001-20251123-0003 (4 garments)
- [ ] **Expected:** Total: 9 garments
- [ ] **Expected:** Capacity check: OK (capacity: 15)
- [ ] Assign staff: "Carol Washing Staff"
- [ ] Set batch ID: Auto-generated
- [ ] Click "Create Batch"
- [ ] **Expected:** Batch created:
  ```json
  {
    "batchId": "BATCH-WASH-20251123-001",
    "type": "processing",
    "stage": "washing",
    "orders": ["ORD-...-0001", "ORD-...-0002", "ORD-...-0003"],
    "assignedStaff": "ws-001",
    "status": "in_progress",
    "startTime": "2025-11-23T15:00:00Z"
  }
  ```
- [ ] **Expected:** Orders status updated to "washing"
- [ ] **Expected:** Staff assigned to batch

#### Monitor Batch Progress
- [ ] Click on batch "BATCH-WASH-20251123-001"
- [ ] **Expected:** Batch details view:
  - Orders list
  - Assigned staff
  - Start time
  - Estimated completion
  - Current status
  - Processing notes
- [ ] **Expected:** Staff can add notes
- [ ] **Expected:** Timer showing elapsed time

#### Complete Batch
- [ ] Wait for batch to complete (or manually mark)
- [ ] Click "Complete Batch"
- [ ] **Expected:** Confirmation modal
- [ ] **Expected:** Shows all orders in batch
- [ ] Review and confirm
- [ ] Click "Confirm Completion"
- [ ] **Expected:** Batch status: "completed"
- [ ] **Expected:** All orders moved to next stage: "drying"
- [ ] **Expected:** Orders available for next batch

### 5.4 Detailed Workstation Inspection

#### Inspection Workflow
- [ ] Navigate to `/workstation/inspection`
- [ ] **Expected:** See orders pending detailed inspection
- [ ] Select order: "ORD-BR-MAIN-001-20251123-0001"
- [ ] **Expected:** Garment list appears:
  - Shirt (White, Calvin Klein)
  - Suit Jacket (Navy Blue, Hugo Boss) - Has notable damage
  - Suit Trousers (Navy Blue, Hugo Boss)

#### Inspect Garment (No Issues)
- [ ] Click on "Shirt"
- [ ] **Expected:** Inspection form opens:
  - Garment photo (camera option)
  - Condition checkboxes:
    - Stains
    - Tears/Holes
    - Missing buttons
    - Discoloration
    - Odor
    - Other damage
  - Severity selector
  - Notes field
- [ ] Check garment condition: All OK
- [ ] Add note: "Good condition, no issues"
- [ ] Click "Complete Inspection"
- [ ] **Expected:** Garment marked "inspected - good"

#### Inspect Garment (With Issues)
- [ ] Click on "Suit Jacket"
- [ ] **Expected:** See initial inspection note: "Small coffee stain on cuff"
- [ ] Perform detailed inspection:
  - Check "Stains" checkbox
  - Location: "Left sleeve cuff"
  - Severity: "Minor"
  - Description: "Coffee stain, should respond to treatment"
  - Treatment plan: "Pre-treat with stain remover"
- [ ] Take photo of stain
- [ ] Upload photo
- [ ] Click "Complete Inspection"
- [ ] **Expected:** Garment marked "inspected - issues found"
- [ ] **Expected:** Treatment plan saved

#### Inspect Garment (Major Issue)
- [ ] Create test order with damaged garment
- [ ] During inspection, find:
  - Issue: "Tear in fabric"
  - Location: "Right shoulder seam"
  - Severity: "Major"
  - Description: "3cm tear along seam"
- [ ] Take photos (mandatory for major issues)
- [ ] Upload multiple angles
- [ ] Click "Flag as Major Issue"
- [ ] **Expected:** Major issue workflow triggered:
  - Requires workstation manager review
  - Photo documentation verified
  - Customer notification required
- [ ] **Expected:** Cannot proceed without manager approval

### 5.5 Staff Assignment & Management

#### View Workstation Staff
- [ ] Navigate to `/workstation/staff`
- [ ] **Expected:** See all workstation staff
- [ ] **Expected:** Grouped by current assignment:
  - Inspection: 1 staff
  - Washing: 2 staff
  - Drying: 2 staff
  - Ironing: 3 staff
  - Quality Check: 1 staff
  - Packaging: 1 staff
  - Unassigned: 0 staff

#### Reassign Staff
- [ ] Find "Carol Washing Staff" (currently on washing)
- [ ] Click "Reassign"
- [ ] Select new station: "Drying"
- [ ] Add reason: "High volume in drying section"
- [ ] Click "Confirm"
- [ ] **Expected:** Staff reassigned to drying
- [ ] **Expected:** Current batch (if any) needs to be transferred
- [ ] **Expected:** Notification sent to staff

#### Monitor Staff Performance
- [ ] Click on staff name "Carol Washing Staff"
- [ ] **Expected:** Performance metrics:
  - Batches completed (Today/Week/Month)
  - Average batch completion time
  - Quality score (issues found vs processed)
  - Throughput (garments/hour)
  - Attendance rate
- [ ] **Expected:** See chart: "Daily Throughput"
- [ ] **Expected:** See recent batches completed

### 5.6 Quality Management

#### Review Quality Issues
- [ ] Navigate to `/workstation/quality`
- [ ] **Expected:** See quality issues:
  - Pending Review
  - In Progress
  - Resolved
  - Escalated

#### Handle Standard Quality Issue
- [ ] Find issue: "Stain not fully removed"
- [ ] **Expected:** Issue details:
  - Order ID
  - Garment details
  - Issue description
  - Photos
  - Reported by
  - Timestamp
- [ ] Review photos
- [ ] Determine action: "Re-wash with pre-treatment"
- [ ] Assign to: "Carol Washing Staff"
- [ ] Set priority: "High"
- [ ] Add instructions: "Use oxygen-based stain remover, soak for 30 minutes before washing"
- [ ] Click "Assign for Re-processing"
- [ ] **Expected:** Issue status: "In Progress"
- [ ] **Expected:** Order moved back to washing
- [ ] **Expected:** Special instructions attached to batch

#### Approve Major Issue Escalation
- [ ] Find major issue: "Garment damaged during processing"
- [ ] **Expected:** Requires approval
- [ ] Review:
  - Photos uploaded ✓
  - Detailed description ✓
  - Root cause identified
  - Staff member responsible
- [ ] Determine course of action:
  - [ ] Customer notification: Immediate
  - [ ] Compensation: To be determined
  - [ ] Process improvement: Schedule training
- [ ] Add manager notes: "Tear occurred during extraction. Staff needs training on delicate garment handling."
- [ ] Click "Approve Escalation"
- [ ] **Expected:** Customer notification sent
- [ ] **Expected:** Store manager notified
- [ ] **Expected:** Incident logged for review

### 5.7 Transfer Batch Management

#### View Incoming Transfer Batches
- [ ] Navigate to `/workstation/transfers`
- [ ] **Expected:** See transfer batches from satellite stores
- [ ] **Expected:** Table shows:
  - Batch ID
  - Source branch
  - Orders count
  - Est. arrival time
  - Assigned driver
  - Status

#### Receive Transfer Batch
- [ ] Find incoming batch: "BATCH-TRANS-BR-SAT-001-20251123-001"
- [ ] Status: "In Transit"
- [ ] Driver: "George Driver"
- [ ] ETA: 16:00
- [ ] **Expected:** Can track driver location
- [ ] When driver arrives, click "Mark as Arrived"
- [ ] **Expected:** Arrival confirmation modal
- [ ] Verify orders count
- [ ] Scan/check each order
- [ ] Click "Confirm Receipt"
- [ ] **Expected:** Batch status: "Received"
- [ ] **Expected:** Orders added to processing queue
- [ ] **Expected:** Driver delivery marked complete

#### Process Transfer Batch
- [ ] Find received batch
- [ ] Click "Add to Processing Queue"
- [ ] **Expected:** Orders from satellite now in main store pipeline
- [ ] **Expected:** Orders visible in workstation dashboard
- [ ] **Expected:** Can create processing batch with these orders

---

## 6. Workstation Staff Testing

**Role:** Workstation Staff
**Email:** ws1@lorenzo.test
**Password:** Test@1234
**Access Level:** Process assigned batches and orders

### 6.1 Authentication & Authorization

#### Login Flow
- [ ] Navigate to `/auth/login`
- [ ] Enter email: `ws1@lorenzo.test`
- [ ] Enter password: `Test@1234`
- [ ] Click "Sign In"
- [ ] **Expected:** Redirect to `/workstation/my-tasks`
- [ ] **Expected:** See "Workstation Staff - Washing" badge

#### Authorization Verification
- [ ] Verify access to `/workstation/my-tasks` ✓
- [ ] Verify access to `/workstation/my-batches` ✓
- [ ] Verify NO access to other staff's batches ✗
- [ ] Verify NO access to `/dashboard` ✗
- [ ] Verify NO access to `/reports` ✗
- [ ] Verify NO access to `/pos` ✗

### 6.2 My Tasks Dashboard

#### View Assigned Tasks
- [ ] Navigate to `/workstation/my-tasks`
- [ ] **Expected:** See personal dashboard:
  - Current batch (if assigned)
  - Pending batches
  - Completed batches (today)
  - Performance metrics
  - Instructions/Notes from manager

#### Current Batch
- [ ] **Expected:** See current batch details:
  - Batch ID: BATCH-WASH-20251123-001
  - Orders: 3
  - Garments: 9
  - Start time: 15:00
  - Estimated completion: 16:30
  - Status: In Progress

### 6.3 Processing Batches

#### Start Batch
- [ ] Click on assigned batch
- [ ] **Expected:** Batch processing interface opens
- [ ] **Expected:** Shows:
  - Order list
  - Garments by type (grouped)
  - Special instructions (if any)
  - Timer
  - Checklist
- [ ] Click "Start Processing"
- [ ] **Expected:** Timer starts
- [ ] **Expected:** Status: "Active"

#### Processing Checklist (Washing Example)
- [ ] **Expected:** See washing checklist:
  - [ ] Sort garments by color
  - [ ] Check for special instructions
  - [ ] Pre-treat stains
  - [ ] Load washing machine
  - [ ] Select appropriate cycle
  - [ ] Add detergent and fabric softener
  - [ ] Start machine
  - [ ] Monitor progress
  - [ ] Remove immediately when done
- [ ] Check off each step as completed
- [ ] Add notes if needed: "Pre-treated coffee stain on suit jacket"
- [ ] **Expected:** Progress bar updates

#### Handle Special Instructions
- [ ] Find garment with special instruction: "Extra starch on collar"
- [ ] **Expected:** Instruction highlighted
- [ ] **Expected:** Reminder popup
- [ ] Acknowledge instruction
- [ ] Complete task
- [ ] Add note: "Applied extra starch as requested"

#### Flag Issue During Processing
- [ ] While processing, discover issue: "Stubborn stain not responding to treatment"
- [ ] Click "Flag Issue"
- [ ] **Expected:** Issue form opens:
  - Issue type selector
  - Severity selector
  - Description field
  - Photo upload
  - Recommended action
- [ ] Fill in:
  - Type: "Stain removal"
  - Severity: "Minor"
  - Description: "Coffee stain partially removed, needs re-treatment"
  - Recommendation: "Try oxygen-based stain remover"
- [ ] Upload photo
- [ ] Click "Submit Issue"
- [ ] **Expected:** Issue sent to quality check
- [ ] **Expected:** Notification sent to workstation manager
- [ ] Continue processing other garments

#### Complete Batch
- [ ] When all processing steps complete
- [ ] Click "Complete Batch"
- [ ] **Expected:** Final review screen:
  - All garments processed
  - All checklist items completed
  - Issues flagged (if any)
  - Processing notes
- [ ] Review and confirm
- [ ] Click "Mark as Complete"
- [ ] **Expected:** Batch status: "Completed"
- [ ] **Expected:** Orders moved to next stage: "Drying"
- [ ] **Expected:** Completion time recorded
- [ ] **Expected:** Performance metrics updated

### 6.4 Quality Checks (Staff Level)

#### Self-Quality Check
- [ ] Before completing batch, perform quality check:
  - Visual inspection of each garment
  - Check for remaining stains
  - Check for damage
  - Verify special instructions followed
- [ ] **Expected:** Quality checklist:
  - [ ] All stains removed
  - [ ] No damage during processing
  - [ ] Garments properly sorted
  - [ ] Special instructions completed
  - [ ] Ready for next stage

#### Re-Work Assignment
- [ ] Receive re-work assignment
- [ ] **Expected:** Notification: "Order returned for re-processing"
- [ ] Navigate to "My Tasks"
- [ ] **Expected:** See re-work order highlighted
- [ ] **Expected:** See original issue: "Stain not fully removed"
- [ ] **Expected:** See manager instructions: "Use stronger stain remover, pre-soak 30 mins"
- [ ] Click on re-work order
- [ ] Follow special instructions
- [ ] Process again
- [ ] Mark as complete
- [ ] **Expected:** Send back to quality check

### 6.5 Performance Tracking

#### View Personal Performance
- [ ] Navigate to "My Performance" tab
- [ ] **Expected:** See personal metrics:
  - Batches completed (Today/Week/Month)
  - Average completion time
  - Quality score
  - Efficiency rating
  - Ranking among workstation staff
- [ ] **Expected:** See chart: "Daily Batches Completed"
- [ ] **Expected:** See feedback from manager (if any)

#### View Leaderboard (if enabled)
- [ ] Navigate to "Leaderboard" tab
- [ ] **Expected:** See staff ranking:
  - Top performers by throughput
  - Top performers by quality
  - Most improved
- [ ] **Expected:** Own ranking highlighted

---

## 7. Satellite Staff Testing

**Role:** Satellite Staff
**Email:** sat@lorenzo.test
**Password:** Test@1234
**Access Level:** Satellite branch operations and transfer management

### 7.1 Authentication & Authorization

#### Login Flow
- [ ] Navigate to `/auth/login`
- [ ] Enter email: `sat@lorenzo.test`
- [ ] Enter password: `Test@1234`
- [ ] Click "Sign In"
- [ ] **Expected:** Redirect to `/satellite/dashboard`
- [ ] **Expected:** See "Satellite Staff - Westlands" badge

#### Authorization Verification
- [ ] Verify access to `/satellite/dashboard` ✓
- [ ] Verify access to `/satellite/orders` ✓
- [ ] Verify access to `/satellite/transfers` ✓
- [ ] Verify access to `/pos` (satellite) ✓
- [ ] Verify NO access to workstation processing ✗
- [ ] Verify NO access to main store data ✗

### 7.2 Satellite Dashboard

#### Dashboard Overview
- [ ] Navigate to `/satellite/dashboard`
- [ ] **Expected:** See satellite dashboard:
  - Today's orders (received)
  - Pending transfers to main store
  - Completed transfers
  - Orders ready for customer collection
  - Low stock alerts (satellite inventory)

### 7.3 Order Reception (Satellite)

#### Create Order at Satellite
- [ ] Navigate to `/pos`
- [ ] Create new order:
  - Customer: Mark Customer (+254712345002)
  - Collection: "drop_off" (at satellite)
  - Garments:
    - Coat (Dry Clean) - 1200 KES
    - Scarf (Dry Clean) - 300 KES
  - Total: 1500 KES
  - Return method: "customer_collects"
  - Collection branch: "Westlands Satellite"
- [ ] Process payment: M-Pesa, 1500 KES
- [ ] Click "Create Order"
- [ ] **Expected:** Order created: ORD-BR-SAT-001-[DATE]-[####]
- [ ] **Expected:** Order status: "received"
- [ ] **Expected:** Order automatically queued for transfer to main store

#### Order with Pickup (Satellite)
- [ ] Create order with pickup:
  - Customer: Jane Customer
  - Collection: "pickup"
  - Pickup address: "Westlands Office Park"
  - Schedule pickup: Today, 2 PM
  - Garments: Dress (Dry Clean) - 800 KES
  - Payment: Pending
- [ ] Click "Create Order"
- [ ] **Expected:** Order created
- [ ] **Expected:** Pickup request created
- [ ] **Expected:** Driver assignment pending (auto-assign from satellite drivers if available)

### 7.4 Transfer Management

#### View Pending Transfers
- [ ] Navigate to `/satellite/transfers`
- [ ] **Expected:** See orders pending transfer to main store
- [ ] **Expected:** Table shows:
  - Order ID
  - Customer
  - Garments count
  - Created date
  - Transfer status: "Pending"

#### Create Transfer Batch
- [ ] Select multiple orders (at least 3)
- [ ] Click "Create Transfer Batch"
- [ ] **Expected:** Transfer batch form:
  - Selected orders listed
  - Destination: BR-MAIN-001 (auto-filled)
  - Source: BR-SAT-001 (auto-filled)
  - Scheduled transfer: Date/Time picker
- [ ] Set transfer time: Today, 5 PM
- [ ] Click "Create Batch"
- [ ] **Expected:** Transfer batch created:
  ```json
  {
    "batchId": "BATCH-TRANS-BR-SAT-001-20251123-001",
    "type": "transfer",
    "sourceBranch": "BR-SAT-001",
    "destinationBranch": "BR-MAIN-001",
    "orders": ["ORD-...", "ORD-...", "ORD-..."],
    "scheduledTime": "2025-11-23T17:00:00Z",
    "status": "pending_driver_assignment"
  }
  ```
- [ ] **Expected:** Auto driver assignment triggered

#### Driver Auto-Assignment
- [ ] After batch creation, wait for assignment
- [ ] **Expected:** Driver assigned based on:
  - Main store driver availability
  - Current location
  - Current workload
- [ ] **Expected:** Notification sent to driver
- [ ] **Expected:** Batch status: "driver_assigned"
- [ ] **Expected:** Driver details shown:
  - Name: George Driver
  - Phone: +254725462868
  - ETA: 16:45

#### Track Transfer in Transit
- [ ] When driver picks up batch
- [ ] **Expected:** Batch status: "in_transit"
- [ ] **Expected:** Can view driver location (GPS)
- [ ] **Expected:** ETA to main store shown
- [ ] Monitor progress on map

#### Confirm Delivery to Main Store
- [ ] When driver arrives at main store
- [ ] **Expected:** Receive notification: "Batch delivered"
- [ ] **Expected:** Batch status: "delivered"
- [ ] **Expected:** Orders now in main store pipeline
- [ ] **Expected:** Can track order status in main store

### 7.5 Customer Collection (Satellite)

#### Receive Completed Orders
- [ ] Main store completes processing
- [ ] Orders transferred back to satellite for collection
- [ ] **Expected:** Notification: "Orders ready for customer collection"
- [ ] Navigate to "Ready for Collection"
- [ ] **Expected:** See list of orders:
  - Order ID
  - Customer name
  - Phone number
  - Return date
  - Days waiting

#### Customer Collects Order
- [ ] Customer arrives to collect
- [ ] Search for order: "+254712345002"
- [ ] **Expected:** Order "ORD-BR-SAT-001-[DATE]-0001" appears
- [ ] Verify customer identity
- [ ] Show order details
- [ ] Check garments:
  - Coat ✓
  - Scarf ✓
- [ ] If payment pending:
  - Process remaining payment
- [ ] Click "Mark as Collected"
- [ ] **Expected:** Order status: "collected"
- [ ] **Expected:** Collection timestamp recorded
- [ ] **Expected:** Customer receives thank you message (WhatsApp)

---

## 8. Front Desk Testing

**Role:** Front Desk
**Email:** frontdesk@lorenzo.test
**Password:** Test@1234
**Access Level:** POS operations and customer service

### 8.1 Authentication & Authorization

#### Login Flow
- [ ] Navigate to `/auth/login`
- [ ] Enter email: `frontdesk@lorenzo.test`
- [ ] Enter password: `Test@1234`
- [ ] Click "Sign In"
- [ ] **Expected:** Redirect to `/pos`
- [ ] **Expected:** See "Front Desk - Kilimani Main Store" badge

#### Authorization Verification
- [ ] Verify access to `/pos` ✓
- [ ] Verify access to `/customers` ✓
- [ ] Verify access to `/orders` (limited - own branch only) ✓
- [ ] Verify access to payment processing ✓
- [ ] Verify NO access to `/pipeline` ✗
- [ ] Verify NO access to `/reports` ✗
- [ ] Verify NO access to `/settings` ✗
- [ ] Verify NO access to `/pricing/edit` ✗

### 8.2 Point of Sale (POS) Operations

#### Create New Order - Walk-in Customer
- [ ] Navigate to `/pos`
- [ ] Click "New Walk-in Customer"
- [ ] Fill in customer details:
  ```json
  {
    "name": "Sarah Walk-in",
    "phone": "+254712345003"
  }
  ```
- [ ] Click "Create Customer"
- [ ] **Expected:** Quick customer profile created
- [ ] Add garments:
  - Shirt (Dry Clean) - 500 KES
  - Trousers (Wash & Iron) - 400 KES
- [ ] **Expected:** Total: 900 KES
- [ ] Select collection: "drop_off"
- [ ] Select return: "customer_collects"
- [ ] Set estimated completion: 2 days
- [ ] Click "Create Order"
- [ ] **Expected:** Order created
- [ ] **Expected:** Receipt modal appears

#### Create Order - Existing Customer
- [ ] Click "Find Customer"
- [ ] Search: "+254712345001"
- [ ] **Expected:** "Jane Customer" found with history:
  - Previous orders count
  - Total spent
  - Last order date
- [ ] Select customer
- [ ] **Expected:** Customer details pre-filled
- [ ] **Expected:** Saved addresses available
- [ ] Add garments using Quick Add:
  - Type: "Dress"
  - Service: "Dry Clean"
  - Color: "Red"
  - **Expected:** Price auto-populated: 800 KES
- [ ] Add special instructions: "Extra delicate handling"
- [ ] Select return: "delivery"
- [ ] Select delivery address from saved addresses
- [ ] Click "Create Order"
- [ ] Process payment immediately

#### Initial Garment Inspection at POS
- [ ] While creating order, perform initial inspection
- [ ] For each garment, check:
  - [ ] Visible stains
  - [ ] Tears or damages
  - [ ] Missing buttons
  - [ ] Other issues
- [ ] Find garment with damage:
  - Garment: Suit Jacket
  - Damage: Coffee stain on sleeve
  - Severity: Minor
- [ ] Click "Add Notable Damage"
- [ ] **Expected:** Damage documentation form:
  - Damage type selector
  - Location on garment
  - Severity
  - Description
  - Photo upload (optional at POS)
- [ ] Fill in details
- [ ] **Expected:** Damage noted in order
- [ ] **Expected:** Customer informed of pre-existing damage
- [ ] Customer acknowledges
- [ ] **Expected:** Damage documented on receipt

### 8.3 Payment Processing

#### Cash Payment
- [ ] Order total: 1200 KES
- [ ] Select payment method: "cash"
- [ ] Enter amount tendered: 1500 KES
- [ ] **Expected:** Change calculated: 300 KES
- [ ] Click "Process Payment"
- [ ] **Expected:** Payment successful
- [ ] **Expected:** Cash drawer prompt (if hardware integrated)
- [ ] Print receipt
- [ ] **Expected:** Receipt shows:
  - Order ID
  - Customer details
  - Garments list
  - Amount paid: 1200 KES
  - Payment method: Cash
  - Change given: 300 KES
  - Estimated completion date

#### M-Pesa Payment
- [ ] Order total: 2000 KES
- [ ] Select payment method: "mpesa"
- [ ] **Expected:** M-Pesa instructions displayed:
  - Paybill: 123456
  - Account: Lorenzo DC
  - Amount: 2000
- [ ] Customer sends M-Pesa
- [ ] Enter M-Pesa transaction code: "ABC123XYZ"
- [ ] Click "Verify Payment"
- [ ] **Expected:** Payment verified (or manual confirmation)
- [ ] **Expected:** Transaction code saved
- [ ] Click "Complete Payment"
- [ ] **Expected:** Payment recorded

#### Card Payment (Pesapal)
- [ ] Order total: 3500 KES
- [ ] Select payment method: "card"
- [ ] Click "Process Card Payment"
- [ ] **Expected:** Redirect to Pesapal payment page
- [ ] Customer completes payment on Pesapal
- [ ] **Expected:** Redirect back to POS
- [ ] **Expected:** Payment confirmation
- [ ] **Expected:** Payment status: "paid"
- [ ] **Expected:** Pesapal reference saved

#### Partial Payment
- [ ] Order total: 5000 KES
- [ ] Select payment method: "cash"
- [ ] Customer can only pay: 3000 KES
- [ ] Enter amount: 3000
- [ ] Click "Process Partial Payment"
- [ ] **Expected:** Payment status: "partial"
- [ ] **Expected:** Balance shown: 2000 KES
- [ ] **Expected:** Receipt shows:
  - Total: 5000 KES
  - Paid: 3000 KES
  - Balance: 2000 KES
- [ ] **Expected:** Payment reminder set

#### Credit Account
- [ ] Verify customer has credit privileges
- [ ] Order total: 1500 KES
- [ ] Select payment method: "credit"
- [ ] **Expected:** Customer credit limit shown
- [ ] **Expected:** Current balance shown
- [ ] **Expected:** Available credit calculated
- [ ] Click "Process on Credit"
- [ ] **Expected:** Payment status: "pending"
- [ ] **Expected:** Added to customer's account
- [ ] Print receipt with credit terms

### 8.4 Customer Management

#### Create New Customer Profile
- [ ] Navigate to `/customers`
- [ ] Click "Add Customer"
- [ ] Fill in form:
  ```json
  {
    "name": "Test Customer",
    "phone": "+254712345999",
    "email": "test@customer.com",
    "addresses": [
      {
        "label": "Home",
        "address": "Test Address, Nairobi"
      }
    ],
    "notifications": true
  }
  ```
- [ ] Click "Create Customer"
- [ ] **Expected:** Customer created
- [ ] **Expected:** Customer ID generated

#### Update Customer Details
- [ ] Find customer: "Jane Customer"
- [ ] Click "Edit"
- [ ] Add new address:
  - Label: "Work"
  - Address: "New Office Building, Westlands"
- [ ] Use Google Maps to pin location
- [ ] **Expected:** Coordinates auto-populated
- [ ] Update email
- [ ] Click "Save Changes"
- [ ] **Expected:** Customer updated

#### View Customer History
- [ ] Click on customer "Jane Customer"
- [ ] **Expected:** See customer profile:
  - Contact information
  - Saved addresses
  - Order history
  - Total spent
  - Loyalty points (if implemented)
- [ ] **Expected:** See list of past orders
- [ ] Click on past order
- [ ] **Expected:** Order details modal

### 8.5 Order Management (Limited)

#### View Own Created Orders
- [ ] Navigate to `/orders`
- [ ] **Expected:** See orders created by current user
- [ ] **Expected:** Cannot see orders created by other front desk staff
- [ ] **Expected:** Can filter by:
  - Status
  - Payment status
  - Date range

#### Update Order Before Processing
- [ ] Find order in "received" status
- [ ] Click "Edit Order"
- [ ] **Expected:** Can modify:
  - Garments
  - Special instructions
  - Collection/Return details
- [ ] **Expected:** Cannot modify:
  - Order ID
  - Customer (can only replace)
  - Creation timestamp
- [ ] Add garment
- [ ] Update total
- [ ] Click "Save Changes"
- [ ] **Expected:** Order updated

#### Cancel Order
- [ ] Find recent order (within 1 hour of creation)
- [ ] Click "Cancel Order"
- [ ] **Expected:** Cancellation confirmation modal
- [ ] **Expected:** Requires reason
- [ ] Enter reason: "Customer changed mind"
- [ ] Confirm cancellation
- [ ] **Expected:** Order cancelled
- [ ] If payment was made:
  - [ ] **Expected:** Refund initiated
  - [ ] **Expected:** Refund method selected

### 8.6 Receipt Management

#### Print Receipt
- [ ] After creating order, receipt modal appears
- [ ] **Expected:** Receipt preview shows:
  - Lorenzo Dry Cleaners logo
  - Branch details
  - Order ID
  - Customer details
  - Garments list with prices
  - Total amount
  - Payment details
  - Estimated completion
  - QR code for tracking
  - Notable damages (if any)
- [ ] Click "Print"
- [ ] **Expected:** Receipt sent to printer
- [ ] **Expected:** Option to email/WhatsApp receipt

#### Reprint Receipt
- [ ] Navigate to `/orders`
- [ ] Find completed order
- [ ] Click "Reprint Receipt"
- [ ] **Expected:** Receipt regenerated
- [ ] **Expected:** Same receipt number
- [ ] **Expected:** Watermark: "DUPLICATE"
- [ ] Print

#### Email/WhatsApp Receipt
- [ ] After creating order
- [ ] Click "Send via WhatsApp"
- [ ] **Expected:** Receipt PDF sent to customer's WhatsApp
- [ ] Click "Send via Email"
- [ ] **Expected:** Receipt PDF sent to customer's email

---

## 9. Driver Testing

**Role:** Driver
**Email:** driver1@lorenzo.test
**Password:** Test@1234
**Access Level:** Delivery operations and GPS tracking

### 9.1 Authentication & Authorization

#### Login Flow
- [ ] Navigate to `/auth/login`
- [ ] Enter email: `driver1@lorenzo.test`
- [ ] Enter password: `Test@1234`
- [ ] Click "Sign In"
- [ ] **Expected:** Redirect to `/driver/dashboard`
- [ ] **Expected:** See "Driver - George Driver" badge

#### Authorization Verification
- [ ] Verify access to `/driver/dashboard` ✓
- [ ] Verify access to `/driver/deliveries` ✓
- [ ] Verify access to `/driver/pickups` ✓
- [ ] Verify NO access to `/pos` ✗
- [ ] Verify NO access to `/reports` ✗
- [ ] Verify NO access to other drivers' deliveries ✗

### 9.2 Driver Dashboard

#### Daily Overview
- [ ] Navigate to `/driver/dashboard`
- [ ] **Expected:** See driver dashboard:
  - Today's deliveries assigned
  - Today's pickups assigned
  - Completed deliveries
  - Pending pickups
  - Total distance traveled
  - Current status (On Duty/Off Duty)

#### Clock In/Out
- [ ] Click "Clock In"
- [ ] **Expected:** GPS location recorded
- [ ] **Expected:** Status: "On Duty"
- [ ] **Expected:** Available for assignments
- [ ] Later, click "Clock Out"
- [ ] **Expected:** GPS location recorded
- [ ] **Expected:** Status: "Off Duty"
- [ ] **Expected:** Not available for new assignments
- [ ] **Expected:** Total hours calculated

### 9.3 Delivery Operations

#### View Assigned Delivery
- [ ] Navigate to `/driver/deliveries`
- [ ] **Expected:** See assigned deliveries
- [ ] Click on delivery: "DEL-20251123-001"
- [ ] **Expected:** Delivery details:
  - Delivery ID
  - Number of stops: 4
  - Total distance: 15 km
  - Estimated time: 1.5 hours
  - Orders included
  - Route map

#### Start Delivery Route
- [ ] Click "Start Delivery"
- [ ] **Expected:** GPS location tracking enabled
- [ ] **Expected:** Delivery status: "in_progress"
- [ ] **Expected:** Map shows:
  - Current location (blue dot)
  - All stops (numbered markers)
  - Optimized route (blue line)
  - Next stop highlighted
- [ ] **Expected:** Navigation to first stop
- [ ] **Expected:** Distance and ETA to next stop

#### Complete Delivery Stop
- [ ] Arrive at first stop
- [ ] **Expected:** App detects proximity (<100m)
- [ ] **Expected:** "Arrived" notification
- [ ] Click on stop
- [ ] **Expected:** Stop details:
  - Customer name
  - Address
  - Phone number
  - Order details
  - Special delivery instructions
- [ ] Call customer (if needed)
- [ ] Customer not home:
  - [ ] Click "Customer Not Available"
  - [ ] **Expected:** Options:
    - Call customer
    - Retry later
    - Mark as failed
  - [ ] Select "Retry later"
  - [ ] **Expected:** Stop moved to end of route
- [ ] Customer available:
  - [ ] Click "Mark as Delivered"
  - [ ] **Expected:** Confirmation form:
    - Customer name verification
    - Garments handed over
    - Payment collection (if COD)
    - Customer signature
    - Photo proof (optional)
- [ ] Collect payment (if pending):
  - Amount due: 1500 KES
  - Method: Cash
  - Enter amount: 1500
- [ ] Customer signs on device
- [ ] Click "Complete Delivery"
- [ ] **Expected:** Stop marked "completed"
- [ ] **Expected:** Payment recorded
- [ ] **Expected:** Navigation to next stop

#### Failed Delivery
- [ ] Arrive at stop
- [ ] Customer not available after 3 attempts
- [ ] Click "Mark as Failed"
- [ ] **Expected:** Failure reason selector:
  - Customer not home
  - Wrong address
  - Customer refused delivery
  - Other
- [ ] Select reason
- [ ] Add notes
- [ ] Take photo of location (proof)
- [ ] Click "Submit"
- [ ] **Expected:** Stop marked "failed"
- [ ] **Expected:** Branch manager notified
- [ ] **Expected:** Order status updated

#### Complete Delivery Route
- [ ] Complete all stops
- [ ] **Expected:** Final summary:
  - Total stops: 4
  - Successful: 3
  - Failed: 1
  - Distance traveled: 15 km
  - Time taken: 1.5 hours
  - Payments collected: 4500 KES
- [ ] Click "End Delivery"
- [ ] **Expected:** Delivery status: "completed"
- [ ] **Expected:** Return to base
- [ ] Submit collected payments at branch

### 9.4 Pickup Operations

#### View Assigned Pickups
- [ ] Navigate to `/driver/pickups`
- [ ] **Expected:** See scheduled pickups
- [ ] **Expected:** Table shows:
  - Pickup ID
  - Customer name
  - Address
  - Scheduled time
  - Status

#### Start Pickup Route
- [ ] Click on pickup assignment
- [ ] **Expected:** Pickup details:
  - Customer name and phone
  - Pickup address
  - Scheduled time
  - Special instructions
- [ ] Click "Navigate"
- [ ] **Expected:** GPS navigation starts

#### Complete Pickup
- [ ] Arrive at pickup location
- [ ] Call customer
- [ ] Customer hands over garments
- [ ] Count garments
- [ ] Take photo of garments
- [ ] Click "Complete Pickup"
- [ ] **Expected:** Pickup form:
  - Number of garments
  - Photo upload
  - Special instructions from customer
  - Estimated service type
- [ ] Fill in details
- [ ] Click "Submit Pickup"
- [ ] **Expected:** Pickup marked "completed"
- [ ] **Expected:** Order created at POS (if new)
- [ ] Return to branch with garments

### 9.5 Transfer Batch Delivery

#### Accept Transfer Assignment
- [ ] Receive notification: "Transfer batch assigned"
- [ ] Navigate to `/driver/transfers`
- [ ] **Expected:** See transfer batch:
  - Source: BR-SAT-001 (Westlands)
  - Destination: BR-MAIN-001 (Main)
  - Orders: 5
  - Scheduled pickup: 5 PM
- [ ] Click "Accept"
- [ ] **Expected:** Assignment accepted

#### Pickup Transfer Batch from Satellite
- [ ] Navigate to satellite store
- [ ] Click "Arrived at Pickup Location"
- [ ] **Expected:** GPS location verified
- [ ] Meet satellite staff
- [ ] Verify orders in batch:
  - Scan/check each order
  - Count: 5 orders
- [ ] Click "Confirm Pickup"
- [ ] **Expected:** Batch status: "in_transit"
- [ ] **Expected:** GPS tracking active
- [ ] Navigate to main store

#### Deliver Transfer Batch to Main Store
- [ ] Arrive at main store
- [ ] Click "Arrived at Destination"
- [ ] Meet workstation manager
- [ ] Hand over batch
- [ ] Workstation manager verifies orders
- [ ] Click "Confirm Delivery"
- [ ] **Expected:** Batch status: "delivered"
- [ ] **Expected:** Transfer complete
- [ ] **Expected:** Return to available status

### 9.6 Performance & Earnings

#### View Performance Metrics
- [ ] Navigate to "My Performance"
- [ ] **Expected:** See metrics:
  - Deliveries completed (Today/Week/Month)
  - Success rate
  - Average delivery time
  - Distance traveled
  - Customer ratings (if implemented)
  - On-time delivery rate

#### View Earnings (if applicable)
- [ ] Navigate to "Earnings"
- [ ] **Expected:** See earnings breakdown:
  - Base pay
  - Per-delivery rate
  - Distance-based pay
  - Tips (if any)
  - Total earnings (Today/Week/Month)

---

## 10. Customer Testing

**Role:** Customer
**Email:** customer1@test.com
**Password:** Test@1234
**Phone:** +254712345001
**Access Level:** Customer portal - order tracking and profile management

### 10.1 Authentication & Registration

#### Phone OTP Registration
- [ ] Navigate to `/portal/register`
- [ ] Enter phone number: "+254712345999"
- [ ] Click "Send OTP"
- [ ] **Expected:** OTP sent via SMS/WhatsApp
- [ ] **Expected:** OTP input field appears
- [ ] Enter OTP code (from SMS)
- [ ] Click "Verify"
- [ ] **Expected:** Phone verified
- [ ] **Expected:** Registration form appears:
  - Name
  - Email (optional)
  - Password
- [ ] Fill in details
- [ ] Click "Complete Registration"
- [ ] **Expected:** Account created
- [ ] **Expected:** Redirect to `/portal/dashboard`

#### Login with Phone OTP
- [ ] Navigate to `/portal/login`
- [ ] Enter phone: "+254712345001"
- [ ] Click "Send OTP"
- [ ] **Expected:** OTP sent
- [ ] Enter OTP
- [ ] Click "Login"
- [ ] **Expected:** Logged in
- [ ] **Expected:** Redirect to dashboard

#### Login with Email/Password
- [ ] Navigate to `/portal/login`
- [ ] Click "Login with Email"
- [ ] Enter email: "customer1@test.com"
- [ ] Enter password: "Test@1234"
- [ ] Click "Login"
- [ ] **Expected:** Logged in successfully

### 10.2 Customer Dashboard

#### Dashboard Overview
- [ ] Navigate to `/portal/dashboard`
- [ ] **Expected:** See customer dashboard:
  - Active orders count
  - Recent orders
  - Loyalty points (if implemented)
  - Quick actions:
    - Track order
    - View history
    - Update profile

### 10.3 Order Tracking

#### View Active Orders
- [ ] Navigate to `/portal/orders`
- [ ] **Expected:** See list of active orders
- [ ] **Expected:** Each order card shows:
  - Order ID
  - Status
  - Garments count
  - Estimated completion
  - Progress indicator

#### Track Order Progress
- [ ] Click on active order
- [ ] **Expected:** Order detail page:
  - Order ID
  - Current status
  - Status timeline:
    - Received ✓
    - In Progress (current)
    - Ready for Delivery (pending)
    - Delivered (pending)
  - Estimated completion time
  - Garments list
  - Special instructions
  - Total amount
  - Payment status

#### Real-Time Status Updates
- [ ] While viewing order details
- [ ] **Expected:** Auto-refresh every 30 seconds
- [ ] When status changes (simulate in backend):
  - **Expected:** Notification appears
  - **Expected:** Timeline updates
  - **Expected:** New status highlighted

#### Track Delivery
- [ ] Order status: "out_for_delivery"
- [ ] Click "Track Delivery"
- [ ] **Expected:** Live map appears:
  - Driver's current location
  - Customer's delivery address
  - Estimated time of arrival
  - Driver contact information
- [ ] **Expected:** Map updates in real-time
- [ ] **Expected:** Can call driver

### 10.4 Order History

#### View Past Orders
- [ ] Navigate to `/portal/orders/history`
- [ ] **Expected:** See all completed orders
- [ ] **Expected:** Table columns:
  - Order ID
  - Date
  - Items
  - Amount
  - Status

#### Filter Order History
- [ ] Apply date filter: "Last 30 days"
- [ ] **Expected:** Orders from last month shown
- [ ] Apply status filter: "delivered"
- [ ] **Expected:** Only delivered orders shown

#### View Order Receipt
- [ ] Click on past order
- [ ] Click "View Receipt"
- [ ] **Expected:** Receipt PDF opens
- [ ] **Expected:** Can download PDF
- [ ] **Expected:** Receipt shows:
  - Order details
  - Payment information
  - Garments list
  - Date delivered

#### Reorder
- [ ] Find past order
- [ ] Click "Reorder"
- [ ] **Expected:** New order form pre-filled with:
  - Same garment types
  - Same services
  - Same delivery address
- [ ] **Expected:** Can modify before submitting
- [ ] **Expected:** Must create via front desk (redirect or notification)

### 10.5 Profile Management

#### View Profile
- [ ] Navigate to `/portal/profile`
- [ ] **Expected:** See profile information:
  - Name
  - Phone (verified)
  - Email
  - Saved addresses
  - Notification preferences

#### Update Personal Information
- [ ] Click "Edit Profile"
- [ ] Update email
- [ ] Update name
- [ ] Click "Save Changes"
- [ ] **Expected:** Profile updated
- [ ] **Expected:** Success message

#### Manage Addresses
- [ ] Navigate to "Addresses" section
- [ ] Click "Add Address"
- [ ] Fill in form:
  - Label: "Office"
  - Address: "New Office, Westlands"
- [ ] Click pin on map
- [ ] **Expected:** Coordinates saved
- [ ] Click "Save Address"
- [ ] **Expected:** Address added to list
- [ ] Set as default delivery address
- [ ] **Expected:** Default marker shown

#### Edit Address
- [ ] Find address "Home"
- [ ] Click "Edit"
- [ ] Update address details
- [ ] Update map pin
- [ ] Click "Save"
- [ ] **Expected:** Address updated

#### Delete Address
- [ ] Find unused address
- [ ] Click "Delete"
- [ ] **Expected:** Confirmation modal
- [ ] Confirm deletion
- [ ] **Expected:** Address removed
- [ ] **Expected:** Cannot delete if used in active order

### 10.6 Notifications

#### Notification Preferences
- [ ] Navigate to "Notifications" in profile
- [ ] **Expected:** See notification channels:
  - WhatsApp ✓
  - Email ✓
  - SMS ✓
- [ ] Toggle WhatsApp off
- [ ] **Expected:** WhatsApp notifications disabled
- [ ] Toggle back on
- [ ] **Expected:** Re-enabled

#### View Notifications
- [ ] Navigate to `/portal/notifications`
- [ ] **Expected:** See notification history:
  - Order confirmation
  - Status updates
  - Delivery notifications
  - Payment reminders
- [ ] **Expected:** Unread count badge
- [ ] Click on notification
- [ ] **Expected:** Mark as read
- [ ] **Expected:** Navigate to relevant order

### 10.7 Payments

#### View Payment History
- [ ] Navigate to `/portal/payments`
- [ ] **Expected:** See all payments:
  - Transaction ID
  - Order ID
  - Amount
  - Method
  - Date
  - Status

#### Outstanding Balances
- [ ] **Expected:** See outstanding balances section
- [ ] **Expected:** List of unpaid/partially paid orders
- [ ] Click on order with balance
- [ ] Click "Pay Now"
- [ ] **Expected:** Redirect to payment page
- [ ] **Expected:** Payment options:
  - M-Pesa
  - Card (Pesapal)
  - Pay at store

#### Make Payment (Pesapal)
- [ ] Select "Card Payment"
- [ ] Click "Proceed to Payment"
- [ ] **Expected:** Redirect to Pesapal
- [ ] Complete payment on Pesapal
- [ ] **Expected:** Redirect back to portal
- [ ] **Expected:** Payment confirmation
- [ ] **Expected:** Order balance updated

---

## Part 3: End-to-End Integration Tests

### Complete Order Lifecycle

#### Test 1: Drop-off → Customer Collects (Paid Upfront)

**Objective:** Test complete order flow from creation to collection

**Steps:**
1. **Front Desk** creates order:
   - [ ] Customer: Jane Customer
   - [ ] Garments: 3 items
   - [ ] Collection: drop_off
   - [ ] Return: customer_collects
   - [ ] Payment: Full (cash) - 2100 KES
   - [ ] **Expected:** Order status: "received"
   - [ ] **Expected:** Receipt printed
   - [ ] **Expected:** WhatsApp confirmation sent

2. **Workstation Manager** creates processing batch:
   - [ ] Add order to inspection queue
   - [ ] **Expected:** Order status: "queued"

3. **Workstation Staff** performs detailed inspection:
   - [ ] Inspect all garments
   - [ ] Document pre-existing stain
   - [ ] **Expected:** Inspection complete
   - [ ] **Expected:** Order ready for processing

4. **Workstation Manager** creates washing batch:
   - [ ] Include inspected order
   - [ ] Assign to washing staff
   - [ ] **Expected:** Order status: "washing"

5. **Workstation Staff** processes washing:
   - [ ] Complete washing checklist
   - [ ] Mark batch complete
   - [ ] **Expected:** Order status: "drying"
   - [ ] **Expected:** WhatsApp update sent to customer

6. **System** auto-progresses through pipeline:
   - [ ] Drying → Ironing → Quality Check → Packaging
   - [ ] Each stage completed by assigned staff
   - [ ] **Expected:** Order status: "ready"
   - [ ] **Expected:** WhatsApp notification: "Order ready for collection"

7. **Customer** views in portal:
   - [ ] Login to customer portal
   - [ ] **Expected:** Order shows "Ready for Collection"
   - [ ] **Expected:** Branch location shown

8. **Front Desk** handles collection:
   - [ ] Customer arrives
   - [ ] Search order by phone
   - [ ] Verify garments
   - [ ] Click "Mark as Collected"
   - [ ] **Expected:** Order status: "collected"
   - [ ] **Expected:** Thank you message sent

**Expected End State:**
- Order status: "collected"
- Payment status: "paid"
- Customer satisfied
- All notifications sent
- Order history complete

---

#### Test 2: Pickup → Delivery (Partial Payment, Satellite Store)

**Objective:** Test satellite store workflow with pickup and delivery

**Steps:**
1. **Satellite Staff** creates order with pickup:
   - [ ] Customer: Mark Customer
   - [ ] Garments: 2 items - 1500 KES
   - [ ] Collection: pickup
   - [ ] Pickup address: Westlands Office
   - [ ] Return: delivery
   - [ ] Payment: Partial - 800 KES paid, 700 KES balance
   - [ ] **Expected:** Order created at satellite
   - [ ] **Expected:** Pickup request created

2. **System** auto-assigns driver for pickup:
   - [ ] **Expected:** Driver assigned based on location
   - [ ] **Expected:** Driver notified

3. **Driver** completes pickup:
   - [ ] Navigate to pickup location
   - [ ] Collect garments from customer
   - [ ] Take photos
   - [ ] **Expected:** Pickup complete
   - [ ] Return to satellite with garments

4. **Satellite Staff** creates transfer batch:
   - [ ] Add order to transfer batch
   - [ ] Schedule transfer: 5 PM
   - [ ] **Expected:** Transfer batch created
   - [ ] **Expected:** Auto driver assignment triggered

5. **Driver** transfers batch to main store:
   - [ ] Pickup batch from satellite
   - [ ] **Expected:** GPS tracking active
   - [ ] Deliver to main store
   - [ ] **Expected:** Workstation manager receives batch

6. **Workstation** processes order:
   - [ ] Detailed inspection
   - [ ] Processing through pipeline stages
   - [ ] **Expected:** Order status updates
   - [ ] **Expected:** Customer receives notifications

7. **System** auto-creates return delivery:
   - [ ] Order ready for delivery back to customer
   - [ ] **Expected:** Delivery route created
   - [ ] **Expected:** Driver assigned

8. **Driver** completes delivery:
   - [ ] Navigate to customer address
   - [ ] Collect remaining balance: 700 KES (cash)
   - [ ] Get customer signature
   - [ ] **Expected:** Order delivered
   - [ ] **Expected:** Payment complete

9. **Customer** views in portal:
   - [ ] **Expected:** Order status: "delivered"
   - [ ] **Expected:** Payment status: "paid"
   - [ ] **Expected:** Can view receipt

**Expected End State:**
- Order completed full lifecycle
- Payment fully collected
- Transfer between branches successful
- All GPS tracking functional
- Notifications sent at each stage

---

#### Test 3: Major Quality Issue Escalation

**Objective:** Test quality issue workflow with escalation

**Steps:**
1. **Front Desk** creates order:
   - [ ] Order with expensive garment (suit) - 3000 KES
   - [ ] Initial inspection: no notable damages
   - [ ] Payment: Full upfront

2. **Workstation Staff** performs detailed inspection:
   - [ ] Find hidden damage: Small tear in lining
   - [ ] Severity: Minor
   - [ ] Document with photos
   - [ ] **Expected:** Minor issue logged

3. **Workstation Staff** processes washing:
   - [ ] During washing, tear worsens
   - [ ] Damage: Major tear (3cm)
   - [ ] Severity: Major
   - [ ] Click "Flag as Major Issue"
   - [ ] Upload photos (multiple angles)
   - [ ] **Expected:** Cannot proceed without manager approval

4. **Workstation Manager** reviews major issue:
   - [ ] Review photos and description
   - [ ] Root cause: Damage worsened during processing
   - [ ] Decision: Escalate to store manager
   - [ ] **Expected:** Customer notification required

5. **System** sends customer notification:
   - [ ] WhatsApp message: "Issue with your order, please contact us"
   - [ ] Email with photos
   - [ ] **Expected:** Customer can view issue in portal

6. **Store Manager** handles escalation:
   - [ ] Reviews full incident
   - [ ] Contacts customer
   - [ ] Offers: Repair at discount or full refund
   - [ ] Customer accepts: Repair + 50% discount

7. **System** updates order:
   - [ ] Add repair service
   - [ ] Update total: 1500 KES refund processed
   - [ ] Continue processing
   - [ ] **Expected:** Order completes with resolution

8. **Customer** receives garment:
   - [ ] Garment repaired
   - [ ] Refund processed
   - [ ] **Expected:** Issue resolved
   - [ ] **Expected:** Incident logged for review

**Expected End State:**
- Major issue properly escalated
- Customer notified and involved
- Resolution achieved
- Refund processed
- Incident documentation complete

#### Test 4: WhatsApp Notification Flow

**Objective:** Test complete WhatsApp notification integration

**Steps:**
1. **Front Desk** creates order:
   - [ ] Customer with WhatsApp notifications enabled
   - [ ] **Expected:** Order confirmation sent via WhatsApp
   - [ ] **Expected:** Customer receives order details and receipt PDF

2. **Customer** receives WhatsApp notifications at each stage:
   - [ ] Order received confirmation
   - [ ] Order in washing notification
   - [ ] Order ready for collection notification
   - [ ] Payment reminder (if applicable)

3. **System** sends all notifications:
   - [ ] Verify all notifications sent successfully in Firestore
   - [ ] Check notification status: "delivered"
   - [ ] Verify notification logs

4. **Customer** can interact:
   - [ ] Click tracking link in WhatsApp
   - [ ] **Expected:** Redirects to customer portal
   - [ ] **Expected:** Shows current order status

**Expected End State:**
- All notifications delivered
- Customer engaged via WhatsApp
- Notification logs complete

---

#### Test 5: Payment Processing via Pesapal

**Objective:** Test card payment integration end-to-end

**Steps:**
1. **Front Desk** creates order:
   - [ ] Total: 3500 KES
   - [ ] Select payment method: "card"
   - [ ] Click "Process Card Payment"

2. **System** initiates Pesapal payment:
   - [ ] **Expected:** Pesapal payment request created
   - [ ] **Expected:** Order status: "pending_payment"
   - [ ] **Expected:** Redirect URL generated

3. **Customer** completes payment on Pesapal:
   - [ ] Redirect to Pesapal page
   - [ ] Enter card details (test card)
   - [ ] Complete payment
   - [ ] **Expected:** Pesapal processes payment

4. **System** receives IPN callback:
   - [ ] **Expected:** Pesapal sends IPN to webhook
   - [ ] **Expected:** Signature verified
   - [ ] **Expected:** Payment status updated to "paid"
   - [ ] **Expected:** Transaction recorded in Firestore

5. **Front Desk** sees confirmation:
   - [ ] **Expected:** Payment confirmation appears
   - [ ] **Expected:** Receipt updated with Pesapal ref
   - [ ] **Expected:** Order can proceed

**Expected End State:**
- Payment successful
- Pesapal reference saved
- Transaction logged
- Receipt generated

---

## Part 4: Edge Cases & Error Scenarios

### Authentication Edge Cases

#### EC-AUTH-001: Invalid Phone Number Format
- [ ] Attempt registration with phone: "0712345678" (without country code)
- [ ] **Expected:** Validation error: "Please enter phone number in format +254..."
- [ ] Try: "254712345678" (missing +)
- [ ] **Expected:** Validation error or auto-correction to "+254712345678"
- [ ] Try: "+255712345678" (wrong country code)
- [ ] **Expected:** Error: "Only Kenyan phone numbers (+254) are supported"

#### EC-AUTH-002: OTP Expiry
- [ ] Request OTP
- [ ] Wait 5+ minutes (OTP expires)
- [ ] Try to verify expired OTP
- [ ] **Expected:** Error: "OTP expired. Please request a new code"
- [ ] Request new OTP
- [ ] **Expected:** New OTP sent, old OTP invalidated

#### EC-AUTH-003: Account Lockout
- [ ] Attempt login with wrong password 5 times
- [ ] **Expected:** Account locked after 5 failed attempts
- [ ] **Expected:** Error: "Account locked due to multiple failed attempts. Try again in 30 minutes"
- [ ] Try correct password
- [ ] **Expected:** Still locked
- [ ] Wait 30 minutes or admin unlock
- [ ] **Expected:** Can login again

#### EC-AUTH-004: Simultaneous Login
- [ ] Login as "Front Desk" user on Browser 1
- [ ] Login as same user on Browser 2
- [ ] **Expected:** Both sessions active (or session invalidation based on requirement)
- [ ] Perform action on Browser 1
- [ ] **Expected:** Works normally
- [ ] Logout from Browser 1
- [ ] Check Browser 2
- [ ] **Expected:** Session handling per security policy

---

### Order Processing Edge Cases

#### EC-ORD-001: Order Creation with Invalid Customer Data
- [ ] Try creating order without customer
- [ ] **Expected:** Error: "Customer required"
- [ ] Try with invalid phone format
- [ ] **Expected:** Validation error before order creation
- [ ] Try with duplicate customer phone
- [ ] **Expected:** Find existing customer or create new (based on business logic)

#### EC-ORD-002: Order with No Garments
- [ ] Create order
- [ ] Don't add any garments
- [ ] Try to submit
- [ ] **Expected:** Error: "At least one garment required"
- [ ] Cannot proceed to payment

#### EC-ORD-003: Negative Pricing
- [ ] Try to manually set garment price to -500
- [ ] **Expected:** Validation error: "Price must be positive"
- [ ] Try to apply discount > 100%
- [ ] **Expected:** Error: "Discount cannot exceed total amount"

#### EC-ORD-004: Order ID Collision
- [ ] System generates order ID: ORD-BR-MAIN-001-20251123-0001
- [ ] Simultaneously create another order (race condition)
- [ ] **Expected:** System handles collision
- [ ] **Expected:** Second order gets: ORD-BR-MAIN-001-20251123-0002
- [ ] **Expected:** No duplicate order IDs

#### EC-ORD-005: Editing Order After Processing Started
- [ ] Create order in "received" status
- [ ] Order moves to "queued" (processing started)
- [ ] Try to edit garments
- [ ] **Expected:** Error: "Cannot modify order after processing started"
- [ ] **Expected:** Can only add notes or update delivery info

#### EC-ORD-006: Cancelling Order in Late Stage
- [ ] Order in "ironing" stage
- [ ] Try to cancel order
- [ ] **Expected:** Warning: "Order is already 70% complete. Are you sure?"
- [ ] Confirm cancellation
- [ ] **Expected:** Order cancelled
- [ ] **Expected:** Refund process initiated
- [ ] **Expected:** Staff notified to stop processing

---

### Payment Edge Cases

#### EC-PAY-001: Partial Payment Greater Than Total
- [ ] Order total: 1000 KES
- [ ] Try to pay: 1500 KES
- [ ] **Expected:** Error: "Payment cannot exceed total amount"
- [ ] **Expected:** Or create credit balance for customer

#### EC-PAY-002: Multiple Simultaneous Payments
- [ ] Order with balance: 1000 KES
- [ ] Customer pays via Pesapal: 1000 KES (pending)
- [ ] Front desk accepts cash: 1000 KES
- [ ] Both payments confirm
- [ ] **Expected:** System detects overpayment
- [ ] **Expected:** Refund excess or create credit

#### EC-PAY-003: Pesapal IPN Timeout
- [ ] Process payment via Pesapal
- [ ] Customer completes payment
- [ ] IPN callback fails/delays
- [ ] **Expected:** Order remains "pending_payment"
- [ ] **Expected:** System allows manual verification
- [ ] **Expected:** Admin can check Pesapal and mark paid manually

#### EC-PAY-004: M-Pesa Invalid Code
- [ ] Select M-Pesa payment
- [ ] Enter invalid transaction code: "INVALID123"
- [ ] Click verify
- [ ] **Expected:** Error: "Invalid M-Pesa code format"
- [ ] **Expected:** Can retry with correct code

#### EC-PAY-005: Refund for Cancelled Order
- [ ] Order paid: 2000 KES (Card via Pesapal)
- [ ] Cancel order
- [ ] **Expected:** Refund initiated
- [ ] **Expected:** Pesapal refund request sent
- [ ] **Expected:** Refund status tracked
- [ ] **Expected:** Customer notified

---

### Delivery Edge Cases

#### EC-DEL-001: GPS Location Not Available
- [ ] Driver starts delivery
- [ ] GPS disabled or unavailable
- [ ] **Expected:** Error: "GPS required for delivery tracking"
- [ ] **Expected:** Cannot start delivery without GPS
- [ ] **Expected:** Prompt to enable location services

#### EC-DEL-002: Driver Goes Offline Mid-Delivery
- [ ] Driver starts delivery route (4 stops)
- [ ] Complete 2 stops
- [ ] Internet connection lost
- [ ] **Expected:** App continues working offline
- [ ] **Expected:** Can mark deliveries complete
- [ ] **Expected:** Data syncs when back online

#### EC-DEL-003: Customer Address Not Found
- [ ] Delivery assigned to driver
- [ ] Address: "Invalid Address, Nairobi"
- [ ] Google Maps cannot locate
- [ ] **Expected:** Driver can call customer
- [ ] **Expected:** Can mark as "Address Issue"
- [ ] **Expected:** Store manager notified

#### EC-DEL-004: All Deliveries Failed
- [ ] Delivery route with 4 stops
- [ ] All customers unavailable
- [ ] Mark all as failed
- [ ] **Expected:** Driver can complete route
- [ ] **Expected:** All orders returned to branch
- [ ] **Expected:** Customer notifications sent
- [ ] **Expected:** Rescheduling triggered

#### EC-DEL-005: Route Optimization Failure
- [ ] Create delivery with 25+ stops (Google Maps limit)
- [ ] **Expected:** System batches into multiple routes
- [ ] **Expected:** OR error: "Maximum 25 stops per route"
- [ ] **Expected:** Suggests splitting into 2 deliveries

---

### Workstation Processing Edge Cases

#### EC-WS-001: Batch at Full Capacity
- [ ] Washing machine capacity: 15 garments
- [ ] Try to add 16 garments to batch
- [ ] **Expected:** Warning: "Capacity exceeded (16/15)"
- [ ] **Expected:** Cannot create batch
- [ ] **Expected:** Suggest splitting into 2 batches

#### EC-WS-002: Staff Assigned to Multiple Stations
- [ ] Assign "Carol" to washing station
- [ ] Try to assign "Carol" to drying station simultaneously
- [ ] **Expected:** Error: "Staff already assigned to washing"
- [ ] **Expected:** Must unassign from washing first

#### EC-WS-003: Order Lost in Pipeline
- [ ] Order stuck in "washing" for 48+ hours
- [ ] **Expected:** Automated alert to workstation manager
- [ ] **Expected:** Email notification
- [ ] **Expected:** Highlighted in pipeline dashboard

#### EC-WS-004: Major Issue Without Photos
- [ ] Flag major garment damage
- [ ] Try to submit without photos
- [ ] **Expected:** Error: "Photos required for major issues"
- [ ] **Expected:** Cannot proceed until photos uploaded

#### EC-WS-005: Batch Completion Without All Items
- [ ] Batch with 10 garments
- [ ] Try to complete with only 9 processed
- [ ] **Expected:** Warning: "1 garment not marked complete"
- [ ] **Expected:** Requires explanation
- [ ] **Expected:** Can mark as lost/damaged

---

### Transfer Batch Edge Cases

#### EC-TRF-001: Transfer Without Available Driver
- [ ] Create transfer batch from satellite
- [ ] No drivers available (all busy/off duty)
- [ ] **Expected:** Batch created but not assigned
- [ ] **Expected:** Status: "pending_driver_assignment"
- [ ] **Expected:** Alert sent to store manager
- [ ] **Expected:** Can manually assign when driver available

#### EC-TRF-002: Driver Accepts Then Rejects
- [ ] Driver assigned to transfer
- [ ] Driver accepts
- [ ] Driver later needs to reject (emergency)
- [ ] Click "Cannot Complete"
- [ ] **Expected:** Requires reason
- [ ] **Expected:** Batch reassigned to another driver
- [ ] **Expected:** Store manager notified

#### EC-TRF-003: Batch Lost in Transit
- [ ] Transfer in progress
- [ ] Driver goes offline for 2+ hours
- [ ] Last known location not at destination
- [ ] **Expected:** System alerts store manager
- [ ] **Expected:** Can contact driver
- [ ] **Expected:** Manual intervention required

#### EC-TRF-004: Receiving Wrong Batch
- [ ] Transfer batch: BATCH-TRANS-BR-SAT-001-001
- [ ] Expected: 5 orders
- [ ] Receiving staff counts: 4 orders
- [ ] **Expected:** Cannot confirm receipt
- [ ] **Expected:** Discrepancy reported
- [ ] **Expected:** Investigation initiated

---

### Notification & Integration Edge Cases

#### EC-NOT-001: WhatsApp API Failure
- [ ] Order created
- [ ] WhatsApp notification fails (Wati API down)
- [ ] **Expected:** Notification status: "failed"
- [ ] **Expected:** Retry attempted (3 times)
- [ ] **Expected:** Fallback to SMS
- [ ] **Expected:** Admin alert if all retries fail

#### EC-NOT-002: Customer Phone Number Changed
- [ ] Order created for customer: +254712345001
- [ ] Customer changes phone to: +254712345999
- [ ] Order notifications sent to old number
- [ ] **Expected:** Delivery fails
- [ ] **Expected:** System updates to new number
- [ ] **Expected:** Resends notifications

#### EC-NOT-003: Pesapal Webhook Signature Invalid
- [ ] Receive Pesapal IPN callback
- [ ] Signature verification fails (tampered request)
- [ ] **Expected:** Webhook rejected
- [ ] **Expected:** Security alert logged
- [ ] **Expected:** Payment not updated
- [ ] **Expected:** Admin notification

#### EC-NOT-004: Google Maps API Quota Exceeded
- [ ] Create 1000+ delivery routes in a day
- [ ] Google Maps quota exceeded
- [ ] **Expected:** Error: "Route optimization unavailable"
- [ ] **Expected:** Fallback to manual route planning
- [ ] **Expected:** Admin alert to increase quota

---

### Customer Portal Edge Cases

#### EC-CP-001: Customer Views Other Customer's Order
- [ ] Customer logged in as customer-001
- [ ] Try to access URL: `/portal/orders/ORD-CUSTOMER-002-001`
- [ ] **Expected:** Access denied
- [ ] **Expected:** Error: "Order not found" or redirect
- [ ] **Expected:** Security log created

#### EC-CP-002: Order Tracking Link Expired
- [ ] Order created 6 months ago
- [ ] Customer clicks old tracking link
- [ ] **Expected:** Order shown (if not deleted)
- [ ] **Expected:** OR message: "Order archived"
- [ ] **Expected:** Option to contact support

#### EC-CP-003: Portal During Processing
- [ ] Customer viewing order in portal
- [ ] Order status updates (washing → drying)
- [ ] **Expected:** Real-time update (within 30s)
- [ ] **Expected:** Notification appears
- [ ] **Expected:** Timeline updates

#### EC-CP-004: Customer Deletes Active Delivery Address
- [ ] Customer has order "out_for_delivery"
- [ ] Try to delete delivery address
- [ ] **Expected:** Error: "Cannot delete address in use"
- [ ] **Expected:** Address remains until delivery complete

---

### System Performance Edge Cases

#### EC-SYS-001: 100+ Concurrent Users
- [ ] Simulate 100 users logged in simultaneously
- [ ] All creating orders, viewing pipeline, etc.
- [ ] **Expected:** System remains responsive (<2s page load)
- [ ] **Expected:** No database deadlocks
- [ ] **Expected:** All operations complete successfully

#### EC-SYS-002: Database Connection Lost
- [ ] Active session, Firebase connection drops
- [ ] Try to create order
- [ ] **Expected:** Error: "Connection lost. Please try again"
- [ ] **Expected:** Unsaved data preserved (local storage)
- [ ] **Expected:** Auto-retry connection
- [ ] **Expected:** User can retry operation

#### EC-SYS-003: Image Upload Failure
- [ ] Upload garment damage photo (5MB)
- [ ] Upload fails (network issue)
- [ ] **Expected:** Error message with retry option
- [ ] **Expected:** Can retry upload
- [ ] **Expected:** Can continue without photo (for minor issues)

#### EC-SYS-004: Firestore Write Conflict
- [ ] User A updates order status
- [ ] User B simultaneously updates same order
- [ ] **Expected:** Firestore handles with transactions
- [ ] **Expected:** One update succeeds
- [ ] **Expected:** Other retried automatically
- [ ] **Expected:** No data loss

---

### Data Integrity Edge Cases

#### EC-DATA-001: Order Status Regression
- [ ] Order in "ironing" stage
- [ ] Attempt to manually set status to "washing"
- [ ] **Expected:** Error: "Cannot move order backwards in pipeline"
- [ ] **Expected:** Or requires manager approval with reason

#### EC-DATA-002: Payment Sum Mismatch
- [ ] Order total: 2000 KES
- [ ] Payment 1: 1000 KES
- [ ] Payment 2: 1000 KES
- [ ] **Expected:** Total paid: 2000 KES
- [ ] Verify sum matches in:
  - Order document
  - Transaction collection
  - Customer payment history
- [ ] **Expected:** All values consistent

#### EC-DATA-003: Orphaned Garments
- [ ] Order cancelled mid-processing
- [ ] Garments already in batch
- [ ] **Expected:** Garments removed from batch
- [ ] **Expected:** Batch rebalanced
- [ ] **Expected:** No orphaned garments in system

#### EC-DATA-004: Duplicate Customer Records
- [ ] Customer exists: phone +254712345001
- [ ] Try to create new customer with same phone
- [ ] **Expected:** Error: "Customer already exists"
- [ ] **Expected:** Show existing customer
- [ ] **Expected:** Option to update existing record

---

### Security Edge Cases

#### EC-SEC-001: SQL Injection Attempt
- [ ] In search field, enter: `"; DROP TABLE orders; --`
- [ ] **Expected:** Treated as literal search string
- [ ] **Expected:** No SQL execution (using Firestore - NoSQL)
- [ ] **Expected:** No system damage

#### EC-SEC-002: XSS Attack Attempt
- [ ] In special instructions, enter: `<script>alert('XSS')</script>`
- [ ] Save order
- [ ] View order details
- [ ] **Expected:** Script tags escaped
- [ ] **Expected:** Displayed as plain text
- [ ] **Expected:** Script not executed

#### EC-SEC-003: Unauthorized API Access
- [ ] Obtain API endpoint: `/api/orders/create`
- [ ] Send POST request without authentication token
- [ ] **Expected:** 401 Unauthorized
- [ ] **Expected:** Error: "Authentication required"
- [ ] With expired token:
- [ ] **Expected:** 401 Unauthorized
- [ ] **Expected:** Prompt to re-login

#### EC-SEC-004: Role Escalation Attempt
- [ ] Login as "Front Desk" user
- [ ] Try to access: `/admin/users`
- [ ] **Expected:** 403 Forbidden
- [ ] **Expected:** Redirect to dashboard
- [ ] Try to modify user role via API
- [ ] **Expected:** Request rejected

---

### Mobile & Responsive Edge Cases

#### EC-MOB-001: Mobile Data Connection Drops
- [ ] Driver on mobile, mid-delivery
- [ ] Switch from WiFi to mobile data
- [ ] Connection briefly drops
- [ ] **Expected:** App handles gracefully
- [ ] **Expected:** Queues operations
- [ ] **Expected:** Syncs when reconnected

#### EC-MOB-002: Small Screen Layout
- [ ] View pipeline on phone (375px width)
- [ ] **Expected:** Kanban columns stack vertically
- [ ] **Expected:** All content readable
- [ ] **Expected:** Touch targets ≥44px
- [ ] **Expected:** No horizontal scroll

#### EC-MOB-003: GPS Accuracy Issues
- [ ] Driver GPS accuracy: ±50m (poor signal)
- [ ] Near delivery location
- [ ] **Expected:** "Arrived" trigger may not activate
- [ ] **Expected:** Manual "Mark as Arrived" available
- [ ] **Expected:** Location still logged

---

## Test Completion Checklist

### Pre-Testing Setup
- [ ] All test users created
- [ ] Test branches configured
- [ ] Test inventory seeded
- [ ] Environment variables set
- [ ] Integrations in sandbox mode
- [ ] Database backed up

### Role-Based Testing Complete
- [ ] Admin - All tests passed
- [ ] Director - All tests passed
- [ ] General Manager - All tests passed
- [ ] Store Manager - All tests passed
- [ ] Workstation Manager - All tests passed
- [ ] Workstation Staff - All tests passed
- [ ] Satellite Staff - All tests passed
- [ ] Front Desk - All tests passed
- [ ] Driver - All tests passed
- [ ] Customer - All tests passed

### Integration Tests Complete
- [ ] Complete order lifecycle tested
- [ ] Satellite workflow tested
- [ ] Quality escalation tested
- [ ] WhatsApp notifications tested
- [ ] Payment integration tested

### Edge Cases Tested
- [ ] Authentication edge cases
- [ ] Order processing edge cases
- [ ] Payment edge cases
- [ ] Delivery edge cases
- [ ] Workstation edge cases
- [ ] Transfer batch edge cases
- [ ] Notification edge cases
- [ ] Customer portal edge cases
- [ ] System performance edge cases
- [ ] Data integrity edge cases
- [ ] Security edge cases
- [ ] Mobile edge cases

### Bug Tracking
| Bug ID | Description | Severity | Status | Assigned To | Resolution |
|--------|-------------|----------|--------|-------------|------------|
| BUG-001 | | | | | |
| BUG-002 | | | | | |

### Sign-Off
- [ ] All critical bugs fixed
- [ ] Remaining bugs documented
- [ ] Test results compiled
- [ ] Product manager approval
- [ ] Ready for UAT

---

## Appendix: Quick Reference

### Test User Credentials Summary
| Role | Email | Phone | Password |
|------|-------|-------|----------|
| Admin | admin@lorenzo.test | +254725462859 | Test@1234 |
| Director | director@lorenzo.test | +254725462860 | Test@1234 |
| General Manager | gm@lorenzo.test | +254725462861 | Test@1234 |
| Store Manager | sm.main@lorenzo.test | +254725462862 | Test@1234 |
| Workstation Manager | wm@lorenzo.test | +254725462863 | Test@1234 |
| Workstation Staff | ws1@lorenzo.test | +254725462864 | Test@1234 |
| Satellite Staff | sat@lorenzo.test | +254725462866 | Test@1234 |
| Front Desk | frontdesk@lorenzo.test | +254725462867 | Test@1234 |
| Driver 1 | driver1@lorenzo.test | +254725462868 | Test@1234 |
| Customer 1 | customer1@test.com | +254712345001 | Test@1234 |

### Common Test Scenarios - Time Estimates
| Scenario | Estimated Time |
|----------|----------------|
| Single role complete testing | 2-3 hours |
| Complete order lifecycle test | 30 minutes |
| Integration test (one scenario) | 45 minutes |
| Edge case category testing | 1 hour |
| Full system test (all roles + integrations + edge cases) | 2-3 days |

### Key System URLs
- Main App: `http://localhost:3000`
- Customer Portal: `http://localhost:3000/portal`
- Admin Dashboard: `http://localhost:3000/dashboard`
- POS: `http://localhost:3000/pos`
- Workstation: `http://localhost:3000/workstation`

### Support Contacts
- **Development Team:** Jerry Ndururi in collaboration with AI Agents Plus
- **Product Questions:** jerry@ai-agentsplus.com
- **Firebase/Backend:** arthur@ai-agentsplus.com

---

**Document Version:** 1.0
**Last Updated:** November 23, 2025
**Total Test Cases:** 500+
**Estimated Testing Time:** 2-3 days (full coverage)
**Status:** Complete - Ready for Testing

---

*End of Lorenzo Dry Cleaners End-to-End Testing Guide*
