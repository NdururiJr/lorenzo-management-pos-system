/**
 * Services Page
 *
 * Displays all services offered by Lorenzo Dry Cleaners with pricing information.
 * Features: hero section, services grid, pricing, testimonials, and CTA.
 *
 * @module app/services/page
 */

import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Footer';
import { ServicesGrid } from '@/components/marketing/ServicesGrid';
import { PricingSection } from '@/components/marketing/PricingSection';
import { Testimonials } from '@/components/marketing/Testimonials';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Services & Pricing | Lorenzo Dry Cleaners',
  description: 'Professional dry cleaning, wash & fold, express service, and free pickup & delivery in Kilimani, Nairobi. Transparent pricing, quality guaranteed.',
};

export default function ServicesPage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <ServicesHero />

      {/* Services Grid */}
      <ServicesGrid />

      {/* Pricing Section */}
      <PricingSection />

      {/* Testimonials */}
      <Testimonials />

      {/* Final CTA */}
      <ServicesCTA />

      {/* Footer */}
      <Footer />
    </main>
  );
}

function ServicesHero() {
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
            PREMIUM GARMENT CARE
          </span>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight" style={{ color: 'white' }}>
            Professional Services for
            <br />
            <span className="text-brand-blue-light">Every Garment</span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            From everyday laundry to luxury dry cleaning, we provide comprehensive care solutions tailored to your wardrobe needs.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-2xl p-4">
              <div className="text-3xl font-bold text-white mb-1">24hrs</div>
              <div className="text-sm text-white/80">Express Service</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-2xl p-4">
              <div className="text-3xl font-bold text-white mb-1">500+</div>
              <div className="text-sm text-white/80">Happy Customers</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-2xl p-4">
              <div className="text-3xl font-bold text-white mb-1">98%</div>
              <div className="text-sm text-white/80">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServicesCTA() {
  return (
    <section className="relative py-16 overflow-hidden bg-white">
      {/* Blue Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-blue-50 via-white to-brand-blue-100" />

      {/* Decorative blur elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-blue-light rounded-full blur-3xl opacity-20" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Glassmorphism Card */}
          <div className="bg-white/70 backdrop-blur-xl border-2 border-white/60 rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
              Ready to Experience
              <span className="text-brand-blue"> Premium Care?</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Book your first service today and discover why hundreds of Kilimani residents trust Lorenzo for their garment care needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/customer-login"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                style={{ backgroundColor: '#22BBFF' }}
              >
                Book Now
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
