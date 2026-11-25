/**
 * Grant (or revoke) an admin role. Used to create the first owner.
 *   pnpm grant-role <email> owner|staff [--revoke] [--emulator]
 * Needs FIREBASE_SERVICE_ACCOUNT_JSON (base64; key kept outside the repo) unless --emulator.
 * The person must already have signed in once (or have an account) so the user exists.
 */
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

async function main() {
  const [email, role] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const revoke = process.argv.includes("--revoke");
  if (!email || (!revoke && role !== "owner" && role !== "staff")) {
    console.error("Usage: pnpm grant-role <email> owner|staff [--revoke] [--emulator]");
    process.exit(1);
  }
  if (process.argv.includes("--emulator")) {
    process.env.FIREBASE_AUTH_EMULATOR_HOST ||= "127.0.0.1:9099";
    process.env.FIRESTORE_EMULATOR_HOST ||= "127.0.0.1:8080";
    initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-derma-world" });
  } else {
    const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!b64) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is required");
    initializeApp({ credential: cert(JSON.parse(Buffer.from(b64, "base64").toString("utf8"))) });
  }
  const auth = getAuth();
  const db = getFirestore(process.env.FIRESTORE_DATABASE_ID || "(default)");
  const user = await auth.getUserByEmail(email.toLowerCase());
  if (revoke) {
    await auth.setCustomUserClaims(user.uid, null);
    await auth.revokeRefreshTokens(user.uid);
    await db.doc(`staff/${user.uid}`).delete();
    console.log(`Revoked admin access for ${email}.`);
    return;
  }
  await auth.setCustomUserClaims(user.uid, { role });
  await db.doc(`staff/${user.uid}`).set(
    { email: user.email, displayName: user.displayName ?? null, role, providers: user.providerData.map((p) => p.providerId), invitedBy: "grant-role script", createdAt: FieldValue.serverTimestamp() },
    { merge: true },
  );
  await db.collection("auditLog").add({ actorUid: "script", actorEmail: "grant-role", action: "staff.grant", target: `staff/${user.uid}`, summary: `role=${role}`, at: FieldValue.serverTimestamp() });
  console.log(`Granted role "${role}" to ${email}. They must sign in again to pick it up.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
