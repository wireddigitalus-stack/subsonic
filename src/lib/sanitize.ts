/**
 * Profile Sanitization Utility
 * 
 * Single source of truth for cleaning up profile data across the entire app.
 * Replaces the scattered "VIP Pro Competitor" checks that were duplicated
 * in 8+ files.
 */

/** Names that are generic boilerplate from invite codes — not real names */
const BOILERPLATE_NAMES = [
  "VIP Pro Competitor",
  "Invitational Competitor VIP",
  "VIP Competitor",
  "Society Member Invite",
  "Society Member",
  "Pro Competitor",
  "Test Marksman",
];

/** Case-insensitive fragments that indicate a boilerplate name */
const BOILERPLATE_FRAGMENTS = ["vip", "invitational competitor"];

/**
 * Check if a name is a generic boilerplate name that should not be displayed.
 */
export function isBoilerplateName(name: string): boolean {
  if (!name || !name.trim()) return true;
  const lower = name.trim().toLowerCase();
  if (BOILERPLATE_NAMES.some((bp) => bp.toLowerCase() === lower)) return true;
  if (BOILERPLATE_FRAGMENTS.some((frag) => lower.includes(frag))) return true;
  return false;
}

/**
 * Get the best display name for a shooter/member, falling back to callsign
 * if the name is boilerplate.
 */
export function getDisplayName(name: string, callsign?: string): string {
  if (!isBoilerplateName(name)) return name;
  if (callsign && callsign.trim()) return callsign.trim().toUpperCase();
  return name; // last resort — return whatever we have
}

/**
 * Sanitize a profile object in-place, replacing boilerplate names with callsign.
 * Works with any object that has `name` and `callsign` string fields.
 */
export function sanitizeProfileName<T extends { name: string; callsign?: string }>(
  profile: T
): T {
  if (isBoilerplateName(profile.name) && profile.callsign) {
    profile.name = profile.callsign.trim().toUpperCase();
  }
  return profile;
}

/**
 * Sanitize a member object in-place, replacing boilerplate full_name with callsign.
 */
export function sanitizeMemberName<T extends { full_name: string; callsign?: string }>(
  member: T
): T {
  if (isBoilerplateName(member.full_name) && member.callsign) {
    member.full_name = member.callsign.trim().toUpperCase();
  }
  return member;
}
