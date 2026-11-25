import "server-only";
import { createHash } from "node:crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";

export interface LimitRule {
  key: string; // e.g. "booking-ip:<raw>"
  max: number;
  windowMs: number;
}

/** Salted hash; raw IPs/phones are never stored. */
export function hashKey(raw: string): string {
  const salt = process.env.RATE_LIMIT_SALT || "dev-only-salt";
  return createHash("sha256").update(`${salt}:${raw}`).digest("hex").slice(0, 40);
}

/** Pure helper (unit-testable): decide the next bucket state. */
export function nextBucket(
  current: { count: number; windowStart: number } | null,
  now: number,
  rule: Pick<LimitRule, "max" | "windowMs">,
): { allowed: boolean; count: number; windowStart: number } {
  if (!current || now - current.windowStart >= rule.windowMs) return { allowed: true, count: 1, windowStart: now };
  if (current.count >= rule.max) return { allowed: false, count: current.count, windowStart: current.windowStart };
  return { allowed: true, count: current.count + 1, windowStart: current.windowStart };
}

const memory = new Map<string, { count: number; windowStart: number }>();

/** Returns true when every rule allows the request (fixed-window counters in Firestore, TTL via expireAt). */
export async function checkRateLimits(rules: LimitRule[], now = Date.now()): Promise<boolean> {
  for (const rule of rules) {
    const id = hashKey(rule.key);
    if (!isAdminConfigured()) {
      const r = nextBucket(memory.get(id) ?? null, now, rule);
      memory.set(id, { count: r.count, windowStart: r.windowStart });
      if (!r.allowed) return false;
      continue;
    }
    const ref = adminDb().collection("rateLimits").doc(id);
    const allowed = await adminDb().runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const data = snap.exists ? (snap.data() as { count: number; windowStart: number }) : null;
      const r = nextBucket(data, now, rule);
      tx.set(ref, {
        count: r.count,
        windowStart: r.windowStart,
        expireAt: Timestamp.fromMillis(r.windowStart + rule.windowMs),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return r.allowed;
    });
    if (!allowed) return false;
  }
  return true;
}

const num = (v: string | undefined, d: number) => (v && Number.isFinite(Number(v)) ? Number(v) : d);
export const limits = {
  perIpPerHour: num(process.env.RATE_LIMIT_IP_PER_HOUR, 5),
  perPhonePerDay: num(process.env.RATE_LIMIT_PHONE_PER_DAY, 3),
};
