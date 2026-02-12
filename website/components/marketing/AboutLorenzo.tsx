/**
 * AboutLorenzo Component
 *
 * Modern two-column section with glassmorphism effects and teal/gold gradient background.
 * Features: scroll animations, hover effects, Lorenzo teal/gold accents, CTA button.
 *
 * @module components/marketing/AboutLorenzo
 */

'use client';

import { motion, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Sparkles, Truck, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Sparkles,
    title: 'Premium Finishing',
    description: 'Expert care, precision handling, and premium finishing—every garment receives the attention it deserves.',
  },
  {
    icon: Truck,
    title: '21+ Branches',
    description: 'Convenient locations across Nairobi and environs, with reliable pickup and delivery service.',
  },
];

export function AboutLorenzo() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const POS_URL = process.env.NEXT_PUBLIC_POS_API_URL || 'http://localhost:3000';

  // Animation variants
  const imageVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9, x: -50 },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: [0.0, 0.0, 0.2, 1.0] as [number, number, number, number],
      },
    },
  };

  const contentVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.0, 0.0, 0.2, 1.0] as [number, number, number, number],
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Enhanced Teal Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-lorenzo-accent-teal/30 via-lorenzo-cream via-40% to-white" />
      <div className="absolute inset-0 bg-gradient-to-tr from-lorenzo-cream via-transparent to-lorenzo-accent-teal/10 opacity-60" />

      {/* Decorative blur elements with teal/gold */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-lorenzo-accent-teal rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-lorenzo-gold rounded-full blur-3xl opacity-25" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-lorenzo-accent-teal/15 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-end">
          {/* Left Column: Image */}
          <motion.div
            variants={imageVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="relative order-2 lg:order-1"
          >
            <motion.div
              className="relative aspect-[3/4] max-w-md mx-auto lg:max-w-md rounded-3xl overflow-hidden"
              style={{
                boxShadow: '0 20px 60px rgba(45, 212, 191, 0.3), 0 10px 30px rgba(0, 0, 0, 0.15)'
              }}
              animate={{
                y: [0, -15, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: [0.42, 0.0, 0.58, 1.0] as [number, number, number, number]
              }}
            >
              {/* Image */}
              <Image
                src="/images/marketing/about-hero.jpg"
                alt="Lorenzo Dry Cleaning Service"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 45vw"
                priority
              />

              {/* Glassmorphism overlay at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-2xl border border-white/60">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg bg-lorenzo-accent-teal">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-black text-base">Handle With Care</p>
                      <p className="text-gray-700 text-sm font-medium">100% Clean Guarantee</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Content */}
          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="space-y-8 order-1 lg:order-2"
          >
            {/* Badge */}
            <motion.div variants={itemVariants}>
              <span className="inline-block px-5 py-2 rounded-full bg-white/80 backdrop-blur-md border border-lorenzo-accent-teal/30 text-lorenzo-accent-teal text-sm font-bold uppercase tracking-wider shadow-sm">
                Established 2013
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              variants={itemVariants}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black leading-tight"
            >
              Kenya's Premier <span className="text-lorenzo-gold">Fabric Care</span> Specialists
            </motion.h2>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="text-lg text-gray-700 leading-relaxed font-medium"
            >
              Lorenzo Dry Cleaners is a distinguished premium dry-cleaning and laundry brand, setting the benchmark for exceptional fabric care in Kenya. With over a decade of expertise and 21+ branches across Nairobi, we deliver uncompromising quality and an elevated service experience.
            </motion.p>

            {/* Feature Cards with Glassmorphism */}
            <motion.div
              variants={contentVariants}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={cardVariants}
                  whileHover={{
                    scale: 1.05,
                    rotate: index === 0 ? -2 : 2,
                    transition: { duration: 0.3 }
                  }}
                  className={cn(
                    'group relative rounded-3xl p-6',
                    'bg-white/70 backdrop-blur-xl',
                    'border-2 border-white/60',
                    'shadow-card hover:shadow-2xl',
                    'transition-all duration-300',
                    'overflow-hidden',
                    'cursor-pointer'
                  )}
                >
                  {/* Animated gradient on hover */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-lorenzo-accent-teal/10 via-lorenzo-light-teal/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    animate={{
                      backgroundPosition: ['0% 0%', '100% 100%'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: 'reverse',
                    }}
                  />

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon with animation */}
                    <motion.div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-lg bg-lorenzo-accent-teal"
                      whileHover={{
                        scale: 1.15,
                        rotate: 360,
                        transition: { duration: 0.6 }
                      }}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </motion.div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-black mb-3 group-hover:text-lorenzo-accent-teal transition-colors duration-300">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {feature.description}
                    </p>
                  </div>

                  {/* Decorative corner accent */}
                  <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-lorenzo-accent-teal/10 group-hover:bg-lorenzo-accent-teal/20 transition-all duration-500" />
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Button & Statement */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-6"
            >
              <Button
                asChild
                size="lg"
                className="text-white font-semibold px-8 py-6 rounded-full shadow-glow-teal hover:shadow-xl transition-all duration-300 hover:scale-105 bg-lorenzo-gold hover:bg-lorenzo-gold-dark"
              >
                <Link href={`${POS_URL}/customer-login`} className="flex items-center gap-2">
                  Get Started Today
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>

              <p className="text-sm text-gray-600 font-medium max-w-xs">
                <span className="text-lorenzo-gold font-bold">11+ years</span> of trusted service across <span className="text-lorenzo-accent-teal font-bold">21+ branches</span> in Nairobi
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
