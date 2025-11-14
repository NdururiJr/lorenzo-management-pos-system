import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Toaster } from "@/components/ui/sonner";

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
    "Professional dry cleaning services in Kilimani, Nairobi. Expert garment care, fast delivery, and convenient pickup. Your trusted partner for premium fabric cleaning since 2020.",

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
      "Professional dry cleaning services in Kilimani, Nairobi. Expert garment care, fast delivery, and convenient pickup.",
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
      "Professional dry cleaning services in Kilimani, Nairobi. Expert garment care, fast delivery, and convenient pickup.",
    images: ["/twitter-image.jpg"],
    creator: "@lorenzodrycleaners",
    site: "@lorenzodrycleaners",
  },

  // ================================
  // VERIFICATION TAGS
  // ================================
  // verification: {
  //   google: "your-google-verification-code",
  //   yandex: "your-yandex-verification-code",
  //   yahoo: "your-yahoo-verification-code",
  // },

  // ================================
  // ICONS & MANIFEST
  // ================================
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
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
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
