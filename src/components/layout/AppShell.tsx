"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileTabs } from "@/components/layout/MobileTabs";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isEvoVision = pathname?.startsWith("/evovision");

  if (isEvoVision) {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 safe-bottom-padding pt-20 sm:pt-24">
        {children}
      </main>
      <Footer />
      <MobileTabs />
    </>
  );
}
