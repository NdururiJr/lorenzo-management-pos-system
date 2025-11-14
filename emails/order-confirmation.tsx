/**
 * Order Confirmation Email Template
 *
 * Sent when a new order is created.
 * Includes order details, tracking information, and estimated completion.
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

interface OrderConfirmationEmailProps {
  orderId: string;
  customerName: string;
  customerEmail: string;
  garmentCount: number;
  totalAmount: number;
  estimatedCompletion: Date;
  branchName: string;
  branchPhone: string;
  orderDate: Date;
  trackingUrl?: string;
}

export default function OrderConfirmationEmail({
  orderId,
  customerName,
  garmentCount,
  totalAmount,
  estimatedCompletion,
  branchName,
  branchPhone,
  orderDate,
  trackingUrl,
}: OrderConfirmationEmailProps) {
  const previewText = `Order Confirmation #${orderId}`;
  const formattedDate = orderDate.toLocaleDateString('en-KE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = orderDate.toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const formattedCompletion = estimatedCompletion.toLocaleDateString('en-KE', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>Lorenzo Dry Cleaners</Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            {/* Success Message */}
            <Section style={successBanner}>
              <Text style={successText}>✓ Order Confirmed</Text>
            </Section>

            <Heading style={h2}>Thank you for your order, {customerName}!</Heading>

            <Text style={text}>
              We&apos;ve received your order and our team is getting started. You&apos;ll receive
              updates as your items are processed.
            </Text>

            {/* Order Details Box */}
            <Section style={orderBox}>
              <Text style={orderBoxTitle}>Order Details</Text>

              <Hr style={hr} />

              <Section style={orderRow}>
                <Text style={orderLabel}>Order Number:</Text>
                <Text style={orderValue}>#{orderId}</Text>
              </Section>

              <Section style={orderRow}>
                <Text style={orderLabel}>Order Date:</Text>
                <Text style={orderValue}>
                  {formattedDate} at {formattedTime}
                </Text>
              </Section>

              <Section style={orderRow}>
                <Text style={orderLabel}>Items:</Text>
                <Text style={orderValue}>{garmentCount} garment{garmentCount !== 1 ? 's' : ''}</Text>
              </Section>

              <Section style={orderRow}>
                <Text style={orderLabel}>Total Amount:</Text>
                <Text style={orderValueBold}>KES {totalAmount.toLocaleString()}</Text>
              </Section>

              <Section style={orderRow}>
                <Text style={orderLabel}>Branch:</Text>
                <Text style={orderValue}>{branchName}</Text>
              </Section>

              <Hr style={hr} />

              <Section style={estimateBox}>
                <Text style={estimateLabel}>Estimated Ready Date:</Text>
                <Text style={estimateDate}>{formattedCompletion}</Text>
                <Text style={estimateNote}>
                  We&apos;ll notify you when your order is ready for pickup or delivery.
                </Text>
              </Section>
            </Section>

            {/* Track Order Button */}
            {trackingUrl && (
              <Section style={buttonContainer}>
                <Button style={button} href={trackingUrl}>
                  Track Your Order
                </Button>
              </Section>
            )}

            {/* Contact Info */}
            <Section style={infoBox}>
              <Text style={infoTitle}>Need to reach us?</Text>
              <Text style={infoText}>
                Branch: {branchName}
                <br />
                Phone:{' '}
                <Link href={`tel:${branchPhone}`} style={link}>
                  {branchPhone}
                </Link>
              </Text>
            </Section>

            <Text style={text}>
              Thank you for choosing Lorenzo Dry Cleaners. We look forward to serving you!
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
  margin: '0',
  padding: '0',
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

const orderBox = {
  border: '1px solid #E5E7EB',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const orderBoxTitle = {
  color: '#000000',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

const hr = {
  borderColor: '#E5E7EB',
  margin: '16px 0',
};

const orderRow = {
  display: 'flex',
  justifyContent: 'space-between',
  margin: '8px 0',
};

const orderLabel = {
  color: '#6B7280',
  fontSize: '14px',
  margin: '0',
};

const orderValue = {
  color: '#1F2937',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
};

const orderValueBold = {
  color: '#000000',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0',
};

const estimateBox = {
  backgroundColor: '#F9FAFB',
  padding: '16px',
  borderRadius: '4px',
  textAlign: 'center' as const,
};

const estimateLabel = {
  color: '#6B7280',
  fontSize: '12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 4px',
};

const estimateDate = {
  color: '#000000',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 8px',
};

const estimateNote = {
  color: '#6B7280',
  fontSize: '14px',
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
  backgroundColor: '#F9FAFB',
  padding: '16px',
  borderRadius: '4px',
  margin: '24px 0',
};

const infoTitle = {
  color: '#000000',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 8px',
};

const infoText = {
  color: '#1F2937',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

const link = {
  color: '#3B82F6',
  textDecoration: 'underline',
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
