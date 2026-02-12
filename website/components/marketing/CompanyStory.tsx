/**
 * CompanyStory Component
 *
 * Displays the company story and mission with glassmorphism design.
 * Features: company narrative, image, and mission statement.
 *
 * @module components/marketing/CompanyStory
 */

'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Target, Heart, Award, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const highlights = [
  {
    id: 1,
    icon: Target,
    title: 'Our Vision',
    description: 'To deliver uncompromising quality, meticulous attention to detail, and an elevated service experience for every client.',
  },
  {
    id: 2,
    icon: Heart,
    title: 'Our Promise',
    description: 'Expert care, precision handling, and premium finishing—reflecting sophistication, reliability, and absolute customer satisfaction.',
  },
  {
    id: 3,
    icon: Award,
    title: 'Excellence',
    description: 'One of Kenya\'s most trusted and admired garment care specialists with over a decade of expertise.',
  },
  {
    id: 4,
    icon: Users,
    title: 'Leadership',
    description: 'Under visionary leadership and a seasoned management team, delivering exceptional service across 21+ branches.',
  },
];

export function CompanyStory() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const POS_URL = process.env.NEXT_PUBLIC_POS_API_URL || 'http://localhost:3000';

  return (
    <section className="relative py-24 overflow-hidden bg-white">
      {/* Blue Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-lorenzo-accent-teal-50 via-white to-lorenzo-accent-teal-100" />

      {/* Decorative blur elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-lorenzo-accent-teal-light rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-lorenzo-accent-teal rounded-full blur-3xl opacity-15" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md text-lorenzo-accent-teal text-sm font-medium mb-4 border-2 border-white/60">
            OUR STORY
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-4">
            Setting the Benchmark for
            <span className="text-lorenzo-accent-teal"> Exceptional Fabric Care</span>
          </h2>
        </motion.div>

        {/* Story Content */}
        <div ref={ref} className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="order-2 lg:order-1"
          >
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p className="text-lg">
                <span className="font-bold text-black">Lorenzo Dry Cleaners</span> is a distinguished premium dry-cleaning and laundry brand, setting the benchmark for exceptional fabric care in Kenya. Established in <span className="font-bold text-lorenzo-gold">2013</span>, the company was founded with a singular vision: to deliver uncompromising quality, meticulous attention to detail, and an elevated service experience for every client.
              </p>
              <p>
                Through an unwavering commitment to excellence, Lorenzo Dry Cleaners has grown into one of Kenya's most trusted and admired garment care specialists. Today, under the stewardship of visionary leadership and a seasoned management team, the brand brings over a decade of expertise to a network of more than <span className="font-bold text-lorenzo-accent-teal">21 elegantly operated branches</span> across Nairobi and its environs.
              </p>
              <p>
                Every garment entrusted to Lorenzo receives expert care, precision handling, and premium finishing—reflecting a promise of sophistication, reliability, and absolute customer satisfaction.
              </p>
              <div className="pt-4">
                <a
                  href={`${POS_URL}/customer-login`}
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: '#2DD4BF' }}
                >
                  Experience Lorenzo Today
                </a>
              </div>
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="order-1 lg:order-2"
          >
            <div className="relative">
              {/* Floating Effect Container */}
              <motion.div
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: [0.42, 0.0, 0.58, 1.0] as [number, number, number, number],
                }}
                className="relative"
              >
                {/* Glassmorphism Image Container */}
                <div
                  className={cn(
                    'relative rounded-3xl overflow-hidden',
                    'bg-white/70 backdrop-blur-xl',
                    'border-2 border-white/60',
                    'shadow-2xl',
                    'p-3'
                  )}
                >
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                    <Image
                      src="/images/marketing/about-hero.jpg"
                      alt="Lorenzo Dry Cleaners Team"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      quality={90}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>

                {/* Teal glow shadow */}
                <div
                  className="absolute -inset-4 rounded-3xl opacity-40 blur-2xl -z-10"
                  style={{ backgroundColor: '#2DD4BF' }}
                />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Highlights Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {highlights.map((highlight, index) => (
            <HighlightCard key={highlight.id} highlight={highlight} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

interface HighlightCardProps {
  highlight: {
    id: number;
    icon: React.ElementType;
    title: string;
    description: string;
  };
  index: number;
}

function HighlightCard({ highlight, index }: HighlightCardProps) {
  const Icon = highlight.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
      whileHover={{
        scale: 1.05,
        rotate: index % 2 === 0 ? -2 : 2,
        transition: { duration: 0.3 },
      }}
      className={cn(
        'group relative rounded-2xl p-6',
        'bg-white/70 backdrop-blur-xl',
        'border-2 border-white/60',
        'shadow-card hover:shadow-2xl',
        'transition-all duration-300',
        'overflow-hidden'
      )}
    >
      {/* Animated gradient on hover */}
      <motion.div className="absolute inset-0 bg-gradient-to-br from-lorenzo-accent-teal/10 via-lorenzo-accent-teal-light/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center">
        {/* Icon */}
        <motion.div
          className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg"
          style={{ backgroundColor: '#2DD4BF' }}
          whileHover={{ scale: 1.15, rotate: 360, transition: { duration: 0.6 } }}
        >
          <Icon className="w-7 h-7 text-white" />
        </motion.div>

        {/* Title */}
        <h3 className="text-lg font-bold text-black mb-2 group-hover:text-lorenzo-accent-teal transition-colors duration-300">
          {highlight.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed">{highlight.description}</p>
      </div>
    </motion.div>
  );
}
