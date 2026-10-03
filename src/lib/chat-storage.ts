import fs from "fs/promises";
import path from "path";
import { ChatMessage } from "./types";
import { db } from "./supabase-admin";

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
 * Saves a new chat message. Throws if the database rejects it so the caller can report failure.
 */
export async function saveStoredChatMessage(message: ChatMessage): Promise<StoredChatMessage> {
  const record: StoredChatMessage = {
    ...message,
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
 */
export async function getStoredChatMessages(
  channelId?: string,
  limit: number = 100,
  sinceMs?: number
): Promise<StoredChatMessage[]> {
  if (db) {
    let query = db
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit || 100);
    if (channelId && channelId !== "all") query = query.eq("channel_id", channelId);
    if (sinceMs) query = query.gt("created_at", new Date(sinceMs).toISOString());

    const { data, error } = await query;
    if (error) {
      console.error("Error reading chat messages from database:", error.message);
      return [];
    }
    return (data || []).map(mapFromDb).reverse();
  }

  // Offline fallback
  try {
    const raw = await fs.readFile(CHAT_FILE, "utf-8");
    const messages: StoredChatMessage[] = [];
    for (const line of raw.trim().split("\n").filter(Boolean)) {
      try {
        const parsed: StoredChatMessage = JSON.parse(line);
        if (sinceMs && parsed.createdAtMs <= sinceMs) continue;
        if (channelId && channelId !== "all" && parsed.channelId !== channelId) continue;
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
