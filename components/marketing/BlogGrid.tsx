/**
 * BlogGrid Component
 *
 * Grid display of blog post cards for the listing page.
 * Features: responsive grid with glassmorphism cards and hover effects.
 *
 * @module components/marketing/BlogGrid
 */

'use client';

import { motion, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Calendar, User, ArrowRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

// Sample blog posts data
const blogPosts = [
  {
    id: 1,
    title: 'The Ultimate Guide to Garment Care',
    excerpt: 'Learn professional tips and tricks to keep your clothes looking fresh and lasting longer.',
    image: '/images/blog/garment-care.jpg',
    author: 'Sarah Johnson',
    date: 'Jan 15, 2025',
    category: 'Care Tips',
    slug: 'ultimate-guide-garment-care',
    readTime: '5 min read',
  },
  {
    id: 2,
    title: 'Why Professional Dry Cleaning Matters',
    excerpt: 'Discover the science behind professional dry cleaning and how it protects your investment.',
    image: '/images/blog/dry-cleaning.jpg',
    author: 'Michael Chen',
    date: 'Jan 10, 2025',
    category: 'Industry Insights',
    slug: 'why-professional-dry-cleaning-matters',
    readTime: '4 min read',
  },
  {
    id: 3,
    title: 'Sustainable Fashion & Eco-Friendly Cleaning',
    excerpt: 'How we combine premium garment care with environmentally responsible practices.',
    image: '/images/blog/sustainable.jpg',
    author: 'Emma Williams',
    date: 'Jan 5, 2025',
    category: 'Sustainability',
    slug: 'sustainable-fashion-eco-friendly-cleaning',
    readTime: '6 min read',
  },
  {
    id: 4,
    title: 'How to Remove Stubborn Stains at Home',
    excerpt: 'Expert techniques for treating common stains before bringing clothes to the cleaners.',
    image: '/images/blog/stain-removal.jpg',
    author: 'David Ochieng',
    date: 'Dec 28, 2024',
    category: 'Care Tips',
    slug: 'how-to-remove-stubborn-stains',
    readTime: '7 min read',
  },
  {
    id: 5,
    title: 'The Future of Dry Cleaning Technology',
    excerpt: 'Exploring innovations in garment care and what they mean for customers.',
    image: '/images/blog/technology.jpg',
    author: 'James Mwangi',
    date: 'Dec 20, 2024',
    category: 'Industry Insights',
    slug: 'future-of-dry-cleaning-technology',
    readTime: '5 min read',
  },
  {
    id: 6,
    title: 'Caring for Delicate Fabrics: A Complete Guide',
    excerpt: 'Everything you need to know about maintaining silk, wool, and other delicate materials.',
    image: '/images/blog/delicate-fabrics.jpg',
    author: 'Grace Wanjiru',
    date: 'Dec 15, 2024',
    category: 'Care Tips',
    slug: 'caring-for-delicate-fabrics',
    readTime: '8 min read',
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
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

export function BlogGrid() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="relative py-16 overflow-hidden bg-white">
      {/* Light Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-brand-blue-50 to-white" />

      {/* Decorative blur elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-blue-light rounded-full blur-3xl opacity-15" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-blue rounded-full blur-3xl opacity-10" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {blogPosts.map((post, index) => (
            <motion.div key={post.id} variants={cardVariants}>
              <BlogCard post={post} index={index} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

interface BlogCardProps {
  post: {
    id: number;
    title: string;
    excerpt: string;
    image: string;
    author: string;
    date: string;
    category: string;
    slug: string;
    readTime: string;
  };
  index: number;
}

function BlogCard({ post, index }: BlogCardProps) {
  return (
    <motion.article
      whileHover={{
        scale: 1.03,
        rotate: index % 2 === 0 ? -1 : 1,
        transition: { duration: 0.3 },
      }}
      className={cn(
        'group relative rounded-3xl overflow-hidden',
        'bg-white/70 backdrop-blur-xl',
        'border-2 border-white/60',
        'shadow-card hover:shadow-2xl',
        'transition-all duration-300',
        'cursor-pointer',
        'h-full flex flex-col'
      )}
    >
      {/* Animated gradient on hover */}
      <motion.div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 via-brand-blue-light/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          quality={85}
          priority={false}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />

        {/* Category Badge */}
        <div className="absolute top-4 left-4 z-20">
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg"
            style={{ backgroundColor: '#22BBFF' }}
          >
            {post.category}
          </span>
        </div>

        {/* Read Time Badge */}
        <div className="absolute top-4 right-4 z-20">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white bg-black/40 backdrop-blur-md shadow-lg">
            <Clock className="w-3 h-3" />
            {post.readTime}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 flex-1 flex flex-col">
        {/* Meta Information */}
        <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" style={{ color: '#22BBFF' }} />
            <span>{post.author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" style={{ color: '#22BBFF' }} />
            <span>{post.date}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-black mb-3 group-hover:text-brand-blue transition-colors duration-300 line-clamp-2">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-gray-600 leading-relaxed text-sm mb-4 line-clamp-3 flex-1">
          {post.excerpt}
        </p>

        {/* Read More Link */}
        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center gap-2 text-brand-blue font-semibold text-sm group-hover:gap-3 transition-all duration-300"
        >
          Read More
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.article>
  );
}
