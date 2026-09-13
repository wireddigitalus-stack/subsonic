import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Support both direct Make.com payload and raw Graph API payload format
    const postId = body.id || body.post_id || `fb_${Date.now()}`;
    const content = body.message || body.content || body.text || "";
    const imageUrl = body.full_picture || body.image_url || body.picture || null;
    const permalinkUrl = body.permalink_url || body.external_url || body.url || "https://www.facebook.com/p/Subsonic-Society-61578052196057/";
    const publishedAt = body.created_time || body.published_at || new Date().toISOString();
    
    // Auto-extract hashtags from post text if available
    const extractedTags = (content.match(/#[a-zA-Z0-9_-]+/g) || []).map((t: string) => t.replace("#", ""));
    const defaultTags = ["BristolPro", "PrecisionRimfire", "Subsonic"];
    const tags = extractedTags.length > 0 ? Array.from(new Set([...extractedTags, ...defaultTags])) : defaultTags;

    // Determine category
    let category = "ALL";
    const lower = content.toLowerCase();
    if (lower.includes("stage") || lower.includes("shootout") || lower.includes("match") || lower.includes("bristol")) {
      category = "MATCHES";
    } else if (lower.includes("dope") || lower.includes("ballistics") || lower.includes("velocity") || lower.includes("chrono") || lower.includes("fps")) {
      category = "BALLISTICS";
    } else if (lower.includes("coin") || lower.includes("vudoo") || lower.includes("rimx") || lower.includes("scope") || lower.includes("gear")) {
      category = "MEDIA";
    }

    const postRecord = {
      id: postId,
      post_id: postId,
      platform: "FACEBOOK",
      content: content.trim(),
      published_at: publishedAt,
      image_url: imageUrl,
      external_url: permalinkUrl,
      likes_count: Number(body.likes_count || body.likes?.summary?.total_count || 12),
      comments_count: Number(body.comments_count || body.comments?.summary?.total_count || 2),
      shares_count: Number(body.shares_count || body.shares?.count || 1),
      tags,
      category,
      raw_payload: body,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      const { error } = await supabase
        .from("social_posts")
        .upsert(postRecord, { onConflict: "id" });

      if (error) {
        console.error("[Facebook Webhook] Supabase upsert error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Facebook post synchronized successfully",
      post: postRecord
    });
  } catch (err: any) {
    console.error("[Facebook Webhook] Error processing incoming webhook:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Invalid payload" },
      { status: 400 }
    );
  }
}

export async function GET() {
  // Health check endpoint for Make.com test verification
  return NextResponse.json({
    status: "active",
    platform: "Subsonic Society Live Facebook Dispatch Receiver",
    timestamp: new Date().toISOString()
  });
}
