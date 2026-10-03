import { NextRequest, NextResponse } from "next/server";
import { saveStoredChatMessage, getStoredChatMessages, getLatestChatTimestamp } from "@/lib/chat-storage";
import { ChatMessage } from "@/lib/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const channel = searchParams.get("channel") || "all";
    const sinceParam = searchParams.get("since");
    const limitParam = searchParams.get("limit");
    const pollUnread = searchParams.get("pollUnread") === "true";
    const excludeCallsign = searchParams.get("excludeCallsign") || undefined;

    if (pollUnread) {
      const sinceMs = sinceParam ? parseInt(sinceParam, 10) : 0;
      const latest = await getLatestChatTimestamp(excludeCallsign);
      const hasUnread = latest.timestamp > sinceMs;

      return NextResponse.json({
        latestTimestamp: latest.timestamp,
        hasUnread,
        unreadCount: hasUnread ? 1 : 0,
        latestAuthor: latest.latestMessage?.author.callsign || latest.latestMessage?.author.name,
      });
    }

    const sinceMs = sinceParam ? parseInt(sinceParam, 10) : undefined;
    const limit = limitParam ? parseInt(limitParam, 10) : 100;

    const messages = await getStoredChatMessages(channel, limit, sinceMs);
    const latestTimestamp = messages.length > 0 ? messages[messages.length - 1].createdAtMs : (sinceMs || 0);

    return NextResponse.json({
      messages,
      latestTimestamp,
      count: messages.length,
    });
  } catch (err: any) {
    console.error("GET /api/chat/messages error:", err);
    return NextResponse.json({ error: "Failed to load chat messages." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawMsg = body.message as ChatMessage;

    if (!rawMsg || (!rawMsg.content?.trim() && !rawMsg.dopeCard)) {
      return NextResponse.json({ error: "Message content or DOPE card required." }, { status: 400 });
    }

    // Ensure valid author and channel
    const messageToSave: ChatMessage = {
      id: rawMsg.id || "msg_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      channelId: rawMsg.channelId || "invitational",
      type: rawMsg.type || "STANDARD",
      dopeCard: rawMsg.dopeCard,
      author: {
        id: rawMsg.author?.id || "anonymous_marksman",
        name: rawMsg.author?.name || "Verified Marksman",
        callsign: rawMsg.author?.callsign || "MARKSMAN",
        role: rawMsg.author?.role || "MEMBER",
        badgeText: rawMsg.author?.badgeText || "MEMBER",
        division: rawMsg.author?.division || "Open Division",
        rifleSetup: rawMsg.author?.rifleSetup || "Precision Rimfire",
      },
      content: rawMsg.content,
      timestamp: rawMsg.timestamp || new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
      reactions: rawMsg.reactions || [],
      moderationStatus: rawMsg.moderationStatus || "APPROVED",
      aiModerationReport: rawMsg.aiModerationReport,
    };

    // 1. Save to durable server-side storage
    const saved = await saveStoredChatMessage(messageToSave);

    // 2. Best-effort mirror to Supabase cloud if configured
    if (isSupabaseConfigured && supabase) {
      const payloadContent = saved.dopeCard
        ? `[DOPE DROP] 🎯 Target: ${saved.dopeCard.targetDistance} | Elev: ${saved.dopeCard.elevationMils} | Wind: ${saved.dopeCard.windHoldMils}\n${saved.content || ""}`.trim()
        : saved.content;

      Promise.resolve(
        supabase
          .from("chat_messages")
          .insert([
            {
              id: saved.id,
              channel_id: saved.channelId,
              author_id: saved.author.id,
              author_name: saved.author.name,
              author_callsign: saved.author.callsign,
              author_role: saved.author.role,
              author_badge: saved.author.badgeText,
              content: payloadContent,
              moderation_status: saved.moderationStatus,
              created_at: new Date(saved.createdAtMs).toISOString(),
            },
          ])
      ).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: saved,
    });
  } catch (err: any) {
    console.error("POST /api/chat/messages error:", err);
    return NextResponse.json({ error: "Failed to persist chat message." }, { status: 500 });
  }
}
