# Dev Login Setup Guide

## 🚀 Quick Start

The Dev Login feature allows you to bypass the normal authentication process during development for faster testing and iteration.

## Setup Instructions

### Step 1: One-Time Setup

Visit the development setup page to create your dev user:

```
http://localhost:3000/setup-dev
```

This page will:
- Create a Firebase Authentication user with the dev credentials
- Create a user document in Firestore with admin role
- Redirect you to the login page

### Step 2: Use Dev Quick Login

After setup, you'll see a **"🚀 Dev Quick Login"** button on the login page:

```
http://localhost:3000/login
```

Click this button to instantly log in with admin privileges.

## Configuration

The dev login credentials are configured in your `.env.local` file:

```env
# Dev Login Credentials (Only for Development - DO NOT USE IN PRODUCTION)
NEXT_PUBLIC_DEV_LOGIN_EMAIL=dev@lorenzo.com
NEXT_PUBLIC_DEV_LOGIN_PASSWORD=DevPass123!
```

### Customizing Credentials

You can change these credentials by:

1. Updating the values in `.env.local`
2. Restarting your development server
3. Re-running the setup at `/setup-dev`

## Features

### ✅ What's Included

- **One-Click Login**: Skip entering credentials every time
- **Admin Access**: Dev user has full admin privileges
- **Auto-Created**: User is automatically created in Firebase
- **Development Only**: Only works when `NODE_ENV=development`
- **Visual Indicator**: Dashed border button makes it clear it's a dev feature

### 🔒 Security Features

- **Development Only**: The dev login button only appears in development mode
- **Environment-Based**: Uses environment variables for configuration
- **Production Safe**: Completely disabled in production builds
- **Clear Visual**: Distinct styling prevents accidental use

## User Details

The default dev user has the following properties:

```typescript
{
  email: "dev@lorenzo.com",
  password: "DevPass123!",
  name: "Dev Admin",
  role: "admin",
  branchId: "main-branch",
  active: true
}
```

## Troubleshooting

### Button Doesn't Appear

**Problem**: The "Dev Quick Login" button is not visible on the login page.

**Solutions**:
1. Check that `NODE_ENV=development` in your `.env.local`
2. Verify `NEXT_PUBLIC_DEV_LOGIN_EMAIL` and `NEXT_PUBLIC_DEV_LOGIN_PASSWORD` are set
3. Restart your development server: `npm run dev`
4. Hard refresh your browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

### "Dev user already exists" Error

**Problem**: Setup page shows user already exists.

**Solution**: This is actually good! It means setup is complete. Just click "Go to Login" and use the Dev Quick Login button.

### Firebase Not Initialized

**Problem**: Error about Firebase not being initialized.

**Solutions**:
1. Ensure all Firebase environment variables are set in `.env.local`
2. Restart the development server
3. Check the browser console for specific Firebase errors

### "Dev login credentials not configured"

**Problem**: Error when clicking Dev Quick Login button.

**Solutions**:
1. Check `.env.local` has `NEXT_PUBLIC_DEV_LOGIN_EMAIL` and `NEXT_PUBLIC_DEV_LOGIN_PASSWORD`
2. Restart the development server
3. Clear browser cache and reload

## File Structure

The dev login feature consists of these files:

```
lorenzo-dry-cleaners/
├── .env.local                          # Dev credentials configuration
├── .env.example                        # Template with dev credentials
├── app/
│   └── (auth)/
│       ├── login/page.tsx             # Login page with Dev Quick Login button
│       └── setup-dev/page.tsx         # One-time setup page
└── DEV_LOGIN_SETUP.md                 # This file
```

## Best Practices

### ✅ Do

- Use dev login for rapid development and testing
- Keep dev credentials simple and memorable
- Document any changes to dev credentials with your team
- Use the setup page after cloning the repo

### ❌ Don't

- Use dev credentials in production
- Commit sensitive production credentials to `.env.local`
- Share dev credentials outside your development team
- Rely on dev login for security testing

## Production Deployment

When deploying to production:

1. **Environment Variables**: Production should have `NODE_ENV=production`
2. **No Dev Credentials**: Don't set `NEXT_PUBLIC_DEV_LOGIN_EMAIL` or `NEXT_PUBLIC_DEV_LOGIN_PASSWORD`
3. **Build Check**: Dev login code is tree-shaken out in production builds
4. **Testing**: Always test login flow with real credentials in staging

## Quick Reference

| Action | URL | Description |
|--------|-----|-------------|
| Setup Dev User | `/setup-dev` | One-time user creation |
| Dev Login | `/login` → "Dev Quick Login" button | Quick admin login |
| Normal Login | `/login` | Standard authentication |

## FAQs

### Q: Will this work in production?

**A**: No. The dev login button and setup page only appear when `NODE_ENV=development`. They are completely disabled in production.

### Q: Can I change the dev user role?

**A**: Yes. Edit the `createDevUser` function in `app/(auth)/setup-dev/page.tsx` and change the `role` field to `'manager'`, `'front_desk'`, etc.

### Q: How do I create multiple test users?

**A**: You can:
1. Manually create users in Firebase Console
2. Use the Firebase Admin SDK seed script (see `scripts/seed-dev-user.ts`)
3. Create additional setup pages for different roles

### Q: Is this secure?

**A**: For development, yes. The credentials are only used locally and the feature is disabled in production. Never use these credentials for production data.

## Need Help?

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review the browser console for errors
3. Check Firebase configuration in `.env.local`
4. Restart the development server
5. Contact the development team

---

**Last Updated**: October 10, 2025
**Applies To**: Development environment only
