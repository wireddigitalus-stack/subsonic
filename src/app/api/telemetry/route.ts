import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const event = await request.json();

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("telemetry_events").insert([
        {
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
          created_at: event.timestamp || new Date().toISOString(),
        },
      ]);

      if (error) {
        console.warn("Supabase telemetry insert error:", error.message);
      }
    }

    return NextResponse.json({ success: true, eventId: event.id });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
