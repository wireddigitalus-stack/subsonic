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
        url: "https://subsonicsociety.com/assets/subsonic-social-share-clean.jpg",
        secureUrl: "https://subsonicsociety.com/assets/subsonic-social-share-clean.jpg",
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "Subsonic Society - Precision Is In Our DNA | Competition • Testing • Education • Community",
      },
      {
        url: "https://subsonicsociety.com/assets/subsonic-social-share-coin.jpg",
        secureUrl: "https://subsonicsociety.com/assets/subsonic-social-share-coin.jpg",
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "Subsonic Society Symmetrical Coin Share Card",
      },
      {
        url: "https://subsonicsociety.com/assets/subsonic-banner-wide.png",
        width: 2172,
        height: 724,
        alt: "Subsonic Society Official Brand Logo",
      },
      {
        url: "https://subsonicsociety.com/assets/subsonic-coin.jpg",
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
    images: ["https://subsonicsociety.com/assets/subsonic-social-share-clean.jpg"],
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
        "https://subsonicsociety.com/assets/subsonic-social-share-clean.jpg",
        "https://subsonicsociety.com/assets/subsonic-social-share-coin.jpg",
        "https://subsonicsociety.com/assets/subsonic-banner-wide.png",
        "https://subsonicsociety.com/assets/subsonic-coin.jpg"
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
    },
    {
      "@type": "SportsEvent",
      "@id": "https://subsonicsociety.com/#bristol-pro-championship",
      "name": "Subsonic Society Invitational (Presented by Modacam Custom Rifles)",
      "description": "The premier 18-stage high-stakes precision rimfire pro championship in the mountains of Bristol, Tennessee (Elevation: 3,420 FT). $7,500 guaranteed cash purse and $15,000+ prize table.",
      "startDate": "2026-10-17T08:00:00-04:00",
      "endDate": "2026-10-18T17:00:00-04:00",
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "location": {
        "@type": "Place",
        "name": "The Hideout Range",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Bristol",
          "addressRegion": "TN",
          "postalCode": "37620",
          "addressCountry": "US"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "elevation": "3,420 FT"
        }
      },
      "organizer": {
        "@id": "https://subsonicsociety.com/#organization"
      },
      "sponsor": {
        "@type": "Organization",
        "name": "Modacam Custom Rifles",
        "url": "https://modacamrifles.com"
      },
      "offers": {
        "@type": "Offer",
        "url": "https://subsonicsociety.com/register",
        "price": "275.00",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://subsonicsociety.com/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Subsonic Society?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Subsonic Society is America's premier precision rimfire competition series, ballistics testing laboratory, and marksman fraternity based in Bristol, Tennessee. It organizes elite .22LR matches, publishes empirical lot-testing research, and fosters high-level competition culture."
          }
        },
        {
          "@type": "Question",
          "name": "What is the Subsonic Society Invitational and what is the cash purse?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The Subsonic Society Invitational is a premier two-day, 18-stage national precision rimfire championship taking place October 17–18, 2026 at The Hideout in Bristol, TN (3,420 FT elevation). It features an unprecedented $7,500 guaranteed cash purse presented by Modacam Custom Rifles, alongside over $15,000 in sponsor prize table gear."
          }
        },
        {
          "@type": "Question",
          "name": "Where is The Hideout range located?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The Hideout is situated at an elevation of 3,420 FT in the Appalachian mountain ridges surrounding Bristol, Tennessee (37620). It features 18 natural terrain barricade stages and steel target arrays stretching from 25 yards out to 465 yards across cross-canyon wind channels."
          }
        },
        {
          "@type": "Question",
          "name": "What ammunition is permitted in Subsonic Society matches?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Only standard-velocity or subsonic .22 Long Rifle ammunition with a published or chronographed muzzle velocity under 1,120 feet per second (FPS) at 59°F sea-level equivalent is authorized. Hyper-velocity ammunition exceeding 1,120 FPS is strictly prohibited to maintain steel target longevity, aerodynamic consistency, and pure marksman skill."
          }
        },
        {
          "@type": "Question",
          "name": "Who is the title sponsor of the Subsonic Society Invitational?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Modacam Custom Rifles is the presenting title sponsor of the 2026 Subsonic Society Invitational, providing the $7,500 cash purse and presenting custom match-grade precision rimfire hardware on the championship prize table."
          }
        },
        {
          "@type": "Question",
          "name": "What is the Subsonic DNA ballistics laboratory?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Subsonic DNA is the empirical research and ballistics testing arm of Subsonic Society. It publishes rigorous Doppler and radar chronograph lot analysis (measuring muzzle velocity, standard deviation, and extreme spread for Lapua Center-X, Midas+, and Eley Tenex) as well as harmonic barrel tuner benchmarks."
          }
        }
      ]
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
