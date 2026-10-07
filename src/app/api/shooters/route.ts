import { NextRequest, NextResponse } from "next/server";
import { ShooterProfile } from "@/lib/types";
import { 
  getShootersFromStorage, 
  saveShooterToStorageAsync, 
  getShooterBySlug,
  deleteShooterFromStorageAsync,
  refreshShootersFromDb,
  SEED_SHOOTERS,
} from "@/lib/shooters";
import { refreshMembersFromDb, getMembersFromStorage, addOrUpdateMemberAsync } from "@/lib/members";

/** Never send PIN hashes to the browser. */
function publicShooter<T extends { pin?: unknown }>(s: T): T {
  const { pin, ...rest } = s as any;
  return rest as T;
}
import { checkCallsignAvailability } from "@/lib/callsigns";
import { hashPin, isHashedPin } from "@/lib/pin-hash";
import { validatePin } from "@/lib/pin-policy";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await Promise.all([refreshShootersFromDb(), refreshMembersFromDb()]);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");
    const targetParam = searchParams.get("target");
    const callsignParam = searchParams.get("callsign");

    const shooters = getShootersFromStorage();
    const members = getMembersFromStorage();

    // Synthesize registered members into shooter list so any competitor appears in directory & chat
    const shooterCallsigns = new Set(shooters.map((s) => (s.callsign || "").toUpperCase()));
    const allShooters: ShooterProfile[] = [...shooters];

    for (const m of members) {
      const call = (m.callsign || "").toUpperCase();
      const name = (m.full_name || "").toUpperCase();
      // Exclude non-shooters (Rob Neilson / RADAR / Master Owner) and test accounts (John Doe)
      if (
        call === "RADAR" ||
        call === "ROB" ||
        call === "LTDAN" ||
        m.role === "MASTER_OWNER" ||
        name.includes("ROB NEILSON") ||
        name.includes("JOHN DOE") ||
        call === "DOE" ||
        call === "JOHNDOE"
      ) {
        continue;
      }
      if (!call || shooterCallsigns.has(call)) continue;
      const isOwner = call === "SUBX" || call === "ALLEN" || m.role === "OWNER_ADMIN";
      allShooters.push({
        id: `shooter_${m.member_id || call.toLowerCase()}`,
        name: m.full_name || call,
        callsign: m.callsign || call,
        division: isOwner ? "Owner Admin / Executive" : (m.experience_level || "Society Member"),
        ranking: isOwner ? "Founder • Subsonic Society" : "Verified Competitor",
        homeRange: m.state ? `${m.state} Home Range` : "The Hideout, Bristol, TN",
        podiums: 0,
        image: "/images/SS-RWB-LOGO.png",
        quote: "Precision rimfire competitor.",
        accolades: isOwner ? ["FOUNDER", "OWNER ADMIN"] : ["COMPETITOR"],
        sponsors: ["Subsonic Society"],
        rifleSetup: {
          action: m.rifle_setup || "Precision Rimfire",
          optic: "Precision Optic",
        },
        createdAt: m.created_at || new Date().toISOString(),
        status: "PUBLISHED",
      });
      shooterCallsigns.add(call);
    }

    // Filter out any occurrences of Rob Neilson or John Doe from shooters
    const cleanShooters = allShooters.filter((s) => {
      const name = (s.name || "").toUpperCase();
      const call = (s.callsign || "").toUpperCase();
      const id = (s.id || "").toLowerCase();
      return (
        !name.includes("ROB NEILSON") &&
        call !== "RADAR" &&
        call !== "ROB" &&
        call !== "LTDAN" &&
        id !== "rob-neilson" &&
        id !== "radar" &&
        !name.includes("JOHN DOE") &&
        call !== "DOE" &&
        call !== "JOHNDOE" &&
        id !== "john-doe" &&
        id !== "johndoe"
      );
    });

    if (id || slug || targetParam || callsignParam) {
      const target = (id || slug || targetParam || callsignParam || "").toLowerCase();
      let shooter = cleanShooters.find(
        (s) =>
          (s.id && s.id.toLowerCase() === target) ||
          (s.callsign && s.callsign.toLowerCase() === target)
      );

      // If targeted lookup is for site executive Rob / RADAR, retrieve profile
      if (!shooter && (target === "radar" || target === "rob" || target === "ltdan" || target === "rob-neilson")) {
        const robMember = members.find(
          (m) => m.member_id === "SS-2026-0001" || m.callsign?.toUpperCase() === "RADAR" || m.callsign?.toUpperCase() === "ROB"
        );
        const existingRadarShooter = shooters.find(
          (s) => s.id?.toLowerCase() === "radar" || s.callsign?.toUpperCase() === "RADAR"
        );
        shooter = existingRadarShooter || {
          id: "radar",
          name: robMember?.full_name || "Rob Neilson",
          callsign: "RADAR",
          division: "Lead Developer & Tech Advisor",
          ranking: "Owner • Lead Systems Developer",
          homeRange: "The Hideout, Bristol, TN",
          podiums: 0,
          image: "/images/SS-RWB-LOGO.png",
          actionPhoto: "/images/SS-RWB-LOGO.png",
          quote: "Architecture, precision optics, and sub-MOA reliability on the digital ridge.",
          accolades: ["DEV ADVISOR", "MASTER OWNER", "SYSTEM ARCHITECT"],
          sponsors: ["Subsonic Society"],
          rifleSetup: {
            action: robMember?.rifle_setup || "Smart Systems Integrations",
            optic: "Zero Compromise Optic",
          },
          createdAt: robMember?.created_at || "2026-07-04T12:00:00Z",
          status: "PUBLISHED",
        };
      }

      if (!shooter) {
        return NextResponse.json({ error: "Shooter not found" }, { status: 404 });
      }
      return NextResponse.json({ shooter: publicShooter(shooter) });
    }

    return NextResponse.json({ shooters: cleanShooters.map(publicShooter), count: cleanShooters.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await Promise.all([refreshShootersFromDb(), refreshMembersFromDb()]);

    if (!body.name || !body.callsign) {
      return NextResponse.json({ error: "Name and callsign are required" }, { status: 400 });
    }

    const candidateCallsign = body.callsign.trim().toUpperCase();
    const isRob =
      candidateCallsign === "RADAR" ||
      candidateCallsign === "ROB" ||
      candidateCallsign === "LTDAN" ||
      (body.id && (body.id.toLowerCase() === "radar" || body.id.toLowerCase() === "rob-neilson" || body.id.toLowerCase() === "ss-2026-0001")) ||
      (body.name && body.name.toLowerCase().includes("neilson"));

    const isAllen =
      candidateCallsign === "SUBX" ||
      candidateCallsign === "ALLEN" ||
      candidateCallsign === "HURLEY" ||
      (body.id && (body.id.toLowerCase() === "subx" || body.id.toLowerCase() === "allen" || body.id.toLowerCase() === "ss-2026-0002")) ||
      (body.name && body.name.toLowerCase().includes("hurley"));

    const isExec = isRob || isAllen;

    const existingShooter =
      getShootersFromStorage().find(
        (s) =>
          (body.id && s.id?.toLowerCase() === body.id.toLowerCase()) ||
          (s.callsign && s.callsign.toUpperCase() === candidateCallsign) ||
          (isRob && (s.id === "radar" || s.callsign?.toUpperCase() === "RADAR" || s.callsign?.toUpperCase() === "ROB")) ||
          (isAllen && (s.id === "subx" || s.callsign?.toUpperCase() === "SUBX" || s.callsign?.toUpperCase() === "ALLEN"))
      ) ||
      SEED_SHOOTERS.find(
        (s) =>
          (body.id && s.id?.toLowerCase() === body.id.toLowerCase()) ||
          (s.callsign && s.callsign.toUpperCase() === candidateCallsign) ||
          (isRob && (s.id === "radar" || s.callsign?.toUpperCase() === "RADAR")) ||
          (isAllen && (s.id === "subx" || s.callsign?.toUpperCase() === "SUBX"))
      );

    // Require email, phone, and mailing address ONLY on explicit brand-new competitor intake registrations
    const isExplicitIntake = body.isIntake === true || body.source === "intake";
    if (isExplicitIntake && !existingShooter && !isExec) {
      if (!body.email || !String(body.email).includes("@") || !body.phone || !body.mailingAddress) {
        return NextResponse.json(
          { error: "Email address, phone number, and mailing address are required to complete shooter intake." },
          { status: 400 }
        );
      }
    }

    // PIN policy: new competitor profiles on explicit intake must use exactly 4 digits.
    // (Already-hashed PINs and edits to existing profiles are left untouched.)
    if (isExplicitIntake && !existingShooter && !isExec && body.pin && !isHashedPin(String(body.pin).trim())) {
      const pinError = validatePin(String(body.pin), "MEMBER");
      if (pinError) {
        return NextResponse.json({ error: pinError, code: "INVALID_PIN" }, { status: 400 });
      }
    }

    // Enforce uniqueness and provide suggestions if taken (bypass for site executives or if updating own profile)
    if (!isExec) {
      const callsignCheck = checkCallsignAvailability(candidateCallsign, {
        excludeMemberId: existingShooter ? existingShooter.id : (body.id || candidateCallsign),
      });

      if (
        !callsignCheck.isAvailable &&
        (!existingShooter || !existingShooter.callsign || existingShooter.callsign.toUpperCase() !== candidateCallsign)
      ) {
        return NextResponse.json(
          {
            error: callsignCheck.message,
            suggestions: callsignCheck.suggestions,
            code: "CALLSIGN_TAKEN",
          },
          { status: 409 }
        );
      }
    }

    // Auto-generate clean slug ID from callsign or name (or keep existing ID)
    const rawSlug = (body.id || body.callsign || body.name)
      .toLowerCase()
      .trim()
      .replace(/^ss-pro-/, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    
    const id = isRob
      ? "radar"
      : isAllen 
      ? "subx" 
      : existingShooter?.id || body.id || (rawSlug.length > 2 ? rawSlug : `shooter-${Date.now().toString(36)}`);

    // Parse accolades & sponsors if sent as comma-separated string or array
    const accolades = Array.isArray(body.accolades)
      ? body.accolades
      : typeof body.accolades === "string"
      ? body.accolades.split(",").map((s: string) => s.trim()).filter(Boolean)
      : existingShooter?.accolades || [];

    const sponsors = Array.isArray(body.sponsors)
      ? body.sponsors
      : typeof body.sponsors === "string"
      ? body.sponsors.split(",").map((s: string) => s.trim()).filter(Boolean)
      : existingShooter?.sponsors || [];

    let finalName = body.name.trim();
    if (finalName === "VIP Pro Competitor" || finalName === "Invitational Competitor VIP") {
      finalName = candidateCallsign || "TEST";
    }

    const newShooter: ShooterProfile = {
      id,
      name: finalName,
      callsign: candidateCallsign,
      // Blank PIN = keep the existing one (admin edits don't resend PINs)
      pin: body.pin && String(body.pin).trim()
        ? (isHashedPin(String(body.pin).trim()) ? String(body.pin).trim() : await hashPin(String(body.pin).trim()))
        : existingShooter?.pin,
      division: isRob
        ? "Lead Developer & Tech Advisor"
        : isAllen
        ? "Owner Admin / Executive"
        : (body.division || existingShooter?.division || "Open Division Pro"),
      ranking: isRob
        ? "Owner • Lead Systems Developer"
        : isAllen
        ? "Founder • Subsonic Society"
        : (body.ranking || existingShooter?.ranking || "Appalachian Rimfire Competitor"),
      homeRange: body.homeRange || existingShooter?.homeRange || "The Hideout, Bristol, TN",
      podiums: typeof body.podiums === "number" ? body.podiums : (existingShooter?.podiums || 0),
      email: body.email ? String(body.email).trim().toLowerCase() : existingShooter?.email,
      phone: body.phone ? String(body.phone).trim() : existingShooter?.phone,
      mailingAddress: body.mailingAddress ? String(body.mailingAddress).trim() : existingShooter?.mailingAddress,
      featuredMatch: body.featuredMatch || existingShooter?.featuredMatch || "Subsonic Society Invitational Money Match 2026",
      image: body.image || existingShooter?.image || "/images/SS-RWB-LOGO.png",
      actionPhoto: body.actionPhoto || existingShooter?.actionPhoto || body.image || "/images/SS-RWB-LOGO.png",
      posterImage: body.posterImage || existingShooter?.posterImage,
      quote: body.quote || existingShooter?.quote || "Precision rimfire in the Appalachian mountains requires absolute consistency and reading the true wind.",
      accolades: accolades.length > 0 ? accolades : ["COMPETITOR"],
      sponsors: sponsors.length > 0 ? sponsors : ["Subsonic Society"],
      rifleSetup: {
        action: body.rifleSetup?.action || body.action || existingShooter?.rifleSetup?.action || "Vudoo V-22 / Rimfire Action",
        barrel: body.rifleSetup?.barrel || body.barrel || existingShooter?.rifleSetup?.barrel || "20\" Match Contour (1:16)",
        trigger: body.rifleSetup?.trigger || body.trigger || existingShooter?.rifleSetup?.trigger || "Precision Match Trigger (6 oz)",
        chassis: body.rifleSetup?.chassis || body.chassis || existingShooter?.rifleSetup?.chassis || "Competition Stock / Chassis",
        optic: body.rifleSetup?.optic || body.optic || existingShooter?.rifleSetup?.optic || "Precision Scope with MOA/MIL Reticle",
        mount: body.rifleSetup?.mount || body.mount || existingShooter?.rifleSetup?.mount || "Heavy Duty Match Rings",
        tuner: body.rifleSetup?.tuner || body.tuner || existingShooter?.rifleSetup?.tuner || "Precision Rimfire Tuner",
        ammoLot: body.rifleSetup?.ammoLot || body.ammoLot || existingShooter?.rifleSetup?.ammoLot || "Lapua Center-X / SK Match",
      },
      interview: Array.isArray(body.interview) ? body.interview : (existingShooter?.interview || [
        {
          question: "What is your advice for precision rimfire matches in mountain wind?",
          answer: "Focus on solid position building, watch mirage boil, and commit fully to your wind hold without hesitating.",
        },
      ]),
      createdAt: existingShooter?.createdAt || new Date().toISOString(),
      status: "PUBLISHED",
    };

    await saveShooterToStorageAsync(newShooter);

    // Cross-sync to society_members so name, rifle build, and callsign match across both datastores
    try {
      const members = getMembersFromStorage();
      const existingMember = members.find(
        (m) =>
          (isRob && (m.member_id === "SS-2026-0001" || m.callsign === "RADAR" || m.callsign === "ROB" || m.callsign === "LTDAN")) ||
          (isAllen && (m.member_id === "SS-2026-0002" || m.callsign === "SUBX" || m.callsign === "ALLEN")) ||
          m.member_id === `SS-PRO-${candidateCallsign}` ||
          m.callsign?.toUpperCase() === candidateCallsign
      );

      if (existingMember) {
        const rifleSummary = newShooter.rifleSetup?.action
          ? `${newShooter.rifleSetup.action}${newShooter.rifleSetup.optic ? ` / ${newShooter.rifleSetup.optic}` : ""}`
          : existingMember.rifle_setup;

        await addOrUpdateMemberAsync({
          ...existingMember,
          full_name: newShooter.name,
          callsign: newShooter.callsign,
          rifle_setup: rifleSummary,
          experience_level: newShooter.division,
          role: isRob ? "MASTER_OWNER" : isAllen ? "OWNER_ADMIN" : existingMember.role,
        });
      }
    } catch (syncErr) {
      console.warn("Cross-syncing shooter to member failed:", syncErr);
    }

    return NextResponse.json({
      success: true,
      message: `Shooter profile for ${newShooter.name} (${newShooter.callsign}) saved successfully.`,
      shooter: publicShooter(newShooter),
      url: `/shooters/${newShooter.id}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body.id || body.callsign;
      } catch {}
    }

    if (!id) {
      return NextResponse.json({ error: "Shooter id is required" }, { status: 400 });
    }

    await refreshShootersFromDb();
    const deleted = await deleteShooterFromStorageAsync(id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Shooter not found or cannot delete founder profile." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      deleted_id: id,
      message: `Shooter profile for ${id} has been permanently deleted.`,
    });
  } catch (err: any) {
    console.error("Error deleting shooter profile:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
