/**
 * Testimonials Component
 *
 * Customer testimonials carousel with ratings and photos.
 * Auto-scrolls with pause on hover.
 *
 * @module components/marketing/Testimonials
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { GlassCardSolid } from './GlassCard';
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
    text: 'Professional service and great quality. The express 24-hour service has been a lifesaver for my business trips.',
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Auto-advance carousel
  useEffect(() => {
    if (!isPaused && inView) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, 5000); // Change every 5 seconds

      return () => clearInterval(interval);
    }
  }, [isPaused, inView]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <section className="py-20 bg-white" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-blue-50 text-brand-blue text-sm font-medium mb-4">
            HAPPY CLIENTS
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-4">
            What They Say
            <span className="text-brand-blue"> About Our Service</span>
          </h2>
          <p className="text-lg text-gray-600">
            Say goodbye to laundry day stress. We pick up, clean, and deliver your laundry — so you can focus on what really matters.
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div
          className="relative max-w-4xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Main Testimonial Card */}
          <div className="relative h-[400px] sm:h-[350px] lg:h-[300px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <TestimonialCard testimonial={testimonials[currentIndex]} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevious}
              className="rounded-full border-gray-300 hover:border-brand-blue hover:text-brand-blue"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            {/* Dots Indicator */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    'w-2.5 h-2.5 rounded-full transition-all duration-300',
                    index === currentIndex
                      ? 'bg-brand-blue w-8'
                      : 'bg-gray-300 hover:bg-gray-400'
                  )}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={goToNext}
              className="rounded-full border-gray-300 hover:border-brand-blue hover:text-brand-blue"
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
            <div className="text-4xl font-bold text-brand-blue mb-1">5.0</div>
            <div className="flex gap-0.5 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
          <div className="hidden sm:block w-px h-12 bg-gray-300" />
          <div className="flex flex-col items-center">
            <div className="text-4xl font-bold text-brand-blue mb-1">500+</div>
            <div className="text-sm text-gray-600">Happy Customers</div>
          </div>
          <div className="hidden sm:block w-px h-12 bg-gray-300" />
          <div className="flex flex-col items-center">
            <div className="text-4xl font-bold text-brand-blue mb-1">98%</div>
            <div className="text-sm text-gray-600">Satisfaction Rate</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

interface TestimonialCardProps {
  testimonial: {
    name: string;
    role: string;
    image: string;
    rating: number;
    text: string;
  };
}

function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <GlassCardSolid className="p-8 sm:p-10 h-full flex flex-col">
      {/* Quote Icon */}
      <div className="mb-6">
        <Quote className="w-12 h-12 text-brand-blue/30" />
      </div>

      {/* Testimonial Text */}
      <blockquote className="text-lg sm:text-xl text-gray-700 leading-relaxed mb-6 flex-grow">
        &ldquo;{testimonial.text}&rdquo;
      </blockquote>

      {/* Author Info */}
      <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-blue to-brand-blue-dark flex items-center justify-center text-white text-xl font-semibold flex-shrink-0">
          {testimonial.name.charAt(0)}
        </div>

        <div className="flex-grow">
          <div className="font-semibold text-black text-lg">{testimonial.name}</div>
          <div className="text-gray-600 text-sm">{testimonial.role}</div>
        </div>

        {/* Rating */}
        <div className="flex gap-0.5">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
          ))}
        </div>
      </div>
    </GlassCardSolid>
  );
}
