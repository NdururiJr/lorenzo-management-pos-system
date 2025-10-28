/**
 * FeaturesGrid Component
 *
 * Displays key features in a grid layout with glassmorphism cards.
 * Features hover effects and icons for each feature.
 *
 * @module components/marketing/FeaturesGrid
 */

'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  Sparkles,
  Smartphone,
  Zap,
  Truck,
  CreditCard,
  Shield,
  Clock,
  Star
} from 'lucide-react';
import { GlassCardBlue } from './GlassCard';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Sparkles,
    title: 'Professional Care',
    description: 'Expert handling of all fabric types with premium detergents and state-of-the-art equipment.',
    color: 'text-brand-blue',
    bgColor: 'bg-brand-blue-50',
  },
  {
    icon: Smartphone,
    title: 'Real-Time Tracking',
    description: 'Track your order status from pickup to delivery with our live tracking system.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    icon: Zap,
    title: 'Express Service',
    description: '24-hour turnaround available for when you need your garments cleaned fast.',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  {
    icon: Truck,
    title: 'Free Delivery',
    description: 'Complimentary pickup and delivery service throughout Kilimani area.',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    icon: CreditCard,
    title: 'Multiple Payments',
    description: 'Pay with cash, M-Pesa, card, or set up a convenient credit account.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description: 'Trusted by hundreds of customers with guaranteed quality and garment insurance.',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export function FeaturesGrid() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-blue-50 text-brand-blue text-sm font-medium mb-4">
            Why Choose Us
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-4">
            Premium Service,
            <span className="text-brand-blue"> Guaranteed Quality</span>
          </h2>
          <p className="text-lg text-gray-600">
            Experience the difference with our professional dry cleaning service designed for modern living.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {features.map((feature, index) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <FeatureCard {...feature} index={index} />
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          <StatItem value="500+" label="Happy Customers" />
          <StatItem value="10,000+" label="Garments Cleaned" />
          <StatItem value="24hrs" label="Express Service" />
          <StatItem value="5.0★" label="Customer Rating" />
        </motion.div>
      </div>
    </section>
  );
}

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  index: number;
}

function FeatureCard({ icon: Icon, title, description, color, bgColor, index }: FeatureCardProps) {
  return (
    <GlassCardBlue className="p-6 group cursor-default h-full">
      {/* Icon */}
      <div className={cn(
        'w-14 h-14 rounded-2xl flex items-center justify-center mb-4',
        'transition-all duration-300 group-hover:scale-110 group-hover:rotate-3',
        bgColor
      )}>
        <Icon className={cn('w-7 h-7', color)} />
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-black mb-2 group-hover:text-brand-blue transition-colors">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 leading-relaxed">
        {description}
      </p>

      {/* Decorative element */}
      <div className="mt-4 pt-4 border-t border-gray-100 group-hover:border-brand-blue/20 transition-colors">
        <span className="text-sm text-brand-blue font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          Learn more →
        </span>
      </div>
    </GlassCardBlue>
  );
}

interface StatItemProps {
  value: string;
  label: string;
}

function StatItem({ value, label }: StatItemProps) {
  return (
    <div className="text-center">
      <div className="text-3xl sm:text-4xl font-bold text-brand-blue mb-2">
        {value}
      </div>
      <div className="text-sm sm:text-base text-gray-600">
        {label}
      </div>
    </div>
  );
}
