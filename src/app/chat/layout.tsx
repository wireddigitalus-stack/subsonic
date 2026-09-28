import type { Metadata } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null) ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://subsonic-omega.vercel.app");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Tactical Comms Network & Firing Line Intel | Subsonic Society",
  description:
    "Real-time shooter comms network for Subsonic Society competitors. Live match updates, 340yd DOPE drops, ridge wind conditions, and squad coordination in Bristol, TN.",
  keywords: [
    "Precision rimfire forum",
    "Subsonic Society comms",
    "Rimfire chat network",
    "Firing line intel",
    "DOPE cards",
    "Bristol TN shooting competition",
  ],
  alternates: {
    canonical: "/chat",
  },
  openGraph: {
    title: "Tactical Comms Network & Firing Line Intel | Subsonic Society",
    description:
      "Encrypted squad comms, verified 340-yd DOPE drops, ridge weather telemetry from The Hideout, and real-time precision rimfire debriefs.",
    url: "/chat",
    siteName: "Subsonic Society",
    images: [
      {
        url: "/assets/subsonic-chat-social-share.jpg",
        width: 1280,
        height: 720,
        alt: "Subsonic Society Tactical Comms Network & Live Squad Chat",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tactical Comms Network | Subsonic Society",
    description: "Live marksman communications, verified DOPE cards, and firing line intel.",
    images: ["/assets/subsonic-chat-social-share.jpg"],
  },
};

const chatSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "@id": "https://subsonicsociety.com/chat#breadcrumb",
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
          "name": "Comms Network",
          "item": "https://subsonicsociety.com/chat"
        }
      ]
    },
    {
      "@type": "WebPage",
      "@id": "https://subsonicsociety.com/chat#page",
      "name": "Subsonic Society Comms Network",
      "description": "Community messaging and situational intel platform for Subsonic Society competitors."
    }
  ]
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(chatSchema) }}
      />
      {children}
    </>
  );
}
