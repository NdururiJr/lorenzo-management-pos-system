/**
 * ContactForm Component
 *
 * Contact form with React Hook Form and Zod validation.
 * Features: name, email, phone, subject, message fields with glassmorphism design.
 *
 * @module components/marketing/ContactForm
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, Send, User, Mail, Phone, MessageSquare, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Form validation schema
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .regex(/^\+254\d{9}$/, 'Phone must be in format +254XXXXXXXXX')
    .optional()
    .or(z.literal('')),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactForm() {
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
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    try {
      // Send to API endpoint
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setIsSubmitting(false);
      setIsSubmitted(true);
      reset();

      // Hide success message after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error('Contact form error:', error);
      setIsSubmitting(false);
      // You could add error state handling here
    }
  };

  return (
    <section className="relative py-24 overflow-hidden bg-white">
      {/* Blue Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-brand-blue-50 to-brand-blue-100" />

      {/* Decorative blur elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-blue-light rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-blue rounded-full blur-3xl opacity-15" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          {/* Glassmorphism Card */}
          <div className="bg-white/70 backdrop-blur-xl border-2 border-white/60 rounded-3xl shadow-2xl p-6 md:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-block px-4 py-1.5 rounded-full text-white text-sm font-medium mb-4 shadow-lg"
                style={{ backgroundColor: '#22BBFF' }}
              >
                SEND US A MESSAGE
              </motion.span>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-3"
              >
                Let's Start a
                <span className="text-brand-blue"> Conversation</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-base text-gray-600"
              >
                Fill out the form below and we'll get back to you within 24 hours.
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
                  <p className="font-semibold text-green-900">Message sent successfully!</p>
                  <p className="text-sm text-green-700">We'll get back to you soon.</p>
                </div>
              </motion.div>
            )}

            {/* Form */}
            <motion.form
              onSubmit={handleSubmit(onSubmit)}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="space-y-5"
            >
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    {...register('name')}
                    className={cn(
                      'w-full pl-12 pr-4 py-3 rounded-xl',
                      'bg-white/70 backdrop-blur-md',
                      'border-2',
                      errors.name ? 'border-red-300' : 'border-gray-200',
                      'focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20',
                      'outline-none transition-all duration-300',
                      'placeholder:text-gray-400'
                    )}
                  />
                </div>
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
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
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="phone"
                    type="tel"
                    placeholder="+254712345678"
                    {...register('phone')}
                    className={cn(
                      'w-full pl-12 pr-4 py-3 rounded-xl',
                      'bg-white/70 backdrop-blur-md',
                      'border-2',
                      errors.phone ? 'border-red-300' : 'border-gray-200',
                      'focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20',
                      'outline-none transition-all duration-300',
                      'placeholder:text-gray-400'
                    )}
                  />
                </div>
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
              </div>

              {/* Subject Field */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="subject"
                    type="text"
                    placeholder="How can we help?"
                    {...register('subject')}
                    className={cn(
                      'w-full pl-12 pr-4 py-3 rounded-xl',
                      'bg-white/70 backdrop-blur-md',
                      'border-2',
                      errors.subject ? 'border-red-300' : 'border-gray-200',
                      'focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20',
                      'outline-none transition-all duration-300',
                      'placeholder:text-gray-400'
                    )}
                  />
                </div>
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                )}
              </div>

              {/* Message Field */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                  <textarea
                    id="message"
                    rows={6}
                    placeholder="Tell us more about your inquiry..."
                    {...register('message')}
                    className={cn(
                      'w-full pl-12 pr-4 py-3 rounded-xl',
                      'bg-white/70 backdrop-blur-md',
                      'border-2',
                      errors.message ? 'border-red-300' : 'border-gray-200',
                      'focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20',
                      'outline-none transition-all duration-300',
                      'placeholder:text-gray-400',
                      'resize-none'
                    )}
                  />
                </div>
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
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
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Send Message
                    <Send className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </motion.form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
