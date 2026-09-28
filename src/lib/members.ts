import fs from "fs";
import path from "path";
import { SocietyMember } from "@/lib/types";
import { getShootersFromStorage } from "@/lib/shooters";

// File paths
const REPO_DATA_DIR = path.join(process.cwd(), "data");
const REPO_MEMBERS_FILE = path.join(REPO_DATA_DIR, "society-members.jsonl");

// Serverless writable directory
const IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const WRITABLE_DIR = IS_SERVERLESS ? "/tmp" : REPO_DATA_DIR;
const WRITABLE_MEMBERS_FILE = IS_SERVERLESS
  ? path.join("/tmp", "subsonic-members.jsonl")
  : REPO_MEMBERS_FILE;

export const SEED_MEMBERS: SocietyMember[] = [
  {
    member_id: "SS-2026-0001",
    full_name: "Rob Neilson",
    callsign: "RADAR",
    email: "rob@subsonicsociety.com",
    state: "TN",
    experience_level: "Lead Developer & Tech Advisor",
    rifle_setup: "Smart Systems Integrations",
    interests: ["Smart Systems Integrations", "Dev Operations", "AI & Telemetry", "Private Comms", "Tech Advisory"],
    created_at: "2026-07-04T12:00:00Z",
    status: "ACTIVE",
    role: "MASTER_OWNER",
    notes: "Master Owner, Lead Developer & Tech Advisor — Smart Systems Integrations (PIN: 2468 | Callsign: RADAR)",
  },
  {
    member_id: "SS-2026-0002",
    full_name: "Allen Hurley",
    callsign: "ALLEN",
    email: "allen@subsonicsociety.com",
    state: "TN",
    experience_level: "Owner Admin / Executive",
    rifle_setup: "Modacam Custom Precision V-22 / ZCO 527",
    interests: ["Society Leadership", "Executive Comms", "Match Operations", "The Hideout Bristol"],
    created_at: "2026-07-04T12:00:00Z",
    status: "ACTIVE",
    role: "OWNER_ADMIN",
    notes: "Owner Admin & Executive — Full Management Authority (PIN: 620620)",
  },
  {
    member_id: "SS-2026-1001",
    full_name: "Wyatt 'Ghost' Sterling",
    callsign: "GHOST",
    email: "wyatt.sterling@precisionappalachia.com",
    state: "TN",
    experience_level: "Master / Pro Series",
    rifle_setup: "Vudoo V-22 / Bartlein 1:16 / MDT ACC Elite",
    interests: ["Competition", "Subsonic DNA", "Barricade Training"],
    created_at: "2026-08-01T14:22:10Z",
    status: "ACTIVE",
  },
  {
    member_id: "SS-2026-1042",
    full_name: "Kendra 'Coldbore' Cross",
    callsign: "COLDBORE",
    email: "kendra.cross@southeastrimfire.org",
    state: "VA",
    experience_level: "Master / Pro Series",
    rifle_setup: "RimX / Proof Carbon 20\" / Foundation Centurion",
    interests: ["Competition", "Subsonic DNA", "Youth Mentorship"],
    created_at: "2026-08-05T09:14:30Z",
    status: "ACTIVE",
  },
  {
    member_id: "SS-2026-1118",
    full_name: "Eli McAllister",
    callsign: "DIALED",
    email: "eli.mcallister@blueridgeprs.com",
    state: "NC",
    experience_level: "Production Champion",
    rifle_setup: "CZ 457 MTR / Area 419 Rail / Vortex Venom",
    interests: ["Competition", "Ammunition Testing"],
    created_at: "2026-08-11T18:45:00Z",
    status: "ACTIVE",
  },
  {
    member_id: "SS-2026-1205",
    full_name: "Garrett Vance",
    callsign: "VANCE-22",
    email: "garrett.vance@holstonprecision.net",
    state: "TN",
    experience_level: "Senior Master",
    rifle_setup: "Modacam Custom V-22 / Benchmark 22\" / MDT ACC",
    interests: ["Competition", "Appalachian Matches", "Gunsmithing"],
    created_at: "2026-08-18T11:30:15Z",
    status: "ACTIVE",
  },
  {
    member_id: "SS-2026-1330",
    full_name: "Sarah 'Apex' Jenkins",
    callsign: "APEX-LADY",
    email: "sarah.jenkins@precisionrimfire.io",
    state: "KY",
    experience_level: "Competitor",
    rifle_setup: "Vudoo V-22 / March FX 5-42 / KRG Whiskey-3",
    interests: ["Competition", "Long Range 400Yd", "Subsonic DNA"],
    created_at: "2026-08-25T16:02:40Z",
    status: "ACTIVE",
  },
  {
    member_id: "SS-2026-1412",
    full_name: "Mason Brooks",
    callsign: "BROOKS-TN",
    email: "mason.brooks@tennesseerimfire.com",
    state: "TN",
    experience_level: "Competitor",
    rifle_setup: "Tikka T1x / KRG Bravo / Bushnell Match Pro ED",
    interests: ["Competition", "Ballistics"],
    created_at: "2026-09-01T10:15:00Z",
    status: "ACTIVE",
  },
  {
    member_id: "SS-2026-1509",
    full_name: "Colton 'Dope' Reynolds",
    callsign: "DOPE-COLT",
    email: "c.reynolds@georgiaprecision.com",
    state: "GA",
    experience_level: "Marksman",
    rifle_setup: "Bergara B14R / Vortex Razor HD Gen III",
    interests: ["Subsonic DNA", "Ammunition Lot Testing"],
    created_at: "2026-09-05T13:40:22Z",
    status: "ACTIVE",
  },
  {
    member_id: "SS-2026-1620",
    full_name: "Trevor Vance",
    callsign: "TREV-WV",
    email: "trevor.vance@appalachianrimfire.com",
    state: "WV",
    experience_level: "Intermediate Competitor",
    rifle_setup: "CZ 457 Varmint / Arken EP5 5-25",
    interests: ["Competition", "Regional Matches"],
    created_at: "2026-09-08T08:20:10Z",
    status: "ACTIVE",
  },
  {
    member_id: "SS-2026-TEST",
    full_name: "TEST",
    callsign: "TEST",
    email: "test@member.subsonicsociety.com",
    state: "TN",
    experience_level: "Open Division Pro",
    rifle_setup: "Vudoo V-22 / ZCO 527 / MDT ACC Elite",
    interests: ["Competition", "PRS Rimfire", "Subsonic DNA"],
    created_at: "2026-09-28T17:00:00Z",
    status: "ACTIVE",
    role: "PRO_COMPETITOR",
    notes: "Pro VIP Verified Competitor (Callsign: TEST)",
  },
];

let memoryMembers: SocietyMember[] = [...SEED_MEMBERS];

export function getMembersFromStorage(): SocietyMember[] {
  try {
    const memberMap = new Map<string, SocietyMember>();

    // 1. Seed members first
    for (const sm of SEED_MEMBERS) {
      memberMap.set(sm.member_id.toLowerCase(), sm);
      if (sm.callsign) memberMap.set(sm.callsign.toLowerCase(), sm);
    }

    // 2. Overlay from memory cache
    for (const mem of memoryMembers) {
      memberMap.set(mem.member_id.toLowerCase(), mem);
      if (mem.callsign) memberMap.set(mem.callsign.toLowerCase(), mem);
    }

    // 3. Overlay from repo JSONL file
    if (fs.existsSync(REPO_MEMBERS_FILE)) {
      try {
        const raw = fs.readFileSync(REPO_MEMBERS_FILE, "utf-8");
        const lines = raw.split("\n").filter((l) => l.trim().length > 0);
        for (const line of lines) {
          try {
            const m = JSON.parse(line) as SocietyMember;
            if (m && m.member_id) {
              memberMap.set(m.member_id.toLowerCase(), m);
              if (m.callsign) memberMap.set(m.callsign.toLowerCase(), m);
            }
          } catch {}
        }
      } catch (err) {
        console.warn("Error reading repo members file:", err);
      }
    }

    // 4. If serverless, overlay from /tmp
    if (IS_SERVERLESS && fs.existsSync(WRITABLE_MEMBERS_FILE)) {
      try {
        const raw = fs.readFileSync(WRITABLE_MEMBERS_FILE, "utf-8");
        const lines = raw.split("\n").filter((l) => l.trim().length > 0);
        for (const line of lines) {
          try {
            const m = JSON.parse(line) as SocietyMember;
            if (m && m.member_id) {
              memberMap.set(m.member_id.toLowerCase(), m);
              if (m.callsign) memberMap.set(m.callsign.toLowerCase(), m);
            }
          } catch {}
        }
      } catch (err) {
        console.warn("Error reading /tmp members file:", err);
      }
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
      rob.rifle_setup = "Smart Systems Integrations";
      rob.experience_level = "Lead Developer & Tech Advisor";
      memberMap.set(rob.member_id.toLowerCase(), rob);
    }

    const allen = Array.from(memberMap.values()).find(
      (m) =>
        m.member_id === "SS-2026-0002" ||
        m.callsign === "ALLEN" ||
        (m.full_name.toLowerCase().includes("allen") && m.full_name.toLowerCase().includes("hurley"))
    );
    if (!allen) {
      memberMap.set(SEED_MEMBERS[1].member_id.toLowerCase(), SEED_MEMBERS[1]);
    } else {
      allen.member_id = "SS-2026-0002";
      allen.role = "OWNER_ADMIN";
      allen.callsign = "ALLEN";
      memberMap.set(allen.member_id.toLowerCase(), allen);
    }

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

export function addOrUpdateMember(member: SocietyMember): SocietyMember {
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

export function deleteMemberFromStorage(memberId: string): boolean {
  if (memberId === "SS-2026-0001" || memberId === "SS-2026-0002") {
    return false; // Cannot delete root executive accounts
  }

  const current = getMembersFromStorage();
  const filtered = current.filter((m) => m.member_id !== memberId);
  if (filtered.length === current.length) {
    return false;
  }

  saveAllMembersToStorage(filtered);
  return true;
}
