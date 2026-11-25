/**
 * Idempotent seed: writes clinic settings, doctor, treatments, procedures,
 * gallery and home FAQs from lib/content/seed.ts.
 *   pnpm seed              → emulator (USE_FIREBASE_EMULATORS=true, project demo-derma-world)
 *   pnpm seed --production → real project (asks for confirmation; needs FIREBASE_SERVICE_ACCOUNT_JSON)
 */
import { createInterface } from "node:readline/promises";
import { cert, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { seedClinic, seedDoctor, seedFaqs, seedGallery, seedProcedures, seedTreatments } from "../lib/content/seed";

async function main() {
  const production = process.argv.includes("--production");
  if (production) {
    const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!b64) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is required for --production");
    const json = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const answer = await rl.question(`Seed REAL project "${json.project_id}"? Existing documents with the same IDs are overwritten. Type the project id to continue: `);
    rl.close();
    if (answer.trim() !== json.project_id) return console.log("Cancelled.");
    initializeApp({ credential: cert(json) });
  } else {
    process.env.FIRESTORE_EMULATOR_HOST ||= "127.0.0.1:8080";
    initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-derma-world" });
  }
  const db = getFirestore(process.env.FIRESTORE_DATABASE_ID || "(default)");
  const meta = { updatedAt: FieldValue.serverTimestamp(), updatedBy: "seed" };
  const strip = <T extends { id?: string }>(o: T) => {
    const { id: _id, ...rest } = o;
    void _id;
    return rest;
  };

  const batch = db.batch();
  batch.set(db.doc("settings/clinic"), { ...seedClinic, ...meta });
  batch.set(db.doc(`doctors/${seedDoctor.id}`), { ...strip(seedDoctor), ...meta });
  for (const t of seedTreatments) batch.set(db.doc(`treatments/${t.slug}`), { ...t, ...meta });
  for (const p of seedProcedures) batch.set(db.doc(`procedures/${p.id}`), { ...strip(p), ...meta });
  for (const g of seedGallery) batch.set(db.doc(`gallery/${g.id}`), { ...strip(g), ...meta });
  for (const f of seedFaqs) batch.set(db.doc(`faqs/${f.id}`), { ...strip(f), ...meta });
  batch.set(db.doc("settings/notifications"), { patientStatusEmails: false, retentionEnabled: false, retentionMonths: 12, ...meta }, { merge: true });
  await batch.commit();
  console.log(
    `Seeded: clinic, 1 doctor, ${seedTreatments.length} treatments, ${seedProcedures.length} procedures, ${seedGallery.length} photos, ${seedFaqs.length} FAQs.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
