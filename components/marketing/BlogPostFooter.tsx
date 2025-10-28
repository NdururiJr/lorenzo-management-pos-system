/**
 * BlogPostFooter Component
 *
 * Footer section for blog post pages with related posts and social sharing.
 * Features: social share buttons and related posts grid.
 *
 * @module components/marketing/BlogPostFooter
 */

'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Share2, Facebook, Twitter, Linkedin, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

const relatedPosts = [
  {
    id: 1,
    title: 'How to Remove Stubborn Stains at Home',
    excerpt: 'Expert techniques for treating common stains before bringing clothes to the cleaners.',
    image: '/images/blog/stain-removal.jpg',
    category: 'Care Tips',
    slug: 'how-to-remove-stubborn-stains',
  },
  {
    id: 2,
    title: 'Caring for Delicate Fabrics: A Complete Guide',
    excerpt: 'Everything you need to know about maintaining silk, wool, and other delicate materials.',
    image: '/images/blog/delicate-fabrics.jpg',
    category: 'Care Tips',
    slug: 'caring-for-delicate-fabrics',
  },
  {
    id: 3,
    title: 'Sustainable Fashion & Eco-Friendly Cleaning',
    excerpt: 'How we combine premium garment care with environmentally responsible practices.',
    image: '/images/blog/sustainable.jpg',
    category: 'Sustainability',
    slug: 'sustainable-fashion-eco-friendly-cleaning',
  },
];

const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: '#', color: '#1877F2' },
  { name: 'Twitter', icon: Twitter, href: '#', color: '#1DA1F2' },
  { name: 'LinkedIn', icon: Linkedin, href: '#', color: '#0A66C2' },
  { name: 'Email', icon: Mail, href: '#', color: '#22BBFF' },
];

export function BlogPostFooter() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <>
      {/* Social Share Section */}
      <section className="relative py-12 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-brand-blue-50 to-white" />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div
              className={cn(
                'rounded-2xl p-6',
                'bg-white/70 backdrop-blur-xl',
                'border-2 border-white/60',
                'shadow-card'
              )}
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: '#22BBFF' }}
                  >
                    <Share2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-black">Share this article</h3>
                    <p className="text-sm text-gray-600">Help others learn about garment care</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={social.name}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-11 h-11 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-md hover:shadow-lg"
                        style={{ color: social.color }}
                        aria-label={`Share on ${social.name}`}
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts Section */}
      <section className="relative py-16 overflow-hidden bg-white" ref={ref}>
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue-50 via-white to-brand-blue-100" />

        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue-light rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-blue rounded-full blur-3xl opacity-15" />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
              Related
              <span className="text-brand-blue"> Articles</span>
            </h2>
            <p className="text-lg text-gray-600">Continue learning with these related articles</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {relatedPosts.map((post, index) => (
              <RelatedPostCard key={post.id} post={post} index={index} inView={inView} />
            ))}
          </div>

          {/* CTA to Blog */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center mt-12"
          >
            <Link
              href="/blog"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              style={{ backgroundColor: '#22BBFF' }}
            >
              View All Articles
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}

interface RelatedPostCardProps {
  post: {
    id: number;
    title: string;
    excerpt: string;
    image: string;
    category: string;
    slug: string;
  };
  index: number;
  inView: boolean;
}

function RelatedPostCard({ post, index, inView }: RelatedPostCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{
        scale: 1.05,
        transition: { duration: 0.3 },
      }}
      className={cn(
        'group relative rounded-2xl overflow-hidden',
        'bg-white/70 backdrop-blur-xl',
        'border-2 border-white/60',
        'shadow-card hover:shadow-2xl',
        'transition-all duration-300',
        'cursor-pointer'
      )}
    >
      <Link href={`/blog/${post.slug}`}>
        {/* Image */}
        <div className="relative h-40 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, 33vw"
            quality={85}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />

          {/* Category Badge */}
          <div className="absolute top-3 left-3 z-20">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg"
              style={{ backgroundColor: '#22BBFF' }}
            >
              {post.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-black mb-2 group-hover:text-brand-blue transition-colors duration-300 line-clamp-2">
            {post.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
        </div>
      </Link>
    </motion.article>
  );
}
