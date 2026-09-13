import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subsonic DNA | .22LR Ballistics Lab, Lot Testing & Tuner Benchmarks",
  description:
    "Empirical rimfire ballistics testing lab. Chronograph lot analysis (Lapua Center-X, Midas+, Eley Tenex), harmonic tuner benchmarks, and mountain DOPE tables at 3,420 FT elevation.",
  keywords: [
    "22LR lot testing",
    "Lapua Center-X chronograph data",
    "Lapua Midas+ standard deviation",
    "22LR harmonic tuner testing",
    "Rimfire ballistics lab",
    "Subsonic Society DNA",
    "Extreme spread rimfire ammo",
    "300 yard 22LR DOPE table",
    "Harrell tuner 22LR test",
  ],
  alternates: {
    canonical: "https://subsonicsociety.com/dna",
  },
  openGraph: {
    title: "Subsonic DNA | Empirical .22LR Ballistics Testing Lab",
    description:
      "Lab-grade rimfire testing: Lapua lot testing, harmonic barrel tuner analysis, and high-altitude ballistic trajectory tables.",
    url: "https://subsonicsociety.com/dna",
    siteName: "Subsonic Society",
    images: [
      {
        url: "/assets/subsonic-social-share-clean.jpg?v=3",
        width: 1200,
        height: 630,
        alt: "Subsonic DNA Precision Ballistics Lab",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Subsonic DNA | .22LR Ballistics & Tuner Lab",
    description:
      "Empirical chronograph data, SD/ES lot testing, harmonic tuner dispersion matrices.",
    images: ["/assets/subsonic-social-share-clean.jpg?v=3"],
  },
};

const dnaSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "@id": "https://subsonicsociety.com/dna#breadcrumb",
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
          "name": "DNA Lab",
          "item": "https://subsonicsociety.com/dna"
        }
      ]
    },
    {
      "@type": "TechArticle",
      "@id": "https://subsonicsociety.com/dna#ballistics-study",
      "headline": "Empirical .22LR Subsonic Ballistics: Chronograph Lot Testing and Harmonic Tuner Benchmarks",
      "description": "Comprehensive ballistics testing dataset analyzing Lapua Center-X, Lapua Midas+, and Eley Tenex lots under high-country Appalachian conditions (3,420 FT elevation).",
      "image": "https://subsonicsociety.com/assets/subsonic-social-share-clean.jpg",
      "author": {
        "@type": "SportsOrganization",
        "name": "Subsonic Society Ballistics Division",
        "url": "https://subsonicsociety.com"
      },
      "publisher": {
        "@type": "SportsOrganization",
        "name": "Subsonic Society",
        "logo": {
          "@type": "ImageObject",
          "url": "https://subsonicsociety.com/assets/subsonic-banner-wide.png"
        }
      },
      "datePublished": "2026-01-15T00:00:00-05:00",
      "dateModified": "2026-09-13T00:00:00-04:00"
    },
    {
      "@type": "Dataset",
      "@id": "https://subsonicsociety.com/dna#dataset",
      "name": "Subsonic Society 2026 Precision Rimfire Ammunition Lot Database",
      "description": "Lab chronograph datasets measuring muzzle velocity, standard deviation (SD), extreme spread (ES), and 100-yard dispersion for match-grade .22LR rimfire lots.",
      "keywords": [
        "22LR ammunition test",
        "Lapua Center-X lot testing",
        "Lapua Midas+",
        "Eley Tenex",
        "Rimfire chronograph SD ES",
        "Harmonic tuner benchmark"
      ],
      "creator": {
        "@type": "SportsOrganization",
        "name": "Subsonic Society"
      },
      "distribution": {
        "@type": "DataDownload",
        "encodingFormat": "text/markdown",
        "contentUrl": "https://subsonicsociety.com/llms-full.txt"
      },
      "measurementTechnique": "Garmin Xero C1 Pro Radar & LabRadar Doppler chronographs across 50-shot strings at 3,420 FT elevation."
    }
  ]
};

export default function DnaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dnaSchema) }}
      />
      {children}
    </>
  );
}
