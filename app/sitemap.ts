/**
 * Sitemap Configuration
 *
 * Generates sitemap.xml for search engine crawlers
 * Lists all public pages for indexing
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */

import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lorenzo-dry-cleaners.com';
  const currentDate = new Date();

  return [
    // ================================
    // PUBLIC PAGES (High Priority)
    // ================================
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },

    // ================================
    // LEGAL PAGES (Medium Priority)
    // ================================
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.4,
    },

    // ================================
    // AUTHENTICATION PAGES (Low Priority)
    // ================================
    // Note: Login pages are included but with low priority
    // as they're typically not useful in search results
    {
      url: `${baseUrl}/login`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/customer-login`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },

    // ================================
    // DYNAMIC BLOG POSTS
    // ================================
    // Add individual blog post URLs here when implemented
    // {
    //   url: `${baseUrl}/blog/how-to-care-for-delicate-fabrics`,
    //   lastModified: new Date('2025-10-15'),
    //   changeFrequency: 'monthly',
    //   priority: 0.6,
    // },

    // ================================
    // EXCLUDED FROM SITEMAP
    // ================================
    // Dashboard pages are excluded (behind authentication)
    // Customer portal pages are excluded (behind authentication)
    // API routes are excluded (not for search engines)
  ];
}
