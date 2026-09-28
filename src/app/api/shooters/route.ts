import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { ShooterProfile } from "@/lib/types";

export const dynamic = "force-dynamic";

const DATA_DIR = path.join(process.cwd(), "data");
const SHOOTERS_FILE = path.join(DATA_DIR, "shooters.jsonl");

const SEED_SHOOTERS: ShooterProfile[] = [
  {
    id: "wyatt-sterling",
    name: "Wyatt 'Ghost' Sterling",
    callsign: "GHOST",
    division: "Open Division Pro",
    ranking: "National Rank #4 • Appalachian Cup 1st Place",
    homeRange: "Holston Range, Bristol, TN",
    podiums: 14,
    featuredMatch: "The Subsonic Society Invitational 2026",
    image: "/assets/subsonic-coin.jpg",
    actionPhoto: "/assets/subsonic-coin.jpg",
    quote: "In the Bristol mountains, the wind never blows the same way two seconds in a row. You have to trust your bubble level, watch the trees along the hollow, and commit to the shot.",
    accolades: ["TEAM USA 🇺🇸", "NATIONAL RANK #4", "APPALACHIAN CUP 1ST"],
    sponsors: ["Modacam Custom Rifles", "Vudoo Gun Works", "Lapua", "ZCO", "MDT"],
    rifleSetup: {
      action: "Vudoo Gun Works V-22 (3-Lug Rimfire)",
      barrel: "Bartlein MTU 20\" Match (1:16 Twist)",
      trigger: "Bix'n Andy TacSport PRO (4.2 oz)",
      chassis: "MDT ACC Elite Chassis with Titanium Weights",
      optic: "Zero Compromise Optic ZC527 MPCT3X",
      mount: "Spuhr QDP-4002 0 MOA with Level",
      tuner: "Harrell Precision Custom Rimfire Tuner",
      ammoLot: "Lapua Center-X Lot #32187 (1,062 FPS)",
    },
    interview: [
      {
        question: "How do you read mirage on targets past 300 yards in the Tennessee high country?",
        answer: "I back my magnification down from 25x to around 16x. High mag over-exaggerates boiling heat shimmer and makes the steel dance. By backing off, I can see the horizontal boil direction clearly and hold the true center of the plate."
      },
      {
        question: "What is your pre-match lot testing routine?",
        answer: "I clean down to bare metal with Bore Tech Rimfire Blend, shoot 30 rounds of the test lot to season the wax lubricant in the bore, and then fire three consecutive 10-shot groups through a Garmin Xero chronograph. If the SD is over 6 fps, it becomes practice ammo."
      }
    ],
    createdAt: "2026-08-01T12:00:00Z",
    status: "PUBLISHED",
  },
  {
    id: "kendra-cross",
    name: "Kendra 'Coldbore' Cross",
    callsign: "COLDBORE",
    division: "Open Rimfire Pro",
    ranking: "Southeast Regional Champion • Top Lady Marksman",
    homeRange: "Smoky Mountain Precision, TN",
    podiums: 19,
    featuredMatch: "300X Long Gong Challenge",
    image: "/assets/subsonic-logo-dark.png",
    actionPhoto: "/assets/subsonic-coin.jpg",
    quote: "Subsonic rimfire is pure shooting discipline. Without recoil to mask your flaws, every breath and trigger press is written directly onto the steel plate.",
    accolades: ["TOP LADY MARKSMAN 🥇", "SOUTHEAST CHAMPION", "19 PODIUMS"],
    sponsors: ["Modacam Custom Rifles", "RimX", "Tangent Theta", "Foundation Stocks"],
    rifleSetup: {
      action: "Zermatt RimX Precision Rimfire Action",
      barrel: "Proof Research Competition Contour 22\"",
      trigger: "TriggerTech Diamond Single-Stage (6 oz)",
      chassis: "Foundation Revelation Heavy Stock (Dark Distressed)",
      optic: "Tangent Theta TT525P Gen 3XR",
      mount: "Hawkins Precision Ultra Light Tactical",
      tuner: "Harrell Harmonic Tuner",
      ammoLot: "SK Long Range Match Lot #8821 (1,055 FPS)",
    },
    interview: [
      {
        question: "What is your mindset when shooting in sudden wind shifts?",
        answer: "Trust the DOPE and make decisive calls. A quick, committed hold is ten times better than second-guessing while the wind flag flips."
      }
    ],
    createdAt: "2026-08-15T12:00:00Z",
    status: "PUBLISHED",
  },
  {
    id: "eli-mcallister",
    name: "Eli 'Dialed' McAllister",
    callsign: "DIALED",
    division: "Production Division",
    ranking: "Appalachian Cup Production 1st",
    homeRange: "Tri-Cities Rimfire Club, Bristol, TN",
    podiums: 8,
    featuredMatch: "200X Mountain Match",
    image: "/assets/subsonic-logo-round.png",
    actionPhoto: "/assets/subsonic-coin.jpg",
    quote: "You don't need a $10,000 custom rig to win if you master stage timing, barricade stability, and find a lot of ammunition your factory barrel loves.",
    accolades: ["PRODUCTION CLASS 1ST", "8 PODIUMS", "FACTORY CZ CHAMPION"],
    sponsors: ["Vortex Optics", "MDT", "SK Ammunition"],
    rifleSetup: {
      action: "CZ 457 MTR (Match Target Rifle Factory Tuned)",
      barrel: "Factory 20.5\" Match Chamber Cold Hammer Forged",
      trigger: "Yo-Dave Spring Mod (12 oz)",
      chassis: "MDT XRS Hybrid Chassis",
      optic: "Vortex Razor HD Gen III 6-36x56 EBR-7D",
      mount: "Seekins Precision Match Rings",
      tuner: "None (Production Spec)",
      ammoLot: "SK Rifle Match Lot #4412 (1,051 FPS)",
    },
    interview: [
      {
        question: "What is your secret to out-shooting custom rifles with a factory CZ 457?",
        answer: "I spent all my money on ammo lots instead of titanium actions. I tested 14 different lots of SK and Lapua until I found one that shot 0.28 MOA at 100 yards. The rifle doesn't know how much it costs; it only knows how true the bullet is."
      }
    ],
    createdAt: "2026-08-20T12:00:00Z",
    status: "PUBLISHED",
  }
];

function getShootersFromStorage(): ShooterProfile[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    let fileShooters: ShooterProfile[] = [];
    if (fs.existsSync(SHOOTERS_FILE)) {
      const raw = fs.readFileSync(SHOOTERS_FILE, "utf-8");
      const lines = raw.split("\n").filter((l) => l.trim().length > 0);
      fileShooters = lines
        .map((l) => {
          try {
            return JSON.parse(l) as ShooterProfile;
          } catch {
            return null;
          }
        })
        .filter((s): s is ShooterProfile => s !== null);
    }

    const map = new Map<string, ShooterProfile>();
    // 1. Seed baseline
    for (const seed of SEED_SHOOTERS) {
      map.set(seed.id, seed);
    }
    // 2. Overlay file items
    for (const fsItem of fileShooters) {
      map.set(fsItem.id, fsItem);
    }

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (err) {
    console.error("Error reading shooters data:", err);
    return SEED_SHOOTERS;
  }
}

function saveShooterToFile(shooter: ShooterProfile): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const current = getShootersFromStorage();
    const index = current.findIndex((s) => s.id === shooter.id);
    let updated: ShooterProfile[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = shooter;
    } else {
      updated = [shooter, ...current];
    }

    const lines = updated.map((s) => JSON.stringify(s)).join("\n") + "\n";
    fs.writeFileSync(SHOOTERS_FILE, lines, "utf-8");
  } catch (err) {
    console.error("Error saving shooter to file:", err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const shooters = getShootersFromStorage();

    if (id) {
      const shooter = shooters.find((s) => s.id === id);
      if (!id || !shooter) {
        return NextResponse.json({ error: "Shooter not found" }, { status: 404 });
      }
      return NextResponse.json({ shooter });
    }

    return NextResponse.json({ shooters, count: shooters.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || !body.callsign) {
      return NextResponse.json({ error: "Name and callsign are required" }, { status: 400 });
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

    const newShooter: ShooterProfile = {
      id,
      name: body.name.trim(),
      callsign: body.callsign.trim().toUpperCase(),
      division: body.division || "Open Division Pro",
      ranking: body.ranking || "Appalachian Rimfire Competitor",
      homeRange: body.homeRange || "The Hideout, Bristol, TN",
      podiums: typeof body.podiums === "number" ? body.podiums : parseInt(body.podiums, 10) || 0,
      featuredMatch: body.featuredMatch || "The Subsonic Society Invitational 2026",
      image: body.image || "/assets/subsonic-coin.jpg",
      actionPhoto: body.actionPhoto || body.image || "/assets/subsonic-coin.jpg",
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
        ammoLot: body.rifleSetup?.ammoLot || body.ammoLot || "Lapua / SK Match Spec (1,060 FPS)",
      },
      interview: body.interview || [
        {
          question: "What is your match day strategy at The Hideout?",
          answer: body.interviewAnswer || "Focus on solid barricade position, check bubble level, and let the dope work."
        }
      ],
      createdAt: new Date().toISOString(),
      status: body.status || "PUBLISHED",
    };

    saveShooterToFile(newShooter);

    return NextResponse.json({
      success: true,
      message: `Shooter profile for ${newShooter.name} [${newShooter.callsign}] auto-generated successfully!`,
      shooter: newShooter,
      profileUrl: `/shooters?id=${newShooter.id}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Shooter ID required" }, { status: 400 });
    }

    const current = getShootersFromStorage();
    const updated = current.filter((s) => s.id !== id);

    const lines = updated.map((s) => JSON.stringify(s)).join("\n") + "\n";
    fs.writeFileSync(SHOOTERS_FILE, lines, "utf-8");

    return NextResponse.json({ success: true, message: `Shooter ${id} deleted.` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
