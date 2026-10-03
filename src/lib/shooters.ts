import fs from "fs";
import { db, isDbConfigured } from "@/lib/supabase-admin";
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

// On the live (serverless) site the database is the single source of truth.
const DB_AUTHORITATIVE = IS_SERVERLESS && isDbConfigured;

export const SEED_SHOOTERS: ShooterProfile[] = [
  {
    id: "allen-hurley",
    name: "Allen Hurley",
    callsign: "SAID DONE",
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
        answer: "To bring together the best shooters in the country onto terrain that tests real wind reading and elevation, while providing hospitality, live scoring, and community that the sport has been missing.",
      }
    ],
    createdAt: "2026-07-01T12:00:00Z",
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

let memoryShooters: ShooterProfile[] = [...SEED_SHOOTERS];
let shootersLastRefreshMs = 0;
let shootersRefreshInFlight: Promise<void> | null = null;

/**
 * Pull the latest shooters from the database into the in-memory cache.
 * Await this at the top of any API route that needs up-to-date shooter data.
 */
export async function refreshShootersFromDb(maxAgeMs = 3000): Promise<void> {
  if (!db) return;
  if (Date.now() - shootersLastRefreshMs < maxAgeMs) return;
  if (shootersRefreshInFlight) return shootersRefreshInFlight;

  shootersRefreshInFlight = (async () => {
    try {
      const { data, error } = await db.from("shooters").select("*");
      if (error) {
        console.error("Error fetching shooters from database:", error.message);
        return;
      }
      const rows = (data || []).map(mapDbToShooter);
      if (DB_AUTHORITATIVE) {
        memoryShooters = rows;
      } else {
        const map = new Map<string, ShooterProfile>();
        for (const s of memoryShooters) map.set(s.id.toLowerCase(), s);
        for (const s of rows) map.set(s.id.toLowerCase(), s);
        memoryShooters = Array.from(map.values());
      }
      shootersLastRefreshMs = Date.now();
    } catch (err) {
      console.error("Database refresh error (shooters):", err);
    } finally {
      shootersRefreshInFlight = null;
    }
  })();
  return shootersRefreshInFlight;
}

export function getShootersFromStorage(): ShooterProfile[] {
  if (db && shootersLastRefreshMs === 0) void refreshShootersFromDb();

  try {
    const map = new Map<string, ShooterProfile>();
    for (const seed of SEED_SHOOTERS) map.set(seed.id.toLowerCase(), seed);

    // Local files (skipped on the live site where the database is authoritative)
    if (!DB_AUTHORITATIVE) {
      let raw = "";
      if (fs.existsSync(WRITABLE_SHOOTERS_FILE)) {
        raw = fs.readFileSync(WRITABLE_SHOOTERS_FILE, "utf-8");
      } else if (fs.existsSync(REPO_SHOOTERS_FILE)) {
        raw = fs.readFileSync(REPO_SHOOTERS_FILE, "utf-8");
      }
      if (raw) {
        for (const l of raw.split("\n")) {
          if (!l.trim()) continue;
          try {
            const item = JSON.parse(l) as ShooterProfile;
            if (item?.id) map.set(item.id.toLowerCase(), item);
          } catch {}
        }
      }
    }

    // Memory last — freshest database data + this instance's writes
    for (const mem of memoryShooters) map.set(mem.id.toLowerCase(), mem);

    memoryShooters = Array.from(map.values());
    return memoryShooters;
  } catch (err) {
    console.error("Error reading shooters:", err);
    return memoryShooters;
  }
}

export async function upsertShooterToDb(shooter: ShooterProfile): Promise<void> {
  if (!db) return;
  const { error } = await db.from("shooters").upsert(mapShooterToDb(shooter), { onConflict: "id" });
  if (error) throw new Error(`Database save failed (shooter): ${error.message}`);
}

function applyShooterLocally(shooter: ShooterProfile): void {
  const current = getShootersFromStorage();
  const index = current.findIndex((s) => s.id.toLowerCase() === shooter.id.toLowerCase());
  let updated: ShooterProfile[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = shooter;
  } else {
    updated = [shooter, ...current];
  }
  saveAllShootersToStorage(updated);
}

/** Save a shooter and WAIT for the database to confirm. Throws on database error. */
export async function saveShooterToStorageAsync(shooter: ShooterProfile): Promise<void> {
  applyShooterLocally(shooter);
  await upsertShooterToDb(shooter);
}

/** Legacy sync save (database write is best-effort). Prefer saveShooterToStorageAsync. */
export function saveShooterToStorage(shooter: ShooterProfile): void {
  try {
    applyShooterLocally(shooter);
    upsertShooterToDb(shooter).catch((err) => console.error(err.message));
  } catch (err) {
    console.error("Error saving shooter:", err);
  }
}

export function saveAllShootersToStorage(shooters: ShooterProfile[]): void {
  try {
    memoryShooters = shooters;

    if (!fs.existsSync(WRITABLE_DIR)) {
      fs.mkdirSync(WRITABLE_DIR, { recursive: true });
    }
    const content = shooters.map((s) => JSON.stringify(s)).join("\n") + "\n";
    fs.writeFileSync(WRITABLE_SHOOTERS_FILE, content, "utf-8");
    if (!IS_SERVERLESS) {
      if (!fs.existsSync(REPO_DATA_DIR)) {
        fs.mkdirSync(REPO_DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(REPO_SHOOTERS_FILE, content, "utf-8");
    }
  } catch (err) {
    console.error("Error saving all shooters to storage:", err);
  }
}

export function deleteShooterFromStorage(idOrCallsign: string): boolean {
  if (!idOrCallsign) return false;
  const clean = idOrCallsign.trim().toLowerCase();

  // Root executive protection
  if (
    clean === "allen-hurley" ||
    clean === "said done" ||
    clean === "allen" ||
    clean === "rob-neilson" ||
    clean === "radar" ||
    clean === "rob" ||
    clean === "ss-2026-0001" ||
    clean === "ss-2026-0002"
  ) {
    return false;
  }

  const current = getShootersFromStorage();
  const strippedPro = clean.replace(/^ss-pro-/, "");

  const target = current.find(
    (s) =>
      s.id.toLowerCase() === clean ||
      s.callsign.toLowerCase() === clean ||
      s.callsign.toLowerCase() === strippedPro ||
      s.name.toLowerCase() === clean ||
      s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === clean
  );

  if (!target) return true; // Already deleted or client-only

  const filtered = current.filter(
    (s) =>
      s.id.toLowerCase() !== target.id.toLowerCase() &&
      s.callsign.toLowerCase() !== target.callsign.toLowerCase() &&
      s.name.toLowerCase() !== target.name.toLowerCase()
  );

  memoryShooters = filtered;
  saveAllShootersToStorage(filtered);

  lastShooterDbDelete = (async () => {
    if (!db) return;
    try {
      const { error } = await db.from("shooters").delete().eq("id", target.id);
      if (error) console.error("Error deleting shooter from database:", error.message);
    } catch (err) {
      console.error("Database delete error (shooters):", err);
    }
  })();

  // Cross-clean matching society member if exists
  try {
    const { deleteMemberFromStorage } = require("@/lib/members");
    if (target.callsign) deleteMemberFromStorage(target.callsign);
    deleteMemberFromStorage(target.id);
  } catch (e) {
    // avoid cyclic errors
  }

  return true;
}

let lastShooterDbDelete: Promise<void> = Promise.resolve();

/** Delete a shooter and wait for the database delete to finish. */
export async function deleteShooterFromStorageAsync(idOrCallsign: string): Promise<boolean> {
  const ok = deleteShooterFromStorage(idOrCallsign);
  await lastShooterDbDelete;
  return ok;
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
