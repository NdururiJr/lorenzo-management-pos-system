# Google Maps Integration Guide

## Overview

This document provides a comprehensive guide to the Google Maps Platform integration in the Lorenzo Dry Cleaners application.

## Table of Contents

1. [Setup](#setup)
2. [Features](#features)
3. [Service Functions](#service-functions)
4. [React Components](#react-components)
5. [Usage Examples](#usage-examples)
6. [Cost Optimization](#cost-optimization)
7. [Troubleshooting](#troubleshooting)

---

## Setup

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable billing for the project
4. Enable the following APIs:
   - **Maps JavaScript API** (for map display)
   - **Directions API** (for route planning)
   - **Distance Matrix API** (for distance calculations)
   - **Geocoding API** (for address conversion)
   - **Places API** (for address autocomplete)

### 2. Create API Key

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > API Key**
3. Copy the API key
4. Click **Edit API Key** to add restrictions:
   - **Application restrictions**: HTTP referrers
   - Add your domains:
     - `http://localhost:3000/*` (development)
     - `https://your-production-domain.com/*` (production)
   - **API restrictions**: Restrict key to selected APIs
   - Select all 5 APIs listed above

### 3. Environment Variables

Add the API key to your `.env.local` file:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

**Important:** The `NEXT_PUBLIC_` prefix makes it available in the browser.

### 4. Pricing & Quotas

- **Free tier:** $200 credit per month (enough for ~40,000 geocoding requests)
- **Geocoding API:** $5 per 1,000 requests (after free credit)
- **Directions API:** $5 per 1,000 requests
- **Distance Matrix API:** $5 per 1,000 elements
- **Maps JavaScript API:** $7 per 1,000 map loads
- **Places API (Autocomplete):** $2.83 per 1,000 requests

**Recommended:** Set a budget alert in Google Cloud Console to avoid unexpected charges.

---

## Features

### Implemented Features

- ✅ **Geocoding**: Convert addresses to latitude/longitude coordinates
- ✅ **Reverse Geocoding**: Convert coordinates to addresses
- ✅ **Distance Calculation**: Calculate distance and duration between points
- ✅ **Route Optimization**: Optimize delivery routes using TSP algorithm
- ✅ **Directions**: Get turn-by-turn directions
- ✅ **Address Autocomplete**: Real-time address suggestions as user types
- ✅ **Interactive Map**: Display delivery routes with markers
- ✅ **Batch Geocoding**: Geocode multiple addresses at once
- ✅ **Offline Fallback**: Haversine distance calculation when API unavailable

### Key Capabilities

1. **Route Optimization**
   - Automatically reorder delivery stops for minimum time/distance
   - Supports up to 25 stops per route (Google Maps limit)
   - Considers real-time traffic conditions
   - Displays total distance and estimated time

2. **Address Management**
   - Geocode and cache customer addresses
   - Validate addresses before saving
   - Support for Kenyan addresses (region bias)

3. **Delivery Tracking**
   - Display delivery route on interactive map
   - Show stop sequence and customer details
   - Calculate ETA for each stop

---

## Service Functions

### Location: `/services/google-maps.ts`

#### Geocoding Functions

##### `geocodeAddress(address: string): Promise<GeocodedAddress>`

Convert an address string to coordinates.

```typescript
import { geocodeAddress } from '@/services/google-maps';

const result = await geocodeAddress('Kilimani, Nairobi, Kenya');
console.log(result);
// {
//   address: 'Kilimani, Nairobi, Kenya',
//   coordinates: { lat: -1.2921, lng: 36.7872 },
//   formattedAddress: 'Kilimani, Nairobi, Kenya',
//   placeId: 'ChIJ...'
// }
```

##### `reverseGeocode(coordinates: Coordinates): Promise<string>`

Convert coordinates to an address.

```typescript
import { reverseGeocode } from '@/services/google-maps';

const address = await reverseGeocode({ lat: -1.2921, lng: 36.7872 });
console.log(address); // "Kilimani, Nairobi, Kenya"
```

##### `batchGeocodeAddresses(addresses: string[]): Promise<GeocodedAddress[]>`

Geocode multiple addresses at once.

```typescript
import { batchGeocodeAddresses } from '@/services/google-maps';

const addresses = [
  'Kilimani, Nairobi',
  'Westlands, Nairobi',
  'Karen, Nairobi'
];

const results = await batchGeocodeAddresses(addresses);
console.log(results.length); // 3 (if all successful)
```

#### Distance Calculation Functions

##### `calculateDistance(origin: Coordinates, destination: Coordinates): Promise<DistanceMatrixResult>`

Calculate distance and duration between two points.

```typescript
import { calculateDistance } from '@/services/google-maps';

const result = await calculateDistance(
  { lat: -1.2921, lng: 36.7872 }, // Kilimani
  { lat: -1.3167, lng: 36.8000 }  // Westlands
);

console.log(result);
// {
//   distance: 3500, // meters
//   duration: 600,  // seconds (10 minutes)
//   distanceText: '3.5 km',
//   durationText: '10 mins'
// }
```

##### `calculateDistanceMatrix(origins: Coordinates[], destinations: Coordinates[]): Promise<DistanceMatrixResult[][]>`

Calculate distances for multiple origin-destination pairs.

```typescript
import { calculateDistanceMatrix } from '@/services/google-maps';

const origins = [
  { lat: -1.2921, lng: 36.7872 }, // Branch
];

const destinations = [
  { lat: -1.3167, lng: 36.8000 }, // Stop 1
  { lat: -1.2500, lng: 36.7700 }, // Stop 2
];

const matrix = await calculateDistanceMatrix(origins, destinations);
console.log(matrix[0][0].distanceText); // "3.5 km" (Branch to Stop 1)
console.log(matrix[0][1].distanceText); // "5.2 km" (Branch to Stop 2)
```

#### Route Optimization Functions

##### `optimizeRoute(startLocation: Coordinates, stops: RouteStop[], returnToStart?: boolean): Promise<OptimizedRoute>`

Optimize delivery route for multiple stops.

```typescript
import { optimizeRoute } from '@/services/google-maps';

const branchLocation = { lat: -1.2921, lng: 36.7872 };

const stops = [
  {
    orderId: 'ORD-001',
    address: 'Westlands, Nairobi',
    coordinates: { lat: -1.3167, lng: 36.8000 },
    sequence: 1,
    customerName: 'John Doe',
    customerPhone: '+254712345678'
  },
  {
    orderId: 'ORD-002',
    address: 'Karen, Nairobi',
    coordinates: { lat: -1.3200, lng: 36.7000 },
    sequence: 2,
    customerName: 'Jane Smith',
    customerPhone: '+254798765432'
  },
  // ... up to 25 stops
];

const optimizedRoute = await optimizeRoute(branchLocation, stops, true);

console.log(optimizedRoute);
// {
//   stops: [...], // Reordered stops for optimal route
//   totalDistance: 15000, // meters
//   totalDuration: 1800,  // seconds (30 minutes)
//   polyline: 'encoded_polyline_string',
//   waypointOrder: [1, 0] // Original indices in optimized order
// }
```

#### Utility Functions

##### `formatDistance(meters: number): string`

Format distance in meters to human-readable format.

```typescript
import { formatDistance } from '@/services/google-maps';

console.log(formatDistance(1500));  // "1.5 km"
console.log(formatDistance(850));   // "850 m"
```

##### `formatDuration(seconds: number): string`

Format duration in seconds to human-readable format.

```typescript
import { formatDuration } from '@/services/google-maps';

console.log(formatDuration(3600));  // "1h 0m"
console.log(formatDuration(2700));  // "45 mins"
```

##### `calculateETA(durationSeconds: number): Date`

Calculate estimated time of arrival.

```typescript
import { calculateETA } from '@/services/google-maps';

const eta = calculateETA(1800); // 30 minutes
console.log(eta); // Date object 30 minutes from now
```

##### `haversineDistance(coord1: Coordinates, coord2: Coordinates): number`

Calculate distance using Haversine formula (offline fallback).

```typescript
import { haversineDistance } from '@/services/google-maps';

const distance = haversineDistance(
  { lat: -1.2921, lng: 36.7872 },
  { lat: -1.3167, lng: 36.8000 }
);

console.log(distance); // ~3500 (meters)
```

---

## React Components

### 1. DeliveryMapView

**Location:** `/components/features/deliveries/DeliveryMapView.tsx`

Interactive Google Map showing delivery route with markers and polyline.

**Props:**
- `stops: RouteStop[]` - Array of delivery stops
- `startLocation: Coordinates` - Starting point (branch)
- `polyline?: string` - Encoded polyline for route
- `viewOnly?: boolean` - View-only mode (no navigation)
- `onNavigate?: (stop: RouteStop) => void` - Navigation callback

**Usage:**
```tsx
import { DeliveryMapView } from '@/components/features/deliveries/DeliveryMapView';

<DeliveryMapView
  startLocation={{ lat: -1.2921, lng: 36.7872 }}
  stops={deliveryStops}
  polyline={optimizedRoute?.polyline}
  onNavigate={(stop) => {
    // Handle navigation to stop
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${stop.coordinates.lat},${stop.coordinates.lng}`,
      '_blank'
    );
  }}
/>
```

### 2. RouteOptimizer

**Location:** `/components/features/deliveries/RouteOptimizer.tsx`

UI for optimizing delivery routes with metrics display.

**Props:**
- `startLocation: Coordinates` - Starting point
- `stops: RouteStop[]` - Stops to optimize
- `returnToStart?: boolean` - Return to start (default: true)
- `onRouteOptimized?: (route: OptimizedRoute) => void` - Callback
- `onStopsReordered?: (stops: RouteStop[]) => void` - Callback

**Usage:**
```tsx
import { RouteOptimizer } from '@/components/features/deliveries/RouteOptimizer';

<RouteOptimizer
  startLocation={branchLocation}
  stops={deliveryStops}
  returnToStart={true}
  onRouteOptimized={(route) => {
    console.log('Total distance:', formatDistance(route.totalDistance));
    console.log('Total time:', formatDuration(route.totalDuration));
  }}
  onStopsReordered={(reorderedStops) => {
    setDeliveryStops(reorderedStops);
  }}
/>
```

### 3. AddressAutocomplete

**Location:** `/components/features/deliveries/AddressAutocomplete.tsx`

Google Places autocomplete for address input.

**Props:**
- `label?: string` - Input label
- `placeholder?: string` - Input placeholder
- `value?: string` - Initial value
- `onAddressSelect: (address: string, coordinates: Coordinates) => void` - Callback
- `required?: boolean` - Required field
- `error?: string` - Error message
- `country?: string` - Country code (default: 'ke')

**Usage:**
```tsx
import { AddressAutocomplete } from '@/components/features/deliveries/AddressAutocomplete';

<AddressAutocomplete
  label="Delivery Address"
  placeholder="Enter delivery address..."
  onAddressSelect={(address, coordinates) => {
    console.log('Selected:', address, coordinates);
    // Save to order
  }}
  required={true}
  country="ke"
/>
```

---

## Usage Examples

### Example 1: Create Delivery Batch with Route Optimization

```typescript
import { optimizeRoute, geocodeAddress } from '@/services/google-maps';
import { createDelivery } from '@/lib/db/deliveries';

async function createOptimizedDeliveryBatch(orderIds: string[]) {
  // 1. Fetch orders and their addresses
  const orders = await Promise.all(orderIds.map(id => getOrder(id)));

  // 2. Geocode addresses (if not already geocoded)
  const stops = await Promise.all(
    orders.map(async (order, index) => {
      const address = order.deliveryAddress;

      let coordinates = address.coordinates;
      if (!coordinates) {
        const geocoded = await geocodeAddress(address.address);
        coordinates = geocoded.coordinates;
      }

      return {
        orderId: order.orderId,
        address: address.address,
        coordinates,
        sequence: index + 1,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
      };
    })
  );

  // 3. Optimize route
  const branchLocation = { lat: -1.2921, lng: 36.7872 };
  const optimizedRoute = await optimizeRoute(branchLocation, stops, true);

  // 4. Create delivery batch
  const deliveryId = generateDeliveryId();
  await createDelivery({
    deliveryId,
    driverId: selectedDriverId,
    orders: orderIds,
    route: {
      optimized: true,
      stops: optimizedRoute.stops.map(stop => ({
        ...stop,
        status: 'pending'
      })),
      distance: optimizedRoute.totalDistance,
      estimatedDuration: optimizedRoute.totalDuration,
    },
    status: 'pending',
    scheduledDate: Timestamp.now(),
  });

  console.log('Delivery batch created with optimized route!');
  console.log('Total distance:', formatDistance(optimizedRoute.totalDistance));
  console.log('Estimated time:', formatDuration(optimizedRoute.totalDuration));
}
```

### Example 2: Geocode and Save Customer Address

```typescript
import { geocodeAddress } from '@/services/google-maps';
import { updateCustomer } from '@/lib/db/customers';

async function saveCustomerAddress(customerId: string, addressString: string) {
  try {
    // Geocode the address
    const geocoded = await geocodeAddress(addressString);

    // Save to customer profile
    await updateCustomer(customerId, {
      addresses: [
        {
          label: 'Home',
          address: geocoded.formattedAddress,
          coordinates: geocoded.coordinates,
          source: 'google_autocomplete',
        },
      ],
    });

    console.log('Address saved successfully!');
  } catch (error) {
    console.error('Failed to geocode address:', error);
    throw error;
  }
}
```

### Example 3: Calculate ETA for Delivery

```typescript
import { calculateDistance, calculateETA, formatDuration } from '@/services/google-maps';

async function calculateDeliveryETA(
  driverLocation: Coordinates,
  deliveryAddress: Coordinates
) {
  // Calculate distance and duration
  const result = await calculateDistance(driverLocation, deliveryAddress);

  // Calculate ETA
  const eta = calculateETA(result.duration);

  console.log('Distance:', result.distanceText);
  console.log('Time:', result.durationText);
  console.log('ETA:', eta.toLocaleTimeString());

  // Send notification if driver is nearby (< 5 minutes)
  if (result.duration < 300) {
    await sendDriverNearbyNotification(customerId);
  }

  return eta;
}
```

---

## Cost Optimization

### 1. Caching Geocoded Addresses

Store geocoded coordinates in Firestore to avoid redundant API calls:

```typescript
// Check if address is already geocoded
const customer = await getCustomer(customerId);
const existingAddress = customer.addresses.find(a => a.address === addressString);

if (existingAddress?.coordinates) {
  // Use cached coordinates
  return existingAddress.coordinates;
} else {
  // Geocode and cache
  const geocoded = await geocodeAddress(addressString);
  await updateCustomer(customerId, {
    addresses: [
      ...customer.addresses,
      {
        label: 'New Address',
        address: geocoded.formattedAddress,
        coordinates: geocoded.coordinates,
      },
    ],
  });
  return geocoded.coordinates;
}
```

### 2. Batch Requests

Use batch functions instead of individual requests:

```typescript
// ❌ Bad: Multiple individual requests
for (const address of addresses) {
  await geocodeAddress(address);
}

// ✅ Good: Single batch request
const results = await batchGeocodeAddresses(addresses);
```

### 3. Limit Route Optimization Calls

Only call route optimization when:
- Creating a new delivery batch
- Manually requested by user
- Significant changes to delivery stops

Don't call on every render or minor change.

### 4. Use Distance Matrix Wisely

Distance Matrix API charges per element (origin × destination):

```typescript
// ❌ Expensive: 5 origins × 10 destinations = 50 elements = $0.25
await calculateDistanceMatrix(
  [origin1, origin2, origin3, origin4, origin5],
  [dest1, dest2, ..., dest10]
);

// ✅ Cheaper: 1 origin × 10 destinations = 10 elements = $0.05
await calculateDistanceMatrix(
  [branchLocation],
  allDestinations
);
```

### 5. Monitor API Usage

Set up monitoring and alerts:

1. Go to Google Cloud Console
2. Navigate to **APIs & Services > Dashboard**
3. Click on each API to view usage
4. Set up budget alerts:
   - **Billing > Budget & alerts**
   - Set threshold (e.g., $50/month)
   - Enable email alerts

---

## Troubleshooting

### Issue: "Google Maps API key not configured"

**Solution:**
1. Check `.env.local` file has `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
2. Restart dev server: `npm run dev`
3. Clear browser cache

### Issue: Map not loading

**Solutions:**
1. Check API key restrictions allow your domain
2. Ensure Maps JavaScript API is enabled
3. Check browser console for errors
4. Verify billing is enabled on Google Cloud

### Issue: Geocoding returns ZERO_RESULTS

**Solutions:**
1. Check address format (try more specific)
2. Verify Geocoding API is enabled
3. Try reverse geocoding with coordinates
4. Check API quota hasn't been exceeded

### Issue: Route optimization fails with "Maximum 25 waypoints exceeded"

**Solution:**
Split route into multiple batches:

```typescript
import { splitIntoBatches } from '@/services/google-maps';

if (stops.length > 25) {
  const batches = splitIntoBatches(stops, 25);

  for (const batch of batches) {
    const optimizedBatch = await optimizeRoute(branchLocation, batch);
    // Create separate delivery for each batch
  }
}
```

### Issue: Address autocomplete not working

**Solutions:**
1. Ensure Places API is enabled
2. Check API key restrictions
3. Verify component restrictions allow your country
4. Check browser console for errors

### Issue: High API costs

**Solutions:**
1. Implement caching (see Cost Optimization)
2. Set usage quotas in Google Cloud Console
3. Review and optimize API calls
4. Consider alternative for high-frequency operations

---

## Additional Resources

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Geocoding API Documentation](https://developers.google.com/maps/documentation/geocoding)
- [Directions API Documentation](https://developers.google.com/maps/documentation/directions)
- [Distance Matrix API Documentation](https://developers.google.com/maps/documentation/distance-matrix)
- [Places API Documentation](https://developers.google.com/maps/documentation/places)
- [React Google Maps API](https://react-google-maps-api-docs.netlify.app/)

---

## Support

For issues or questions:
- **Technical Team:** hello@ai-agentsplus.com
- **GitHub Issues:** [Repository Issues](https://github.com/ai-agentsplus/lorenzo-dry-cleaners/issues)
- **Google Maps Support:** [Google Maps Platform Support](https://developers.google.com/maps/support)

---

**Last Updated:** November 14, 2025
**Version:** 1.0.0
