import { NextRequest, NextResponse } from "next/server";
import { recordHeartbeat, recordLogout, getPresenceSnapshot } from "@/lib/chat-presence";

export const dynamic = "force-dynamic";

export async function GET() {
  const { onlineCallsigns, lastActiveMap } = getPresenceSnapshot();
  return NextResponse.json({ online: onlineCallsigns, lastActiveMap, count: onlineCallsigns.length });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { callsign, action } = body;

    if (!callsign) {
      return NextResponse.json({ error: "Callsign required" }, { status: 400 });
    }

    if (action === "logout") {
      recordLogout(callsign);
    } else {
      recordHeartbeat(callsign);
    }

    const { onlineCallsigns, lastActiveMap } = getPresenceSnapshot();
    return NextResponse.json({ success: true, online: onlineCallsigns, lastActiveMap, count: onlineCallsigns.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
