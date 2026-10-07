import fs from "fs";
import { db, isDbConfigured } from "@/lib/supabase-admin";
import path from "path";
import { SocietyInvite, InviteTier } from "@/lib/types";

// Base file paths
const REPO_DATA_DIR = path.join(process.cwd(), "data");
const REPO_INVITES_FILE = path.join(REPO_DATA_DIR, "invites.jsonl");

// In serverless (Vercel), only /tmp is writable
const IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const WRITABLE_DIR = IS_SERVERLESS ? "/tmp" : REPO_DATA_DIR;
const WRITABLE_INVITES_FILE = IS_SERVERLESS
  ? path.join("/tmp", "subsonic-invites.jsonl")
  : REPO_INVITES_FILE;

// On the live (serverless) site the database is the single source of truth.
const DB_AUTHORITATIVE = IS_SERVERLESS && isDbConfigured;

export const SEED_INVITES: SocietyInvite[] = [
  {
    id: "seed-pro-v793",
    code: "SS-PRO-V793",
    tier: "PRO",
    recipientName: "VIP Pro Competitor",
    note: "VIP Pro Competitor Match Invite",
    createdBy: "SUBX",
    createdAt: "2026-09-28T12:00:00Z",
    maxUses: 10,
    usedCount: 0,
    claimedBy: [],
    status: "ACTIVE",
  },
  {
    id: "seed-pro-vip",
    code: "SS-PRO-VIP2026",
    tier: "PRO",
    recipientName: "Invitational Competitor VIP",
    note: "Official VIP Pro Competitor match invite code",
    createdBy: "SUBX",
    createdAt: "2026-09-01T12:00:00Z",
    maxUses: 150,
    usedCount: 3,
    claimedBy: ["GHOST", "COLDBORE", "DIALED"],
    status: "ACTIVE",
  },
  {
    id: "seed-mbr-open",
    code: "SS-MBR-HIDE2026",
    tier: "PRO",
    recipientName: "Society Member Invite",
    note: "General access code for private Chat Room & member card",
    createdBy: "SUBX",
    createdAt: "2026-09-01T12:00:00Z",
    maxUses: 250,
    usedCount: 14,
    claimedBy: [],
    status: "ACTIVE",
  },
];

// In-process memory cache to survive serverless request lifecycles

// Map camelCase to snake_case for Supabase
function mapInviteToDb(i: SocietyInvite) {
  return {
    id: i.id,
    code: i.code,
    tier: i.tier,
    recipient_name: i.recipientName,
    recipient_email: i.recipientEmail,
    recipient_phone: i.recipientPhone,
    note: i.note,
    created_by: i.createdBy,
    created_at: i.createdAt,
    expires_at: i.expiresAt,
    max_uses: i.maxUses,
    used_count: i.usedCount,
    claimed_by: i.claimedBy,
    status: i.status,
  };
}

// Map snake_case to camelCase from Supabase
function mapDbToInvite(row: any): SocietyInvite {
  return {
    id: row.id,
    code: row.code,
    tier: row.tier,
    recipientName: row.recipient_name,
    recipientEmail: row.recipient_email,
    recipientPhone: row.recipient_phone,
    note: row.note,
    createdBy: row.created_by,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    maxUses: row.max_uses,
    usedCount: row.used_count,
    claimedBy: row.claimed_by || [],
    status: row.status,
  };
}

let memoryInvites: SocietyInvite[] = [...SEED_INVITES];
let invitesLastRefreshMs = 0;
let invitesRefreshInFlight: Promise<void> | null = null;

/** Pull the latest invites from the database. Await in API routes. */
export async function refreshInvitesFromDb(maxAgeMs = 3000): Promise<void> {
  if (!db) return;
  if (Date.now() - invitesLastRefreshMs < maxAgeMs) return;
  if (invitesRefreshInFlight) return invitesRefreshInFlight;

  invitesRefreshInFlight = (async () => {
    try {
      const { data, error } = await db.from("invites").select("*");
      if (error) {
        console.error("Error fetching invites from database:", error.message);
        return;
      }
      const rows = (data || []).map(mapDbToInvite);
      if (DB_AUTHORITATIVE) {
        memoryInvites = rows;
      } else {
        const map = new Map<string, SocietyInvite>();
        for (const i of memoryInvites) map.set(i.code.toUpperCase(), i);
        for (const inv of rows) map.set(inv.code.toUpperCase(), inv);
        memoryInvites = Array.from(map.values());
      }
      invitesLastRefreshMs = Date.now();
    } catch (err) {
      console.error("Database refresh error (invites):", err);
    } finally {
      invitesRefreshInFlight = null;
    }
  })();
  return invitesRefreshInFlight;
}

export function getInvitesFromStorage(): SocietyInvite[] {
  if (db && invitesLastRefreshMs === 0) void refreshInvitesFromDb();

  try {
    const map = new Map<string, SocietyInvite>();
    // On the live site the database is authoritative — seeds/files only used locally.
    if (!DB_AUTHORITATIVE) {
      for (const seed of SEED_INVITES) map.set(seed.code.toUpperCase(), seed);
      let raw = "";
      if (fs.existsSync(WRITABLE_INVITES_FILE)) {
        raw = fs.readFileSync(WRITABLE_INVITES_FILE, "utf-8");
      } else if (fs.existsSync(REPO_INVITES_FILE)) {
        raw = fs.readFileSync(REPO_INVITES_FILE, "utf-8");
      }
      for (const l of raw.split("\n")) {
        if (!l.trim()) continue;
        try {
          const inv = JSON.parse(l) as SocietyInvite;
          if (inv?.code) map.set(inv.code.toUpperCase(), inv);
        } catch {}
      }
    }
    for (const mem of memoryInvites) map.set(mem.code.toUpperCase(), mem);
    memoryInvites = Array.from(map.values());
    return memoryInvites;
  } catch (err) {
    console.error("Error reading invites:", err);
    return memoryInvites;
  }
}

function writeInvitesLocally(invites: SocietyInvite[]): void {
  memoryInvites = [...invites];
  try {
    if (!fs.existsSync(WRITABLE_DIR)) {
      fs.mkdirSync(WRITABLE_DIR, { recursive: true });
    }
    const content = invites.map((inv) => JSON.stringify(inv)).join("\n") + "\n";
    fs.writeFileSync(WRITABLE_INVITES_FILE, content, "utf-8");
    if (!IS_SERVERLESS) {
      if (!fs.existsSync(REPO_DATA_DIR)) {
        fs.mkdirSync(REPO_DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(REPO_INVITES_FILE, content, "utf-8");
    }
  } catch (err) {
    console.error("Error saving invites locally:", err);
  }
}

/** Save ONE invite and wait for the database to confirm. Throws on database error. */
export async function saveInviteAsync(invite: SocietyInvite): Promise<void> {
  const current = getInvitesFromStorage();
  const idx = current.findIndex((i) => i.code.toUpperCase() === invite.code.toUpperCase());
  const next = [...current];
  if (idx >= 0) next[idx] = invite;
  else next.unshift(invite);
  writeInvitesLocally(next);

  if (db) {
    const { error } = await db.from("invites").upsert(mapInviteToDb(invite), { onConflict: "id" });
    if (error) throw new Error(`Database save failed (invite): ${error.message}`);
  }
}

/** Save the full invite list (database write is best-effort). */
export function saveAllInvitesToStorage(invites: SocietyInvite[]): void {
  writeInvitesLocally(invites);
  if (db) {
    (async () => {
      try {
        const { error } = await db.from("invites").upsert(invites.map(mapInviteToDb), { onConflict: "id" });
        if (error) console.error("Error upserting invites to database:", error.message);
      } catch (err) {
        console.error("Database upsert error (invites):", err);
      }
    })();
  }
}

export function generateRandomCode(tier: InviteTier): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let randomPart = "";
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const prefix = tier === "PRO" ? "SS-PRO" : "SS-MBR";
  return `${prefix}-${randomPart}`;
}

/**
 * Auto-registers or recovers an invite code that matches the official
 * Subsonic Society format (e.g. SS-PRO-XXXX or SS-MBR-XXXX).
 */
export function ensureInviteExists(rawCode: string): SocietyInvite | null {
  const clean = rawCode.trim().toUpperCase();
  const current = getInvitesFromStorage();
  const existing = current.find((i) => i.code.toUpperCase() === clean);
  if (existing) return existing;

  // Pattern match official format: SS-PRO-* (PRO) or SS-MBR-* (MEMBER)
  if (clean.startsWith("SS-PRO-") && clean.length >= 8) {
    const newProInvite: SocietyInvite = {
      id: `auto-${clean.toLowerCase()}`,
      code: clean,
      tier: "PRO",
      recipientName: "VIP Pro Competitor",
      note: "Auto-authorized VIP Pro invitation code",
      createdBy: "SUBX",
      createdAt: new Date().toISOString(),
      maxUses: 10,
      usedCount: 0,
      claimedBy: [],
      status: "ACTIVE",
    };
    saveAllInvitesToStorage([newProInvite, ...current]);
    return newProInvite;
  }

  if (clean.startsWith("SS-MBR-") && clean.length >= 8) {
    const newMbrInvite: SocietyInvite = {
      id: `auto-${clean.toLowerCase()}`,
      code: clean,
      tier: "MEMBER",
      recipientName: "Society Member",
      note: "Auto-authorized Member invitation code",
      createdBy: "SUBX",
      createdAt: new Date().toISOString(),
      maxUses: 25,
      usedCount: 0,
      claimedBy: [],
      status: "ACTIVE",
    };
    saveAllInvitesToStorage([newMbrInvite, ...current]);
    return newMbrInvite;
  }

  return null;
}
