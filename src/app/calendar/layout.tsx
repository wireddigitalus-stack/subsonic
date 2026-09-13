import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "2026 Match Calendar & Schedule | Subsonic Society",
  description:
    "Complete 2026 precision rimfire match dates, open zeroing sessions, and training clinics at The Hideout (Bristol, TN) and partner ranges.",
  keywords: [
    "Rimfire match calendar 2026",
    "Precision rifle schedule Tennessee",
    "Subsonic Society events",
    "Bristol TN shooting calendar",
    "PRS Rimfire dates 2026",
  ],
  alternates: {
    canonical: "https://subsonicsociety.com/calendar",
  },
  openGraph: {
    title: "2026 Precision Rimfire Calendar | Subsonic Society",
    description:
      "Sync upcoming match dates, training clinics, and zero days directly with your mobile calendar.",
    url: "https://subsonicsociety.com/calendar",
    siteName: "Subsonic Society",
    images: [
      {
        url: "/assets/subsonic-social-share-clean.jpg?v=3",
        width: 1200,
        height: 630,
        alt: "Subsonic Society 2026 Calendar",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "2026 Rimfire Calendar | Subsonic Society",
    description: "Full season competition schedule at The Hideout in Bristol, TN.",
    images: ["/assets/subsonic-social-share-clean.jpg?v=3"],
  },
};

const calendarSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "@id": "https://subsonicsociety.com/calendar#breadcrumb",
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
          "name": "Calendar",
          "item": "https://subsonicsociety.com/calendar"
        }
      ]
    }
  ]
};

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calendarSchema) }}
      />
      {children}
    </>
  );
}
