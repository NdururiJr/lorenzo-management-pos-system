/**
 * OurValues Component
 *
 * Displays company core values with glassmorphism design.
 * Features: 6 value cards with icons and descriptions.
 *
 * @module components/marketing/OurValues
 */

'use client';

import { motion, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Shield, Sparkles, Users, Leaf, Clock, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

const values = [
  {
    id: 1,
    icon: Shield,
    title: 'Quality Excellence',
    description: 'We never compromise on quality. Every garment receives expert care using premium products and proven techniques.',
  },
  {
    id: 2,
    icon: Sparkles,
    title: 'Attention to Detail',
    description: 'From initial inspection to final delivery, we pay meticulous attention to every detail of your garments.',
  },
  {
    id: 3,
    icon: Users,
    title: 'Customer First',
    description: 'Your satisfaction is our priority. We listen, adapt, and always go the extra mile to exceed expectations.',
  },
  {
    id: 4,
    icon: Leaf,
    title: 'Eco-Friendly',
    description: 'We use environmentally responsible cleaning methods and materials to protect both your clothes and our planet.',
  },
  {
    id: 5,
    icon: Clock,
    title: 'Reliability',
    description: 'Consistent quality, on-time delivery, and dependable service you can count on, every single time.',
  },
  {
    id: 6,
    icon: Heart,
    title: 'Integrity',
    description: 'Honest pricing, transparent communication, and ethical practices in everything we do.',
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  },
};

export function OurValues() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="relative py-24 overflow-hidden bg-white">
      {/* Blue Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-brand-blue-50 to-brand-blue-100" />

      {/* Decorative blur elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue-light rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-blue rounded-full blur-3xl opacity-15" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-blue-100 rounded-full blur-3xl opacity-10" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md text-brand-blue text-sm font-medium mb-4 border-2 border-white/60">
            OUR VALUES
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-4">
            What We
            <span className="text-brand-blue"> Stand For</span>
          </h2>
          <p className="text-lg text-gray-600">
            Our core values guide every decision we make and every service we provide.
          </p>
        </motion.div>

        {/* Values Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {values.map((value, index) => (
            <motion.div key={value.id} variants={cardVariants}>
              <ValueCard value={value} index={index} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

interface ValueCardProps {
  value: {
    id: number;
    icon: React.ElementType;
    title: string;
    description: string;
  };
  index: number;
}

function ValueCard({ value, index }: ValueCardProps) {
  const Icon = value.icon;

  return (
    <motion.article
      whileHover={{
        scale: 1.05,
        rotate: index % 2 === 0 ? -1 : 1,
        transition: { duration: 0.3 },
      }}
      className={cn(
        'group relative rounded-3xl p-8',
        'bg-white/70 backdrop-blur-xl',
        'border-2 border-white/60',
        'shadow-card hover:shadow-2xl',
        'transition-all duration-300',
        'overflow-hidden',
        'h-full flex flex-col'
      )}
    >
      {/* Animated gradient on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 via-brand-blue-light/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full text-center">
        {/* Icon */}
        <motion.div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg"
          style={{ backgroundColor: '#22BBFF' }}
          whileHover={{ scale: 1.15, rotate: 360, transition: { duration: 0.6 } }}
        >
          <Icon className="w-8 h-8 text-white" />
        </motion.div>

        {/* Title */}
        <h3 className="text-xl font-bold text-black mb-3 group-hover:text-brand-blue transition-colors duration-300">
          {value.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 leading-relaxed text-sm">{value.description}</p>
      </div>
    </motion.article>
  );
}
