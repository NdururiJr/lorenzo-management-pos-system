/**
 * Testimonials Component
 *
 * Customer testimonials carousel showing 2 cards at a time with modern glassmorphism design.
 * Features: horizontal scrolling, customer images, ratings, and trust badges.
 *
 * @module components/marketing/Testimonials
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Mwangi',
    role: 'Marketing Manager',
    image: '/images/marketing/testimonial-1.jpg',
    rating: 5,
    text: 'Lorenzo saves my weekends! My clothes always come back fresh and neatly folded. Love the pickup and delivery service!',
  },
  {
    id: 2,
    name: 'James Ochieng',
    role: 'Business Owner',
    image: '/images/marketing/testimonial-2.jpg',
    rating: 5,
    text: 'Professional service and great quality. The express 2-hour service has been a lifesaver for my business trips.',
  },
  {
    id: 3,
    name: 'Grace Wanjiru',
    role: 'Doctor',
    image: '/images/marketing/testimonial-3.jpg',
    rating: 5,
    text: 'Reliable and trustworthy! I have been using Lorenzo for 6 months and never had an issue. Highly recommend!',
  },
  {
    id: 4,
    name: 'David Kimani',
    role: 'Software Engineer',
    image: '/images/marketing/testimonial-4.jpg',
    rating: 5,
    text: 'The real-time tracking feature is brilliant! I always know exactly where my order is. Great service!',
  },
  {
    id: 5,
    name: 'Linda Achieng',
    role: 'Teacher',
    image: '/images/marketing/testimonial-5.jpg',
    rating: 5,
    text: 'Best dry cleaning service in Nairobi! Fair prices, excellent quality, and amazing customer service.',
  },
];

export function Testimonials() {
  const [currentPage, setCurrentPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(0);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Calculate how many cards to show per page
  const cardsPerPage = 2;
  const totalPages = Math.ceil(testimonials.length / cardsPerPage);

  // Get current testimonials for the page
  const getCurrentTestimonials = () => {
    const start = currentPage * cardsPerPage;
    const end = start + cardsPerPage;
    const visible = testimonials.slice(start, end);

    if (visible.length < cardsPerPage) {
      visible.push(...testimonials.slice(0, cardsPerPage - visible.length));
    }

    return visible;
  };

  // Auto-advance carousel
  useEffect(() => {
    if (!isPaused && inView) {
      const interval = setInterval(() => {
        setDirection(1);
        setCurrentPage((prev) => (prev + 1) % totalPages);
      }, 7000); // Change every 7 seconds

      return () => clearInterval(interval);
    }
  }, [isPaused, inView, totalPages]);

  const goToNext = () => {
    setDirection(1);
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const goToPage = (page: number) => {
    setDirection(page > currentPage ? 1 : -1);
    setCurrentPage(page);
  };

  return (
    <section className="py-24 bg-white" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md text-lorenzo-accent-teal text-sm font-medium mb-4 border-2 border-white/60">
            HAPPY CLIENTS
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-4">
            What They Say
            <span className="text-lorenzo-accent-teal"> About Our Service</span>
          </h2>
          <p className="text-lg text-gray-600">
            Say goodbye to laundry day stress. We pick up, clean, and deliver your laundry — so you can focus on what really matters.
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Testimonial Cards Grid */}
          <div className="relative min-h-[480px]">
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={currentPage}
                custom={direction}
                variants={{
                  enter: (direction: number) => ({
                    x: direction > 0 ? 1000 : -1000,
                    opacity: 0,
                  }),
                  center: {
                    x: 0,
                    opacity: 1,
                  },
                  exit: (direction: number) => ({
                    x: direction > 0 ? -1000 : 1000,
                    opacity: 0,
                  }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.4 },
                }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
              >
                {getCurrentTestimonials().map((testimonial, index) => (
                  <TestimonialCard
                    key={testimonial.id}
                    testimonial={testimonial}
                    index={index}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-4 mt-12">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevious}
              className="rounded-full border-2 bg-white/70 backdrop-blur-md hover:bg-white hover:scale-110 transition-all duration-300"
              style={{ borderColor: '#2DD4BF', color: '#2DD4BF' }}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            {/* Dots Indicator */}
            <div className="flex items-center gap-2">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToPage(index)}
                  className={cn(
                    'rounded-full transition-all duration-300',
                    index === currentPage
                      ? 'w-8 h-3'
                      : 'w-3 h-3 hover:scale-125'
                  )}
                  style={{
                    backgroundColor: index === currentPage ? '#2DD4BF' : 'rgba(255, 255, 255, 0.5)',
                  }}
                  aria-label={`Go to page ${index + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={goToNext}
              className="rounded-full border-2 bg-white/70 backdrop-blur-md hover:bg-white hover:scale-110 transition-all duration-300"
              style={{ borderColor: '#2DD4BF', color: '#2DD4BF' }}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 text-center"
        >
          <div className="flex flex-col items-center">
            <div className="text-4xl font-bold mb-1" style={{ color: '#2DD4BF' }}>
              5.0
            </div>
            <div className="flex gap-0.5 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-white" style={{ fill: '#2DD4BF' }} />
              ))}
            </div>
            <div className="text-sm text-gray-600 font-medium">Average Rating</div>
          </div>
          <div className="hidden sm:block w-px h-12 bg-white/40" />
          <div className="flex flex-col items-center">
            <div className="text-4xl font-bold mb-1" style={{ color: '#2DD4BF' }}>
              500+
            </div>
            <div className="text-sm text-gray-600 font-medium">Happy Customers</div>
          </div>
          <div className="hidden sm:block w-px h-12 bg-white/40" />
          <div className="flex flex-col items-center">
            <div className="text-4xl font-bold mb-1" style={{ color: '#2DD4BF' }}>
              98%
            </div>
            <div className="text-sm text-gray-600 font-medium">Satisfaction Rate</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

interface TestimonialCardProps {
  testimonial: {
    id: number;
    name: string;
    role: string;
    image: string;
    rating: number;
    text: string;
  };
  index: number;
}

function TestimonialCard({ testimonial, index }: TestimonialCardProps) {
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
        'cursor-default',
        'h-full flex flex-col'
      )}
    >
      {/* Animated gradient on hover */}
      <motion.div className="absolute inset-0 bg-linear-to-br from-lorenzo-accent-teal/10 via-lorenzo-accent-teal-light/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Quote Icon */}
        <div className="mb-4">
          <Quote className="w-12 h-12" style={{ color: '#2DD4BF' }} />
        </div>

        {/* Testimonial Text */}
        <blockquote className="text-base text-gray-700 leading-relaxed mb-6 grow">
          &ldquo;{testimonial.text}&rdquo;
        </blockquote>

        {/* Author Info */}
        <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
          {/* Avatar */}
          <div className="relative w-14 h-14 rounded-full shrink-0 overflow-hidden shadow-lg">
            <div
              className="w-full h-full flex items-center justify-center text-white text-xl font-semibold"
              style={{ backgroundColor: '#2DD4BF' }}
            >
              {testimonial.name.charAt(0)}
            </div>
          </div>

          <div className="grow">
            <div className="font-bold text-black text-base group-hover:text-lorenzo-accent-teal transition-colors duration-300">
              {testimonial.name}
            </div>
            <div className="text-gray-600 text-sm">{testimonial.role}</div>
          </div>

          {/* Rating */}
          <div className="flex gap-0.5">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star key={i} className="w-4 h-4" style={{ fill: '#2DD4BF', color: '#2DD4BF' }} />
            ))}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
