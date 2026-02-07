/**
 * Footer Component
 *
 * Beautiful footer with teal/gold Lorenzo theme, company info, quick links, and social media.
 * Features: teal gradient background, frosted glass effects, modern animations.
 *
 * @module components/marketing/Footer
 */

'use client';

import Link from 'next/link';
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

/** POS system URL for customer and staff logins */
const POS_URL = process.env.NEXT_PUBLIC_POS_API_URL || 'http://localhost:3000';

// X (formerly Twitter) icon - Bootstrap Icons MIT License
const XIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className={className} viewBox="0 0 16 16">
    <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/>
  </svg>
);

const companyLinks = [
  { name: 'About Us', href: '/about' },
  { name: 'Our Services', href: '/services' },
  { name: 'Contact', href: '/contact' },
  { name: 'Careers', href: '/careers' },
];

const servicesLinks = [
  { name: 'Dry Cleaning', href: '/services#dry-cleaning' },
  { name: 'Wash & Fold', href: '/services#wash-fold' },
  { name: 'Express Service', href: '/services#express' },
  { name: 'Pickup & Delivery', href: '/services#delivery' },
];

const supportLinks = [
  { name: 'Track Order', href: `${POS_URL}/customer-login`, external: true },
  { name: 'Help Center', href: '/help', external: false },
  { name: 'FAQs', href: '/faq', external: false },
  { name: 'Privacy Policy', href: '/privacy', external: false },
  { name: 'Terms of Service', href: '/terms', external: false },
  { name: 'Staff Only', href: `${POS_URL}/login`, external: true },
];

const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: 'https://www.facebook.com/lorenzoprofessionaldrycleaners/' },
  { name: 'X', icon: XIcon, href: 'https://x.com' },
  { name: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/lorenzodrycleaners/?hl=en' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://ke.linkedin.com/company/lorenzo-drycleaners-ltd' },
];

export function Footer() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <footer className="relative overflow-hidden bg-lorenzo-dark" ref={ref}>
      {/* Teal Gradient Background Overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-lorenzo-dark via-lorenzo-teal to-lorenzo-dark-900" />
      <div className="absolute inset-0 bg-gradient-to-tr from-lorenzo-cream/5 via-transparent to-lorenzo-dark-900 opacity-40" />

      {/* Decorative blur elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-lorenzo-accent-teal rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-lorenzo-gold rounded-full blur-3xl opacity-15" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-lorenzo-teal rounded-full blur-3xl opacity-20" />

      {/* Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          {/* Main Footer Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12"
          >
            {/* Company Info */}
            <div className="lg:col-span-2">
              <Link href="/" className="inline-flex flex-col mb-4 group">
                <span className="text-2xl tracking-[0.25em] font-light text-white group-hover:text-lorenzo-accent-teal transition-colors duration-300">
                  LORENZO
                </span>
                <span className="text-[10px] tracking-[0.3em] uppercase mt-1 text-lorenzo-gold">
                  Dry Cleaners
                </span>
              </Link>
              <p className="text-white/80 mb-6 max-w-sm leading-relaxed">
                Professional dry cleaning service with real-time tracking, convenient pickup & delivery,
                and premium care for your garments across Nairobi.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <a
                  href="tel:+254728400200"
                  className="flex items-center space-x-3 text-white/80 hover:text-white hover:translate-x-1 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span>0728 400 200</span>
                </a>
                <a
                  href="mailto:hello@lorenzo.co.ke"
                  className="flex items-center space-x-3 text-white/80 hover:text-white hover:translate-x-1 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span>hello@lorenzo.co.ke</span>
                </a>
                <a
                  href="https://www.google.com/maps/search/Lorenzo+Dry+Cleaners+Nairobi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start space-x-3 text-white/80 hover:text-white hover:translate-x-1 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-all duration-300">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span>21+ Branches across Nairobi</span>
                </a>
              </div>
            </div>

            {/* Company Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h3 className="!text-white font-bold text-lg mb-4">Company</h3>
              <ul className="space-y-3">
                {companyLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-white/80 hover:text-white hover:translate-x-1 inline-block transition-all duration-300"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Services Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="!text-white font-bold text-lg mb-4">Services</h3>
              <ul className="space-y-3">
                {servicesLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-white/80 hover:text-white hover:translate-x-1 inline-block transition-all duration-300"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Support Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="!text-white font-bold text-lg mb-4">Support</h3>
              <ul className="space-y-3">
                {supportLinks.map((link) => (
                  <li key={link.name}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/80 hover:text-white hover:translate-x-1 inline-block transition-all duration-300"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-white/80 hover:text-white hover:translate-x-1 inline-block transition-all duration-300"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>

          {/* Bottom Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
          >
            {/* Copyright */}
            <p className="text-white/70 text-sm text-center md:text-left">
              © {new Date().getFullYear()} Lorenzo Dry Cleaners. All rights reserved.
              <span className="mx-2">•</span>
              <span className="text-white/80">Professional Service Since 2013</span>
            </p>

            {/* Social Links */}
            <div className="flex items-center space-x-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border-2 border-white/20 flex items-center justify-center text-white hover:bg-lorenzo-gold hover:text-lorenzo-dark hover:border-lorenzo-gold hover:scale-110 transition-all duration-300 shadow-lg"
                    whileHover={{ y: -3 }}
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
