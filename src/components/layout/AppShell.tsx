"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileTabs } from "@/components/layout/MobileTabs";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isEvos = pathname?.startsWith("/evos") || pathname?.startsWith("/evovision");
  const isChat = pathname === "/chat" || pathname?.startsWith("/chat/");

  if (isEvos) {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  if (isChat) {
    return (
      <main className="h-[100dvh] w-full overflow-hidden flex flex-col p-0 m-0">
        {children}
      </main>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 safe-bottom-padding pt-[calc(5rem+env(safe-area-inset-top,0px))] sm:pt-[calc(6rem+env(safe-area-inset-top,0px))]">
        {children}
      </main>
      <Footer />
      <MobileTabs />
    </>
  );
}
