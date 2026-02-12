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
  title: 'About Lorenzo - Nairobi\'s Trusted Dry Cleaners Since 2013',
  description: 'Lorenzo Dry Cleaners - Kenya\'s distinguished premium dry-cleaning brand. Established in 2013 with 21+ branches across Nairobi, delivering exceptional fabric care.',
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  const POS_URL = process.env.NEXT_PUBLIC_POS_API_URL || 'http://localhost:3000';

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
      <AboutCTA posUrl={POS_URL} />

      {/* Footer */}
      <Footer />
    </main>
  );
}

function AboutHero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-lorenzo-dark">
      {/* Dark Teal Gradient Background - matching footer */}
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
            ESTABLISHED 2013
          </span>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
            Premium Fabric Care,
            <br />
            <span className="text-lorenzo-gold">Kenya's Trusted Choice</span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Setting the benchmark for exceptional fabric care since 2013. Over a decade of expertise with 21+ branches across Nairobi and environs.
          </p>
        </div>
      </div>
    </section>
  );
}

function AboutCTA({ posUrl }: { posUrl: string }) {
  return (
    <section className="relative py-16 overflow-hidden bg-white">
      {/* Blue Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-lorenzo-accent-teal-50 via-white to-lorenzo-accent-teal-100" />

      {/* Decorative blur elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-lorenzo-accent-teal-light rounded-full blur-3xl opacity-20" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Glassmorphism Card */}
          <div className="bg-white/70 backdrop-blur-xl border-2 border-white/60 rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
              Join Our Growing
              <span className="text-lorenzo-accent-teal"> Community</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Experience the Lorenzo difference. Book your first service today and see why we're Kenya's trusted choice for garment care.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={`${posUrl}/customer-login`}
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                style={{ backgroundColor: '#2DD4BF' }}
              >
                Get Started
              </a>
              <a
                href="/services"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-black font-semibold border-2 border-gray-200 shadow-lg hover:shadow-xl hover:border-lorenzo-accent-teal transition-all duration-300 hover:scale-105 w-full sm:w-auto"
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
