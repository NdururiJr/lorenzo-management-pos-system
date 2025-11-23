/**
 * HTML Email Templates
 *
 * Simple, professional HTML email templates for Lorenzo Dry Cleaners
 * Designed for compatibility with all email clients
 *
 * @module lib/email-templates-html
 */

/**
 * Base email layout with Lorenzo Dry Cleaners branding
 */
function baseEmailTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lorenzo Dry Cleaners</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background-color: #000000; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Lorenzo Dry Cleaners</h1>
              <p style="margin: 8px 0 0; color: #e5e7eb; font-size: 14px;">Premium Dry Cleaning Services</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; text-align: center;">
                Lorenzo Dry Cleaners, Kilimani, Nairobi, Kenya
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Lorenzo Dry Cleaners. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Password Reset Email Template
 */
export function passwordResetEmailHtml(params: {
  email: string;
  resetLink: string;
  userName?: string;
}): string {
  const { email, resetLink, userName } = params;

  const content = `
    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.5;">
      ${userName ? `Hello ${userName},` : 'Hello,'}
    </p>
    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.5;">
      We received a request to reset the password for your account (${email}). Click the button below to create a new password:
    </p>
    <table role="presentation" style="margin: 30px 0;">
      <tr>
        <td>
          <a href="${resetLink}" style="display: inline-block; padding: 14px 32px; background-color: #000000; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px;">
            Reset Password
          </a>
        </td>
      </tr>
    </table>
    <p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
      If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
    </p>
    <p style="margin: 20px 0 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
      This link will expire in 1 hour for security purposes.
    </p>
  `;

  return baseEmailTemplate(content);
}

/**
 * Order Confirmation Email Template
 */
export function orderConfirmationEmailHtml(params: {
  orderId: string;
  customerName: string;
  garmentCount: number;
  totalAmount: number;
  estimatedCompletion: Date;
  branchName: string;
  branchPhone: string;
  orderDate: Date;
  trackingUrl?: string;
}): string {
  const {
    orderId,
    customerName,
    garmentCount,
    totalAmount,
    estimatedCompletion,
    branchName,
    branchPhone,
    orderDate,
    trackingUrl
  } = params;

  const content = `
    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Order Confirmed</h2>
    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.5;">
      Hello ${customerName},
    </p>
    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.5;">
      Thank you for choosing Lorenzo Dry Cleaners! Your order has been received and is being processed.
    </p>

    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f9fafb; border-radius: 6px;">
      <tr>
        <td style="padding: 20px;">
          <table role="presentation" style="width: 100%;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Order Number:</td>
              <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${orderId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Order Date:</td>
              <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right;">${orderDate.toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Items:</td>
              <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right;">${garmentCount} garment${garmentCount > 1 ? 's' : ''}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Total Amount:</td>
              <td style="padding: 8px 0; color: #1f2937; font-size: 16px; font-weight: 600; text-align: right;">KES ${totalAmount.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Estimated Completion:</td>
              <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right;">${estimatedCompletion.toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Branch:</td>
              <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right;">${branchName}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${trackingUrl ? `
    <table role="presentation" style="margin: 30px 0;">
      <tr>
        <td>
          <a href="${trackingUrl}" style="display: inline-block; padding: 14px 32px; background-color: #000000; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px;">
            Track Your Order
          </a>
        </td>
      </tr>
    </table>
    ` : ''}

    <p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
      If you have any questions, please contact us at ${branchPhone}.
    </p>
  `;

  return baseEmailTemplate(content);
}

/**
 * Order Status Update Email Template
 */
export function orderStatusUpdateEmailHtml(params: {
  orderId: string;
  customerName: string;
  newStatus: string;
  statusMessage: string;
  trackingUrl?: string;
  estimatedCompletion?: Date;
}): string {
  const {
    orderId,
    customerName,
    newStatus,
    statusMessage,
    trackingUrl,
    estimatedCompletion
  } = params;

  const content = `
    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Order Update</h2>
    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.5;">
      Hello ${customerName},
    </p>
    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.5;">
      Your order #${orderId} has been updated.
    </p>

    <div style="padding: 20px; background-color: #f9fafb; border-left: 4px solid #000000; border-radius: 4px; margin: 20px 0;">
      <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">New Status</p>
      <p style="margin: 0; color: #1f2937; font-size: 20px; font-weight: 600;">${newStatus}</p>
    </div>

    <p style="margin: 20px 0; color: #4b5563; font-size: 16px; line-height: 1.5;">
      ${statusMessage}
    </p>

    ${estimatedCompletion ? `
    <p style="margin: 20px 0; color: #6b7280; font-size: 14px;">
      Estimated completion: <strong style="color: #1f2937;">${estimatedCompletion.toLocaleDateString()}</strong>
    </p>
    ` : ''}

    ${trackingUrl ? `
    <table role="presentation" style="margin: 30px 0;">
      <tr>
        <td>
          <a href="${trackingUrl}" style="display: inline-block; padding: 14px 32px; background-color: #000000; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px;">
            View Order Details
          </a>
        </td>
      </tr>
    </table>
    ` : ''}
  `;

  return baseEmailTemplate(content);
}

/**
 * Receipt Email Template
 */
export function receiptEmailHtml(params: {
  orderId: string;
  customerName: string;
  totalAmount: number;
  paidAmount: number;
  paymentMethod: string;
  transactionDate: Date;
  receiptUrl?: string;
}): string {
  const {
    orderId,
    customerName,
    totalAmount,
    paidAmount,
    paymentMethod,
    transactionDate,
    receiptUrl
  } = params;

  const content = `
    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Payment Receipt</h2>
    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.5;">
      Hello ${customerName},
    </p>
    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.5;">
      Thank you for your payment. Here's your receipt for order #${orderId}.
    </p>

    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f9fafb; border-radius: 6px;">
      <tr>
        <td style="padding: 20px;">
          <table role="presentation" style="width: 100%;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Transaction Date:</td>
              <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right;">${transactionDate.toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Payment Method:</td>
              <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right;">${paymentMethod}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Amount Paid:</td>
              <td style="padding: 8px 0; color: #10b981; font-size: 18px; font-weight: 600; text-align: right;">KES ${paidAmount.toLocaleString()}</td>
            </tr>
            ${totalAmount !== paidAmount ? `
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Total Amount:</td>
              <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right;">KES ${totalAmount.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Balance:</td>
              <td style="padding: 8px 0; color: #ef4444; font-size: 14px; font-weight: 600; text-align: right;">KES ${(totalAmount - paidAmount).toLocaleString()}</td>
            </tr>
            ` : ''}
          </table>
        </td>
      </tr>
    </table>

    ${receiptUrl ? `
    <table role="presentation" style="margin: 30px 0;">
      <tr>
        <td>
          <a href="${receiptUrl}" style="display: inline-block; padding: 14px 32px; background-color: #000000; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px;">
            Download Receipt
          </a>
        </td>
      </tr>
    </table>
    ` : ''}

    <p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
      This receipt has been sent to your email and is also attached as a PDF.
    </p>
  `;

  return baseEmailTemplate(content);
}

/**
 * Employee Invitation Email Template
 */
export function employeeInvitationEmailHtml(params: {
  employeeName: string;
  role: string;
  branchName: string;
  temporaryPassword?: string;
  loginUrl: string;
  invitedBy: string;
}): string {
  const {
    employeeName,
    role,
    branchName,
    temporaryPassword,
    loginUrl,
    invitedBy
  } = params;

  const content = `
    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Welcome to Lorenzo Dry Cleaners!</h2>
    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.5;">
      Hello ${employeeName},
    </p>
    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.5;">
      You've been invited by ${invitedBy} to join Lorenzo Dry Cleaners as a <strong>${role}</strong> at our ${branchName} branch.
    </p>

    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f9fafb; border-radius: 6px;">
      <tr>
        <td style="padding: 20px;">
          <table role="presentation" style="width: 100%;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Position:</td>
              <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${role}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Branch:</td>
              <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right;">${branchName}</td>
            </tr>
            ${temporaryPassword ? `
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Temporary Password:</td>
              <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-family: monospace; text-align: right;">${temporaryPassword}</td>
            </tr>
            ` : ''}
          </table>
        </td>
      </tr>
    </table>

    <table role="presentation" style="margin: 30px 0;">
      <tr>
        <td>
          <a href="${loginUrl}" style="display: inline-block; padding: 14px 32px; background-color: #000000; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px;">
            Access Dashboard
          </a>
        </td>
      </tr>
    </table>

    ${temporaryPassword ? `
    <p style="margin: 20px 0 0; color: #ef4444; font-size: 14px; line-height: 1.5;">
      <strong>Important:</strong> Please change your password after your first login for security purposes.
    </p>
    ` : ''}

    <p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
      If you have any questions, please contact your manager.
    </p>
  `;

  return baseEmailTemplate(content);
}

/**
 * Payment Reminder Email Template
 */
export function paymentReminderEmailHtml(params: {
  orderId: string;
  customerName: string;
  totalAmount: number;
  paidAmount: number;
  amountDue: number;
  orderStatus: string;
  branchName: string;
  branchPhone: string;
  paymentUrl?: string;
  dueDate?: Date;
}): string {
  const {
    orderId,
    customerName,
    totalAmount,
    paidAmount,
    amountDue,
    orderStatus,
    branchName,
    branchPhone,
    paymentUrl,
    dueDate
  } = params;

  const content = `
    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Payment Reminder</h2>
    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.5;">
      Hello ${customerName},
    </p>
    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.5;">
      This is a friendly reminder about the outstanding balance on your order #${orderId}.
    </p>

    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #fef3c7; border-radius: 6px; border: 2px solid #f59e0b;">
      <tr>
        <td style="padding: 20px;">
          <table role="presentation" style="width: 100%;">
            <tr>
              <td style="padding: 8px 0; color: #78350f; font-size: 14px;">Total Amount:</td>
              <td style="padding: 8px 0; color: #78350f; font-size: 14px; text-align: right;">KES ${totalAmount.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #78350f; font-size: 14px;">Amount Paid:</td>
              <td style="padding: 8px 0; color: #78350f; font-size: 14px; text-align: right;">KES ${paidAmount.toLocaleString()}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 12px 0 8px; border-top: 2px solid #f59e0b;"></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #78350f; font-size: 16px; font-weight: 600;">Amount Due:</td>
              <td style="padding: 8px 0; color: #78350f; font-size: 20px; font-weight: 600; text-align: right;">KES ${amountDue.toLocaleString()}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${dueDate ? `
    <p style="margin: 20px 0; color: #4b5563; font-size: 14px;">
      Payment due date: <strong style="color: #ef4444;">${dueDate.toLocaleDateString()}</strong>
    </p>
    ` : ''}

    <p style="margin: 20px 0; color: #4b5563; font-size: 14px;">
      Order status: <strong>${orderStatus}</strong>
    </p>

    ${paymentUrl ? `
    <table role="presentation" style="margin: 30px 0;">
      <tr>
        <td>
          <a href="${paymentUrl}" style="display: inline-block; padding: 14px 32px; background-color: #000000; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px;">
            Make Payment
          </a>
        </td>
      </tr>
    </table>
    ` : ''}

    <p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
      You can make payment at our ${branchName} branch or contact us at ${branchPhone} for payment options.
    </p>
  `;

  return baseEmailTemplate(content);
}

/**
 * Pickup Request Confirmation Email Template
 */
export function pickupRequestEmailHtml(params: {
  customerName: string;
  pickupAddress: string;
  pickupDate?: Date;
  pickupTimeSlot?: string;
  contactPhone: string;
  specialInstructions?: string;
  requestId: string;
  branchName: string;
  branchPhone: string;
  trackingUrl?: string;
}): string {
  const {
    customerName,
    pickupAddress,
    pickupDate,
    pickupTimeSlot,
    contactPhone,
    specialInstructions,
    requestId,
    branchName,
    branchPhone,
    trackingUrl
  } = params;

  const content = `
    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Pickup Request Confirmed</h2>
    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.5;">
      Hello ${customerName},
    </p>
    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.5;">
      Your pickup request has been confirmed! We'll collect your items from the address below.
    </p>

    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f9fafb; border-radius: 6px;">
      <tr>
        <td style="padding: 20px;">
          <table role="presentation" style="width: 100%;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Request ID:</td>
              <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${requestId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Pickup Address:</td>
              <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right;">${pickupAddress}</td>
            </tr>
            ${pickupDate ? `
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Pickup Date:</td>
              <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right;">${pickupDate.toLocaleDateString()}</td>
            </tr>
            ` : ''}
            ${pickupTimeSlot ? `
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Time Slot:</td>
              <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right;">${pickupTimeSlot}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Contact Phone:</td>
              <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right;">${contactPhone}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Branch:</td>
              <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right;">${branchName}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${specialInstructions ? `
    <div style="padding: 15px; background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px; margin: 20px 0;">
      <p style="margin: 0 0 5px; color: #1e40af; font-size: 12px; font-weight: 600; text-transform: uppercase;">Special Instructions</p>
      <p style="margin: 0; color: #1e3a8a; font-size: 14px;">${specialInstructions}</p>
    </div>
    ` : ''}

    ${trackingUrl ? `
    <table role="presentation" style="margin: 30px 0;">
      <tr>
        <td>
          <a href="${trackingUrl}" style="display: inline-block; padding: 14px 32px; background-color: #000000; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px;">
            Track Pickup
          </a>
        </td>
      </tr>
    </table>
    ` : ''}

    <p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
      Our driver will contact you before arrival. If you need to make changes, please call us at ${branchPhone}.
    </p>
  `;

  return baseEmailTemplate(content);
}
