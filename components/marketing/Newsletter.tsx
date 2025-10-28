/**
 * Newsletter Component
 *
 * Newsletter subscription section with background image and heavy blue overlay.
 * Features: email subscription form, glassmorphism design, animations, trust badges.
 *
 * @module components/marketing/Newsletter
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Mail, Check, ArrowRight, Shield, Sparkles, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Form validation schema
const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional().or(z.literal('')),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

const benefits = [
  {
    icon: Sparkles,
    text: 'Weekly garment care tips',
  },
  {
    icon: Gift,
    text: 'Exclusive member discounts',
  },
  {
    icon: Shield,
    text: 'Early access to promotions',
  },
];

export function Newsletter() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
  });

  const onSubmit = async (data: NewsletterFormData) => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Log submission (replace with actual API call later)
    console.log('Newsletter subscription:', data);

    setIsSubmitting(false);
    setIsSubmitted(true);
    reset();

    // Hide success message after 5 seconds
    setTimeout(() => {
      setIsSubmitted(false);
    }, 5000);
  };

  return (
    <section className="relative py-16 overflow-hidden bg-white" ref={ref}>
      {/* Background Image - will work with or without actual image */}
      <div className="absolute inset-0">
        <Image
          src="/images/marketing/newsletter-bg.jpg"
          alt="Newsletter background"
          fill
          className="object-cover blur-sm"
          quality={90}
          onError={(e) => {
            // Fallback: hide image if it doesn't exist
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      {/* Light blue overlay to preserve image while maintaining readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/30 via-brand-blue-dark/25 to-brand-blue/30" />
      <div className="absolute inset-0 backdrop-blur-sm" />

      {/* Decorative blur elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-blue-light rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl opacity-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-blue-dark rounded-full blur-3xl opacity-15" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          {/* Glassmorphism Card */}
          <div className="bg-white/90 backdrop-blur-xl border-2 border-white/60 rounded-3xl shadow-2xl p-6 md:p-10">
            {/* Header */}
            <div className="text-center mb-6">
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-block px-4 py-1.5 rounded-full text-white text-sm font-medium mb-4 shadow-lg"
                style={{ backgroundColor: '#22BBFF' }}
              >
                STAY UPDATED
              </motion.span>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-3"
              >
                Get Exclusive Tips
                <span className="text-brand-blue"> & Offers</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-base text-gray-600"
              >
                Subscribe to receive garment care tips, special discounts, and laundry hacks delivered to your inbox.
              </motion.p>
            </div>

            {/* Success Message */}
            {isSubmitted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mb-6 p-4 rounded-2xl bg-green-50 border-2 border-green-200 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-green-900">Successfully subscribed!</p>
                  <p className="text-sm text-green-700">Check your email for confirmation.</p>
                </div>
              </motion.div>
            )}

            {/* Form */}
            <motion.form
              onSubmit={handleSubmit(onSubmit)}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="space-y-3 mb-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name Input (Optional) */}
                <div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Your name (optional)"
                      {...register('name')}
                      className={cn(
                        'w-full px-4 py-3 rounded-xl',
                        'bg-white/70 backdrop-blur-md',
                        'border-2',
                        errors.name ? 'border-red-300' : 'border-gray-200',
                        'focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20',
                        'outline-none transition-all duration-300',
                        'placeholder:text-gray-400'
                      )}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                {/* Email Input */}
                <div>
                  <div className="relative">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                    />
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      {...register('email')}
                      className={cn(
                        'w-full pl-12 pr-4 py-3 rounded-xl',
                        'bg-white/70 backdrop-blur-md',
                        'border-2',
                        errors.email ? 'border-red-300' : 'border-gray-200',
                        'focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20',
                        'outline-none transition-all duration-300',
                        'placeholder:text-gray-400'
                      )}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full text-white font-semibold py-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#22BBFF' }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Subscribing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Subscribe Now
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>

              {/* Privacy Text */}
              <p className="text-center text-sm text-gray-600">
                We respect your privacy. Unsubscribe anytime. No spam, ever.
              </p>
            </motion.form>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="border-t border-gray-200 pt-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
                      style={{ backgroundColor: '#22BBFF' }}
                    >
                      <benefit.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-sm text-gray-700 font-medium">{benefit.text}</p>
                  </motion.div>
                ))}
              </div>

              {/* Trust Badge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: 1 }}
                className="mt-6 text-center"
              >
                <p className="text-sm text-gray-600">
                  <span className="font-bold text-brand-blue">Join 500+ subscribers</span> getting
                  weekly tips and exclusive offers
                </p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
