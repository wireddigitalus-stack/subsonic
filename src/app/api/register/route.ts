import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { supabase } from "@/lib/supabase";
import { MatchRegistration } from "@/lib/types";

export const dynamic = "force-dynamic";

const DATA_DIR = path.join(process.cwd(), "data");
const REGISTRATIONS_FILE = path.join(DATA_DIR, "match-registrations.jsonl");

const SEED_REGISTRATIONS: MatchRegistration[] = [
  {
    id: "reg-001",
    ticket_number: "INV-2026-0814",
    match_id: "subsonic-invitational-2026",
    match_title: "The Subsonic Society Invitational ($7,500 Cash Purse)",
    competitor_name: "Wyatt 'Ghost' Sterling",
    competitor_callsign: "Ghost-1",
    competitor_email: "wyatt.sterling@precisionappalachia.com",
    competitor_phone: "(423) 555-0192",
    rifle_division: "OPEN",
    squad_name: "Alpha Squad 1",
    squad_flight: "Morning Flight 07:30",
    rifle_model: "Vudoo V-22 Rimfire Repeater",
    optic: "Tangent Theta 5-25x56 TT525P Gen 3XR",
    ammo_lot: "Lapua Center-X (Lot #32187)",
    addons: ["Official Weatherproof DOPE & Match Logbook", "Subsonic Technical Competition Jersey"],
    total_price: 342,
    payment_status: "PAID",
    created_at: "2026-08-14T11:20:00Z",
  },
  {
    id: "reg-002",
    ticket_number: "INV-2026-0819",
    match_id: "subsonic-invitational-2026",
    match_title: "The Subsonic Society Invitational ($7,500 Cash Purse)",
    competitor_name: "Kendra 'Coldbore' Cross",
    competitor_callsign: "Coldbore",
    competitor_email: "kendra.cross@southeastrimfire.org",
    competitor_phone: "(540) 555-8831",
    rifle_division: "OPEN",
    squad_name: "Alpha Squad 1",
    squad_flight: "Morning Flight 07:30",
    rifle_model: "RimX Action / Proof Carbon 20\"",
    optic: "Vortex Razor HD Gen III 6-36x56",
    ammo_lot: "Lapua Midas+ (Lot #99120)",
    addons: ["Official Doppler Radar Truing Slot"],
    total_price: 310,
    payment_status: "PAID",
    created_at: "2026-08-19T14:45:10Z",
  },
  {
    id: "reg-003",
    ticket_number: "INV-2026-0824",
    match_id: "subsonic-invitational-2026",
    match_title: "The Subsonic Society Invitational ($7,500 Cash Purse)",
    competitor_name: "Eli McAllister",
    competitor_callsign: "Dialed",
    competitor_email: "eli.mcallister@blueridgeprs.com",
    competitor_phone: "(828) 555-4019",
    rifle_division: "PRODUCTION",
    squad_name: "Bravo Squad 2",
    squad_flight: "Morning Flight 07:30",
    rifle_model: "CZ 457 MTR Match Factory",
    optic: "Vortex Venom 5-25x56 FFF",
    ammo_lot: "SK Rifle Match (Lot #04412)",
    addons: [],
    total_price: 275,
    payment_status: "PAID",
    created_at: "2026-08-24T09:12:00Z",
  },
  {
    id: "reg-004",
    ticket_number: "INV-2026-0830",
    match_id: "subsonic-invitational-2026",
    match_title: "The Subsonic Society Invitational ($7,500 Cash Purse)",
    competitor_name: "Garrett Vance",
    competitor_callsign: "Anchor",
    competitor_email: "garrett.vance@holstonprecision.net",
    competitor_phone: "(423) 555-7722",
    rifle_division: "SENIOR",
    squad_name: "Charlie Squad 3",
    squad_flight: "Afternoon Flight 12:45",
    rifle_model: "Modacam Custom Rifles V-22 Match",
    optic: "Nightforce ATACR 7-35x56 Mil-XT",
    ammo_lot: "Lapua Center-X (Lot #32187)",
    addons: ["Official Weatherproof DOPE & Match Logbook"],
    total_price: 297,
    payment_status: "PAID",
    created_at: "2026-08-30T16:05:40Z",
  },
  {
    id: "reg-005",
    ticket_number: "INV-2026-0902",
    match_id: "subsonic-invitational-2026",
    match_title: "The Subsonic Society Invitational ($7,500 Cash Purse)",
    competitor_name: "Sarah 'Apex' Jenkins",
    competitor_callsign: "Apex-1",
    competitor_email: "sarah.jenkins@precisionrimfire.io",
    competitor_phone: "(859) 555-3211",
    rifle_division: "LADIES",
    squad_name: "Delta Squad 4",
    squad_flight: "Afternoon Flight 12:45",
    rifle_model: "Vudoo V-22 / March FX 5-42",
    optic: "March FX 5-42x56 High Master",
    ammo_lot: "Eley Tenex (Batch #1058)",
    addons: ["Subsonic Technical Competition Jersey"],
    total_price: 320,
    payment_status: "PAID",
    created_at: "2026-09-02T10:30:15Z",
  },
  {
    id: "reg-006",
    ticket_number: "LG-2026-0904",
    match_id: "300x-long-gong-challenge",
    match_title: "300X Long Gong Challenge",
    competitor_name: "Dustin 'Zero' Cole",
    competitor_callsign: "Zero",
    competitor_email: "dustin.cole@appalachianlongrange.com",
    competitor_phone: "(276) 555-9014",
    rifle_division: "OPEN",
    squad_name: "Ridge Long Gong Squad 1",
    squad_flight: "Morning Flight 08:00",
    rifle_model: "RimX / Tangent Theta TT525P",
    optic: "Tangent Theta 5-25x56",
    ammo_lot: "Lapua Center-X (Lot #32187)",
    addons: ["Official Doppler Radar Truing Slot"],
    total_price: 175,
    payment_status: "PAID",
    created_at: "2026-09-04T13:15:00Z",
  },
  {
    id: "reg-007",
    ticket_number: "MTN-2026-0907",
    match_id: "200x-mountain-match",
    match_title: "200X Mountain Match (Appalachian Barricades)",
    competitor_name: "Mason Brooks",
    competitor_callsign: "Brooks",
    competitor_email: "mason.brooks@tennesseerimfire.com",
    competitor_phone: "(423) 555-6618",
    rifle_division: "PRODUCTION",
    squad_name: "Barricade Squad 2",
    squad_flight: "Morning Flight 08:30",
    rifle_model: "Tikka T1x / KRG Bravo",
    optic: "Bushnell Match Pro ED 5-30x56",
    ammo_lot: "SK Rifle Match",
    addons: [],
    total_price: 110,
    payment_status: "PAID",
    created_at: "2026-09-07T15:40:00Z",
  },
  {
    id: "reg-008",
    ticket_number: "INV-2026-0909",
    match_id: "subsonic-invitational-2026",
    match_title: "The Subsonic Society Invitational ($7,500 Cash Purse)",
    competitor_name: "Lucas 'Rookie' Tanner",
    competitor_callsign: "Rookie",
    competitor_email: "lucas.tanner@appalachiansportsmen.org",
    competitor_phone: "(423) 555-2144",
    rifle_division: "YOUTH",
    squad_name: "Junior Line Squad 5",
    squad_flight: "Morning Flight 08:00",
    rifle_model: "Ruger Precision Rimfire .22LR",
    optic: "Vortex Diamondback Tactical 6-24",
    ammo_lot: "CCI Standard Velocity",
    addons: ["Official Weatherproof DOPE & Match Logbook"],
    total_price: 217,
    payment_status: "PAID",
    created_at: "2026-09-09T09:25:30Z",
  },
];

function ensureStorageInitialized(): MatchRegistration[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(REGISTRATIONS_FILE)) {
      const initialLines = SEED_REGISTRATIONS.map((r) => JSON.stringify(r)).join("\n") + "\n";
      fs.writeFileSync(REGISTRATIONS_FILE, initialLines, "utf-8");
      return SEED_REGISTRATIONS;
    }

    const raw = fs.readFileSync(REGISTRATIONS_FILE, "utf-8");
    const lines = raw.split("\n").filter((l) => l.trim().length > 0);
    if (lines.length === 0) {
      const initialLines = SEED_REGISTRATIONS.map((r) => JSON.stringify(r)).join("\n") + "\n";
      fs.writeFileSync(REGISTRATIONS_FILE, initialLines, "utf-8");
      return SEED_REGISTRATIONS;
    }

    return lines
      .map((l) => {
        try {
          return JSON.parse(l) as MatchRegistration;
        } catch {
          return null;
        }
      })
      .filter((r): r is MatchRegistration => r !== null);
  } catch (err) {
    console.warn("Storage init error for match registrations:", err);
    return SEED_REGISTRATIONS;
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const exportFormat = searchParams.get("export");
    const search = searchParams.get("search")?.toLowerCase();
    const matchFilter = searchParams.get("match");
    const divisionFilter = searchParams.get("division");

    let registrations = ensureStorageInitialized();

    // Reverse chronological order
    registrations.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    if (matchFilter && matchFilter !== "ALL") {
      registrations = registrations.filter((r) => r.match_id === matchFilter);
    }

    if (divisionFilter && divisionFilter !== "ALL") {
      registrations = registrations.filter((r) => r.rifle_division === divisionFilter);
    }

    if (search) {
      registrations = registrations.filter(
        (r) =>
          r.competitor_name.toLowerCase().includes(search) ||
          (r.competitor_callsign && r.competitor_callsign.toLowerCase().includes(search)) ||
          r.competitor_email.toLowerCase().includes(search) ||
          r.ticket_number.toLowerCase().includes(search) ||
          r.match_title.toLowerCase().includes(search) ||
          r.rifle_model.toLowerCase().includes(search)
      );
    }

    if (exportFormat === "csv") {
      const headers = [
        "Ticket Number",
        "Competitor Name",
        "Callsign",
        "Email",
        "Phone",
        "Match",
        "Division",
        "Squad",
        "Flight",
        "Rifle Model",
        "Optic",
        "Ammo Lot",
        "Total Fee",
        "Payment Status",
        "Registration Date",
      ];
      const rows = registrations.map((r) => [
        r.ticket_number,
        `"${r.competitor_name.replace(/"/g, '""')}"`,
        `"${r.competitor_callsign || ""}"`,
        r.competitor_email,
        `"${r.competitor_phone || ""}"`,
        `"${r.match_title.replace(/"/g, '""')}"`,
        r.rifle_division,
        `"${r.squad_name}"`,
        `"${r.squad_flight || ""}"`,
        `"${r.rifle_model.replace(/"/g, '""')}"`,
        `"${r.optic.replace(/"/g, '""')}"`,
        `"${r.ammo_lot.replace(/"/g, '""')}"`,
        `$${r.total_price}`,
        r.payment_status,
        r.created_at,
      ]);

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="subsonic-registered-shooters-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      total: registrations.length,
      registrations,
    });
  } catch (err) {
    console.error("Error reading match registrations:", err);
    return NextResponse.json({ error: "Failed to read registrations." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      ticketNumber,
      matchId,
      matchTitle,
      competitorName,
      competitorCallsign,
      competitorEmail,
      competitorPhone,
      rifleDivision,
      squadName,
      squadFlight,
      rifleModel,
      optic,
      ammoLot,
      addons,
      totalPrice,
      paymentStatus,
    } = body;

    if (!competitorName || !competitorEmail) {
      return NextResponse.json(
        { error: "Competitor name and email are required." },
        { status: 400 }
      );
    }

    const regId = `reg-${Date.now()}`;
    const formattedTicket = ticketNumber || `SS-TKT-${Math.floor(10000 + Math.random() * 90000)}`;

    const newRegistration: MatchRegistration = {
      id: regId,
      ticket_number: formattedTicket,
      match_id: matchId || "subsonic-invitational-2026",
      match_title: matchTitle || "The Subsonic Society Invitational",
      competitor_name: competitorName.trim(),
      competitor_callsign: competitorCallsign ? competitorCallsign.trim() : undefined,
      competitor_email: competitorEmail.trim().toLowerCase(),
      competitor_phone: competitorPhone ? competitorPhone.trim() : undefined,
      rifle_division: rifleDivision || "OPEN",
      squad_name: squadName || "Open Squad Line",
      squad_flight: squadFlight || "Morning Flight",
      rifle_model: rifleModel || "Precision Rimfire",
      optic: optic || "Precision Glass",
      ammo_lot: ammoLot || "Standard Subsonic",
      addons: addons || [],
      total_price: Number(totalPrice) || 275,
      payment_status: paymentStatus || "PAID",
      created_at: new Date().toISOString(),
    };

    // 1. Append to local persistent JSONL storage
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.appendFileSync(REGISTRATIONS_FILE, JSON.stringify(newRegistration) + "\n", "utf-8");
    } catch (fsErr) {
      console.warn("File append error for match registration:", fsErr);
    }

    // 2. Mirror to Supabase if configured
    if (supabase) {
      try {
        await supabase.from("registrations").insert([
          {
            match_id: newRegistration.match_id,
            competitor_name: newRegistration.competitor_name,
            competitor_email: newRegistration.competitor_email,
            rifle_division: newRegistration.rifle_division,
            squad_flight: `${newRegistration.squad_name} (${newRegistration.squad_flight})`,
            rifle_model: `${newRegistration.rifle_model} | ${newRegistration.optic} | ${newRegistration.ammo_lot}`,
          },
        ]);
      } catch (dbErr) {
        console.warn("Supabase registrations error:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      registration: newRegistration,
      message: `Squad slot confirmed for ${newRegistration.competitor_name}! Ticket: ${newRegistration.ticket_number}`,
    });
  } catch (error) {
    console.error("Error creating match registration:", error);
    return NextResponse.json(
      { error: "Internal server error during registration." },
      { status: 500 }
    );
  }
}
