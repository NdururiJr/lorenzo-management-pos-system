/**
 * Inventory Alerts
 * Scheduled function to check inventory levels and send alerts
 * Runs every 6 hours
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { sendEmail } from '../utils/email';

/**
 * Check inventory levels and send alerts for low stock items
 * Runs every 6 hours
 */
export const inventoryAlerts = functions.pubsub
  .schedule('every 6 hours')
  .timeZone('Africa/Nairobi')
  .onRun(async (context) => {
    console.log('Checking inventory levels...');

    try {
      const db = admin.firestore();

      // Get all active branches
      const branchesSnapshot = await db
        .collection('branches')
        .where('active', '==', true)
        .get();

      const branches = branchesSnapshot.docs.map(doc => ({
        branchId: doc.id,
        ...doc.data(),
      }));

      // Check inventory for each branch
      for (const branch of branches) {
        const lowStockItems = await checkBranchInventory(branch.branchId as string);

        if (lowStockItems.length === 0) {
          console.log(`No low stock items for branch ${branch.name}`);
          continue;
        }

        console.log(`Found ${lowStockItems.length} low stock items for ${branch.name}`);

        // Get managers for this branch
        const managersSnapshot = await db
          .collection('users')
          .where('branchId', '==', branch.branchId)
          .where('role', 'in', ['admin', 'manager', 'director', 'general_manager', 'store_manager'])
          .where('active', '==', true)
          .get();

        const managerEmails = managersSnapshot.docs
          .map(doc => doc.data().email)
          .filter(email => email);

        if (managerEmails.length === 0) {
          console.log(`No managers found for branch ${branch.branchId}`);
          continue;
        }

        // Send alert email
        const emailHtml = generateInventoryAlertEmail(
          branch.name as string,
          lowStockItems
        );

        await sendEmail({
          to: managerEmails,
          subject: `⚠️ Low Inventory Alert - ${branch.name}`,
          html: emailHtml,
        });

        console.log(`Sent inventory alert for ${branch.name} to ${managerEmails.length} managers`);

        // Create notification in Firestore
        await db.collection('notifications').add({
          type: 'inventory_alert',
          channel: 'email',
          branchId: branch.branchId,
          itemCount: lowStockItems.length,
          items: lowStockItems,
          status: 'sent',
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      console.log('Inventory alerts completed successfully');
      return null;
    } catch (error) {
      console.error('Error checking inventory:', error);
      throw error;
    }
  });

/**
 * Check inventory for a specific branch and return low stock items
 */
async function checkBranchInventory(branchId: string): Promise<any[]> {
  const db = admin.firestore();

  // Get all inventory items for this branch
  const inventorySnapshot = await db
    .collection('inventory')
    .where('branchId', '==', branchId)
    .get();

  const lowStockItems: any[] = [];

  inventorySnapshot.docs.forEach(doc => {
    const item = doc.data();
    const currentQuantity = item.quantity || 0;
    const reorderLevel = item.reorderLevel || 0;

    // Check if item is below reorder level
    if (currentQuantity <= reorderLevel) {
      lowStockItems.push({
        itemId: doc.id,
        name: item.name,
        category: item.category,
        currentQuantity,
        reorderLevel,
        unit: item.unit,
        supplier: item.supplier,
      });
    }
  });

  return lowStockItems;
}

/**
 * Generate HTML for inventory alert email
 */
function generateInventoryAlertEmail(
  branchName: string,
  lowStockItems: any[]
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f59e0b; color: #fff; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .alert-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; background: #fff; }
        .table th { background: #000; color: #fff; padding: 10px; text-align: left; }
        .table td { padding: 10px; border-bottom: 1px solid #eee; }
        .low-stock { color: #dc2626; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Low Inventory Alert</h1>
          <p>${branchName}</p>
        </div>
        <div class="content">
          <div class="alert-box">
            <p><strong>Attention:</strong> ${lowStockItems.length} item(s) are running low and need to be reordered.</p>
          </div>

          <h2>Items Requiring Reorder</h2>
          <table class="table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Reorder Level</th>
                <th>Supplier</th>
              </tr>
            </thead>
            <tbody>
              ${lowStockItems
                .map(
                  item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.category}</td>
                    <td class="low-stock">${item.currentQuantity} ${item.unit}</td>
                    <td>${item.reorderLevel} ${item.unit}</td>
                    <td>${item.supplier || 'N/A'}</td>
                  </tr>
                `
                )
                .join('')}
            </tbody>
          </table>

          <p><strong>Action Required:</strong> Please review and reorder the above items to avoid stockouts.</p>
        </div>
        <div class="footer">
          <p>Lorenzo Dry Cleaners - Automated Inventory Alert</p>
          <p>Generated at ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
