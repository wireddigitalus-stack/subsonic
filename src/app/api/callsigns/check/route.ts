import { NextRequest, NextResponse } from "next/server";
import { checkCallsignAvailability } from "@/lib/callsigns";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const callsign = searchParams.get("callsign") || "";
    const state = searchParams.get("state") || "TN";
    const excludeMemberId = searchParams.get("excludeMemberId") || undefined;

    const result = checkCallsignAvailability(callsign, {
      state,
      excludeMemberId,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Error in callsign check API:", err);
    return NextResponse.json(
      {
        isValidFormat: false,
        isAvailable: false,
        normalized: "",
        message: "Error checking callsign availability.",
        suggestions: [],
      },
      { status: 500 }
    );
  }
}
