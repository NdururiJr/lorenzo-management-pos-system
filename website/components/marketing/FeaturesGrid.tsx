/**
 * FeaturesGrid Component
 *
 * Displays key features in a grid layout with glassmorphism cards.
 * Features hover effects and icons for each feature.
 *
 * @module components/marketing/FeaturesGrid
 */

'use client';

import { motion, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  Sparkles,
  Smartphone,
  Zap,
  Truck,
  CreditCard,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Sparkles,
    title: 'Professional Care',
    description: 'Expert handling of all fabric types with premium detergents and state-of-the-art equipment.',
  },
  {
    icon: Smartphone,
    title: 'Real-Time Tracking',
    description: 'Track your order status from pickup to delivery with our live tracking system.',
  },
  {
    icon: Zap,
    title: 'Express Service',
    description: '2-hour turnaround available at no extra cost when you need your garments cleaned fast.',
  },
  {
    icon: Truck,
    title: 'Free Delivery',
    description: 'Complimentary pickup and delivery service across Nairobi via our 21+ branches.',
  },
  {
    icon: CreditCard,
    title: 'Multiple Payments',
    description: 'Pay with cash, M-Pesa, card, or set up a convenient credit account.',
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description: 'Trusted by hundreds of customers with guaranteed quality and garment insurance.',
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

export function FeaturesGrid() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-lorenzo-cream text-lorenzo-accent-teal text-sm font-medium mb-4">
            Why Choose Us
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-4">
            Premium Service,
            <span className="text-lorenzo-accent-teal"> Guaranteed Quality</span>
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
            <motion.div key={feature.title} variants={cardVariants}>
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
          <StatItem value="2hrs" label="Express Service" />
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
  index: number;
}

function FeatureCard({ icon: Icon, title, description, index }: FeatureCardProps) {
  return (
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
        className="absolute inset-0 bg-linear-to-br from-lorenzo-accent-teal/10 via-lorenzo-light-teal/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Icon with 360° rotation on hover and teal background */}
        <motion.div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-lg bg-lorenzo-accent-teal"
          whileHover={{
            scale: 1.15,
            rotate: 360,
            transition: { duration: 0.6 }
          }}
        >
          <Icon className="w-8 h-8 text-white" />
        </motion.div>

        <h3 className="text-xl font-bold text-black mb-3 group-hover:text-lorenzo-accent-teal transition-colors duration-300">
          {title}
        </h3>

        <p className="text-gray-600 leading-relaxed text-sm">
          {description}
        </p>

        {/* Decorative element */}
        <div className="mt-4 pt-4 border-t border-gray-100 group-hover:border-lorenzo-accent-teal/20 transition-colors">
          <span className="text-sm text-lorenzo-accent-teal font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Learn more →
          </span>
        </div>
      </div>
    </motion.div>
  );
}

interface StatItemProps {
  value: string;
  label: string;
}

function StatItem({ value, label }: StatItemProps) {
  return (
    <div className="text-center">
      <div className="text-3xl sm:text-4xl font-bold text-lorenzo-accent-teal mb-2">
        {value}
      </div>
      <div className="text-sm sm:text-base text-gray-600">
        {label}
      </div>
    </div>
  );
}
