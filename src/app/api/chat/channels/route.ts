import { NextRequest, NextResponse } from "next/server";
import {
  getStoredCustomChannels,
  saveStoredCustomChannel,
  deleteStoredCustomChannel,
} from "@/lib/chat-storage";

export const dynamic = "force-dynamic";

function isCallerAdmin(callsign?: string, role?: string): boolean {
  const normRole = (role || "").toUpperCase();
  const normCallsign = (callsign || "").toUpperCase();
  const adminRoles = ["MASTER_OWNER", "DEV_ADMIN", "OWNER_ADMIN", "ADMIN", "MODERATOR"];
  const adminCallsigns = ["RADAR", "ROB", "LTDAN", "SUBX", "ALLEN", "AHURLEY", "HURLEY", "SAID DONE"];
  return adminRoles.includes(normRole) || adminCallsigns.includes(normCallsign);
}

export async function GET() {
  try {
    const channels = await getStoredCustomChannels();
    return NextResponse.json({ channels });
  } catch (err) {
    console.error("GET /api/chat/channels error:", err);
    return NextResponse.json({ channels: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, desc, badge, adminOnly, callsign, role } = body;

    if (!isCallerAdmin(callsign, role)) {
      return NextResponse.json(
        { error: "Only administrators can create new chat rooms." },
        { status: 403 }
      );
    }

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Room name is required." },
        { status: 400 }
      );
    }

    const cleanId = name
      .toLowerCase()
      .trim()
      .replace(/^#+/, "")
      .replace(/[^a-z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (!cleanId || cleanId === "invitational") {
      return NextResponse.json(
        { error: "Please enter a valid, unique room name." },
        { status: 400 }
      );
    }

    const saved = await saveStoredCustomChannel(
      {
        id: cleanId,
        name: cleanId,
        badge: badge?.trim() || (adminOnly ? "ADMIN ONLY" : "MATCH ROOM"),
        desc: desc?.trim() || `Match room #${cleanId}`,
        netType: "PRO",
        activeUsers: 94,
        adminOnly: Boolean(adminOnly),
        isCustom: true,
      },
      (callsign || "ADMIN").toUpperCase()
    );

    const channels = await getStoredCustomChannels();
    return NextResponse.json({ success: true, channel: saved, channels });
  } catch (err: any) {
    console.error("POST /api/chat/channels error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to create room." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");
    let callsign = searchParams.get("callsign");
    let role = searchParams.get("role");

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
        callsign = body.callsign;
        role = body.role;
      } catch {}
    }

    if (!isCallerAdmin(callsign || undefined, role || undefined)) {
      return NextResponse.json(
        { error: "Only administrators can remove chat rooms." },
        { status: 403 }
      );
    }

    if (!id || id === "invitational") {
      return NextResponse.json(
        { error: "Cannot delete the main #invitational room." },
        { status: 400 }
      );
    }

    await deleteStoredCustomChannel(id);
    const channels = await getStoredCustomChannels();
    return NextResponse.json({ success: true, id, channels });
  } catch (err: any) {
    console.error("DELETE /api/chat/channels error:", err);
    return NextResponse.json(
      { error: "Failed to remove room." },
      { status: 500 }
    );
  }
}
