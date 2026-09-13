import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tactical Comms Network & Firing Line Intel | Subsonic Society",
  description:
    "Real-time shooter comms network for Subsonic Society members. Live match updates, ridge wind conditions, stage debriefs, and precision rifle gear talk.",
  keywords: [
    "Precision rimfire forum",
    "Subsonic Society comms",
    "Rimfire chat network",
    "Firing line intel",
    "Match debriefs 22LR",
  ],
  alternates: {
    canonical: "https://subsonicsociety.com/chat",
  },
  openGraph: {
    title: "Tactical Comms Network | Subsonic Society",
    description:
      "Encrypted firing line intel, weather updates from The Hideout, and real-time competitor discussion.",
    url: "https://subsonicsociety.com/chat",
    siteName: "Subsonic Society",
    images: [
      {
        url: "https://subsonicsociety.com/assets/subsonic-social-share-clean.jpg",
        width: 1200,
        height: 630,
        alt: "Subsonic Society Tactical Comms Network",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tactical Comms Network | Subsonic Society",
    description: "Live marksman communications and firing line intel.",
    images: ["https://subsonicsociety.com/assets/subsonic-social-share-clean.jpg"],
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
