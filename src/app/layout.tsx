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
  title: "Subsonic Society Invitational Money Match | Nov 13–15, 2026 • Bristol, TN",
  description:
    "Official 2026 Competitor Packet for the Subsonic Society Invitational Money Match presented by Modacam Custom Rifles. November 13–15, 2026 at The Hideout (111 Hwy 44, Bristol, TN). Invite-only precision .22LR rimfire competition featuring 12 Main Event Stages and 2 Side Matches.",
  keywords: [
    "Subsonic Society",
    "Subsonic Society Invitational Money Match",
    "Modacam Custom Rifles",
    "The Hideout Bristol TN",
    "2026 Competitor Packet",
    "Precision Rimfire Money Match",
    ".22LR Invitational",
    "Bristol TN shooting competition",
    "precision rimfire",
    "Allen Hurley",
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
    title: "2026 Subsonic Society Invitational Money Match — Competitor Packet",
    description:
      "Presented by Modacam Custom Rifles • November 13–15, 2026 at The Hideout in Bristol, Tennessee. 12 Main Event Stages + 2 Side Matches, schedule, rules, and hotel info.",
    url: siteUrl,
    siteName: "Subsonic Society",
    images: [
      {
        url: `${siteUrl}/assets/subsonic-social-share-clean.jpg?v=4`,
        secureUrl: `${siteUrl}/assets/subsonic-social-share-clean.jpg?v=4`,
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "2026 Subsonic Society Invitational Money Match — Presented by Modacam Custom Rifles | Nov 13–15, 2026 • Bristol, TN",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "2026 Subsonic Society Invitational Money Match — Competitor Packet",
    description:
      "Presented by Modacam Custom Rifles • November 13–15, 2026 at The Hideout in Bristol, Tennessee. 12 Main Event Stages + 2 Side Matches, schedule, rules, and hotel info.",
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
      "description": "Official 2026 Competitor Packet for the Subsonic Society Invitational Money Match presented by Modacam Custom Rifles. November 13–15, 2026 at The Hideout (111 Hwy 44, Bristol, TN).",
      "sameAs": [
        "https://www.facebook.com/p/Subsonic-Society-61578052196057/"
      ],
      "sport": "Precision Rimfire Rifle Shooting (.22LR)",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "111 Hwy 44",
        "addressLocality": "Bristol",
        "addressRegion": "TN",
        "addressCountry": "US"
      }
    },
    {
      "@type": "SportsEvent",
      "@id": "https://subsonicsociety.com/#invitational-2026",
      "name": "Subsonic Society Invitational Money Match",
      "description": "Invite-only precision .22LR rimfire competition presented by Modacam Custom Rifles at The Hideout in Bristol, Tennessee. Features 12 Main Event Stages and 2 Side Matches.",
      "startDate": "2026-11-13",
      "endDate": "2026-11-15",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "eventStatus": "https://schema.org/EventScheduled",
      "location": {
        "@type": "Place",
        "name": "The Hideout",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "111 Hwy 44",
          "addressLocality": "Bristol",
          "addressRegion": "TN",
          "addressCountry": "US"
        }
      },
      "organizer": {
        "@id": "https://subsonicsociety.com/#organization"
      },
      "sponsor": {
        "@type": "Organization",
        "name": "Modacam Custom Rifles"
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://subsonicsociety.com/#website",
      "url": "https://subsonicsociety.com",
      "name": "Subsonic Society Invitational Money Match",
      "publisher": {
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
          <AppShell>{children}</AppShell>
          <PWAInstallPrompt />
        </TelemetryProvider>
      </body>
    </html>
  );
}
