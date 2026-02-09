# Firebase Backup & Restore Guide

**Lorenzo Dry Cleaners POS System**

This guide covers backing up and restoring the Firestore database and Cloud Storage files.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Creating Backups](#creating-backups)
4. [Restoring Backups](#restoring-backups)
5. [Automated Backups](#automated-backups)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

1. **gcloud CLI** - Google Cloud command-line tool
   ```bash
   # Download and install from:
   # https://cloud.google.com/sdk/docs/install

   # Verify installation
   gcloud --version
   ```

2. **Firebase CLI** - Already installed in this project
   ```bash
   # Verify installation
   firebase --version
   ```

### Authentication

```bash
# 1. Login to Google Cloud
gcloud auth login

# 2. Set the project
gcloud config set project lorenzo-dry-cleaners-7302f

# 3. Login to Firebase (if needed)
firebase login
```

---

## Quick Start

### Create a Backup

```bash
# Simple backup with timestamp
./scripts/backup-database.sh

# Named backup (e.g., before cleanup)
./scripts/backup-database.sh pre-cleanup

# Or using gcloud directly
gcloud firestore export gs://lorenzo-dry-cleaners-7302f.appspot.com/firestore-exports/backup-$(date +%Y%m%d-%H%M%S) \
  --project=lorenzo-dry-cleaners-7302f
```

### List Backups

```bash
# Using the script
./scripts/backup-database.sh --list

# Or using gsutil directly
gsutil ls -l gs://lorenzo-dry-cleaners-7302f.appspot.com/firestore-exports/
```

### Restore a Backup

```bash
# Using the script (interactive confirmation)
./scripts/backup-database.sh --restore gs://lorenzo-dry-cleaners-7302f.appspot.com/firestore-exports/backup-20260207-143000

# Or using gcloud directly
gcloud firestore import gs://lorenzo-dry-cleaners-7302f.appspot.com/firestore-exports/backup-20260207-143000 \
  --project=lorenzo-dry-cleaners-7302f
```

---

## Creating Backups

### Manual Backup

**Before major operations** (cleanup, migration, schema changes):

```bash
# 1. Create a descriptive backup
./scripts/backup-database.sh pre-cleanup

# 2. Wait for completion (check status)
gcloud firestore operations list --project=lorenzo-dry-cleaners-7302f

# 3. Verify backup exists
gsutil ls -lh gs://lorenzo-dry-cleaners-7302f.appspot.com/firestore-exports/
```

### Backup Before Running Cleanup Script

**Recommended workflow:**

```bash
# Step 1: Create backup
./scripts/backup-database.sh pre-cleanup-$(date +%Y%m%d)

# Step 2: Wait for backup to complete (check operations)
gcloud firestore operations list --project=lorenzo-dry-cleaners-7302f

# Step 3: Run cleanup in dry-run mode
npx tsx scripts/cleanup-test-data.ts --dry-run

# Step 4: Review dry-run output

# Step 5: Run actual cleanup
npx tsx scripts/cleanup-test-data.ts --confirm

# Step 6: Verify cleanup
firebase firestore:get customers --project=lorenzo-dry-cleaners-7302f
```

### What Gets Backed Up

Firestore export includes:
- ✅ All collections and documents
- ✅ Document metadata (created dates, etc.)
- ✅ Collection structure
- ❌ Firebase Auth users (separate backup needed)
- ❌ Cloud Storage files (separate backup needed)

---

## Restoring Backups

### Full Database Restore

⚠️ **WARNING**: Restoring overwrites ALL current data!

```bash
# 1. List available backups
./scripts/backup-database.sh --list

# 2. Choose a backup and restore
./scripts/backup-database.sh --restore gs://lorenzo-dry-cleaners-7302f.appspot.com/firestore-exports/pre-cleanup-20260207

# 3. Confirm when prompted (type 'yes')

# 4. Wait for restore to complete
gcloud firestore operations list --project=lorenzo-dry-cleaners-7302f

# 5. Verify data
firebase firestore:get customers --project=lorenzo-dry-cleaners-7302f
```

### Partial Restore (Specific Collections)

To restore only specific collections, use the Firebase Admin SDK:

```typescript
// scripts/restore-collection.ts
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

async function restoreCollection(collectionName: string, backupFile: string) {
  const db = getFirestore();
  const data = JSON.parse(readFileSync(backupFile, 'utf-8'));

  const batch = db.batch();
  let count = 0;

  for (const item of data) {
    const docRef = db.collection(collectionName).doc(item.id);
    batch.set(docRef, item.data);
    count++;

    if (count >= 500) {
      await batch.commit();
      count = 0;
    }
  }

  if (count > 0) {
    await batch.commit();
  }

  console.log(`Restored ${data.length} documents to ${collectionName}`);
}
```

---

## Automated Backups

### Schedule Daily Backups

Using Cloud Scheduler (recommended for production):

```bash
# 1. Enable Cloud Scheduler API
gcloud services enable cloudscheduler.googleapis.com

# 2. Create a scheduled export (daily at 2 AM)
gcloud firestore operations list --project=lorenzo-dry-cleaners-7302f

# 3. Set up Cloud Scheduler job
gcloud scheduler jobs create http firestore-daily-backup \
  --schedule="0 2 * * *" \
  --uri="https://firestore.googleapis.com/v1/projects/lorenzo-dry-cleaners-7302f/databases/(default):exportDocuments" \
  --message-body='{
    "outputUriPrefix": "gs://lorenzo-dry-cleaners-7302f.appspot.com/firestore-exports/scheduled/backup-$(date +%Y%m%d)",
    "collectionIds": []
  }' \
  --oauth-service-account-email=firebase-adminsdk@lorenzo-dry-cleaners-7302f.iam.gserviceaccount.com
```

### Retention Policy

Automatically delete old backups:

```bash
# Keep only last 30 days of backups
gsutil -m rm -r gs://lorenzo-dry-cleaners-7302f.appspot.com/firestore-exports/backup-$(date -d '31 days ago' +%Y%m%d)*
```

---

## Backup Firebase Auth Users

Firestore backups DO NOT include Firebase Auth users. Backup separately:

### Export Auth Users

```bash
# Install Firebase Admin SDK CLI
npm install -g firebase-admin-cli

# Export users to JSON
firebase auth:export users-backup-$(date +%Y%m%d).json --project=lorenzo-dry-cleaners-7302f
```

### Restore Auth Users

```bash
# Import users from JSON
firebase auth:import users-backup-20260207.json --project=lorenzo-dry-cleaners-7302f --hash-algo=SCRYPT
```

---

## Backup Cloud Storage Files

### Export Storage Files

```bash
# Download all storage files
gsutil -m cp -r gs://lorenzo-dry-cleaners-7302f.appspot.com/garments ./storage-backup/garments
gsutil -m cp -r gs://lorenzo-dry-cleaners-7302f.appspot.com/documents ./storage-backup/documents
gsutil -m cp -r gs://lorenzo-dry-cleaners-7302f.appspot.com/profiles ./storage-backup/profiles
```

### Restore Storage Files

```bash
# Upload files back to storage
gsutil -m cp -r ./storage-backup/garments/* gs://lorenzo-dry-cleaners-7302f.appspot.com/garments/
gsutil -m cp -r ./storage-backup/documents/* gs://lorenzo-dry-cleaners-7302f.appspot.com/documents/
gsutil -m cp -r ./storage-backup/profiles/* gs://lorenzo-dry-cleaners-7302f.appspot.com/profiles/
```

---

## Troubleshooting

### Common Issues

#### 1. "Permission denied" when creating backup

**Solution**: Ensure you're authenticated and have the right permissions

```bash
# Re-authenticate
gcloud auth login

# Set project
gcloud config set project lorenzo-dry-cleaners-7302f

# Verify permissions
gcloud projects get-iam-policy lorenzo-dry-cleaners-7302f \
  --flatten="bindings[].members" \
  --filter="bindings.members:user:$(gcloud config get-value account)"
```

#### 2. "Bucket does not exist"

**Solution**: Verify the bucket name and create if needed

```bash
# List buckets
gsutil ls

# Create bucket if missing
gsutil mb -p lorenzo-dry-cleaners-7302f -l us-central1 gs://lorenzo-dry-cleaners-7302f.appspot.com
```

#### 3. "Operation takes too long"

**Solution**: Exports are async and may take time for large databases

```bash
# Check operation status
gcloud firestore operations list --project=lorenzo-dry-cleaners-7302f

# Get specific operation details
gcloud firestore operations describe <operation-name> --project=lorenzo-dry-cleaners-7302f
```

#### 4. "Restore failed - data still exists"

**Solution**: Firestore import does not delete existing data first

```bash
# Option 1: Delete specific collections first
firebase firestore:delete --all-collections --project=lorenzo-dry-cleaners-7302f

# Option 2: Restore to a different database
# (requires creating a new Firestore database)
```

### Verification After Restore

```bash
# Count documents in key collections
firebase firestore:get customers --limit=10 --project=lorenzo-dry-cleaners-7302f
firebase firestore:get orders --limit=10 --project=lorenzo-dry-cleaners-7302f
firebase firestore:get users --limit=10 --project=lorenzo-dry-cleaners-7302f

# Or use Admin SDK script
npx tsx scripts/verify-backup.ts
```

---

## Best Practices

### Before Major Operations

1. ✅ Create a named backup: `./scripts/backup-database.sh pre-cleanup`
2. ✅ Wait for backup to complete
3. ✅ Verify backup exists in Cloud Storage
4. ✅ Test restoration in development environment first
5. ✅ Keep backup for at least 30 days

### Regular Backup Schedule

- **Daily**: Automated backup at 2 AM (low-traffic time)
- **Before Cleanup**: Manual backup with descriptive name
- **Before Schema Changes**: Manual backup
- **Monthly**: Full export including Auth users and Storage files
- **Retention**: Keep 30 days of daily backups, 12 months of monthly backups

### Backup Checklist

- [ ] Firestore database exported
- [ ] Firebase Auth users exported
- [ ] Cloud Storage files backed up
- [ ] Backup verified (can list files)
- [ ] Backup location documented
- [ ] Team notified of backup completion

---

## Emergency Recovery

If something goes wrong during cleanup or operations:

```bash
# 1. STOP all operations immediately
# Cancel any running scripts

# 2. Check if backup exists
./scripts/backup-database.sh --list

# 3. Restore from most recent backup
./scripts/backup-database.sh --restore gs://lorenzo-dry-cleaners-7302f.appspot.com/firestore-exports/pre-cleanup-20260207

# 4. Wait for restore to complete
gcloud firestore operations list --project=lorenzo-dry-cleaners-7302f

# 5. Verify data integrity
npx tsx scripts/verify-backup.ts

# 6. Notify team
```

---

## Additional Resources

- [Firebase Firestore Export/Import Documentation](https://firebase.google.com/docs/firestore/manage-data/export-import)
- [gcloud CLI Reference](https://cloud.google.com/sdk/gcloud/reference/firestore)
- [Cloud Storage gsutil Documentation](https://cloud.google.com/storage/docs/gsutil)
- [Firebase Auth Export/Import](https://firebase.google.com/docs/cli/auth)

---

**Last Updated**: February 7, 2026
**Maintainer**: Lorenzo IT Team
**Project**: lorenzo-dry-cleaners-7302f
