import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthenticatedChatWidget } from "@/components/chat";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  // ================================
  // BASIC METADATA
  // ================================
  title: {
    default: "Lorenzo Dry Cleaners - Premium Dry Cleaning Services in Nairobi",
    template: "%s | Lorenzo Dry Cleaners",
  },
  description:
    "Professional dry cleaning services across Nairobi with 21+ branches. Expert garment care, fast delivery, and convenient pickup. Kenya's trusted partner for premium fabric cleaning since 2013.",

  // ================================
  // KEYWORDS
  // ================================
  keywords: [
    "dry cleaning Nairobi",
    "dry cleaners Kilimani",
    "laundry services Kenya",
    "garment cleaning",
    "professional dry cleaning",
    "fabric care",
    "Lorenzo dry cleaners",
    "same day dry cleaning",
    "pickup and delivery",
    "premium laundry",
  ],

  // ================================
  // AUTHORS & CREATOR
  // ================================
  authors: [{ name: "Lorenzo Dry Cleaners" }],
  creator: "AI Agents Plus",
  publisher: "Lorenzo Dry Cleaners",

  // ================================
  // APPLICATION METADATA
  // ================================
  applicationName: "Lorenzo Dry Cleaners",
  category: "Business",
  classification: "Dry Cleaning Services",

  // ================================
  // ROBOTS & CRAWLING
  // ================================
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ================================
  // OPEN GRAPH (FACEBOOK, LINKEDIN)
  // ================================
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://lorenzo-dry-cleaners.com",
    siteName: "Lorenzo Dry Cleaners",
    title: "Lorenzo Dry Cleaners - Premium Dry Cleaning Services in Nairobi",
    description:
      "Professional dry cleaning services across Nairobi with 21+ branches. Expert garment care, fast delivery, and convenient pickup.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Lorenzo Dry Cleaners - Premium Dry Cleaning Services",
        type: "image/jpeg",
      },
    ],
  },

  // ================================
  // TWITTER CARD
  // ================================
  twitter: {
    card: "summary_large_image",
    title: "Lorenzo Dry Cleaners - Premium Dry Cleaning Services in Nairobi",
    description:
      "Professional dry cleaning services across Nairobi with 21+ branches. Expert garment care, fast delivery, and convenient pickup.",
    images: ["/twitter-image.jpg"],
    creator: "@lorenzodrycleaners",
    site: "@lorenzodrycleaners",
  },

  // ================================
  // ICONS & MANIFEST
  // ================================
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.svg", type: "image/svg+xml" },
    ],
    shortcut: ["/favicon.svg"],
  },
  manifest: "/manifest.json",

  // ================================
  // APP LINKS (MOBILE)
  // ================================
  appleWebApp: {
    capable: true,
    title: "Lorenzo Dry Cleaners",
    statusBarStyle: "default",
  },

  // ================================
  // FORMAT DETECTION
  // ================================
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },

  // ================================
  // OTHER METADATA
  // ================================
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://lorenzo-dry-cleaners.com"
  ),
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider>
          <QueryProvider>
            {children}
            {/* AI Chatbot Widget - appears on all pages */}
            <AuthenticatedChatWidget />
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
