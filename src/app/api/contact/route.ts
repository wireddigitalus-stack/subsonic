import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { supabase } from "@/lib/supabase";
import { ContactLead } from "@/lib/types";

export const dynamic = "force-dynamic";

const DATA_DIR = path.join(process.cwd(), "data");
const LEADS_FILE = path.join(DATA_DIR, "contact-leads.jsonl");

const SEED_LEADS: ContactLead[] = [
  {
    id: "lead-001",
    name: "Cody Matthews",
    company: "High Country Precision Armory",
    email: "cody@highcountryprecision.com",
    phone: "(423) 555-8910",
    category: "SPONSORSHIP",
    subject: "2026 Invitational Prize Table & Stage 8 Banner Sponsorship",
    message: "We would like to contribute two custom machined rimfire bolt handles and donate $1,000 toward the Stage 8 prize table for the upcoming Appalachian Pro Invitational. Please send sponsor coordinator specs.",
    created_at: "2026-09-10T11:42:00Z",
    status: "NEW",
  },
  {
    id: "lead-002",
    name: "Marcus Holloway",
    company: "Shenandoah Ridge Shooting Club",
    email: "m.holloway@shenandoahridge.org",
    phone: "(540) 555-3392",
    category: "MATCH_HOST",
    subject: "Hosting a Subsonic Society Regional Qualifier in Virginia",
    message: "We have a 450-yard ridgeline facility with 14 PRS barricades in Harrisonburg, VA. We would like to sanction a regional qualifier with the Subsonic Society in Spring 2027.",
    created_at: "2026-09-08T15:20:10Z",
    status: "IN_REVIEW",
  },
  {
    id: "lead-003",
    name: "Dr. Ethan Miller",
    company: "Ballistics Science Institute",
    email: "e.miller@ballisticscience.edu",
    phone: "(865) 555-7741",
    category: "SUBSONIC_DNA",
    subject: "Subsonic DNA Lot Dispersion Data Collaboration",
    message: "Our lab has been analyzing transonic boundary layer turbulence on 40-grain round nose projectiles. We would love to cross-reference our aerodynamic drag coefficients with your high-speed Phantom footage and chronograph SD data.",
    created_at: "2026-09-06T09:10:00Z",
    status: "CONTACTED",
  },
  {
    id: "lead-004",
    name: "David Vance",
    company: "Independent Competitor",
    email: "d.vance@vancefirearms.net",
    phone: "(423) 555-6188",
    category: "GENERAL",
    subject: "Waitlist protocol for Squad 3 on The Hideout Invitational",
    message: "I missed the initial squad open by 3 hours. How quickly do waitlist slots clear if a competitor withdraws? Ready to lock in deposit immediately.",
    created_at: "2026-09-04T18:35:45Z",
    status: "CONTACTED",
  },
  {
    id: "lead-005",
    name: "Rachel Lin",
    company: "Precision Rifle Media Network",
    email: "rachel.lin@precisionriflemedia.tv",
    phone: "(615) 555-4420",
    category: "MEDIA",
    subject: "Media credentials & photographer badge for October Invitational",
    message: "Requesting press pass and safety briefing access to capture 4K stage action and competitor interview clips for our Appalachia Sports broadcast episode.",
    created_at: "2026-09-02T13:15:30Z",
    status: "NEW",
  },
];

function ensureStorageInitialized(): ContactLead[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(LEADS_FILE)) {
      const initialLines = SEED_LEADS.map((l) => JSON.stringify(l)).join("\n") + "\n";
      fs.writeFileSync(LEADS_FILE, initialLines, "utf-8");
      return SEED_LEADS;
    }

    const raw = fs.readFileSync(LEADS_FILE, "utf-8");
    const lines = raw.split("\n").filter((l) => l.trim().length > 0);
    if (lines.length === 0) {
      const initialLines = SEED_LEADS.map((l) => JSON.stringify(l)).join("\n") + "\n";
      fs.writeFileSync(LEADS_FILE, initialLines, "utf-8");
      return SEED_LEADS;
    }

    return lines
      .map((l) => {
        try {
          return JSON.parse(l) as ContactLead;
        } catch {
          return null;
        }
      })
      .filter((l): l is ContactLead => l !== null);
  } catch (err) {
    console.warn("Storage init error for contact leads:", err);
    return SEED_LEADS;
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const exportFormat = searchParams.get("export");
    const search = searchParams.get("search")?.toLowerCase();
    const categoryFilter = searchParams.get("category");
    const statusFilter = searchParams.get("status");

    let leads = ensureStorageInitialized();

    // Reverse chronological order
    leads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    if (categoryFilter && categoryFilter !== "ALL") {
      leads = leads.filter((l) => l.category === categoryFilter);
    }

    if (statusFilter && statusFilter !== "ALL") {
      leads = leads.filter((l) => l.status === statusFilter);
    }

    if (search) {
      leads = leads.filter(
        (l) =>
          l.name.toLowerCase().includes(search) ||
          l.email.toLowerCase().includes(search) ||
          (l.company && l.company.toLowerCase().includes(search)) ||
          (l.subject && l.subject.toLowerCase().includes(search)) ||
          l.message.toLowerCase().includes(search)
      );
    }

    if (exportFormat === "csv") {
      const headers = ["Lead ID", "Name", "Company", "Email", "Phone", "Category", "Subject", "Message", "Created Date", "Status"];
      const rows = leads.map((l) => [
        l.id,
        `"${l.name.replace(/"/g, '""')}"`,
        `"${(l.company || "").replace(/"/g, '""')}"`,
        l.email,
        `"${l.phone || ""}"`,
        l.category,
        `"${(l.subject || "").replace(/"/g, '""')}"`,
        `"${l.message.replace(/"/g, '""')}"`,
        l.created_at,
        l.status,
      ]);

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="subsonic-contact-leads-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      total: leads.length,
      leads,
    });
  } catch (err) {
    console.error("Error reading contact leads:", err);
    return NextResponse.json({ error: "Failed to read contact leads." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, company, email, phone, category, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const leadId = `lead-${Date.now()}`;
    const newLead: ContactLead = {
      id: leadId,
      name: name.trim(),
      company: company ? company.trim() : undefined,
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : undefined,
      category: category || "GENERAL",
      subject: subject ? subject.trim() : undefined,
      message: message.trim(),
      created_at: new Date().toISOString(),
      status: "NEW",
    };

    // 1. Append to local persistent JSONL storage
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.appendFileSync(LEADS_FILE, JSON.stringify(newLead) + "\n", "utf-8");
    } catch (fsErr) {
      console.warn("File append error for contact lead:", fsErr);
    }

    // 2. Mirror to Supabase if configured
    if (supabase) {
      try {
        await supabase.from("contact_leads").insert([newLead]);
      } catch (dbErr) {
        console.warn("Supabase contact_leads error:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      lead: newLead,
      message: "Your inquiry has been dispatched to the Subsonic Society match directorate!",
    });
  } catch (error) {
    console.error("Error creating contact lead:", error);
    return NextResponse.json(
      { error: "Internal server error submitting inquiry." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Lead ID and status are required." }, { status: 400 });
    }

    const leads = ensureStorageInitialized();
    const targetLead = leads.find((l) => l.id === id);
    if (!targetLead) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    targetLead.status = status;

    // Rewrite file
    try {
      const updatedLines = leads.map((l) => JSON.stringify(l)).join("\n") + "\n";
      fs.writeFileSync(LEADS_FILE, updatedLines, "utf-8");
    } catch (fsErr) {
      console.warn("Error updating contact lead file:", fsErr);
    }

    return NextResponse.json({ success: true, lead: targetLead });
  } catch (err) {
    console.error("Error updating lead status:", err);
    return NextResponse.json({ error: "Failed to update lead." }, { status: 500 });
  }
}
