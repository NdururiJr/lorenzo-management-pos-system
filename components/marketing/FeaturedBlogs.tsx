/**
 * FeaturedBlogs Component
 *
 * Displays featured blog posts in a modern glassmorphism design.
 * Features blog cards with images, titles, excerpts, and read more links.
 *
 * @module components/marketing/FeaturedBlogs
 */

'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

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
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export function FeaturedBlogs() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md text-brand-blue text-sm font-medium mb-4 border-2 border-white/60">
            From Our Blog
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-4">
            Latest Insights &
            <span className="text-brand-blue"> Expert Tips</span>
          </h2>
          <p className="text-lg text-gray-600">
            Stay updated with the latest garment care tips, industry insights, and sustainable fashion trends.
          </p>
        </motion.div>

        {/* Blog Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {blogPosts.map((post, index) => (
            <motion.div key={post.id} variants={cardVariants}>
              <BlogCard {...post} index={index} />
            </motion.div>
          ))}
        </motion.div>

        {/* View All Blogs Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            style={{ backgroundColor: '#22BBFF' }}
          >
            View All Articles
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

interface BlogCardProps {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  date: string;
  category: string;
  slug: string;
  index: number;
}

function BlogCard({ title, excerpt, image, author, date, category, slug, index }: BlogCardProps) {
  return (
    <motion.article
      whileHover={{
        scale: 1.03,
        rotate: index % 2 === 0 ? -1 : 1,
        transition: { duration: 0.3 }
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
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 via-brand-blue-light/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      />

      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          quality={85}
          priority={false}
          onError={(e) => {
            // Fallback to a solid color background if image fails to load
            e.currentTarget.style.display = 'none';
          }}
        />

        {/* Category Badge */}
        <div className="absolute top-4 left-4 z-20">
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg"
            style={{ backgroundColor: '#22BBFF' }}
          >
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 flex-1 flex flex-col">
        {/* Meta Information */}
        <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" style={{ color: '#22BBFF' }} />
            <span>{author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" style={{ color: '#22BBFF' }} />
            <span>{date}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-black mb-3 group-hover:text-brand-blue transition-colors duration-300 line-clamp-2">
          {title}
        </h3>

        {/* Excerpt */}
        <p className="text-gray-600 leading-relaxed text-sm mb-4 line-clamp-3 flex-1">
          {excerpt}
        </p>

        {/* Read More Link */}
        <Link
          href={`/blog/${slug}`}
          className="inline-flex items-center gap-2 text-brand-blue font-semibold text-sm group-hover:gap-3 transition-all duration-300"
        >
          Read More
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.article>
  );
}
