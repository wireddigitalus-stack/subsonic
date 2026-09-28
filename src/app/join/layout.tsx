import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Membership By Invitation Only | The Subsonic Society",
  description:
    "Subsonic Society membership and private squad comms are strictly by invitation only. Log in with the invitation credentials sent to you, or enter your invite code to activate your profile.",
  keywords: [
    "Subsonic Society Invitation",
    "Invitation Only Membership",
    "Precision rifle membership",
    "Subsonic credentials",
    "Private chat room access",
  ],
  alternates: {
    canonical: "https://subsonicsociety.com/join",
  },
  openGraph: {
    title: "Membership By Invitation Only | The Subsonic Society",
    description:
      "Membership and private comms are by invitation only. Log in with your credentials or claim your invitation code.",
    url: "https://subsonicsociety.com/join",
    siteName: "Subsonic Society",
    images: [
      {
        url: "/assets/subsonic-social-share-clean.jpg?v=3",
        width: 1200,
        height: 630,
        alt: "Subsonic Society - Membership By Invitation Only",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Membership By Invitation Only | The Subsonic Society",
    description: "Log in with your invitation credentials or enter your invite code.",
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
