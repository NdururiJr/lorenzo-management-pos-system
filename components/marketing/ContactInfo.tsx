/**
 * ContactInfo Component
 *
 * Displays contact information cards with phone, email, and location.
 * Features glassmorphism design with icons and interactive elements.
 *
 * @module components/marketing/ContactInfo
 */

'use client';

import { motion, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const contactMethods = [
  {
    id: 1,
    icon: Phone,
    title: 'Phone',
    details: '+254 725 462 859',
    subtitle: 'Available Mon-Sat, 8am-6pm',
    action: 'Call Us',
    href: 'tel:+254725462859',
  },
  {
    id: 2,
    icon: Mail,
    title: 'Email',
    details: 'hello@lorenzo.co.ke',
    subtitle: 'We respond within 24 hours',
    action: 'Email Us',
    href: 'mailto:hello@lorenzo.co.ke',
  },
  {
    id: 3,
    icon: MapPin,
    title: 'Location',
    details: 'Kilimani, Nairobi',
    subtitle: 'Free pickup & delivery',
    action: 'Get Directions',
    href: 'https://maps.google.com/?q=Kilimani,Nairobi,Kenya',
  },
];

const businessHours = [
  { day: 'Monday - Friday', hours: '8:00 AM - 6:00 PM' },
  { day: 'Saturday', hours: '9:00 AM - 4:00 PM' },
  { day: 'Sunday', hours: 'Closed' },
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

export function ContactInfo() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="relative py-24 overflow-hidden bg-white">
      {/* Blue Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-blue-50 via-white to-brand-blue-100" />

      {/* Decorative blur elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue-light rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-blue rounded-full blur-3xl opacity-15" />

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
            GET IN TOUCH
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-4">
            We're Here to
            <span className="text-brand-blue"> Help</span>
          </h2>
          <p className="text-lg text-gray-600">
            Have questions? Need assistance? Our team is ready to help you with all your garment care needs.
          </p>
        </motion.div>

        {/* Contact Cards Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 mb-16"
        >
          {contactMethods.map((method, index) => (
            <motion.div key={method.id} variants={cardVariants}>
              <ContactCard method={method} index={index} />
            </motion.div>
          ))}
        </motion.div>

        {/* Business Hours Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <div
            className={cn(
              'relative rounded-3xl p-8',
              'bg-white/70 backdrop-blur-xl',
              'border-2 border-white/60',
              'shadow-card',
              'overflow-hidden'
            )}
          >
            {/* Animated gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 via-brand-blue-light/5 to-transparent pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: '#22BBFF' }}
                >
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-black">Business Hours</h3>
              </div>

              {/* Hours List */}
              <div className="space-y-4">
                {businessHours.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0"
                  >
                    <span className="text-gray-700 font-medium">{item.day}</span>
                    <span className="text-black font-semibold">{item.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

interface ContactCardProps {
  method: {
    id: number;
    icon: React.ElementType;
    title: string;
    details: string;
    subtitle: string;
    action: string;
    href: string;
  };
  index: number;
}

function ContactCard({ method, index }: ContactCardProps) {
  const Icon = method.icon;

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
          {method.title}
        </h3>

        {/* Details */}
        <p className="text-lg text-gray-900 font-semibold mb-2">{method.details}</p>

        {/* Subtitle */}
        <p className="text-sm text-gray-600 mb-6 flex-grow">{method.subtitle}</p>

        {/* Action Button */}
        <a
          href={method.href}
          target={method.href.startsWith('http') ? '_blank' : undefined}
          rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          style={{ backgroundColor: '#22BBFF' }}
        >
          {method.action}
        </a>
      </div>
    </motion.article>
  );
}
