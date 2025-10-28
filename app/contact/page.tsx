/**
 * Contact Page
 *
 * Contact page with hero, contact information, and contact form.
 * Features: contact methods, business hours, and message form.
 *
 * @module app/contact/page
 */

import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Footer';
import { ContactInfo } from '@/components/marketing/ContactInfo';
import { ContactForm } from '@/components/marketing/ContactForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | Lorenzo Dry Cleaners',
  description: 'Get in touch with Lorenzo Dry Cleaners. Call +254 725 462 859, email hello@lorenzo.co.ke, or visit us in Kilimani, Nairobi.',
};

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <ContactHero />

      {/* Contact Info */}
      <ContactInfo />

      {/* Contact Form */}
      <ContactForm />

      {/* Footer */}
      <Footer />
    </main>
  );
}

function ContactHero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-white">
      {/* Blue Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-blue via-brand-blue-dark to-brand-blue-900" />
      <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue-50 via-transparent to-brand-blue-900 opacity-40" />

      {/* Decorative blur elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue-light rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl opacity-15" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-medium mb-6 border-2 border-white/30">
            GET IN TOUCH
          </span>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight" style={{ color: 'white' }}>
            We're Here to
            <br />
            <span className="text-brand-blue-light">Help You</span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Have a question about our services? Need assistance with your order? Our friendly team is ready to help.
          </p>

          {/* Quick Contact Options */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="tel:+254725462859"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto"
              style={{ backgroundColor: '#22BBFF' }}
            >
              Call Us Now
            </a>
            <a
              href="https://wa.me/254725462859"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-black font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
