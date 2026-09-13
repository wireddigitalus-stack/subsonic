"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { recordTelemetryEvent } from "@/lib/telemetry";

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pageStartTimeRef = useRef<number>(Date.now());
  const maxScrollRef = useRef<number>(0);

  // Track pageviews & dwell times
  useEffect(() => {
    const route = pathname || "/";
    pageStartTimeRef.current = Date.now();
    maxScrollRef.current = 0;

    // Record initial pageview
    recordTelemetryEvent({
      eventType: "pageview",
      targetElement: `page:${route}`,
      targetText: `Navigated to ${route}`,
      targetCategory: "Navigation",
      pageRoute: route,
    });

    // Cleanup: calculate dwell time when route changes or component unmounts
    return () => {
      const dwellSeconds = Math.max(1, Math.round((Date.now() - pageStartTimeRef.current) / 1000));
      recordTelemetryEvent({
        eventType: "dwell",
        targetElement: `page:${route}`,
        targetText: `Stayed ${dwellSeconds}s on ${route}`,
        targetCategory: "Engagement",
        pageRoute: route,
        dwellSeconds,
        scrollDepth: maxScrollRef.current,
      });
    };
  }, [pathname]);

  // Track page unload dwell
  useEffect(() => {
    const handleBeforeUnload = () => {
      const dwellSeconds = Math.max(1, Math.round((Date.now() - pageStartTimeRef.current) / 1000));
      const route = window.location.pathname || "/";
      recordTelemetryEvent({
        eventType: "dwell",
        targetElement: `unload:${route}`,
        targetText: `Exited page after ${dwellSeconds}s`,
        targetCategory: "SessionExit",
        pageRoute: route,
        dwellSeconds,
        scrollDepth: maxScrollRef.current,
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Track visibility change (crucial for mobile Safari / iOS app switching and lock screen)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        const dwellSeconds = Math.max(1, Math.round((Date.now() - pageStartTimeRef.current) / 1000));
        const route = window.location.pathname || "/";
        recordTelemetryEvent({
          eventType: "dwell",
          targetElement: `app_hidden:${route}`,
          targetText: `Tab hidden / switched after ${dwellSeconds}s`,
          targetCategory: "MobileAppExit",
          pageRoute: route,
          dwellSeconds,
          scrollDepth: maxScrollRef.current,
        });
      } else if (document.visibilityState === "visible") {
        pageStartTimeRef.current = Date.now();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Track scroll depth with milestone recording
  useEffect(() => {
    const recordedMilestones = new Set<number>();

    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const percent = Math.min(100, Math.round((scrollTop / scrollHeight) * 100));
        if (percent > maxScrollRef.current) {
          maxScrollRef.current = percent;
        }

        // Record 25%, 50%, 75%, 100% reading milestones
        const milestones = [25, 50, 75, 100];
        for (const m of milestones) {
          if (percent >= m && !recordedMilestones.has(m)) {
            recordedMilestones.add(m);
            recordTelemetryEvent({
              eventType: "scroll",
              targetElement: `scroll_${m}pct`,
              targetText: `Scrolled ${m}% of page`,
              targetCategory: "ContentEngagement",
              pageRoute: window.location.pathname || "/",
              scrollDepth: m,
            });
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // Global click tracker: captures all clicks, target element text, classes, and categories
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Find clickable parent if child (like icon, span inside button) was clicked
      const interactiveEl = target.closest("button, a, input, select, textarea, [data-telemetry], [role='button']");
      const elementToInspect = interactiveEl || target;

      const tagName = elementToInspect.tagName.toLowerCase();
      const telemetryTag = elementToInspect.getAttribute("data-telemetry");
      const id = elementToInspect.id ? `#${elementToInspect.id}` : "";
      const role = elementToInspect.getAttribute("role");
      const text = (elementToInspect.textContent || "").trim().slice(0, 60);

      // Determine clean identifier
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

      // Determine category
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
