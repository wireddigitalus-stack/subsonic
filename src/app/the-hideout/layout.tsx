import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Hideout Range | 3,420 FT Precision Rimfire Topography (Bristol, TN)",
  description:
    "Explore The Hideout, home range of Subsonic Society. Situated at 3,420 FT on Holston Mountain in Bristol, TN. 18 stages, 465-yard cross-canyon steel, and high-altitude density ballistics.",
  keywords: [
    "The Hideout shooting range",
    "Bristol TN shooting range",
    "Holston Mountain range",
    "3420 ft elevation shooting",
    "Cross-canyon rimfire steel",
    "Subsonic Society home range",
    "Appalachian precision rifle range",
  ],
  alternates: {
    canonical: "https://subsonicsociety.com/the-hideout",
  },
  openGraph: {
    title: "The Hideout Range | Bristol, TN Precision Rimfire Facility",
    description:
      "Perched at 3,420 FT elevation in Bristol, TN. Discover 18 match stages, extreme vertical shooting angles, and challenging ridge drafts.",
    url: "https://subsonicsociety.com/the-hideout",
    siteName: "Subsonic Society",
    images: [
      {
        url: "https://subsonicsociety.com/assets/subsonic-social-share-clean.jpg",
        width: 1200,
        height: 630,
        alt: "The Hideout Range at 3,420 FT Elevation - Bristol, TN",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Hideout Range | 3,420 FT Topography",
    description:
      "Bristol, Tennessee's premier mountain rimfire complex. Cross-canyon steel to 465 yards.",
    images: ["https://subsonicsociety.com/assets/subsonic-social-share-clean.jpg"],
  },
};

const hideoutSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "@id": "https://subsonicsociety.com/the-hideout#breadcrumb",
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
          "name": "The Hideout",
          "item": "https://subsonicsociety.com/the-hideout"
        }
      ]
    },
    {
      "@type": ["Place", "SportsActivityLocation"],
      "@id": "https://subsonicsociety.com/the-hideout#place",
      "name": "The Hideout Range Complex",
      "description": "High-altitude precision shooting facility in the Appalachian mountains outside Bristol, Tennessee. Features 18 precision rimfire shooting positions, natural boulder barricades, and steel targets out to 465 yards.",
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
      },
      "amenityFeature": [
        {
          "@type": "LocationFeatureSpecification",
          "name": "Target Distance",
          "value": "25 to 465 yards"
        },
        {
          "@type": "LocationFeatureSpecification",
          "name": "Elevation",
          "value": "3,420 Feet MSL"
        },
        {
          "@type": "LocationFeatureSpecification",
          "name": "Course of Fire",
          "value": "18 Natural Terrain & Barricade Stages"
        }
      ]
    }
  ]
};

export default function TheHideoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hideoutSchema) }}
      />
      {children}
    </>
  );
}
