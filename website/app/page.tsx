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
import { FeaturedBlogs } from '@/components/marketing/FeaturedBlogs';
import { Testimonials } from '@/components/marketing/Testimonials';
import { Newsletter } from '@/components/marketing/Newsletter';
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

      {/* Featured Blogs Section */}
      <FeaturedBlogs />

      {/* Testimonials Section */}
      <Testimonials />

      {/* Newsletter Section */}
      <Newsletter />

      {/* Footer */}
      <Footer />
    </main>
  );
}
