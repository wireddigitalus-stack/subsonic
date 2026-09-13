import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import fs from "fs/promises";
import path from "path";
import { TelemetryEvent } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const TELEMETRY_FILE = path.join(DATA_DIR, "telemetry-events.jsonl");

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // Already exists
  }
}

async function appendEventsToFile(events: TelemetryEvent[]) {
  await ensureDataDir();
  const lines = events.map((e) => JSON.stringify(e)).join("\n") + "\n";
  await fs.appendFile(TELEMETRY_FILE, lines, "utf-8");
}

async function readEventsFromFile(): Promise<TelemetryEvent[]> {
  try {
    const raw = await fs.readFile(TELEMETRY_FILE, "utf-8");
    const lines = raw.trim().split("\n").filter(Boolean);
    const events: TelemetryEvent[] = [];
    for (const line of lines) {
      try {
        events.push(JSON.parse(line));
      } catch {
        // Skip malformed line
      }
    }
    // Return reverse-chronological (most recent first)
    return events.reverse();
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawEvents: any[] = Array.isArray(body.events) ? body.events : [body];

    const validEvents: TelemetryEvent[] = rawEvents
      .filter((e) => e && (e.eventType || e.targetElement))
      .map((e) => ({
        id: e.id || "evt_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36),
        eventType: e.eventType || "click",
        targetElement: e.targetElement || "unknown",
        targetText: e.targetText,
        targetCategory: e.targetCategory || "General",
        pageRoute: e.pageRoute || "/",
        dwellSeconds: typeof e.dwellSeconds === "number" ? e.dwellSeconds : undefined,
        scrollDepth: typeof e.scrollDepth === "number" ? e.scrollDepth : undefined,
        timestamp: e.timestamp || new Date().toISOString(),
        device: e.device || {
          isMobile: false,
          isIOS: false,
          screenWidth: 1280,
          screenHeight: 800,
          userAgent: request.headers.get("user-agent") || "",
        },
        sessionId: e.sessionId || "server_ses_" + Date.now(),
        visitorId: e.visitorId || "server_vst_" + Date.now(),
      }));

    if (validEvents.length > 0) {
      // 1. Persist to local disk JSONL (durable, append-only, thread-safe)
      await appendEventsToFile(validEvents);

      // 2. If Supabase is connected, replicate to cloud database
      if (isSupabaseConfigured && supabase) {
        const rows = validEvents.map((event) => ({
          id: event.id,
          event_type: event.eventType,
          target_element: event.targetElement,
          target_text: event.targetText,
          target_category: event.targetCategory,
          page_route: event.pageRoute,
          dwell_seconds: event.dwellSeconds,
          scroll_depth: event.scrollDepth,
          session_id: event.sessionId,
          visitor_id: event.visitorId,
          device_data: event.device,
          created_at: event.timestamp,
        }));

        try {
          const { error } = await supabase.from("telemetry_events").insert(rows);
          if (error) {
            console.warn("Supabase telemetry insert error:", error.message);
          }
        } catch (supabaseErr) {
          console.warn("Supabase telemetry insert failed:", supabaseErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      recordedCount: validEvents.length,
      storage: "data/telemetry-events.jsonl",
    });
  } catch (error) {
    console.error("Telemetry POST handler error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || searchParams.get("export");
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 5000) : 1000;

    let events = await readEventsFromFile();

    // If file is empty and Supabase is configured, pull from Supabase
    if (events.length === 0 && isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("telemetry_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (!error && data && data.length > 0) {
        events = data.map((d: any) => ({
          id: d.id,
          eventType: d.event_type,
          targetElement: d.target_element,
          targetText: d.target_text,
          targetCategory: d.target_category,
          pageRoute: d.page_route,
          dwellSeconds: d.dwell_seconds,
          scrollDepth: d.scroll_depth,
          timestamp: d.created_at,
          device: d.device_data || { isMobile: false, isIOS: false, screenWidth: 0, screenHeight: 0, userAgent: "" },
          sessionId: d.session_id,
          visitorId: d.visitor_id,
        }));
      }
    }

    // Export as CSV
    if (format === "csv") {
      const headers = [
        "Timestamp",
        "Event Type",
        "Target Element",
        "Target Text",
        "Category",
        "Page Route",
        "Dwell (s)",
        "Scroll Depth (%)",
        "Is Mobile",
        "Is iOS",
        "Screen Resolution",
        "Visitor ID",
        "Session ID"
      ];

      const csvRows = [headers.join(",")];
      for (const e of events) {
        const row = [
          `"${e.timestamp}"`,
          `"${e.eventType}"`,
          `"${(e.targetElement || "").replace(/"/g, '""')}"`,
          `"${(e.targetText || "").replace(/"/g, '""')}"`,
          `"${(e.targetCategory || "").replace(/"/g, '""')}"`,
          `"${e.pageRoute || ""}"`,
          e.dwellSeconds ?? "",
          e.scrollDepth ?? "",
          e.device?.isMobile ? "Yes" : "No",
          e.device?.isIOS ? "Yes" : "No",
          `"${e.device?.screenWidth}x${e.device?.screenHeight}"`,
          `"${e.visitorId}"`,
          `"${e.sessionId}"`
        ];
        csvRows.push(row.join(","));
      }

      const csvString = csvRows.join("\n");
      const filename = `subsonic-telemetry-${new Date().toISOString().slice(0, 10)}.csv`;

      return new NextResponse(csvString, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-store, max-age=0",
        },
      });
    }

    // Export as downloadable JSON
    if (format === "json") {
      const filename = `subsonic-telemetry-${new Date().toISOString().slice(0, 10)}.json`;
      return new NextResponse(JSON.stringify(events, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-store, max-age=0",
        },
      });
    }

    // Standard JSON response with precomputed analytics
    const totalEvents = events.length;
    const totalClicks = events.filter((e) => e.eventType === "click").length;
    const totalPageViews = events.filter((e) => e.eventType === "pageview").length;
    const uniqueVisitors = new Set(events.map((e) => e.visitorId)).size;
    const uniqueSessions = new Set(events.map((e) => e.sessionId)).size;

    return NextResponse.json({
      success: true,
      totalRecorded: totalEvents,
      storageEngine: "filesystem (data/telemetry-events.jsonl)",
      analytics: {
        totalEvents,
        totalClicks,
        totalPageViews,
        uniqueVisitors: Math.max(uniqueVisitors, 1),
        uniqueSessions: Math.max(uniqueSessions, 1),
      },
      events: events.slice(0, limit),
    });
  } catch (error) {
    console.error("Telemetry GET handler error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const passkey = searchParams.get("passkey") || request.headers.get("x-admin-passkey");

    if (passkey !== "subsonic2026") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
      await fs.unlink(TELEMETRY_FILE);
    } catch {
      // File may not exist yet
    }

    return NextResponse.json({ success: true, message: "Telemetry log wiped successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
