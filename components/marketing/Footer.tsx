/**
 * Footer Component
 *
 * Beautiful footer with blue glassmorphism theme, company info, quick links, and social media.
 * Features: blue gradient background, frosted glass effects, modern animations.
 *
 * @module components/marketing/Footer
 */

'use client';

import Link from 'next/link';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

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
  { name: 'Track Order', href: '/customer-login' },
  { name: 'Help Center', href: '/help' },
  { name: 'FAQs', href: '/faq' },
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms of Service', href: '/terms' },
];

const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: 'https://facebook.com' },
  { name: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
  { name: 'Instagram', icon: Instagram, href: 'https://instagram.com' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com' },
];

export function Footer() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <footer className="relative overflow-hidden bg-brand-blue" ref={ref}>
      {/* Blue Gradient Background Overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-blue via-brand-blue-dark to-brand-blue-900" />
      <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue-50 via-transparent to-brand-blue-900 opacity-40" />

      {/* Decorative blur elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-blue-light rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl opacity-15" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-blue rounded-full blur-3xl opacity-20" />

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
              <Link href="/" className="inline-block mb-4 group">
                <span className="text-3xl font-bold text-white group-hover:text-brand-blue-light transition-colors duration-300">
                  Lorenzo
                </span>
              </Link>
              <p className="text-white/80 mb-6 max-w-sm leading-relaxed">
                Professional dry cleaning service with real-time tracking, convenient pickup & delivery,
                and premium care for your garments in Kilimani, Nairobi.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <a
                  href="tel:+254725462859"
                  className="flex items-center space-x-3 text-white/80 hover:text-white hover:translate-x-1 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span>+254 725 462 859</span>
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
                <div className="flex items-start space-x-3 text-white/80 group">
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span>Kilimani, Nairobi, Kenya</span>
                </div>
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
              <span className="text-white/80">Professional Service Since 2024</span>
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
                    className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border-2 border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-brand-blue hover:border-white hover:scale-110 transition-all duration-300 shadow-lg"
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
