import fs from "fs/promises";
import path from "path";
import { ChatMessage } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const CHAT_FILE = path.join(DATA_DIR, "chat-messages.jsonl");

export interface StoredChatMessage extends ChatMessage {
  createdAtMs: number;
}

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // Already exists
  }
}

/**
 * Saves a new chat message to durable server-side storage
 */
export async function saveStoredChatMessage(message: ChatMessage): Promise<StoredChatMessage> {
  await ensureDataDir();

  const record: StoredChatMessage = {
    ...message,
    createdAtMs: Date.now(),
  };

  const line = JSON.stringify(record) + "\n";
  await fs.appendFile(CHAT_FILE, line, "utf-8");
  return record;
}

/**
 * Reads stored chat messages from file, optionally filtered by channelId and timestamp
 */
export async function getStoredChatMessages(
  channelId?: string,
  limit: number = 100,
  sinceMs?: number
): Promise<StoredChatMessage[]> {
  try {
    await ensureDataDir();
    const raw = await fs.readFile(CHAT_FILE, "utf-8");
    const lines = raw.trim().split("\n").filter(Boolean);
    const messages: StoredChatMessage[] = [];

    for (const line of lines) {
      try {
        const parsed: StoredChatMessage = JSON.parse(line);
        if (sinceMs && parsed.createdAtMs <= sinceMs) {
          continue;
        }
        if (channelId && channelId !== "all" && parsed.channelId !== channelId) {
          continue;
        }
        messages.push(parsed);
      } catch {
        // Skip malformed lines
      }
    }

    if (limit && messages.length > limit) {
      return messages.slice(-limit);
    }

    return messages;
  } catch (err: any) {
    if (err.code === "ENOENT") {
      return [];
    }
    console.error("Error reading stored chat messages:", err);
    return [];
  }
}

/**
 * Gets the timestamp of the latest stored chat message
 */
export async function getLatestChatTimestamp(excludeCallsign?: string): Promise<{ timestamp: number; unreadCount: number; latestMessage?: StoredChatMessage }> {
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
