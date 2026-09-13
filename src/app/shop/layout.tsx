import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Society Armory & Gear | Subsonic Society Official Store",
  description:
    "Official Subsonic Society merchandise: Solid brass commemorative challenge coins, precision range wear, carbon DOPE armbands, and match accessories.",
  keywords: [
    "Subsonic Society coin",
    "Precision rimfire apparel",
    "Rimfire match accessories",
    "DOPE armband 22lr",
    "Shooting challenge coin",
  ],
  alternates: {
    canonical: "https://subsonicsociety.com/shop",
  },
  openGraph: {
    title: "Society Armory & Gear | Subsonic Society Official Store",
    description:
      "Engineered for the range. Official challenge coins, competition apparel, and shooting support accessories.",
    url: "https://subsonicsociety.com/shop",
    siteName: "Subsonic Society",
    images: [
      {
        url: "https://subsonicsociety.com/assets/subsonic-coin.jpg",
        width: 600,
        height: 600,
        alt: "Subsonic Society Official Challenge Coin",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Society Armory | Official Gear",
    description: "Official challenge coins, competition apparel, and match gear.",
    images: ["https://subsonicsociety.com/assets/subsonic-coin.jpg"],
  },
};

const shopSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "@id": "https://subsonicsociety.com/shop#breadcrumb",
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
          "name": "Shop",
          "item": "https://subsonicsociety.com/shop"
        }
      ]
    },
    {
      "@type": "Store",
      "@id": "https://subsonicsociety.com/shop#store",
      "name": "Subsonic Society Armory",
      "description": "Official outfitter of the Subsonic Society precision rimfire community.",
      "url": "https://subsonicsociety.com/shop"
    }
  ]
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(shopSchema) }}
      />
      {children}
    </>
  );
}
