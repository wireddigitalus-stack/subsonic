"use client";

import React, { useEffect } from "react";
import { FullHomePage } from "@/components/home/FullHomePage";

export default function HomePage() {
  // Safety net: strip any lingering chat-active class from a prior chat session
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.body.classList.remove("chat-active");
    }
  }, []);

  return <FullHomePage />;
}
