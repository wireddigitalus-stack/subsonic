import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subsonic Society Invitational Money Match | Presented by Modacam",
  description:
    "The premier precision rimfire championship. 12 Main Event stages (8 Saturday, 4 Sunday) followed by 2 side matches, presented by Modacam Custom Rifles in Bristol, TN.",
  keywords: [
    "Subsonic Society Invitational",
    "Bristol TN rimfire championship",
    "Modacam Custom Rifles invitational",
    "Precision rimfire money match",
    "The Hideout Bristol shooting match",
    "Appalachian rimfire championship",
  ],
  alternates: {
    canonical: "https://subsonicsociety.com/bristol-pro",
  },
  openGraph: {
    title: "Subsonic Society Invitational Money Match | Presented by Modacam",
    description:
      "12 Main Event stages followed by 2 side matches in the Appalachian mountain winds. Presented by Modacam Custom Rifles.",
    url: "https://subsonicsociety.com/bristol-pro",
    siteName: "Subsonic Society",
    images: [
      {
        url: "/assets/subsonic-social-share-clean.jpg?v=4",
        width: 1200,
        height: 630,
        alt: "Subsonic Society Invitational presented by Modacam Custom Rifles",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Subsonic Society Invitational Money Match",
    description:
      "November 13–15, 2026 in Bristol, TN. Presented by Modacam Custom Rifles.",
    images: ["/assets/subsonic-social-share-clean.jpg?v=4"],
  },
};

const bristolProSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "@id": "https://subsonicsociety.com/bristol-pro#breadcrumb",
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
          "name": "Bristol Pro Invitational",
          "item": "https://subsonicsociety.com/bristol-pro"
        }
      ]
    },
    {
      "@type": "SportsEvent",
      "@id": "https://subsonicsociety.com/bristol-pro#event",
      "name": "Subsonic Society Invitational - High Country Championship",
      "description": "18 natural terrain barricade and long-distance steel stages across 465 yards. Featuring an unprecedented $7,500 guaranteed cash purse and $15,000+ prize table sponsored by Modacam Custom Rifles.",
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
      "sponsor": {
        "@type": "Organization",
        "name": "Modacam Custom Rifles",
        "url": "https://modacamrifles.com"
      },
      "organizer": {
        "@type": "SportsOrganization",
        "name": "Subsonic Society",
        "url": "https://subsonicsociety.com"
      },
      "offers": {
        "@type": "Offer",
        "name": "Competitor Registration Pass",
        "url": "https://subsonicsociety.com/register",
        "price": "275.00",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "validFrom": "2026-01-01T00:00:00-05:00"
      }
    }
  ]
};

export default function BristolProLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bristolProSchema) }}
      />
      {children}
    </>
  );
}
