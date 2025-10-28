/**
 * StatsBar Component
 *
 * Displays key company statistics with animated counters and glassmorphism design.
 * Features: 4 stat cards with numbers and labels.
 *
 * @module components/marketing/StatsBar
 */

'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const stats = [
  {
    id: 1,
    value: 500,
    suffix: '+',
    label: 'Happy Customers',
    duration: 2000,
  },
  {
    id: 2,
    value: 10000,
    suffix: '+',
    label: 'Garments Cleaned',
    duration: 2500,
  },
  {
    id: 3,
    value: 98,
    suffix: '%',
    label: 'Satisfaction Rate',
    duration: 2000,
  },
  {
    id: 4,
    value: 24,
    suffix: 'hrs',
    label: 'Express Service',
    duration: 1500,
  },
];

export function StatsBar() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  return (
    <section className="relative py-20 overflow-hidden bg-white">
      {/* Blue Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-blue via-brand-blue-dark to-brand-blue-900" />
      <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue-50 via-transparent to-brand-blue-900 opacity-40" />

      {/* Decorative blur elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-blue-light rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl opacity-15" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {stats.map((stat, index) => (
            <StatCard key={stat.id} stat={stat} index={index} inView={inView} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

interface StatCardProps {
  stat: {
    id: number;
    value: number;
    suffix: string;
    label: string;
    duration: number;
  };
  index: number;
  inView: boolean;
}

function StatCard({ stat, index, inView }: StatCardProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    const increment = stat.value / (stat.duration / 16); // 60fps
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= stat.value) {
        setCount(stat.value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [inView, stat.value, stat.duration]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{
        scale: 1.05,
        transition: { duration: 0.3 },
      }}
      className={cn(
        'relative rounded-2xl p-6',
        'bg-white/10 backdrop-blur-xl',
        'border-2 border-white/20',
        'shadow-lg hover:shadow-2xl',
        'transition-all duration-300',
        'overflow-hidden',
        'text-center'
      )}
    >
      {/* Animated gradient on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-white/5 via-brand-blue-light/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Number */}
        <motion.div
          className="text-4xl lg:text-5xl font-bold text-white mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
        >
          {count.toLocaleString()}
          <span className="text-brand-blue-light">{stat.suffix}</span>
        </motion.div>

        {/* Label */}
        <motion.p
          className="text-sm lg:text-base text-white/90 font-medium"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: index * 0.1 + 0.4 }}
        >
          {stat.label}
        </motion.p>
      </div>
    </motion.div>
  );
}
