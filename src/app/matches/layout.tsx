import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Precision Rimfire Matches & Rulebook 2026 | Subsonic Society",
  description:
    "Official 2026 precision rimfire match schedule, course of fire briefings, and registration. Featuring the $7,500 Subsonic Society Invitational at The Hideout (Bristol, TN • 3,420 FT).",
  keywords: [
    "Precision rimfire matches 2026",
    "Subsonic Society Invitational",
    "Bristol TN rimfire match",
    "PRS Rimfire schedule",
    "NRL22 matches Tennessee",
    "Modacam Custom Rifles match",
    "Rimfire prize table",
    "300 yard 22LR match",
  ],
  alternates: {
    canonical: "https://subsonicsociety.com/matches",
  },
  openGraph: {
    title: "2026 Precision Rimfire Match Schedule & Rules | Subsonic Society",
    description:
      "Compete in premier high-country rimfire matches. 18 stages out to 465 yards. $7,500 guaranteed cash purse presented by Modacam Custom Rifles.",
    url: "https://subsonicsociety.com/matches",
    siteName: "Subsonic Society",
    images: [
      {
        url: "/assets/subsonic-social-share-clean.jpg?v=3",
        width: 1200,
        height: 630,
        alt: "Subsonic Society Precision Rimfire Matches",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "2026 Precision Rimfire Match Schedule | Subsonic Society",
    description:
      "18 stages, 3,420 FT elevation, $7,500 guaranteed cash purse. Official Subsonic Society Invitational.",
    images: ["/assets/subsonic-social-share-clean.jpg?v=3"],
  },
};

const matchesSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "@id": "https://subsonicsociety.com/matches#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://subsonicsociety.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Matches",
          "item": "https://subsonicsociety.com/matches"
        }
      ]
    },
    {
      "@type": "SportsEvent",
      "@id": "https://subsonicsociety.com/matches#invitational-2026",
      "name": "Subsonic Society Invitational (Presented by Modacam Custom Rifles)",
      "description": "The premier 18-stage high-stakes precision rimfire pro championship in Bristol, TN at 3,420 FT elevation. $7,500 guaranteed cash purse.",
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
          "elevation": "3420 FT"
        }
      },
      "organizer": {
        "@type": "SportsOrganization",
        "name": "Subsonic Society",
        "url": "https://subsonicsociety.com"
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
        "availability": "https://schema.org/InStock",
        "validFrom": "2026-01-01T00:00:00-05:00"
      }
    },
    {
      "@type": "SportsEvent",
      "@id": "https://subsonicsociety.com/matches#long-gong-2026",
      "name": "Subsonic 300X Long Gong Challenge",
      "description": "Extreme long-range rimfire engagement from 175 to 300 yards. Focus on subsonic wind call accuracy and elevation truing.",
      "startDate": "2026-08-15T08:30:00-04:00",
      "endDate": "2026-08-15T16:00:00-04:00",
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "location": {
        "@type": "Place",
        "name": "The Hideout Range - Bristol, TN"
      },
      "organizer": {
        "@type": "SportsOrganization",
        "name": "Subsonic Society",
        "url": "https://subsonicsociety.com"
      },
      "offers": {
        "@type": "Offer",
        "url": "https://subsonicsociety.com/register",
        "price": "125.00",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      }
    }
  ]
};

export default function MatchesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(matchesSchema) }}
      />
      {children}
    </>
  );
}
