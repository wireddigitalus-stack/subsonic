"use client";

import React, { useEffect } from "react";
import CompetitorPacketPage from "./competitor-packet/page";

export default function HomePage() {
  // Safety net: strip any lingering chat-active class from a prior chat session
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.body.classList.remove("chat-active");
    }
  }, []);

  return <CompetitorPacketPage />;
}
