# Legacy Data Migration Runbook

## FR-016: Legacy Data Migration

**Document Version:** 1.0
**Last Updated:** January 2026
**Author:** AI Agents Plus Development Team

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Data Preparation](#data-preparation)
4. [Input File Formats](#input-file-formats)
5. [Migration Steps](#migration-steps)
6. [Validation](#validation)
7. [Rollback Procedure](#rollback-procedure)
8. [Troubleshooting](#troubleshooting)
9. [Post-Migration Checklist](#post-migration-checklist)

---

## Overview

This runbook provides step-by-step instructions for migrating customer and order data from legacy systems (Excel, CSV, old databases) into the Lorenzo Dry Cleaners Firebase system.

### Migration Scope

| Data Type | Source | Target Collection |
|-----------|--------|-------------------|
| Customers | Excel/CSV | `customers` |
| Orders | Excel/CSV | `orders` |
| Order Items | Excel/CSV | Embedded in `orders.garments` |
| Transactions | Excel/CSV | `transactions` |

### Success Criteria

- ✅ All valid records migrated
- ✅ <0.1% data error rate
- ✅ Customer phone numbers normalized
- ✅ Order statuses mapped correctly
- ✅ No duplicate customers
- ✅ Full audit trail maintained

---

## Prerequisites

### Technical Requirements

1. **Node.js** v18+ installed
2. **Firebase Admin SDK** credentials for the target project
3. **Access to legacy data** in supported format (JSON or CSV)
4. **Sufficient disk space** for input files and reports

### Access Requirements

1. Firebase Admin SDK service account file (`*.json`)
2. Read access to legacy data source
3. Write access to target Firestore database

### Environment Setup

```bash
# Clone repository (if not done)
git clone <repository-url>
cd <project-directory>

# Install dependencies
npm install

# Verify Firebase credentials
# Place service account JSON in project root or set environment variable:
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

---

## Data Preparation

### Step 1: Export Legacy Data

Export data from your legacy system in one of these formats:
- **JSON** (preferred) - Array of objects
- **CSV** - With header row

### Step 2: Create Input Directory

```bash
mkdir ./legacy-data
```

### Step 3: Prepare Input Files

Place the following files in `./legacy-data/`:

| File | Required | Description |
|------|----------|-------------|
| `customers.json` | Yes | Customer records |
| `orders.json` | Yes | Order records |
| `garments.json` | No | Garment/item details (optional, can be embedded in orders) |
| `transactions.json` | No | Payment records |

---

## Input File Formats

### customers.json

```json
[
  {
    "name": "John Doe",
    "phone": "0712345678",
    "email": "john@example.com",
    "address": "123 Main St, Nairobi",
    "addressLabel": "Home",
    "legacyId": "C001",
    "totalOrders": 15,
    "totalSpent": 45000,
    "createdAt": "2023-01-15T10:30:00Z"
  }
]
```

**Field Mapping:**

| Legacy Field | Required | Transformation |
|--------------|----------|----------------|
| `name` | Yes | Trimmed |
| `phone` | Yes | Normalized to +254XXXXXXXXX |
| `email` | No | Lowercased |
| `address` | No | Trimmed |
| `legacyId` | No | Stored for reference |
| `totalOrders` | No | Defaults to 0 |
| `totalSpent` | No | Defaults to 0 |
| `createdAt` | No | Defaults to now |

### orders.json

```json
[
  {
    "legacyOrderId": "ORD-001",
    "customerPhone": "0712345678",
    "branchName": "Kilimani",
    "status": "ready",
    "totalAmount": 3500,
    "paidAmount": 2000,
    "paymentStatus": "partial",
    "paymentMethod": "mpesa",
    "createdAt": "2024-01-15T09:00:00Z",
    "completedAt": "2024-01-16T15:00:00Z",
    "collectionMethod": "dropped_off",
    "returnMethod": "delivery_required",
    "deliveryAddress": "456 Oak Ave, Westlands",
    "specialInstructions": "Handle with care"
  }
]
```

**Status Mapping:**

| Legacy Status | Lorenzo Status |
|---------------|----------------|
| new, pending, received | `received` |
| in progress, processing | `washing` |
| ready, ready for pickup | `queued_for_delivery` |
| delivered, complete | `delivered` |
| collected, picked up | `collected` |

### garments.json (Optional)

```json
[
  {
    "legacyOrderId": "ORD-001",
    "type": "Shirt",
    "color": "Blue",
    "brand": "Arrow",
    "services": ["Dry Clean", "Iron"],
    "price": 350,
    "specialInstructions": "Starch collar",
    "damageNotes": "Small stain on front"
  }
]
```

### transactions.json (Optional)

```json
[
  {
    "legacyOrderId": "ORD-001",
    "amount": 2000,
    "method": "mpesa",
    "reference": "QBH7XYZABC",
    "status": "completed",
    "timestamp": "2024-01-15T09:15:00Z"
  }
]
```

---

## Migration Steps

### Step 1: Dry Run (Validation Only)

**ALWAYS run a dry run first** to validate data without importing:

```bash
npx tsx scripts/legacy-data-migration.ts --input ./legacy-data --dry-run
```

This will:
- Validate all input files
- Report validation errors
- Generate `validation-errors.json`
- NOT modify the database

### Step 2: Review Validation Errors

Check `./legacy-data/validation-errors.json` for:
- Invalid phone numbers
- Missing required fields
- Invalid date formats
- Status mapping issues

**Fix issues in source files before proceeding.**

### Step 3: Create Database Backup

Before actual migration, backup the target database:

```bash
# Using Firebase Console
# Go to Firestore > Export to Cloud Storage

# Or using CLI
gcloud firestore export gs://your-bucket/backup-$(date +%Y%m%d)
```

### Step 4: Run Migration

After validation passes and backup is complete:

```bash
npx tsx scripts/legacy-data-migration.ts --input ./legacy-data
```

### Step 5: Verify Migration

Check the migration report:
- `./legacy-data/migration-report.json`

Verify in Firebase Console:
- Customer count matches
- Order count matches
- Sample records look correct

---

## Validation

### Pre-Migration Validation

The migration script validates:

| Field | Validation |
|-------|------------|
| Phone | Kenyan format (+254XXXXXXXXX) |
| Email | Valid email format |
| Dates | ISO 8601 or parseable format |
| Amounts | Non-negative numbers |
| Status | Mapped to valid OrderStatus |

### Post-Migration Validation

```bash
# Run verification script
npx tsx scripts/verify-migration.ts
```

**Manual Checks:**

1. **Customer Count**
   - Legacy: `wc -l customers.json`
   - Firebase: Check Firestore Console

2. **Order Count**
   - Legacy: `wc -l orders.json`
   - Firebase: Check Firestore Console

3. **Sample Verification**
   - Randomly select 10 records
   - Compare legacy vs migrated data

4. **Phone Number Normalization**
   - Verify all phones are +254 format
   - Check for duplicates

---

## Rollback Procedure

### If Migration Fails

1. **Stop the migration** (Ctrl+C if in progress)

2. **Identify affected records** using migration metadata:
   ```javascript
   // In Firebase Console or script
   db.collection('customers')
     .where('_migration.source', '==', 'legacy')
     .where('_migration.migratedAt', '>', lastKnownGoodTimestamp)
   ```

3. **Delete migrated records**:
   ```bash
   npx tsx scripts/rollback-migration.ts --since "2024-01-15T10:00:00Z"
   ```

4. **Restore from backup** if needed:
   ```bash
   gcloud firestore import gs://your-bucket/backup-20240115
   ```

### Rollback Script

Create `scripts/rollback-migration.ts` if needed:

```typescript
// Delete all records with _migration.source === 'legacy'
// Use with caution!
```

---

## Troubleshooting

### Common Issues

#### 1. Invalid Phone Number

**Error:** `Invalid Kenyan phone number`

**Solution:**
- Ensure phone is in format: 0712345678, +254712345678, or 712345678
- Remove any spaces or dashes
- Check for leading zeros

#### 2. Customer Not Found for Order

**Error:** `Cannot find customer for order`

**Solution:**
- Ensure customer with matching phone exists
- Run customer migration first
- Check phone number normalization

#### 3. Invalid Date Format

**Error:** `Invalid date`

**Solution:**
- Use ISO 8601 format: `2024-01-15T10:30:00Z`
- Or standard date: `2024-01-15`
- Avoid Excel date numbers

#### 4. Firebase Permission Denied

**Error:** `PERMISSION_DENIED`

**Solution:**
- Check service account has Firestore write access
- Verify project ID matches
- Check Firestore security rules

#### 5. Out of Memory

**Error:** `JavaScript heap out of memory`

**Solution:**
- Increase Node memory: `NODE_OPTIONS="--max-old-space-size=4096" npx tsx ...`
- Process in smaller batches: `--batch-size 100`
- Split input files

### Debug Mode

For detailed logging:

```bash
DEBUG=migration:* npx tsx scripts/legacy-data-migration.ts --input ./legacy-data
```

---

## Post-Migration Checklist

### Immediate (Within 1 Hour)

- [ ] Migration report shows expected counts
- [ ] No critical errors in report
- [ ] Sample records verified in Firebase Console
- [ ] Application can read migrated data
- [ ] Test order creation for migrated customer

### Short-Term (Within 24 Hours)

- [ ] All staff can access system
- [ ] Orders display correct status
- [ ] Customer search works
- [ ] Payment history correct
- [ ] Reports generate correctly

### Long-Term (Within 1 Week)

- [ ] Legacy system set to read-only
- [ ] Staff trained on new system
- [ ] Edge cases documented
- [ ] Performance acceptable
- [ ] No data quality issues reported

### Documentation

- [ ] Update `migration-report.json` with final counts
- [ ] Document any manual fixes applied
- [ ] Record any data quality issues for future reference
- [ ] Archive legacy data export files

---

## Appendix A: Phone Number Normalization

The migration script handles these phone formats:

| Input | Output |
|-------|--------|
| 0712345678 | +254712345678 |
| +254712345678 | +254712345678 |
| 254712345678 | +254712345678 |
| 712345678 | +254712345678 |

**Invalid formats that will fail:**
- Non-Kenyan numbers (not starting with 7 or 1)
- Numbers with letters
- Numbers shorter than 9 digits

---

## Appendix B: Status Mapping

| Legacy Status | Lorenzo Status | Description |
|---------------|----------------|-------------|
| new | received | Order just created |
| pending | received | Awaiting processing |
| received | received | Items received |
| in progress | washing | Being washed |
| processing | washing | Being processed |
| washing | washing | In wash cycle |
| drying | drying | In dryer |
| ironing | ironing | Being ironed |
| pressing | ironing | Being pressed |
| quality | quality_check | QC inspection |
| qc | quality_check | QC inspection |
| packaging | packaging | Being packaged |
| ready | queued_for_delivery | Ready for customer |
| ready for pickup | queued_for_delivery | Ready for collection |
| out for delivery | out_for_delivery | Being delivered |
| dispatched | out_for_delivery | Driver dispatched |
| delivered | delivered | Successfully delivered |
| complete | delivered | Order complete |
| completed | delivered | Order complete |
| collected | collected | Customer collected |
| picked up | collected | Customer collected |

---

## Appendix C: Contact Information

**Technical Support:**
- Email: support@ai-agentsplus.com
- Phone: +254 725 462 859

**Emergency Contacts:**
- Lead Developer: Jerry Ndururi in collaboration with AI Agents Plus
- POS Support: jerry@ai-agentsplus.com

---

**End of Runbook**
