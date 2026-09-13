"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { recordTelemetryEvent } from "@/lib/telemetry";

/**
 * TelemetryProvider
 * Strictly records:
 * 1. Page Landed On (route navigation & landings)
 * 2. Items Clicked On (buttons, links, navigation tabs, cards)
 * 3. Member status tracking (automatically stamped on every event)
 */
export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lastRecordedPathRef = useRef<string | null>(null);

  // 1. PAGE LANDED ON: Record route navigation & initial page landing
  useEffect(() => {
    const route = pathname || "/";
    if (lastRecordedPathRef.current === route) return;
    lastRecordedPathRef.current = route;

    recordTelemetryEvent({
      eventType: "page_landed",
      targetElement: `Page: ${route}`,
      targetText: `Landed on ${route}`,
      targetCategory: "Page Landing",
      pageRoute: route,
    });
  }, [pathname]);

  // 2. ITEMS CLICKED ON: Record all user clicks on interactive elements
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Inspect clickable parent if a child (icon, span inside button) was clicked
      const interactiveEl = target.closest("button, a, input, select, textarea, [data-telemetry], [role='button']");
      const elementToInspect = interactiveEl || target;

      const tagName = elementToInspect.tagName.toLowerCase();
      const telemetryTag = elementToInspect.getAttribute("data-telemetry");
      const id = elementToInspect.id ? `#${elementToInspect.id}` : "";
      const role = elementToInspect.getAttribute("role");
      const text = (elementToInspect.textContent || "").trim().slice(0, 60);

      // Determine clean identifier for the clicked item
      let targetElement = telemetryTag || id || `${tagName}${role ? `[role=${role}]` : ""}`;
      if (!telemetryTag && !id) {
        if (tagName === "button") targetElement = `Button: ${text || "Icon"}`;
        else if (tagName === "a") {
          const href = (elementToInspect as HTMLAnchorElement).getAttribute("href") || "";
          targetElement = `Link: ${text || href}`;
        } else {
          targetElement = `${tagName}:${text.slice(0, 25) || "element"}`;
        }
      }

      // Determine semantic category
      let category = "General Click";
      if (elementToInspect.closest("header") || elementToInspect.closest("nav")) {
        category = "Navigation Header";
      } else if (elementToInspect.closest("[data-section='mobile-tabs']")) {
        category = "Mobile Bottom Tabs";
      } else if (elementToInspect.closest("[data-section='hero']") || targetElement.includes("hero")) {
        category = "Hero Section";
      } else if (elementToInspect.closest("[data-section='facebook-feed']") || targetElement.includes("facebook") || targetElement.includes("feed")) {
        category = "Facebook Feed";
      } else if (elementToInspect.closest("[data-section='chat']") || targetElement.includes("chat")) {
        category = "Chat System";
      } else if (elementToInspect.closest("[data-section='calendar']") || targetElement.includes("match")) {
        category = "Matches & Competition";
      } else if (targetElement.includes("dna") || window.location.pathname.includes("dna")) {
        category = "Subsonic DNA Lab";
      } else if (targetElement.includes("hideout") || window.location.pathname.includes("hideout")) {
        category = "The Hideout Range";
      } else if (targetElement.includes("shooter") || window.location.pathname.includes("shooter")) {
        category = "Shooters & Profiles";
      } else if (targetElement.includes("shop") || window.location.pathname.includes("shop")) {
        category = "Society Shop";
      } else if (targetElement.includes("partner") || targetElement.includes("modacam")) {
        category = "Sponsors & Partners";
      } else if (targetElement.includes("join") || targetElement.includes("register")) {
        category = "Membership & Registration";
      }

      recordTelemetryEvent({
        eventType: "click",
        targetElement,
        targetText: text || undefined,
        targetCategory: category,
        pageRoute: window.location.pathname || "/",
      });
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return <>{children}</>;
}
