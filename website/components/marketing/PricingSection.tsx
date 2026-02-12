/**
 * PricingSection Component
 *
 * Displays pricing tiers in a modern glassmorphism design.
 * Features 3 pricing cards with features, pricing, and CTA buttons.
 *
 * @module components/marketing/PricingSection
 */

'use client';

import { motion, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Check, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const pricingTiers = [
  {
    id: 1,
    name: 'Basic',
    tagline: 'Perfect for casual wear',
    price: 'From KSh 150',
    priceNote: 'per garment',
    features: [
      'Standard dry cleaning',
      'Basic wash & fold',
      'Standard turnaround (2-3 days)',
      'In-store pickup',
      'Quality guarantee',
    ],
    cta: 'Get Started',
    href: '/customer-login',
    popular: false,
  },
  {
    id: 2,
    name: 'Standard',
    tagline: 'Most popular choice',
    price: 'From KSh 250',
    priceNote: 'per garment',
    features: [
      'All Basic features',
      'Premium fabric treatment',
      'Express service available',
      'Free pickup & delivery',
      'Priority customer support',
      'Stain protection',
    ],
    cta: 'Choose Standard',
    href: '/customer-login',
    popular: true,
  },
  {
    id: 3,
    name: 'Premium',
    tagline: 'For luxury garments',
    price: 'From KSh 400',
    priceNote: 'per garment',
    features: [
      'All Standard features',
      'Luxury fabric specialists',
      'Same-day express service',
      'Garment storage service',
      'Minor repairs included',
      'White glove service',
      'Dedicated account manager',
    ],
    cta: 'Go Premium',
    href: '/customer-login',
    popular: false,
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

export function PricingSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const POS_URL = process.env.NEXT_PUBLIC_POS_API_URL || 'http://localhost:3000';

  // Update hrefs with POS_URL
  const tiersWithPosUrl = pricingTiers.map((tier) => ({
    ...tier,
    href: `${POS_URL}/customer-login`,
  }));

  return (
    <section className="relative py-24 overflow-hidden bg-white">
      {/* Light Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-lorenzo-cream/30 to-white" />

      {/* Decorative blur elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-lorenzo-accent-teal rounded-full blur-3xl opacity-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-lorenzo-gold rounded-full blur-3xl opacity-10" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-lorenzo-accent-teal/10 backdrop-blur-md text-lorenzo-accent-teal-dark text-sm font-medium mb-4 border-2 border-lorenzo-accent-teal/20">
            PRICING
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-4">
            Simple, Transparent
            <span className="text-lorenzo-accent-teal-dark"> Pricing</span>
          </h2>
          <p className="text-lg text-gray-600">
            Choose the service level that fits your needs. No hidden fees, no surprises — just premium care for your garments.
          </p>
        </motion.div>

        {/* Pricing Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 max-w-6xl mx-auto"
        >
          {tiersWithPosUrl.map((tier, index) => (
            <motion.div key={tier.id} variants={cardVariants}>
              <PricingCard tier={tier} index={index} />
            </motion.div>
          ))}
        </motion.div>

        {/* Pricing Note */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center text-gray-600 mt-12"
        >
          All prices are starting rates. Final cost depends on garment type, fabric, and services required.
          <br />
          <Link href={`${POS_URL}/customer-login`} className="text-lorenzo-accent-teal-dark font-semibold hover:underline">
            Get a free quote today
          </Link>
        </motion.p>
      </div>
    </section>
  );
}

interface PricingCardProps {
  tier: {
    id: number;
    name: string;
    tagline: string;
    price: string;
    priceNote: string;
    features: string[];
    cta: string;
    href: string;
    popular: boolean;
  };
  index: number;
}

function PricingCard({ tier, index: _index }: PricingCardProps) {
  return (
    <motion.article
      whileHover={{
        scale: tier.popular ? 1.05 : 1.03,
        y: tier.popular ? -8 : -4,
        transition: { duration: 0.3 },
      }}
      className={cn(
        'group relative rounded-3xl p-8',
        'bg-white/70 backdrop-blur-xl',
        'border-2',
        tier.popular ? 'border-lorenzo-accent-teal shadow-2xl' : 'border-white/60 shadow-card',
        'hover:shadow-2xl',
        'transition-all duration-300',
        'overflow-hidden',
        'h-full flex flex-col'
      )}
    >
      {/* Popular Badge */}
      {tier.popular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div
            className="flex items-center gap-1 px-4 py-1.5 rounded-full text-white text-xs font-bold shadow-lg"
            style={{ backgroundColor: '#2DD4BF' }}
          >
            <Star className="w-3 h-3" fill="white" />
            MOST POPULAR
          </div>
        </div>
      )}

      {/* Animated gradient on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-lorenzo-accent-teal/10 via-lorenzo-accent-teal-light/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Tier Name */}
        <h3
          className={cn(
            'text-2xl font-bold mb-2 transition-colors duration-300',
            tier.popular ? 'text-lorenzo-accent-teal-dark' : 'text-black group-hover:text-lorenzo-accent-teal-dark'
          )}
        >
          {tier.name}
        </h3>

        {/* Tagline */}
        <p className="text-gray-600 text-sm mb-6">{tier.tagline}</p>

        {/* Price */}
        <div className="mb-8">
          <div className="text-4xl font-bold text-black mb-1">{tier.price}</div>
          <div className="text-sm text-gray-600">{tier.priceNote}</div>
        </div>

        {/* Features List */}
        <ul className="space-y-4 mb-8 flex-grow">
          {tier.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: '#2DD4BF' }}
              >
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <Link
          href={tier.href}
          className={cn(
            'inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] w-full',
            tier.popular ? 'text-white' : 'text-white'
          )}
          style={{ backgroundColor: '#2DD4BF' }}
        >
          {tier.cta}
        </Link>
      </div>
    </motion.article>
  );
}
