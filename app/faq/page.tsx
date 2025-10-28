/**
 * FAQ Page
 *
 * Frequently Asked Questions with collapsible accordion design.
 * Features: hero section, categorized FAQs, and contact CTA.
 *
 * @module app/faq/page
 */

'use client';

import { useState } from 'react';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Footer';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqCategories = [
  {
    id: 'general',
    name: 'General Questions',
    questions: [
      {
        id: 'track-order',
        question: 'How do I track my order?',
        answer: 'You can track your order by logging into your account at our customer portal. Once logged in, go to "My Orders" and click on the order you want to track. You\'ll see real-time updates on your order status, from pickup to delivery.',
      },
      {
        id: 'order-status',
        question: 'What do the different order statuses mean?',
        answer: 'Our order statuses include: Received (we\'ve collected your items), Washing (items are being cleaned), Drying (items are in the drying process), Ironing (items are being pressed), Quality Check (final inspection), Packaging (being prepared for return), Ready (ready for pickup/delivery), and Delivered (returned to you).',
      },
      {
        id: 'first-time',
        question: 'How do I use your service for the first time?',
        answer: 'Getting started is easy! Simply create an account on our customer portal, schedule a pickup time and location, and our driver will collect your garments. You\'ll receive updates throughout the cleaning process and can schedule delivery or pickup when ready.',
      },
    ],
  },
  {
    id: 'delivery',
    name: 'Pickup & Delivery',
    questions: [
      {
        id: 'delivery-areas',
        question: 'What areas do you serve?',
        answer: 'We currently serve Kilimani and surrounding areas in Nairobi. Pickup and delivery are free within Kilimani. For areas outside Kilimani, please contact us to check availability and any additional delivery fees that may apply.',
      },
      {
        id: 'delivery-times',
        question: 'How long does delivery take?',
        answer: 'Standard service takes 2-3 days from pickup to delivery. We also offer Express Service with 24-hour turnaround for urgent needs. You can select your preferred service level when creating your order.',
      },
      {
        id: 'schedule-pickup',
        question: 'Can I schedule a specific pickup time?',
        answer: 'Yes! When creating your order, you can choose a convenient pickup time slot. We offer flexible scheduling from 8am to 6pm, Monday through Saturday. Our system will show you available time slots based on your location.',
      },
      {
        id: 'missed-delivery',
        question: 'What happens if I miss my delivery?',
        answer: 'If you\'re not available during delivery, our driver will contact you to reschedule. Your items will be safely stored at our facility. You can also choose to collect your items from our Kilimani location at your convenience.',
      },
    ],
  },
  {
    id: 'payment',
    name: 'Payments & Pricing',
    questions: [
      {
        id: 'payment-methods',
        question: 'What payment methods do you accept?',
        answer: 'We accept Cash, M-Pesa, Credit/Debit Cards (Visa, Mastercard), and we also offer account credit for regular customers. Payment can be made at pickup, delivery, or through our online portal.',
      },
      {
        id: 'pricing',
        question: 'How much do your services cost?',
        answer: 'Our pricing varies by service and garment type. Dry cleaning starts from KSh 150 per garment, Wash & Fold from KSh 150, and Express Service from KSh 250. Visit our Services page for detailed pricing or get a free quote through your customer account.',
      },
      {
        id: 'price-changes',
        question: 'Will I know the exact price before you clean my items?',
        answer: 'Yes! After our initial inspection during pickup, we\'ll provide you with an exact quote through your customer portal. You can approve the quote before we proceed with cleaning. No surprises!',
      },
    ],
  },
  {
    id: 'services',
    name: 'Services & Care',
    questions: [
      {
        id: 'special-instructions',
        question: 'Can I provide special care instructions?',
        answer: 'Absolutely! When creating your order, you can add special instructions for each garment or for the entire order. Whether it\'s extra starch, gentle cleaning, or specific stain treatment, just let us know and our team will follow your preferences.',
      },
      {
        id: 'damage-liability',
        question: 'What if my garment gets damaged?',
        answer: 'We take utmost care with every item. All garments are inspected before cleaning, and any notable damage is documented with photos. In the rare event of damage during our service, we have a fair compensation policy. Please refer to our Terms of Service for full details.',
      },
      {
        id: 'stain-removal',
        question: 'Can you remove all types of stains?',
        answer: 'We have professional expertise in treating most common stains including oil, wine, ink, and food stains. However, some stains (especially old or set-in stains) may not be completely removable. We always communicate with you about challenging stains and do our best to treat them safely.',
      },
      {
        id: 'eco-friendly',
        question: 'Are your cleaning methods eco-friendly?',
        answer: 'Yes! We use environmentally responsible cleaning methods and biodegradable products whenever possible. Our processes are designed to be effective on your garments while minimizing environmental impact. Learn more about our sustainability practices on our Blog.',
      },
    ],
  },
  {
    id: 'account',
    name: 'Account & Profile',
    questions: [
      {
        id: 'create-account',
        question: 'Do I need an account to use your service?',
        answer: 'While you can use our service without an account, creating one gives you access to order tracking, order history, saved addresses, faster booking, and exclusive offers. It only takes a minute to sign up!',
      },
      {
        id: 'forgot-password',
        question: 'I forgot my password. How do I reset it?',
        answer: 'Click on "Forgot Password" on the login page. Enter your registered phone number or email, and we\'ll send you a reset link. Follow the instructions in the message to create a new password.',
      },
      {
        id: 'update-info',
        question: 'How do I update my profile information?',
        answer: 'Log into your account and go to "My Profile". There you can update your contact information, delivery addresses, payment methods, and communication preferences. Changes are saved instantly.',
      },
    ],
  },
];

export default function FAQPage() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleQuestion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <FAQHero />

      {/* FAQ Categories */}
      <section className="relative py-24 overflow-hidden bg-white">
        {/* Light Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue-50 via-white to-brand-blue-100" />

        {/* Decorative blur elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue-light rounded-full blur-3xl opacity-15" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-blue rounded-full blur-3xl opacity-10" />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-16">
            {faqCategories.map((category) => (
              <div key={category.id}>
                <h2 className="text-2xl sm:text-3xl font-bold text-black mb-8">
                  {category.name}
                </h2>

                <div className="space-y-4">
                  {category.questions.map((faq) => (
                    <div
                      key={faq.id}
                      id={faq.id}
                      className="bg-white/70 backdrop-blur-xl border-2 border-white/60 rounded-2xl shadow-card overflow-hidden transition-all duration-300 hover:shadow-lg"
                    >
                      <button
                        onClick={() => toggleQuestion(faq.id)}
                        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/50 transition-colors duration-200"
                      >
                        <span className="text-lg font-semibold text-black pr-8">
                          {faq.question}
                        </span>
                        <ChevronDown
                          className={cn(
                            'w-6 h-6 flex-shrink-0 transition-transform duration-300',
                            openId === faq.id && 'rotate-180'
                          )}
                          style={{ color: '#22BBFF' }}
                        />
                      </button>

                      {openId === faq.id && (
                        <div className="px-6 pb-5 pt-2">
                          <div className="border-t-2 border-gray-100 pt-4">
                            <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <FAQFooterCTA />

      {/* Footer */}
      <Footer />
    </main>
  );
}

function FAQHero() {
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
            FREQUENTLY ASKED QUESTIONS
          </span>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight" style={{ color: 'white' }}>
            Your Questions,
            <br />
            <span className="text-brand-blue-light">Answered</span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Find quick answers to the most common questions about our dry cleaning services, delivery, pricing, and more.
          </p>
        </div>
      </div>
    </section>
  );
}

function FAQFooterCTA() {
  return (
    <section className="relative py-16 overflow-hidden bg-white">
      {/* Blue Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-brand-blue-50 to-brand-blue-100" />

      {/* Decorative blur elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-blue-light rounded-full blur-3xl opacity-20" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Glassmorphism Card */}
          <div className="bg-white/70 backdrop-blur-xl border-2 border-white/60 rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
              Didn't Find Your
              <span className="text-brand-blue"> Answer?</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Our support team is always ready to help. Get in touch and we'll answer any questions you have.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/help"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                style={{ backgroundColor: '#22BBFF' }}
              >
                Visit Help Center
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-black font-semibold border-2 border-gray-200 shadow-lg hover:shadow-xl hover:border-brand-blue transition-all duration-300 hover:scale-105 w-full sm:w-auto"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
