import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Subsonic Society | Media, Match & Sponsor Inquiries",
  description:
    "Get in touch with Subsonic Society headquarters in Bristol, TN. Reach our match directors, technical ballistics lab, media relations, and sponsorship teams.",
  keywords: [
    "Contact Subsonic Society",
    "Bristol TN match director",
    "Precision rimfire sponsorship",
    "Rimfire media credentials",
    "Subsonic Society email",
  ],
  alternates: {
    canonical: "https://subsonicsociety.com/contact",
  },
  openGraph: {
    title: "Contact Subsonic Society | Inquiries & Media Credentials",
    description:
      "Direct line to Subsonic Society match directors, range officers, and commercial sponsorship leads.",
    url: "https://subsonicsociety.com/contact",
    siteName: "Subsonic Society",
    images: [
      {
        url: "/assets/subsonic-social-share-clean.jpg?v=3",
        width: 1200,
        height: 630,
        alt: "Contact Subsonic Society",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Subsonic Society | Range Inquiries",
    description: "Reach the Subsonic Society team for match, media, and sponsor support.",
    images: ["/assets/subsonic-social-share-clean.jpg?v=3"],
  },
};

const contactSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "@id": "https://subsonicsociety.com/contact#breadcrumb",
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
          "name": "Contact",
          "item": "https://subsonicsociety.com/contact"
        }
      ]
    },
    {
      "@type": "ContactPage",
      "@id": "https://subsonicsociety.com/contact#page",
      "name": "Subsonic Society Official Contact Portal",
      "description": "Direct communication channel for competitors, media credentials, range coordination, and sponsor partnerships.",
      "mainEntity": {
        "@type": "SportsOrganization",
        "name": "Subsonic Society",
        "url": "https://subsonicsociety.com",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Bristol",
          "addressRegion": "TN",
          "postalCode": "37620",
          "addressCountry": "US"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "Match Inquiries & Technical Support",
          "email": "hq@subsonicsociety.com",
          "availableLanguage": ["English"]
        }
      }
    }
  ]
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />
      {children}
    </>
  );
}
