import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const cookie = req.cookies.get("subsonic_admin_session");
    
    if (!cookie) {
      return NextResponse.json({ authenticated: false });
    }

    const decoded = Buffer.from(cookie.value, "base64").toString("utf8");
    const payload = JSON.parse(decoded);

    if (!payload.exp || payload.exp < Date.now()) {
      const response = NextResponse.json({ authenticated: false });
      response.cookies.delete("subsonic_admin_session");
      return response;
    }

    return NextResponse.json({
      authenticated: true,
      session: {
        name: payload.name,
        callsign: payload.callsign,
        role: payload.role,
        memberId: payload.memberId,
      }
    });
  } catch (error) {
    const response = NextResponse.json({ authenticated: false });
    response.cookies.delete("subsonic_admin_session");
    return response;
  }
}
