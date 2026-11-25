import { NextResponse, type NextRequest } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminAuth, adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { SESSION_COOKIE, SESSION_MAX_AGE_MS } from "@/lib/auth/constants";
import { getStaff } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  return !!origin && new URL(origin).host === req.headers.get("host");
}

const json = (body: Record<string, unknown>, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

/**
 * Exchange a fresh Firebase ID token for an httpOnly session cookie.
 * Responses: { status: "ok" } | { status: "refresh" } (claim just set — get a new ID token and retry)
 *            | { status: "no_access" } | { status: "unverified" } | { status: "error" }
 */
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ status: "error" }, 403);
  if (!isAdminConfigured()) return json({ status: "error", reason: "not_configured" }, 503);
  let idToken: unknown;
  try {
    ({ idToken } = (await req.json()) as { idToken?: unknown });
  } catch {
    return json({ status: "error" }, 400);
  }
  if (typeof idToken !== "string" || idToken.length > 5000) return json({ status: "error" }, 400);

  try {
    const auth = adminAuth();
    const db = adminDb();
    const decoded = await auth.verifyIdToken(idToken, true);
    const email = (decoded.email ?? "").toLowerCase();
    const provider = decoded.firebase?.sign_in_provider ?? "unknown";

    let role = decoded.role as string | undefined;
    if (role !== "owner" && role !== "staff") {
      if (!email || decoded.email_verified !== true) return json({ status: "unverified" }, 403);
      const inviteRef = db.collection("staffInvites").doc(email);
      const invite = await inviteRef.get();
      const data = invite.data() as { role?: string; invitedBy?: string; expiresAt?: Timestamp } | undefined;
      if (!invite.exists || !data || (data.role !== "owner" && data.role !== "staff") || !data.expiresAt || data.expiresAt.toMillis() < Date.now()) {
        return json({ status: "no_access" }, 403);
      }
      await auth.setCustomUserClaims(decoded.uid, { role: data.role });
      await db.collection("staff").doc(decoded.uid).set({
        email,
        displayName: decoded.name ?? null,
        role: data.role,
        providers: [provider],
        invitedBy: data.invitedBy ?? null,
        createdAt: FieldValue.serverTimestamp(),
        lastLoginAt: FieldValue.serverTimestamp(),
      });
      await inviteRef.delete();
      await db.collection("auditLog").add({ actorUid: decoded.uid, actorEmail: email, action: "staff.accept_invite", target: `staff/${decoded.uid}`, summary: `role=${data.role}`, at: FieldValue.serverTimestamp() });
      return json({ status: "refresh" });
    }

    // Sessions may only be created from a recent sign-in.
    if (Date.now() / 1000 - decoded.auth_time > 5 * 60) return json({ status: "error", reason: "stale" }, 401);
    const staffRef = db.collection("staff").doc(decoded.uid);
    if (!(await staffRef.get()).exists) return json({ status: "no_access" }, 403);
    await staffRef.set({ lastLoginAt: FieldValue.serverTimestamp(), providers: FieldValue.arrayUnion(provider) }, { merge: true });

    const cookie = await auth.createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_MS });
    const res = json({ status: "ok" });
    res.cookies.set(SESSION_COOKIE, cookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_MAX_AGE_MS / 1000,
    });
    return res;
  } catch (err) {
    console.error("[auth/session] failed:", (err as Error).name);
    return json({ status: "error" }, 401);
  }
}

/** Sign out everywhere: revoke refresh tokens and clear the cookie. */
export async function DELETE(req: NextRequest) {
  if (!sameOrigin(req)) return json({ status: "error" }, 403);
  const user = await getStaff();
  if (user) {
    try {
      await adminAuth().revokeRefreshTokens(user.uid);
    } catch {
      /* ignore */
    }
  }
  const res = json({ status: "ok" });
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
  return res;
}
