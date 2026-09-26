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
    member_id: "SS-2026-1001",
    full_name: "Wyatt 'Ghost' Sterling",
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

    if (!fs.existsSync(MEMBERS_FILE)) {
      const initialLines = SEED_MEMBERS.map((m) => JSON.stringify(m)).join("\n") + "\n";
      fs.writeFileSync(MEMBERS_FILE, initialLines, "utf-8");
      return SEED_MEMBERS;
    }

    const raw = fs.readFileSync(MEMBERS_FILE, "utf-8");
    const lines = raw.split("\n").filter((l) => l.trim().length > 0);
    if (lines.length === 0) {
      const initialLines = SEED_MEMBERS.map((m) => JSON.stringify(m)).join("\n") + "\n";
      fs.writeFileSync(MEMBERS_FILE, initialLines, "utf-8");
      return SEED_MEMBERS;
    }

    return lines
      .map((l) => {
        try {
          return JSON.parse(l) as SocietyMember;
        } catch {
          return null;
        }
      })
      .filter((m): m is SocietyMember => m !== null);
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
    const { member_id, full_name, callsign, email, state, experience_level, rifle_setup, status, notes } = body;

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
