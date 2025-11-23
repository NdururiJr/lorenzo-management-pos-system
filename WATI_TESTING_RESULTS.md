# Wati.io WhatsApp Integration - Testing Results

**Date**: November 23, 2025
**Status**: ✅ **SUCCESSFUL** - Integration tested and working
**Notification ID**: `8Br9ymsvNqRnPMGWcRQq`
**Test Phone**: +254725462859

---

## Summary

The Wati.io WhatsApp integration has been successfully configured and tested. A test message was sent using the `onboarding_signoff` template and delivered successfully to the test phone number.

---

## Configuration Details Discovered

During testing, we identified the correct configuration format:

### 1. API Endpoint URL Format

**Correct Format**:
```bash
WATI_API_ENDPOINT=https://live-mt-server.wati.io/1051875
```

**Key Points**:
- Must include the full URL with instance ID at the end (`/1051875`)
- URL uses `live-mt-server` (not just `live-server`)
- Different Wati accounts may use different server names - copy exactly from dashboard

**Common Mistakes**:
- ❌ `https://live-server.wati.io` (missing instance ID)
- ❌ `https://live-server.wati.io/1051875` (wrong server name)

### 2. Access Token Format

**Correct Format**:
```bash
WATI_ACCESS_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Key Points**:
- Must NOT include the word "Bearer"
- Copy only the JWT token itself
- No leading or trailing spaces

**Common Mistakes**:
- ❌ `Bearer eyJhbGci...` (includes "Bearer" prefix)
- ❌ `"eyJhbGci..."` (includes quotes)

---

## Issues Encountered and Resolved

### Issue 1: 404 Not Found
**Cause**: API endpoint URL was missing the instance ID
**Solution**: Added `/1051875` to the end of the URL

### Issue 2: 404 Not Found (Second occurrence)
**Cause**: Used `live-server` instead of `live-mt-server`
**Solution**: Changed URL to use `live-mt-server` as shown in Wati dashboard

### Issue 3: 401 Unauthorized
**Cause**: Access token included "Bearer" prefix
**Solution**: Removed "Bearer " from the token in `.env.local`

### Issue 4: API Access Disabled
**Observation**: Padlock icons appeared on API endpoints in dashboard
**Note**: Trial account had API access enabled by default

---

## Testing Process

### Test Script Used
```bash
npx tsx scripts/test-wati-custom-template.ts
```

### Template Used
- **Name**: `onboarding_signoff`
- **Category**: Marketing
- **Language**: English
- **Parameters**: 4 (name, dashboard_url, tenant_id, username)

### Test Parameters
```javascript
{
  name: 'Gachengoh',
  dashboard_url: 'https://app.wati.io/dashboard',
  tenant_id: '1051875',
  username: 'gachengoh@lorenzo.com'
}
```

### Result
✅ **Success**
- Message sent successfully on first attempt
- Notification logged to Firestore
- WhatsApp message delivered to test phone

---

## Key Learnings

1. **Template Parameters Must Match Exactly**:
   - If template has 4 parameters, must provide exactly 4 values
   - Parameter names must match template variable names

2. **Instance ID is Critical**:
   - Each Wati account has a unique instance ID
   - Must be included in the API endpoint URL

3. **Server Name Varies**:
   - Some accounts use `live-mt-server`
   - Others use `live-server`
   - Always copy exact URL from dashboard

4. **Authentication Format**:
   - Wati API expects JWT token without "Bearer" prefix
   - Our code adds "Bearer " automatically

5. **Trial Account Limitations**:
   - Trial period: 4 days
   - API access included in trial
   - Must subscribe to paid plan before trial expires

---

## Files Updated

1. **[services/wati.ts](services/wati.ts)**
   - Fixed Timestamp import (use firebase-admin, not firebase/firestore)
   - Added undefined value filtering for Firestore
   - Made config reading dynamic (not cached at module load)

2. **[docs/WATI_SETUP.md](docs/WATI_SETUP.md)**
   - Updated API credential instructions
   - Added detailed configuration notes
   - Enhanced troubleshooting section with 404/401 errors
   - Added trial account information

3. **[.env.example](.env.example)**
   - Updated with correct URL format
   - Added important configuration notes
   - Clarified "Bearer" token format

4. **Test Scripts Created**:
   - `scripts/test-wati-custom-template.ts` - Test with existing templates
   - `scripts/test-wati-debug.ts` - Detailed API debugging
   - `scripts/test-wati-no-instance.ts` - URL format testing

---

## Next Steps

### Immediate (Before Trial Expires)
1. ✅ Test integration - **COMPLETED**
2. ⏳ Subscribe to paid Wati plan (before 4-day trial ends)
3. ⏳ Create 6 order-related templates
4. ⏳ Submit templates for WhatsApp approval (24-48 hours)

### Order Templates to Create
1. `order_confirmation` - When order is created at POS
2. `order_ready` - When order status changes to "ready"
3. `driver_dispatched` - When delivery route is created
4. `driver_nearby` - When driver is ~5 minutes away
5. `order_delivered` - When delivery is confirmed
6. `payment_reminder` - For unpaid orders (scheduled)

### Integration Tasks
1. Add `sendOrderConfirmation()` to POS order creation
2. Add `sendOrderReady()` to pipeline status updates
3. Add `sendDriverDispatched()` to delivery workflow
4. Add `sendDriverNearby()` to location tracking
5. Add `sendDelivered()` to delivery confirmation
6. Create Cloud Function for payment reminders

---

## Verification Checklist

- [x] Environment variables configured correctly
- [x] Wati.io connection test passes
- [x] Test message sent successfully
- [x] Message delivered to WhatsApp
- [x] Notification logged to Firestore
- [x] Phone number validation works
- [x] Error handling tested
- [x] Documentation updated
- [ ] All 6 templates created (pending)
- [ ] Templates approved by WhatsApp (pending)
- [ ] Integrated into order workflow (pending)
- [ ] Paid subscription activated (pending)

---

## Support Information

### Wati.io Support
- **Email**: support@wati.io
- **Dashboard**: Live chat available
- **Docs**: https://docs.wati.io

### Project Team
- **Developer**: AI Agents Plus
- **Email**: hello@ai-agentsplus.com
- **Phone**: +254 725 462 859

---

## Monitoring

### Check Notification Logs
```bash
# View notifications in Firestore Console
Collection: notifications
Filter: status == 'sent' OR status == 'failed'
```

### Test Commands
```bash
# Basic connection test
npm run test:wati

# Send test message
npx tsx scripts/test-wati-custom-template.ts

# Debug API calls
npx tsx scripts/test-wati-debug.ts
```

---

**Tested By**: AI Development Team
**Approved By**: Gachengoh Marugu
**Integration Status**: ✅ Ready for production use (pending template approvals)
