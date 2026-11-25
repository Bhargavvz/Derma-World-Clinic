/**
 * Emulator only: create the test owner and a handful of sample appointments
 * and messages so the admin screens can be reviewed. Refuses to run without
 * the emulator hosts set.
 *   pnpm exec tsx scripts/emulator-demo-data.ts
 */
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, Timestamp, getFirestore } from "firebase-admin/firestore";

process.env.FIREBASE_AUTH_EMULATOR_HOST ||= "127.0.0.1:9099";
process.env.FIRESTORE_EMULATOR_HOST ||= "127.0.0.1:8080";
const email = process.env.EMULATOR_OWNER_EMAIL;
const password = process.env.EMULATOR_OWNER_PASSWORD;
if (!email || !password) throw new Error("Set EMULATOR_OWNER_EMAIL and EMULATOR_OWNER_PASSWORD (see .env.emulator.local)");

initializeApp({ projectId: "demo-derma-world" });
const auth = getAuth();
const db = getFirestore();

const ist = (offsetDays: number) => {
  const d = new Date(Date.now() + 5.5 * 3600e3 + offsetDays * 86400e3);
  return d.toISOString().slice(0, 10);
};

(async () => {
  const user = await auth.getUserByEmail(email).catch(() => auth.createUser({ email, password, emailVerified: true }));
  await auth.setCustomUserClaims(user.uid, { role: "owner" });
  await db.doc(`staff/${user.uid}`).set({ email, displayName: null, role: "owner", providers: ["password"], invitedBy: "demo", createdAt: FieldValue.serverTimestamp() });

  const people = [
    ["Lakshmi Reddy", "Acne & Pimple Treatment", 0, "Morning", "pending"],
    ["Arjun Kumar", "Hair Fall & PRP Therapy", 0, "Evening", "confirmed"],
    ["Fatima Begum", "Pigmentation & Chemical Peels", 1, "Afternoon", "pending"],
    ["Ravi Teja", "Skin Allergies", 2, "Evening", "confirmed"],
    ["Sneha Varma", "Laser Treatments", 4, "Morning", "pending"],
    ["Mohammed Imran", "Fungal Infections", -3, "Evening", "completed"],
  ] as const;
  for (const [i, [name, treatment, day, time, status]] of people.entries()) {
    const created = Timestamp.fromMillis(Date.now() - (i + 1) * 3.7 * 3600e3);
    await db.doc(`appointments/demo-${i}`).set({
      name,
      phone: `+91 98${String(4000000 + i * 1371).padStart(8, "0")}`,
      email: i % 2 ? null : `${name.split(" ")[0]!.toLowerCase()}@example.com`,
      treatmentSlug: "demo",
      treatmentName: treatment,
      preferredDate: ist(day),
      preferredTime: time,
      notes: i === 0 ? "Breakouts on the cheeks for about two months." : null,
      locale: "en",
      status,
      source: "web",
      createdAt: created,
      updatedAt: created,
      statusHistory: [{ status: "pending", by: "web", at: created.toDate().toISOString() }],
      notifications: { clinicEmail: "skipped", patientEmail: "skipped" },
    });
  }
  const notes = [
    ["Priya S", "Do you see children for eczema? My son is 6.", "new"],
    ["Kiran", "Is parking available near the clinic?", "new"],
    ["Anitha", "Thank you, the appointment time works.", "replied"],
  ] as const;
  for (const [i, [name, message, status]] of notes.entries()) {
    await db.doc(`contactMessages/demo-${i}`).set({
      name,
      phone: "+91 90000 0000" + i,
      email: null,
      message,
      locale: "en",
      status,
      createdAt: Timestamp.fromMillis(Date.now() - (i + 1) * 5 * 3600e3),
    });
  }
  console.log("demo data ready");
  process.exit(0);
})();
