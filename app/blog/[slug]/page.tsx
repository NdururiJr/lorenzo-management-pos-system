/**
 * Blog Post Page
 *
 * Individual blog post page with dynamic slug routing.
 * Features: hero section, blog content, and related posts.
 *
 * @module app/blog/[slug]/page
 */

import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Footer';
import { BlogPostHero } from '@/components/marketing/BlogPostHero';
import { BlogPostContent, sampleBlogContent } from '@/components/marketing/BlogPostContent';
import { BlogPostFooter } from '@/components/marketing/BlogPostFooter';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

// Sample blog posts data (in production, this would come from a database or CMS)
const blogPosts = {
  'ultimate-guide-garment-care': {
    title: 'The Ultimate Guide to Garment Care',
    author: 'Sarah Johnson',
    date: 'Jan 15, 2025',
    category: 'Care Tips',
    readTime: '5 min read',
    image: '/images/blog/garment-care.jpg',
    content: sampleBlogContent,
  },
  'why-professional-dry-cleaning-matters': {
    title: 'Why Professional Dry Cleaning Matters',
    author: 'Michael Chen',
    date: 'Jan 10, 2025',
    category: 'Industry Insights',
    readTime: '4 min read',
    image: '/images/blog/dry-cleaning.jpg',
    content: sampleBlogContent,
  },
  'sustainable-fashion-eco-friendly-cleaning': {
    title: 'Sustainable Fashion & Eco-Friendly Cleaning',
    author: 'Emma Williams',
    date: 'Jan 5, 2025',
    category: 'Sustainability',
    readTime: '6 min read',
    image: '/images/blog/sustainable.jpg',
    content: sampleBlogContent,
  },
  'how-to-remove-stubborn-stains': {
    title: 'How to Remove Stubborn Stains at Home',
    author: 'David Ochieng',
    date: 'Dec 28, 2024',
    category: 'Care Tips',
    readTime: '7 min read',
    image: '/images/blog/stain-removal.jpg',
    content: sampleBlogContent,
  },
  'future-of-dry-cleaning-technology': {
    title: 'The Future of Dry Cleaning Technology',
    author: 'James Mwangi',
    date: 'Dec 20, 2024',
    category: 'Industry Insights',
    readTime: '5 min read',
    image: '/images/blog/technology.jpg',
    content: sampleBlogContent,
  },
  'caring-for-delicate-fabrics': {
    title: 'Caring for Delicate Fabrics: A Complete Guide',
    author: 'Grace Wanjiru',
    date: 'Dec 15, 2024',
    category: 'Care Tips',
    readTime: '8 min read',
    image: '/images/blog/delicate-fabrics.jpg',
    content: sampleBlogContent,
  },
};

type _BlogPost = (typeof blogPosts)[keyof typeof blogPosts];

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts[slug as keyof typeof blogPosts];

  if (!post) {
    return {
      title: 'Post Not Found | Lorenzo Dry Cleaners',
    };
  }

  return {
    title: `${post.title} | Lorenzo Dry Cleaners Blog`,
    description: post.title,
  };
}

export async function generateStaticParams() {
  return Object.keys(blogPosts).map((slug) => ({
    slug,
  }));
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = blogPosts[slug as keyof typeof blogPosts];

  // If post doesn't exist, show 404
  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <Header />

      {/* Blog Post Hero */}
      <BlogPostHero
        title={post.title}
        author={post.author}
        date={post.date}
        category={post.category}
        readTime={post.readTime}
        image={post.image}
      />

      {/* Blog Post Content */}
      <BlogPostContent content={post.content} />

      {/* Blog Post Footer (Social Share + Related Posts) */}
      <BlogPostFooter />

      {/* Footer */}
      <Footer />
    </main>
  );
}
