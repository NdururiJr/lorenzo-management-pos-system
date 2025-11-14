/**
 * Firebase Cloud Functions for Lorenzo Dry Cleaners
 * Entry point for all Cloud Functions
 */

import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp();

// Export Firestore Triggers
export { onOrderCreated, onOrderStatusChanged, updateOrderEstimate } from './triggers/orders';
export { onPaymentReceived, onPaymentStatusChanged } from './triggers/payments';
export { onNotificationFailed, cleanupOldNotifications } from './triggers/notifications';

// Export Scheduled Functions
export { dailyReports } from './scheduled/reports';
export { inventoryAlerts } from './scheduled/inventory';
export { paymentReminders } from './scheduled/reminders';
