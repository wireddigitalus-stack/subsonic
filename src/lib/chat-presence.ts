/**
 * In-memory presence tracker for active shooters in Subsonic Society chat.
 * Marksmen are marked online when they poll the chat endpoint.
 * A marksman who hasn't polled in 20 seconds (or who explicitly logged out) is marked offline.
 */

const PRESENCE_TIMEOUT_MS = 20_000; // 20 seconds

// Map of normalized callsign -> last active epoch ms
const activeMarksmen = new Map<string, number>();

export function recordHeartbeat(callsign?: string): void {
  if (!callsign) return;
  const clean = callsign.trim().toUpperCase();
  if (clean && clean !== "GUEST") {
    activeMarksmen.set(clean, Date.now());
  }
}

export function recordLogout(callsign?: string): void {
  if (!callsign) return;
  const clean = callsign.trim().toUpperCase();
  activeMarksmen.delete(clean);
}

export function getOnlineCallsigns(): string[] {
  const now = Date.now();
  const online: string[] = [];

  activeMarksmen.forEach((lastSeen, callsign) => {
    if (now - lastSeen < PRESENCE_TIMEOUT_MS) {
      online.push(callsign);
    } else {
      activeMarksmen.delete(callsign);
    }
  });

  return online;
}

export function isCallsignOnline(callsign?: string): boolean {
  if (!callsign) return false;
  const clean = callsign.trim().toUpperCase();
  const lastSeen = activeMarksmen.get(clean);
  if (!lastSeen) return false;
  if (Date.now() - lastSeen < PRESENCE_TIMEOUT_MS) {
    return true;
  }
  activeMarksmen.delete(clean);
  return false;
}
