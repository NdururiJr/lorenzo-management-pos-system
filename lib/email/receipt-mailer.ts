/**
 * Receipt Email Service
 *
 * This module provides email functionality for sending receipts with PDF attachments.
 * Calls server-side API route to send emails via Resend.
 *
 * @module lib/email/receipt-mailer
 */

/**
 * Send receipt email with PDF attachment
 * Calls server-side API route which handles Resend integration
 */
export async function sendReceiptEmail(
  customerEmail: string,
  customerName: string,
  order: any,
  customer: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/receipts/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerEmail,
        customerName,
        order,
        customer,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Failed to send receipt email',
      };
    }

    console.log('Receipt email sent successfully');
    return { success: true };
  } catch (error: any) {
    console.error('Error sending receipt email:', error);
    return {
      success: false,
      error: error.message || 'Failed to send receipt email',
    };
  }
}

/**
 * Send batch of receipt emails
 */
export async function sendBatchReceiptEmails(
  receipts: Array<{
    email: string;
    name: string;
    order: any;
    customer: any;
  }>
): Promise<{
  successful: number;
  failed: number;
  errors: Array<{ email: string; error: string }>;
}> {
  const results = await Promise.allSettled(
    receipts.map((receipt) =>
      sendReceiptEmail(receipt.email, receipt.name, receipt.order, receipt.customer)
    )
  );

  const successful = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
  const failed = results.length - successful;
  const errors = results
    .map((r, index) => {
      if (r.status === 'fulfilled' && !r.value.success) {
        return { email: receipts[index].email, error: r.value.error || 'Unknown error' };
      }
      if (r.status === 'rejected') {
        return { email: receipts[index].email, error: r.reason?.message || 'Unknown error' };
      }
      return null;
    })
    .filter(Boolean) as Array<{ email: string; error: string }>;

  return { successful, failed, errors };
}