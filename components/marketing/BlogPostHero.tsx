/**
 * BlogPostHero Component
 *
 * Hero section for individual blog post pages.
 * Features: title, meta information, featured image, and glassmorphism design.
 *
 * @module components/marketing/BlogPostHero
 */

'use client';

import { Calendar, User, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface BlogPostHeroProps {
  title: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
  image: string;
}

export function BlogPostHero({
  title,
  author,
  date,
  category,
  readTime,
  image,
}: BlogPostHeroProps) {
  return (
    <section className="relative pt-32 pb-16 overflow-hidden bg-white">
      {/* Blue Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-blue-50 via-white to-brand-blue-100" />

      {/* Decorative blur elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-blue-light rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-blue rounded-full blur-3xl opacity-15" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-brand-blue font-semibold mb-8 hover:gap-3 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          {/* Category Badge */}
          <span
            className="inline-block px-4 py-1.5 rounded-full text-white text-sm font-bold mb-6 shadow-lg"
            style={{ backgroundColor: '#22BBFF' }}
          >
            {category}
          </span>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-6 leading-tight">
            {title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 mb-8 text-gray-600">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" style={{ color: '#22BBFF' }} />
              <span className="font-medium">{author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" style={{ color: '#22BBFF' }} />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" style={{ color: '#22BBFF' }} />
              <span>{readTime}</span>
            </div>
          </div>

          {/* Featured Image */}
          <div className="relative rounded-3xl overflow-hidden bg-white/70 backdrop-blur-xl border-2 border-white/60 shadow-2xl p-3">
            <div className="relative aspect-video rounded-2xl overflow-hidden">
              <Image
                src={image}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
                quality={90}
                priority
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
