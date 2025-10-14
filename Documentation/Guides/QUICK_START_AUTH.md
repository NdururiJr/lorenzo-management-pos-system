# Authentication System - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies (Already Done)
```bash
npm install
```

### 2. Configure Firebase

Create `.env.local` in the project root:
```env
# Get these from Firebase Console > Project Settings
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Get this from Firebase Console > Project Settings > Service Accounts
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
```

### 3. Enable Firebase Authentication

In Firebase Console:
1. Go to **Authentication**
2. Click **Get Started**
3. Enable **Email/Password** sign-in method
4. Click **Save**

### 4. Create Firestore Database

In Firebase Console:
1. Go to **Firestore Database**
2. Click **Create Database**
3. Choose **Start in test mode** (for development)
4. Select your region
5. Click **Enable**

### 5. Start Development Server

```bash
npm run dev
```

Visit: `http://localhost:3000`

## ✅ Test the System

### Test Staff Login

1. **Create a Test User** (use Firebase Console or `/register` page):
   ```
   Email: test@lorenzo.com
   Password: Test@1234
   Role: admin
   Branch: branch-001
   ```

2. **Login**:
   - Go to `http://localhost:3000`
   - Click "Staff Login"
   - Enter credentials above
   - Click "Sign In"
   - Should redirect to `/dashboard`

### Test Customer Login

1. **Try Phone OTP**:
   - Go to `http://localhost:3000`
   - Click "Customer Login"
   - Enter: `+254712345678`
   - Click "Send OTP"

2. **Verify OTP**:
   - Check browser console for OTP (6 digits)
   - Enter OTP code
   - Should redirect to `/dashboard`

## 📁 Project Structure

```
lorenzo-dry-cleaners/
├── app/
│   ├── (auth)/                    # Authentication routes
│   │   ├── login/                 # Staff login
│   │   ├── customer-login/        # Customer phone login
│   │   ├── verify-otp/            # OTP verification
│   │   ├── forgot-password/       # Password reset
│   │   ├── register/              # Staff registration
│   │   ├── actions.ts             # Server actions
│   │   └── layout.tsx             # Auth layout
│   ├── (dashboard)/               # Protected routes
│   │   ├── dashboard/             # Dashboard home
│   │   └── layout.tsx             # Dashboard layout
│   └── page.tsx                   # Landing page
├── components/
│   ├── auth/
│   │   └── AuthProvider.tsx       # Auth context wrapper
│   ├── forms/
│   │   ├── LoginForm.tsx          # Email/password form
│   │   └── PhoneLoginForm.tsx     # Phone number form
│   └── providers/
│       └── QueryProvider.tsx      # React Query provider
├── contexts/
│   └── AuthContext.tsx            # Auth context & state
├── hooks/
│   └── useAuth.ts                 # Auth hook
├── lib/
│   ├── auth/
│   │   └── utils.ts               # Auth utilities
│   ├── validations/
│   │   └── auth.ts                # Zod schemas
│   ├── firebase.ts                # Firebase client
│   └── firebase-admin.ts          # Firebase admin
└── middleware.ts                  # Route protection
```

## 🔑 Key Files to Know

### For Developers

**Authentication Logic:**
- `contexts/AuthContext.tsx` - Main auth state
- `hooks/useAuth.ts` - Access auth in components
- `app/(auth)/actions.ts` - Server-side auth operations

**Routes:**
- `middleware.ts` - Protects routes
- `app/(dashboard)/layout.tsx` - Dashboard protection

**Forms:**
- `lib/validations/auth.ts` - All validation rules
- `components/forms/` - Reusable form components

### For Testing

**Test Pages:**
- `http://localhost:3000/login` - Staff login
- `http://localhost:3000/customer-login` - Customer login
- `http://localhost:3000/register` - Staff registration
- `http://localhost:3000/dashboard` - Protected dashboard

**Check Console:**
- OTP codes appear in browser console
- Password reset links appear in browser console

## 🛠️ Common Tasks

### Create a Test Admin User

**Option 1: Using Firebase Console**
1. Go to Authentication > Users
2. Click "Add User"
3. Enter email and password
4. Go to Firestore > users collection
5. Add document with user UID:
   ```json
   {
     "uid": "user_uid_from_auth",
     "email": "admin@lorenzo.com",
     "name": "Admin User",
     "phone": "+254700000000",
     "role": "admin",
     "branchId": "branch-001",
     "isActive": true,
     "createdAt": "timestamp",
     "updatedAt": "timestamp"
   }
   ```

**Option 2: Using Registration Page**
1. Go to `/register`
2. Fill in all fields
3. Click "Register Staff Member"

### Add New Protected Route

1. Create page in `app/(dashboard)/your-page/page.tsx`
2. It's automatically protected by middleware
3. Use `useAuth()` hook to access user data

Example:
```tsx
'use client';
import { useAuth } from '@/hooks/useAuth';

export default function YourPage() {
  const { user, userData, isAdmin } = useAuth();

  return (
    <div>
      <h1>Hello, {userData?.name}</h1>
      {isAdmin && <AdminFeature />}
    </div>
  );
}
```

### Check User Role

```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { userData, isAdmin, isStaff, checkRole } = useAuth();

  // Check specific role
  if (checkRole('manager')) {
    // Manager only feature
  }

  // Check multiple roles
  if (isStaff) {
    // Any staff member
  }

  // Current role
  console.log(userData?.role); // 'admin', 'manager', etc.
}
```

### Sign Out User

```tsx
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

function SignOutButton() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  return <button onClick={handleSignOut}>Sign Out</button>;
}
```

## 🐛 Troubleshooting

### "Firebase app not initialized"
**Fix**: Check that `.env.local` exists and has all Firebase variables

### "User not found" after login
**Fix**: Make sure Firestore user document is created for the user

### OTP not appearing
**Fix**: Check browser console - OTPs are logged there in development

### Redirect loop on dashboard
**Fix**: Clear cookies and localStorage, then refresh

### TypeScript errors
**Fix**: Run `npm run type-check` to see errors

### Can't access protected route
**Fix**: Make sure you're logged in and cookie is set

## 📚 Next Steps

After testing authentication:

1. **Add More User Fields** - Edit `lib/auth/utils.ts` UserData interface
2. **Customize Dashboard** - Edit `app/(dashboard)/dashboard/page.tsx`
3. **Add More Roles** - Edit `lib/validations/auth.ts` userRoles array
4. **Create More Pages** - Add to `app/(dashboard)/` directory
5. **Integrate SMS** - Update `app/(auth)/actions.ts` signInWithPhone
6. **Integrate Email** - Update `app/(auth)/actions.ts` sendPasswordReset

## 🔐 Security Reminders

### Development
- Test mode Firestore rules are **permissive**
- OTPs in console are **not secure**
- Use strong passwords even in dev

### Before Production
- [ ] Set up Firestore security rules
- [ ] Enable Firebase App Check
- [ ] Integrate real SMS service
- [ ] Integrate real email service
- [ ] Enable rate limiting
- [ ] Set up monitoring
- [ ] Audit security

## 📞 Need Help?

1. Check `AUTHENTICATION_SETUP.md` for detailed testing guide
2. Check `AUTHENTICATION_IMPLEMENTATION_SUMMARY.md` for technical details
3. Review browser console for errors
4. Check Firebase Console for auth/database issues

## ✨ Features Available

- ✅ Staff email/password login
- ✅ Customer phone OTP login
- ✅ Password reset
- ✅ Staff registration
- ✅ Protected dashboard
- ✅ Role-based access control
- ✅ Session management
- ✅ Form validation
- ✅ Mobile responsive
- ✅ Accessibility compliant

---

**Ready to build!** Start by testing the authentication flow, then proceed to build your business features on top of this secure foundation.
