import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { SocietyMember } from "@/lib/types";
import { 
  getMembersFromStorage, 
  addOrUpdateMember, 
  deleteMemberFromStorage, 
  saveAllMembersToStorage 
} from "@/lib/members";
import { getShootersFromStorage, saveShooterToStorage } from "@/lib/shooters";
import { checkCallsignAvailability } from "@/lib/callsigns";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const exportFormat = searchParams.get("export");
    const search = searchParams.get("search")?.toLowerCase();
    const stateFilter = searchParams.get("state");

    let members = getMembersFromStorage();

    // Reverse chronological order
    members.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    if (stateFilter && stateFilter !== "ALL") {
      members = members.filter((m) => m.state === stateFilter);
    }

    if (search) {
      members = members.filter(
        (m) =>
          m.full_name.toLowerCase().includes(search) ||
          (m.email && m.email.toLowerCase().includes(search)) ||
          m.member_id.toLowerCase().includes(search) ||
          (m.callsign && m.callsign.toLowerCase().includes(search)) ||
          (m.rifle_setup && m.rifle_setup.toLowerCase().includes(search))
      );
    }

    if (exportFormat === "csv") {
      const headers = ["Member ID", "Full Name", "Callsign", "Email", "State", "Experience", "Rifle Setup", "Interests", "Joined Date", "Status"];
      const rows = members.map((m) => [
        m.member_id,
        `"${m.full_name.replace(/"/g, '""')}"`,
        `"${(m.callsign || "").replace(/"/g, '""')}"`,
        m.email || "",
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
    const { 
      fullName, 
      full_name,
      email, 
      state, 
      experienceLevel, 
      experience_level,
      rifleSetup, 
      rifle_setup,
      interests, 
      callsign, 
      memberId,
      member_id,
      role,
      notes,
      inviteCode 
    } = body;

    let resolvedName = (fullName || full_name || "").trim();
    if (resolvedName === "VIP Pro Competitor" || resolvedName === "Invitational Competitor VIP") {
      resolvedName = callsign ? callsign.trim().toUpperCase() : "TEST";
    }
    if (!resolvedName) {
      return NextResponse.json(
        { error: "Full name is required." },
        { status: 400 }
      );
    }

    const assignedCallsign = callsign ? callsign.trim().toUpperCase() : resolvedName.split(" ")[0].toUpperCase();
    const assignedMemberId = memberId || member_id || `SS-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    // Validate uniqueness of tactical callsign
    const existingMember = getMembersFromStorage().find(
      (m) => m.member_id === assignedMemberId
    );

    const callsignCheck = checkCallsignAvailability(assignedCallsign, {
      excludeMemberId: existingMember ? existingMember.member_id : undefined,
      state: state || "TN",
    });

    if (
      !callsignCheck.isAvailable &&
      (!existingMember || !existingMember.callsign || existingMember.callsign.toUpperCase() !== assignedCallsign)
    ) {
      return NextResponse.json(
        {
          error: callsignCheck.message,
          suggestions: callsignCheck.suggestions,
          code: "CALLSIGN_TAKEN",
        },
        { status: 409 }
      );
    }

    const newMember: SocietyMember = {
      member_id: assignedMemberId,
      full_name: resolvedName,
      callsign: assignedCallsign,
      email: email ? email.trim().toLowerCase() : `${assignedCallsign.toLowerCase()}@member.subsonicsociety.com`,
      state: state || "TN",
      experience_level: experienceLevel || experience_level || "Competitor",
      rifle_setup: rifleSetup || rifle_setup || "Custom Rimfire Precision Rig",
      interests: interests || ["Competition", "Subsonic DNA", "Barricade Training"],
      created_at: new Date().toISOString(),
      status: "ACTIVE",
      role: role || "MEMBER",
      notes: notes || (inviteCode ? `Enrolled via invite code: ${inviteCode}` : undefined),
    };

    // Save to storage using members manager
    const savedMember = addOrUpdateMember(newMember);

    // Mirror to Supabase if configured
    if (supabase) {
      try {
        await supabase.from("society_members").insert([savedMember]);
      } catch (dbErr) {
        console.warn("Supabase society_members error:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      member: savedMember,
      message: `Welcome to Subsonic Society, Marksman! Your Member ID is ${savedMember.member_id}.`,
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
    const { member_id, full_name, callsign, email, state, experience_level, rifle_setup, status, role, notes, pin } = body;

    if (!member_id) {
      return NextResponse.json({ error: "member_id is required." }, { status: 400 });
    }

    const currentMembers = getMembersFromStorage();
    const index = currentMembers.findIndex((m) => m.member_id === member_id);

    if (index === -1) {
      return NextResponse.json({ error: "Member not found." }, { status: 404 });
    }

    if (
      callsign !== undefined && 
      callsign.trim().toUpperCase() !== (currentMembers[index].callsign || "").toUpperCase()
    ) {
      const callsignCheck = checkCallsignAvailability(callsign.trim().toUpperCase(), {
        excludeMemberId: member_id,
        state: state || currentMembers[index].state,
      });

      if (!callsignCheck.isAvailable) {
        return NextResponse.json(
          {
            error: callsignCheck.message,
            suggestions: callsignCheck.suggestions,
            code: "CALLSIGN_TAKEN",
          },
          { status: 409 }
        );
      }
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
      ...(pin !== undefined && { pin: pin ? String(pin).trim() : undefined }),
    };

    const saved = addOrUpdateMember(updatedMember);

    // Cross-sync PIN to shooter record if linked shooter exists
    if (pin !== undefined && saved.callsign) {
      try {
        const shooters = getShootersFromStorage();
        const matchingShooter = shooters.find(
          (s) =>
            (s.callsign && s.callsign.toUpperCase() === saved.callsign?.toUpperCase()) ||
            s.id.toLowerCase() === saved.member_id.toLowerCase()
        );
        if (matchingShooter) {
          matchingShooter.pin = pin ? String(pin).trim() : undefined;
          saveShooterToStorage(matchingShooter);
        }
      } catch (syncErr) {
        console.warn("Could not sync pin to shooter record:", syncErr);
      }
    }

    return NextResponse.json({
      success: true,
      member: saved,
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

    const deleted = deleteMemberFromStorage(member_id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Member not found or cannot delete root executive accounts." },
        { status: 403 }
      );
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
