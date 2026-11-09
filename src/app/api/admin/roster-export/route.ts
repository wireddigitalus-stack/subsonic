import { NextRequest, NextResponse } from "next/server";
import { getShootersFromStorage, refreshShootersFromDb } from "@/lib/shooters";
import { getMembersFromStorage, refreshMembersFromDb } from "@/lib/members";

export const dynamic = "force-dynamic";

function verifyAdminCookie(req: NextRequest): boolean {
  try {
    const cookie = req.cookies.get("subsonic_admin_session");
    if (!cookie) return false;
    const decoded = Buffer.from(cookie.value, "base64").toString("utf8");
    const payload = JSON.parse(decoded);
    if (!payload.exp || payload.exp < Date.now()) return false;
    const validRoles = ["MASTER_OWNER", "OWNER_ADMIN", "ADMIN"];
    if (!validRoles.includes(payload.role)) return false;
    const validCallsigns = ["RADAR", "ROB", "LTDAN", "SUBX", "ALLEN", "AHURLEY", "HURLEY", "ADMIN"];
    if (!validCallsigns.includes((payload.callsign || "").toUpperCase())) return false;
    return true;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  if (!verifyAdminCookie(req)) {
    return NextResponse.json(
      { error: "Unauthorized: Master Admin or Owner Admin session required." },
      { status: 401 }
    );
  }

  try {
    await Promise.all([refreshShootersFromDb(0), refreshMembersFromDb(0)]);
    const shooters = getShootersFromStorage();
    const members = getMembersFromStorage();

    const memberByCall = new Map(
      members.map((m) => [(m.callsign || "").trim().toUpperCase(), m])
    );

    const excludedCalls = new Set(["RADAR", "ROB", "LTDAN", "SUBX", "ALLEN", "TEST", "TEST2", "TEST-2", "DOE", "JOHNDOE"]);

    const roster = shooters
      .filter((s) => {
        const call = (s.callsign || "").trim().toUpperCase();
        const name = (s.name || "").trim().toUpperCase();
        if (!call || excludedCalls.has(call)) return false;
        if (
          name.includes("ROB NEILSON") ||
          name.includes("ALLEN HURLEY") ||
          name.includes("JOHN DOE") ||
          name.startsWith("TEST")
        ) {
          return false;
        }
        return true;
      })
      .map((s) => {
        const call = (s.callsign || "").trim().toUpperCase();
        const mem = memberByCall.get(call);
        const email = s.email || mem?.email || "";
        const phone = s.phone || "";
        const mailingAddress = s.mailingAddress || "";
        const rig = [
          s.rifleSetup?.action,
          s.rifleSetup?.barrel,
          s.rifleSetup?.chassis,
          s.rifleSetup?.optic,
        ]
          .filter(Boolean)
          .join(" • ");

        return {
          name: s.name || call,
          callsign: call,
          email,
          phone,
          mailingAddress,
          homeRange: s.homeRange || "",
          division: s.division || "Pro Shooter",
          ranking: s.ranking || "",
          podiums: s.podiums ?? 0,
          rig,
          sponsors: (s.sponsors || []).join(", "),
          createdAt: s.createdAt || mem?.created_at || "",
        };
      });

    const { searchParams } = new URL(req.url);
    const format = (searchParams.get("format") || "csv").toLowerCase();
    const dateStamp = new Date().toISOString().split("T")[0];

    if (format === "txt") {
      const lines: string[] = [
        `SUBSONIC SOCIETY INVITATIONAL — REGISTERED SHOOTER ROSTER (${roster.length})`,
        `Generated: ${dateStamp}`,
        `====================================================================`,
        "",
      ];
      roster.forEach((r, idx) => {
        lines.push(`${idx + 1}. ${r.name} [${r.callsign}]`);
        lines.push(`   Email:   ${r.email || "N/A"}`);
        if (r.phone) lines.push(`   Phone:   ${r.phone}`);
        if (r.mailingAddress) lines.push(`   Address: ${r.mailingAddress}`);
        if (r.homeRange) lines.push(`   State:   ${r.homeRange}`);
        if (r.ranking) lines.push(`   Title:   ${r.ranking}`);
        if (r.rig) lines.push(`   Rifle:   ${r.rig}`);
        lines.push("");
      });
      lines.push(`====================================================================`);
      lines.push(`All Emails (Copy-Paste for BCC):`);
      lines.push(roster.map((r) => r.email).filter(Boolean).join(", "));

      return new NextResponse(lines.join("\n"), {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": `attachment; filename="Subsonic-Shooter-Roster-${dateStamp}.txt"`,
        },
      });
    }

    if (format === "json") {
      return NextResponse.json({ count: roster.length, roster });
    }

    // Default: CSV download
    const esc = (val: unknown) => `"${String(val ?? "").replace(/"/g, '""')}"`;
    const headers = [
      "Name",
      "Callsign",
      "Email",
      "Phone",
      "Mailing Address",
      "Home State / Range",
      "Title / Ranking",
      "Podiums",
      "Rifle Setup",
      "Sponsors",
      "Registered At",
    ];
    const rows = roster.map((r) =>
      [
        esc(r.name),
        esc(r.callsign),
        esc(r.email),
        esc(r.phone),
        esc(r.mailingAddress),
        esc(r.homeRange),
        esc(r.ranking),
        r.podiums,
        esc(r.rig),
        esc(r.sponsors),
        esc(r.createdAt),
      ].join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="Subsonic-Shooter-Roster-${dateStamp}.csv"`,
      },
    });
  } catch (err: any) {
    console.error("Error exporting shooter roster:", err);
    return NextResponse.json({ error: "Failed to export shooter roster." }, { status: 500 });
  }
}
