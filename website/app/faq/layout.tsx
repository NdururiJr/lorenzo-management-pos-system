import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQs - Dry Cleaning Questions Answered',
  description:
    'Find answers to common questions about Lorenzo Dry Cleaners services, pricing, pickup & delivery, payment methods, and account management.',
  alternates: {
    canonical: '/faq',
  },
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
