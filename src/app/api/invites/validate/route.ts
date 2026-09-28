import { NextRequest, NextResponse } from "next/server";
import { getInvitesFromStorage, ensureInviteExists } from "@/lib/invites";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawCode = (body.code || "").trim().toUpperCase();

    if (!rawCode) {
      return NextResponse.json(
        { valid: false, error: "Please enter an invite code." },
        { status: 400 }
      );
    }

    // Master VIP override codes
    if (rawCode === "ALLEN" || rawCode === "620620") {
      return NextResponse.json({
        valid: true,
        tier: "PRO",
        recipientName: "Allen Hurley (Owner Admin)",
        isMaster: true,
      });
    }

    if (rawCode === "RADAR" || rawCode === "2468") {
      return NextResponse.json({
        valid: true,
        tier: "PRO",
        recipientName: "Rob Neilson (Dev Advisor)",
        isMaster: true,
      });
    }

    const invites = getInvitesFromStorage();
    let invite = invites.find((i) => i.code.toUpperCase() === rawCode);

    if (!invite) {
      invite = ensureInviteExists(rawCode) || undefined;
    }

    if (!invite) {
      return NextResponse.json(
        { valid: false, error: "Invalid invite code. Check spelling or request a new code from Allen." },
        { status: 404 }
      );
    }

    if (invite.status === "REVOKED") {
      return NextResponse.json(
        { valid: false, error: "This invite code has been revoked by administration." },
        { status: 403 }
      );
    }

    if (invite.status === "EXHAUSTED" || invite.usedCount >= invite.maxUses) {
      return NextResponse.json(
        { valid: false, error: "This invite code has already reached its maximum usage limit." },
        { status: 410 }
      );
    }

    if (invite.expiresAt && new Date(invite.expiresAt).getTime() < Date.now()) {
      return NextResponse.json(
        { valid: false, error: "This invite code has expired." },
        { status: 410 }
      );
    }

    return NextResponse.json({
      valid: true,
      tier: invite.tier,
      code: invite.code,
      recipientName: invite.recipientName || null,
      maxUses: invite.maxUses,
      remainingUses: invite.maxUses - invite.usedCount,
    });
  } catch (err: any) {
    return NextResponse.json(
      { valid: false, error: err.message || "Failed to validate invite" },
      { status: 500 }
    );
  }
}
