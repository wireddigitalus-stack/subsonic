import { NextRequest, NextResponse } from "next/server";
import { recordLogout, getPresenceSnapshotAsync } from "@/lib/chat-presence";

export const dynamic = "force-dynamic";

export async function GET() {
  const { onlineCallsigns, lastActiveMap } = await getPresenceSnapshotAsync();
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
      const { onlineCallsigns, lastActiveMap } = await getPresenceSnapshotAsync();
      return NextResponse.json({ success: true, online: onlineCallsigns, lastActiveMap, count: onlineCallsigns.length });
    }

    const { onlineCallsigns, lastActiveMap } = await getPresenceSnapshotAsync(callsign);
    return NextResponse.json({ success: true, online: onlineCallsigns, lastActiveMap, count: onlineCallsigns.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
