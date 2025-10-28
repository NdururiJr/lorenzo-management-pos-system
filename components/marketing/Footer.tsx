/**
 * Footer Component
 *
 * Marketing site footer with company info, quick links, and contact information.
 *
 * @module components/marketing/Footer
 */

'use client';

import Link from 'next/link';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

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
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribing(true);

    // TODO: Implement newsletter subscription logic
    await new Promise(resolve => setTimeout(resolve, 1000));

    setEmail('');
    setIsSubscribing(false);
    alert('Thank you for subscribing!');
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="text-3xl font-bold text-white">Lorenzo</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              Professional dry cleaning service with real-time tracking, convenient pickup & delivery,
              and premium care for your garments in Kilimani, Nairobi.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a
                href="tel:+254725462859"
                className="flex items-center space-x-3 text-gray-400 hover:text-brand-blue transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span>+254 725 462 859</span>
              </a>
              <a
                href="mailto:hello@lorenzo.co.ke"
                className="flex items-center space-x-3 text-gray-400 hover:text-brand-blue transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span>hello@lorenzo.co.ke</span>
              </a>
              <div className="flex items-start space-x-3 text-gray-400">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>Kilimani, Nairobi, Kenya</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-brand-blue transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-3">
              {servicesLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-brand-blue transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-brand-blue transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="max-w-md">
            <h3 className="text-white font-semibold mb-2">Subscribe to Our Newsletter</h3>
            <p className="text-gray-400 text-sm mb-4">
              Get laundry tips, exclusive offers, and service updates delivered to your inbox.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-brand-blue"
              />
              <Button
                type="submit"
                disabled={isSubscribing}
                className="bg-brand-blue hover:bg-brand-blue-dark text-white whitespace-nowrap"
              >
                {isSubscribing ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Copyright */}
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Lorenzo Dry Cleaners. All rights reserved.
            <span className="mx-2">•</span>
            Professional Service Since 2024
          </p>

          {/* Social Links */}
          <div className="flex items-center space-x-4">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-brand-blue hover:text-white transition-all"
                  aria-label={social.name}
                >
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
