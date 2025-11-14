/**
 * Robots.txt Configuration
 *
 * Controls search engine crawler access
 * Defines which pages can/cannot be crawled
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */

import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lorenzo-dry-cleaners.com';

  return {
    rules: [
      // ================================
      // DEFAULT RULE (All Bots)
      // ================================
      {
        userAgent: '*',

        // Allow crawling of public pages
        allow: [
          '/',
          '/about',
          '/services',
          '/contact',
          '/faq',
          '/help',
          '/blog',
          '/blog/*',
          '/privacy',
          '/terms',
        ],

        // Disallow crawling of authenticated areas
        disallow: [
          '/dashboard',
          '/dashboard/*',
          '/portal',
          '/portal/*',
          '/customer/*',
          '/api',
          '/api/*',
          '/_next',
          '/_next/*',
          '/static',
          '/static/*',
        ],

        // Crawl delay (seconds between requests)
        crawlDelay: 0,
      },

      // ================================
      // SPECIFIC BOTS (Optional)
      // ================================
      // Example: Restrict aggressive bots
      // {
      //   userAgent: 'BadBot',
      //   disallow: '/',
      // },

      // Example: Allow Google only
      // {
      //   userAgent: 'Googlebot',
      //   allow: '/',
      //   crawlDelay: 0,
      // },
    ],

    // ================================
    // SITEMAP LOCATION
    // ================================
    sitemap: `${baseUrl}/sitemap.xml`,

    // ================================
    // ADDITIONAL METADATA
    // ================================
    // Host directive (optional, for Google)
    host: baseUrl,
  };
}
