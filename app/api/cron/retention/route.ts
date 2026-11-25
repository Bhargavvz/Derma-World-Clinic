import { NextResponse, type NextRequest } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { timingSafeEqual } from "node:crypto";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  const got = req.headers.get("authorization") ?? "";
  const want = `Bearer ${secret}`;
  return !!secret && got.length === want.length && timingSafeEqual(Buffer.from(got), Buffer.from(want));
}

/** Daily Vercel Cron: delete appointments/messages older than N months — only when the owner turned retention on. */
export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ status: "unauthorized" }, { status: 401 });
  if (!isAdminConfigured()) return NextResponse.json({ status: "not_configured" });
  const db = adminDb();
  const s = (await db.doc("settings/notifications").get()).data();
  if (!s?.retentionEnabled) return NextResponse.json({ status: "disabled" });
  const months = Math.max(1, Math.min(120, Number(s.retentionMonths) || 12));
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  const ts = Timestamp.fromDate(cutoff);

  let deleted = 0;
  for (const col of ["appointments", "contactMessages"]) {
    for (;;) {
      const snap = await db.collection(col).where("createdAt", "<", ts).limit(400).get();
      if (snap.empty) break;
      const batch = db.batch();
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      deleted += snap.size;
    }
  }
  await db.collection("auditLog").add({
    actorUid: "system",
    actorEmail: "retention-cron",
    action: "retention.delete",
    target: "appointments,contactMessages",
    summary: `deleted ${deleted} items older than ${months} months`,
    at: FieldValue.serverTimestamp(),
  });
  return NextResponse.json({ status: "ok", deleted });
}
