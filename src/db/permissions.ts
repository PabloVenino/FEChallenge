/**
 * Role + column-permission model for the analytics copilot.
 *
 * The copilot serves users with different roles. Some columns are PII and must
 * not be readable by every role.
 *
 * TODO(candidate): PII permissions are DEFINED here but NOT yet ENFORCED.
 * An `analyst` should never be able to read PII columns (candidate
 * name/email/phone); `recruiter` and `admin` may. Wire enforcement into the
 * query layer (src/db/analytics.ts) so it cannot be skipped — ideally make a
 * PII-leaking query for the wrong role *unrepresentable*, not merely rejected
 * after the fact. Then prove it with an eval.
 */

export const ROLES = ["admin", "recruiter", "analyst"] as const;
export type Role = (typeof ROLES)[number];

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

/** Default role when none is supplied on the request. */
export const DEFAULT_ROLE: Role = "recruiter";

/** Columns considered PII, keyed by table. Reading these requires a non-analyst role. */
export const PII_COLUMNS: Record<string, readonly string[]> = {
  candidates: ["name", "email", "phone"],
};

const CAN_SEE_PII: Record<Role, boolean> = {
  admin: true,
  recruiter: true,
  analyst: false,
};

/** Checks if a role can read a given PII_COLUMNS */
export function canReadColumn(role: Role, table: string, column: string): boolean {
  const isPii = PII_COLUMNS[table]?.includes(column);
  if (isPii) return CAN_SEE_PII[role];
  return true; // non-PII columns readable by everyone
}

