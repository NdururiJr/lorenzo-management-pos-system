# Google Maps Integration - Quick Start Guide

## Setup (5 minutes)

### 1. Enable APIs in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project or create a new one
3. Enable billing (required, but includes $200 free credit/month)
4. Navigate to **APIs & Services > Library**
5. Enable these 5 APIs:
   - ✅ Maps JavaScript API
   - ✅ Directions API
   - ✅ Distance Matrix API
   - ✅ Geocoding API
   - ✅ Places API

### 2. Create and Restrict API Key

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > API Key**
3. Copy the API key
4. Click **Edit API Key** to add restrictions:

   **Application restrictions:**
   - Select "HTTP referrers (web sites)"
   - Add:
     ```
     http://localhost:3000/*
     https://your-domain.com/*
     ```

   **API restrictions:**
   - Select "Restrict key"
   - Check all 5 APIs listed above

5. Click **Save**

### 3. Add to Environment Variables

Add to `.env.local`:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

**Important:** The `NEXT_PUBLIC_` prefix is required for browser access.

### 4. Test the Integration

```bash
npm run test:maps
```

This will test:
- ✅ Geocoding (address → coordinates)
- ✅ Reverse Geocoding (coordinates → address)
- ✅ Distance Calculation
- ✅ Route Optimization
- ✅ Utility Functions

### 5. Set Up Budget Alerts (Recommended)

1. Go to **Billing > Budgets & alerts**
2. Create budget:
   - Name: "Google Maps API Budget"
   - Amount: $50/month (or your preference)
   - Threshold: 50%, 80%, 100%
   - Email alerts: Your email
3. Click **Save**

---

## Usage Examples

### Geocode an Address

```typescript
import { geocodeAddress } from '@/services/google-maps';

const result = await geocodeAddress('Kilimani, Nairobi, Kenya');
console.log(result.coordinates); // { lat: -1.2921, lng: 36.7872 }
```

### Calculate Distance

```typescript
import { calculateDistance } from '@/services/google-maps';

const result = await calculateDistance(
  { lat: -1.2921, lng: 36.7872 }, // Origin
  { lat: -1.3167, lng: 36.8000 }  // Destination
);

console.log(result.distanceText); // "3.5 km"
console.log(result.durationText); // "10 mins"
```

### Optimize Delivery Route

```typescript
import { optimizeRoute } from '@/services/google-maps';

const branchLocation = { lat: -1.2921, lng: 36.7872 };

const stops = [
  {
    orderId: 'ORD-001',
    address: 'Westlands, Nairobi',
    coordinates: { lat: -1.3167, lng: 36.8000 },
    sequence: 1,
  },
  {
    orderId: 'ORD-002',
    address: 'Karen, Nairobi',
    coordinates: { lat: -1.3200, lng: 36.7000 },
    sequence: 2,
  },
  // ... up to 25 stops
];

const route = await optimizeRoute(branchLocation, stops);

console.log(route.stops); // Reordered for optimal route
console.log(route.totalDistance); // Total meters
console.log(route.totalDuration); // Total seconds
```

### Use in React Component

```tsx
import { DeliveryMapView } from '@/components/features/deliveries/DeliveryMapView';

<DeliveryMapView
  startLocation={{ lat: -1.2921, lng: 36.7872 }}
  stops={deliveryStops}
  polyline={optimizedRoute?.polyline}
/>
```

---

## Cost Estimates

Based on average dry cleaning business with 50 deliveries/day:

| API | Usage | Monthly Requests | Cost |
|-----|-------|------------------|------|
| Geocoding | 50 new addresses/day | ~1,500 | $0 (under free tier) |
| Route Optimization | 10 batches/day | ~300 | $1.50 |
| Distance Matrix | Minimal | ~500 | $2.50 |
| Maps Display | Customer tracking | ~1,000 | $0 (under free tier) |
| **Total** | | | **~$4/month** |

**Free tier:** $200 credit/month covers ~40,000 requests

---

## Cost Optimization Tips

### 1. Cache Geocoded Addresses

```typescript
// Store in Firestore after first geocoding
const geocoded = await geocodeAddress(address);

await updateDoc(customerRef, {
  'addresses.coordinates': geocoded.coordinates
});

// Reuse on subsequent deliveries
if (address.coordinates) {
  // Use cached
} else {
  // Geocode
}
```

### 2. Batch Requests

```typescript
// ❌ Bad: 10 individual requests
for (const address of addresses) {
  await geocodeAddress(address);
}

// ✅ Good: 1 batch request
const results = await batchGeocodeAddresses(addresses);
```

### 3. Limit Route Optimization

Only optimize when:
- Creating new delivery batch
- User manually clicks "Optimize"
- Significant changes (not on every keystroke)

---

## Troubleshooting

### Map not loading?

1. Check API key in `.env.local`
2. Restart dev server: `npm run dev`
3. Check browser console for errors
4. Verify Maps JavaScript API is enabled

### "OVER_QUERY_LIMIT" error?

1. Check quotas in Google Cloud Console
2. Set usage limits to prevent overages
3. Implement request throttling
4. Review and optimize API calls

### Address autocomplete not working?

1. Ensure Places API is enabled
2. Check API key restrictions
3. Verify browser console for errors

---

## Next Steps

1. ✅ Run tests: `npm run test:maps`
2. ✅ Test in development: http://localhost:3000/deliveries
3. ✅ Create a test delivery batch
4. ✅ Optimize a route
5. ✅ Monitor usage in Google Cloud Console
6. ✅ Set up budget alerts

---

## Support

- **Documentation:** `/docs/GOOGLE_MAPS_INTEGRATION.md`
- **Google Maps Docs:** https://developers.google.com/maps
- **Development Team:** Jerry Ndururi in collaboration with AI Agents Plus

---

**Estimated Setup Time:** 5-10 minutes
**Monthly Cost:** $0-10 (usually under free tier)
**Difficulty:** Beginner-friendly ⭐⭐☆☆☆
