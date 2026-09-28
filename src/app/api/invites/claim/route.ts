import { NextRequest, NextResponse } from "next/server";
import { getInvitesFromStorage, saveAllInvitesToStorage } from "@/lib/invites";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawCode = (body.code || "").trim().toUpperCase();
    const callsign = (body.callsign || "").trim().toUpperCase();
    const memberId = (body.memberId || "").trim();

    if (!rawCode) {
      return NextResponse.json(
        { success: false, error: "Missing invite code." },
        { status: 400 }
      );
    }

    // Bypass claim tracking for master accounts
    if (["ALLEN", "620620", "RADAR", "2468"].includes(rawCode)) {
      return NextResponse.json({
        success: true,
        isMaster: true,
        message: "Master account access verified.",
      });
    }

    const invites = getInvitesFromStorage();
    const index = invites.findIndex((i) => i.code.toUpperCase() === rawCode);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: "Invite code not found." },
        { status: 404 }
      );
    }

    const invite = invites[index];
    const newUsedCount = (invite.usedCount || 0) + 1;
    const claimedByList = Array.isArray(invite.claimedBy) ? [...invite.claimedBy] : [];
    if (callsign && !claimedByList.includes(callsign)) {
      claimedByList.push(callsign);
    }

    const isNowExhausted = newUsedCount >= invite.maxUses;

    const updatedInvite = {
      ...invite,
      usedCount: newUsedCount,
      claimedBy: claimedByList,
      status: isNowExhausted ? ("EXHAUSTED" as const) : invite.status,
    };

    invites[index] = updatedInvite;
    saveAllInvitesToStorage(invites);

    return NextResponse.json({
      success: true,
      message: `Invite code ${invite.code} claimed successfully.`,
      invite: updatedInvite,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to claim invite" },
      { status: 500 }
    );
  }
}
