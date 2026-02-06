# Test Accounts - Lorenzo Dry Cleaners

**Date Created:** 2025-11-21
**Purpose:** Testing role-based dashboard and branch-scoped access control

---

## Overview

These test accounts have been created for testing branch manager functionality. Each account represents a branch manager for a specific Lorenzo Dry Cleaners location.

**Universal Password:** `DevPass123!`

---

## Super Admin Account

For testing system-wide access:

| Email | Password | Role | Access |
|-------|----------|------|--------|
| dev@lorenzo.com | DevPass123! | Super Admin | All branches + system settings |

---

## Branch Manager Test Accounts

Each branch manager has access to their specific branch only:

| Email | Branch Name | Branch ID | Password |
|-------|-------------|-----------|----------|
| adlife-plaza-mezzanine-flr@lorenzo.com | Adlife Plaza Mezzanine Flr | ADLIFE | DevPass123! |
| arboretum-shell@lorenzo.com | Arboretum Shell | ARBORETUM | DevPass123! |
| bomas-rubis-petrol@lorenzo.com | Bomas Rubis Petrol | BOMAS | DevPass123! |
| dennis-pritt-rd@lorenzo.com | Dennis Pritt Rd | DENNIS_PRITT | DevPass123! |
| langata-freedom-heights-ground-floor@lorenzo.com | Langata Freedom Heights (Ground Floor) | FREEDOM_HEIGHTS | DevPass123! |
| greenpark-arcadia@lorenzo.com | Greenpark- Arcadia | GREENPARK | DevPass123! |
| hurlingham-quickmart@lorenzo.com | Hurlingham Quickmart | HURLINGHAM | DevPass123! |
| imara-imara-mall-ground-floor@lorenzo.com | Imara - Imara Mall Ground Floor | IMARA | DevPass123! |
| kileleshwa-quickmart@lorenzo.com | Kileleshwa Quickmart | KILELESHWA | DevPass123! |
| langata-kobil-1st-floor@lorenzo.com | Langata Kobil- 1st Floor | LANGATA_KOBIL | DevPass123! |
| lavington-legend-valley-mall@lorenzo.com | Lavington Legend Valley Mall | LAVINGTON | DevPass123! |
| lorenzo-dry-cleaners-kilimani@lorenzo.com | Lorenzo Dry Cleaners - Kilimani | MAIN | DevPass123! |
| muthaiga-mini-market@lorenzo.com | Muthaiga Mini Market | MUTHAIGA | DevPass123! |
| karen-my-town-mall-opp-karen-hosp@lorenzo.com | Karen - My Town Mall Opp Karen Hospital | MYTOWN_KAREN | DevPass123! |
| naivas-kilimani-mall-ground-floor@lorenzo.com | Naivas Kilimani Mall (Ground Floor) | NAIVAS_KILIMANI | DevPass123! |
| nextgen-mall-south-c-ground-floor@lorenzo.com | Nextgen Mall- South C (Ground Floor) | NEXTGEN_SOUTH_C | DevPass123! |
| ngong-shell-kerarapon@lorenzo.com | Ngong Shell Kerarapon | NGONG_SHELL | DevPass123! |
| kilimani-shujah-mall-opposite-adlife@lorenzo.com | Kilimani - Shujah Mall Opposite Adlife | SHUJAH_MALL | DevPass123! |
| south-c-naivas-south-c@lorenzo.com | South C Naivas- South C | SOUTH_C_NAIVAS | DevPass123! |
| village-market-courtyard@lorenzo.com | Village Market Courtyard | VILLAGE_MARKET | DevPass123! |
| waterfront-karen-ground-floor@lorenzo.com | Waterfront Karen (Ground Floor) | WATERFRONT_KAREN | DevPass123! |
| westgate-mall-2nd-floor@lorenzo.com | Westgate Mall 2nd Floor | WESTGATE | DevPass123! |

---

## What to Test

### 1. Branch Manager Login
- Login with any branch manager account
- Verify you see the branch name displayed under your name in the sidebar (e.g., "Adlife Plaza Mezzanine Flr")
- Verify you do NOT see the "Branches" navigation item

### 2. Branch-Scoped Access
- Check dashboard statistics show only your branch's data
- Try to access another branch's detail page → should be redirected
- Verify deliveries page shows only your branch's orders

### 3. Navigation Visibility
**Branch Manager should see:**
- Dashboard
- Orders (+ Create Order, Pipeline)
- Workstation
- Customers
- Deliveries
- Inventory
- Reports
- Staff
- Pricing
- Transactions
- Settings

**Branch Manager should NOT see:**
- Branches (this is super admin only)

### 4. Super Admin Login
- Login with `dev@lorenzo.com`
- Verify you see "All branches" in the sidebar
- Verify you CAN see the "Branches" navigation item
- Verify dashboard shows data from all branches
- Verify you can access any branch detail page

### 5. Cross-Branch Access Test
1. Login as branch manager for "Adlife Plaza"
2. Note the dashboard statistics (orders count, revenue, etc.)
3. Try to navigate to another branch's detail page (e.g., `/branches/ARBORETUM`)
4. Verify you are redirected or denied access
5. Logout
6. Login as branch manager for "Arboretum Shell"
7. Verify you see different statistics (specific to Arboretum branch)

---

## Testing Checklist

### Branch Context Display
- [ ] Super admin shows "All branches"
- [ ] Branch manager shows actual branch name (e.g., "Adlife Plaza Mezzanine Flr")
- [ ] Branch name appears with store icon in user dropdown

### Navigation Visibility
- [ ] Super admin sees "Branches" nav item
- [ ] Branch manager does NOT see "Branches" nav item
- [ ] All appropriate nav items visible per role

### Data Scoping
- [ ] Dashboard stats filtered by branch for managers
- [ ] Dashboard stats show all data for super admin
- [ ] Deliveries page filtered by branch
- [ ] Cannot access unauthorized branch detail pages

### Audit Access
- [ ] Branch manager can view audit tab on their own branch detail
- [ ] Branch manager cannot view audit for other branches

---

## Troubleshooting

**Cannot login?**
- Verify you're using the exact email and password: `DevPass123!`
- Check that Firebase Authentication is running
- Clear browser cache and try again

**Not seeing branch name?**
- Check browser console for errors
- Verify branch data exists in Firestore
- Check that `branchId` is set on user document

**Seeing wrong data?**
- Logout and login again
- Clear browser cache
- Verify custom claims are set correctly

---

## Security Note

**IMPORTANT:** These are test accounts for development/staging only. Do NOT use these credentials in production. All accounts use the same password for easy testing - this is intentional for development but should never be done in production.

---

## Contact

For issues or questions about these test accounts:
- **Development Team** - Jerry Ndururi in collaboration with AI Agents Plus, +254 725 462 859
- **Jerry Nduriri** - jerry@ai-agentsplus.com, +254 725 462 859

---

**Generated:** 2025-11-21
**Script Used:** `npm run seed:branch-trials`
**Total Accounts:** 22 branch managers + 1 super admin
