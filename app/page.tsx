/**
 * Landing Page
 *
 * Premium marketing homepage for Lorenzo Dry Cleaners.
 * Features: hero video, features grid, process steps, testimonials, and CTAs.
 *
 * @module app/page
 */

import { HeroVideo } from '@/components/marketing/HeroVideo';
import { AboutLorenzo } from '@/components/marketing/AboutLorenzo';
import { FeaturesGrid } from '@/components/marketing/FeaturesGrid';
import { ProcessSteps } from '@/components/marketing/ProcessSteps';
import { Testimonials } from '@/components/marketing/Testimonials';
import { CTABand } from '@/components/marketing/CTABand';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <HeroVideo
        videoSrcMp4="/videos/hero-video.mp4"
        headline="Premium Dry Cleaning"
        subheading="Professional garment care"
        primaryCtaText="Get Started"
        primaryCtaHref="/customer-login"
        secondaryCtaText="Learn More"
        secondaryCtaHref="#services"
      />

      {/* About Lorenzo Section */}
      <AboutLorenzo />

      {/* Features Section */}
      <FeaturesGrid />

      {/* How It Works Section */}
      <ProcessSteps />

      {/* CTA Band */}
      <CTABand
        title="Ready to Experience Premium Care?"
        description="Join hundreds of satisfied customers who trust us with their garments every week."
        primaryButtonText="Get Started Today"
        primaryButtonHref="/contact"
        secondaryButtonText="View Pricing"
        secondaryButtonHref="/services"
      />

      {/* Testimonials Section */}
      <Testimonials />

      {/* Final CTA */}
      <CTABand
        title="Let's Make Laundry the Easiest Chore Ever"
        description="Book your first pickup today and discover why we're Nairobi's most trusted dry cleaning service."
        primaryButtonText="Schedule Pickup"
        primaryButtonHref="/contact"
        secondaryButtonText="Call Us Now"
        secondaryButtonHref="tel:+254725462859"
        variant="blue"
      />

      {/* Footer */}
      <Footer />
    </main>
  );
}
