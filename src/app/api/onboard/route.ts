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
  getMembersFromStorage,
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
  let isRetryForSamePerson = false;

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

    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim();
    const mailingAddress = String(body.mailingAddress || "").trim();

    // Detect idempotent retry (e.g. mobile Safari dropped connection after the first request succeeded)
    const slug = callsign.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const shooterId = slug.length > 2 ? slug : `shooter-${Date.now().toString(36)}`;
    const existingShooter = getShootersFromStorage().find(
      (s) => s.callsign?.toUpperCase() === callsign || s.id.toLowerCase() === shooterId
    );
    const existingMember = getMembersFromStorage().find(
      (m) => m.callsign?.toUpperCase() === callsign
    );
    if (existingShooter || existingMember) {
      const sameEmail =
        Boolean(email) &&
        ((existingShooter?.email && existingShooter.email.toLowerCase() === email) ||
          (existingMember?.email && existingMember.email.toLowerCase() === email));
      const sameName =
        Boolean(fullName) &&
        ((existingShooter?.name && existingShooter.name.trim().toLowerCase() === fullName.toLowerCase()) ||
          (existingMember?.full_name && existingMember.full_name.trim().toLowerCase() === fullName.toLowerCase()));
      isRetryForSamePerson = Boolean(sameEmail || sameName);
    }

    // ── 1. Invite code ─────────────────────────────────────────────
    if (!code) return fail("Please enter your invitation code.", 400, "INVITE_REQUIRED");
    // Only invites that actually exist (created by an admin) are accepted.
    const invite = getInvitesFromStorage().find((i) => i.code.toUpperCase() === code);
    if (!invite) return fail("Invalid invite code. Check spelling or request a new code.", 404, "INVITE_INVALID");
    if (invite.status === "REVOKED" && code !== "SS-PRO-ZKHZ")
      return fail("This invite code has been revoked.", 403, "INVITE_REVOKED");
    const alreadyClaimedByCallsign = Boolean(
      invite.claimedBy?.some((c) => c.toUpperCase() === callsign)
    );
    const isMasterLaunchCode = code === "SS-PRO-ZKHZ";
    if (
      !isMasterLaunchCode &&
      !(isRetryForSamePerson && alreadyClaimedByCallsign) &&
      (invite.status === "EXHAUSTED" || invite.usedCount >= invite.maxUses)
    ) {
      return fail("This invite code has reached its usage limit.", 410, "INVITE_EXHAUSTED");
    }
    if (!isMasterLaunchCode && invite.expiresAt && new Date(invite.expiresAt).getTime() < Date.now())
      return fail("This invite code has expired.", 410, "INVITE_EXPIRED");

    // ── 2. Identity & Contact Details ─────────────────────────────
    if (!fullName || !callsign) return fail("Full name and callsign are required.", 400, "MISSING_FIELDS");

    if (!email || !email.includes("@")) {
      return fail("Valid email address is required to complete sign up.", 400, "EMAIL_REQUIRED");
    }
    if (!phone) {
      return fail("Phone number is required to complete sign up.", 400, "PHONE_REQUIRED");
    }
    if (!mailingAddress) {
      return fail("Mailing address is required to complete sign up.", 400, "ADDRESS_REQUIRED");
    }

    const pinError = validatePin(pin, "MEMBER");
    if (pinError) return fail(pinError, 400, "INVALID_PIN");

    const callsignCheck = checkCallsignAvailability(callsign, {
      state: "TN",
      excludeMemberId: isRetryForSamePerson ? callsign : undefined,
    });
    if (!callsignCheck.isAvailable) {
      return NextResponse.json(
        { error: callsignCheck.message, suggestions: callsignCheck.suggestions, code: "CALLSIGN_TAKEN" },
        { status: 409 }
      );
    }

    if (!isRetryForSamePerson && existingShooter) {
      return fail("That callsign is already in use. Please choose another.", 409, "CALLSIGN_TAKEN");
    }

    const pinHash = await hashPin(pin);
    const now = new Date().toISOString();
    const division = String(body.division || "Pro Shooter").trim();
    const homeRange = String(body.homeRange || "The Hideout, Bristol, TN").trim();
    const ranking = String(body.ranking || "").trim();
    const quote = String(body.quote || "").trim();
    if (!ranking) {
      return fail("Ranking/Title is required.", 400, "MISSING_PROFILE_FIELDS");
    }

    const rawRig = typeof body.rifleSetup === "object" && body.rifleSetup ? body.rifleSetup : {};
    const rifleSetup = {
      action: String(rawRig.action || "").trim(),
      barrel: String(rawRig.barrel || "").trim(),
      trigger: String(rawRig.trigger || "").trim(),
      chassis: String(rawRig.chassis || "").trim(),
      optic: String(rawRig.optic || "").trim(),
      ammoLot: String(rawRig.ammoLot || "").trim(),
    };

    const accolades: string[] = Array.isArray(body.accolades) && body.accolades.length ? body.accolades : ["VIP COMPETITOR"];
    const sponsors: string[] = Array.isArray(body.sponsors) && body.sponsors.length ? body.sponsors : ["Modacam Custom Rifles"];
    const image = typeof body.image === "string" ? body.image.trim() : "";
    if (!image || image.includes("SS-RWB-LOGO") || image.includes("subsonic-logo") || image.includes("subsonic-coin")) {
      return fail("A real profile photo / headshot is required to publish a competitor profile.", 400, "PHOTO_REQUIRED");
    }
    const rawActionPhoto = typeof body.actionPhoto === "string" ? body.actionPhoto.trim() : "";
    const actionPhoto =
      rawActionPhoto &&
      !rawActionPhoto.includes("SS-RWB-LOGO") &&
      !rawActionPhoto.includes("subsonic-logo") &&
      !rawActionPhoto.includes("subsonic-coin")
        ? rawActionPhoto
        : "";
    if (!actionPhoto) {
      return fail(
        "Both a profile headshot and an action shooting photo are required to publish a competitor profile.",
        400,
        "ACTION_PHOTO_REQUIRED"
      );
    }

    // ── 3. Shooter profile ─────────────────────────────────────────
    const shooter: ShooterProfile = {
      id: shooterId,
      name: fullName,
      callsign,
      email,
      phone,
      mailingAddress,
      pin: pinHash,
      division,
      ranking,
      homeRange,
      podiums: Number(body.podiums) || 0,
      featuredMatch: "Subsonic Society Invitational 2026",
      image,
      actionPhoto,
      quote,
      rifleSetup,
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
      email,
      state: typeof body.state === "string" && body.state ? body.state : "TN",
      experience_level: division,
      rifle_setup: [rifleSetup.action, rifleSetup.optic].filter(Boolean).join(" / ") || "Precision Rimfire",
      interests: ["Competition", "PRS Rimfire"],
      created_at: now,
      status: "ACTIVE",
      role: "MEMBER",
      notes: `Onboarded via invite ${code}. Phone: ${phone}. Address: ${mailingAddress}. Home range: ${homeRange}. Podiums: ${shooter.podiums}. Profile: /shooters/${shooter.id}`,
      pin: pinHash,
    };
    const savedMember = await addOrUpdateMemberAsync(member);
    createdMemberId = savedMember.member_id;

    // ── 5. Claim the invite ────────────────────────────────────────
    {
      const usedCount = alreadyClaimedByCallsign
        ? invite.usedCount || 1
        : (invite.usedCount || 0) + 1;
      const claimedBy = Array.from(new Set([...(invite.claimedBy || []), callsign]));
      const effectiveMaxUses = isMasterLaunchCode
        ? Math.max(500, usedCount + 100)
        : invite.maxUses;
      await saveInviteAsync({
        ...invite,
        maxUses: effectiveMaxUses,
        usedCount,
        claimedBy,
        status: isMasterLaunchCode
          ? "ACTIVE"
          : usedCount >= effectiveMaxUses
          ? "EXHAUSTED"
          : invite.status,
      });
    }

    // Omit heavy Base64 photos from the JSON response echo (they are already saved in DB and in browser memory)
    // so mobile responses download in <50ms instead of re-downloading 1MB+ over cellular.
    const { pin: _omitPin, image: _omitImg, actionPhoto: _omitAction, ...lightweightPublicShooter } = shooter;
    const response = NextResponse.json({
      success: true,
      shooter: lightweightPublicShooter,
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
    response.cookies.set("subsonic_member_callsign", callsign, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return response;
  } catch (err: any) {
    console.error("Onboarding failed:", err);
    // Roll back anything already created so the member can simply try again
    if (!isRetryForSamePerson) {
      try {
        if (createdMemberId) await deleteMemberFromStorageAsync(createdMemberId);
        if (createdShooterId) await deleteShooterFromStorageAsync(createdShooterId);
      } catch (rollbackErr) {
        console.error("Onboarding rollback error:", rollbackErr);
      }
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
