import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Precision Rimfire Competitors & Athlete Blueprints | Subsonic Society",
  description:
    "Explore elite rimfire marksmen profiles, match gear breakdowns, rifle builds (Modacam, Vudoo, RimX), and competitive rankings across Open, Production, and Senior divisions.",
  keywords: [
    "Precision rimfire shooters",
    "PRS Rimfire athlete profiles",
    "Wyatt Sterling rimfire",
    "Kendra Cross precision rimfire",
    "Eli McAllister 22LR",
    "Rimfire rifle builds",
    "Modacam rifle build",
    "Vudoo V-22 Open Division",
  ],
  alternates: {
    canonical: "https://subsonicsociety.com/shooters",
  },
  openGraph: {
    title: "Precision Rimfire Competitors & Rifle Blueprints | Subsonic Society",
    description:
      "Roster of verified precision rimfire marksmen, match statistics, and complete technical breakdowns of winning rifle setups.",
    url: "https://subsonicsociety.com/shooters",
    siteName: "Subsonic Society",
    images: [
      {
        url: "https://subsonicsociety.com/assets/subsonic-social-share-clean.jpg",
        width: 1200,
        height: 630,
        alt: "Subsonic Society Precision Rimfire Competitors",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Precision Rimfire Competitors | Subsonic Society",
    description:
      "Athlete profiles, championship standings, and rifle build specifications.",
    images: ["https://subsonicsociety.com/assets/subsonic-social-share-clean.jpg"],
  },
};

const shootersSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "@id": "https://subsonicsociety.com/shooters#breadcrumb",
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
          "name": "Shooters",
          "item": "https://subsonicsociety.com/shooters"
        }
      ]
    },
    {
      "@type": "Person",
      "@id": "https://subsonicsociety.com/shooters#wyatt-sterling",
      "name": "Wyatt Sterling",
      "jobTitle": "Precision Rimfire Marksman & Pro Division Athlete",
      "affiliation": {
        "@type": "SportsOrganization",
        "name": "Subsonic Society"
      },
      "description": "Rank #1 2025 Subsonic Invitational Champion. Modacam Custom RimX, Proof Carbon 20-inch, Vortex Razor HD Gen III 6-36x56, Lapua Center-X.",
      "award": "2025 Subsonic Invitational Champion"
    },
    {
      "@type": "Person",
      "@id": "https://subsonicsociety.com/shooters#kendra-cross",
      "name": "Kendra Cross",
      "jobTitle": "National Rimfire Competitor & Ladies Division Champion",
      "affiliation": {
        "@type": "SportsOrganization",
        "name": "Subsonic Society"
      },
      "description": "Top-ranked precision rimfire athlete known for stage speed and barricade transitions. Vudoo V-22, Foundation Centurion stock, Kahles K525i DLR, Lapua Midas+.",
      "award": "High Lady 2025 Mountain Shootout"
    },
    {
      "@type": "Person",
      "@id": "https://subsonicsociety.com/shooters#eli-mcallister",
      "name": "Eli McAllister",
      "jobTitle": "Subsonic Society Ballistics Fellow & Production Division Lead",
      "affiliation": {
        "@type": "SportsOrganization",
        "name": "Subsonic Society"
      },
      "description": "CZ 457 MTR specialist with 99.4% stage hit consistency inside 150 yards. Subsonic DNA lab tester and DOPE verification lead."
    }
  ]
};

export default function ShootersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(shootersSchema) }}
      />
      {children}
    </>
  );
}
