import { NextRequest, NextResponse } from "next/server";
import { getInvitesFromStorage, refreshInvitesFromDb, ensureInviteExists } from "@/lib/invites";
import { getShootersFromStorage, refreshShootersFromDb } from "@/lib/shooters";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawCode = (body.code || "").trim().toUpperCase();
    const bodyCallsign = typeof body.clientCallsign === "string" ? body.clientCallsign.trim().toUpperCase() : "";
    const cookieCallsign = (req.cookies.get("subsonic_member_callsign")?.value || "").trim().toUpperCase();
    const deviceCallsign = bodyCallsign || cookieCallsign;

    if (!rawCode) {
      return NextResponse.json(
        { valid: false, error: "Please enter an invite code." },
        { status: 400 }
      );
    }

    // Fast path: only pull shooters from DB if this device actually has a saved callsign to verify
    const hasDeviceSessionToVerify =
      Boolean(deviceCallsign) &&
      deviceCallsign !== "GUEST" &&
      !["RADAR", "ROB", "LTDAN", "SUBX", "ALLEN"].includes(deviceCallsign);

    if (hasDeviceSessionToVerify) {
      await Promise.all([refreshInvitesFromDb(3000), refreshShootersFromDb(3000)]);
    } else if (rawCode !== "SS-PRO-ZKHZ") {
      await refreshInvitesFromDb(3000);
    }

    // 1. Check if THIS device already has a registered callsign
    let staleSessionPurged = false;
    if (deviceCallsign && deviceCallsign !== "GUEST") {
      const shooters = getShootersFromStorage();
      const deviceShooter = shooters.find(
        (s) =>
          s.callsign?.toUpperCase() === deviceCallsign ||
          s.id?.toLowerCase() === deviceCallsign.toLowerCase()
      );
      if (deviceShooter) {
        const { pin: _omit, ...publicShooter } = deviceShooter as any;
        const claimedRes = NextResponse.json({
          valid: false,
          alreadyClaimed: true,
          claimedCallsign: deviceShooter.callsign.toUpperCase(),
          shooter: publicShooter,
          error: "Already registered! Redirecting you to the Home page...",
        });
        claimedRes.cookies.set("subsonic_member_callsign", deviceShooter.callsign.toUpperCase(), {
          path: "/",
          maxAge: 60 * 60 * 24 * 365,
          sameSite: "lax",
        });
        return claimedRes;
      } else if (!["RADAR", "ROB", "LTDAN", "SUBX", "ALLEN"].includes(deviceCallsign)) {
        // Profile was deleted by Admin — purge stale device session so they can register fresh
        staleSessionPurged = true;
      }
    }

    const invites = getInvitesFromStorage();
    let invite = invites.find((i) => i.code.toUpperCase() === rawCode);
    if (!invite && rawCode === "SS-PRO-ZKHZ") {
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

    // Only treat single-use personal codes (not shared master codes like SS-PRO-ZKHZ) as exhausted
    const isMasterSharedCode = rawCode === "SS-PRO-ZKHZ" || (invite.maxUses || 1) > 1;
    if (!isMasterSharedCode && (invite.status === "EXHAUSTED" || invite.usedCount >= invite.maxUses)) {
      const claimedCallsign =
        Array.isArray(invite.claimedBy) && invite.claimedBy.length > 0
          ? String(invite.claimedBy[invite.claimedBy.length - 1]).toUpperCase()
          : null;

      if (claimedCallsign) {
        const shooters = getShootersFromStorage();
        const foundShooter = shooters.find(
          (s) =>
            s.callsign?.toUpperCase() === claimedCallsign ||
            s.id?.toLowerCase() === claimedCallsign.toLowerCase()
        );
        if (foundShooter) {
          const { pin: _omit, ...publicShooter } = foundShooter as any;
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

    const validRes = NextResponse.json({
      valid: true,
      staleSessionPurged,
      tier: invite.tier,
      code: invite.code,
      recipientName: isMasterSharedCode ? null : invite.recipientName || null,
      maxUses: invite.maxUses,
      remainingUses: Math.max(1, invite.maxUses - invite.usedCount),
    });
    if (staleSessionPurged) {
      validRes.cookies.delete("subsonic_member_callsign");
    }
    return validRes;
  } catch (err: any) {
    return NextResponse.json(
      { valid: false, error: err.message || "Failed to validate invite" },
      { status: 500 }
    );
  }
}
