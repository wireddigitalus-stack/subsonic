import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { TelemetryProvider } from "@/components/providers/TelemetryProvider";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null) ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://subsonic-omega.vercel.app");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
    icon: "/images/SS-RWB-LOGO.png",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-touch-icon-180x180.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-touch-icon-1024x1024.png", sizes: "1024x1024", type: "image/png" },
      { url: "/assets/apple-touch-icon.png" },
    ],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SUBSONIC SOCIETY",
  },
  alternates: {
    canonical: siteUrl,
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
    url: siteUrl,
    siteName: "Subsonic Society",
    images: [
      {
        url: `${siteUrl}/assets/subsonic-social-share-clean.jpg?v=4`,
        secureUrl: `${siteUrl}/assets/subsonic-social-share-clean.jpg?v=4`,
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "Subsonic Society - Precision Is In Our DNA | Competition • Testing • Education • Community",
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
    images: [`${siteUrl}/assets/subsonic-social-share-clean.jpg?v=4`],
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
        `${siteUrl}/assets/subsonic-social-share-clean.jpg?v=4`,
        `${siteUrl}/assets/subsonic-social-share-coin.jpg`,
        `${siteUrl}/assets/subsonic-banner-wide.png`,
        `${siteUrl}/images/SS-RWB-LOGO.png`
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
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://subsonicsociety.com/matches?q={search_term_string}",
        "query-input": "required name=search_term_string"
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
          <AppShell>{children}</AppShell>
          <PWAInstallPrompt />
        </TelemetryProvider>
      </body>
    </html>
  );
}
