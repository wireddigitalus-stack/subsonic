"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import EvosDashboardPage from "@/app/evos1.0/page";

export default function EvoVisionRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/evos1.0");
  }, [router]);

  return <EvosDashboardPage />;
}
