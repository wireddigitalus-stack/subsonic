import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPasskey } from "@/lib/admin-passkeys";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { passkey } = await req.json();
    const clean = (passkey || "").toString().trim();
    
    if (!clean) {
      return NextResponse.json({ error: "Admin passkey is required." }, { status: 400 });
    }

    const { valid, session } = verifyAdminPasskey(clean);

    if (!valid || !session) {
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
