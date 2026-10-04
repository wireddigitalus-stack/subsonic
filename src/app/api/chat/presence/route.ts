import { NextRequest, NextResponse } from "next/server";
import { recordHeartbeat, recordLogout, getOnlineCallsigns } from "@/lib/chat-presence";

export const dynamic = "force-dynamic";

export async function GET() {
  const online = getOnlineCallsigns();
  return NextResponse.json({ online, count: online.length });
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

    const online = getOnlineCallsigns();
    return NextResponse.json({ success: true, online, count: online.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
