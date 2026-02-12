/**
 * Locations Hub Page
 *
 * Central hub listing all 21+ Lorenzo branches across Nairobi.
 * Features: hero, locations grid, and map of all branches.
 *
 * @module app/locations/page
 */

import { Metadata } from 'next';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Footer';
import { getActiveBranches } from '@/lib/db/branches';
import { getSlugFromBranchId, extractNeighborhood } from '@/lib/utils/location-helpers';
import { MapPin, Phone, Clock } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'All Locations - 21+ Branches Across Nairobi',
  description: 'Find your nearest Lorenzo Dry Cleaners branch. 21+ locations across Nairobi with free pickup & delivery. Professional dry cleaning services.',
  alternates: {
    canonical: '/locations',
  },
};

export default async function LocationsPage() {
  const branches = await getActiveBranches();

  return (
    <main className="min-h-screen">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <LocationsHero />

      {/* Locations Grid */}
      <LocationsGrid branches={branches} />

      {/* CTA Section */}
      <LocationsCTA />

      {/* Footer */}
      <Footer />
    </main>
  );
}

function LocationsHero() {
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
            ALL LOCATIONS
          </span>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
            Our Locations
            <br />
            <span className="text-lorenzo-gold">Across Nairobi</span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            With 21+ branches across Nairobi, there's always a Lorenzo near you. Free pickup and delivery available from all locations.
          </p>
        </div>
      </div>
    </section>
  );
}

function LocationsGrid({
  branches,
}: {
  branches: Array<{
    branchId: string;
    name: string;
    location: { address: string };
    contactPhone: string;
  }>;
}) {
  return (
    <section className="relative py-24 overflow-hidden bg-white">
      {/* Light Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-lorenzo-accent-teal-50 via-white to-lorenzo-accent-teal-100" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-black mb-12 text-center">
            Find Your
            <span className="text-lorenzo-accent-teal"> Nearest Branch</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches.map((branch) => {
              const slug = getSlugFromBranchId(branch.branchId);
              const neighborhoodName = extractNeighborhood(branch.name);

              if (!slug) return null;

              return (
                <Link
                  key={branch.branchId}
                  href={`/locations/${slug}`}
                  className="block bg-white/70 backdrop-blur-xl border-2 border-white/60 rounded-3xl shadow-card hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] p-6 group"
                >
                  {/* Branch Name */}
                  <h3 className="text-xl font-bold text-black mb-4 group-hover:text-lorenzo-accent-teal transition-colors duration-300">
                    {neighborhoodName}
                  </h3>

                  {/* Address */}
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: '#2DD4BF' }}
                    >
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed pt-2">
                      {branch.location.address}
                    </p>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: '#2DD4BF' }}
                    >
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-600 text-sm">{branch.contactPhone}</span>
                  </div>

                  {/* Hours */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: '#2DD4BF' }}
                    >
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-600 text-sm">Mon-Sat: 8AM - 6PM</span>
                  </div>

                  {/* View Details Link */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="text-sm text-lorenzo-accent-teal font-medium group-hover:underline">
                      View Details →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function LocationsCTA() {
  return (
    <section className="relative py-16 overflow-hidden bg-white">
      {/* Blue Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-lorenzo-accent-teal-50 to-lorenzo-accent-teal-100" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/70 backdrop-blur-xl border-2 border-white/60 rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
              Can't Find Your Area?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              We offer free pickup and delivery across all of Nairobi. Schedule your pickup online or call us to arrange a convenient time.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="tel:+254728400200"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                style={{ backgroundColor: '#2DD4BF' }}
              >
                Call Us Now
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-black font-semibold border-2 border-gray-200 shadow-lg hover:shadow-xl hover:border-lorenzo-accent-teal transition-all duration-300 hover:scale-105 w-full sm:w-auto"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
