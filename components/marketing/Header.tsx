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
import { Menu, X, ChevronDown, User, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Services', href: '/services' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);
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
    setIsLoginDropdownOpen(false);
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

            {/* Login Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)}
                className={cn(
                  "flex items-center space-x-1 text-base font-medium transition-colors",
                  isScrolled
                    ? "text-gray-700 hover:text-brand-blue"
                    : "text-white hover:text-brand-blue-light"
                )}
              >
                <span>Login</span>
                <ChevronDown className={cn(
                  'w-4 h-4 transition-transform',
                  isLoginDropdownOpen && 'rotate-180'
                )} />
              </button>

              {/* Dropdown Menu */}
              {isLoginDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 rounded-xl bg-white shadow-lift border border-gray-100 overflow-hidden animate-fade-in-down">
                  <Link
                    href="/login"
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-brand-blue-50 flex items-center justify-center">
                      <User className="w-5 h-5 text-brand-blue" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">Staff Login</p>
                      <p className="text-xs text-gray-500">Management system</p>
                    </div>
                  </Link>
                  <Link
                    href="/customer-login"
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-brand-blue-50 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-brand-blue" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">Customer Login</p>
                      <p className="text-xs text-gray-500">Track your orders</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>

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
              <Link href="/contact">Book Now</Link>
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

              {/* Mobile Login Options */}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <Link
                  href="/login"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-brand-blue-50 flex items-center justify-center">
                    <User className="w-5 h-5 text-brand-blue" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">Staff Login</p>
                    <p className="text-xs text-gray-500">Management system</p>
                  </div>
                </Link>
                <Link
                  href="/customer-login"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-brand-blue-50 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-brand-blue" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">Customer Login</p>
                    <p className="text-xs text-gray-500">Track your orders</p>
                  </div>
                </Link>
              </div>

              {/* Mobile CTA */}
              <Button
                asChild
                className="w-full mt-4 bg-brand-blue hover:bg-brand-blue-dark text-white"
              >
                <Link href="/contact">Book Now</Link>
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
