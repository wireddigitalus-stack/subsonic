import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Official Industry Partners & Sponsors | Subsonic Society",
  description:
    "Meet the industry partners powering Subsonic Society. Featuring Title Sponsor Modacam Custom Rifles, alongside Lapua, Vortex Optics, Vudoo Gun Works, and MDT.",
  keywords: [
    "Modacam Custom Rifles",
    "Subsonic Society sponsors",
    "Precision rimfire partners",
    "Lapua rimfire sponsor",
    "Vortex Optics rimfire",
    "Vudoo Gun Works",
    "MDT chassis rimfire",
  ],
  alternates: {
    canonical: "https://subsonicsociety.com/partners",
  },
  openGraph: {
    title: "Official Industry Partners & Sponsors | Subsonic Society",
    description:
      "Engineered excellence. Discover the brands partnering with Subsonic Society to advance precision rimfire competition.",
    url: "https://subsonicsociety.com/partners",
    siteName: "Subsonic Society",
    images: [
      {
        url: "/assets/subsonic-social-share-clean.jpg?v=3",
        width: 1200,
        height: 630,
        alt: "Subsonic Society Industry Partners",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Industry Partners | Subsonic Society",
    description:
      "Featuring Title Sponsor Modacam Custom Rifles, Lapua, Vortex Optics, Vudoo Gun Works, and MDT.",
    images: ["/assets/subsonic-social-share-clean.jpg?v=3"],
  },
};

const partnersSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "@id": "https://subsonicsociety.com/partners#breadcrumb",
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
          "name": "Partners",
          "item": "https://subsonicsociety.com/partners"
        }
      ]
    },
    {
      "@type": "Organization",
      "@id": "https://subsonicsociety.com/partners#modacam",
      "name": "Modacam Custom Rifles",
      "description": "Title Sponsor of the Subsonic Society Invitational and master builder of custom match-grade precision rimfire and centerfire rifles.",
      "url": "https://modacamrifles.com"
    },
    {
      "@type": "Organization",
      "@id": "https://subsonicsociety.com/partners#lapua",
      "name": "Lapua",
      "description": "World-championship rimfire ammunition manufacturer, producing Center-X, Midas+, and Super X-Act .22LR cartridges.",
      "url": "https://www.lapua.com"
    }
  ]
};

export default function PartnersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(partnersSchema) }}
      />
      {children}
    </>
  );
}
