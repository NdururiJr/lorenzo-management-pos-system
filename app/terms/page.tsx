/**
 * Terms of Service Page
 *
 * Terms and conditions for using Lorenzo Dry Cleaners services.
 * Features: hero section, terms sections, and contact information.
 *
 * @module app/terms/page
 */

import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Lorenzo Dry Cleaners',
  description: 'Read the terms and conditions for using Lorenzo Dry Cleaners services.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <TermsHero />

      {/* Terms Content */}
      <TermsContent />

      {/* Footer */}
      <Footer />
    </main>
  );
}

function TermsHero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-white">
      {/* Blue Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-blue via-brand-blue-dark to-brand-blue-900" />
      <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue-50 via-transparent to-brand-blue-900 opacity-40" />

      {/* Decorative blur elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-blue-light rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl opacity-15" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-medium mb-6 border-2 border-white/30">
            TERMS OF SERVICE
          </span>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight" style={{ color: 'white' }}>
            Terms &
            <br />
            <span className="text-brand-blue-light">Conditions</span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-white/90 mb-4 max-w-2xl mx-auto leading-relaxed">
            Please read these terms carefully before using our services.
          </p>
          <p className="text-sm text-white/70">
            Last Updated: January 15, 2025
          </p>
        </div>
      </div>
    </section>
  );
}

function TermsContent() {
  return (
    <section className="relative py-24 overflow-hidden bg-white">
      {/* Light Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-blue-50 via-white to-brand-blue-100" />

      {/* Decorative blur elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue-light rounded-full blur-3xl opacity-15" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-blue rounded-full blur-3xl opacity-10" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/70 backdrop-blur-xl border-2 border-white/60 rounded-3xl shadow-card p-8 md:p-12">
            <div className="prose prose-lg max-w-none">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing and using the services of Lorenzo Dry Cleaners ("Company," "we," "our," or "us"), you accept and agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our services.
              </p>

              <h2>2. Services Description</h2>
              <p>
                Lorenzo Dry Cleaners provides professional dry cleaning, laundry, and garment care services, including but not limited to:
              </p>
              <ul>
                <li>Dry cleaning of garments and textiles</li>
                <li>Wash and fold laundry services</li>
                <li>Express cleaning services</li>
                <li>Pickup and delivery services</li>
                <li>Specialized garment care and treatment</li>
              </ul>

              <h2>3. User Accounts</h2>
              <h3>Account Creation</h3>
              <p>
                To use certain features of our services, you must create an account. You agree to:
              </p>
              <ul>
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information to keep it accurate</li>
                <li>Maintain the security of your password and account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Be responsible for all activities that occur under your account</li>
              </ul>

              <h3>Account Termination</h3>
              <p>
                We reserve the right to suspend or terminate your account if you violate these Terms or engage in fraudulent, illegal, or harmful activities.
              </p>

              <h2>4. Orders and Payments</h2>
              <h3>Order Placement</h3>
              <p>
                When you place an order with us, you agree that:
              </p>
              <ul>
                <li>All information provided is accurate and complete</li>
                <li>You authorize us to charge the payment method provided</li>
                <li>Prices are subject to change but orders already placed will honor the quoted price</li>
                <li>We reserve the right to refuse or cancel orders in certain circumstances</li>
              </ul>

              <h3>Payment Terms</h3>
              <ul>
                <li>Payment is due upon completion of services unless otherwise agreed</li>
                <li>We accept Cash, M-Pesa, Credit/Debit Cards, and Account Credit</li>
                <li>Late payments may result in service suspension</li>
                <li>Disputed charges must be reported within 7 days</li>
              </ul>

              <h2>5. Pickup and Delivery</h2>
              <h3>Service Areas</h3>
              <p>
                We provide pickup and delivery services within Kilimani and select surrounding areas in Nairobi. Availability and fees for areas outside Kilimani may vary.
              </p>

              <h3>Scheduling</h3>
              <ul>
                <li>Pickup and delivery times are estimates, not guarantees</li>
                <li>You must be available at the scheduled time or provide alternative arrangements</li>
                <li>We may reschedule if weather or other circumstances prevent safe delivery</li>
                <li>Cancellations must be made at least 2 hours before scheduled time</li>
              </ul>

              <h2>6. Liability and Garment Care</h2>
              <h3>Pre-Service Inspection</h3>
              <p>
                All garments are inspected before cleaning. We will:
              </p>
              <ul>
                <li>Document any pre-existing damage with photographs</li>
                <li>Notify you of items that may require special care</li>
                <li>Recommend appropriate cleaning methods for your garments</li>
              </ul>

              <h3>Limitation of Liability</h3>
              <p>
                While we exercise the utmost care in handling your garments, we cannot be held liable for:
              </p>
              <ul>
                <li>Damage to garments with pre-existing conditions (tears, worn fabric, loose buttons)</li>
                <li>Color bleeding or fading inherent to the fabric or previous cleaning</li>
                <li>Shrinkage of garments not labeled with care instructions</li>
                <li>Damage from concealed objects left in pockets</li>
                <li>Loss or damage due to Acts of God, theft, or events beyond our control</li>
              </ul>

              <h3>Claims and Compensation</h3>
              <p>
                In the event of damage or loss caused by our negligence:
              </p>
              <ul>
                <li>Claims must be reported within 7 days of delivery</li>
                <li>Compensation will be limited to 10 times the cleaning charge for the item, or the fair market value (whichever is less)</li>
                <li>Maximum liability per item is KSh 50,000</li>
                <li>Claims require proof of purchase and value of the item</li>
                <li>We reserve the right to inspect and assess damaged items</li>
              </ul>

              <h2>7. Unclaimed Items</h2>
              <p>
                Items not claimed within 90 days of notification will be considered abandoned. We reserve the right to:
              </p>
              <ul>
                <li>Charge storage fees after 30 days</li>
                <li>Donate or dispose of unclaimed items after 90 days</li>
                <li>Use the proceeds from sale to offset cleaning and storage costs</li>
              </ul>

              <h2>8. Prohibited Items</h2>
              <p>
                We do not accept the following items for cleaning:
              </p>
              <ul>
                <li>Items contaminated with hazardous materials</li>
                <li>Garments soiled with bodily fluids without prior disclosure</li>
                <li>Items containing illegal substances or materials</li>
                <li>Valuable items such as jewelry, cash, or documents left in pockets</li>
              </ul>

              <h2>9. Intellectual Property</h2>
              <p>
                All content on our website and mobile applications, including text, graphics, logos, images, and software, is the property of Lorenzo Dry Cleaners and protected by copyright and trademark laws. You may not use, reproduce, or distribute our content without written permission.
              </p>

              <h2>10. Privacy</h2>
              <p>
                Your use of our services is also governed by our <a href="/privacy">Privacy Policy</a>, which explains how we collect, use, and protect your personal information.
              </p>

              <h2>11. Modifications to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting on our website. Your continued use of our services after changes are posted constitutes acceptance of the modified Terms.
              </p>

              <h2>12. Governing Law</h2>
              <p>
                These Terms are governed by and construed in accordance with the laws of Kenya. Any disputes arising from these Terms or our services shall be subject to the exclusive jurisdiction of the courts of Kenya.
              </p>

              <h2>13. Dispute Resolution</h2>
              <p>
                In the event of a dispute, we encourage you to contact us first to seek a resolution. If we cannot resolve the dispute through negotiation, either party may pursue legal remedies under Kenyan law.
              </p>

              <h2>14. Severability</h2>
              <p>
                If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will continue in full force and effect.
              </p>

              <h2>15. Entire Agreement</h2>
              <p>
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and Lorenzo Dry Cleaners regarding your use of our services.
              </p>

              <h2>16. Contact Information</h2>
              <p>
                If you have questions about these Terms, please contact us:
              </p>
              <ul>
                <li><strong>Email:</strong> <a href="mailto:legal@lorenzo.co.ke">legal@lorenzo.co.ke</a></li>
                <li><strong>Phone:</strong> <a href="tel:+254725462859">+254 725 462 859</a></li>
                <li><strong>Address:</strong> Kilimani, Nairobi, Kenya</li>
              </ul>

              <h2>17. Acknowledgment</h2>
              <p>
                By using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
