import { NextRequest, NextResponse } from "next/server";
import { ShooterProfile } from "@/lib/types";
import { 
  getShootersFromStorage, 
  saveShooterToStorageAsync, 
  getShooterBySlug,
  deleteShooterFromStorageAsync,
  refreshShootersFromDb,
} from "@/lib/shooters";
import { refreshMembersFromDb } from "@/lib/members";

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
    await refreshShootersFromDb();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");

    const shooters = getShootersFromStorage();

    if (id || slug) {
      const target = id || slug || "";
      const shooter = getShooterBySlug(target);
      if (!shooter) {
        return NextResponse.json({ error: "Shooter not found" }, { status: 404 });
      }
      return NextResponse.json({ shooter: publicShooter(shooter) });
    }

    return NextResponse.json({ shooters: shooters.map(publicShooter), count: shooters.length });
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
    const existingShooter = getShootersFromStorage().find(
      (s) => s.id.toLowerCase() === (body.id || "").toLowerCase()
    );

    // PIN policy: new competitor profiles must use exactly 4 digits.
    // (Already-hashed PINs and edits to existing profiles are left untouched.)
    if (!existingShooter && body.pin && !isHashedPin(String(body.pin).trim())) {
      const pinError = validatePin(String(body.pin), "MEMBER");
      if (pinError) {
        return NextResponse.json({ error: pinError, code: "INVALID_PIN" }, { status: 400 });
      }
    }

    // Enforce uniqueness and provide suggestions if taken
    const callsignCheck = checkCallsignAvailability(candidateCallsign, {
      excludeMemberId: existingShooter ? existingShooter.id : undefined,
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

    // Auto-generate clean slug ID from callsign or name
    const rawSlug = (body.callsign || body.name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    
    const id = body.id || (rawSlug.length > 2 ? rawSlug : `shooter-${Date.now().toString(36)}`);

    // Parse accolades & sponsors if sent as comma-separated string or array
    const accolades = Array.isArray(body.accolades)
      ? body.accolades
      : typeof body.accolades === "string"
      ? body.accolades.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];

    const sponsors = Array.isArray(body.sponsors)
      ? body.sponsors
      : typeof body.sponsors === "string"
      ? body.sponsors.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];

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
      division: body.division || "Open Division Pro",
      ranking: body.ranking || "Appalachian Rimfire Competitor",
      homeRange: body.homeRange || "The Hideout, Bristol, TN",
      podiums: typeof body.podiums === "number" ? body.podiums : parseInt(body.podiums, 10) || 0,
      featuredMatch: body.featuredMatch || "Subsonic Society Invitational 2026",
      image: body.image || "/images/SS-RWB-LOGO.png",
      actionPhoto: body.actionPhoto || body.image || "/images/SS-RWB-LOGO.png",
      quote: body.quote || "Precision rimfire in the Appalachian mountains requires absolute consistency and reading the true wind.",
      accolades: accolades.length > 0 ? accolades : ["COMPETITOR"],
      sponsors: sponsors.length > 0 ? sponsors : ["Subsonic Society"],
      rifleSetup: {
        action: body.rifleSetup?.action || body.action || "Vudoo V-22 / Rimfire Action",
        barrel: body.rifleSetup?.barrel || body.barrel || "20\" Match Contour (1:16)",
        trigger: body.rifleSetup?.trigger || body.trigger || "Precision Match Trigger (6 oz)",
        chassis: body.rifleSetup?.chassis || body.chassis || "Competition Stock / Chassis",
        optic: body.rifleSetup?.optic || body.optic || "Precision Scope with MOA/MIL Reticle",
        mount: body.rifleSetup?.mount || body.mount || "Heavy Duty Match Rings",
        tuner: body.rifleSetup?.tuner || body.tuner || "Precision Rimfire Tuner",
        ammoLot: body.rifleSetup?.ammoLot || body.ammoLot || "Lapua Center-X / SK Match",
      },
      interview: Array.isArray(body.interview) ? body.interview : [
        {
          question: "What is your advice for precision rimfire matches in mountain wind?",
          answer: "Focus on solid position building, watch mirage boil, and commit fully to your wind hold without hesitating.",
        },
      ],
      createdAt: new Date().toISOString(),
      status: "PUBLISHED",
    };

    await saveShooterToStorageAsync(newShooter);

    return NextResponse.json({
      success: true,
      message: `Shooter profile for ${newShooter.name} (${newShooter.callsign}) created successfully.`,
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
