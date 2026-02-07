/**
 * ProcessSteps Component
 *
 * Shows the 4-step process of using the service in a visually appealing way.
 * Includes step numbers, titles, descriptions, and connecting lines.
 *
 * @module components/marketing/ProcessSteps
 */

'use client';

import { motion, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Calendar, Package, Sparkles, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/** Customer login URL on the POS system */
const CUSTOMER_LOGIN_URL = `${process.env.NEXT_PUBLIC_POS_API_URL || 'http://localhost:3000'}/customer-login`;

const steps = [
  {
    number: 1,
    icon: Calendar,
    title: 'Schedule a Pickup',
    description: 'Choose your preferred date and time. We work around your schedule for maximum convenience.',
  },
  {
    number: 2,
    icon: Package,
    title: 'We Collect It',
    description: 'Our team picks up your laundry bag safely and labels it for accurate and secure processing.',
  },
  {
    number: 3,
    icon: Sparkles,
    title: 'Clean & Care',
    description: 'Clothes are washed, dried, and folded neatly with care using safe detergents and premium machines.',
  },
  {
    number: 4,
    icon: Truck,
    title: 'Delivered to You',
    description: 'Your laundry is returned fresh and on schedule — clean, soft, and ready to wear.',
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  },
};

export function ProcessSteps() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Enhanced Blue Gradient Background with #2DD4BF */}
      <div className="absolute inset-0 bg-gradient-to-br from-lorenzo-accent-teal via-lorenzo-accent-teal-100 via-40% to-white" />
      <div className="absolute inset-0 bg-gradient-to-tr from-lorenzo-accent-teal-50 via-transparent to-lorenzo-accent-teal-100 opacity-60" />

      {/* Decorative blur elements with more blue */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-lorenzo-accent-teal rounded-full blur-3xl opacity-40" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-lorenzo-accent-teal-light rounded-full blur-3xl opacity-35" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-lorenzo-accent-teal/20 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-lorenzo-accent-teal-50 text-lorenzo-accent-teal text-sm font-medium mb-4">
            HOW IT WORKS
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-4">
            Laundry Services in
            <span className="text-lorenzo-accent-teal"> Four Simple Steps</span>
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Doing laundry has never been this easy. Just follow these four steps and enjoy fresh, clean clothes—hassle-free.
          </p>
          <Button
            asChild
            size="lg"
            className="text-white font-semibold rounded-full px-8 shadow-glow-blue hover:shadow-xl transition-all duration-300 hover:scale-105"
            style={{ backgroundColor: '#2DD4BF' }}
          >
            <Link href="/contact">Start Your First Order</Link>
          </Button>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="relative"
        >
          {/* Connecting Line (Desktop only) */}
          <div className="hidden lg:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-lorenzo-accent-teal/20 via-lorenzo-accent-teal/40 to-lorenzo-accent-teal/20" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <motion.div key={step.number} variants={cardVariants}>
                <StepCard {...step} index={index} isLast={index === steps.length - 1} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-600 mb-6 text-lg">
            Ready to experience the easiest laundry service in Nairobi?
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-2 font-semibold transition-all duration-300 hover:scale-105"
              style={{ borderColor: '#2DD4BF', color: '#2DD4BF' }}
            >
              <Link href="/services" className="hover:bg-[#2DD4BF] hover:text-white transition-all">
                Explore All Services
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="text-lorenzo-accent-teal hover:text-lorenzo-accent-teal-dark hover:bg-lorenzo-accent-teal-50 rounded-full font-semibold transition-all duration-300"
            >
              <a href={CUSTOMER_LOGIN_URL} target="_blank" rel="noopener noreferrer">Track Existing Order</a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

interface StepCardProps {
  number: number;
  icon: React.ElementType;
  title: string;
  description: string;
  index: number;
  isLast: boolean;
}

function StepCard({ number, icon: Icon, title, description, index, isLast }: StepCardProps) {
  return (
    <div className="relative">
      {/* Card */}
      <motion.div
        whileHover={{
          scale: 1.05,
          rotate: index % 2 === 0 ? -2 : 2,
          transition: { duration: 0.3 }
        }}
        className={cn(
          'group relative rounded-3xl p-6',
          'bg-white/70 backdrop-blur-xl',
          'border-2 border-white/60',
          'shadow-card hover:shadow-2xl',
          'transition-all duration-300',
          'overflow-hidden',
          'cursor-pointer',
          'h-full'
        )}
      >
        {/* Animated gradient on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-lorenzo-accent-teal/10 via-lorenzo-accent-teal-light/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Step Number Badge and Icon */}
          <div className="flex items-center justify-between mb-4">
            <span
              className="inline-flex items-center justify-center w-12 h-12 rounded-full text-xs font-bold text-white shadow-lg"
              style={{ backgroundColor: '#2DD4BF' }}
            >
              STEP {number}
            </span>

            {/* Icon with rotation animation */}
            <motion.div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: '#2DD4BF' }}
              whileHover={{
                scale: 1.15,
                rotate: 360,
                transition: { duration: 0.6 }
              }}
            >
              <Icon className="w-8 h-8 text-white" />
            </motion.div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-black mb-3 group-hover:text-lorenzo-accent-teal transition-colors duration-300">
            {title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed text-sm">
            {description}
          </p>
        </div>
      </motion.div>

      {/* Arrow connector for desktop (except last card) */}
      {!isLast && (
        <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            className="text-lorenzo-accent-teal/40"
          >
            <path
              d="M5 16H27M27 16L20 9M27 16L20 23"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      {/* Vertical connector for mobile/tablet */}
      {!isLast && (
        <div className="lg:hidden flex justify-center my-4">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="text-lorenzo-accent-teal/40"
          >
            <path
              d="M12 5V19M12 19L5 12M12 19L19 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
