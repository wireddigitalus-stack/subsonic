import { NextRequest, NextResponse } from "next/server";
import { getInvitesFromStorage, refreshInvitesFromDb } from "@/lib/invites";
import { getShootersFromStorage, refreshShootersFromDb } from "@/lib/shooters";

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

    // Only invites that actually exist (created by an admin) are accepted.
    await refreshInvitesFromDb();
    const invites = getInvitesFromStorage();
    const invite = invites.find((i) => i.code.toUpperCase() === rawCode);

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
      const claimedCallsign =
        Array.isArray(invite.claimedBy) && invite.claimedBy.length > 0
          ? String(invite.claimedBy[invite.claimedBy.length - 1]).toUpperCase()
          : null;

      if (claimedCallsign) {
        await refreshShootersFromDb(0);
        const shooters = getShootersFromStorage();
        const foundShooter = shooters.find(
          (s) =>
            s.callsign?.toUpperCase() === claimedCallsign ||
            s.id?.toLowerCase() === claimedCallsign.toLowerCase()
        );
        const publicShooter = foundShooter
          ? (() => {
              const { pin: _omit, ...rest } = foundShooter as any;
              return rest;
            })()
          : null;

        const claimedRes = NextResponse.json({
          valid: false,
          alreadyClaimed: true,
          claimedCallsign,
          shooter: publicShooter,
          error: "Already registered! Redirecting you to the Home page...",
        });
        claimedRes.cookies.set("subsonic_member_callsign", claimedCallsign, {
          path: "/",
          maxAge: 60 * 60 * 24 * 365,
          sameSite: "lax",
        });
        return claimedRes;
      }

      return NextResponse.json(
        { valid: false, alreadyClaimed: true, error: "This invite code has already been registered." },
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
