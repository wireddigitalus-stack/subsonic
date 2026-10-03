/**
 * PIN Hashing Utility
 * 
 * Uses the Web Crypto API (available in Node.js 18+ and Edge Runtime)
 * to hash member PINs with SHA-256 + salt before storage.
 * 
 * This is intentionally simple — PINs are 4-6 digit codes, not passwords.
 * For full auth, migrate to Supabase Auth with proper bcrypt hashing.
 */

const SALT = "subsonic-society-2026-bristol-tn";

/**
 * Hash a plain-text PIN for storage.
 * Returns a hex string.
 */
export async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(`${SALT}:${pin.trim()}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Verify a plain-text PIN against a stored hash.
 */
export async function verifyPin(pin: string, storedHash: string): Promise<boolean> {
  const hash = await hashPin(pin);
  return hash === storedHash;
}

/**
 * Check if a value looks like an already-hashed PIN (64-char hex string).
 * Used to avoid double-hashing during migration.
 */
export function isHashedPin(value: string): boolean {
  return /^[0-9a-f]{64}$/.test(value);
}

/**
 * Synchronous variant (Node only) — produces the exact same hash as hashPin().
 * Used by server storage mappers that cannot be async.
 */
export function hashPinSync(pin: string): string {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createHash } = require("crypto") as typeof import("crypto");
  return createHash("sha256").update(`${SALT}:${pin.trim()}`).digest("hex");
}

/** Return a hashed PIN, hashing plain values and passing hashed values through. */
export function toPinHash(pin: string | undefined | null): string | null {
  const clean = String(pin ?? "").trim();
  if (!clean) return null;
  return isHashedPin(clean) ? clean : hashPinSync(clean);
}
