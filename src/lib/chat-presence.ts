/**
 * In-memory presence tracker for active shooters in Subsonic Society chat.
 * Marksmen are marked online when they poll the chat endpoint or transmit a message.
 * A marksman who hasn't polled in 25 seconds is considered offline, but their
 * last active timestamp is retained so other users can see "Active 5m ago", etc.
 */

const PRESENCE_TIMEOUT_MS = 25_000; // 25 seconds

// Map of normalized callsign -> last active epoch ms
const activeMarksmen = new Map<string, number>();

export function recordHeartbeat(callsign?: string, timestampMs = Date.now()): void {
  if (!callsign) return;
  const clean = callsign.trim().toUpperCase();
  if (clean && clean !== "GUEST") {
    activeMarksmen.set(clean, timestampMs);

    // Memory protection: if map exceeds 2,000 users, prune entries older than 30 days
    if (activeMarksmen.size > 2000) {
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      activeMarksmen.forEach((lastSeen, cs) => {
        if (lastSeen < thirtyDaysAgo) {
          activeMarksmen.delete(cs);
        }
      });
    }
  }
}

export function recordLogout(callsign?: string): void {
  if (!callsign) return;
  const clean = callsign.trim().toUpperCase();
  // Instead of deleting, we set their status to past timeout so they show as offline with their logout time
  const current = activeMarksmen.get(clean) || Date.now();
  activeMarksmen.set(clean, current - PRESENCE_TIMEOUT_MS - 1000);
}

export function getOnlineCallsigns(): string[] {
  const now = Date.now();
  const online: string[] = [];

  activeMarksmen.forEach((lastSeen, callsign) => {
    if (now - lastSeen < PRESENCE_TIMEOUT_MS) {
      online.push(callsign);
    }
  });

  return online;
}

export function getLastActiveMap(): Record<string, number> {
  const map: Record<string, number> = {};
  activeMarksmen.forEach((lastSeen, callsign) => {
    map[callsign] = lastSeen;
  });
  return map;
}

export function getPresenceSnapshot(): {
  onlineCallsigns: string[];
  lastActiveMap: Record<string, number>;
} {
  const now = Date.now();
  const onlineCallsigns: string[] = [];
  const lastActiveMap: Record<string, number> = {};

  activeMarksmen.forEach((lastSeen, callsign) => {
    lastActiveMap[callsign] = lastSeen;
    if (now - lastSeen < PRESENCE_TIMEOUT_MS) {
      onlineCallsigns.push(callsign);
    }
  });

  return { onlineCallsigns, lastActiveMap };
}

export function isCallsignOnline(callsign?: string): boolean {
  if (!callsign) return false;
  const clean = callsign.trim().toUpperCase();
  const lastSeen = activeMarksmen.get(clean);
  if (!lastSeen) return false;
  return Date.now() - lastSeen < PRESENCE_TIMEOUT_MS;
}
