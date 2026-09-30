import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { passkey } = await req.json();
    const clean = (passkey || "").toString().trim();
    
    if (!clean) {
      return NextResponse.json({ error: "Admin passkey is required." }, { status: 400 });
    }

    // STRICT OWNER & MASTER ADMIN KEYS ONLY:
    // 1. Rob Neilson (RADAR) -> 2468 (MASTER_OWNER)
    // 2. Allen Hurley (ALLEN) -> 620620 (OWNER_ADMIN)
    let session: {
      name: string;
      callsign: string;
      role: "MASTER_OWNER" | "OWNER_ADMIN" | "ADMIN";
      memberId: string;
    } | null = null;

    if (clean === "2468") {
      session = {
        name: "Rob Neilson",
        callsign: "RADAR",
        role: "MASTER_OWNER",
        memberId: "SS-2026-0001",
      };
    } else if (clean === "620620") {
      session = {
        name: "Allen Hurley",
        callsign: "ALLEN",
        role: "OWNER_ADMIN",
        memberId: "SS-2026-0002",
      };
    } else {
      const adminEnvKey = process.env.ADMIN_PASSKEY ? process.env.ADMIN_PASSKEY.trim() : null;
      // Do NOT allow generic or beta strings like subsonic2026 or admin to grant admin access
      if (
        adminEnvKey && 
        adminEnvKey !== "subsonic2026" && 
        adminEnvKey !== "admin" && 
        clean === adminEnvKey
      ) {
        session = {
          name: "Administrator",
          callsign: "ADMIN",
          role: "ADMIN",
          memberId: "SS-ADMIN",
        };
      }
    }

    if (!session) {
      return NextResponse.json(
        { error: "Access Denied: Invalid Master Owner or Administrator passkey." }, 
        { status: 401 }
      );
    }

    const exp = new Date();
    exp.setHours(exp.getHours() + 12);

    const cookiePayload = {
      authenticated: true,
      ...session,
      exp: exp.getTime()
    };

    const encodedPayload = Buffer.from(JSON.stringify(cookiePayload)).toString("base64");

    const response = NextResponse.json({ success: true, session });
    
    response.cookies.set("subsonic_admin_session", encodedPayload, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: exp,
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
