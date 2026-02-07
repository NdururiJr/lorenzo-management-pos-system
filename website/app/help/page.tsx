/**
 * Help Center Page
 *
 * Help center with common topics, support resources, and contact information.
 * Features: hero section, help topics grid, and contact options.
 *
 * @module app/help/page
 */

import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Footer';
import { Metadata } from 'next';
import { Phone, Mail, MessageCircle, Book, Package, CreditCard, Truck, Users } from 'lucide-react';
import Link from 'next/link';

/** POS system URL for customer login */
const CUSTOMER_LOGIN_URL = `${process.env.NEXT_PUBLIC_POS_API_URL || 'http://localhost:3000'}/customer-login`;

export const metadata: Metadata = {
  title: 'Help Center | Lorenzo Dry Cleaners',
  description: 'Get help with your orders, payments, delivery, and more. Find answers to common questions and contact our support team.',
};

const helpTopics = [
  {
    id: 1,
    icon: Package,
    title: 'Orders & Tracking',
    description: 'Track your order, view order history, and understand our order process.',
    links: [
      { name: 'How to track my order', href: '/faq#track-order', external: false },
      { name: 'Order status meanings', href: '/faq#order-status', external: false },
      { name: 'View order history', href: CUSTOMER_LOGIN_URL, external: true },
    ],
  },
  {
    id: 2,
    icon: Truck,
    title: 'Pickup & Delivery',
    description: 'Schedule pickups, understand delivery times, and manage your address.',
    links: [
      { name: 'Schedule a pickup', href: CUSTOMER_LOGIN_URL, external: true },
      { name: 'Delivery areas', href: '/faq#delivery-areas', external: false },
      { name: 'Delivery times', href: '/faq#delivery-times', external: false },
    ],
  },
  {
    id: 3,
    icon: CreditCard,
    title: 'Payments & Pricing',
    description: 'Payment methods, pricing information, and billing questions.',
    links: [
      { name: 'View pricing', href: '/services', external: false },
      { name: 'Payment methods', href: '/faq#payment-methods', external: false },
      { name: 'Get a quote', href: CUSTOMER_LOGIN_URL, external: true },
    ],
  },
  {
    id: 4,
    icon: Book,
    title: 'Services & Care',
    description: 'Learn about our services, garment care tips, and special requests.',
    links: [
      { name: 'Our services', href: '/services', external: false },
      { name: 'Garment care tips', href: '/blog', external: false },
      { name: 'Special instructions', href: '/faq#special-instructions', external: false },
    ],
  },
  {
    id: 5,
    icon: Users,
    title: 'Account & Profile',
    description: 'Manage your account, update profile information, and preferences.',
    links: [
      { name: 'Create an account', href: CUSTOMER_LOGIN_URL, external: true },
      { name: 'Update profile', href: CUSTOMER_LOGIN_URL, external: true },
      { name: 'Change password', href: CUSTOMER_LOGIN_URL, external: true },
    ],
  },
  {
    id: 6,
    icon: MessageCircle,
    title: 'Contact Support',
    description: 'Get in touch with our support team for personalized assistance.',
    links: [
      { name: 'Call us', href: 'tel:+254728400200', external: true },
      { name: 'Email us', href: 'mailto:hello@lorenzo.co.ke', external: true },
      { name: 'WhatsApp', href: 'https://wa.me/254728400200', external: true },
    ],
  },
];

export default function HelpPage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <HelpHero />

      {/* Help Topics Grid */}
      <HelpTopicsGrid />

      {/* Contact Support Section */}
      <ContactSupport />

      {/* Footer */}
      <Footer />
    </main>
  );
}

function HelpHero() {
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
            HELP CENTER
          </span>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
            How Can We
            <br />
            <span className="text-lorenzo-gold">Help You?</span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Find answers to common questions, learn about our services, or get in touch with our support team.
          </p>
        </div>
      </div>
    </section>
  );
}

function HelpTopicsGrid() {
  return (
    <section className="relative py-24 overflow-hidden bg-white">
      {/* Light Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-lorenzo-accent-teal-50 via-white to-lorenzo-accent-teal-100" />

      {/* Decorative blur elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-lorenzo-accent-teal-light rounded-full blur-3xl opacity-15" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-lorenzo-accent-teal rounded-full blur-3xl opacity-10" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
            Browse by
            <span className="text-lorenzo-accent-teal"> Topic</span>
          </h2>
          <p className="text-lg text-gray-600">
            Choose a topic below to find helpful resources and answers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {helpTopics.map((topic) => {
            const Icon = topic.icon;
            return (
              <div
                key={topic.id}
                className="bg-white/70 backdrop-blur-xl border-2 border-white/60 rounded-3xl shadow-card hover:shadow-2xl transition-all duration-300 p-8 group hover:scale-[1.02]"
              >
                {/* Icon */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: '#2DD4BF' }}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-black mb-3 group-hover:text-lorenzo-accent-teal transition-colors duration-300">
                  {topic.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  {topic.description}
                </p>

                {/* Links */}
                <ul className="space-y-3">
                  {topic.links.map((link, idx) => (
                    <li key={idx}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lorenzo-accent-teal text-sm font-medium hover:underline inline-flex items-center gap-2 hover:gap-3 transition-all duration-300"
                        >
                          {link.name}
                          <span>→</span>
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-lorenzo-accent-teal text-sm font-medium hover:underline inline-flex items-center gap-2 hover:gap-3 transition-all duration-300"
                        >
                          {link.name}
                          <span>→</span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ContactSupport() {
  return (
    <section className="relative py-16 overflow-hidden bg-white">
      {/* Blue Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-lorenzo-accent-teal-50 to-lorenzo-accent-teal-100" />

      {/* Decorative blur elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-lorenzo-accent-teal-light rounded-full blur-3xl opacity-20" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Instant Help with Melvin Card */}
          <div className="bg-lorenzo-dark/95 backdrop-blur-xl border-2 border-lorenzo-accent-teal/30 rounded-3xl shadow-2xl p-8 md:p-10 text-center">
            <div className="flex flex-col items-center">
              {/* Melvin Icon */}
              <div className="w-20 h-20 rounded-full bg-lorenzo-accent-teal/20 border-2 border-lorenzo-accent-teal flex items-center justify-center mb-4">
                <MessageCircle className="w-10 h-10 text-lorenzo-accent-teal" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Get Instant Help with
                <span className="text-lorenzo-gold"> Melvin</span>
              </h2>
              <p className="text-white/80 mb-6 max-w-xl mx-auto">
                Our AI assistant Melvin is available 24/7 to help with order tracking, pricing questions, service information, and more. Click the chat icon in the bottom right corner to start chatting!
              </p>
              <div className="flex items-center gap-2 text-sm text-lorenzo-accent-teal">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>Melvin is online and ready to help</span>
              </div>
            </div>
          </div>

          {/* Contact Support Card */}
          <div className="bg-white/70 backdrop-blur-xl border-2 border-white/60 rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
              Prefer to Talk to
              <span className="text-lorenzo-accent-teal"> Someone?</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Our friendly support team is here to assist you. Get in touch and we'll respond as soon as possible.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="tel:+254728400200"
                className="inline-flex items-center gap-2 justify-center px-8 py-4 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                style={{ backgroundColor: '#2DD4BF' }}
              >
                <Phone className="w-5 h-5" />
                Call Us
              </a>
              <a
                href="https://wa.me/254728400200"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 justify-center px-8 py-4 rounded-xl bg-white text-black font-semibold border-2 border-gray-200 shadow-lg hover:shadow-xl hover:border-lorenzo-accent-teal transition-all duration-300 hover:scale-105 w-full sm:w-auto"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </a>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 justify-center px-8 py-4 rounded-xl bg-white text-black font-semibold border-2 border-gray-200 shadow-lg hover:shadow-xl hover:border-lorenzo-accent-teal transition-all duration-300 hover:scale-105 w-full sm:w-auto"
              >
                <Mail className="w-5 h-5" />
                Email Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
