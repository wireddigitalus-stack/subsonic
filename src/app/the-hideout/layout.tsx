import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Hideout | Invitational Home (Bristol, TN)",
  description:
    "The Hideout is the private range of the Hurley family, sitting on approximately 220 acres near the Tennessee-Virginia line in Bristol, Tennessee.",
  keywords: [
    "The Hideout Bristol TN",
    "Subsonic Society Invitational",
    "Bristol TN rimfire invitational",
    "Subsonic Society",
  ],
  alternates: {
    canonical: "https://subsonicsociety.com/the-hideout",
  },
  openGraph: {
    title: "The Hideout | Your Invitational Home (Bristol, TN)",
    description:
      "The Hideout is the private range of the Hurley family on approximately 220 acres in Bristol, Tennessee.",
    url: "https://subsonicsociety.com/the-hideout",
    siteName: "Subsonic Society",
    images: [
      {
        url: "/assets/subsonic-social-share-clean.jpg?v=4",
        width: 1200,
        height: 630,
        alt: "The Hideout - Bristol, TN",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Hideout | Your Invitational Home",
    description:
      "Private 220-acre setting in Bristol, Tennessee hosting the Subsonic Society Invitational.",
    images: ["/assets/subsonic-social-share-clean.jpg?v=4"],
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
      "@type": "Place",
      "@id": "https://subsonicsociety.com/the-hideout#place",
      "name": "The Hideout",
      "description": "Private property of the Hurley family on approximately 220 acres in Bristol, Tennessee, hosting the Subsonic Society Invitational.",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Bristol",
        "addressRegion": "TN",
        "postalCode": "37620",
        "addressCountry": "US"
      }
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
