import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Match Registration & Squad Sign-Up | Subsonic Society",
  description:
    "Register for upcoming 2026 precision rimfire competitions. Secure your squad slot for the $7,500 Subsonic Society Invitational and regional rimfire matches.",
  keywords: [
    "Precision rimfire match registration",
    "Subsonic Society registration",
    "Bristol TN match sign up",
    "Rimfire squad selection",
    "Subsonic Invitational entry",
  ],
  alternates: {
    canonical: "https://subsonicsociety.com/register",
  },
  openGraph: {
    title: "Match Registration & Squad Sign-Up | Subsonic Society",
    description:
      "Lock in your spot on the firing line. Secure registration for the Subsonic Society Invitational.",
    url: "https://subsonicsociety.com/register",
    siteName: "Subsonic Society",
    images: [
      {
        url: "/assets/subsonic-social-share-clean.jpg?v=3",
        width: 1200,
        height: 630,
        alt: "Subsonic Society Match Registration",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Match Registration | Subsonic Society",
    description: "Register for the Subsonic Society Invitational and regional rimfire matches.",
    images: ["/assets/subsonic-social-share-clean.jpg?v=3"],
  },
};

const registerSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "@id": "https://subsonicsociety.com/register#breadcrumb",
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
          "name": "Register",
          "item": "https://subsonicsociety.com/register"
        }
      ]
    },
    {
      "@type": "WebPage",
      "@id": "https://subsonicsociety.com/register#page",
      "name": "Subsonic Society Match Registration Portal",
      "description": "Registration interface for marksmen competing in Subsonic Society matches at The Hideout in Bristol, TN."
    }
  ]
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(registerSchema) }}
      />
      {children}
    </>
  );
}
