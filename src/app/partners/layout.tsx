import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Title Sponsor: Modacam Custom Rifles | Subsonic Society",
  description:
    "Modacam Custom Rifles is the premier title sponsor of the Subsonic Society Invitational $7,500 Cash Purse. Hand-crafted precision rimfire rifles built by master gunsmith Jonathan Elrod.",
  keywords: [
    "Modacam Custom Rifles",
    "Jonathan Elrod gunsmith",
    "Subsonic Society title sponsor",
    "Precision rimfire rifles",
    "MCR Rifles",
    "Bristol TN precision rimfire",
  ],
  alternates: {
    canonical: "https://subsonicsociety.com/partners",
  },
  openGraph: {
    title: "Title Sponsor: Modacam Custom Rifles | Subsonic Society",
    description:
      "Precision Rimfire Redefined. Modacam Custom Rifles is the presenting partner for the Subsonic Society Invitational $7,500 Cash Purse.",
    url: "https://subsonicsociety.com/partners",
    siteName: "Subsonic Society",
    images: [
      {
        url: "/assets/subsonic-social-share-clean.jpg?v=4",
        width: 1200,
        height: 630,
        alt: "Modacam Custom Rifles - Subsonic Society Title Sponsor",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Title Sponsor: Modacam Custom Rifles | Subsonic Society",
    description:
      "Precision Rimfire Redefined. Featuring Title Sponsor Modacam Custom Rifles.",
    images: ["/assets/subsonic-social-share-clean.jpg?v=4"],
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
      "description": "Title Sponsor of Subsonic Society Invitational and master builder of custom match-grade precision rimfire and centerfire rifles.",
      "url": "https://mcr-rifles.com"
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
