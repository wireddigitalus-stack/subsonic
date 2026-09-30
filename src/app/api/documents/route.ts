import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { CompetitionDocument } from "@/lib/types";

export const dynamic = "force-dynamic";

const DATA_DIR = path.join(process.cwd(), "data");
const DOCUMENTS_FILE = path.join(DATA_DIR, "competition-documents.jsonl");

const SEED_DOCUMENTS: CompetitionDocument[] = [
  {
    id: "invitational-2026-competitor-packet",
    title: "2026 Competitor Packet — Subsonic Society Invitational Money Match",
    category: "RANGE_INTEL",
    matchId: "subsonic-invitational-2026",
    matchTitle: "Subsonic Society Invitational 2026",
    description: "Official 4-page competitor packet presented by Modacam Custom Rifles. Includes Allen Hurley welcome letter, weekend schedule (Nov 13-15), 220-acre range amenities, $2,500 cash side matches, hotel directory, and Bristol dining & attractions guide.",
    fileName: "2026-Subsonic-Society-Invitational-Competitor-Packet.pdf",
    fileSize: "246 KB",
    fileUrl: "/documents/2026-Subsonic-Society-Invitational-Competitor-Packet.pdf",
    version: "Official Nov 2026",
    updatedAt: "2026-09-28T12:00:00Z",
    isMandatory: true,
  },
  {
    id: "invitational-2026-cof",
    title: "Official Course of Fire (COF) — Stages 1 to 18",
    category: "COF",
    matchId: "subsonic-invitational-2026",
    matchTitle: "Subsonic Society Invitational 2026",
    description: "Complete 18-stage course of fire with target distance tables, round counts, stage diagrams, barricade specifications, and 90-second time limits out to 465 yards.",
    fileName: "2026_Subsonic_Invitational_COF_Final.pdf",
    fileSize: "4.8 MB",
    fileUrl: "/documents/sample-cof.pdf",
    version: "Rev 2.4",
    updatedAt: "2026-09-24T14:30:00Z",
    isMandatory: true,
  },
  {
    id: "subsonic-society-match-bylaws-2026",
    title: "Subsonic Society Official Match Rules & Bylaws",
    category: "RULES",
    description: "Comprehensive rulebook covering Open & Production division equipment regulations, rimfire velocity ceilings, muzzle brake guidelines, chronograph protocols, and score protests.",
    fileName: "Subsonic_Society_Rules_and_Bylaws_2026.pdf",
    fileSize: "2.1 MB",
    fileUrl: "/documents/sample-rules.pdf",
    version: "2026.1",
    updatedAt: "2026-08-10T10:00:00Z",
    isMandatory: true,
  },
  {
    id: "hideout-cold-range-safety-waiver",
    title: "The Hideout Range Safety Protocols & Cold Range Waiver",
    category: "WAIVER",
    description: "Mandatory competitor & spectator safety acknowledgment for The Hideout Ridge Complex. Details cold range rules, chamber flags, emergency medical SOPs, and eye/ear protection standards.",
    fileName: "The_Hideout_Safety_Waiver_Release.pdf",
    fileSize: "1.2 MB",
    fileUrl: "/documents/sample-waiver.pdf",
    version: "2026",
    updatedAt: "2026-07-15T09:00:00Z",
    isMandatory: true,
  },
  {
    id: "invitational-squadding-schedule",
    title: "Squad Flight Rotation & Pavilion Briefing Schedule",
    category: "SCHEDULE",
    matchId: "subsonic-invitational-2026",
    matchTitle: "Subsonic Society Invitational 2026",
    description: "Master time table for Saturday & Sunday. Chrono verification windows (06:00-07:00), mandatory morning safety briefing (07:15 sharp), and flight start times.",
    fileName: "Squad_Rotation_Schedule_Invitational.pdf",
    fileSize: "890 KB",
    fileUrl: "/documents/sample-schedule.pdf",
    version: "Final Draft",
    updatedAt: "2026-09-26T16:00:00Z",
  },
  {
    id: "holston-elevation-ballistics-dossier",
    title: "Holston Mountain Elevation & Atmospheric Intel Dossier",
    category: "RANGE_INTEL",
    description: "Station elevation profile (3,420 FT base), density altitude trends, canyon thermal lift behavior, and mirage timing recommendations across morning and afternoon stages.",
    fileName: "Holston_Atmospheric_Intel_Dossier.pdf",
    fileSize: "3.4 MB",
    fileUrl: "/documents/sample-intel.pdf",
    version: "v1.8",
    updatedAt: "2026-09-18T11:20:00Z",
  },
];

function getDocumentsFromStorage(): CompetitionDocument[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    let fileDocs: CompetitionDocument[] = [];
    if (fs.existsSync(DOCUMENTS_FILE)) {
      const raw = fs.readFileSync(DOCUMENTS_FILE, "utf-8");
      const lines = raw.split("\n").filter((l) => l.trim().length > 0);
      fileDocs = lines
        .map((l) => {
          try {
            return JSON.parse(l) as CompetitionDocument;
          } catch {
            return null;
          }
        })
        .filter((d): d is CompetitionDocument => d !== null);
    }

    const map = new Map<string, CompetitionDocument>();
    for (const seed of SEED_DOCUMENTS) {
      map.set(seed.id, seed);
    }
    for (const fItem of fileDocs) {
      map.set(fItem.id, fItem);
    }

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch (err) {
    console.error("Error reading competition documents:", err);
    return SEED_DOCUMENTS;
  }
}

function saveDocumentToFile(doc: CompetitionDocument): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const current = getDocumentsFromStorage();
    const index = current.findIndex((d) => d.id === doc.id);
    let updated: CompetitionDocument[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = doc;
    } else {
      updated = [doc, ...current];
    }

    const lines = updated.map((d) => JSON.stringify(d)).join("\n") + "\n";
    fs.writeFileSync(DOCUMENTS_FILE, lines, "utf-8");
  } catch (err) {
    console.error("Error saving document to file:", err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const matchId = searchParams.get("matchId");

    let docs = getDocumentsFromStorage();

    if (category && category !== "ALL") {
      docs = docs.filter((d) => d.category === category);
    }

    if (matchId) {
      docs = docs.filter((d) => !d.matchId || d.matchId === matchId);
    }

    return NextResponse.json({ documents: docs, count: docs.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.title || !body.fileName) {
      return NextResponse.json({ error: "Title and fileName are required" }, { status: 400 });
    }

    const id = body.id || `doc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

    const newDoc: CompetitionDocument = {
      id,
      title: body.title.trim(),
      category: body.category || "COF",
      matchId: body.matchId,
      matchTitle: body.matchTitle,
      description: body.description || "Official competition document for Subsonic Society competitors.",
      fileName: body.fileName.trim(),
      fileSize: body.fileSize || "1.5 MB",
      fileUrl: body.fileUrl || "/documents/sample-cof.pdf",
      version: body.version || "v1.0",
      updatedAt: new Date().toISOString(),
      isMandatory: Boolean(body.isMandatory),
    };

    saveDocumentToFile(newDoc);

    return NextResponse.json({
      success: true,
      message: `Document "${newDoc.title}" saved successfully!`,
      document: newDoc,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Document ID required" }, { status: 400 });
    }

    const current = getDocumentsFromStorage();
    const updated = current.filter((d) => d.id !== id);

    const lines = updated.map((d) => JSON.stringify(d)).join("\n") + "\n";
    fs.writeFileSync(DOCUMENTS_FILE, lines, "utf-8");

    return NextResponse.json({ success: true, message: `Document ${id} deleted.` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
