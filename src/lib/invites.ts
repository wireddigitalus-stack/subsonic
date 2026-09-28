import fs from "fs";
import path from "path";
import { SocietyInvite, InviteTier } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const INVITES_FILE = path.join(DATA_DIR, "invites.jsonl");

export const SEED_INVITES: SocietyInvite[] = [
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

export function getInvitesFromStorage(): SocietyInvite[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(INVITES_FILE)) {
      const initialLines = SEED_INVITES.map((inv) => JSON.stringify(inv)).join("\n") + "\n";
      fs.writeFileSync(INVITES_FILE, initialLines, "utf-8");
      return SEED_INVITES;
    }

    const raw = fs.readFileSync(INVITES_FILE, "utf-8");
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

    return parsed.length > 0 ? parsed : SEED_INVITES;
  } catch (err) {
    console.error("Error reading invites:", err);
    return SEED_INVITES;
  }
}

export function saveAllInvitesToStorage(invites: SocietyInvite[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const content = invites.map((inv) => JSON.stringify(inv)).join("\n") + "\n";
    fs.writeFileSync(INVITES_FILE, content, "utf-8");
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
