/**
 * Order Status Update Email Template
 *
 * Sent when an order's status changes.
 * Keeps customers informed about their order progress.
 */

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface OrderStatusUpdateEmailProps {
  orderId: string;
  customerName: string;
  customerEmail: string;
  oldStatus: string;
  newStatus: string;
  statusMessage: string;
  trackingUrl?: string;
  estimatedCompletion?: Date;
}

export default function OrderStatusUpdateEmail({
  orderId,
  customerName,
  newStatus,
  statusMessage,
  trackingUrl,
  estimatedCompletion,
}: OrderStatusUpdateEmailProps) {
  const previewText = `Order #${orderId} - ${newStatus}`;

  // Map status to display name and color
  const getStatusInfo = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('ready')) {
      return { displayName: 'Ready for Pickup', color: '#10B981' };
    }
    if (statusLower.includes('delivery') || statusLower.includes('dispatched')) {
      return { displayName: 'Out for Delivery', color: '#3B82F6' };
    }
    if (statusLower.includes('delivered') || statusLower.includes('collected')) {
      return { displayName: 'Completed', color: '#10B981' };
    }
    if (statusLower.includes('washing')) {
      return { displayName: 'Being Washed', color: '#F59E0B' };
    }
    if (statusLower.includes('drying')) {
      return { displayName: 'Being Dried', color: '#F59E0B' };
    }
    if (statusLower.includes('ironing')) {
      return { displayName: 'Being Ironed', color: '#F59E0B' };
    }
    if (statusLower.includes('quality')) {
      return { displayName: 'Quality Check', color: '#F59E0B' };
    }
    if (statusLower.includes('packaging')) {
      return { displayName: 'Being Packaged', color: '#F59E0B' };
    }
    return { displayName: status, color: '#6B7280' };
  };

  const statusInfo = getStatusInfo(newStatus);

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
            {/* Status Badge */}
            <Section
              style={{
                ...statusBanner,
                backgroundColor: statusInfo.color,
              }}
            >
              <Text style={statusText}>{statusInfo.displayName}</Text>
            </Section>

            <Heading style={h2}>Hi {customerName},</Heading>

            <Text style={text}>
              Your order <strong>#{orderId}</strong> has been updated.
            </Text>

            {/* Status Message Box */}
            <Section style={messageBox}>
              <Text style={messageText}>{statusMessage}</Text>
            </Section>

            {/* Estimated Completion (if applicable) */}
            {estimatedCompletion && (
              <Section style={infoBox}>
                <Text style={infoLabel}>Estimated Ready Date:</Text>
                <Text style={infoValue}>
                  {estimatedCompletion.toLocaleDateString('en-KE', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </Section>
            )}

            {/* Track Order Button */}
            {trackingUrl && (
              <Section style={buttonContainer}>
                <Button style={button} href={trackingUrl}>
                  Track Your Order
                </Button>
              </Section>
            )}

            {/* Status Timeline Info */}
            <Section style={timelineBox}>
              <Text style={timelineTitle}>Order Status Timeline</Text>
              <Text style={timelineText}>
                ✓ Order Received
                <br />
                {newStatus.toLowerCase().includes('washing') ||
                newStatus.toLowerCase().includes('drying') ||
                newStatus.toLowerCase().includes('ironing') ||
                newStatus.toLowerCase().includes('quality') ||
                newStatus.toLowerCase().includes('packaging') ||
                newStatus.toLowerCase().includes('ready') ||
                newStatus.toLowerCase().includes('delivery') ||
                newStatus.toLowerCase().includes('delivered')
                  ? '✓ Processing\n'
                  : '⏳ Processing\n'}
                {newStatus.toLowerCase().includes('ready') ||
                newStatus.toLowerCase().includes('delivery') ||
                newStatus.toLowerCase().includes('delivered')
                  ? '✓ Ready\n'
                  : '⏳ Ready\n'}
                {newStatus.toLowerCase().includes('delivered') ||
                newStatus.toLowerCase().includes('collected')
                  ? '✓ Completed'
                  : '⏳ Completed'}
              </Text>
            </Section>

            <Text style={text}>
              We&apos;ll keep you updated on your order&apos;s progress. If you have any
              questions, don&apos;t hesitate to reach out.
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

const statusBanner = {
  padding: '12px 16px',
  borderRadius: '4px',
  marginBottom: '24px',
  textAlign: 'center' as const,
};

const statusText = {
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

const messageBox = {
  backgroundColor: '#F9FAFB',
  border: '1px solid #E5E7EB',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const messageText = {
  color: '#1F2937',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
};

const infoBox = {
  backgroundColor: '#F9FAFB',
  padding: '16px',
  borderRadius: '4px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const infoLabel = {
  color: '#6B7280',
  fontSize: '12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 4px',
};

const infoValue = {
  color: '#000000',
  fontSize: '16px',
  fontWeight: 'bold',
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

const timelineBox = {
  border: '1px solid #E5E7EB',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const timelineTitle = {
  color: '#000000',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const timelineText = {
  color: '#1F2937',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0',
  whiteSpace: 'pre-line' as const,
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
