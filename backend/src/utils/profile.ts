/**
 * Profile completeness check.
 *
 * Deliberately uses only the existing `fullName`/`phone` User columns —
 * both are already required at registration and NOT NULL in the schema, so
 * this is a safety net (legacy/seeded/imported accounts) rather than a
 * condition normal signups can actually fail. `profilePhoto` is optional
 * and intentionally not part of the completeness check.
 */
export function isProfileComplete(user: { fullName?: string | null; phone?: string | null }): boolean {
  return Boolean(user.fullName?.trim()) && Boolean(user.phone?.trim());
}
