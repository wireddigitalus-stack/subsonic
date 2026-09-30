import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EVOS 1.0 • Neural Telemetry Topology | SUBSONIC SOCIETY",
  description:
    "Live bio-luminous neural topology mapping precision rimfire competitors, autonomous AI ballistics test beds, and real-time comms moderation sentinels.",
  openGraph: {
    title: "EVOS 1.0 • Neural Telemetry Topology | SUBSONIC SOCIETY",
    description:
      "Live bio-luminous neural topology mapping precision rimfire competitors, autonomous AI ballistics test beds, and real-time comms moderation sentinels.",
    url: "https://subsonicsociety.com/evos1.0",
    siteName: "SUBSONIC SOCIETY",
    images: [
      {
        url: "/assets/evos-social-share.jpg",
        width: 1200,
        height: 675,
        alt: "SUBSONIC SOCIETY — EVOS 1.0 Neural Telemetry Topology",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EVOS 1.0 • Neural Telemetry Topology | SUBSONIC SOCIETY",
    description:
      "Live bio-luminous neural topology mapping precision rimfire competitors, autonomous AI ballistics test beds, and real-time comms moderation sentinels.",
    images: ["/assets/evos-social-share.jpg"],
  },
};

export default function EvosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
