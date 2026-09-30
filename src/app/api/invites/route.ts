import { NextRequest, NextResponse } from "next/server";
import { SocietyInvite, InviteTier } from "@/lib/types";
import {
  getInvitesFromStorage,
  saveAllInvitesToStorage,
  generateRandomCode
} from "@/lib/invites";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const invites = getInvitesFromStorage();
    const sorted = [...invites].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const stats = {
      total: sorted.length,
      active: sorted.filter((i) => i.status === "ACTIVE").length,
      pro: sorted.filter((i) => i.tier === "PRO").length,
      member: sorted.filter((i) => i.tier === "MEMBER").length,
      totalClaims: sorted.reduce((sum, i) => sum + (i.usedCount || 0), 0),
    };

    return NextResponse.json({
      success: true,
      stats,
      invites: sorted,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch invites" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tier: InviteTier = body.tier === "PRO" ? "PRO" : "MEMBER";
    const recipientName = (body.recipientName || "").trim();
    const recipientEmail = (body.recipientEmail || "").trim();
    const recipientPhone = (body.recipientPhone || "").trim();
    const note = (body.note || "").trim();
    const createdBy = (body.createdBy || "ALLEN").trim();
    const maxUses = typeof body.maxUses === "number" && body.maxUses > 0 ? body.maxUses : 1;
    const customCode = (body.customCode || "").trim().toUpperCase();

    const existingInvites = getInvitesFromStorage();

    let finalCode = customCode;
    if (!finalCode) {
      let candidate = generateRandomCode(tier);
      while (existingInvites.some((i) => i.code === candidate)) {
        candidate = generateRandomCode(tier);
      }
      finalCode = candidate;
    } else {
      // Check collision
      if (existingInvites.some((i) => i.code === finalCode)) {
        return NextResponse.json(
          { success: false, error: `Invite code ${finalCode} already exists.` },
          { status: 400 }
        );
      }
    }

    const newInvite: SocietyInvite = {
      id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      code: finalCode,
      tier,
      recipientName: recipientName || undefined,
      recipientEmail: recipientEmail || undefined,
      recipientPhone: recipientPhone || undefined,
      note: note || undefined,
      createdBy,
      createdAt: new Date().toISOString(),
      maxUses,
      usedCount: 0,
      claimedBy: [],
      status: "ACTIVE",
    };

    const updated = [newInvite, ...existingInvites];
    saveAllInvitesToStorage(updated);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://subsonic-omega.vercel.app";
    const inviteUrl =
      tier === "PRO"
        ? `${baseUrl}/invite/pro?code=${finalCode}`
        : `${baseUrl}/invite?code=${finalCode}`;

    const smsText =
      tier === "PRO"
        ? `You're invited as a VIP Pro Competitor to Subsonic Society! Your invite code is: ${finalCode}. Build your marksman dossier and enter private comms here: ${inviteUrl}`
        : `You're invited to join Subsonic Society! Your private access code is: ${finalCode}. Complete your profile and enter live squad comms here: ${inviteUrl}`;

    return NextResponse.json({
      success: true,
      invite: newInvite,
      inviteUrl,
      smsText,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to generate invite" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, recipientName, recipientEmail, recipientPhone, note, maxUses, status, regenerateCode, customCode } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Invite ID required." }, { status: 400 });
    }

    const existingInvites = getInvitesFromStorage();
    const targetIndex = existingInvites.findIndex((i) => i.id === id);

    if (targetIndex === -1) {
      return NextResponse.json({ success: false, error: "Invite not found." }, { status: 404 });
    }

    const target = existingInvites[targetIndex];
    let newCode = target.code;

    if (regenerateCode) {
      let candidate = generateRandomCode(target.tier);
      while (existingInvites.some((i) => i.code === candidate && i.id !== id)) {
        candidate = generateRandomCode(target.tier);
      }
      newCode = candidate;
    } else if (customCode && customCode.trim().toUpperCase() !== target.code) {
      const cleanCustom = customCode.trim().toUpperCase();
      if (existingInvites.some((i) => i.code === cleanCustom && i.id !== id)) {
        return NextResponse.json({ success: false, error: `Code ${cleanCustom} already in use.` }, { status: 400 });
      }
      newCode = cleanCustom;
    }

    const updatedInvite: SocietyInvite = {
      ...target,
      code: newCode,
      recipientName: recipientName !== undefined ? recipientName.trim() || undefined : target.recipientName,
      recipientEmail: recipientEmail !== undefined ? recipientEmail.trim() || undefined : target.recipientEmail,
      recipientPhone: recipientPhone !== undefined ? recipientPhone.trim() || undefined : target.recipientPhone,
      note: note !== undefined ? note.trim() || undefined : target.note,
      maxUses: typeof maxUses === "number" && maxUses > 0 ? maxUses : target.maxUses,
      status: status || target.status,
    };

    const updatedList = [...existingInvites];
    updatedList[targetIndex] = updatedInvite;
    saveAllInvitesToStorage(updatedList);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://subsonic-omega.vercel.app";
    const inviteUrl =
      updatedInvite.tier === "PRO"
        ? `${baseUrl}/invite/pro?code=${updatedInvite.code}`
        : `${baseUrl}/invite?code=${updatedInvite.code}`;

    const smsText =
      updatedInvite.tier === "PRO"
        ? `You're invited as a VIP Pro Competitor to Subsonic Society! Your invite code is: ${updatedInvite.code}. Build your marksman dossier and enter private comms here: ${inviteUrl}`
        : `You're invited to join Subsonic Society! Your private access code is: ${updatedInvite.code}. Complete your profile and enter live squad comms here: ${inviteUrl}`;

    return NextResponse.json({
      success: true,
      invite: updatedInvite,
      inviteUrl,
      smsText,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update invite" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Invite ID required." }, { status: 400 });
    }

    const existingInvites = getInvitesFromStorage();
    const filtered = existingInvites.filter((i) => i.id !== id);

    if (filtered.length === existingInvites.length) {
      return NextResponse.json({ success: false, error: "Invite not found." }, { status: 404 });
    }

    saveAllInvitesToStorage(filtered);

    return NextResponse.json({ success: true, message: "Invite removed successfully." });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete invite" },
      { status: 500 }
    );
  }
}
