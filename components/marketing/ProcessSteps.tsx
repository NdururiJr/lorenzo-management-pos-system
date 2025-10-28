/**
 * ProcessSteps Component
 *
 * Shows the 4-step process of using the service in a visually appealing way.
 * Includes step numbers, titles, descriptions, and connecting lines.
 *
 * @module components/marketing/ProcessSteps
 */

'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Calendar, Package, Sparkles, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const steps = [
  {
    number: 1,
    icon: Calendar,
    title: 'Schedule a Pickup',
    description: 'Choose your preferred date and time. We work around your schedule for maximum convenience.',
    color: 'brand-blue',
  },
  {
    number: 2,
    icon: Package,
    title: 'We Collect It',
    description: 'Our team picks up your laundry bag safely and labels it for accurate and secure processing.',
    color: 'purple',
  },
  {
    number: 3,
    icon: Sparkles,
    title: 'Clean & Care',
    description: 'Clothes are washed, dried, and folded neatly with care using safe detergents and premium machines.',
    color: 'amber',
  },
  {
    number: 4,
    icon: Truck,
    title: 'Delivered to You',
    description: 'Your laundry is returned fresh and on schedule — clean, soft, and ready to wear.',
    color: 'green',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export function ProcessSteps() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-blue-50 text-brand-blue text-sm font-medium mb-4">
            HOW IT WORKS
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-4">
            Laundry Services in
            <span className="text-brand-blue"> Four Simple Steps</span>
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Doing laundry has never been this easy. Just follow these four steps and enjoy fresh, clean clothes—hassle-free.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-brand-blue hover:bg-brand-blue-dark text-white rounded-full px-8"
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
          <div className="hidden lg:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-brand-blue/20 via-brand-blue/40 to-brand-blue/20" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <motion.div key={step.number} variants={itemVariants}>
                <StepCard {...step} isLast={index === steps.length - 1} />
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
              className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white rounded-full"
            >
              <Link href="/services">Explore All Services</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="text-brand-blue hover:text-brand-blue-dark hover:bg-brand-blue-50"
            >
              <Link href="/customer-login">Track Existing Order</Link>
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
  color: string;
  isLast: boolean;
}

function StepCard({ number, icon: Icon, title, description, color, isLast }: StepCardProps) {
  const colorClasses = {
    'brand-blue': {
      badge: 'bg-brand-blue text-white',
      icon: 'bg-brand-blue-50 text-brand-blue',
      border: 'border-brand-blue/20',
    },
    purple: {
      badge: 'bg-purple-600 text-white',
      icon: 'bg-purple-50 text-purple-600',
      border: 'border-purple-600/20',
    },
    amber: {
      badge: 'bg-amber-600 text-white',
      icon: 'bg-amber-50 text-amber-600',
      border: 'border-amber-600/20',
    },
    green: {
      badge: 'bg-green-600 text-white',
      icon: 'bg-green-50 text-green-600',
      border: 'border-green-600/20',
    },
  };

  const colors = colorClasses[color as keyof typeof colorClasses] || colorClasses['brand-blue'];

  return (
    <div className="relative">
      {/* Card */}
      <div className={cn(
        'relative bg-white rounded-2xl p-6 shadow-card border-2 h-full',
        'transition-all duration-300 hover:shadow-lift hover:-translate-y-1',
        colors.border
      )}>
        {/* Step Number Badge */}
        <div className="flex items-center justify-between mb-4">
          <span className={cn(
            'inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold',
            colors.badge
          )}>
            STEP {number}
          </span>

          {/* Icon */}
          <div className={cn(
            'w-14 h-14 rounded-2xl flex items-center justify-center',
            colors.icon
          )}>
            <Icon className="w-7 h-7" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-black mb-3">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Arrow connector for desktop (except last card) */}
      {!isLast && (
        <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            className="text-brand-blue/40"
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
            className="text-brand-blue/40"
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
