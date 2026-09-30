import type { Metadata } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null) ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://subsonic-omega.vercel.app");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Competition Pro VIP Invitation & Profile Setup | Subsonic Society",
  description:
    "Exclusive invitation portal for precision rimfire competitors. Enter your VIP key, configure your rifle blueprint, upload match photos, and generate your public marksman profile.",
  keywords: [
    "Subsonic Society Pro VIP",
    "Competition Shooter Profile",
    "VIP Invitation Setup",
    "Precision Rimfire Blueprint",
  ],
  alternates: {
    canonical: "/invite/pro",
  },
  openGraph: {
    title: "Competition Pro VIP Invitation & Profile Setup | Subsonic Society",
    description:
      "Exclusive invitation portal for precision rimfire competitors. Activate your VIP profile, rifle blueprint, and shooter dossier.",
    url: "/invite/pro",
    siteName: "Subsonic Society",
    images: [
      {
        url: "/assets/subsonic-invite-social-share.jpg?v=4",
        width: 1280,
        height: 720,
        alt: "Subsonic Society Pro VIP Invitation & Profile Setup",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Competition Pro VIP Invitation & Profile Setup | Subsonic Society",
    description: "Activate your VIP marksman dossier, rifle blueprint, and squad comms.",
    images: ["/assets/subsonic-invite-social-share.jpg?v=4"],
  },
};

export default function InviteProLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
