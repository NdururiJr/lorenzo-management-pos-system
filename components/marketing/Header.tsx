/**
 * Header Component
 *
 * Sticky navigation header for marketing pages with glass morphism effect on scroll.
 * Features: responsive mobile menu, smooth transitions, dropdown login menu
 *
 * @module components/marketing/Header
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Services', href: '/services' },
  { name: 'Blog', href: '/blog' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Handle scroll for sticky header effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/90 backdrop-blur-lg shadow-md py-3'
          : 'bg-transparent py-5'
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 group"
          >
            <span className={cn(
              "text-2xl sm:text-3xl font-bold transition-colors group-hover:text-brand-blue",
              isScrolled ? "text-black" : "text-white"
            )}>
              Lorenzo
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'relative text-base font-medium transition-all duration-300',
                  'px-4 py-2 rounded-full',
                  pathname === item.href
                    ? isScrolled
                      ? 'text-brand-blue border-2 border-brand-blue bg-brand-blue-50'
                      : 'text-white border-2 border-white/50 bg-white/10 backdrop-blur-md hover:bg-white/20'
                    : isScrolled
                      ? 'text-gray-700 hover:text-brand-blue hover:border-2 hover:border-brand-blue/30 hover:bg-brand-blue-50/50'
                      : 'text-white hover:text-white hover:border-2 hover:border-white/30 hover:bg-white/10'
                )}
              >
                {item.name}
              </Link>
            ))}

            {/* Primary CTA */}
            <Button
              asChild
              variant="outline"
              className={cn(
                "rounded-full px-6 py-5 font-medium transition-all duration-300",
                isScrolled
                  ? "border-2 border-brand-blue text-brand-blue bg-white hover:bg-brand-blue hover:text-white"
                  : "border-2 border-white/50 text-white bg-white/10 backdrop-blur-md hover:bg-white/20 hover:border-white"
              )}
            >
              <Link href="/customer-login">Book Now</Link>
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={cn(
              "md:hidden p-2 transition-colors",
              isScrolled
                ? "text-gray-700 hover:text-brand-blue"
                : "text-white hover:text-brand-blue-light"
            )}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 animate-fade-in-down">
            <nav className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'px-4 py-3 rounded-lg text-base font-medium transition-colors',
                    pathname === item.href
                      ? 'bg-brand-blue-50 text-brand-blue'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile CTA */}
              <Button
                asChild
                className="w-full mt-4 bg-brand-blue hover:bg-brand-blue-dark text-white"
              >
                <Link href="/customer-login">Book Now</Link>
              </Button>
            </nav>
          </div>
        )}
      </div>

      {/* Backdrop overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </header>
  );
}
