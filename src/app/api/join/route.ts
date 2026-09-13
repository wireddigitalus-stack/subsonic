import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, state, experienceLevel, rifleSetup, interests } = body;

    if (!fullName || !email) {
      return NextResponse.json(
        { error: "Full name and email are required." },
        { status: 400 }
      );
    }

    // Generate serialized member number
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const memberId = `SS-2026-${randomNum}`;

    const newMember = {
      member_id: memberId,
      full_name: fullName,
      email: email.trim().toLowerCase(),
      state: state || "TN",
      experience_level: experienceLevel || "Competitor",
      rifle_setup: rifleSetup || "Custom Rimfire",
      interests: interests || ["Competition", "Subsonic DNA"],
      created_at: new Date().toISOString(),
    };

    // Try saving to Supabase if configured
    if (supabase) {
      try {
        const { error } = await supabase
          .from("society_members")
          .insert([newMember]);

        if (error) {
          console.warn("Supabase insert warning for society_members:", error.message);
        }
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
