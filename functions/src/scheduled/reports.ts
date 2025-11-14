/**
 * Daily Reports
 * Scheduled function to generate and send daily reports
 * Runs every day at 6 AM EAT (East Africa Time)
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { sendEmail } from '../utils/email';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';

/**
 * Generate daily summary report
 * Runs at 6 AM EAT daily
 */
export const dailyReports = functions.pubsub
  .schedule('0 6 * * *')
  .timeZone('Africa/Nairobi')
  .onRun(async (context) => {
    console.log('Generating daily reports...');

    try {
      const yesterday = subDays(new Date(), 1);
      const startDate = startOfDay(yesterday);
      const endDate = endOfDay(yesterday);

      // Get all branches
      const branchesSnapshot = await admin.firestore()
        .collection('branches')
        .where('active', '==', true)
        .get();

      const branches = branchesSnapshot.docs.map(doc => ({
        branchId: doc.id,
        ...doc.data(),
      }));

      // Generate report for each branch
      for (const branch of branches) {
        const report = await generateBranchReport(
          branch.branchId as string,
          startDate,
          endDate
        );

        // Get managers for this branch
        const managersSnapshot = await admin.firestore()
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

        // Send report email
        const emailHtml = generateReportEmailHtml(
          branch.name as string,
          format(yesterday, 'PPP'),
          report
        );

        await sendEmail({
          to: managerEmails,
          subject: `Daily Report - ${branch.name} - ${format(yesterday, 'PP')}`,
          html: emailHtml,
        });

        console.log(`Sent daily report for ${branch.name} to ${managerEmails.length} managers`);
      }

      console.log('Daily reports completed successfully');
      return null;
    } catch (error) {
      console.error('Error generating daily reports:', error);
      throw error;
    }
  });

/**
 * Generate report data for a specific branch
 */
async function generateBranchReport(
  branchId: string,
  startDate: Date,
  endDate: Date
): Promise<any> {
  const db = admin.firestore();

  // Get orders created yesterday
  const ordersSnapshot = await db
    .collection('orders')
    .where('branchId', '==', branchId)
    .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(startDate))
    .where('createdAt', '<=', admin.firestore.Timestamp.fromDate(endDate))
    .get();

  const orders = ordersSnapshot.docs.map(doc => doc.data());

  // Get transactions from yesterday
  const transactionsSnapshot = await db
    .collection('transactions')
    .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(startDate))
    .where('timestamp', '<=', admin.firestore.Timestamp.fromDate(endDate))
    .where('status', '==', 'completed')
    .get();

  const transactions = transactionsSnapshot.docs.map(doc => doc.data());

  // Calculate metrics
  const totalOrders = orders.length;
  const totalGarments = orders.reduce((sum, order) => sum + (order.garments?.length || 0), 0);
  const totalRevenue = transactions.reduce((sum, txn) => sum + (txn.amount || 0), 0);

  const completedOrders = orders.filter(
    order => order.status === 'delivered' || order.status === 'collected'
  ).length;

  const pendingOrders = orders.filter(
    order => !['delivered', 'collected', 'cancelled'].includes(order.status)
  ).length;

  const paymentMethods = transactions.reduce((acc, txn) => {
    const method = txn.method || 'unknown';
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get orders by status
  const ordersByStatus = orders.reduce((acc, order) => {
    const status = order.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalOrders,
    totalGarments,
    totalRevenue,
    completedOrders,
    pendingOrders,
    paymentMethods,
    ordersByStatus,
  };
}

/**
 * Generate HTML for report email
 */
function generateReportEmailHtml(
  branchName: string,
  date: string,
  report: any
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: #fff; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .metric-card { background: #fff; padding: 15px; margin: 10px 0; border-left: 4px solid #000; }
        .metric-value { font-size: 32px; font-weight: bold; color: #000; }
        .metric-label { font-size: 14px; color: #666; text-transform: uppercase; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; background: #fff; }
        .table th { background: #000; color: #fff; padding: 10px; text-align: left; }
        .table td { padding: 10px; border-bottom: 1px solid #eee; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Daily Report</h1>
          <p>${branchName} - ${date}</p>
        </div>
        <div class="content">
          <h2>Key Metrics</h2>

          <div class="metric-card">
            <div class="metric-value">${report.totalOrders}</div>
            <div class="metric-label">Total Orders</div>
          </div>

          <div class="metric-card">
            <div class="metric-value">${report.totalGarments}</div>
            <div class="metric-label">Total Garments</div>
          </div>

          <div class="metric-card">
            <div class="metric-value">KES ${report.totalRevenue.toLocaleString()}</div>
            <div class="metric-label">Total Revenue</div>
          </div>

          <div class="metric-card">
            <div class="metric-value">${report.completedOrders}</div>
            <div class="metric-label">Completed Orders</div>
          </div>

          <div class="metric-card">
            <div class="metric-value">${report.pendingOrders}</div>
            <div class="metric-label">Pending Orders</div>
          </div>

          <h2>Orders by Status</h2>
          <table class="table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(report.ordersByStatus)
                .map(([status, count]) => `
                  <tr>
                    <td>${status}</td>
                    <td>${count}</td>
                  </tr>
                `)
                .join('')}
            </tbody>
          </table>

          <h2>Payment Methods</h2>
          <table class="table">
            <thead>
              <tr>
                <th>Method</th>
                <th>Transactions</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(report.paymentMethods)
                .map(([method, count]) => `
                  <tr>
                    <td>${method}</td>
                    <td>${count}</td>
                  </tr>
                `)
                .join('')}
            </tbody>
          </table>
        </div>
        <div class="footer">
          <p>Lorenzo Dry Cleaners - Automated Daily Report</p>
          <p>Generated at ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
