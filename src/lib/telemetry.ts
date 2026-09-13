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

const TELEMETRY_QUEUE_KEY = "subsonic_telemetry_offline_queue";

// Flush queued events when internet connectivity is active
export async function flushOfflineQueue() {
  if (typeof window === "undefined" || !navigator.onLine) return;
  try {
    const raw = localStorage.getItem(TELEMETRY_QUEUE_KEY);
    if (!raw) return;
    const queue: TelemetryEvent[] = JSON.parse(raw);
    if (queue.length === 0) return;

    const res = await fetch("/api/telemetry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: queue }),
      keepalive: true,
    });

    if (res.ok) {
      localStorage.removeItem(TELEMETRY_QUEUE_KEY);
    }
  } catch (err) {
    // Keep in queue for next retry
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    flushOfflineQueue();
  });
}

export interface MemberTelemetryInfo {
  isMember: boolean;
  memberType: "SOCIETY_MEMBER" | "COMPETITOR" | "SHOOTER_PROFILE" | "GUEST";
  memberId?: string;
  memberCallsign?: string;
  memberName?: string;
}

export function getVisitorMemberInfo(): MemberTelemetryInfo {
  if (typeof window === "undefined") {
    return { isMember: false, memberType: "GUEST" };
  }
  try {
    // 1. Check verified Society Member profile (from /join)
    const memberRaw = localStorage.getItem("subsonic_member_profile");
    if (memberRaw) {
      const member = JSON.parse(memberRaw);
      if (member && (member.member_id || member.email)) {
        return {
          isMember: true,
          memberType: "SOCIETY_MEMBER",
          memberId: member.member_id,
          memberName: member.full_name,
        };
      }
    }

    // 2. Check Match Competitor Registration (from /register)
    const compRaw = localStorage.getItem("subsonic_competitor_registrations");
    if (compRaw) {
      const comps = JSON.parse(compRaw);
      if (Array.isArray(comps) && comps.length > 0) {
        const c = comps[0];
        return {
          isMember: true,
          memberType: "COMPETITOR",
          memberId: c.passNumber,
          memberCallsign: c.callsign,
          memberName: c.competitorName,
        };
      }
    }

    // 3. Check Chat Tactical Shooter Profile (from /chat)
    const shooterRaw = localStorage.getItem("subsonic_shooter_profile");
    if (shooterRaw) {
      const shooter = JSON.parse(shooterRaw);
      if (shooter && (shooter.callsign || shooter.name)) {
        return {
          isMember: true,
          memberType: "SHOOTER_PROFILE",
          memberCallsign: shooter.callsign,
          memberName: shooter.name,
          memberId: shooter.callsign,
        };
      }
    }
  } catch (err) {
    // Silent fail
  }

  return { isMember: false, memberType: "GUEST" };
}

export function recordTelemetryEvent(event: Omit<TelemetryEvent, "id" | "timestamp" | "device" | "sessionId" | "visitorId" | "isMember"> & { isMember?: boolean }) {
  if (typeof window === "undefined") return;

  const memberInfo = getVisitorMemberInfo();

  const fullEvent: TelemetryEvent = {
    id: "evt_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36),
    timestamp: new Date().toISOString(),
    sessionId: getOrCreateSessionId(),
    visitorId: getOrCreateVisitorId(),
    device: getDeviceDetails(),
    isMember: event.isMember !== undefined ? event.isMember : memberInfo.isMember,
    memberType: event.memberType || memberInfo.memberType,
    memberId: event.memberId || memberInfo.memberId,
    memberCallsign: event.memberCallsign || memberInfo.memberCallsign,
    memberName: event.memberName || memberInfo.memberName,
    ...event,
  };

  // 1. Save to LocalStorage ring buffer (last 500 events)
  try {
    const raw = localStorage.getItem(TELEMETRY_STORAGE_KEY);
    const list: TelemetryEvent[] = raw ? JSON.parse(raw) : [];
    list.unshift(fullEvent);
    if (list.length > 500) list.pop();
    localStorage.setItem(TELEMETRY_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error("Failed to persist telemetry event locally", err);
  }

  // 2. Dispatch custom window event so Admin dashboard updates in real-time
  window.dispatchEvent(new CustomEvent("subsonic-telemetry-new-event", { detail: fullEvent }));

  // 3. Reliable send to API with keepalive
  try {
    fetch("/api/telemetry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fullEvent),
      keepalive: true,
    }).catch(() => {
      // If network fails, queue into offline queue for retry
      try {
        const queueRaw = localStorage.getItem(TELEMETRY_QUEUE_KEY);
        const queue: TelemetryEvent[] = queueRaw ? JSON.parse(queueRaw) : [];
        queue.push(fullEvent);
        if (queue.length > 200) queue.shift();
        localStorage.setItem(TELEMETRY_QUEUE_KEY, JSON.stringify(queue));
      } catch {}
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

// Fetch all telemetry recorded and saved on the server
export async function fetchServerTelemetry(limit = 1000): Promise<{ events: TelemetryEvent[]; totalRecorded: number; analytics: any } | null> {
  try {
    const res = await fetch(`/api/telemetry?limit=${limit}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch server telemetry:", err);
    return null;
  }
}

// Download raw CSV or JSON file from server
export function downloadTelemetryExport(format: "csv" | "json") {
  if (typeof window === "undefined") return;
  window.open(`/api/telemetry?export=${format}`, "_blank");
}

export function clearLocalTelemetry() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TELEMETRY_STORAGE_KEY);
}

// Compute aggregated statistics for the Admin Dashboard (Focused on Page Landings, Items Clicked, and Members)
export function computeTelemetryAnalytics(events: TelemetryEvent[]) {
  const totalClicks = events.filter((e) => e.eventType === "click").length;
  const totalPageLandings = events.filter((e) => e.eventType === "page_landed" || e.eventType === "pageview").length;

  // Member vs Guest breakdowns
  const memberEvents = events.filter((e) => e.isMember);
  const guestEvents = events.filter((e) => !e.isMember);

  const memberClicks = memberEvents.filter((e) => e.eventType === "click").length;
  const guestClicks = guestEvents.filter((e) => e.eventType === "click").length;

  const memberLandings = memberEvents.filter((e) => e.eventType === "page_landed" || e.eventType === "pageview").length;
  const guestLandings = guestEvents.filter((e) => e.eventType === "page_landed" || e.eventType === "pageview").length;

  const uniqueVisitors = new Set(events.map((e) => e.visitorId)).size;
  const uniqueSessions = new Set(events.map((e) => e.sessionId)).size;

  const uniqueMembers = new Set(
    memberEvents.map((e) => e.memberId || e.memberCallsign || e.visitorId)
  ).size;

  // Device stats
  let iosCount = 0;
  let mobileCount = 0;
  let desktopCount = 0;
  events.forEach((e) => {
    if (e.device?.isIOS) iosCount++;
    if (e.device?.isMobile) mobileCount++;
    else desktopCount++;
  });
  const totalForDevice = events.length || 1;

  // Most clicked elements (with member vs guest breakdown)
  const clickMap: Record<string, { count: number; text: string; category?: string; memberClicks: number; guestClicks: number }> = {};
  events
    .filter((e) => e.eventType === "click")
    .forEach((e) => {
      const key = e.targetElement || "Unknown";
      if (!clickMap[key]) {
        clickMap[key] = {
          count: 0,
          text: e.targetText || key,
          category: e.targetCategory || "General",
          memberClicks: 0,
          guestClicks: 0,
        };
      }
      clickMap[key].count++;
      if (e.isMember) {
        clickMap[key].memberClicks++;
      } else {
        clickMap[key].guestClicks++;
      }
    });

  const topClickedElements = Object.entries(clickMap)
    .map(([element, data]) => ({ element, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // Pages landed on distribution (with member vs guest breakdown)
  const pageViewMap: Record<string, { total: number; memberLandings: number; guestLandings: number }> = {};
  events
    .filter((e) => e.eventType === "page_landed" || e.eventType === "pageview")
    .forEach((e) => {
      const page = e.pageRoute || "/";
      if (!pageViewMap[page]) {
        pageViewMap[page] = { total: 0, memberLandings: 0, guestLandings: 0 };
      }
      pageViewMap[page].total++;
      if (e.isMember) {
        pageViewMap[page].memberLandings++;
      } else {
        pageViewMap[page].guestLandings++;
      }
    });

  const topLandedPages = Object.entries(pageViewMap)
    .map(([route, data]) => ({ route, ...data }))
    .sort((a, b) => b.total - a.total);

  return {
    totalEvents: events.length,
    totalClicks,
    totalPageViews: totalPageLandings,
    totalPageLandings,
    totalItemsClicked: totalClicks,
    memberEventsCount: memberEvents.length,
    guestEventsCount: guestEvents.length,
    memberClicks,
    guestClicks,
    memberLandings,
    guestLandings,
    memberPercentage: events.length > 0 ? Math.round((memberEvents.length / events.length) * 100) : 0,
    uniqueVisitors: Math.max(uniqueVisitors, 1),
    uniqueSessions: Math.max(uniqueSessions, 1),
    uniqueMembers,
    deviceBreakdown: {
      iosPercentage: Math.round((iosCount / totalForDevice) * 100),
      mobilePercentage: Math.round((mobileCount / totalForDevice) * 100),
      desktopPercentage: Math.round((desktopCount / totalForDevice) * 100),
    },
    topClickedElements,
    topLandedPages,
    pageViewMap: Object.fromEntries(Object.entries(pageViewMap).map(([k, v]) => [k, v.total])),
  };
}
