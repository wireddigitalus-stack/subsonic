import fs from "fs/promises";
import path from "path";
import { ChatMessage } from "./types";
import { db } from "./supabase-admin";
import { normalizeCallsign, getDmChannelId, parseDmParticipants } from "./chat-utils";

/**
 * Chat message storage.
 *
 * Source of truth = Supabase `chat_messages` table (live schema:
 *   id, channel_id, type, dope_card, author(jsonb), content, created_at,
 *   reactions, moderation_status, ai_moderation_report).
 *
 * A local JSONL file is used only when no database is configured (offline dev).
 */

const IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = IS_SERVERLESS ? "/tmp" : path.join(process.cwd(), "data");
const CHAT_FILE = path.join(DATA_DIR, "chat-messages.jsonl");

export interface StoredChatMessage extends ChatMessage {
  createdAtMs: number;
}

export interface UserDmConversation {
  channelId: string;
  partnerCallsign: string;
  partnerName: string;
  partnerRole?: string;
  partnerDivision?: string;
  latestMessage: string;
  timestamp: string;
  createdAtMs: number;
  unreadCount: number;
}

const VALID_TYPES = new Set(["STANDARD", "DOPE_DROP", "MATCH_ALERT", "RADIO_CHECK"]);
const VALID_STATUS = new Set(["APPROVED", "FLAGGED", "PENDING_REVIEW", "REJECTED"]);

function formatDisplayTime(ms: number): string {
  // The Society is Tennessee-based; show Eastern time consistently for everyone.
  return new Date(ms).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/New_York",
  });
}

function mapToDb(m: StoredChatMessage) {
  return {
    id: m.id,
    channel_id: m.channelId,
    type: m.type && VALID_TYPES.has(m.type) ? m.type : "STANDARD",
    dope_card: m.dopeCard ?? null,
    author: m.author,
    content: m.content ?? "",
    created_at: new Date(m.createdAtMs).toISOString(),
    reactions: m.reactions ?? [],
    moderation_status: VALID_STATUS.has(m.moderationStatus) ? m.moderationStatus : "APPROVED",
    ai_moderation_report: m.aiModerationReport ?? null,
  };
}

function mapFromDb(row: any): StoredChatMessage {
  const createdAtMs = new Date(row.created_at).getTime();
  return {
    id: row.id,
    channelId: row.channel_id,
    type: row.type || "STANDARD",
    dopeCard: row.dope_card || undefined,
    author: row.author || { id: "unknown", name: "Verified Marksman", role: "MEMBER" },
    content: row.content || "",
    timestamp: formatDisplayTime(createdAtMs),
    reactions: row.reactions || [],
    moderationStatus: row.moderation_status || "APPROVED",
    aiModerationReport: row.ai_moderation_report || undefined,
    createdAtMs,
  };
}

/**
 * Saves a new chat message. Canonicalizes DM channels and throws if the database rejects it.
 */
export async function saveStoredChatMessage(message: ChatMessage): Promise<StoredChatMessage> {
  let targetChannelId = message.channelId || "invitational";

  // If this is a direct message, ensure canonical channel ID (e.g. dm_radar_testx)
  if (targetChannelId.startsWith("dm_") && targetChannelId !== "dm_ro") {
    const parts = parseDmParticipants(targetChannelId);
    if (!parts) {
      // Legacy single-target format like dm_radar
      const targetCallsign = targetChannelId.replace(/^dm_/, "");
      const authorCallsign = message.author?.callsign || "";
      if (authorCallsign && targetCallsign) {
        targetChannelId = getDmChannelId(authorCallsign, targetCallsign);
      }
    }
  }

  const record: StoredChatMessage = {
    ...message,
    channelId: targetChannelId,
    createdAtMs: Date.now(),
  };

  if (db) {
    const { error } = await db.from("chat_messages").upsert(mapToDb(record), { onConflict: "id" });
    if (error) throw new Error(`Database save failed (chat): ${error.message}`);
    return record;
  }

  // Offline fallback (no database configured)
  await fs.mkdir(DATA_DIR, { recursive: true }).catch(() => {});
  await fs.appendFile(CHAT_FILE, JSON.stringify(record) + "\n", "utf-8");
  return record;
}

/**
 * Reads chat messages (oldest → newest), optionally filtered by channel and "newer than" timestamp.
 * Seamlessly matches both canonical DM channels (e.g. dm_radar_testx) and legacy DM messages.
 */
export async function getStoredChatMessages(
  channelId?: string,
  limit: number = 100,
  sinceMs?: number
): Promise<StoredChatMessage[]> {
  const isDm = Boolean(channelId && channelId.startsWith("dm_") && channelId !== "dm_ro");
  const participants = isDm ? parseDmParticipants(channelId!) : null;

  if (db) {
    let query = db
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit || 100);

    if (channelId && channelId !== "all") {
      if (participants) {
        const [p1, p2] = participants;
        // Search canonical channel OR legacy single-callsign DM channels
        query = query.or(`channel_id.eq.${channelId},channel_id.eq.dm_${p1},channel_id.eq.dm_${p2}`);
      } else {
        query = query.eq("channel_id", channelId);
      }
    }
    if (sinceMs) query = query.gt("created_at", new Date(sinceMs).toISOString());

    const { data, error } = await query;
    if (error) {
      console.error("Error reading chat messages from database:", error.message);
      return [];
    }

    let mapped = (data || []).map(mapFromDb);

    if (participants) {
      const [p1, p2] = participants;
      mapped = mapped.filter((m) => {
        if (m.channelId === channelId) return true;
        const author = normalizeCallsign(m.author?.callsign || "");
        return author === p1 || author === p2;
      });

      // Background migration for legacy rows
      const legacyRows = (data || []).filter(
        (r: any) => r.channel_id !== channelId && (r.channel_id === `dm_${p1}` || r.channel_id === `dm_${p2}`)
      );
      if (legacyRows.length > 0) {
        const legacyIds = legacyRows.map((r: any) => r.id);
        Promise.resolve(
          db.from("chat_messages").update({ channel_id: channelId }).in("id", legacyIds)
        )
          .then((res: any) => {
            if (res?.error) console.warn("Chat legacy DM migration warning:", res.error.message);
            else console.log(`Migrated ${legacyIds.length} legacy DM messages to ${channelId}`);
          })
          .catch(() => {});
      }
    }

    return mapped.reverse();
  }

  // Offline fallback
  try {
    const raw = await fs.readFile(CHAT_FILE, "utf-8");
    const messages: StoredChatMessage[] = [];
    for (const line of raw.trim().split("\n").filter(Boolean)) {
      try {
        const parsed: StoredChatMessage = JSON.parse(line);
        if (sinceMs && parsed.createdAtMs <= sinceMs) continue;
        if (channelId && channelId !== "all") {
          if (participants) {
            const [p1, p2] = participants;
            const matchesCanonical = parsed.channelId === channelId;
            const author = normalizeCallsign(parsed.author?.callsign || "");
            const matchesLegacy =
              (parsed.channelId === `dm_${p1}` || parsed.channelId === `dm_${p2}`) &&
              (author === p1 || author === p2);
            if (!matchesCanonical && !matchesLegacy) continue;
          } else if (parsed.channelId !== channelId) {
            continue;
          }
        }
        messages.push(parsed);
      } catch {
        // Skip malformed lines
      }
    }
    return limit && messages.length > limit ? messages.slice(-limit) : messages;
  } catch (err: any) {
    if (err.code !== "ENOENT") console.error("Error reading stored chat messages:", err);
    return [];
  }
}

/**
 * Scans recent chat messages to summarize all DM conversations for a specific user.
 * Discovers incoming messages from competitors (even newly registered ones) and calculates unread counts.
 */
export async function getUserDmConversations(userCallsign: string): Promise<UserDmConversation[]> {
  const normUser = normalizeCallsign(userCallsign);
  if (!normUser) return [];

  // Read latest messages across all channels
  const allRecent = await getStoredChatMessages("all", 200);
  const convMap = new Map<string, UserDmConversation>();

  for (const m of allRecent) {
    const ch = m.channelId || "";
    if (!ch.startsWith("dm_") || ch === "dm_ro") continue;

    const authorNorm = normalizeCallsign(m.author?.callsign || "");
    const isAuthor = authorNorm === normUser;
    const chIncludes = ch.toLowerCase().includes(normUser);

    // If user is neither author nor named in channel, skip
    if (!isAuthor && !chIncludes) continue;

    let partnerCallsign = "";
    let partnerName = "";

    if (!isAuthor) {
      partnerCallsign = (m.author?.callsign || authorNorm).toUpperCase();
      partnerName = m.author?.name || partnerCallsign;
    } else {
      // Sent by current user; partner is the other party in channelId
      const parts = parseDmParticipants(ch);
      if (parts) {
        const other = parts[0] === normUser ? parts[1] : parts[0];
        partnerCallsign = other.toUpperCase();
        partnerName = other.toUpperCase();
      } else {
        // Legacy single-target channel, e.g. dm_radar or dm_allen
        partnerCallsign = ch.replace(/^dm_/, "").toUpperCase();
        partnerName = partnerCallsign;
      }
    }

    if (!partnerCallsign || partnerCallsign === userCallsign.toUpperCase()) continue;

    const canonicalChannel = getDmChannelId(normUser, partnerCallsign);
    const existing = convMap.get(canonicalChannel);
    const isIncoming = !isAuthor;

    if (!existing) {
      convMap.set(canonicalChannel, {
        channelId: canonicalChannel,
        partnerCallsign,
        partnerName,
        partnerRole: m.author?.role,
        partnerDivision: m.author?.division,
        latestMessage: m.content || (m.dopeCard ? "🎯 DOPE Card" : "Direct Transmission"),
        timestamp: m.timestamp || "",
        createdAtMs: m.createdAtMs || 0,
        unreadCount: isIncoming ? 1 : 0,
      });
    } else {
      if ((m.createdAtMs || 0) > existing.createdAtMs) {
        existing.latestMessage = m.content || (m.dopeCard ? "🎯 DOPE Card" : "Direct Transmission");
        existing.timestamp = m.timestamp || "";
        existing.createdAtMs = m.createdAtMs || 0;
        if (!isAuthor) {
          existing.partnerName = m.author?.name || existing.partnerName;
        }
      }
      if (isIncoming) {
        existing.unreadCount += 1;
      }
    }
  }

  return Array.from(convMap.values()).sort((a, b) => b.createdAtMs - a.createdAtMs);
}

/**
 * Gets the timestamp of the latest chat message (optionally ignoring the caller's own messages).
 */
export async function getLatestChatTimestamp(
  excludeCallsign?: string
): Promise<{ timestamp: number; unreadCount: number; latestMessage?: StoredChatMessage }> {
  try {
    const messages = await getStoredChatMessages("all", 50);
    if (!messages.length) {
      return { timestamp: 0, unreadCount: 0 };
    }

    const filtered = excludeCallsign
      ? messages.filter((m) => m.author.callsign?.toUpperCase() !== excludeCallsign.toUpperCase())
      : messages;

    const latest = filtered[filtered.length - 1] || messages[messages.length - 1];
    return {
      timestamp: latest.createdAtMs,
      unreadCount: filtered.length,
      latestMessage: latest,
    };
  } catch {
    return { timestamp: 0, unreadCount: 0 };
  }
}
