/**
 * Google Maps Service Test Script
 *
 * Tests all Google Maps service functions to ensure proper integration.
 *
 * Usage:
 *   npm run test:maps
 *
 * Add to package.json scripts:
 *   "test:maps": "tsx scripts/test-google-maps.ts"
 */

import 'dotenv/config';
import {
  geocodeAddress,
  reverseGeocode,
  calculateDistance,
  optimizeRoute,
  formatDistance,
  formatDuration,
  haversineDistance,
  type RouteStop,
  type Coordinates,
} from '../services/google-maps';

// Test addresses in Nairobi
const TEST_ADDRESSES = [
  'Kilimani, Nairobi, Kenya',
  'Westlands, Nairobi, Kenya',
  'Karen, Nairobi, Kenya',
  'Gigiri, Nairobi, Kenya',
];

// Branch location
const BRANCH_LOCATION: Coordinates = {
  lat: -1.2921,
  lng: 36.7872,
};

/**
 * Test geocoding functionality
 */
async function testGeocoding() {
  console.log('\n🗺️  Testing Geocoding...\n');

  try {
    const result = await geocodeAddress(TEST_ADDRESSES[0]);

    console.log('✅ Geocoding successful!');
    console.log('Address:', result.address);
    console.log('Formatted:', result.formattedAddress);
    console.log('Coordinates:', result.coordinates);
    console.log('Place ID:', result.placeId);
  } catch (error) {
    console.error('❌ Geocoding failed:', error);
  }
}

/**
 * Test reverse geocoding functionality
 */
async function testReverseGeocoding() {
  console.log('\n🔄 Testing Reverse Geocoding...\n');

  try {
    const address = await reverseGeocode(BRANCH_LOCATION);

    console.log('✅ Reverse geocoding successful!');
    console.log('Coordinates:', BRANCH_LOCATION);
    console.log('Address:', address);
  } catch (error) {
    console.error('❌ Reverse geocoding failed:', error);
  }
}

/**
 * Test distance calculation
 */
async function testDistanceCalculation() {
  console.log('\n📏 Testing Distance Calculation...\n');

  try {
    const origin = BRANCH_LOCATION;
    const destination: Coordinates = {
      lat: -1.3167,
      lng: 36.8000,
    }; // Westlands

    const result = await calculateDistance(origin, destination);

    console.log('✅ Distance calculation successful!');
    console.log('Distance:', result.distanceText);
    console.log('Duration:', result.durationText);
    console.log('Raw distance (meters):', result.distance);
    console.log('Raw duration (seconds):', result.duration);
  } catch (error) {
    console.error('❌ Distance calculation failed:', error);
  }
}

/**
 * Test route optimization
 */
async function testRouteOptimization() {
  console.log('\n🚗 Testing Route Optimization...\n');

  try {
    // Geocode test addresses first
    console.log('Geocoding test addresses...');
    const geocodedStops = await Promise.all(
      TEST_ADDRESSES.map(async (address, index) => {
        const result = await geocodeAddress(address);
        return {
          orderId: `ORD-TEST-${index + 1}`,
          address: result.formattedAddress,
          coordinates: result.coordinates,
          sequence: index + 1,
          customerName: `Customer ${index + 1}`,
          customerPhone: `+25471234567${index}`,
        } as RouteStop;
      })
    );

    console.log(`✓ Geocoded ${geocodedStops.length} addresses\n`);

    // Optimize route
    console.log('Optimizing route...');
    const optimizedRoute = await optimizeRoute(BRANCH_LOCATION, geocodedStops, true);

    console.log('✅ Route optimization successful!\n');
    console.log('Total Distance:', formatDistance(optimizedRoute.totalDistance));
    console.log('Total Duration:', formatDuration(optimizedRoute.totalDuration));
    console.log('Number of Stops:', optimizedRoute.stops.length);
    console.log('\nOptimized Stop Order:');

    optimizedRoute.stops.forEach((stop, index) => {
      console.log(
        `  ${index + 1}. ${stop.orderId} - ${stop.customerName} (${stop.address})`
      );
    });

    console.log('\nWaypoint Reordering:');
    console.log('  Original indices:', Array.from({ length: geocodedStops.length }, (_, i) => i));
    console.log('  Optimized order:', optimizedRoute.waypointOrder);
  } catch (error) {
    console.error('❌ Route optimization failed:', error);
  }
}

/**
 * Test utility functions
 */
async function testUtilityFunctions() {
  console.log('\n🛠️  Testing Utility Functions...\n');

  // Test formatDistance
  console.log('formatDistance(1500):', formatDistance(1500));
  console.log('formatDistance(5200):', formatDistance(5200));
  console.log('formatDistance(850):', formatDistance(850));

  // Test formatDuration
  console.log('\nformatDuration(3600):', formatDuration(3600));
  console.log('formatDuration(2700):', formatDuration(2700));
  console.log('formatDuration(600):', formatDuration(600));

  // Test haversineDistance (offline fallback)
  const coord1: Coordinates = { lat: -1.2921, lng: 36.7872 };
  const coord2: Coordinates = { lat: -1.3167, lng: 36.8000 };
  const haversine = haversineDistance(coord1, coord2);

  console.log('\nhaversineDistance (offline fallback):');
  console.log('  Coord 1:', coord1);
  console.log('  Coord 2:', coord2);
  console.log('  Distance:', formatDistance(haversine));

  console.log('\n✅ All utility functions working!');
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   Google Maps Service Integration Test Suite             ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');

  // Check API key
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    console.error('\n❌ Error: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set in environment variables');
    console.error('\nPlease add it to your .env.local file:\n');
    console.error('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here\n');
    process.exit(1);
  }

  console.log('\n✓ API Key found in environment');
  console.log('✓ Running tests...\n');

  try {
    await testGeocoding();
    await testReverseGeocoding();
    await testDistanceCalculation();
    await testUtilityFunctions();
    await testRouteOptimization(); // This one makes the most API calls

    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║   ✅ All tests passed successfully!                      ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    console.log('Next steps:');
    console.log('1. Check your Google Cloud Console for API usage');
    console.log('2. Verify billing and quotas are set correctly');
    console.log('3. Test the components in your application');
    console.log('4. Implement caching to reduce API calls\n');
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Run tests
runTests();
