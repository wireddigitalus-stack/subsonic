/**
 * PIN Policy
 *
 * - All members / competitors: exactly 4 numeric digits.
 * - Admin roles (MASTER_OWNER, OWNER_ADMIN, ADMIN): 4 to 6 numeric digits.
 *
 * Existing legacy PINs (e.g. 6-digit member PINs created before this policy)
 * continue to work at login — this policy is only enforced when a PIN is
 * created or changed.
 */

export const MEMBER_PIN_LENGTH = 4;
export const ADMIN_PIN_MIN = 4;
export const ADMIN_PIN_MAX = 6;

const ADMIN_ROLES = new Set(["MASTER_OWNER", "OWNER_ADMIN", "ADMIN"]);

export function isAdminRole(role?: string | null): boolean {
  return !!role && ADMIN_ROLES.has(role.toUpperCase());
}

/** Max input length for a PIN field given the account role. */
export function pinMaxLength(role?: string | null): number {
  return isAdminRole(role) ? ADMIN_PIN_MAX : MEMBER_PIN_LENGTH;
}

/** Human readable rule, e.g. for labels/placeholders. */
export function pinRuleLabel(role?: string | null): string {
  return isAdminRole(role) ? "4–6 digit PIN (admin)" : "4-digit PIN";
}

/**
 * Validate a plain-text PIN for the given role.
 * Returns an error message, or null when valid.
 */
export function validatePin(pin: string | undefined | null, role?: string | null): string | null {
  const clean = String(pin ?? "").trim();
  if (isAdminRole(role)) {
    if (!/^\d{4,6}$/.test(clean)) return "Admin PINs must be 4 to 6 numeric digits.";
    return null;
  }
  if (!/^\d{4}$/.test(clean)) return "PIN must be exactly 4 numeric digits.";
  return null;
}

/** Generate a random PIN that satisfies the policy for the role. */
export function generatePin(role?: string | null): string {
  const len = isAdminRole(role) ? ADMIN_PIN_MAX : MEMBER_PIN_LENGTH;
  const min = 10 ** (len - 1);
  return String(Math.floor(min + Math.random() * (9 * min)));
}
