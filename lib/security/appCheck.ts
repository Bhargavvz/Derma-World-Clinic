import "server-only";
import { flags } from "@/lib/env";
import { adminAppCheck, isAdminConfigured } from "@/lib/firebase/admin";

/**
 * Verify a Firebase App Check token.
 * When APP_CHECK_ENFORCED is false, a missing/invalid token is allowed (monitor mode).
 */
export async function verifyAppCheck(token: string | null | undefined): Promise<boolean> {
  if (!flags.appCheckEnforced) return true;
  if (!token || !isAdminConfigured()) return false;
  try {
    await adminAppCheck().verifyToken(token);
    return true;
  } catch {
    return false;
  }
}
