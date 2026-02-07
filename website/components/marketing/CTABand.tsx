/**
 * CTABand Component
 *
 * High-impact call-to-action section with gradient background.
 * Used to drive conversions throughout the marketing site.
 *
 * @module components/marketing/CTABand
 */

'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar } from 'lucide-react';

interface CTABandProps {
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonHref?: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
  variant?: 'blue' | 'dark';
}

export function CTABand({
  title = "Let's Make Laundry the Easiest Chore Ever",
  description = 'With our hassle-free service, you will never have to worry about laundry again. Just tap and relax.',
  primaryButtonText = 'Schedule Pickup',
  primaryButtonHref = '/contact',
  secondaryButtonText = 'Browse Services',
  secondaryButtonHref = '/services',
  variant = 'blue',
}: CTABandProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.0, 0.0, 0.2, 1.0] as [number, number, number, number],
      },
    },
  };

  const gradientClass = variant === 'blue'
    ? 'bg-gradient-to-r from-lorenzo-dark via-lorenzo-teal to-lorenzo-dark'
    : 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900';

  return (
    <section ref={ref} className="py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className={`relative overflow-hidden rounded-3xl ${gradientClass} p-8 sm:p-12 lg:p-16 shadow-2xl`}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight"
            >
              {title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto"
            >
              {description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              {/* Primary Button */}
              <Button
                asChild
                size="lg"
                className="bg-lorenzo-gold text-lorenzo-dark hover:bg-lorenzo-gold-dark rounded-full px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              >
                <Link href={primaryButtonHref} className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {primaryButtonText}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>

              {/* Secondary Button */}
              {secondaryButtonText && secondaryButtonHref && (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-2 border-white/50 text-white hover:bg-white/10 hover:border-white backdrop-blur-sm rounded-full px-8 py-6 text-lg font-semibold transition-all hover:scale-105"
                >
                  <Link href={secondaryButtonHref}>{secondaryButtonText}</Link>
                </Button>
              )}
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-6 text-white/80 text-sm"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Fast Pickup</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Fresh Finish</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Eco Friendly</span>
              </div>
            </motion.div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Contact CTA variant with phone number
 */
export function CTAContact() {
  return (
    <CTABand
      title="Have Questions? We're Here to Help"
      description="Our friendly team is ready to assist you with any inquiries about our services."
      primaryButtonText="Call Us Now"
      primaryButtonHref="tel:+254725462859"
      secondaryButtonText="Send a Message"
      secondaryButtonHref="/contact"
      variant="dark"
    />
  );
}

/**
 * Discount CTA variant for promotions
 */
export function CTADiscount() {
  return (
    <CTABand
      title="20% OFF First Order"
      description="Get your first load washed, folded, and delivered at a special rate. Limited time only!"
      primaryButtonText="Claim Your Discount"
      primaryButtonHref="/contact"
      secondaryButtonText="Learn More"
      secondaryButtonHref="/services"
      variant="blue"
    />
  );
}
