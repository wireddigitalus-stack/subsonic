import type { Metadata } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null) ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://subsonic-omega.vercel.app");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "2026 Subsonic Society Invitational — Pro Shooter VIP Invitation",
  description:
    "Presented by Modacam Custom Rifles • $7,500+ Money Match at The Hideout (Bristol, TN). Tap to claim your Pro Shooter Spotlight Profile & Chat Room access (Code: SS-PRO-ZKHZ).",
  keywords: [
    "Subsonic Society Invitational",
    "Pro Shooter VIP Invitation",
    "Modacam Custom Rifles",
    "The Hideout Bristol TN",
    "SS-PRO-ZKHZ",
  ],
  alternates: {
    canonical: "/invite",
  },
  openGraph: {
    title: "2026 Subsonic Society Invitational — Pro Shooter VIP Invitation",
    description:
      "Presented by Modacam Custom Rifles • $7,500+ Money Match at The Hideout (Bristol, TN). Tap to claim your Pro Shooter Spotlight Profile & Chat Room access (Code: SS-PRO-ZKHZ).",
    url: `${siteUrl}/invite/pro?code=SS-PRO-ZKHZ`,
    siteName: "Subsonic Society",
    images: [
      {
        url: `${siteUrl}/assets/subsonic-pro-zkhz-social-share.jpg?v=2`,
        secureUrl: `${siteUrl}/assets/subsonic-pro-zkhz-social-share.jpg?v=2`,
        width: 1376,
        height: 768,
        type: "image/jpeg",
        alt: "2026 Subsonic Society Invitational — Pro Shooter VIP Invitation (Code: SS-PRO-ZKHZ)",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "2026 Subsonic Society Invitational — Pro Shooter VIP Invitation",
    description:
      "Presented by Modacam Custom Rifles • $7,500+ Money Match at The Hideout (Bristol, TN). Tap to claim your Pro Shooter Spotlight Profile & Chat Room access (Code: SS-PRO-ZKHZ).",
    images: [`${siteUrl}/assets/subsonic-pro-zkhz-social-share.jpg?v=2`],
  },
};

export default function InviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
