/**
 * Landing Page
 *
 * Premium marketing homepage for Lorenzo Dry Cleaners.
 * Features: hero video, features grid, process steps, testimonials, and CTAs.
 *
 * @module app/page
 */

import type { Metadata } from 'next';
import { HeroVideo } from '@/components/marketing/HeroVideo';
import { AboutLorenzo } from '@/components/marketing/AboutLorenzo';
import { FeaturesGrid } from '@/components/marketing/FeaturesGrid';
import { ProcessSteps } from '@/components/marketing/ProcessSteps';
import { ProcessStepsV2 } from '@/components/marketing/ProcessStepsV2';
import { FeaturedBlogs } from '@/components/marketing/FeaturedBlogs';
import { Testimonials } from '@/components/marketing/Testimonials';
import { Newsletter } from '@/components/marketing/Newsletter';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Footer';
import { LocalBusinessJsonLd } from '@/components/seo/JsonLd';

/** Feature flag to toggle between ProcessSteps versions */
const USE_NEW_PROCESS_STEPS = false; // Set to false to revert to original design

export const metadata: Metadata = {
  title: 'Lorenzo Dry Cleaners - Premium Dry Cleaning Services in Nairobi',
  description:
    'Professional dry cleaning services across Nairobi with 21+ branches. Expert garment care, same-day service, free pickup & delivery. Kenya\'s trusted partner since 2013.',
  alternates: {
    canonical: '/',
  },
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <LocalBusinessJsonLd />

      {/* Header */}
      <Header />

      {/* Hero Section */}
      <HeroVideo
        videoSrcMp4="/videos/hero-video.mp4"
        headline="Premium"
        headlineHighlight="Dry Cleaning"
        subheading="Professional garment care"
      />

      {/* About Lorenzo Section */}
      <AboutLorenzo />

      {/* Features Section */}
      <FeaturesGrid />

      {/* How It Works Section */}
      {USE_NEW_PROCESS_STEPS ? <ProcessStepsV2 /> : <ProcessSteps />}

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
