/**
 * Dynamic Location Page
 *
 * SEO-optimized location page for each of Lorenzo's 21+ branches.
 * Features: hero, branch info, services, map, nearby areas, and CTA.
 *
 * @module app/locations/[slug]/page
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Footer';
import { LocalBusinessSchema } from '@/components/seo/JsonLd';
import { getActiveBranches, getBranchById } from '@/lib/db/branches';
import {
  slugMap,
  getBranchIdFromSlug,
  extractNeighborhood,
  getNearbyAreas,
  formatPhoneNumber,
} from '@/lib/utils/location-helpers';
import { MapPin, Phone, Clock, Check } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Force dynamic rendering to avoid Firebase connection issues at build time
 * Location data will be fetched at request time instead
 */
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

/**
 * Generate SEO-optimized metadata for each location page
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const branchId = getBranchIdFromSlug(slug);

  if (!branchId) {
    return {
      title: 'Location Not Found | Lorenzo Dry Cleaners',
    };
  }

  const branch = await getBranchById(branchId);

  if (!branch) {
    return {
      title: 'Location Not Found | Lorenzo Dry Cleaners',
    };
  }

  const neighborhoodName = extractNeighborhood(branch.name);

  return {
    title: `Dry Cleaning ${neighborhoodName} | Lorenzo Dry Cleaners Nairobi`,
    description: `Professional dry cleaning in ${neighborhoodName}, Nairobi. Free pickup & delivery, 2-hour express. Visit us at ${branch.location.address} or schedule online.`,
    alternates: {
      canonical: `/locations/${slug}`,
    },
  };
}

/**
 * Location page component
 */
export default async function LocationPage({ params }: PageProps) {
  const { slug } = await params;
  const branchId = getBranchIdFromSlug(slug);

  if (!branchId) {
    notFound();
  }

  const branch = await getBranchById(branchId);

  if (!branch) {
    notFound();
  }

  const neighborhoodName = extractNeighborhood(branch.name);
  const nearbyAreas = getNearbyAreas(neighborhoodName);

  return (
    <main className="min-h-screen">
      {/* LocalBusiness Schema */}
      <LocalBusinessSchema branch={branch} neighborhoodName={neighborhoodName} slug={slug} />

      {/* Header */}
      <Header />

      {/* Hero Section */}
      <LocationHero neighborhoodName={neighborhoodName} />

      {/* Branch Information Card */}
      <BranchInfoSection branch={branch} neighborhoodName={neighborhoodName} />

      {/* Services Available */}
      <ServicesSection neighborhoodName={neighborhoodName} />

      {/* Google Map */}
      <MapSection branch={branch} neighborhoodName={neighborhoodName} />

      {/* Nearby Areas */}
      {nearbyAreas.length > 0 && <NearbyAreasSection neighborhoodName={neighborhoodName} nearbyAreas={nearbyAreas} />}

      {/* CTA Section */}
      <LocationCTA />

      {/* Footer */}
      <Footer />
    </main>
  );
}

function LocationHero({ neighborhoodName }: { neighborhoodName: string }) {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-lorenzo-dark">
      {/* Dark Teal Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-lorenzo-dark via-lorenzo-teal to-lorenzo-dark-900" />
      <div className="absolute inset-0 bg-gradient-to-tr from-lorenzo-cream/5 via-transparent to-lorenzo-dark-900 opacity-40" />

      {/* Decorative blur elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-lorenzo-accent-teal rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-lorenzo-gold rounded-full blur-3xl opacity-15" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-medium mb-6 border-2 border-white/30">
            {neighborhoodName.toUpperCase()}
          </span>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
            Lorenzo Dry Cleaners
            <br />
            <span className="text-lorenzo-gold">{neighborhoodName}</span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Professional dry cleaning and laundry services in {neighborhoodName}. Free pickup & delivery, 2-hour express service.
          </p>
        </div>
      </div>
    </section>
  );
}

function BranchInfoSection({
  branch,
  neighborhoodName,
}: {
  branch: { location: { address: string }; contactPhone: string };
  neighborhoodName: string;
}) {
  return (
    <section className="relative py-16 overflow-hidden bg-white">
      {/* Light Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-lorenzo-accent-teal-50 via-white to-lorenzo-accent-teal-100" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/70 backdrop-blur-xl border-2 border-white/60 rounded-3xl shadow-card p-8 md:p-12">
            <h2 className="text-3xl font-bold text-black mb-8 text-center">
              Visit Our {neighborhoodName} Branch
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Address */}
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#2DD4BF' }}
                >
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-black mb-1">Address</h3>
                  <p className="text-gray-600 text-sm">{branch.location.address}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#2DD4BF' }}
                >
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-black mb-1">Phone</h3>
                  <a
                    href={`tel:${branch.contactPhone}`}
                    className="text-lorenzo-accent-teal text-sm hover:underline"
                  >
                    {formatPhoneNumber(branch.contactPhone)}
                  </a>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#2DD4BF' }}
                >
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-black mb-1">Hours</h3>
                  <p className="text-gray-600 text-sm">Mon-Sat: 8:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServicesSection({ neighborhoodName }: { neighborhoodName: string }) {
  const services = [
    'Dry Cleaning',
    'Wash & Fold',
    '2-Hour Express Service',
    'Free Pickup & Delivery',
    'Alterations & Repairs',
    'Stain Removal Treatment',
  ];

  return (
    <section className="relative py-16 overflow-hidden bg-white">
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-black mb-8 text-center">
            Services at {neighborhoodName}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 bg-white/70 backdrop-blur-xl border-2 border-white/60 rounded-2xl p-4 shadow-card"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#2DD4BF' }}
                >
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-800 font-medium">{service}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MapSection({
  branch,
  neighborhoodName,
}: {
  branch: { location: { address: string; coordinates: { lat: number; lng: number } } };
  neighborhoodName: string;
}) {
  const mapEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'}&q=${branch.location.coordinates.lat},${branch.location.coordinates.lng}&zoom=15`;

  return (
    <section className="relative py-16 overflow-hidden bg-white">
      {/* Light Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-lorenzo-accent-teal-50 to-lorenzo-accent-teal-100" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-black mb-8 text-center">
            Location & Directions
          </h2>

          {/* Map */}
          <div className="rounded-3xl overflow-hidden shadow-2xl mb-6">
            <iframe
              src={mapEmbedUrl}
              width="100%"
              height="450"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Map of Lorenzo Dry Cleaners ${neighborhoodName}`}
            />
          </div>

          {/* Directions Button */}
          <div className="text-center">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${branch.location.coordinates.lat},${branch.location.coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              style={{ backgroundColor: '#2DD4BF' }}
            >
              Get Directions
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function NearbyAreasSection({
  neighborhoodName,
  nearbyAreas,
}: {
  neighborhoodName: string;
  nearbyAreas: Array<{ name: string; slug: string }>;
}) {
  return (
    <section className="relative py-16 overflow-hidden bg-white">
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-black mb-8 text-center">
            We Also Serve Nearby Areas
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {nearbyAreas.map((area) => (
              <Link
                key={area.slug}
                href={`/locations/${area.slug}`}
                className="bg-white/70 backdrop-blur-xl border-2 border-white/60 rounded-2xl p-4 text-center shadow-card hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <span className="text-lorenzo-accent-teal font-semibold">{area.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function LocationCTA() {
  const POS_URL = process.env.NEXT_PUBLIC_POS_API_URL || 'http://localhost:3000';

  return (
    <section className="relative py-16 overflow-hidden bg-white">
      {/* Blue Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-lorenzo-accent-teal-50 via-white to-lorenzo-accent-teal-100" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/70 backdrop-blur-xl border-2 border-white/60 rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Schedule your free pickup today. No commitment required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={`${POS_URL}/customer-login`}
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                style={{ backgroundColor: '#2DD4BF' }}
              >
                Schedule Pickup
              </a>
              <a
                href="tel:+254728400200"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-black font-semibold border-2 border-gray-200 shadow-lg hover:shadow-xl hover:border-lorenzo-accent-teal transition-all duration-300 hover:scale-105 w-full sm:w-auto"
              >
                Call Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
