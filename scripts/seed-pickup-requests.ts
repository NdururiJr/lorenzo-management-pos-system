/**
 * Seed Pickup Requests Script
 *
 * Populates customer pickup requests for delivery scheduling
 * Creates pickup requests in various statuses
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountKey) {
      try {
        const serviceAccount = JSON.parse(serviceAccountKey);
        initializeApp({ credential: cert(serviceAccount) });
      } catch (error) {
        console.error('Failed to parse service account key');
        initializeApp();
      }
    } else {
      initializeApp();
    }
  }
}

type PickupStatus = 'pending' | 'confirmed' | 'assigned' | 'in_transit' | 'completed' | 'cancelled';
type TimeSlot = 'morning' | 'afternoon' | 'evening';

interface Address {
  label: string;
  address: string;
  coordinates: { lat: number; lng: number };
}

interface PickupRequest {
  requestId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  branchId: string;
  address: Address;
  preferredDate: string;
  preferredTimeSlot: TimeSlot;
  status: PickupStatus;
  assignedDriverId?: string;
  assignedDriverName?: string;
  estimatedPickupTime?: string;
  notes?: string;
  garmentDescription?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
}

// Nairobi area addresses with coordinates
const nairobiAddresses: Address[] = [
  { label: 'Home', address: '123 Kilimani Road, Kilimani', coordinates: { lat: -1.2864, lng: 36.7853 } },
  { label: 'Office', address: 'Westlands Business Park, Westlands', coordinates: { lat: -1.2673, lng: 36.8088 } },
  { label: 'Home', address: '45 Riverside Drive, Riverside', coordinates: { lat: -1.2708, lng: 36.8037 } },
  { label: 'Home', address: 'Karen Plains, Karen', coordinates: { lat: -1.3226, lng: 36.7111 } },
  { label: 'Office', address: 'ABC Place, Waiyaki Way', coordinates: { lat: -1.2582, lng: 36.7584 } },
  { label: 'Home', address: 'Runda Estate, Runda', coordinates: { lat: -1.2108, lng: 36.8227 } },
  { label: 'Home', address: '78 Muthaiga Road, Muthaiga', coordinates: { lat: -1.2481, lng: 36.8353 } },
  { label: 'Office', address: 'Village Market, Gigiri', coordinates: { lat: -1.2329, lng: 36.8027 } },
  { label: 'Home', address: 'Lavington Green, Lavington', coordinates: { lat: -1.2778, lng: 36.7728 } },
  { label: 'Home', address: '90 Kileleshwa Ring Road, Kileleshwa', coordinates: { lat: -1.2769, lng: 36.7797 } },
  { label: 'Office', address: 'Delta Towers, Upper Hill', coordinates: { lat: -1.2947, lng: 36.8175 } },
  { label: 'Home', address: 'Hurlingham Court, Hurlingham', coordinates: { lat: -1.2881, lng: 36.7867 } },
  { label: 'Home', address: 'Spring Valley Estate, Spring Valley', coordinates: { lat: -1.2389, lng: 36.7756 } },
  { label: 'Office', address: 'Sarit Centre, Westlands', coordinates: { lat: -1.2632, lng: 36.8029 } },
  { label: 'Home', address: 'Garden Estate, Thika Road', coordinates: { lat: -1.2156, lng: 36.8621 } },
];

// Mock customers
const mockCustomers = [
  { id: 'cust-pickup-001', name: 'John Kamau', phone: '+254712345001' },
  { id: 'cust-pickup-002', name: 'Mary Wanjiku', phone: '+254712345002' },
  { id: 'cust-pickup-003', name: 'Peter Ochieng', phone: '+254712345003' },
  { id: 'cust-pickup-004', name: 'Grace Nyambura', phone: '+254712345004' },
  { id: 'cust-pickup-005', name: 'David Mwangi', phone: '+254712345005' },
  { id: 'cust-pickup-006', name: 'Sarah Akinyi', phone: '+254712345006' },
  { id: 'cust-pickup-007', name: 'James Otieno', phone: '+254712345007' },
  { id: 'cust-pickup-008', name: 'Elizabeth Chebet', phone: '+254712345008' },
  { id: 'cust-pickup-009', name: 'Michael Kosgei', phone: '+254712345009' },
  { id: 'cust-pickup-010', name: 'Nancy Moraa', phone: '+254712345010' },
];

// Drivers for assignment
const drivers = [
  { id: 'driver-001', name: 'Samuel Kipchoge' },
  { id: 'driver-002', name: 'Daniel Wanyama' },
  { id: 'driver-003', name: 'Victor Ouma' },
];

// Branches
const branches = [
  'VILLAGE_MARKET',
  'WESTGATE',
  'DENNIS_PRITT',
  'NAIVAS_KILIMANI',
  'LAVINGTON',
  'WATERFRONT_KAREN',
];

// Status distribution
const statusDistribution: Record<PickupStatus, number> = {
  pending: 6,      // 6 pending
  confirmed: 4,    // 4 confirmed
  assigned: 3,     // 3 assigned to drivers
  in_transit: 2,   // 2 being picked up now
  completed: 7,    // 7 completed (history)
  cancelled: 3,    // 3 cancelled
};

// Garment descriptions
const garmentDescriptions = [
  '2 suits, 3 shirts',
  '5 shirts for dry cleaning',
  'Wedding dress - handle with care',
  '4 dresses and 2 jackets',
  'Corporate uniforms x10',
  'Bedding set - duvet and pillows',
  'Leather jacket and suede shoes',
  '3 trousers and 5 shirts',
  'Party dress with sequins',
  'Curtains - 2 sets',
];

// Notes
const notes = [
  'Please call before arriving',
  'Gate code: 1234',
  'Apartment 5B, 2nd floor',
  'Leave with security if not home',
  'Weekend pickup preferred',
  'Handle with extra care - delicate items',
  'Corporate account - invoice separately',
];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getDateOffset(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function generateRequestId(index: number): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  return `PICKUP-${dateStr}-${String(index).padStart(4, '0')}`;
}

async function seedPickupRequests() {
  console.log('🚚 Seeding pickup request data...\n');

  try {
    initializeFirebaseAdmin();
    const db = getFirestore();

    let created = 0;
    let updated = 0;
    let requestIndex = 1;

    const statusCounts: Record<PickupStatus, number> = {
      pending: 0,
      confirmed: 0,
      assigned: 0,
      in_transit: 0,
      completed: 0,
      cancelled: 0,
    };

    for (const [status, count] of Object.entries(statusDistribution)) {
      console.log(`\n📋 Creating ${count} ${status} pickup requests...`);

      for (let i = 0; i < count; i++) {
        const requestId = generateRequestId(requestIndex++);
        const requestRef = db.collection('pickupRequests').doc(requestId);
        const existingDoc = await requestRef.get();

        const now = Timestamp.now();
        const customer = getRandomElement(mockCustomers);
        const address = getRandomElement(nairobiAddresses);
        const branch = getRandomElement(branches);
        const timeSlots: TimeSlot[] = ['morning', 'afternoon', 'evening'];
        const timeSlot = getRandomElement(timeSlots);

        // Set dates based on status
        let preferredDate: string;
        let createdAt: Timestamp;

        switch (status) {
          case 'pending':
            // Future dates for pending
            preferredDate = formatDate(getDateOffset(Math.floor(Math.random() * 5) + 1));
            createdAt = Timestamp.fromDate(getDateOffset(-Math.floor(Math.random() * 2)));
            break;
          case 'confirmed':
          case 'assigned':
          case 'in_transit':
            // Today or tomorrow
            preferredDate = formatDate(getDateOffset(Math.floor(Math.random() * 2)));
            createdAt = Timestamp.fromDate(getDateOffset(-Math.floor(Math.random() * 3) - 1));
            break;
          case 'completed':
          case 'cancelled':
            // Past dates
            preferredDate = formatDate(getDateOffset(-Math.floor(Math.random() * 14) - 1));
            createdAt = Timestamp.fromDate(getDateOffset(-Math.floor(Math.random() * 21) - 2));
            break;
          default:
            preferredDate = formatDate(getDateOffset(1));
            createdAt = now;
        }

        const requestData: PickupRequest = {
          requestId,
          customerId: customer.id,
          customerName: customer.name,
          customerPhone: customer.phone,
          branchId: branch,
          address,
          preferredDate,
          preferredTimeSlot: timeSlot,
          status: status as PickupStatus,
          createdAt,
          updatedAt: now,
        };

        // Add driver for assigned/in_transit status
        if (status === 'assigned' || status === 'in_transit') {
          const driver = getRandomElement(drivers);
          requestData.assignedDriverId = driver.id;
          requestData.assignedDriverName = driver.name;
          requestData.estimatedPickupTime = timeSlot === 'morning' ? '10:00' : timeSlot === 'afternoon' ? '14:00' : '18:00';
        }

        // Add completion time for completed
        if (status === 'completed') {
          requestData.completedAt = Timestamp.fromDate(new Date(preferredDate));
          const driver = getRandomElement(drivers);
          requestData.assignedDriverId = driver.id;
          requestData.assignedDriverName = driver.name;
        }

        // Add garment description (60% chance)
        if (Math.random() < 0.6) {
          requestData.garmentDescription = getRandomElement(garmentDescriptions);
        }

        // Add notes (40% chance)
        if (Math.random() < 0.4) {
          requestData.notes = getRandomElement(notes);
        }

        if (existingDoc.exists) {
          await requestRef.update(requestData as any);
          console.log(`  ✓ Updated: ${status} - ${customer.name} (${branch})`);
          updated++;
        } else {
          await requestRef.set(requestData);
          console.log(`  ✓ Created: ${status} - ${customer.name} (${branch})`);
          created++;
        }

        statusCounts[status as PickupStatus]++;
      }
    }

    console.log(`\n✅ Pickup requests seed completed!`);
    console.log(`📊 Summary:`);
    console.log(`   - Created: ${created} pickup requests`);
    console.log(`   - Updated: ${updated} pickup requests`);
    console.log(`   - Total: ${created + updated} pickup requests`);
    console.log(`\n📋 Status Distribution:`);
    console.log(`   - Pending: ${statusCounts.pending}`);
    console.log(`   - Confirmed: ${statusCounts.confirmed}`);
    console.log(`   - Assigned: ${statusCounts.assigned}`);
    console.log(`   - In Transit: ${statusCounts.in_transit}`);
    console.log(`   - Completed: ${statusCounts.completed}`);
    console.log(`   - Cancelled: ${statusCounts.cancelled}`);

  } catch (error) {
    console.error('\n❌ Error seeding pickup requests:', error);
    process.exit(1);
  }
}

seedPickupRequests()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
