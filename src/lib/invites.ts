import fs from "fs";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
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

export const SEED_INVITES: SocietyInvite[] = [
  {
    id: "seed-pro-v793",
    code: "SS-PRO-V793",
    tier: "PRO",
    recipientName: "VIP Pro Competitor",
    note: "VIP Pro Competitor Match Invite",
    createdBy: "ALLEN",
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
    createdBy: "ALLEN",
    createdAt: "2026-09-01T12:00:00Z",
    maxUses: 150,
    usedCount: 3,
    claimedBy: ["GHOST", "COLDBORE", "DIALED"],
    status: "ACTIVE",
  },
  {
    id: "seed-mbr-open",
    code: "SS-MBR-HIDE2026",
    tier: "MEMBER",
    recipientName: "Society Member Invite",
    note: "General access code for private squad comms & member card",
    createdBy: "ALLEN",
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

let invitesCacheRefreshed = false;

let memoryInvites: SocietyInvite[] = [...SEED_INVITES];

export function getInvitesFromStorage(): SocietyInvite[] {
  if (!invitesCacheRefreshed && isSupabaseConfigured && supabase) {
    invitesCacheRefreshed = true;
    (async () => {
      try {
        const { data, error } = await supabase.from("invites").select("*");
        if (error) {
          console.error("Error fetching invites from Supabase:", error);
          return;
        }
        if (data && data.length > 0) {
          const map = new Map<string, SocietyInvite>();
          for (const i of memoryInvites) map.set(i.code.toUpperCase(), i);
          for (const row of data) {
            const inv = mapDbToInvite(row);
            map.set(inv.code.toUpperCase(), inv);
          }
          memoryInvites = Array.from(map.values());
        }
      } catch (err) {
        console.error("Supabase refresh error (invites):", err);
      }
    })();
  }

  try {
    // 1. Try reading from writable file first
    let raw = "";
    if (fs.existsSync(WRITABLE_INVITES_FILE)) {
      raw = fs.readFileSync(WRITABLE_INVITES_FILE, "utf-8");
    } else if (fs.existsSync(REPO_INVITES_FILE)) {
      raw = fs.readFileSync(REPO_INVITES_FILE, "utf-8");
    }

    if (raw) {
      const lines = raw.split("\n").filter((l) => l.trim().length > 0);
      const parsed = lines
        .map((l) => {
          try {
            return JSON.parse(l) as SocietyInvite;
          } catch {
            return null;
          }
        })
        .filter((inv): inv is SocietyInvite => inv !== null);

      if (parsed.length > 0) {
        // Merge with memory cache
        const map = new Map<string, SocietyInvite>();
        for (const seed of SEED_INVITES) map.set(seed.code.toUpperCase(), seed);
        for (const mem of memoryInvites) map.set(mem.code.toUpperCase(), mem);
        for (const item of parsed) map.set(item.code.toUpperCase(), item);
        memoryInvites = Array.from(map.values());
        return memoryInvites;
      }
    }

    return memoryInvites;
  } catch (err) {
    console.error("Error reading invites:", err);
    return memoryInvites;
  }
}

export function saveAllInvitesToStorage(invites: SocietyInvite[]): void {
  try {
    memoryInvites = [...invites];

    if (!fs.existsSync(WRITABLE_DIR)) {
      fs.mkdirSync(WRITABLE_DIR, { recursive: true });
    }
    const content = invites.map((inv) => JSON.stringify(inv)).join("\n") + "\n";
    fs.writeFileSync(WRITABLE_INVITES_FILE, content, "utf-8");

    // Also attempt saving to repo data file if not in serverless
    if (!IS_SERVERLESS) {
      if (!fs.existsSync(REPO_DATA_DIR)) {
        fs.mkdirSync(REPO_DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(REPO_INVITES_FILE, content, "utf-8");
    }

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          const dbRows = invites.map(mapInviteToDb);
          const { error } = await supabase.from('invites').upsert(dbRows, { onConflict: 'id' });
          if (error) console.error("Error upserting invites to Supabase:", error);
        } catch (err) {
          console.error("Supabase upsert catch (invites):", err);
        }
      })();
    }
  } catch (err) {
    console.error("Error saving invites:", err);
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
      createdBy: "ALLEN",
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
      createdBy: "ALLEN",
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
