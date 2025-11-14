/**
 * Receipt Email Template
 *
 * Sent when a payment is processed.
 * Includes transaction details and can attach PDF receipt.
 */

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface ReceiptEmailProps {
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  paidAmount: number;
  paymentMethod: string;
  transactionDate: Date;
  receiptUrl?: string;
}

export default function ReceiptEmail({
  orderId,
  customerName,
  totalAmount,
  paidAmount,
  paymentMethod,
  transactionDate,
  receiptUrl,
}: ReceiptEmailProps) {
  const previewText = `Receipt for Order #${orderId}`;
  const formattedDate = transactionDate.toLocaleDateString('en-KE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = transactionDate.toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const balance = totalAmount - paidAmount;

  // Format payment method for display
  const getPaymentMethodDisplay = (method: string) => {
    const methodLower = method.toLowerCase();
    if (methodLower === 'mpesa' || methodLower === 'm-pesa') return 'M-Pesa';
    if (methodLower === 'cash') return 'Cash';
    if (methodLower === 'card') return 'Card';
    if (methodLower === 'credit') return 'Credit Account';
    return method;
  };

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>Lorenzo Dry Cleaners</Heading>
            <Text style={headerSubtitle}>Payment Receipt</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            {/* Success Banner */}
            <Section style={successBanner}>
              <Text style={successText}>✓ Payment Received</Text>
            </Section>

            <Heading style={h2}>Thank you, {customerName}!</Heading>

            <Text style={text}>
              We&apos;ve received your payment for order <strong>#{orderId}</strong>.
            </Text>

            {/* Receipt Details Box */}
            <Section style={receiptBox}>
              <Text style={receiptBoxTitle}>Receipt Details</Text>

              <Hr style={hr} />

              <Section style={receiptRow}>
                <Text style={receiptLabel}>Order Number:</Text>
                <Text style={receiptValue}>#{orderId}</Text>
              </Section>

              <Section style={receiptRow}>
                <Text style={receiptLabel}>Payment Date:</Text>
                <Text style={receiptValue}>
                  {formattedDate}
                  <br />
                  {formattedTime}
                </Text>
              </Section>

              <Section style={receiptRow}>
                <Text style={receiptLabel}>Payment Method:</Text>
                <Text style={receiptValue}>{getPaymentMethodDisplay(paymentMethod)}</Text>
              </Section>

              <Hr style={hr} />

              {/* Amount Breakdown */}
              <Section style={receiptRow}>
                <Text style={receiptLabel}>Total Amount:</Text>
                <Text style={receiptValue}>KES {totalAmount.toLocaleString()}</Text>
              </Section>

              <Section style={receiptRow}>
                <Text style={receiptLabel}>Amount Paid:</Text>
                <Text style={receiptValueBold}>KES {paidAmount.toLocaleString()}</Text>
              </Section>

              {balance > 0 && (
                <>
                  <Section style={receiptRow}>
                    <Text style={receiptLabel}>Balance Due:</Text>
                    <Text style={receiptValueWarning}>KES {balance.toLocaleString()}</Text>
                  </Section>
                </>
              )}

              {balance === 0 && (
                <Section style={paidBanner}>
                  <Text style={paidText}>✓ Fully Paid</Text>
                </Section>
              )}
            </Section>

            {/* Balance Warning (if applicable) */}
            {balance > 0 && (
              <Section style={warningBox}>
                <Text style={warningText}>
                  <strong>Outstanding Balance:</strong> KES {balance.toLocaleString()}
                  <br />
                  Please complete payment before collecting your order.
                </Text>
              </Section>
            )}

            {/* View Receipt Button */}
            {receiptUrl && (
              <Section style={buttonContainer}>
                <Button style={button} href={receiptUrl}>
                  View Full Receipt
                </Button>
              </Section>
            )}

            {/* PDF Attachment Notice */}
            <Section style={infoBox}>
              <Text style={infoText}>
                📎 A PDF copy of this receipt is attached to this email for your records.
              </Text>
            </Section>

            {/* Important Information */}
            <Section style={importantBox}>
              <Text style={importantTitle}>Important Information</Text>
              <Text style={importantText}>
                • Please keep this receipt for your records
                <br />
                • Present this receipt when collecting your order
                <br />• For any payment inquiries, quote your order number #{orderId}
              </Text>
            </Section>

            <Text style={text}>
              Thank you for your business. If you have any questions about this receipt, please
              don&apos;t hesitate to contact us.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Lorenzo Dry Cleaners
              <br />
              Kilimani, Nairobi, Kenya
              <br />
              <Link href="tel:+254725462859" style={footerLink}>
                +254 725 462 859
              </Link>
            </Text>

            <Text style={footerText}>
              Questions?{' '}
              <Link href="mailto:support@lorenzo-dry-cleaners.com" style={footerLink}>
                Contact Support
              </Link>
            </Text>

            <Text style={footerSmall}>
              This is an automated receipt. Please do not reply to this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
};

const header = {
  backgroundColor: '#000000',
  padding: '24px',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 4px',
  padding: '0',
};

const headerSubtitle = {
  color: '#9CA3AF',
  fontSize: '14px',
  margin: '0',
};

const content = {
  padding: '24px',
};

const successBanner = {
  backgroundColor: '#10B981',
  padding: '12px 16px',
  borderRadius: '4px',
  marginBottom: '24px',
  textAlign: 'center' as const,
};

const successText = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0',
};

const h2 = {
  color: '#000000',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

const text = {
  color: '#1F2937',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
};

const receiptBox = {
  border: '2px solid #000000',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  backgroundColor: '#FAFAFA',
};

const receiptBoxTitle = {
  color: '#000000',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px',
  textAlign: 'center' as const,
};

const hr = {
  borderColor: '#E5E7EB',
  margin: '16px 0',
};

const receiptRow = {
  display: 'flex',
  justifyContent: 'space-between',
  margin: '12px 0',
};

const receiptLabel = {
  color: '#6B7280',
  fontSize: '14px',
  margin: '0',
};

const receiptValue = {
  color: '#1F2937',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
  textAlign: 'right' as const,
};

const receiptValueBold = {
  color: '#000000',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0',
};

const receiptValueWarning = {
  color: '#F59E0B',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0',
};

const paidBanner = {
  backgroundColor: '#10B981',
  padding: '8px 12px',
  borderRadius: '4px',
  marginTop: '16px',
  textAlign: 'center' as const,
};

const paidText = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0',
};

const warningBox = {
  backgroundColor: '#FEF3C7',
  border: '1px solid #F59E0B',
  borderRadius: '4px',
  padding: '16px',
  margin: '24px 0',
};

const warningText = {
  color: '#92400E',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

const buttonContainer = {
  padding: '24px 0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#000000',
  borderRadius: '4px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const infoBox = {
  backgroundColor: '#EFF6FF',
  border: '1px solid #BFDBFE',
  borderRadius: '4px',
  padding: '12px',
  margin: '24px 0',
};

const infoText = {
  color: '#1E40AF',
  fontSize: '14px',
  margin: '0',
};

const importantBox = {
  border: '1px solid #E5E7EB',
  borderRadius: '4px',
  padding: '16px',
  margin: '24px 0',
};

const importantTitle = {
  color: '#000000',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 8px',
};

const importantText = {
  color: '#1F2937',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0',
};

const footer = {
  borderTop: '1px solid #E5E7EB',
  padding: '24px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#6B7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 8px',
};

const footerLink = {
  color: '#3B82F6',
  textDecoration: 'underline',
};

const footerSmall = {
  color: '#9CA3AF',
  fontSize: '12px',
  margin: '16px 0 0',
};
