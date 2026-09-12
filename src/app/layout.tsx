import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { MobileTabs } from "@/components/layout/MobileTabs";
import { Footer } from "@/components/layout/Footer";
import { TelemetryProvider } from "@/components/providers/TelemetryProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://subsonicsociety.com"),
  title: "Subsonic Society | Precision Rimfire Media & Bristol TN Mountain Championships",
  description:
    "Subsonic Society is a precision rimfire shooting media and community platform. We cover competitions, highlight athletes, discuss equipment, showcase venues and performance within the growing rimfire shooting sports world.",
  keywords: [
    "Subsonic Society",
    "Bristol TN shooting competition",
    "precision rimfire",
    "PRS Rimfire",
    "NRL22",
    ".22LR precision rifle",
    "Appalachian Mountain Rimfire Pro",
  ],
  authors: [{ name: "Subsonic Society" }],
  icons: {
    icon: "/assets/subsonic-logo-round.png",
    apple: "/assets/subsonic-logo-round.png",
  },
  openGraph: {
    title: "Subsonic Society | Precision Rimfire Competition & Media Platform",
    description:
      "Premier precision rimfire shootout in the mountains of Bristol, Tennessee. Follow stage briefings, match results, community chat, and gear breakdowns.",
    url: "https://subsonicsociety.com",
    siteName: "Subsonic Society",
    images: [
      {
        url: "/assets/subsonic-facebook-cover.jpg",
        width: 1200,
        height: 630,
        alt: "Subsonic Society Bristol TN Precision Rimfire",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#07090E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#07090E] text-slate-100 min-h-screen flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
        <TelemetryProvider>
          <Navbar />
          <main className="flex-1 safe-bottom-padding pt-20">
            {children}
          </main>
          <Footer />
          <MobileTabs />
        </TelemetryProvider>
      </body>
    </html>
  );
}
