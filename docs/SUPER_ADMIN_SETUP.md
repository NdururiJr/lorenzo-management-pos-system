# Super Admin Setup Guide

## Quick Setup for dev@lorenzo.com

The `dev@lorenzo.com` account is pre-configured as a **Super Admin** with full system access.

### Step 1: Run the Seed Script

```bash
npm run seed:dev
```

This will:
- ✅ Create or update `dev@lorenzo.com` account in Firebase Auth
- ✅ Set password to `DevPass123!` (or from env var)
- ✅ Set `isSuperAdmin: true` in Firestore user document
- ✅ Set custom claims: `{ role: 'admin', isSuperAdmin: true, branchAccess: [] }`
- ✅ Grant access to **ALL branches** system-wide

### Step 2: Login

**Email:** `dev@lorenzo.com`
**Password:** `DevPass123!`

### Step 3: Verify Super Admin Access

After logging in, verify the account has super admin privileges:

```typescript
// In any component
const { userData, isSuperAdmin, allowedBranches } = useAuth();

console.log('Super Admin:', isSuperAdmin); // Should be: true
console.log('Allowed Branches:', allowedBranches); // Should be: null (= all branches)
```

---

## Creating Additional Super Admins

### Option 1: Using Firebase Admin SDK (Recommended)

Create a script or Cloud Function to promote existing users:

```typescript
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

async function promoteToSuperAdmin(email: string) {
  const auth = getAuth();
  const db = getFirestore();

  // Get user by email
  const user = await auth.getUserByEmail(email);

  // Update Firestore document
  await db.collection('users').doc(user.uid).update({
    isSuperAdmin: true,
    branchAccess: [],
    updatedAt: new Date(),
  });

  // Update custom claims
  await auth.setCustomUserClaims(user.uid, {
    role: 'admin',
    branchId: null,
    branchAccess: [],
    isSuperAdmin: true,
  });

  console.log(`✅ ${email} is now a Super Admin`);
}

// Usage
promoteToSuperAdmin('admin@lorenzo.com');
```

### Option 2: Manual Setup in Firebase Console

1. **Update Firestore Document** (`users/{uid}`):
   ```json
   {
     "role": "admin",
     "branchId": null,
     "branchAccess": [],
     "isSuperAdmin": true,
     "active": true
   }
   ```

2. **Set Custom Claims** (requires Admin SDK):
   ```bash
   firebase functions:shell
   ```

   Then in the shell:
   ```javascript
   const admin = require('firebase-admin');
   admin.auth().setCustomUserClaims('USER_UID', {
     role: 'admin',
     branchId: null,
     branchAccess: [],
     isSuperAdmin: true
   });
   ```

3. **Force Token Refresh**:
   User must log out and log back in for claims to take effect.

---

## Super Admin Permissions

A super admin account has the following privileges:

### Branch Access
- ✅ Can access **ALL branches** (no restrictions)
- ✅ `allowedBranches` returns `null` (meaning all)
- ✅ `canAccessBranch(anyBranchId)` always returns `true`

### Firestore Security Rules
- ✅ Bypass all branch-scoped restrictions
- ✅ Read/write all documents in all collections
- ✅ Create/update/delete users
- ✅ Manage branches (create, update, delete)
- ✅ Access audit logs for all branches

### UI Capabilities (once implemented)
- ✅ See "All Branches" option in branch selector
- ✅ View and manage all orders system-wide
- ✅ Access all inventory items
- ✅ Approve transfers between any branches
- ✅ View all audit logs
- ✅ Manage user roles and permissions

### What Super Admin CANNOT Do
- ❌ Cannot be restricted by normal branch rules
- ❌ Cannot escalate other users to super admin (requires manual admin action)

---

## Security Best Practices

### 1. Limit Super Admin Accounts
- Only create super admins for trusted administrators
- Typically: 1-2 accounts maximum
- Use multi-factor authentication (MFA) when available

### 2. Audit Super Admin Actions
All super admin actions are logged in the `auditLogs` collection with:
- User ID and name
- Action performed
- Timestamp
- Branch(es) affected
- Before/after snapshots

### 3. Regular Reviews
- Review super admin access quarterly
- Remove super admin status when no longer needed
- Monitor audit logs for unusual activity

### 4. Development vs Production
- Use `dev@lorenzo.com` ONLY in development
- Create separate super admin accounts for production
- Use strong, unique passwords (minimum 16 characters)
- Store credentials securely (password manager, not in code)

---

## Troubleshooting

### Issue: User has isSuperAdmin but still sees branch restrictions

**Solution:**
Custom claims are cached by Firebase Auth. Force token refresh:

```typescript
// Client-side
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const user = auth.currentUser;

if (user) {
  await user.getIdToken(true); // Force refresh
  window.location.reload(); // Reload to pick up new claims
}
```

### Issue: Firestore rules still deny super admin access

**Solution:**
Verify the rules are deployed:

```bash
firebase deploy --only firestore:rules
```

Check the rules use `isSuperAdmin()` function:
```javascript
function isSuperAdmin() {
  return isAuthenticated() && request.auth.token.get('isSuperAdmin', false) == true;
}
```

### Issue: Script fails with authentication error

**Solution:**
Ensure Firebase Admin credentials are set:

```bash
# Check .env.local has:
FIREBASE_SERVICE_ACCOUNT_KEY="{...json...}"

# Or use default credentials:
firebase login
```

---

## Testing Super Admin Access

### Test 1: Branch Access
```typescript
const { isSuperAdmin, allowedBranches, canAccessBranch } = useAuth();

// Should be true
assert(isSuperAdmin === true);

// Should be null (all branches)
assert(allowedBranches === null);

// Should work for any branch
assert(canAccessBranch('branch-A') === true);
assert(canAccessBranch('branch-B') === true);
assert(canAccessBranch('any-branch-id') === true);
```

### Test 2: Firestore Access
```typescript
import { collection, getDocs } from 'firebase/firestore';
import { getDbInstance } from '@/lib/firebase';

const db = getDbInstance();

// Super admin should read all branches
const branchesSnap = await getDocs(collection(db, 'branches'));
console.log('Accessible branches:', branchesSnap.size); // Should be ALL branches

// Super admin should read all orders
const ordersSnap = await getDocs(collection(db, 'orders'));
console.log('Accessible orders:', ordersSnap.size); // Should be ALL orders
```

### Test 3: UI Components
1. Login as super admin
2. Navigate to branches page
3. Verify all branches are visible
4. Navigate to orders page
5. Verify orders from all branches are visible
6. Check branch selector shows "All Branches" option

---

## Related Documentation

- [BRANCH_ACCESS.md](./BRANCH_ACCESS.md) - Branch-scoped RBAC specification
- [BRANCH_ACCESS_IMPLEMENTATION.md](./BRANCH_ACCESS_IMPLEMENTATION.md) - Implementation details
- [scripts/seed-dev-user.ts](../scripts/seed-dev-user.ts) - Seed script source code

---

**Last Updated:** November 21, 2025
