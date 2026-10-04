import { NextRequest, NextResponse } from "next/server";
import {
  saveStoredChatMessage,
  getStoredChatMessages,
  getLatestChatTimestamp,
  getUserDmConversations,
} from "@/lib/chat-storage";
import { ChatMessage } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const channel = searchParams.get("channel") || "all";
    const sinceParam = searchParams.get("since");
    const limitParam = searchParams.get("limit");
    const pollUnread = searchParams.get("pollUnread") === "true";
    const excludeCallsign = searchParams.get("excludeCallsign") || undefined;
    const userCallsign = searchParams.get("userCallsign") || undefined;

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

    // If caller specified their callsign, fetch active DM threads and unread counts
    const dmConversations = userCallsign ? await getUserDmConversations(userCallsign) : [];
    const unreadSummary: Record<string, number> = {};
    for (const c of dmConversations) {
      if (c.unreadCount > 0) {
        unreadSummary[c.channelId] = c.unreadCount;
      }
    }

    return NextResponse.json({
      messages,
      latestTimestamp,
      count: messages.length,
      dmConversations,
      unreadSummary,
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

    // Save to the database (throws if the database rejects it)
    const saved = await saveStoredChatMessage(messageToSave);

    return NextResponse.json({
      success: true,
      message: saved,
    });
  } catch (err: any) {
    console.error("POST /api/chat/messages error:", err);
    return NextResponse.json({ error: "Failed to persist chat message." }, { status: 500 });
  }
}
