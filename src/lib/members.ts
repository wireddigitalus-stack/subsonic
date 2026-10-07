import fs from "fs";
import { db, isDbConfigured } from "@/lib/supabase-admin";
import path from "path";
import { SocietyMember } from "@/lib/types";
import { getShootersFromStorage } from "@/lib/shooters";
import { toPinHash } from "@/lib/pin-hash";

// File paths
const REPO_DATA_DIR = path.join(process.cwd(), "data");
const REPO_MEMBERS_FILE = path.join(REPO_DATA_DIR, "society-members.jsonl");

// Serverless writable directory
const IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const WRITABLE_DIR = IS_SERVERLESS ? "/tmp" : REPO_DATA_DIR;
const WRITABLE_MEMBERS_FILE = IS_SERVERLESS
  ? path.join("/tmp", "subsonic-members.jsonl")
  : REPO_MEMBERS_FILE;

// On the live (serverless) site the database is the single source of truth.
// Local per-instance files are ignored there because they go stale across instances.
const DB_AUTHORITATIVE = IS_SERVERLESS && isDbConfigured;

export const SEED_MEMBERS: SocietyMember[] = [
  {
    member_id: "SS-2026-0001",
    full_name: "Rob Neilson",
    callsign: "RADAR",
    email: "rob@subsonicsociety.com",
    state: "TN",
    experience_level: "Master Admin",
    rifle_setup: "Systems & Infrastructure Architecture (Non-Shooter)",
    interests: ["Systems Engineering", "Network Infrastructure", "Telemetry Uplinks", "Private Encrypted Comms", "Server Architecture", "Smart Systems Integrations"],
    created_at: "2026-07-04T12:00:00Z",
    status: "ACTIVE",
    role: "MASTER_OWNER",
    notes: "Master Admin — Systems Architecture & Network Operations (Callsign: RADAR)",
  },
  {
    member_id: "SS-PRO-SUBX",
    full_name: "Allen Hurley",
    callsign: "SUBX",
    email: "ahurley@subsonicsociety.com",
    state: "TN",
    experience_level: "Owner Admin / Executive",
    rifle_setup: "Modacam Custom Precision V-22 / ZCO 527",
    interests: ["Society Leadership", "Executive Comms", "Match Operations", "Precision Rimfire"],
    created_at: "2026-10-05T12:33:56.012Z",
    status: "ACTIVE",
    role: "OWNER_ADMIN",
    notes: "Owner Admin & Executive — Full Management Authority (Callsign: SUBX)",
  },
];

let memoryMembers: SocietyMember[] = [...SEED_MEMBERS];
let membersLastRefreshMs = 0;
let membersRefreshInFlight: Promise<void> | null = null;

// ---- Database mapping (live table stores the PIN as a hash in `pin_hash`) ----
export function mapMemberToDb(m: SocietyMember) {
  return {
    member_id: m.member_id,
    full_name: m.full_name,
    callsign: m.callsign ?? null,
    email: m.email ?? null,
    state: m.state ?? "TN",
    experience_level: m.experience_level ?? null,
    rifle_setup: m.rifle_setup ?? null,
    interests: m.interests ?? [],
    created_at: m.created_at ?? new Date().toISOString(),
    status: m.status ?? "ACTIVE",
    role: m.role ?? "MEMBER",
    notes: m.notes ?? null,
    pin_hash: toPinHash(m.pin),
  };
}

function mapDbToMember(row: any): SocietyMember {
  return {
    member_id: row.member_id,
    full_name: row.full_name,
    callsign: row.callsign ?? undefined,
    email: row.email ?? undefined,
    state: row.state ?? "TN",
    experience_level: row.experience_level ?? "",
    rifle_setup: row.rifle_setup ?? undefined,
    interests: row.interests ?? [],
    created_at: row.created_at,
    status: row.status ?? "ACTIVE",
    role: row.role ?? "MEMBER",
    notes: row.notes ?? undefined,
    pin: row.pin_hash ?? undefined,
  } as SocietyMember;
}

/**
 * Pull the latest members from the database into the in-memory cache.
 * Await this at the top of any API route that needs up-to-date member data.
 */
export async function refreshMembersFromDb(maxAgeMs = 3000): Promise<void> {
  if (!db) return;
  if (Date.now() - membersLastRefreshMs < maxAgeMs) return;
  if (membersRefreshInFlight) return membersRefreshInFlight;

  membersRefreshInFlight = (async () => {
    try {
      const { data, error } = await db.from("society_members").select("*");
      if (error) {
        console.error("Error fetching members from database:", error.message);
        return;
      }
      const rows = (data || []).map(mapDbToMember);
      if (DB_AUTHORITATIVE) {
        memoryMembers = rows;
      } else {
        const map = new Map<string, SocietyMember>();
        for (const m of memoryMembers) map.set(m.member_id.toLowerCase(), m);
        for (const m of rows) map.set(m.member_id.toLowerCase(), m);
        memoryMembers = Array.from(map.values());
      }
      membersLastRefreshMs = Date.now();
    } catch (err) {
      console.error("Database refresh error (members):", err);
    } finally {
      membersRefreshInFlight = null;
    }
  })();
  return membersRefreshInFlight;
}

function readMembersFile(file: string, into: Map<string, SocietyMember>) {
  if (!fs.existsSync(file)) return;
  try {
    const raw = fs.readFileSync(file, "utf-8");
    const lines = raw.split("\n").filter((l) => l.trim().length > 0);
    for (const line of lines) {
      try {
        const m = JSON.parse(line) as SocietyMember;
        if (m && m.member_id) {
          into.set(m.member_id.toLowerCase(), m);
          if (m.callsign) into.set(m.callsign.toLowerCase(), m);
        }
      } catch {}
    }
  } catch (err) {
    console.warn("Error reading members file:", err);
  }
}

export function getMembersFromStorage(): SocietyMember[] {
  // Kick off a background refresh for sync callers (routes should await refreshMembersFromDb()).
  if (db && membersLastRefreshMs === 0) void refreshMembersFromDb();

  try {
    const memberMap = new Map<string, SocietyMember>();

    // 1. Seed members first
    for (const sm of SEED_MEMBERS) {
      memberMap.set(sm.member_id.toLowerCase(), sm);
      if (sm.callsign) memberMap.set(sm.callsign.toLowerCase(), sm);
    }

    // 2. Local files (skipped on the live site where the database is authoritative)
    if (!DB_AUTHORITATIVE) {
      readMembersFile(REPO_MEMBERS_FILE, memberMap);
      if (IS_SERVERLESS) readMembersFile(WRITABLE_MEMBERS_FILE, memberMap);
    }

    // 3. Memory cache last — it holds the freshest database data + this instance's writes
    for (const mem of memoryMembers) {
      memberMap.set(mem.member_id.toLowerCase(), mem);
      if (mem.callsign) memberMap.set(mem.callsign.toLowerCase(), mem);
    }

    // 5. Cross-sync Shooters into Society Members
    try {
      const shooters = getShootersFromStorage();
      for (const sh of shooters) {
        const key = sh.callsign?.toLowerCase() || sh.id.toLowerCase();
        if (!memberMap.has(key)) {
          const proMember: SocietyMember = {
            member_id: `SS-PRO-${sh.callsign || sh.id.toUpperCase()}`,
            full_name: sh.name,
            callsign: sh.callsign || sh.id.toUpperCase(),
            email: `${(sh.callsign || sh.id).toLowerCase()}@competitor.subsonicsociety.com`,
            state: "TN",
            experience_level: sh.division || "Pro Competitor",
            rifle_setup: `${sh.rifleSetup?.action || "Precision Rig"} / ${sh.rifleSetup?.optic || "Optic"}`,
            interests: ["Competition", "PRS Rimfire", "Subsonic DNA"],
            created_at: sh.createdAt || new Date().toISOString(),
            status: "ACTIVE",
            role: "MEMBER",
            notes: `Pro Series Marksman. Podiums: ${sh.podiums}. Home Range: ${sh.homeRange}`,
          };
          memberMap.set(key, proMember);
        }
      }
    } catch (e) {
      console.warn("Cross-sync shooters to members error:", e);
    }

    // 6. Guarantee Rob Neilson and Allen Hurley remain Master Owner / Owner Admin
    const rob = Array.from(memberMap.values()).find(
      (m) =>
        m.member_id === "SS-2026-0001" ||
        m.callsign === "RADAR" ||
        (m.full_name.toLowerCase().includes("rob") && m.full_name.toLowerCase().includes("neilson"))
    );
    if (!rob) {
      memberMap.set(SEED_MEMBERS[0].member_id.toLowerCase(), SEED_MEMBERS[0]);
    } else {
      rob.member_id = "SS-2026-0001";
      rob.full_name = "Rob Neilson";
      rob.role = "MASTER_OWNER";
      rob.callsign = "RADAR";
      rob.rifle_setup = "Systems & Infrastructure Architecture (Non-Shooter)";
      rob.experience_level = "Master Admin";
      rob.notes = "Master Admin — Systems Architecture & Network Operations (Callsign: RADAR)";
      memberMap.set(rob.member_id.toLowerCase(), rob);
    }

    const allen = Array.from(memberMap.values()).find(
      (m) =>
        m.member_id === "SS-PRO-SUBX" ||
        m.callsign === "SUBX" ||
        m.callsign === "ALLEN" ||
        (m.full_name.toLowerCase().includes("allen") && m.full_name.toLowerCase().includes("hurley"))
    );
    if (!allen) {
      memberMap.set(SEED_MEMBERS[1].member_id.toLowerCase(), SEED_MEMBERS[1]);
    } else {
      allen.member_id = "SS-PRO-SUBX";
      allen.role = "OWNER_ADMIN";
      allen.callsign = "SUBX";
      memberMap.set(allen.member_id.toLowerCase(), allen);
    }
    memberMap.delete("ss-2026-0002");

    // Unique by member_id
    const finalMembersMap = new Map<string, SocietyMember>();
    for (const m of Array.from(memberMap.values())) {
      finalMembersMap.set(m.member_id, m);
    }

    const result = Array.from(finalMembersMap.values());
    memoryMembers = result;
    return result;
  } catch (err) {
    console.error("Error retrieving society members:", err);
    return memoryMembers;
  }
}

export function saveAllMembersToStorage(members: SocietyMember[]): void {
  try {
    memoryMembers = members;

    if (!fs.existsSync(WRITABLE_DIR)) {
      fs.mkdirSync(WRITABLE_DIR, { recursive: true });
    }

    const serialized = members.map((m) => JSON.stringify(m)).join("\n") + "\n";
    fs.writeFileSync(WRITABLE_MEMBERS_FILE, serialized, "utf-8");

    if (!IS_SERVERLESS) {
      if (!fs.existsSync(REPO_DATA_DIR)) {
        fs.mkdirSync(REPO_DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(REPO_MEMBERS_FILE, serialized, "utf-8");
    }
  } catch (err) {
    console.error("Error saving members to storage:", err);
  }
}

export async function upsertMemberToDb(member: SocietyMember): Promise<void> {
  if (!db) return;
  const { error } = await db
    .from("society_members")
    .upsert(mapMemberToDb(member), { onConflict: "member_id" });
  if (error) throw new Error(`Database save failed (member): ${error.message}`);
}

function applyMemberLocally(member: SocietyMember): SocietyMember {
  const current = getMembersFromStorage();
  const index = current.findIndex(
    (m) =>
      m.member_id === member.member_id ||
      (m.callsign && member.callsign && m.callsign.toUpperCase() === member.callsign.toUpperCase()) ||
      (m.email && member.email && m.email.toLowerCase() === member.email.toLowerCase())
  );

  let updatedList: SocietyMember[];
  let savedMember: SocietyMember;

  if (index >= 0) {
    savedMember = {
      ...current[index],
      ...member,
    };
    updatedList = [...current];
    updatedList[index] = savedMember;
  } else {
    savedMember = member;
    updatedList = [savedMember, ...current];
  }

  saveAllMembersToStorage(updatedList);
  return savedMember;
}

/**
 * Save a member and WAIT for the database to confirm. Throws if the database rejects it.
 * Use this from API routes.
 */
export async function addOrUpdateMemberAsync(member: SocietyMember): Promise<SocietyMember> {
  const savedMember = applyMemberLocally(member);
  await upsertMemberToDb(savedMember);
  return savedMember;
}

/** Legacy sync save (database write is best-effort). Prefer addOrUpdateMemberAsync. */
export function addOrUpdateMember(member: SocietyMember): SocietyMember {
  const savedMember = applyMemberLocally(member);
  upsertMemberToDb(savedMember).catch((err) => console.error(err.message));

  return savedMember;
}

export function deleteMemberFromStorage(memberId: string): boolean {
  if (!memberId) return false;
  const cleanId = memberId.trim().toUpperCase();

  if (
    cleanId === "SS-2026-0001" ||
    cleanId === "SS-PRO-SUBX" ||
    cleanId === "RADAR" ||
    cleanId === "SUBX" ||
    cleanId === "ROB" ||
    cleanId === "ALLEN" ||
    cleanId === "LTDAN" ||
    cleanId === "AHURLEY"
  ) {
    return false; // Cannot delete root executive accounts
  }

  const rawLower = memberId.trim().toLowerCase();
  const rawSlug = rawLower.replace(/[^a-z0-9]+/g, "-");
  const strippedPro = cleanId.replace(/^SS-PRO-/, "");

  const current = getMembersFromStorage();
  const target = current.find(
    (m) =>
      m.member_id.toUpperCase() === cleanId ||
      m.member_id.toLowerCase() === rawLower ||
      (m.callsign && m.callsign.toUpperCase() === cleanId) ||
      (m.callsign && m.callsign.toUpperCase() === strippedPro) ||
      (m.full_name && m.full_name.toUpperCase() === cleanId) ||
      (m.full_name && m.full_name.toLowerCase() === rawLower) ||
      (m.full_name && m.full_name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === rawSlug) ||
      (m.email && m.email.toLowerCase() === rawLower)
  );

  if (!target) {
    // If not found in memoryMembers or file directly, try cross-deleting from shooters in case it was a shooter
    try {
      const { deleteShooterFromStorage } = require("@/lib/shooters");
      deleteShooterFromStorage(cleanId);
      deleteShooterFromStorage(strippedPro);
      deleteShooterFromStorage(rawLower);
    } catch {}
    return true; // Return true so client doesn't error out on already-clean or local-only members
  }

  const targetMemberId = target.member_id.toUpperCase();
  const targetCallsign = target.callsign?.toUpperCase();
  const targetName = target.full_name;

  const filtered = current.filter(
    (m) =>
      m.member_id.toUpperCase() !== targetMemberId &&
      (!targetCallsign || m.callsign?.toUpperCase() !== targetCallsign) &&
      (!targetName || m.full_name?.toLowerCase() !== targetName.toLowerCase())
  );

  memoryMembers = filtered;
  saveAllMembersToStorage(filtered);

  // Cross-clean shooter profile if exists
  try {
    const { deleteShooterFromStorage } = require("@/lib/shooters");
    if (targetCallsign) deleteShooterFromStorage(targetCallsign);
    deleteShooterFromStorage(target.member_id);
    deleteShooterFromStorage(target.full_name);
    deleteShooterFromStorage(rawSlug);
  } catch (e) {
    // Avoid circular import errors
  }

  lastMemberDbDelete = (async () => {
    if (!db) return;
    try {
      await db.from("society_members").delete().eq("member_id", target.member_id);
      if (targetCallsign) {
        await db.from("society_members").delete().ilike("callsign", targetCallsign);
      }
      if (targetName) {
        await db.from("society_members").delete().ilike("full_name", targetName);
      }
    } catch (err) {
      console.error("Database delete error (members):", err);
    }
  })();

  return true;
}

let lastMemberDbDelete: Promise<void> = Promise.resolve();

/** Delete a member and wait for the database delete to finish. */
export async function deleteMemberFromStorageAsync(memberId: string): Promise<boolean> {
  const ok = deleteMemberFromStorage(memberId);
  await lastMemberDbDelete;
  return ok;
}
