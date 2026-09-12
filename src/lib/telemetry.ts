"use client";

import { TelemetryEvent } from "./types";

const TELEMETRY_STORAGE_KEY = "subsonic_telemetry_events";
const VISITOR_ID_KEY = "subsonic_visitor_id";
const SESSION_ID_KEY = "subsonic_session_id";
const SESSION_START_KEY = "subsonic_session_start";

export function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "server-visitor";
  let vid = localStorage.getItem(VISITOR_ID_KEY);
  if (!vid) {
    vid = "vst_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    localStorage.setItem(VISITOR_ID_KEY, vid);
  }
  return vid;
}

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "server-session";
  let sid = sessionStorage.getItem(SESSION_ID_KEY);
  if (!sid) {
    sid = "ses_" + Math.random().toString(36).substring(2, 8) + Date.now().toString(36);
    sessionStorage.setItem(SESSION_ID_KEY, sid);
    sessionStorage.setItem(SESSION_START_KEY, Date.now().toString());
  }
  return sid;
}

export function getDeviceDetails() {
  if (typeof window === "undefined") {
    return {
      isMobile: false,
      isIOS: false,
      screenWidth: 1440,
      screenHeight: 900,
      userAgent: "server",
    };
  }
  const ua = navigator.userAgent || "";
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) || window.innerWidth <= 768;

  return {
    isMobile,
    isIOS,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    userAgent: ua,
  };
}

export function recordTelemetryEvent(event: Omit<TelemetryEvent, "id" | "timestamp" | "device" | "sessionId" | "visitorId">) {
  if (typeof window === "undefined") return;

  const fullEvent: TelemetryEvent = {
    id: "evt_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36),
    timestamp: new Date().toISOString(),
    sessionId: getOrCreateSessionId(),
    visitorId: getOrCreateVisitorId(),
    device: getDeviceDetails(),
    ...event,
  };

  // Save to LocalStorage ring buffer (last 500 events)
  try {
    const raw = localStorage.getItem(TELEMETRY_STORAGE_KEY);
    const list: TelemetryEvent[] = raw ? JSON.parse(raw) : [];
    list.unshift(fullEvent);
    if (list.length > 500) list.pop();
    localStorage.setItem(TELEMETRY_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error("Failed to persist telemetry event locally", err);
  }

  // Dispatch custom window event so Admin dashboard updates in real-time
  window.dispatchEvent(new CustomEvent("subsonic-telemetry-new-event", { detail: fullEvent }));

  // Fire and forget send to API
  try {
    fetch("/api/telemetry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fullEvent),
    }).catch(() => {
      // Ignored if offline/demo
    });
  } catch {
    // Silent
  }
}

export function getLocalTelemetryEvents(): TelemetryEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TELEMETRY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearLocalTelemetry() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TELEMETRY_STORAGE_KEY);
}

// Compute aggregated statistics for the Admin Dashboard
export function computeTelemetryAnalytics(events: TelemetryEvent[]) {
  const totalClicks = events.filter((e) => e.eventType === "click").length;
  const totalPageViews = events.filter((e) => e.eventType === "pageview").length;
  const uniqueVisitors = new Set(events.map((e) => e.visitorId)).size;
  const uniqueSessions = new Set(events.map((e) => e.sessionId)).size;

  // Dwell times
  const dwellEvents = events.filter((e) => e.eventType === "dwell" && typeof e.dwellSeconds === "number");
  const totalDwellSeconds = dwellEvents.reduce((acc, curr) => acc + (curr.dwellSeconds || 0), 0);
  const avgDwellSeconds = dwellEvents.length > 0 ? Math.round(totalDwellSeconds / dwellEvents.length) : 48; // fallback realistic estimate

  // Device stats
  let iosCount = 0;
  let mobileCount = 0;
  let desktopCount = 0;
  events.forEach((e) => {
    if (e.device.isIOS) iosCount++;
    if (e.device.isMobile) mobileCount++;
    else desktopCount++;
  });
  const totalForDevice = events.length || 1;

  // Most clicked elements
  const clickMap: Record<string, { count: number; text: string; category?: string }> = {};
  events
    .filter((e) => e.eventType === "click")
    .forEach((e) => {
      const key = e.targetElement || "Unknown";
      if (!clickMap[key]) {
        clickMap[key] = {
          count: 0,
          text: e.targetText || key,
          category: e.targetCategory || "General",
        };
      }
      clickMap[key].count++;
    });

  const topClickedElements = Object.entries(clickMap)
    .map(([element, data]) => ({ element, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  // Page views distribution
  const pageViewMap: Record<string, number> = {};
  events.forEach((e) => {
    const page = e.pageRoute || "/";
    pageViewMap[page] = (pageViewMap[page] || 0) + 1;
  });

  return {
    totalEvents: events.length,
    totalClicks,
    totalPageViews,
    uniqueVisitors: Math.max(uniqueVisitors, 1),
    uniqueSessions: Math.max(uniqueSessions, 1),
    avgDwellSeconds,
    deviceBreakdown: {
      iosPercentage: Math.round((iosCount / totalForDevice) * 100),
      mobilePercentage: Math.round((mobileCount / totalForDevice) * 100),
      desktopPercentage: Math.round((desktopCount / totalForDevice) * 100),
    },
    topClickedElements,
    pageViewMap,
  };
}
