import { getMembersFromStorage } from "@/lib/members";
import { getShootersFromStorage } from "@/lib/shooters";

// Official system-reserved tactical callsigns & automated bots
export const RESERVED_CALLSIGNS: string[] = [
  "ADMIN",
  "ADMINISTRATOR",
  "MODERATOR",
  "MOD",
  "PLINK",
  "SENTINEL",
  "DIRECTOR-01",
  "IRONHIDE",
  "RANGE-MASTER",
  "RANGEMASTER",
  "RO",
  "CHIEF-RO",
  "OFFICIAL",
  "STAFF",
  "SUPPORT",
  "SYSTEM",
  "ROOT",
  "SUBSONIC",
  "THE-HIDEOUT",
  "HIDEOUT",
  "FOUNDER",
  "OWNER",
  "SECURITY",
];

export interface CallsignCheckResult {
  isValidFormat: boolean;
  isAvailable: boolean;
  normalized: string;
  message: string;
  suggestions: string[];
}

/**
 * Returns a Set of all currently registered or reserved callsigns in uppercase.
 */
export function getAllTakenCallsigns(excludeMemberId?: string): Set<string> {
  const taken = new Set<string>();

  // 1. Reserved callsigns
  for (const r of RESERVED_CALLSIGNS) {
    taken.add(r.toUpperCase().trim());
  }

  // 2. Existing Society Members
  try {
    const members = getMembersFromStorage();
    for (const m of members) {
      if (excludeMemberId && m.member_id === excludeMemberId) continue;
      if (m.callsign) {
        taken.add(m.callsign.toUpperCase().trim());
      }
    }
  } catch (e) {
    console.warn("Error reading members for callsign check:", e);
  }

  // 3. Existing Shooter Profiles
  try {
    const shooters = getShootersFromStorage();
    for (const s of shooters) {
      if (s.callsign) {
        taken.add(s.callsign.toUpperCase().trim());
      }
      if (s.id) {
        taken.add(s.id.toUpperCase().trim());
      }
    }
  } catch (e) {
    console.warn("Error reading shooters for callsign check:", e);
  }

  return taken;
}

/**
 * Generates tailored, tactical shooter callsign suggestions that are guaranteed available.
 */
export function generateCallsignSuggestions(
  baseCallsign: string,
  takenSet: Set<string>,
  state?: string
): string[] {
  const clean = baseCallsign.toUpperCase().replace(/[^A-Z0-9-]/g, "").trim();
  const cleanState = (state || "TN").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2);

  // Candidate generation list
  const candidates: string[] = [
    `${clean}-${cleanState}`,     // e.g. GHOST-TN
    `${clean}-22`,                // e.g. GHOST-22 (Rimfire caliber)
    `${clean}-X`,                 // e.g. GHOST-X
    `${clean}-PRO`,               // e.g. GHOST-PRO
    `${clean}-01`,                // e.g. GHOST-01
    `COLD-${clean}`,              // e.g. COLD-GHOST
    `APEX-${clean}`,              // e.g. APEX-GHOST
    `TAC-${clean}`,               // e.g. TAC-GHOST
    `${clean}-ONE`,               // e.g. GHOST-ONE
    `${clean}-7`,                 // e.g. GHOST-7
    `${clean}-99`,                // e.g. GHOST-99
  ];

  const availableSuggestions: string[] = [];

  for (const cand of candidates) {
    if (!takenSet.has(cand) && cand !== clean && cand.length >= 2 && cand.length <= 16) {
      availableSuggestions.push(cand);
      if (availableSuggestions.length >= 4) break;
    }
  }

  // Fallback random tactical digits if candidates were somehow all taken
  let counter = 10;
  while (availableSuggestions.length < 4 && counter < 99) {
    const fallback = `${clean}-${counter}`;
    if (!takenSet.has(fallback)) {
      availableSuggestions.push(fallback);
    }
    counter++;
  }

  return availableSuggestions;
}

/**
 * Validates availability and format of a requested callsign.
 */
export function checkCallsignAvailability(
  rawCallsign: string,
  options?: {
    excludeMemberId?: string;
    state?: string;
  }
): CallsignCheckResult {
  if (!rawCallsign || typeof rawCallsign !== "string") {
    return {
      isValidFormat: false,
      isAvailable: false,
      normalized: "",
      message: "Please enter a tactical callsign.",
      suggestions: [],
    };
  }

  const normalized = rawCallsign.toUpperCase().replace(/[^A-Z0-9-]/g, "").trim();

  // Format checks
  if (normalized.length < 2) {
    return {
      isValidFormat: false,
      isAvailable: false,
      normalized,
      message: "Callsign must be at least 2 characters long.",
      suggestions: [],
    };
  }

  if (normalized.length > 16) {
    return {
      isValidFormat: false,
      isAvailable: false,
      normalized,
      message: "Callsign cannot exceed 16 characters.",
      suggestions: [],
    };
  }

  const takenSet = getAllTakenCallsigns(options?.excludeMemberId);

  // Check collision
  if (takenSet.has(normalized)) {
    const suggestions = generateCallsignSuggestions(normalized, takenSet, options?.state);
    return {
      isValidFormat: true,
      isAvailable: false,
      normalized,
      message: `Tactical callsign "${normalized}" is already assigned to an active operative or reserved.`,
      suggestions,
    };
  }

  return {
    isValidFormat: true,
    isAvailable: true,
    normalized,
    message: `Callsign "${normalized}" is available!`,
    suggestions: [],
  };
}
