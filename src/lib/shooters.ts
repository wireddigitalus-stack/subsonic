import fs from "fs";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import path from "path";
import { ShooterProfile } from "@/lib/types";

// Base file paths
const REPO_DATA_DIR = path.join(process.cwd(), "data");
const REPO_SHOOTERS_FILE = path.join(REPO_DATA_DIR, "shooters.jsonl");

// Serverless / Vercel writable directory
const IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const WRITABLE_DIR = IS_SERVERLESS ? "/tmp" : REPO_DATA_DIR;
const WRITABLE_SHOOTERS_FILE = IS_SERVERLESS
  ? path.join("/tmp", "subsonic-shooters.jsonl")
  : REPO_SHOOTERS_FILE;

export const SEED_SHOOTERS: ShooterProfile[] = [
  {
    id: "erich-leipold",
    name: "Erich Leipold",
    callsign: "LEIPOLD",
    division: "Open Rimfire Pro • Team USA",
    ranking: "Team USA 🇺🇸 • Rimfire Challenge World Champion",
    homeRange: "National Tour / Pennsylvania",
    podiums: 61,
    featuredMatch: "Subsonic Society Invitational Money Match 2026",
    image: "/assets/erich-leipold-poster.jpg",
    actionPhoto: "/assets/erich-leipold-poster.jpg",
    posterImage: "/assets/erich-leipold-poster.jpg",
    quote: "Consistency isn't an accident. It's the byproduct of testing every variable, knowing your DOPE down to the tenth of a mil, and executing with absolute confidence.",
    signature: "Erich Leipold",
    accolades: [
      "TEAM USA 🇺🇸 — 2026 RIMFIRE WORLD CHAMPIONSHIP",
      "RIMFIRE CHALLENGE WORLD CHAMPION",
      "2ND PLACE 2024 NRL22 NATIONAL CHAMPIONSHIP",
      "35+ RIMFIRE MATCH WINS",
    ],
    careerStats: {
      matches: 103,
      states: 25,
      countries: 2,
      wins: 35,
      top3: 61,
      top5: 76,
      top10: 91,
      nationalPlacements: [
        "2nd Place — 2024 NRL22 National Championship",
        "Top-5 — 2025 PRS Rimfire Finale",
        "Team USA — 2026 World Championship Qualifier",
      ],
    },
    sponsors: [
      "MasterPiece Arms (MPA)",
      "Modacam Custom Rifles",
      "Vortex Optics",
      "Zermatt Arms",
      "Clenzoil",
      "Leofoto",
      "Hoz & Shield",
      "Arrow Products USA",
    ],
    rifleSetup: {
      action: "Zermatt RimX Precision Action",
      barrel: "Bartlein MTU Match Fluted 22\" (1:16 Twist)",
      trigger: "TriggerTech Diamond Pro Curved (4 oz)",
      chassis: "MasterPiece Arms (MPA) BA PMR Pro Chassis",
      optic: "Vortex Razor HD Gen III 6-36x56 EBR-7D",
      mount: "Spuhr QDP 34mm Unimount with Integrated Level",
      tuner: "EC Tuner Harmonic Brake",
      ammoLot: "Lapua Midas+ Hand-Sorted Lot (1,060 FPS)",
    },
    interview: [
      {
        question: "What is your mental preparation before a national championship stage?",
        answer: "I visualize the stage three times before loading: target acquisition order, transition footwork, and wind calls. When the timer beeps, muscle memory and DOPE take over.",
      },
      {
        question: "How do you dial in harmonic tuning for your RimX setup?",
        answer: "I test on calm mornings at 50 yards with a chronograph. I rotate the tuner 2 hash marks at a time until the vertical dispersion flattens into a single hole. Single-digit SD is the law.",
      },
    ],
    createdAt: "2026-09-30T00:00:00Z",
    status: "PUBLISHED",
  },
  {
    id: "ron-verran",
    name: "Ron Verran",
    callsign: "VERRAN",
    division: "Open Rimfire Pro • Team USA",
    ranking: "2x PRS National Champion • Team USA 🇺🇸",
    homeRange: "Great Lakes Region / National Tour",
    podiums: 52,
    featuredMatch: "Subsonic Society Invitational Money Match 2026",
    image: "/assets/ron-verran-poster.jpg",
    actionPhoto: "/assets/ron-verran-poster.jpg",
    posterImage: "/assets/ron-verran-poster.jpg",
    quote: "It's not luck. It's a process.",
    signature: "Ron Verran",
    accolades: [
      "2021 PRS NATIONAL CHAMPION 🏆",
      "2023 PRS NATIONAL CHAMPION 🏆",
      "2022 & 2025 PRS GREAT LAKES SERIES CHAMPION 🥇",
      "2025 IPRF WORLD CHAMPIONSHIPS — 3RD OVERALL 🥉",
      "TEAM USA 🇺🇸",
      "DEDICATED TO GROWING THE SPORT OF RIMFIRE PRECISION 🎯",
    ],
    careerStats: {
      matches: 85,
      states: 22,
      countries: 2,
      wins: 28,
      top3: 52,
      top5: 64,
      top10: 78,
      nationalPlacements: [
        "2021 PRS National Champion 🏆",
        "2023 PRS National Champion 🏆",
        "2022 & 2025 PRS Great Lakes Series Champion 🥇",
        "2025 IPRF World Championships — 3rd Overall 🥉",
      ],
    },
    sponsors: [
      "Modacam Custom Rifles",
      "MasterPiece Arms (MPA)",
      "Vortex Optics",
      "Zermatt Arms",
      "Lapua Rimfire",
      "Subsonic Society",
    ],
    rifleSetup: {
      action: "Zermatt RimX Precision Rimfire Action",
      barrel: "Bartlein MTU Match Fluted 22\" (1:16 Twist)",
      trigger: "TriggerTech Diamond Pro Curved (4.5 oz)",
      chassis: "MasterPiece Arms (MPA) Matrix Pro Competition Chassis",
      optic: "Vortex Razor HD Gen III 6-36x56 EBR-7D",
      mount: "Spuhr ISMS 34mm Mount with Integrated Level",
      tuner: "EC Tuner Harmonic Brake",
      ammoLot: "Lapua Center-X / Midas+ Hand-Sorted Lot (1,063 FPS)",
    },
    interview: [
      {
        question: "What separates a PRS National Championship run from an ordinary match weekend?",
        answer: "It's never luck. It's a disciplined, repeatable process. From barricade footwork to stage timing and DOPE verification, you remove variables until hitting center-steel is simply muscle memory.",
      },
      {
        question: "What advice do you give shooters entering the Subsonic Invitational in Bristol?",
        answer: "Respect the Appalachian mountain switch-winds. Trust your initial wind call, commit cleanly to your trigger press, and don't dwell on dropped points. Every stage is a clean slate.",
      },
    ],
    createdAt: "2026-09-30T00:00:00Z",
    status: "PUBLISHED",
  },
  {
    id: "wyatt-sterling",
    name: "Wyatt 'Ghost' Sterling",
    callsign: "GHOST",
    division: "Open Division Pro",
    ranking: "National Rank #4 • Appalachian Cup 1st Place",
    homeRange: "Holston Range, Bristol, TN",
    podiums: 14,
    featuredMatch: "Subsonic Society Invitational 2026",
    image: "/images/SS-RWB-LOGO.png",
    actionPhoto: "/images/SS-RWB-LOGO.png",
    quote: "In the Bristol mountains, the wind never blows the same way two seconds in a row. You have to trust your bubble level, watch the trees along the hollow, and commit to the shot.",
    signature: "Wyatt Sterling",
    accolades: ["TEAM USA 🇺🇸", "NATIONAL RANK #4", "APPALACHIAN CUP 1ST"],
    careerStats: {
      matches: 48,
      states: 11,
      countries: 1,
      wins: 14,
      top3: 24,
      top5: 32,
      top10: 41,
      nationalPlacements: ["1st Place — Appalachian Cup 2025", "4th Place — PRS Rimfire National Series"],
    },
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
    actionPhoto: "/images/SS-RWB-LOGO.png",
    quote: "Subsonic rimfire is pure shooting discipline. Without recoil to mask your flaws, every breath and trigger press is written directly onto the steel plate.",
    signature: "Kendra Cross",
    accolades: ["TOP LADY MARKSMAN 🥇", "SOUTHEAST CHAMPION", "19 PODIUMS"],
    careerStats: {
      matches: 56,
      states: 14,
      countries: 1,
      wins: 19,
      top3: 31,
      top5: 44,
      top10: 52,
      nationalPlacements: ["1st Place — Southeast Regional Open", "Top Lady Marksman — 2025 National Tour"],
    },
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
    actionPhoto: "/images/SS-RWB-LOGO.png",
    quote: "You don't need a $10,000 custom rig to win if you master stage timing, barricade stability, and find a lot of ammunition your factory barrel loves.",
    signature: "Eli McAllister",
    accolades: ["PRODUCTION CLASS 1ST", "8 PODIUMS", "FACTORY CZ CHAMPION"],
    careerStats: {
      matches: 28,
      states: 6,
      countries: 1,
      wins: 8,
      top3: 15,
      top5: 21,
      top10: 26,
      nationalPlacements: ["1st Place — Appalachian Cup Production Division", "3rd Place — Mid-Atlantic Rimfire Match"],
    },
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
  },
  {
    id: "allen-hurley",
    name: "Allen Hurley",
    callsign: "ALLEN",
    division: "Owner Admin / Executive",
    ranking: "Founder • Subsonic Society",
    homeRange: "The Hideout, Bristol, TN",
    podiums: 12,
    featuredMatch: "Subsonic Society Invitational Money Match 2026",
    image: "/images/SS-RWB-LOGO.png",
    actionPhoto: "/images/SS-RWB-LOGO.png",
    quote: "We built The Hideout because rimfire precision deserves a home that doesn't cut corners. Two hundred and twenty acres of Tennessee ridgeline purpose-built for marksmen who take this game seriously. Said. Done.",
    signature: "Allen Hurley",
    accolades: ["FOUNDER 👑", "MATCH HOST", "EXECUTIVE RO"],
    careerStats: {
      matches: 38,
      states: 9,
      countries: 1,
      wins: 12,
      top3: 20,
      top5: 28,
      top10: 35,
      nationalPlacements: ["Host & Director — Subsonic Society Invitational", "1st Place — Bristol Ridge Shootout"],
    },
    sponsors: ["Modacam Custom Rifles", "Subsonic Society"],
    rifleSetup: {
      action: "Modacam Custom Precision V-22 Rimfire",
      barrel: "22\" Custom Fluted Match Contour",
      trigger: "TriggerTech Diamond Pro Curved (5 oz)",
      chassis: "MDT ACC Elite Carbon Inlay Custom",
      optic: "Zero Compromise Optic ZC527",
      mount: "Spuhr 36mm Unimount",
      tuner: "Modacam Custom Harmonic Brake",
      ammoLot: "Lapua Center-X Hand-Sorted (1,064 FPS)",
    },
    interview: [
      {
        question: "What was the vision behind The Hideout complex in Bristol?",
        answer: "To bring together the best shooters in the country onto terrain that tests real wind reading and elevation, while providing hospitality, live scoring, and community that the sport has been missing."
      }
    ],
    createdAt: "2026-07-01T12:00:00Z",
    status: "PUBLISHED",
  },
  {
    id: "test",
    name: "TEST",
    callsign: "TEST",
    division: "Open Division Pro",
    ranking: "Appalachian Marksman • Subsonic Society Pro",
    homeRange: "The Hideout, Bristol, TN",
    podiums: 5,
    featuredMatch: "Subsonic Society Invitational 2026",
    image: "/images/SS-RWB-LOGO.png",
    actionPhoto: "/images/SS-RWB-LOGO.png",
    quote: "In the mountains, you learn to trust your bubble level, read the mirage along the ridgeline, and commit cleanly to every single shot.",
    accolades: ["PRO COMPETITOR 🏅", "THE HIDEOUT PRO SERIES", "VERIFIED MARKSMAN"],
    sponsors: ["Modacam Custom Rifles", "Vudoo Gun Works", "Lapua Rimfire"],
    rifleSetup: {
      action: "Vudoo Gun Works V-22 Rimfire",
      barrel: "Bartlein MTU 20\" Match (1:16 Twist)",
      trigger: "Bix'n Andy TacSport PRO (4.2 oz)",
      chassis: "MDT ACC Elite Chassis with Titanium Weights",
      optic: "Zero Compromise Optic ZC527 MPCT3X",
      mount: "Spuhr QDP-4002 0 MOA with Level",
      tuner: "Harrell Precision Custom Rimfire Tuner",
      ammoLot: "Lapua Center-X (1,062 FPS)",
    },
    interview: [
      {
        question: "What is your focus when testing ammunition lots for competition?",
        answer: "I clean down to bare metal, season the bore with 25 rounds of the test lot, and shoot consecutive 10-shot strings over the Garmin chronograph to confirm single-digit standard deviations."
      }
    ],
    createdAt: "2026-09-28T17:00:00Z",
    status: "PUBLISHED",
  },
];

// In-process memory cache to survive serverless function calls

// Map camelCase to snake_case for Supabase
function mapShooterToDb(s: ShooterProfile) {
  return {
    id: s.id,
    name: s.name,
    callsign: s.callsign,
    division: s.division,
    ranking: s.ranking,
    home_range: s.homeRange,
    podiums: s.podiums,
    featured_match: s.featuredMatch,
    image: s.image,
    action_photo: s.actionPhoto,
    quote: s.quote,
    accolades: s.accolades,
    sponsors: s.sponsors,
    rifle_setup: s.rifleSetup,
    pin: s.pin,
    interview: s.interview,
    created_at: s.createdAt,
    status: s.status,
  };
}

// Map snake_case to camelCase from Supabase
function mapDbToShooter(row: any): ShooterProfile {
  return {
    id: row.id,
    name: row.name,
    callsign: row.callsign,
    division: row.division,
    ranking: row.ranking,
    homeRange: row.home_range,
    podiums: row.podiums,
    featuredMatch: row.featured_match,
    image: row.image,
    actionPhoto: row.action_photo,
    quote: row.quote,
    accolades: row.accolades,
    sponsors: row.sponsors,
    rifleSetup: row.rifle_setup,
    pin: row.pin,
    interview: row.interview,
    createdAt: row.created_at,
    status: row.status,
  };
}

let shootersCacheRefreshed = false;

let memoryShooters: ShooterProfile[] = [...SEED_SHOOTERS];

export function getShootersFromStorage(): ShooterProfile[] {
  if (!shootersCacheRefreshed && isSupabaseConfigured && supabase) {
    shootersCacheRefreshed = true;
    (async () => {
      try {
        const { data, error } = await supabase.from("shooters").select("*");
        if (error) {
          console.error("Error fetching shooters from Supabase:", error);
          return;
        }
        if (data && data.length > 0) {
          const map = new Map<string, ShooterProfile>();
          for (const s of memoryShooters) map.set(s.id.toLowerCase(), s);
          for (const row of data) {
            const s = mapDbToShooter(row);
            map.set(s.id.toLowerCase(), s);
          }
          memoryShooters = Array.from(map.values());
        }
      } catch (err) {
        console.error("Supabase refresh error (shooters):", err);
      }
    })();
  }

  try {
    let raw = "";
    if (fs.existsSync(WRITABLE_SHOOTERS_FILE)) {
      raw = fs.readFileSync(WRITABLE_SHOOTERS_FILE, "utf-8");
    } else if (fs.existsSync(REPO_SHOOTERS_FILE)) {
      raw = fs.readFileSync(REPO_SHOOTERS_FILE, "utf-8");
    }

    if (raw) {
      const lines = raw.split("\n").filter((l) => l.trim().length > 0);
      const parsed = lines
        .map((l) => {
          try {
            return JSON.parse(l) as ShooterProfile;
          } catch {
            return null;
          }
        })
        .filter((s): s is ShooterProfile => s !== null);

      if (parsed.length > 0) {
        const map = new Map<string, ShooterProfile>();
        for (const seed of SEED_SHOOTERS) map.set(seed.id.toLowerCase(), seed);
        for (const mem of memoryShooters) map.set(mem.id.toLowerCase(), mem);
        for (const item of parsed) map.set(item.id.toLowerCase(), item);
        memoryShooters = Array.from(map.values());
        return memoryShooters;
      }
    }

    return memoryShooters;
  } catch (err) {
    console.error("Error reading shooters:", err);
    return memoryShooters;
  }
}

export function saveShooterToStorage(shooter: ShooterProfile): void {
  try {
    const current = getShootersFromStorage();
    const index = current.findIndex((s) => s.id.toLowerCase() === shooter.id.toLowerCase());
    let updated: ShooterProfile[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = shooter;
    } else {
      updated = [shooter, ...current];
    }

    memoryShooters = updated;

    if (!fs.existsSync(WRITABLE_DIR)) {
      fs.mkdirSync(WRITABLE_DIR, { recursive: true });
    }
    const content = updated.map((s) => JSON.stringify(s)).join("\n") + "\n";
    fs.writeFileSync(WRITABLE_SHOOTERS_FILE, content, "utf-8");
    if (!IS_SERVERLESS) {
      if (!fs.existsSync(REPO_DATA_DIR)) {
        fs.mkdirSync(REPO_DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(REPO_SHOOTERS_FILE, content, "utf-8");
    }

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          const dbRow = mapShooterToDb(shooter);
          const { error } = await supabase.from('shooters').upsert(dbRow, { onConflict: 'id' });
          if (error) console.error("Error upserting shooter to Supabase:", error);
        } catch (err) {
          console.error("Supabase upsert catch (shooters):", err);
        }
      })();
    }
  } catch (err) {
    console.error("Error saving shooter:", err);
  }
}

export function getShooterBySlug(slug: string): ShooterProfile | null {
  if (!slug) return null;
  const cleanSlug = slug.toLowerCase().trim();
  const allShooters = getShootersFromStorage();

  return (
    allShooters.find(
      (s) =>
        s.id.toLowerCase() === cleanSlug ||
        s.callsign.toLowerCase() === cleanSlug ||
        s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === cleanSlug
    ) || null
  );
}
