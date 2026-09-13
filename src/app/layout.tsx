import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { MobileTabs } from "@/components/layout/MobileTabs";
import { Footer } from "@/components/layout/Footer";
import { TelemetryProvider } from "@/components/providers/TelemetryProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://subsonicsociety.com"),
  title: "Subsonic Society | Precision Rimfire Media & Bristol TN Mountain Championships",
  description:
    "Subsonic Society is a precision rimfire shooting media and community platform. We cover competitions, highlight athletes, discuss equipment, showcase venues and performance within the growing rimfire shooting sports world.",
  keywords: [
    "Subsonic Society",
    "Bristol TN shooting competition",
    "precision rimfire",
    "PRS Rimfire",
    "NRL22",
    ".22LR precision rifle",
    "Appalachian Mountain Rimfire Pro",
  ],
  authors: [{ name: "Subsonic Society" }],
  icons: {
    icon: "/assets/subsonic-coin.jpg",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/assets/apple-touch-icon.png" },
    ],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Subsonic",
  },
  alternates: {
    canonical: "https://subsonicsociety.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Subsonic Society | Precision Rimfire Competition & Media Platform",
    description:
      "Premier precision rimfire shootout in the mountains of Bristol, Tennessee. Follow stage briefings, match results, community chat, and gear breakdowns.",
    url: "https://subsonicsociety.com",
    siteName: "Subsonic Society",
    images: [
      {
        url: "/assets/subsonic-social-share.jpg",
        width: 1200,
        height: 630,
        alt: "Subsonic Society - Precision Is In Our DNA | Competition • Testing • Education • Community",
      },
      {
        url: "/assets/subsonic-facebook-cover.jpg",
        width: 1200,
        height: 630,
        alt: "Subsonic Society Bristol TN Precision Rimfire",
      },
      {
        url: "/assets/subsonic-banner-wide.png",
        width: 2172,
        height: 724,
        alt: "Subsonic Society Official Brand Logo",
      },
      {
        url: "/assets/subsonic-coin.jpg",
        width: 600,
        height: 600,
        alt: "Subsonic Society Official Crest Emblem",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Subsonic Society | Precision Rimfire Media & Mountain Pro Championship",
    description:
      "High-stakes precision rimfire shooting media, pro competitions in Bristol, TN mountains, and tactical community.",
    images: ["/assets/subsonic-social-share.jpg"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["SportsOrganization", "Organization"],
      "@id": "https://subsonicsociety.com/#organization",
      "name": "Subsonic Society",
      "alternateName": ["Subsonic Society .22 Rimfire", "Subsonic Society Precision Rimfire"],
      "url": "https://subsonicsociety.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://subsonicsociety.com/assets/subsonic-banner-wide.png",
        "caption": "Subsonic Society Official Logo"
      },
      "image": [
        "https://subsonicsociety.com/assets/subsonic-social-share.jpg",
        "https://subsonicsociety.com/assets/subsonic-banner-wide.png",
        "https://subsonicsociety.com/assets/subsonic-coin.jpg",
        "https://subsonicsociety.com/assets/subsonic-facebook-cover.jpg"
      ],
      "description": "Subsonic Society is a precision rimfire shooting media and community platform. We cover competitions, highlight athletes, discuss equipment, showcase venues and performance within the growing rimfire shooting sports world.",
      "sameAs": [
        "https://www.facebook.com/p/Subsonic-Society-61578052196057/"
      ],
      "sport": "Precision Rimfire Rifle Shooting (.22LR)",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Bristol",
        "addressRegion": "TN",
        "addressCountry": "US"
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://subsonicsociety.com/#website",
      "url": "https://subsonicsociety.com",
      "name": "Subsonic Society",
      "publisher": {
        "@id": "https://subsonicsociety.com/#organization"
      }
    },
    {
      "@type": "SportsEvent",
      "@id": "https://subsonicsociety.com/#bristol-pro-championship",
      "name": "Subsonic Society High Country Mountain Pro Rimfire Shootout",
      "description": "The premier 18-stage high-stakes precision rimfire pro championship in the mountains of Bristol, Tennessee (Elevation: 3,420 FT). $28,500 cash and gear purse.",
      "startDate": "2026-10-17T08:00:00-04:00",
      "endDate": "2026-10-18T17:00:00-04:00",
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "location": {
        "@type": "Place",
        "name": "Subsonic Society Mountain Ridge Range",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Bristol",
          "addressRegion": "TN",
          "addressCountry": "US"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "elevation": "3,420 FT"
        }
      },
      "organizer": {
        "@id": "https://subsonicsociety.com/#organization"
      }
    }
  ]
};

export const viewport: Viewport = {
  themeColor: "#07090E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="bg-[#07090E] text-slate-100 min-h-screen flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
        <TelemetryProvider>
          <Navbar />
          <main className="flex-1 safe-bottom-padding pt-20 sm:pt-24">
            {children}
          </main>
          <Footer />
          <MobileTabs />
        </TelemetryProvider>
      </body>
    </html>
  );
}
