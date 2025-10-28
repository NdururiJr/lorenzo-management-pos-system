/**
 * BlogHero Component
 *
 * Hero section for the blog listing page.
 * Features: heading, description, and search functionality.
 *
 * @module components/marketing/BlogHero
 */

'use client';

import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlogHeroProps {
  onSearch?: (query: string) => void;
}

export function BlogHero({ onSearch }: BlogHeroProps) {
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    onSearch?.(query);
  };

  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-white">
      {/* Blue Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-blue via-brand-blue-dark to-brand-blue-900" />
      <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue-50 via-transparent to-brand-blue-900 opacity-40" />

      {/* Decorative blur elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue-light rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl opacity-15" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-medium mb-6 border-2 border-white/30">
            OUR BLOG
          </span>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight" style={{ color: 'white' }}>
            Garment Care Tips &
            <br />
            <span className="text-brand-blue-light">Expert Insights</span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Discover professional tips, industry insights, and sustainable fashion trends to help you care for your wardrobe.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="search"
                placeholder="Search articles..."
                className={cn(
                  'w-full pl-14 pr-4 py-4 rounded-xl',
                  'bg-white/90 backdrop-blur-md',
                  'border-2 border-white/60',
                  'focus:border-white focus:ring-2 focus:ring-white/20',
                  'outline-none transition-all duration-300',
                  'placeholder:text-gray-400',
                  'text-black'
                )}
              />
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
