import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lorenzo-dry-cleaners-website.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/customer-login/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
