/**
 * Blog Listing Page
 *
 * Blog listing page with hero, category filters, and blog grid.
 * Features: search, category filtering, and responsive grid of blog posts.
 *
 * @module app/blog/page
 */

'use client';

import { useState } from 'react';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Footer';
import { BlogHero } from '@/components/marketing/BlogHero';
import { BlogCategories } from '@/components/marketing/BlogCategories';
import { BlogGrid } from '@/components/marketing/BlogGrid';

// Note: Metadata is exported from layout.tsx for client components
// or move this to a server component for direct metadata export

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    // TODO: Filter blog posts based on category
    console.log('Category changed to:', category);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // TODO: Filter blog posts based on search query
    console.log('Search query:', query);
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <BlogHero onSearch={handleSearch} />

      {/* Category Filters */}
      <BlogCategories
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* Blog Grid */}
      <BlogGrid />

      {/* Footer */}
      <Footer />
    </main>
  );
}
