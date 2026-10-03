import type { Metadata } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null) ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://subsonic-omega.vercel.app");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Claim Invitation & Profile Setup | Subsonic Society",
  description:
    "Membership by invitation only. Enter your serialized invitation key to claim your tactical callsign, set your 4-digit access PIN, and activate your verified marksman profile and Chat Room access.",
  keywords: [
    "Subsonic Society Invitation",
    "Invitation Code Redeem",
    "Marksman Profile Setup",
    "Precision Rimfire Credentials",
    "Private Squad Net Chat Room",
  ],
  alternates: {
    canonical: "/invite",
  },
  openGraph: {
    title: "Claim Your Invitation & Activate Marksman Profile | Subsonic Society",
    description:
      "Membership by invitation only. Redeem your invitation key to unlock verified shooter credentials, private Chat Room, and match registration access.",
    url: "/invite",
    siteName: "Subsonic Society",
    images: [
      {
        url: "/assets/subsonic-invite-social-share.jpg?v=5",
        width: 1280,
        height: 720,
        alt: "Subsonic Society - Membership By Invitation Only - Claim & Activate Profile",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Claim Your Invitation & Activate Marksman Profile | Subsonic Society",
    description:
      "Membership by invitation only. Redeem your invitation key to unlock verified shooter credentials and private squad comms.",
    images: ["/assets/subsonic-invite-social-share.jpg?v=5"],
  },
};

export default function InviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
