/**
 * About Page
 *
 * About page showcasing company story, values, and statistics.
 * Features: hero section, company story, values, stats, and testimonials.
 *
 * @module app/about/page
 */

import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Footer';
import { CompanyStory } from '@/components/marketing/CompanyStory';
import { OurValues } from '@/components/marketing/OurValues';
import { StatsBar } from '@/components/marketing/StatsBar';
import { Testimonials } from '@/components/marketing/Testimonials';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | Lorenzo Dry Cleaners',
  description: 'Learn about Lorenzo Dry Cleaners - premium garment care service in Kilimani, Nairobi. Our story, values, and commitment to excellence.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <AboutHero />

      {/* Company Story */}
      <CompanyStory />

      {/* Stats Bar */}
      <StatsBar />

      {/* Our Values */}
      <OurValues />

      {/* Testimonials */}
      <Testimonials />

      {/* Final CTA */}
      <AboutCTA />

      {/* Footer */}
      <Footer />
    </main>
  );
}

function AboutHero() {
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
            ABOUT LORENZO
          </span>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight" style={{ color: 'white' }}>
            Premium Care,
            <br />
            <span className="text-brand-blue-light">Trusted Service</span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Since 2024, we've been revolutionizing garment care in Nairobi with professional service, modern convenience, and unwavering commitment to quality.
          </p>
        </div>
      </div>
    </section>
  );
}

function AboutCTA() {
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
              Join Our Growing
              <span className="text-brand-blue"> Community</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Experience the Lorenzo difference. Book your first service today and see why we're Kilimani's trusted choice for garment care.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/customer-login"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                style={{ backgroundColor: '#22BBFF' }}
              >
                Get Started
              </a>
              <a
                href="/services"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-black font-semibold border-2 border-gray-200 shadow-lg hover:shadow-xl hover:border-brand-blue transition-all duration-300 hover:scale-105 w-full sm:w-auto"
              >
                View Services
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
