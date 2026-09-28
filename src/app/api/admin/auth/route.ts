import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { passkey } = await req.json();
    const clean = (passkey || "").toString().trim().toLowerCase();
    
    const adminEnvKey = process.env.ADMIN_PASSKEY ? process.env.ADMIN_PASSKEY.toLowerCase() : null;

    const VALID_ADMIN_KEYS = [
      "2468", 
      "620620", 
      "subsonic2026", 
      "admin",
      "allen",
      "allen 620620",
      "allen620620"
    ];

    if (adminEnvKey && !VALID_ADMIN_KEYS.includes(adminEnvKey)) {
      VALID_ADMIN_KEYS.push(adminEnvKey);
    }

    if (VALID_ADMIN_KEYS.includes(clean)) {
      let session = {
        name: "Rob Neilson",
        callsign: "RADAR",
        role: "MASTER_OWNER",
        memberId: "SS-2026-0001",
      };

      if (clean === "620620" || clean === "allen" || clean.includes("620620") || clean.includes("allen")) {
        session = {
          name: "Allen Hurley",
          callsign: "ALLEN",
          role: "OWNER_ADMIN",
          memberId: "SS-2026-0002",
        };
      } else if (clean === "subsonic2026" || clean === "admin" || (adminEnvKey && clean === adminEnvKey)) {
        session = {
          name: "Admin",
          callsign: "ADMIN",
          role: "ADMIN",
          memberId: "SS-ADMIN",
        };
      }

      const exp = new Date();
      exp.setHours(exp.getHours() + 24);

      const cookiePayload = {
        authenticated: true,
        ...session,
        exp: exp.getTime()
      };

      const encodedPayload = Buffer.from(JSON.stringify(cookiePayload)).toString('base64');

      const response = NextResponse.json({ success: true, session });
      
      response.cookies.set("subsonic_admin_session", encodedPayload, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: exp,
        path: "/",
      });

      return response;
    }

    return NextResponse.json({ error: "Invalid passkey" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
