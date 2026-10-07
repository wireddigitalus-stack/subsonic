import { NextRequest, NextResponse } from "next/server";
import {
  saveStoredChatMessage,
  getStoredChatMessages,
  getLatestChatTimestamp,
  getUserDmConversations,
  getStoredChatMessageById,
  updateStoredChatMessage,
  deleteStoredChatMessage,
  purgeChatForCallsign,
  toggleStoredChatMessageReaction,
} from "@/lib/chat-storage";
import { recordHeartbeat, getPresenceSnapshot } from "@/lib/chat-presence";
import { ChatMessage } from "@/lib/types";

export const dynamic = "force-dynamic";

function isCallerAdmin(callsign?: string, role?: string): boolean {
  const normRole = (role || "").toUpperCase();
  const normCallsign = (callsign || "").toUpperCase();
  const adminRoles = ["MASTER_OWNER", "DEV_ADMIN", "OWNER_ADMIN", "ADMIN", "MODERATOR"];
  const adminCallsigns = ["RADAR", "ROB", "LTDAN", "SUBX", "ALLEN", "AHURLEY", "HURLEY"];
  return adminRoles.includes(normRole) || adminCallsigns.includes(normCallsign);
}

function isCallerAuthor(message: ChatMessage, callsign?: string, authorId?: string): boolean {
  if (!callsign && !authorId) return false;
  const msgCallsign = (message.author?.callsign || "").toUpperCase();
  const testCallsign = (callsign || "").toUpperCase();
  if (msgCallsign && testCallsign && msgCallsign === testCallsign) return true;
  if (authorId && message.author?.id === authorId) return true;
  return false;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const channel = searchParams.get("channel") || "all";
    const sinceParam = searchParams.get("since");
    const limitParam = searchParams.get("limit");
    const pollUnread = searchParams.get("pollUnread") === "true";
    const excludeCallsign = searchParams.get("excludeCallsign") || undefined;
    const userCallsign = searchParams.get("userCallsign") || undefined;

    if (userCallsign) {
      recordHeartbeat(userCallsign);
    }
    const { onlineCallsigns, lastActiveMap } = getPresenceSnapshot();

    if (pollUnread) {
      const sinceMs = sinceParam ? parseInt(sinceParam, 10) : 0;
      const latest = await getLatestChatTimestamp(excludeCallsign);
      const hasUnread = latest.timestamp > sinceMs;

      return NextResponse.json({
        latestTimestamp: latest.timestamp,
        hasUnread,
        unreadCount: hasUnread ? 1 : 0,
        latestAuthor: latest.latestMessage?.author.callsign || latest.latestMessage?.author.name,
        onlineCallsigns,
        lastActiveMap,
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
      onlineCallsigns,
      lastActiveMap,
    });
  } catch (err: any) {
    console.error("GET /api/chat/messages error:", err);
    return NextResponse.json({ error: "Failed to load chat messages." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if this is an emoji reaction action
    if (body.action === "reaction" || (body.messageId && body.emoji)) {
      const { messageId, emoji, userCallsign } = body;
      if (!messageId || !emoji) {
        return NextResponse.json({ error: "messageId and emoji are required for reaction." }, { status: 400 });
      }
      if (userCallsign) {
        recordHeartbeat(userCallsign);
      }
      const updated = await toggleStoredChatMessageReaction(
        messageId,
        emoji,
        userCallsign || "MARKSMAN"
      );
      if (!updated) {
        return NextResponse.json({ error: "Message not found or reaction failed." }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        message: updated,
      });
    }

    const rawMsg = body.message as ChatMessage;

    if (!rawMsg || (!rawMsg.content?.trim() && !rawMsg.dopeCard)) {
      return NextResponse.json({ error: "Message content or DOPE card required." }, { status: 400 });
    }

    // Record heartbeat for author on transmit
    if (rawMsg.author?.callsign) {
      recordHeartbeat(rawMsg.author.callsign);
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
        avatarUrl: rawMsg.author?.avatarUrl,
        avatarColor: rawMsg.author?.avatarColor,
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

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, content, editorCallsign, editorRole, editorId } = body;

    if (!id || typeof content !== "string" || !content.trim()) {
      return NextResponse.json({ error: "Message ID and content are required." }, { status: 400 });
    }

    const existing = await getStoredChatMessageById(id);
    if (!existing) {
      return NextResponse.json({ error: "Message not found." }, { status: 404 });
    }

    const isAdmin = isCallerAdmin(editorCallsign, editorRole);
    const isAuthor = isCallerAuthor(existing, editorCallsign, editorId);

    if (!isAdmin && !isAuthor) {
      return NextResponse.json(
        { error: "Permission denied. Only the author or an administrator can edit transmissions." },
        { status: 403 }
      );
    }

    const updated = await updateStoredChatMessage(id, content.trim(), editorCallsign || "ADMIN");
    if (!updated) {
      return NextResponse.json({ error: "Failed to update transmission." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: updated,
    });
  } catch (err: any) {
    console.error("PATCH /api/chat/messages error:", err);
    return NextResponse.json({ error: "Failed to edit transmission." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const purgeCallsign = searchParams.get("purgeCallsign");
    let id = searchParams.get("id");
    let requesterCallsign = searchParams.get("callsign");
    let requesterRole = searchParams.get("role");
    let requesterId = searchParams.get("authorId");

    // Also support JSON body if sent via DELETE body
    if (!id && !purgeCallsign) {
      try {
        const body = await req.json();
        id = body.id;
        requesterCallsign = body.requesterCallsign || body.callsign;
        requesterRole = body.requesterRole || body.role;
        requesterId = body.requesterId || body.authorId;
        if (body.purgeCallsign) {
          const count = await purgeChatForCallsign(body.purgeCallsign);
          return NextResponse.json({ success: true, purged: body.purgeCallsign, count });
        }
      } catch {}
    }

    if (purgeCallsign) {
      const count = await purgeChatForCallsign(purgeCallsign);
      return NextResponse.json({ success: true, purged: purgeCallsign, count });
    }

    if (!id) {
      return NextResponse.json({ error: "Message ID is required." }, { status: 400 });
    }

    const existing = await getStoredChatMessageById(id);
    if (!existing) {
      return NextResponse.json({ error: "Message not found." }, { status: 404 });
    }

    const isAdmin = isCallerAdmin(requesterCallsign || undefined, requesterRole || undefined);
    const isAuthor = isCallerAuthor(existing, requesterCallsign || undefined, requesterId || undefined);

    if (!isAdmin && !isAuthor) {
      return NextResponse.json(
        { error: "Permission denied. Only the author or an administrator can delete transmissions." },
        { status: 403 }
      );
    }

    const deleted = await deleteStoredChatMessage(id);
    if (!deleted) {
      return NextResponse.json({ error: "Failed to delete transmission." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      id,
    });
  } catch (err: any) {
    console.error("DELETE /api/chat/messages error:", err);
    return NextResponse.json({ error: "Failed to delete transmission." }, { status: 500 });
  }
}

