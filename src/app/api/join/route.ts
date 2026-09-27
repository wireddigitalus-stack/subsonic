import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { supabase } from "@/lib/supabase";
import { SocietyMember } from "@/lib/types";

export const dynamic = "force-dynamic";

const DATA_DIR = path.join(process.cwd(), "data");
const MEMBERS_FILE = path.join(DATA_DIR, "society-members.jsonl");

const SEED_MEMBERS: SocietyMember[] = [
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
];

function ensureStorageInitialized(): SocietyMember[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    let fileMembers: SocietyMember[] = [];
    if (fs.existsSync(MEMBERS_FILE)) {
      const raw = fs.readFileSync(MEMBERS_FILE, "utf-8");
      const lines = raw.split("\n").filter((l) => l.trim().length > 0);
      fileMembers = lines
        .map((l) => {
          try {
            return JSON.parse(l) as SocietyMember;
          } catch {
            return null;
          }
        })
        .filter((m): m is SocietyMember => m !== null);
    }

    const memberMap = new Map<string, SocietyMember>();

    // 1. Seed baseline members first
    for (const sm of SEED_MEMBERS) {
      memberMap.set(sm.member_id, sm);
      if (sm.email) memberMap.set(sm.email.toLowerCase(), sm);
    }

    // 2. Overlay file members (persisting edits & new registrations)
    for (const fm of fileMembers) {
      memberMap.set(fm.member_id, fm);
      if (fm.email) memberMap.set(fm.email.toLowerCase(), fm);
    }

    // 3. Guarantee Rob Neilson and Allen Hurley are explicitly registered
    const rob = Array.from(memberMap.values()).find(
      (m) =>
        m.member_id === "SS-2026-0001" ||
        (m.full_name.toLowerCase().includes("rob") &&
         m.full_name.toLowerCase().includes("neilson")) ||
        m.callsign === "RADAR" ||
        m.callsign === "LTDAN" ||
        m.callsign === "ROB"
    );
    if (!rob) {
      memberMap.set(SEED_MEMBERS[0].member_id, SEED_MEMBERS[0]);
    } else {
      rob.member_id = "SS-2026-0001";
      rob.full_name = "Rob Neilson";
      rob.role = "MASTER_OWNER";
      rob.callsign = "RADAR";
      rob.rifle_setup = "Smart Systems Integrations";
      rob.experience_level = "Lead Developer & Tech Advisor";
      memberMap.set(rob.member_id, rob);
    }

    const allen = Array.from(memberMap.values()).find(
      (m) =>
        m.full_name.toLowerCase().includes("allen") &&
        m.full_name.toLowerCase().includes("hurley")
    );
    if (!allen) {
      memberMap.set(SEED_MEMBERS[1].member_id, SEED_MEMBERS[1]);
    } else {
      allen.role = "OWNER_ADMIN";
      allen.callsign = "ALLEN";
      memberMap.set(allen.member_id, allen);
    }

    const uniqueMembers = Array.from(new Set(memberMap.values()));

    // Persist full synchronized list to JSONL
    try {
      const serialized = uniqueMembers.map((m) => JSON.stringify(m)).join("\n") + "\n";
      fs.writeFileSync(MEMBERS_FILE, serialized, "utf-8");
    } catch (writeErr) {
      console.warn("Storage sync write error for society members:", writeErr);
    }

    return uniqueMembers;
  } catch (err) {
    console.warn("Storage init error for society members:", err);
    return SEED_MEMBERS;
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const exportFormat = searchParams.get("export");
    const search = searchParams.get("search")?.toLowerCase();
    const stateFilter = searchParams.get("state");

    let members = ensureStorageInitialized();

    // Reverse chronological order
    members.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    if (stateFilter && stateFilter !== "ALL") {
      members = members.filter((m) => m.state === stateFilter);
    }

    if (search) {
      members = members.filter(
        (m) =>
          m.full_name.toLowerCase().includes(search) ||
          m.email.toLowerCase().includes(search) ||
          m.member_id.toLowerCase().includes(search) ||
          m.rifle_setup.toLowerCase().includes(search)
      );
    }

    if (exportFormat === "csv") {
      const headers = ["Member ID", "Full Name", "Email", "State", "Experience", "Rifle Setup", "Interests", "Joined Date", "Status"];
      const rows = members.map((m) => [
        m.member_id,
        `"${m.full_name.replace(/"/g, '""')}"`,
        m.email,
        m.state,
        `"${m.experience_level}"`,
        `"${(m.rifle_setup || "").replace(/"/g, '""')}"`,
        `"${(m.interests || []).join(", ")}"`,
        m.created_at,
        m.status || "ACTIVE",
      ]);

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="subsonic-society-members-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      total: members.length,
      members,
    });
  } catch (err) {
    console.error("Error reading society members:", err);
    return NextResponse.json({ error: "Failed to read members." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, state, experienceLevel, rifleSetup, interests, callsign } = body;

    if (!fullName || !email) {
      return NextResponse.json(
        { error: "Full name and email are required." },
        { status: 400 }
      );
    }

    // Generate serialized member number
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const memberId = `SS-2026-${randomNum}`;

    const newMember: SocietyMember = {
      member_id: memberId,
      full_name: fullName.trim(),
      callsign: callsign ? callsign.trim().toUpperCase() : fullName.trim().split(" ")[0].toUpperCase(),
      email: email.trim().toLowerCase(),
      state: state || "TN",
      experience_level: experienceLevel || "Competitor",
      rifle_setup: rifleSetup || "Custom Rimfire",
      interests: interests || ["Competition", "Subsonic DNA"],
      created_at: new Date().toISOString(),
      status: "ACTIVE",
    };

    // 1. Append to local persistent JSONL storage
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.appendFileSync(MEMBERS_FILE, JSON.stringify(newMember) + "\n", "utf-8");
    } catch (fsErr) {
      console.warn("File append error for society member:", fsErr);
    }

    // 2. Mirror to Supabase if configured
    if (supabase) {
      try {
        await supabase.from("society_members").insert([newMember]);
      } catch (dbErr) {
        console.warn("Supabase society_members error:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      member: newMember,
      message: `Welcome to Subsonic Society, Marksman! Your Member ID is ${memberId}.`,
    });
  } catch (error) {
    console.error("Error joining society:", error);
    return NextResponse.json(
      { error: "Internal server error during registration." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { member_id, full_name, callsign, email, state, experience_level, rifle_setup, status, role, notes } = body;

    if (!member_id) {
      return NextResponse.json({ error: "member_id is required." }, { status: 400 });
    }

    const currentMembers = ensureStorageInitialized();
    const index = currentMembers.findIndex((m) => m.member_id === member_id);

    if (index === -1) {
      return NextResponse.json({ error: "Member not found." }, { status: 404 });
    }

    const updatedMember: SocietyMember = {
      ...currentMembers[index],
      ...(full_name !== undefined && { full_name: full_name.trim() }),
      ...(callsign !== undefined && { callsign: callsign.trim().toUpperCase() }),
      ...(email !== undefined && { email: email.trim().toLowerCase() }),
      ...(state !== undefined && { state }),
      ...(experience_level !== undefined && { experience_level }),
      ...(rifle_setup !== undefined && { rifle_setup }),
      ...(status !== undefined && { status }),
      ...(role !== undefined && { role }),
      ...(notes !== undefined && { notes }),
    };

    currentMembers[index] = updatedMember;

    // Persist full array back to data/society-members.jsonl
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const fileData = currentMembers.map((m) => JSON.stringify(m)).join("\n") + "\n";
      fs.writeFileSync(MEMBERS_FILE, fileData, "utf-8");
    } catch (fsErr) {
      console.warn("File write error updating society member:", fsErr);
    }

    return NextResponse.json({
      success: true,
      member: updatedMember,
      message: `Member ${member_id} updated successfully.`,
    });
  } catch (error) {
    console.error("Error updating society member:", error);
    return NextResponse.json({ error: "Failed to update member." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let member_id = searchParams.get("member_id");

    if (!member_id) {
      try {
        const body = await req.json();
        member_id = body.member_id;
      } catch {}
    }

    if (!member_id) {
      return NextResponse.json({ error: "member_id is required." }, { status: 400 });
    }

    if (member_id === "SS-2026-0001" || member_id === "SS-2026-0002") {
      return NextResponse.json(
        { error: "Root Executive accounts (Master Owner & Owner Admin) cannot be deleted." },
        { status: 403 }
      );
    }

    const currentMembers = ensureStorageInitialized();
    const filtered = currentMembers.filter((m) => m.member_id !== member_id);

    if (filtered.length === currentMembers.length) {
      return NextResponse.json({ error: "Member not found." }, { status: 404 });
    }

    // Persist filtered array back to data/society-members.jsonl
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const fileData = filtered.map((m) => JSON.stringify(m)).join("\n") + "\n";
      fs.writeFileSync(MEMBERS_FILE, fileData, "utf-8");
    } catch (fsErr) {
      console.warn("File write error deleting society member:", fsErr);
    }

    return NextResponse.json({
      success: true,
      deleted_id: member_id,
      message: `Member ${member_id} permanently deleted.`,
    });
  } catch (error) {
    console.error("Error deleting society member:", error);
    return NextResponse.json({ error: "Failed to delete member." }, { status: 500 });
  }
}
