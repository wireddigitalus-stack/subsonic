import { NextRequest, NextResponse } from "next/server";
import { getAdminPasskeys, updateAdminPasskey } from "@/lib/admin-passkeys";

export const dynamic = "force-dynamic";

function getVerifiedSession(req: NextRequest) {
  try {
    const cookie = req.cookies.get("subsonic_admin_session");
    if (!cookie) return null;

    const decoded = Buffer.from(cookie.value, "base64").toString("utf8");
    const payload = JSON.parse(decoded);

    if (!payload.exp || payload.exp < Date.now()) return null;

    const validRoles = ["MASTER_OWNER", "OWNER_ADMIN", "ADMIN"];
    if (!validRoles.includes(payload.role)) return null;

    return payload;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const session = getVerifiedSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
  }

  const passkeys = getAdminPasskeys();

  // Return sanitized view with masked passkey for security
  const sanitized = Object.entries(passkeys).map(([callsign, entry]) => ({
    callsign,
    name: entry.name,
    role: entry.role,
    memberId: entry.memberId,
    updatedAt: entry.updatedAt,
    updatedBy: entry.updatedBy,
    // Show current passkey to verified Master Owner / Owner Admin
    currentPasskey: entry.passkey,
  }));

  return NextResponse.json({ success: true, accounts: sanitized });
}

export async function POST(req: NextRequest) {
  const session = getVerifiedSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { targetCallsign, newPasskey } = body;

    if (!targetCallsign || !newPasskey) {
      return NextResponse.json(
        { error: "Target callsign and new passkey are required." },
        { status: 400 }
      );
    }

    const cleanTarget = targetCallsign.trim().toUpperCase();
    const cleanPasskey = newPasskey.trim();

    if (cleanPasskey.length < 4) {
      return NextResponse.json(
        { error: "Passkey must be at least 4 digits or characters long." },
        { status: 400 }
      );
    }

    if (!["RADAR", "ALLEN", "SAID DONE", "SAIDDONE"].includes(cleanTarget)) {
      return NextResponse.json(
        { error: "Invalid target. Only RADAR (Rob) or SAID DONE / ALLEN (Allen) passkeys can be configured." },
        { status: 400 }
      );
    }

    const result = updateAdminPasskey(cleanTarget, cleanPasskey, session.callsign);

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Update failed." }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Admin passkey for ${cleanTarget} (${result.entry?.name}) updated successfully.`,
      updatedAt: result.entry?.updatedAt,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update admin passkey." },
      { status: 500 }
    );
  }
}
