/**
 * Password Reset Email Template
 *
 * Sent when a user requests a password reset.
 * Includes a secure reset link that expires in 1 hour.
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

interface PasswordResetEmailProps {
  email: string;
  resetLink: string;
  userName?: string;
}

export default function PasswordResetEmail({
  email,
  resetLink,
  userName,
}: PasswordResetEmailProps) {
  const previewText = 'Reset your password for Lorenzo Dry Cleaners';

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
            <Heading style={h2}>Reset Your Password</Heading>

            <Text style={text}>
              Hi {userName || email},
            </Text>

            <Text style={text}>
              We received a request to reset your password for your Lorenzo Dry Cleaners account.
              Click the button below to create a new password:
            </Text>

            {/* Reset Button */}
            <Section style={buttonContainer}>
              <Button style={button} href={resetLink}>
                Reset Password
              </Button>
            </Section>

            <Text style={text}>
              This link will expire in <strong>1 hour</strong> for security reasons.
            </Text>

            <Text style={text}>
              If the button doesn&apos;t work, copy and paste this link into your browser:
            </Text>

            <Text style={linkText}>
              <Link href={resetLink} style={link}>
                {resetLink}
              </Link>
            </Text>

            <Text style={text}>
              If you didn&apos;t request a password reset, you can safely ignore this email.
              Your password will remain unchanged.
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
              Need help?{' '}
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

const buttonContainer = {
  padding: '24px 0',
};

const button = {
  backgroundColor: '#000000',
  borderRadius: '4px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
};

const linkText = {
  color: '#6B7280',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0 0 16px',
  wordBreak: 'break-all' as const,
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
