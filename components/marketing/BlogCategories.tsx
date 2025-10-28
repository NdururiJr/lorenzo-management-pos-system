/**
 * BlogCategories Component
 *
 * Category filter buttons for blog listing page.
 * Features: category buttons with active state and glassmorphism design.
 *
 * @module components/marketing/BlogCategories
 */

'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'all', name: 'All Articles', count: 12 },
  { id: 'care-tips', name: 'Care Tips', count: 5 },
  { id: 'industry-insights', name: 'Industry Insights', count: 3 },
  { id: 'sustainability', name: 'Sustainability', count: 4 },
];

interface BlogCategoriesProps {
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export function BlogCategories({
  activeCategory = 'all',
  onCategoryChange,
}: BlogCategoriesProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="relative py-12 overflow-hidden bg-white">
      {/* Light Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-brand-blue-50 to-white" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          {categories.map((category, index) => (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onCategoryChange?.(category.id)}
              className={cn(
                'px-6 py-3 rounded-xl font-semibold transition-all duration-300',
                'border-2',
                activeCategory === category.id
                  ? 'text-white shadow-lg'
                  : 'bg-white/70 backdrop-blur-md border-white/60 text-gray-700 hover:border-brand-blue shadow-card hover:shadow-lg'
              )}
              style={
                activeCategory === category.id
                  ? { backgroundColor: '#22BBFF', borderColor: '#22BBFF' }
                  : undefined
              }
            >
              {category.name}
              <span
                className={cn(
                  'ml-2 px-2 py-0.5 rounded-full text-xs font-bold',
                  activeCategory === category.id
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-600'
                )}
              >
                {category.count}
              </span>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
