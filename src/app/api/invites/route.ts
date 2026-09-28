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
        ? `You're invited as a VIP Pro Competitor to The Subsonic Society! Your invite code is: ${finalCode}. Build your marksman dossier and enter private comms here: ${inviteUrl}`
        : `You're invited to join The Subsonic Society! Your private access code is: ${finalCode}. Complete your profile and enter live squad comms here: ${inviteUrl}`;

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
