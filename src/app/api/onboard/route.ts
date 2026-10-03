import { NextRequest, NextResponse } from "next/server";
import { ShooterProfile, SocietyMember } from "@/lib/types";
import {
  getInvitesFromStorage,
  refreshInvitesFromDb,
  saveInviteAsync,
} from "@/lib/invites";
import {
  getShootersFromStorage,
  refreshShootersFromDb,
  saveShooterToStorageAsync,
  deleteShooterFromStorageAsync,
} from "@/lib/shooters";
import {
  refreshMembersFromDb,
  addOrUpdateMemberAsync,
  deleteMemberFromStorageAsync,
} from "@/lib/members";
import { checkCallsignAvailability } from "@/lib/callsigns";
import { validatePin } from "@/lib/pin-policy";
import { hashPin } from "@/lib/pin-hash";
import { isDbConfigured } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";


/**
 * POST /api/onboard
 *
 * One-shot, all-or-nothing member registration:
 *   1. Validate the invite code
 *   2. Validate callsign + 4-digit PIN
 *   3. Save the shooter profile        (database confirmed)
 *   4. Save the linked member record   (database confirmed, same callsign, member_id SS-PRO-<CALLSIGN>)
 *   5. Claim the invite code           (database confirmed)
 * If any database step fails, earlier steps are rolled back so no half-created accounts remain.
 */
export async function POST(req: NextRequest) {
  let createdShooterId: string | null = null;
  let createdMemberId: string | null = null;

  try {
    if (Boolean(process.env.VERCEL) && !isDbConfigured) {
      console.error("[onboard] Database not configured on Vercel — refusing signup to avoid data loss.");
      return NextResponse.json(
        { error: "Registration is temporarily unavailable. Please contact a match director.", code: "DB_NOT_CONFIGURED" },
        { status: 503 }
      );
    }
    const body = await req.json();
    const code = String(body.code || "").trim().toUpperCase();
    const fullName = String(body.fullName || "").trim();
    const callsign = String(body.callsign || "").trim().toUpperCase();
    const pin = String(body.pin || "").trim();

    // Always work from the latest database records
    await Promise.all([refreshInvitesFromDb(0), refreshShootersFromDb(0), refreshMembersFromDb(0)]);

    // ── 1. Invite code ─────────────────────────────────────────────
    if (!code) return fail("Please enter your invitation code.", 400, "INVITE_REQUIRED");
    // Only invites that actually exist (created by an admin) are accepted.
    const invite = getInvitesFromStorage().find((i) => i.code.toUpperCase() === code);
    if (!invite) return fail("Invalid invite code. Check spelling or request a new code.", 404, "INVITE_INVALID");
    if (invite.status === "REVOKED") return fail("This invite code has been revoked.", 403, "INVITE_REVOKED");
    if (invite.status === "EXHAUSTED" || invite.usedCount >= invite.maxUses)
      return fail("This invite code has reached its usage limit.", 410, "INVITE_EXHAUSTED");
    if (invite.expiresAt && new Date(invite.expiresAt).getTime() < Date.now())
      return fail("This invite code has expired.", 410, "INVITE_EXPIRED");

    // ── 2. Identity ────────────────────────────────────────────────
    if (!fullName || !callsign) return fail("Full name and callsign are required.", 400, "MISSING_FIELDS");
    const pinError = validatePin(pin, "MEMBER");
    if (pinError) return fail(pinError, 400, "INVALID_PIN");

    const callsignCheck = checkCallsignAvailability(callsign, { state: "TN" });
    if (!callsignCheck.isAvailable) {
      return NextResponse.json(
        { error: callsignCheck.message, suggestions: callsignCheck.suggestions, code: "CALLSIGN_TAKEN" },
        { status: 409 }
      );
    }

    const slug = callsign.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const shooterId = slug.length > 2 ? slug : `shooter-${Date.now().toString(36)}`;
    if (getShootersFromStorage().some((s) => s.id.toLowerCase() === shooterId)) {
      return fail("That callsign is already in use. Please choose another.", 409, "CALLSIGN_TAKEN");
    }

    const pinHash = await hashPin(pin);
    const now = new Date().toISOString();
    const division = String(body.division || "Open Division Pro");
    const homeRange = String(body.homeRange || "").trim() || "The Hideout, Bristol, TN";
    const accolades: string[] = Array.isArray(body.accolades) && body.accolades.length ? body.accolades : ["VIP COMPETITOR"];
    const sponsors: string[] = Array.isArray(body.sponsors) && body.sponsors.length ? body.sponsors : ["Subsonic Society"];
    const image = typeof body.image === "string" && body.image ? body.image : "/images/SS-RWB-LOGO.png";
    const actionPhoto = typeof body.actionPhoto === "string" && body.actionPhoto ? body.actionPhoto : image;

    // ── 3. Shooter profile ─────────────────────────────────────────
    const shooter: ShooterProfile = {
      id: shooterId,
      name: fullName,
      callsign,
      pin: pinHash,
      division,
      ranking: String(body.ranking || "").trim() || `${division} Competitor`,
      homeRange,
      podiums: Number(body.podiums) || 0,
      featuredMatch: "Subsonic Society Invitational 2026",
      image,
      actionPhoto,
      quote: "",
      accolades,
      sponsors,
      interview: [],
      createdAt: now,
      status: "PUBLISHED",
    };
    await saveShooterToStorageAsync(shooter);
    createdShooterId = shooter.id;

    // ── 4. Linked member record ────────────────────────────────────
    const member: SocietyMember = {
      member_id: `SS-PRO-${callsign}`,
      full_name: fullName,
      callsign,
      email: typeof body.email === "string" && body.email.includes("@") ? body.email.trim().toLowerCase() : "",
      state: typeof body.state === "string" && body.state ? body.state : "TN",
      experience_level: division,
      rifle_setup: "",
      interests: ["Competition", "PRS Rimfire"],
      created_at: now,
      status: "ACTIVE",
      role: "MEMBER",
      notes: `Onboarded via invite ${code}. Home range: ${homeRange}. Podiums: ${shooter.podiums}. Profile: /shooters/${shooter.id}`,
      pin: pinHash,
    };
    const savedMember = await addOrUpdateMemberAsync(member);
    createdMemberId = savedMember.member_id;

    // ── 5. Claim the invite ────────────────────────────────────────
    {
      const usedCount = (invite.usedCount || 0) + 1;
      const claimedBy = Array.from(new Set([...(invite.claimedBy || []), callsign]));
      await saveInviteAsync({
        ...invite,
        usedCount,
        claimedBy,
        status: usedCount >= invite.maxUses ? "EXHAUSTED" : invite.status,
      });
    }

    const { pin: _omit, ...publicShooter } = shooter;
    return NextResponse.json({
      success: true,
      shooter: publicShooter,
      member: {
        member_id: savedMember.member_id,
        full_name: savedMember.full_name,
        callsign: savedMember.callsign,
        state: savedMember.state,
        experience_level: savedMember.experience_level,
        created_at: savedMember.created_at,
      },
      profileUrl: `/shooters/${shooter.id}`,
    });
  } catch (err: any) {
    console.error("Onboarding failed:", err);
    // Roll back anything already created so the member can simply try again
    try {
      if (createdMemberId) await deleteMemberFromStorageAsync(createdMemberId);
      if (createdShooterId) await deleteShooterFromStorageAsync(createdShooterId);
    } catch (rollbackErr) {
      console.error("Onboarding rollback error:", rollbackErr);
    }
    return fail(
      "We couldn't finish creating your profile. Nothing was saved — please try again in a moment.",
      500,
      "ONBOARD_FAILED",
      err?.message
    );
  }
}

function fail(error: string, status: number, code: string, detail?: string) {
  return NextResponse.json({ error, code, ...(detail ? { detail } : {}) }, { status });
}
