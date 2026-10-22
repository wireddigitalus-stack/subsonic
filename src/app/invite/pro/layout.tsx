import type { Metadata } from "next";

const siteUrl = "https://subsonic-omega.vercel.app";
const ogImageUrl = `${siteUrl}/assets/subsonic-pro-zkhz-social-share.jpg?v=3`;

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
    "Precision Rimfire Competitor",
  ],
  alternates: {
    canonical: `${siteUrl}/invite/pro`,
  },
  openGraph: {
    title: "2026 Subsonic Society Invitational — Pro Shooter VIP Invitation",
    description:
      "Presented by Modacam Custom Rifles • $7,500+ Money Match at The Hideout (Bristol, TN). Tap to claim your Pro Shooter Spotlight Profile & Chat Room access (Code: SS-PRO-ZKHZ).",
    url: `${siteUrl}/invite/pro`,
    siteName: "Subsonic Society",
    images: [
      {
        url: ogImageUrl,
        secureUrl: ogImageUrl,
        width: 1200,
        height: 630,
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
    images: [ogImageUrl],
  },
};

export default function InviteProLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
