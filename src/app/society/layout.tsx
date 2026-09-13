import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Society Manifesto & 4 Pillars | Subsonic Society",
  description:
    "The Subsonic Society manifesto: Precision Is In Our DNA. Discover our 4 foundational pillars—Sanctioned Competition, Empirical Ballistics Testing, Marksmanship Education, and Marksman Fraternity.",
  keywords: [
    "Subsonic Society manifesto",
    "Precision rimfire culture",
    "Rimfire shooting pillars",
    "Marksman fraternity",
    "Subsonic ballistics standards",
    "Precision rifle community",
  ],
  alternates: {
    canonical: "https://subsonicsociety.com/society",
  },
  openGraph: {
    title: "The Subsonic Society Manifesto | Precision Is In Our DNA",
    description:
      "We exist to push the mechanical and human frontiers of .22LR rimfire marksmanship through data, discipline, and fellowship.",
    url: "https://subsonicsociety.com/society",
    siteName: "Subsonic Society",
    images: [
      {
        url: "/assets/subsonic-social-share-clean.jpg?v=3",
        width: 1200,
        height: 630,
        alt: "Subsonic Society Manifesto & 4 Pillars",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Society Manifesto | Subsonic Society",
    description:
      "Precision Is In Our DNA. Discover our 4 foundational pillars and marksman creed.",
    images: ["/assets/subsonic-social-share-clean.jpg?v=3"],
  },
};

const societySchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "@id": "https://subsonicsociety.com/society#breadcrumb",
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
          "name": "Society Manifesto",
          "item": "https://subsonicsociety.com/society"
        }
      ]
    },
    {
      "@type": "AboutPage",
      "@id": "https://subsonicsociety.com/society#about",
      "name": "Subsonic Society Manifesto & Foundational Pillars",
      "description": "Subsonic Society was forged to elevate precision rimfire shooting into a premier American marksman discipline through competition, empirical testing, education, and fraternity.",
      "mainEntity": {
        "@type": "SportsOrganization",
        "name": "Subsonic Society",
        "url": "https://subsonicsociety.com",
        "slogan": "Precision Is In Our DNA",
        "knowsAbout": [
          "Precision Rimfire (.22LR)",
          "Empirical Ballistics Testing",
          "Harmonic Barrel Tuner Technology",
          "Long-Range Rimfire Marksmanship",
          "Match Sanctioning and Safety"
        ]
      }
    }
  ]
};

export default function SocietyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(societySchema) }}
      />
      {children}
    </>
  );
}
