import { db } from "./supabase-admin";

/**
 * Presence tracker for active shooters in Subsonic Society chat.
 * Backed by Supabase (`chat_messages` system row `__system_presence__`) + in-memory cache
 * so presence is shared across all Vercel serverless instances (mobile + desktop).
 */

const PRESENCE_TIMEOUT_MS = 90_000; // 90 seconds active window
const PRESENCE_ROW_ID = "__system_presence__";
const PRESENCE_CHANNEL_ID = "__system_channels__";

// Map of normalized callsign -> last active epoch ms
const activeMarksmen = new Map<string, number>();
let lastDbFetchMs = 0;
let lastDbWriteMs = 0;
let pendingWritePromise: Promise<void> | null = null;

function canonicalizeCallsign(raw: string): string[] {
  const clean = raw.trim().toUpperCase();
  if (!clean || clean === "GUEST") return [];
  if (["ALLEN", "AHURLEY", "HURLEY", "SAID DONE", "SAIDDONE", "SUBX"].includes(clean)) {
    return ["SUBX", "ALLEN"];
  }
  if (["ROB", "LTDAN", "RADAR"].includes(clean)) {
    return ["RADAR", "ROB"];
  }
  return [clean];
}

async function syncPresenceFromDb(force = false): Promise<void> {
  if (!db) return;
  const now = Date.now();
  if (!force && now - lastDbFetchMs < 2500) return;
  lastDbFetchMs = now;

  try {
    const { data, error } = await db
      .from("chat_messages")
      .select("content")
      .eq("id", PRESENCE_ROW_ID)
      .maybeSingle();

    if (!error && data?.content) {
      const parsed = JSON.parse(data.content);
      if (parsed && typeof parsed === "object") {
        for (const [cs, ts] of Object.entries(parsed)) {
          if (typeof ts === "number") {
            const existing = activeMarksmen.get(cs) || 0;
            if (ts > existing) {
              activeMarksmen.set(cs, ts);
            }
          }
        }
      }
    }
  } catch {
    // Ignore transient DB read errors
  }
}

async function flushPresenceToDb(force = false): Promise<void> {
  if (!db) return;
  const now = Date.now();
  if (!force && now - lastDbWriteMs < 2500) return;
  lastDbWriteMs = now;

  const mapObj: Record<string, number> = {};
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  activeMarksmen.forEach((ts, cs) => {
    if (ts >= sevenDaysAgo) {
      mapObj[cs] = ts;
    }
  });

  const payload = {
    id: PRESENCE_ROW_ID,
    channel_id: PRESENCE_CHANNEL_ID,
    type: "STANDARD",
    dope_card: null,
    author: {
      id: "system_presence",
      name: "System Presence",
      callsign: "SYSTEM",
      role: "ADMIN",
    },
    content: JSON.stringify(mapObj),
    created_at: new Date(now).toISOString(),
    reactions: [],
    moderation_status: "APPROVED",
    ai_moderation_report: null,
  };

  try {
    await db.from("chat_messages").upsert(payload, { onConflict: "id" });
  } catch {
    // Ignore transient DB write errors
  }
}

export function recordHeartbeat(callsign?: string, timestampMs = Date.now()): void {
  if (!callsign) return;
  const keys = canonicalizeCallsign(callsign);
  if (keys.length === 0) return;

  for (const k of keys) {
    activeMarksmen.set(k, timestampMs);
  }

  // Prune if over 2000 entries
  if (activeMarksmen.size > 2000) {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    activeMarksmen.forEach((lastSeen, cs) => {
      if (lastSeen < thirtyDaysAgo) {
        activeMarksmen.delete(cs);
      }
    });
  }

  // Fire-and-forget DB sync
  if (db && !pendingWritePromise) {
    pendingWritePromise = syncPresenceFromDb()
      .then(() => flushPresenceToDb())
      .finally(() => {
        pendingWritePromise = null;
      });
  }
}

export function recordLogout(callsign?: string): void {
  if (!callsign) return;
  const keys = canonicalizeCallsign(callsign);
  const expiredTs = Date.now() - PRESENCE_TIMEOUT_MS - 5000;
  for (const k of keys) {
    activeMarksmen.set(k, expiredTs);
  }
  if (db) {
    void flushPresenceToDb(true);
  }
}

export function getOnlineCallsigns(): string[] {
  const now = Date.now();
  const onlineSet = new Set<string>();

  activeMarksmen.forEach((lastSeen, callsign) => {
    if (now - lastSeen < PRESENCE_TIMEOUT_MS) {
      const primary = canonicalizeCallsign(callsign)[0] || callsign;
      onlineSet.add(primary);
    }
  });

  return Array.from(onlineSet);
}

export function getLastActiveMap(): Record<string, number> {
  const map: Record<string, number> = {};
  activeMarksmen.forEach((lastSeen, callsign) => {
    map[callsign] = lastSeen;
  });
  return map;
}

export function getPresenceSnapshot(): {
  onlineCallsigns: string[];
  lastActiveMap: Record<string, number>;
} {
  const now = Date.now();
  const onlineSet = new Set<string>();
  const lastActiveMap: Record<string, number> = {};

  activeMarksmen.forEach((lastSeen, callsign) => {
    lastActiveMap[callsign] = lastSeen;
    if (now - lastSeen < PRESENCE_TIMEOUT_MS) {
      const primary = canonicalizeCallsign(callsign)[0] || callsign;
      onlineSet.add(primary);
    }
  });

  return { onlineCallsigns: Array.from(onlineSet), lastActiveMap };
}

export async function getPresenceSnapshotAsync(callerCallsign?: string): Promise<{
  onlineCallsigns: string[];
  lastActiveMap: Record<string, number>;
}> {
  await syncPresenceFromDb();
  if (callerCallsign) {
    const keys = canonicalizeCallsign(callerCallsign);
    const now = Date.now();
    for (const k of keys) {
      activeMarksmen.set(k, now);
    }
    await flushPresenceToDb();
  }
  return getPresenceSnapshot();
}

export function isCallsignOnline(callsign?: string): boolean {
  if (!callsign) return false;
  const keys = canonicalizeCallsign(callsign);
  for (const k of keys) {
    const lastSeen = activeMarksmen.get(k);
    if (lastSeen && Date.now() - lastSeen < PRESENCE_TIMEOUT_MS) {
      return true;
    }
  }
  return false;
}
