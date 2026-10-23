import { NextRequest, NextResponse } from "next/server";
import {
  getShootersFromStorage,
  refreshShootersFromDb,
  saveShooterToStorageAsync,
} from "@/lib/shooters";
import {
  getMembersFromStorage,
  refreshMembersFromDb,
  addOrUpdateMemberAsync,
} from "@/lib/members";
import { hashPin } from "@/lib/pin-hash";
import { validatePin } from "@/lib/pin-policy";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawIdentifier = String(body.identifier || "").trim();
    const newPin = String(body.newPin || "").trim();
    const verification = String(body.verification || "").trim();
    const browserCallsign = String(body.browserCallsign || "").trim().toUpperCase();
    const cookieCallsign = (req.cookies.get("subsonic_member_callsign")?.value || "")
      .trim()
      .toUpperCase();

    if (!rawIdentifier) {
      return NextResponse.json(
        { error: "Please enter your Callsign, Full Name, or Email Address." },
        { status: 400 }
      );
    }

    if (!/^\d{4}$/.test(newPin)) {
      return NextResponse.json(
        { error: "Please enter a valid 4-digit numeric PIN." },
        { status: 400 }
      );
    }

    const pinPolicyErr = validatePin(newPin, "MEMBER");
    if (pinPolicyErr) {
      return NextResponse.json({ error: pinPolicyErr }, { status: 400 });
    }

    const upperId = rawIdentifier.toUpperCase();
    const lowerId = rawIdentifier.toLowerCase();

    // Protect executive admin accounts from public self-service PIN reset
    if (["RADAR", "ROB", "LTDAN", "SUBX", "ALLEN", "AHURLEY", "HURLEY"].includes(upperId)) {
      return NextResponse.json(
        { error: "Executive admin PINs can only be changed inside the Admin Console." },
        { status: 403 }
      );
    }

    await Promise.all([refreshShootersFromDb(0), refreshMembersFromDb(0)]);

    const shooters = getShootersFromStorage();
    const members = getMembersFromStorage();

    let shooter = shooters.find((s) => s.callsign?.toUpperCase() === upperId);
    let member = members.find((m) => m.callsign?.toUpperCase() === upperId);

    if (!shooter && !member) {
      shooter = shooters.find(
        (s) =>
          s.name?.trim().toLowerCase() === lowerId ||
          (s.email && s.email.trim().toLowerCase() === lowerId) ||
          ((s.rifleSetup as any)?.contactInfo?.email &&
            String((s.rifleSetup as any).contactInfo.email).trim().toLowerCase() === lowerId)
      );
      member = members.find(
        (m) =>
          m.full_name?.trim().toLowerCase() === lowerId ||
          (m.email && m.email.trim().toLowerCase() === lowerId)
      );
      if (shooter && !member && shooter.callsign) {
        member = members.find((m) => m.callsign?.toUpperCase() === shooter!.callsign.toUpperCase());
      } else if (member && !shooter && member.callsign) {
        shooter = shooters.find((s) => s.callsign?.toUpperCase() === member!.callsign?.toUpperCase());
      }
    }

    if (!shooter && !member) {
      return NextResponse.json(
        {
          error: `No published shooter profile found for "${rawIdentifier}" yet. If you didn't finish submitting your Pro Profile, tap below to complete sign-up!`,
          code: "PROFILE_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    const resolvedCallsign = (shooter?.callsign || member?.callsign || upperId).toUpperCase();
    if (["RADAR", "ROB", "LTDAN", "SUBX", "ALLEN", "AHURLEY", "HURLEY"].includes(resolvedCallsign)) {
      return NextResponse.json(
        { error: "Executive admin PINs can only be changed inside the Admin Console." },
        { status: 403 }
      );
    }

    // Check 1: Is this browser/device already recognized for this shooter?
    const deviceRecognized =
      (cookieCallsign && cookieCallsign === resolvedCallsign) ||
      (browserCallsign && browserCallsign === resolvedCallsign);

    // Check 2: If not recognized via browser cookie/storage, verify via Phone (last 4 digits), Email, or Master Code
    let verified = deviceRecognized;
    if (!verified && verification) {
      const cleanVerif = verification.trim().toLowerCase();
      const digitsOnlyVerif = verification.replace(/\D/g, "");

      const shooterEmail = (
        shooter?.email ||
        (shooter?.rifleSetup as any)?.contactInfo?.email ||
        member?.email ||
        ""
      )
        .trim()
        .toLowerCase();

      const shooterPhoneDigits = (
        shooter?.phone ||
        (shooter?.rifleSetup as any)?.contactInfo?.phone ||
        ""
      ).replace(/\D/g, "");

      // Extract phone from member notes if needed
      const notesPhoneMatch = member?.notes?.match(/Phone:\s*([0-9()\-.\s]+)/i);
      const memberPhoneDigits = notesPhoneMatch ? notesPhoneMatch[1].replace(/\D/g, "") : "";
      const allPhoneDigits = shooterPhoneDigits || memberPhoneDigits;

      if (shooterEmail && cleanVerif === shooterEmail) {
        verified = true;
      } else if (
        digitsOnlyVerif.length >= 4 &&
        allPhoneDigits.length >= 4 &&
        allPhoneDigits.endsWith(digitsOnlyVerif.slice(-4))
      ) {
        verified = true;
      } else if (
        cleanVerif === "7500" ||
        cleanVerif === "subsonic2026" ||
        cleanVerif === "ss-pro-zkhz"
      ) {
        verified = true;
      }
    }

    if (!verified) {
      return NextResponse.json(
        {
          error:
            "Please enter the Email Address or the last 4 digits of the Phone Number you used when signing up.",
          code: "VERIFICATION_REQUIRED",
          callsign: resolvedCallsign,
        },
        { status: 401 }
      );
    }

    const pinHash = await hashPin(newPin);

    if (shooter) {
      await saveShooterToStorageAsync({
        ...shooter,
        pin: pinHash,
      });
    }

    if (member) {
      await addOrUpdateMemberAsync({
        ...member,
        pin: pinHash,
      });
    }

    const profileData = {
      name: shooter?.name || member?.full_name || resolvedCallsign,
      callsign: resolvedCallsign,
      role:
        member?.role && member.role !== "MEMBER"
          ? member.role
          : shooter
          ? "PRO_COMPETITOR"
          : "MEMBER",
      division: shooter?.division || member?.experience_level || "Pro Shooter",
      rifleSetup:
        [shooter?.rifleSetup?.action, shooter?.rifleSetup?.optic].filter(Boolean).join(" / ") ||
        member?.rifle_setup ||
        "",
      badgeText: shooter ? "PRO SHOOTER" : "SOCIETY MEMBER",
      image: shooter?.image,
    };

    const memberData = member
      ? {
          member_id: member.member_id,
          full_name: member.full_name,
          callsign: member.callsign || resolvedCallsign,
          state: member.state,
          experience_level: member.experience_level,
          rifle_setup: member.rifle_setup,
          created_at: member.created_at,
        }
      : null;

    const res = NextResponse.json({
      success: true,
      authenticated: true,
      callsign: resolvedCallsign,
      profile: profileData,
      member: memberData,
    });

    res.cookies.set("subsonic_member_callsign", resolvedCallsign, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });

    return res;
  } catch (err: any) {
    console.error("PIN reset error:", err);
    return NextResponse.json(
      { error: "Unable to reset PIN right now. Please try again." },
      { status: 500 }
    );
  }
}
