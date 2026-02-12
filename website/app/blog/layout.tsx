import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Garment Care Tips & Expert Advice',
  description:
    'Expert dry cleaning tips, garment care guides, and industry insights from Lorenzo Dry Cleaners. Learn how to care for your clothes and keep them looking their best.',
  alternates: {
    canonical: '/blog',
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
