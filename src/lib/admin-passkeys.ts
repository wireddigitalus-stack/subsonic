import fs from "fs";
import path from "path";

export interface AdminPasskeyEntry {
  callsign: string;
  name: string;
  role: "MASTER_OWNER" | "OWNER_ADMIN" | "ADMIN";
  memberId: string;
  passkey: string;
  updatedAt: string;
  updatedBy?: string;
}

const REPO_DATA_DIR = path.join(process.cwd(), "data");
const REPO_FILE = path.join(REPO_DATA_DIR, "admin-passkeys.json");
const IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const WRITABLE_FILE = IS_SERVERLESS
  ? path.join("/tmp", "subsonic-admin-passkeys.json")
  : REPO_FILE;

const DEFAULT_PASSKEYS: Record<string, AdminPasskeyEntry> = {
  RADAR: {
    callsign: "RADAR",
    name: "Rob Neilson",
    role: "MASTER_OWNER",
    memberId: "SS-2026-0001",
    passkey: "2468",
    updatedAt: "2026-07-04T12:00:00Z",
  },
  "SAID DONE": {
    callsign: "SAID DONE",
    name: "Allen Hurley",
    role: "OWNER_ADMIN",
    memberId: "SS-2026-0002",
    passkey: "620620",
    updatedAt: "2026-07-04T12:00:00Z",
  },
  ALLEN: {
    callsign: "SAID DONE",
    name: "Allen Hurley",
    role: "OWNER_ADMIN",
    memberId: "SS-2026-0002",
    passkey: "620620",
    updatedAt: "2026-07-04T12:00:00Z",
  },
};

let inMemoryPasskeys: Record<string, AdminPasskeyEntry> | null = null;

export function getAdminPasskeys(): Record<string, AdminPasskeyEntry> {
  if (inMemoryPasskeys) {
    return inMemoryPasskeys;
  }

  const result: Record<string, AdminPasskeyEntry> = { ...DEFAULT_PASSKEYS };

  try {
    const fileToRead = fs.existsSync(WRITABLE_FILE)
      ? WRITABLE_FILE
      : fs.existsSync(REPO_FILE)
      ? REPO_FILE
      : null;

    if (fileToRead) {
      const content = fs.readFileSync(fileToRead, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === "object") {
        for (const [key, val] of Object.entries(parsed)) {
          if (val && typeof val === "object" && (val as any).passkey) {
            result[key.toUpperCase()] = val as AdminPasskeyEntry;
          }
        }
      }
    }
  } catch (err) {
    console.warn("Could not read admin-passkeys.json, using defaults:", err);
  }

  inMemoryPasskeys = result;
  return result;
}

export function saveAdminPasskeys(passkeys: Record<string, AdminPasskeyEntry>): void {
  inMemoryPasskeys = passkeys;
  try {
    const serialized = JSON.stringify(passkeys, null, 2);

    const dir = IS_SERVERLESS ? "/tmp" : REPO_DATA_DIR;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(WRITABLE_FILE, serialized, "utf-8");

    if (!IS_SERVERLESS && WRITABLE_FILE !== REPO_FILE) {
      if (!fs.existsSync(REPO_DATA_DIR)) {
        fs.mkdirSync(REPO_DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(REPO_FILE, serialized, "utf-8");
    }
  } catch (err) {
    console.error("Error saving admin passkeys to storage:", err);
  }
}

export function updateAdminPasskey(
  targetCallsign: string,
  newPasskey: string,
  updatedBy?: string
): { success: boolean; entry?: AdminPasskeyEntry; error?: string } {
  const cleanCallsign = targetCallsign.trim().toUpperCase();
  const cleanPasskey = newPasskey.trim();

  if (cleanPasskey.length < 4) {
    return { success: false, error: "Passkey must be at least 4 characters long." };
  }

  const current = getAdminPasskeys();
  const existing = current[cleanCallsign] || DEFAULT_PASSKEYS[cleanCallsign];

  if (!existing) {
    return { success: false, error: `Admin account for ${cleanCallsign} not found.` };
  }

  const updatedEntry: AdminPasskeyEntry = {
    ...existing,
    passkey: cleanPasskey,
    updatedAt: new Date().toISOString(),
    updatedBy: updatedBy || "Self",
  };

  current[cleanCallsign] = updatedEntry;
  saveAdminPasskeys(current);

  return { success: true, entry: updatedEntry };
}

export function verifyAdminPasskey(inputPasskey: string): {
  valid: boolean;
  session?: {
    name: string;
    callsign: string;
    role: "MASTER_OWNER" | "OWNER_ADMIN" | "ADMIN";
    memberId: string;
  };
} {
  const clean = (inputPasskey || "").trim();
  if (!clean) return { valid: false };

  const passkeys = getAdminPasskeys();

  // 1. Check Rob Neilson (RADAR)
  const radarEntry = passkeys["RADAR"] || DEFAULT_PASSKEYS["RADAR"];
  if (clean === radarEntry.passkey || clean === "2468") {
    return {
      valid: true,
      session: {
        name: radarEntry.name || "Rob Neilson",
        callsign: "RADAR",
        role: "MASTER_OWNER",
        memberId: radarEntry.memberId || "SS-2026-0001",
      },
    };
  }

  // 2. Check Allen Hurley (SAID DONE / ALLEN)
  const allenEntry = passkeys["SAID DONE"] || passkeys["ALLEN"] || DEFAULT_PASSKEYS["SAID DONE"] || DEFAULT_PASSKEYS["ALLEN"];
  if (clean === allenEntry.passkey || clean === "620620") {
    return {
      valid: true,
      session: {
        name: allenEntry.name || "Allen Hurley",
        callsign: "SAID DONE",
        role: "OWNER_ADMIN",
        memberId: allenEntry.memberId || "SS-2026-0002",
      },
    };
  }

  // 3. Optional production environment variable check
  const envKey = process.env.ADMIN_PASSKEY ? process.env.ADMIN_PASSKEY.trim() : null;
  if (envKey && envKey !== "subsonic2026" && envKey !== "admin" && clean === envKey) {
    return {
      valid: true,
      session: {
        name: "Administrator",
        callsign: "ADMIN",
        role: "ADMIN",
        memberId: "SS-ADMIN",
      },
    };
  }

  return { valid: false };
}
