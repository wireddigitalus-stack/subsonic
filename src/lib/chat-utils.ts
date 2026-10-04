/**
 * Chat utilities and helpers shared between client and server.
 */

export function normalizeCallsign(callsign: string): string {
  return (callsign || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

/**
 * Returns a canonical, symmetrical channel ID for a 1-on-1 direct message channel.
 * Guarantees that whether User A clicks User B or User B clicks User A,
 * both join the exact same channel.
 *
 * e.g. ("RADAR", "TESTX") -> "dm_radar_testx"
 * e.g. ("TESTX", "RADAR") -> "dm_radar_testx"
 * e.g. ("RO BOT", "TESTX") -> "dm_ro"
 */
export function getDmChannelId(c1: string, c2: string): string {
  const s1 = normalizeCallsign(c1);
  const s2 = normalizeCallsign(c2);

  if (!s1 && !s2) return "dm_general";
  if (!s1) return `dm_${s2}`;
  if (!s2) return `dm_${s1}`;

  // RO Bot is always the singular AI Range Officer channel
  if (s1 === "ro" || s1 === "ro_bot" || s2 === "ro" || s2 === "ro_bot") {
    return "dm_ro";
  }

  const sorted = [s1, s2].sort();
  return `dm_${sorted.join("_")}`;
}

/**
 * Extracts participant callsigns from a canonical DM channel ID.
 * e.g. "dm_radar_testx" -> ["radar", "testx"]
 * Returns null if not a DM channel or if it's the bot "dm_ro".
 */
export function parseDmParticipants(channelId: string): [string, string] | null {
  if (!channelId || !channelId.startsWith("dm_") || channelId === "dm_ro") {
    return null;
  }
  const clean = channelId.slice(3); // remove "dm_"
  const parts = clean.split("_").filter(Boolean);
  if (parts.length === 2) {
    return [parts[0], parts[1]];
  }
  if (parts.length > 2) {
    // If a callsign contained underscores (e.g. said_done), split at midpoint or handle
    return [parts[0], parts.slice(1).join("_")];
  }
  return null;
}
