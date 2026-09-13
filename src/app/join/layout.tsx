import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join The Society | Official Marksman Membership & Credentials",
  description:
    "Apply for free Subsonic Society membership. Unlock verified shooter credentials, early match registration windows, ballistics lab data drops, and exclusive community comms.",
  keywords: [
    "Join Subsonic Society",
    "Rimfire shooter membership",
    "Precision rifle membership",
    "Subsonic credentials",
    "Free shooting membership",
  ],
  alternates: {
    canonical: "https://subsonicsociety.com/join",
  },
  openGraph: {
    title: "Join The Society | Official Marksman Credentials",
    description:
      "Claim your callsign and member ID. Access priority match registration and private ballistic data drops.",
    url: "https://subsonicsociety.com/join",
    siteName: "Subsonic Society",
    images: [
      {
        url: "/assets/subsonic-social-share-clean.jpg?v=3",
        width: 1200,
        height: 630,
        alt: "Join Subsonic Society",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Join Subsonic Society | Marksman Membership",
    description: "Get verified shooter credentials and early match slot access.",
    images: ["/assets/subsonic-social-share-clean.jpg?v=3"],
  },
};

const joinSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "@id": "https://subsonicsociety.com/join#breadcrumb",
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
          "name": "Join",
          "item": "https://subsonicsociety.com/join"
        }
      ]
    },
    {
      "@type": "WebPage",
      "@id": "https://subsonicsociety.com/join#page",
      "name": "Subsonic Society Member Onboarding",
      "description": "Onboarding portal for precision rimfire marksmen to generate digital society credentials and secure early match registration."
    }
  ]
};

export default function JoinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(joinSchema) }}
      />
      {children}
    </>
  );
}
