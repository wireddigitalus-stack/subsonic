import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Watch 4K Bullet Trace & Phantom High-Speed Video | Subsonic Society",
  description:
    "Stream 4K ultra-slow-motion bullet trace at 1,000 FPS captured with Phantom high-speed cameras. Witness subsonic .22LR aerodynamics, vortex wakes, and steel impacts at 300+ yards.",
  keywords: [
    "22LR bullet trace video",
    "Phantom high speed camera rimfire",
    "1000 FPS bullet trace",
    "Subsonic aerodynamic wake",
    "Rimfire slow motion impact",
    "Subsonic Society video",
  ],
  alternates: {
    canonical: "https://subsonicsociety.com/watch",
  },
  openGraph: {
    title: "Watch 4K Bullet Trace & High-Speed Media | Subsonic Society",
    description:
      "Witness transonic stability, helical precession, and steel impacts in crystal-clear slow motion.",
    url: "https://subsonicsociety.com/watch",
    siteName: "Subsonic Society",
    images: [
      {
        url: "/assets/subsonic-social-share-clean.jpg?v=3",
        width: 1200,
        height: 630,
        alt: "Subsonic Society 4K High-Speed Media",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Watch High-Speed Bullet Trace | Subsonic Society",
    description: "1,000 FPS Phantom footage revealing rimfire aerodynamics in flight.",
    images: ["/assets/subsonic-social-share-clean.jpg?v=3"],
  },
};

const watchSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "@id": "https://subsonicsociety.com/watch#breadcrumb",
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
          "name": "Watch",
          "item": "https://subsonicsociety.com/watch"
        }
      ]
    },
    {
      "@type": "VideoObject",
      "@id": "https://subsonicsociety.com/watch#phantom-trace",
      "name": "Ultra-Slow-Motion .22LR Subsonic Bullet Trace at 1,000 FPS",
      "description": "High-speed optical schlieren and Phantom capture tracking a 40-grain Lapua Center-X projectile at 1,075 FPS navigating 12 MPH mountain crosswinds at The Hideout.",
      "thumbnailUrl": "https://subsonicsociety.com/assets/subsonic-social-share-clean.jpg",
      "uploadDate": "2026-02-01T12:00:00-05:00",
      "publisher": {
        "@type": "SportsOrganization",
        "name": "Subsonic Society",
        "logo": {
          "@type": "ImageObject",
          "url": "https://subsonicsociety.com/assets/subsonic-banner-wide.png"
        }
      }
    }
  ]
};

export default function WatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(watchSchema) }}
      />
      {children}
    </>
  );
}
