import React from "react";
import { Metadata } from "next";
import { getShooterBySlug } from "@/lib/shooters";
import { ShooterProfileClient } from "@/components/shooters/ShooterProfileClient";

interface PageProps {
  params: {
    slug: string;
  };
}

// Generate dynamic metadata for maximum SEO & AI SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const shooter = getShooterBySlug(params.slug);

  if (!shooter) {
    const formattedName = params.slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    return {
      title: `${formattedName} — Pro Marksman Profile | Subsonic Society`,
      description: `Official Subsonic Society Pro Competitor Profile dossier for ${formattedName}. Precision rimfire optics, action specs, and match accolades.`,
      openGraph: {
        title: `${formattedName} — Pro Marksman Profile | Subsonic Society`,
        description: `Official Subsonic Society Pro Competitor Profile dossier for ${formattedName}. Precision rimfire optics, action specs, and match accolades.`,
        images: [
          {
            url: "https://subsonic-omega.vercel.app/assets/subsonic-invite-social-share.jpg",
            width: 1200,
            height: 630,
            alt: `${formattedName} Profile`,
          },
        ],
      },
    };
  }

  const pageTitle = `${shooter.name} (${shooter.callsign}) — Pro Marksman Profile | Subsonic Society`;
  const pageDesc = `${shooter.name} [${shooter.callsign}] is a ${shooter.division} competitor with ${shooter.podiums} career podiums. Rifle rig: ${shooter.rifleSetup.action}, ${shooter.rifleSetup.optic}, ${shooter.rifleSetup.chassis}. Home range: ${shooter.homeRange}.`;
  const canonicalUrl = `https://subsonic-omega.vercel.app/shooters/${shooter.id}`;

  return {
    title: pageTitle,
    description: pageDesc,
    keywords: [
      shooter.name,
      shooter.callsign,
      shooter.division,
      "Subsonic Society",
      "Precision Rimfire",
      "PRS Rimfire",
      shooter.rifleSetup.action,
      shooter.rifleSetup.optic,
      shooter.homeRange,
      "The Hideout Bristol TN",
      ...(shooter.accolades || []),
      ...(shooter.sponsors || []),
    ],
    authors: [{ name: shooter.name }],
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      url: canonicalUrl,
      siteName: "The Subsonic Society",
      images: [
        {
          url: shooter.image?.startsWith("http")
            ? shooter.image
            : `https://subsonic-omega.vercel.app${shooter.image || "/images/SS-RWB-LOGO.png"}`,
          width: 1200,
          height: 630,
          alt: `${shooter.name} Marksman Profile`,
        },
      ],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDesc,
      images: [
        shooter.image?.startsWith("http")
          ? shooter.image
          : `https://subsonic-omega.vercel.app${shooter.image || "/images/SS-RWB-LOGO.png"}`,
      ],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default function ShooterDetailPage({ params }: PageProps) {
  const shooter = getShooterBySlug(params.slug);

  return <ShooterProfileClient slug={params.slug} initialShooter={shooter} />;
}
