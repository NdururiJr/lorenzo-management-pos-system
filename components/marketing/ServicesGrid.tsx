/**
 * ServicesGrid Component
 *
 * Displays 4 main services in a modern glassmorphism design.
 * Features service cards with icons, descriptions, features, and CTA buttons.
 *
 * @module components/marketing/ServicesGrid
 */

'use client';

import { motion, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Shirt, Sparkles, Zap, Truck, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const services = [
  {
    id: 1,
    icon: Shirt,
    name: 'Dry Cleaning',
    description: 'Professional care for delicate fabrics, suits, dresses, and formal wear.',
    features: [
      'Expert stain removal',
      'Fabric-specific treatment',
      'Professional pressing',
      'Garment protection',
    ],
    turnaround: '2-3 Days',
    href: '/services#dry-cleaning',
  },
  {
    id: 2,
    icon: Sparkles,
    name: 'Wash & Fold',
    description: 'Convenient wash, dry, and fold service for everyday clothing and linens.',
    features: [
      'Thorough washing',
      'Fresh scent',
      'Neatly folded',
      'Ready to wear',
    ],
    turnaround: '24-48 Hours',
    href: '/services#wash-fold',
  },
  {
    id: 3,
    icon: Zap,
    name: 'Express Service',
    description: '2-hour turnaround for urgent needs at no extra cost.',
    features: [
      'Same-day processing',
      'Priority handling',
      'Quality guaranteed',
      'FREE - No extra charge',
    ],
    turnaround: '2 Hours',
    href: '/services#express',
  },
  {
    id: 4,
    icon: Truck,
    name: 'Pickup & Delivery',
    description: 'Free pickup and delivery service throughout Kilimani area.',
    features: [
      'Free in Kilimani',
      'Flexible scheduling',
      'Real-time tracking',
      'Doorstep service',
    ],
    turnaround: 'On Demand',
    href: '/services#delivery',
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
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

export function ServicesGrid() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="relative py-24 overflow-hidden bg-white">
      {/* Blue Gradient Background */}
      <div className="absolute inset-0 bg-linear-to-br from-brand-blue-50 via-white to-brand-blue-100" />

      {/* Decorative blur elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-blue-light rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-blue rounded-full blur-3xl opacity-15" />
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
            OUR SERVICES
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-4">
            Complete Garment Care
            <span className="text-brand-blue"> Solutions</span>
          </h2>
          <p className="text-lg text-gray-600">
            From everyday laundry to delicate dry cleaning, we offer comprehensive services to keep your wardrobe fresh and immaculate.
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10"
        >
          {services.map((service, index) => (
            <motion.div key={service.id} variants={cardVariants}>
              <ServiceCard service={service} index={index} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

interface ServiceCardProps {
  service: {
    id: number;
    icon: React.ElementType;
    name: string;
    description: string;
    features: string[];
    turnaround: string;
    href: string;
  };
  index: number;
}

function ServiceCard({ service, index }: ServiceCardProps) {
  const Icon = service.icon;

  return (
    <motion.article
      whileHover={{
        scale: 1.03,
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
        className="absolute inset-0 bg-linear-to-br from-brand-blue/10 via-brand-blue-light/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Icon and Turnaround Badge */}
        <div className="flex items-start justify-between mb-5">
          <motion.div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ backgroundColor: '#22BBFF' }}
            whileHover={{ scale: 1.15, rotate: 360, transition: { duration: 0.6 } }}
          >
            <Icon className="w-8 h-8 text-white" />
          </motion.div>

          {/* Turnaround Badge */}
          <span
            className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-md"
            style={{ backgroundColor: '#22BBFF' }}
          >
            {service.turnaround}
          </span>
        </div>

        {/* Service Name */}
        <h3 className="text-2xl font-bold text-black mb-3 group-hover:text-brand-blue transition-colors duration-300">
          {service.name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 leading-relaxed mb-6">
          {service.description}
        </p>

        {/* Features List */}
        <ul className="space-y-3 mb-8 grow">
          {service.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: '#22BBFF' }}
              >
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-gray-700 text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <Link
          href={service.href}
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] w-full"
          style={{ backgroundColor: '#22BBFF' }}
        >
          Book This Service
        </Link>
      </div>
    </motion.article>
  );
}
