/**
 * Privacy Policy Page
 *
 * Privacy policy with detailed information about data collection and usage.
 * Features: hero section, policy sections, and contact information.
 *
 * @module app/privacy/page
 */

import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how Lorenzo Dry Cleaners collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <PrivacyHero />

      {/* Privacy Content */}
      <PrivacyContent />

      {/* Footer */}
      <Footer />
    </main>
  );
}

function PrivacyHero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-lorenzo-dark">
      {/* Dark Teal Gradient Background - matching other pages */}
      <div className="absolute inset-0 bg-gradient-to-br from-lorenzo-dark via-lorenzo-teal to-lorenzo-dark-900" />
      <div className="absolute inset-0 bg-gradient-to-tr from-lorenzo-cream/5 via-transparent to-lorenzo-dark-900 opacity-40" />

      {/* Decorative blur elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-lorenzo-accent-teal rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-lorenzo-gold rounded-full blur-3xl opacity-15" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-medium mb-6 border-2 border-white/30">
            PRIVACY POLICY
          </span>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
            Your Privacy
            <br />
            <span className="text-lorenzo-gold">Matters to Us</span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-white/90 mb-4 max-w-2xl mx-auto leading-relaxed">
            We are committed to protecting your personal information and your right to privacy.
          </p>
          <p className="text-sm text-white/70">
            Last Updated: January 15, 2025
          </p>
        </div>
      </div>
    </section>
  );
}

function PrivacyContent() {
  return (
    <section className="relative py-24 overflow-hidden bg-white">
      {/* Light Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-lorenzo-accent-teal-50 via-white to-lorenzo-accent-teal-100" />

      {/* Decorative blur elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-lorenzo-accent-teal-light rounded-full blur-3xl opacity-15" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-lorenzo-accent-teal rounded-full blur-3xl opacity-10" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/70 backdrop-blur-xl border-2 border-white/60 rounded-3xl shadow-card p-8 md:p-12">
            <div className="prose prose-lg max-w-none">
              <h2>1. Introduction</h2>
              <p>
                Welcome to Lorenzo Dry Cleaners ("we," "our," or "us"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our dry cleaning services, visit our website, or interact with our mobile applications.
              </p>
              <p>
                Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access our services.
              </p>

              <h2>2. Information We Collect</h2>
              <h3>Personal Information</h3>
              <p>We collect personal information that you voluntarily provide to us when you:</p>
              <ul>
                <li>Register for an account</li>
                <li>Place an order for our services</li>
                <li>Contact our customer support</li>
                <li>Subscribe to our newsletter or marketing communications</li>
              </ul>

              <p>This information may include:</p>
              <ul>
                <li><strong>Contact Information:</strong> Name, email address, phone number, delivery address</li>
                <li><strong>Account Information:</strong> Username, password, and account preferences</li>
                <li><strong>Order Information:</strong> Details about your garments, special instructions, and service preferences</li>
                <li><strong>Payment Information:</strong> Payment method details (securely processed through our payment providers)</li>
                <li><strong>Communication Data:</strong> Records of your interactions with our customer support team</li>
              </ul>

              <h3>Automatically Collected Information</h3>
              <p>When you access our services, we may automatically collect certain information, including:</p>
              <ul>
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage data (pages visited, time spent, navigation patterns)</li>
                <li>Location data (with your permission, for delivery services)</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>

              <h2>3. How We Use Your Information</h2>
              <p>We use the information we collect for the following purposes:</p>
              <ul>
                <li><strong>Service Delivery:</strong> To process and fulfill your dry cleaning orders</li>
                <li><strong>Communication:</strong> To send order updates, delivery notifications, and respond to your inquiries</li>
                <li><strong>Account Management:</strong> To create and maintain your account, and provide personalized services</li>
                <li><strong>Payment Processing:</strong> To process payments and prevent fraudulent transactions</li>
                <li><strong>Service Improvement:</strong> To analyze usage patterns and improve our services</li>
                <li><strong>Marketing:</strong> To send promotional offers and updates (with your consent)</li>
                <li><strong>Legal Compliance:</strong> To comply with legal obligations and protect our rights</li>
              </ul>

              <h2>4. How We Share Your Information</h2>
              <p>We may share your information with:</p>
              <ul>
                <li><strong>Service Providers:</strong> Third-party companies that help us operate our business (payment processors, delivery partners, SMS/WhatsApp providers)</li>
                <li><strong>Business Partners:</strong> Partners who help us provide services you request</li>
                <li><strong>Legal Requirements:</strong> Law enforcement or regulatory authorities when required by law</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, sale, or transfer of our business</li>
              </ul>

              <p><strong>We do not sell your personal information to third parties.</strong></p>

              <h2>5. Data Security</h2>
              <p>
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul>
                <li>Encryption of data in transit and at rest</li>
                <li>Secure access controls and authentication</li>
                <li>Regular security audits and updates</li>
                <li>Employee training on data protection</li>
              </ul>
              <p>
                However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>

              <h2>6. Your Privacy Rights</h2>
              <p>Depending on your location, you may have the following rights regarding your personal information:</p>
              <ul>
                <li><strong>Access:</strong> Request access to the personal information we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Opt-Out:</strong> Opt-out of marketing communications at any time</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent where we rely on consent to process your data</li>
              </ul>

              <p>
                To exercise these rights, please contact us at <a href="mailto:privacy@lorenzo.co.ke">privacy@lorenzo.co.ke</a> or call us at <a href="tel:+254728400200">0728 400 200</a>.
              </p>

              <h2>7. Data Retention</h2>
              <p>
                We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need your information, we will securely delete or anonymize it.
              </p>

              <h2>8. Cookies and Tracking Technologies</h2>
              <p>
                We use cookies and similar tracking technologies to enhance your experience on our website. You can control cookies through your browser settings. However, disabling cookies may limit your ability to use certain features of our services.
              </p>

              <h2>9. Children's Privacy</h2>
              <p>
                Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
              </p>

              <h2>10. International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than Kenya. We ensure that appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
              </p>

              <h2>11. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. We encourage you to review this Privacy Policy periodically.
              </p>

              <h2>12. Contact Us</h2>
              <p>
                If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
              </p>
              <ul>
                <li><strong>Email:</strong> <a href="mailto:privacy@lorenzo.co.ke">privacy@lorenzo.co.ke</a></li>
                <li><strong>Phone:</strong> <a href="tel:+254728400200">0728 400 200</a></li>
                <li><strong>Address:</strong> Nairobi, Kenya</li>
              </ul>

              <h2>13. Compliance with Kenya Data Protection Act</h2>
              <p>
                Lorenzo Dry Cleaners is committed to complying with the Kenya Data Protection Act, 2019, and all applicable data protection regulations. We respect your rights as a data subject and will process your personal information lawfully, fairly, and transparently.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
