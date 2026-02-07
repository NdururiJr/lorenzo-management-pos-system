/**
 * JSON-LD Structured Data Components
 *
 * Reusable components for adding structured data to pages.
 * Supports LocalBusiness, FAQPage, Service, BlogPosting, and ContactPoint schemas.
 */

interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function LocalBusinessJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://lorenzo-dry-cleaners-website.vercel.app',
    name: 'Lorenzo Dry Cleaners',
    description: 'Professional dry cleaning services across Nairobi with 21+ branches. Expert garment care, fast delivery, and convenient pickup.',
    url: 'https://lorenzo-dry-cleaners-website.vercel.app',
    telephone: '+254700000000',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Kilimani',
      addressLocality: 'Nairobi',
      addressCountry: 'KE',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -1.2921,
      longitude: 36.8219,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '08:00',
        closes: '18:00',
      },
    ],
    priceRange: 'KSh 150 - KSh 5000',
    image: 'https://lorenzo-dry-cleaners-website.vercel.app/og-image.jpg',
    sameAs: [],
    areaServed: {
      '@type': 'City',
      name: 'Nairobi',
    },
    serviceType: 'Dry Cleaning',
    numberOfEmployees: {
      '@type': 'QuantitativeValue',
      minValue: 50,
    },
  };

  return <JsonLd data={data} />;
}

export function FAQPageJsonLd({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return <JsonLd data={data} />;
}

export function ServiceJsonLd({ services }: { services: { name: string; description: string }[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: services.map((service, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Service',
        name: service.name,
        description: service.description,
        provider: {
          '@type': 'LocalBusiness',
          name: 'Lorenzo Dry Cleaners',
        },
      },
    })),
  };

  return <JsonLd data={data} />;
}

export function BlogPostingJsonLd({
  title,
  description,
  datePublished,
  dateModified,
  author,
  image,
  url,
}: {
  title: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  image?: string;
  url: string;
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Lorenzo Dry Cleaners',
    },
    image: image || 'https://lorenzo-dry-cleaners-website.vercel.app/og-image.jpg',
    url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };

  return <JsonLd data={data} />;
}

export function ContactPageJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Lorenzo Dry Cleaners',
    description: 'Get in touch with Lorenzo Dry Cleaners for professional dry cleaning services in Nairobi.',
    url: 'https://lorenzo-dry-cleaners-website.vercel.app/contact',
    mainEntity: {
      '@type': 'LocalBusiness',
      name: 'Lorenzo Dry Cleaners',
      telephone: '+254700000000',
      email: 'info@lorenzo-dry-cleaners.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Kilimani',
        addressLocality: 'Nairobi',
        addressCountry: 'KE',
      },
    },
  };

  return <JsonLd data={data} />;
}
