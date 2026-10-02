import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Precision Rimfire Competitors & Athlete Blueprints | Subsonic Society",
  description:
    "Explore elite rimfire marksmen profiles, match gear breakdowns, rifle builds (Modacam, Vudoo, RimX), and competitive rankings across Open, Production, and Senior divisions.",
  keywords: [
    "Precision rimfire shooters",
    "PRS Rimfire athlete profiles",
    "Erich Leipold rimfire",
    "Ron Verran precision rimfire",
    "Allen Hurley Subsonic Society",
    "Rimfire rifle builds",
    "Modacam rifle build",
    "Zermatt RimX Open Division",
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
        url: "/assets/subsonic-social-share-clean.jpg?v=4",
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
    images: ["/assets/subsonic-social-share-clean.jpg?v=4"],
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
      "@id": "https://subsonicsociety.com/shooters#erich-leipold",
      "name": "Erich Leipold",
      "jobTitle": "Team USA 🇺🇸 • Rimfire Challenge World Champion",
      "affiliation": {
        "@type": "SportsOrganization",
        "name": "Subsonic Society"
      },
      "description": "Rimfire Challenge World Champion and Team USA marksman. Zermatt RimX, Bartlein MTU 22-inch, Vortex Razor HD Gen III 6-36x56, Lapua Midas+.",
      "award": "Rimfire Challenge World Champion"
    },
    {
      "@type": "Person",
      "@id": "https://subsonicsociety.com/shooters#ron-verran",
      "name": "Ron Verran",
      "jobTitle": "Team USA 🇺🇸 • 2x PRS National Champion",
      "affiliation": {
        "@type": "SportsOrganization",
        "name": "Subsonic Society"
      },
      "description": "2x PRS National Champion and Great Lakes Series Champion. Zermatt RimX, Bartlein MTU 22-inch, MPA Matrix Pro, Lapua Center-X.",
      "award": "2x PRS National Champion"
    },
    {
      "@type": "Person",
      "@id": "https://subsonicsociety.com/shooters#allen-hurley",
      "name": "Allen Hurley",
      "jobTitle": "Founder & Executive Match Host • Subsonic Society",
      "affiliation": {
        "@type": "SportsOrganization",
        "name": "Subsonic Society"
      },
      "description": "Founder of The Hideout in Bristol, TN. Modacam Custom Precision V-22, Zero Compromise Optic ZC527, MDT ACC Elite."
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
