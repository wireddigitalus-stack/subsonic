/**
 * Subsonic Society — Tactical Avatar & Presence Utilities
 * 
 * Provides curated dark tactical colors for shooter avatars when no profile picture
 * is uploaded, clean initials extraction, and human-readable last active formatting.
 */

export interface TacticalColorOption {
  id: string;
  name: string;
  hex: string;
  borderHex: string;
  accentHex: string;
}

// Curated dark, tactical color palette with high contrast for crisp white initials
export const DARK_AVATAR_COLORS: TacticalColorOption[] = [
  { id: "carbon", name: "Carbon Black", hex: "#18181b", borderHex: "#3f3f46", accentHex: "#a1a1aa" },
  { id: "gunmetal", name: "Gunmetal Slate", hex: "#0f172a", borderHex: "#334155", accentHex: "#94a3b8" },
  { id: "navy", name: "Midnight Navy", hex: "#0b192c", borderHex: "#1e3a5f", accentHex: "#60a5fa" },
  { id: "ranger", name: "Ranger Green", hex: "#0d2818", borderHex: "#1b4d2e", accentHex: "#4ade80" },
  { id: "crimson", name: "Tactical Crimson", hex: "#2e0c10", borderHex: "#5c1820", accentHex: "#f87171" },
  { id: "plum", name: "Deep Plum", hex: "#220d2d", borderHex: "#4c1d63", accentHex: "#c084fc" },
  { id: "bronze", name: "Deep Bronze", hex: "#261908", borderHex: "#4d3310", accentHex: "#fbbf24" },
  { id: "petroleum", name: "Deep Petroleum", hex: "#062326", borderHex: "#0d4a52", accentHex: "#2dd4bf" },
  { id: "steel", name: "Dark Steel", hex: "#1e293b", borderHex: "#475569", accentHex: "#cbd5e1" },
  { id: "olive", name: "Tactical Olive", hex: "#1a1f0e", borderHex: "#37421c", accentHex: "#a3e635" },
];

export const DEFAULT_AVATAR_COLOR = DARK_AVATAR_COLORS[1]; // Gunmetal Slate

/**
 * Extracts 2-letter uppercase initials from a user's name or callsign.
 * e.g. "Rob Neilson" -> "RN"
 *      "Allen Hurley" -> "AH"
 *      "Tony" -> "TO"
 *      "Test X" -> "TX"
 */
export function getUserInitials(name?: string, callsign?: string): string {
  const cleanName = (name || "").trim();
  if (cleanName) {
    const parts = cleanName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const first = parts[0][0];
      const last = parts[parts.length - 1][0];
      return (first + last).toUpperCase();
    }
    if (cleanName.length >= 2) {
      return cleanName.slice(0, 2).toUpperCase();
    }
    if (cleanName.length === 1) {
      return cleanName.toUpperCase() + (callsign ? callsign.slice(0, 1).toUpperCase() : "");
    }
  }

  const cleanCallsign = (callsign || "").trim();
  if (cleanCallsign) {
    const parts = cleanCallsign.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return cleanCallsign.slice(0, 2).toUpperCase();
  }

  return "SS";
}

/**
 * Returns the matching dark color option, or calculates a deterministic
 * dark tactical color from a seed string (callsign or name) so every user
 * has a distinct dark background right out of the box.
 */
export function getAvatarColor(customColor?: string, seedString?: string): TacticalColorOption {
  if (customColor) {
    const found = DARK_AVATAR_COLORS.find(
      (c) => c.hex.toLowerCase() === customColor.toLowerCase() || c.id === customColor
    );
    if (found) return found;
    return {
      id: "custom",
      name: "Custom Dark",
      hex: customColor,
      borderHex: "rgba(255,255,255,0.2)",
      accentHex: "#ffffff",
    };
  }

  const seed = (seedString || "SS").toUpperCase();
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % DARK_AVATAR_COLORS.length;
  return DARK_AVATAR_COLORS[index];
}

/**
 * Formats a user's last active epoch timestamp into a sleek tactical relative string.
 * e.g. "Active now", "Active 3m ago", "Active 1h ago", "Active yesterday"
 */
export function formatLastActive(lastActiveEpochMs?: number, isOnline?: boolean): string {
  if (isOnline) return "Active now";
  if (!lastActiveEpochMs || lastActiveEpochMs <= 0) return "Active today";

  const diffMs = Math.max(0, Date.now() - lastActiveEpochMs);
  if (diffMs < 45_000) return "Active now";

  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `Active ${mins}m ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Active ${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Active yesterday";
  if (days < 7) return `Active ${days}d ago`;

  return "Active recently";
}
