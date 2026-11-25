"use server";

import { FieldValue } from "firebase-admin/firestore";
import { SITE_URL } from "@/lib/env";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { getClinic, getTreatments, GENERAL_INQUIRY } from "@/lib/content/loaders";
import { appointmentSchema, fieldErrors, GENERAL_VALUE } from "@/lib/validation/appointment";
import { contactSchema } from "@/lib/validation/contact";
import { digitsOnly } from "@/lib/validation/sanitize";
import { verifyAppCheck } from "@/lib/security/appCheck";
import { checkRateLimits, limits } from "@/lib/security/rateLimit";
import { clientIp } from "@/lib/security/request";
import { clinicRecipients, sendEmail } from "@/lib/email/send";
import { clinicAppointmentEmail, clinicContactEmail, patientAppointmentEmail, type ClinicInfo } from "@/lib/email/templates";
import type { NotifyState } from "@/lib/content/types";

export type SubmitResult =
  | { status: "saved" }
  | { status: "rejected"; errors: Record<string, string> }
  | { status: "rate_limited" }
  | { status: "not_configured" }
  | { status: "failed" };

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const LOCALES = new Set(["en", "te", "hi"]);

async function clinicInfo(): Promise<ClinicInfo> {
  const c = await getClinic();
  return {
    name: c.name,
    phones: c.phones.map((p) => p.display),
    address: c.address.lines.join(", "),
    hours: c.openingHours.map((h) => `${h.days.en}: ${h.display.en}${h.note ? ` (${h.note.en})` : ""}`),
  };
}

export async function submitAppointment(raw: Record<string, unknown>, appCheckToken: string | null, locale: string): Promise<SubmitResult> {
  try {
    if (!(await verifyAppCheck(appCheckToken))) return { status: "rejected", errors: { form: "honeypot" } };
    if (typeof raw.website === "string" && raw.website.length > 0) return { status: "rejected", errors: { form: "honeypot" } };

    const treatments = (await getTreatments()).filter((t) => t.bookable);
    const allowed = [...treatments.map((t) => t.slug), GENERAL_VALUE];
    const parsed = appointmentSchema(allowed).safeParse(raw);
    if (!parsed.success) return { status: "rejected", errors: fieldErrors(parsed.error) };
    const d = parsed.data;

    const ip = await clientIp();
    const ok = await checkRateLimits([
      { key: `booking-ip:${ip}`, max: limits.perIpPerHour, windowMs: HOUR },
      { key: `booking-phone:${digitsOnly(d.phone)}`, max: limits.perPhonePerDay, windowMs: DAY },
    ]);
    if (!ok) return { status: "rate_limited" };

    if (!isAdminConfigured()) return { status: "not_configured" };

    const treatmentName = d.treatment === GENERAL_VALUE ? GENERAL_INQUIRY : treatments.find((t) => t.slug === d.treatment)!.name.en;
    const loc = LOCALES.has(locale) ? locale : "en";
    const ref = adminDb().collection("appointments").doc();
    const now = new Date().toISOString();
    const doc = {
      name: d.name,
      phone: d.phone,
      email: d.email || null,
      treatmentSlug: d.treatment,
      treatmentName,
      preferredDate: d.preferredDate,
      preferredTime: d.preferredTime,
      notes: d.notes || null,
      locale: loc,
      status: "pending" as const,
      source: "web" as const,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      statusHistory: [{ status: "pending", by: "web", at: now }],
      notifications: { clinicEmail: "skipped" as NotifyState, patientEmail: "skipped" as NotifyState },
    };
    await ref.set(doc);

    // Emails: failures are recorded, never shown as success, and never block the booking.
    const emailData = { id: ref.id, ...doc, email: doc.email, notes: doc.notes };
    const info = await clinicInfo();
    const [clinicEmail, patientEmail] = await Promise.all([
      sendEmail(clinicRecipients(), clinicAppointmentEmail(emailData, `${SITE_URL}/admin/appointments?id=${ref.id}`), doc.email),
      doc.email ? sendEmail([doc.email], patientAppointmentEmail(emailData, info)) : Promise.resolve<NotifyState>("skipped"),
    ]);
    await ref.update({ notifications: { clinicEmail, patientEmail } });
    return { status: "saved" };
  } catch (err) {
    console.error("[submitAppointment] failed:", (err as Error).name);
    return { status: "failed" };
  }
}

export async function submitContactMessage(raw: Record<string, unknown>, appCheckToken: string | null, locale: string): Promise<SubmitResult> {
  try {
    if (!(await verifyAppCheck(appCheckToken))) return { status: "rejected", errors: { form: "honeypot" } };
    if (typeof raw.website === "string" && raw.website.length > 0) return { status: "rejected", errors: { form: "honeypot" } };
    const parsed = contactSchema.safeParse(raw);
    if (!parsed.success) return { status: "rejected", errors: fieldErrors(parsed.error) };
    const d = parsed.data;

    const ip = await clientIp();
    const ok = await checkRateLimits([{ key: `contact-ip:${ip}`, max: limits.perIpPerHour, windowMs: HOUR }]);
    if (!ok) return { status: "rate_limited" };
    if (!isAdminConfigured()) return { status: "not_configured" };

    const ref = adminDb().collection("contactMessages").doc();
    const doc = {
      name: d.name,
      phone: d.phone || null,
      email: d.email || null,
      message: d.message,
      locale: LOCALES.has(locale) ? locale : "en",
      status: "new" as const,
      createdAt: FieldValue.serverTimestamp(),
    };
    await ref.set(doc);
    const clinicEmail = await sendEmail(clinicRecipients(), clinicContactEmail({ id: ref.id, ...doc }, `${SITE_URL}/admin/messages`), doc.email);
    await ref.update({ notifications: { clinicEmail } });
    return { status: "saved" };
  } catch (err) {
    console.error("[submitContactMessage] failed:", (err as Error).name);
    return { status: "failed" };
  }
}
