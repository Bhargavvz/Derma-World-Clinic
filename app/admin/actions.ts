"use server";

import { randomUUID } from "node:crypto";
import { revalidateTag } from "next/cache";
import { FieldValue, Timestamp, type DocumentData } from "firebase-admin/firestore";
import { z } from "zod";
import { adminAuth, adminDb, adminStorage } from "@/lib/firebase/admin";
import { AuthError, requireStaff, type StaffUser } from "@/lib/auth/session";
import { tags } from "@/lib/content/loaders";
import {
  appointmentStatuses,
  clinicSettingsSchema,
  doctorSchema,
  faqSchema,
  galleryItemSchema,
  procedureSchema,
  staffRoles,
  treatmentSchema,
  type Appointment,
  type AppointmentStatus,
  type ContactMessage,
  type StaffRole,
} from "@/lib/content/types";
import { checkWordingDeep } from "@/lib/wordingGuard";
import { sendEmail } from "@/lib/email/send";
import { patientStatusEmail } from "@/lib/email/templates";
import { getClinic } from "@/lib/content/loaders";

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: "unauthenticated" | "forbidden" | "invalid" | "not_found" | "failed"; issues?: string[] }
  | { ok: false; error: "wording"; hits: string[]; canOverride: boolean };

function fail(err: unknown): { ok: false; error: "unauthenticated" | "forbidden" | "failed" } {
  if (err instanceof AuthError) return { ok: false, error: err.code };
  console.error("[admin action] failed:", (err as Error).name, (err as Error).message?.slice(0, 120));
  return { ok: false, error: "failed" };
}

const iso = (v: unknown): string => (v instanceof Timestamp ? v.toDate().toISOString() : typeof v === "string" ? v : "");

async function audit(user: StaffUser, action: string, target: string, summary: string) {
  await adminDb()
    .collection("auditLog")
    .add({ actorUid: user.uid, actorEmail: user.email, action, target, summary: summary.slice(0, 300), at: FieldValue.serverTimestamp() });
}

/* ───────────── Appointments ───────────── */

function toAppointment(id: string, d: DocumentData): Appointment {
  return {
    id,
    name: d.name ?? "",
    phone: d.phone ?? "",
    email: d.email ?? null,
    treatmentSlug: d.treatmentSlug ?? "",
    treatmentName: d.treatmentName ?? d.treatment ?? "",
    preferredDate: d.preferredDate ?? "",
    preferredTime: d.preferredTime ?? "Morning",
    notes: d.notes ?? null,
    locale: d.locale ?? "en",
    status: appointmentStatuses.includes(d.status) ? d.status : "pending",
    source: "web",
    createdAt: iso(d.createdAt),
    updatedAt: iso(d.updatedAt),
    statusHistory: Array.isArray(d.statusHistory) ? d.statusHistory : [],
    notifications: d.notifications ?? { clinicEmail: "skipped", patientEmail: "skipped" },
  };
}

export async function listAppointments(): Promise<ActionResult<Appointment[]>> {
  try {
    await requireStaff();
    const snap = await adminDb().collection("appointments").orderBy("createdAt", "desc").limit(2000).get();
    return { ok: true, data: snap.docs.map((d) => toAppointment(d.id, d.data())) };
  } catch (e) {
    return fail(e);
  }
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<ActionResult> {
  try {
    const user = await requireStaff();
    if (!z.string().min(1).max(128).safeParse(id).success || !appointmentStatuses.includes(status)) return { ok: false, error: "invalid" };
    const ref = adminDb().collection("appointments").doc(id);
    let before: Appointment | null = null;
    await adminDb().runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error("not_found");
      before = toAppointment(id, snap.data()!);
      tx.update(ref, {
        status,
        updatedAt: FieldValue.serverTimestamp(),
        statusHistory: FieldValue.arrayUnion({ status, by: user.email, at: new Date().toISOString() }),
      });
    });
    const prev = before as Appointment | null;
    await audit(user, "appointment.status", `appointments/${id}`, `${prev?.status ?? "?"} → ${status}`);

    // Optional patient email on confirmed/cancelled (owner toggle in settings).
    if (prev?.email && (status === "confirmed" || status === "cancelled") && prev.status !== status) {
      const settings = (await adminDb().doc("settings/notifications").get()).data() ?? {};
      if (settings.patientStatusEmails === true) {
        const c = await getClinic();
        const result = await sendEmail(
          [prev.email],
          patientStatusEmail(prev, status, {
            name: c.name,
            phones: c.phones.map((p) => p.display),
            address: c.address.lines.join(", "),
            hours: [],
          }),
        );
        await ref.update({ [`notifications.status_${status}`]: result });
      }
    }
    return { ok: true };
  } catch (e) {
    if ((e as Error).message === "not_found") return { ok: false, error: "not_found" };
    return fail(e);
  }
}

export async function deleteAppointment(id: string): Promise<ActionResult> {
  try {
    const user = await requireStaff("owner");
    if (!z.string().min(1).max(128).safeParse(id).success) return { ok: false, error: "invalid" };
    await adminDb().collection("appointments").doc(id).delete();
    await audit(user, "appointment.delete", `appointments/${id}`, "deleted");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/* ───────────── Contact messages ───────────── */

export async function listMessages(): Promise<ActionResult<ContactMessage[]>> {
  try {
    await requireStaff();
    const snap = await adminDb().collection("contactMessages").orderBy("createdAt", "desc").limit(1000).get();
    return {
      ok: true,
      data: snap.docs.map((d) => {
        const x = d.data();
        return {
          id: d.id,
          name: x.name ?? "",
          phone: x.phone ?? null,
          email: x.email ?? null,
          message: x.message ?? "",
          locale: x.locale ?? "en",
          status: x.status ?? "new",
          createdAt: iso(x.createdAt),
          notifications: x.notifications,
        };
      }),
    };
  } catch (e) {
    return fail(e);
  }
}

export async function updateMessageStatus(id: string, status: ContactMessage["status"]): Promise<ActionResult> {
  try {
    const user = await requireStaff();
    if (!["new", "replied", "archived"].includes(status)) return { ok: false, error: "invalid" };
    await adminDb().collection("contactMessages").doc(id).update({ status, updatedAt: FieldValue.serverTimestamp() });
    await audit(user, "message.status", `contactMessages/${id}`, status);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/* ───────────── Content ───────────── */

const contentKinds = {
  clinic: { schema: clinicSettingsSchema, owner: true, path: () => "settings/clinic", tag: () => [tags.clinic] },
  doctor: { schema: doctorSchema, owner: false, path: (id: string) => `doctors/${id}`, tag: () => [tags.doctors] },
  treatment: { schema: treatmentSchema, owner: false, path: (id: string) => `treatments/${id}`, tag: (id: string) => [tags.treatments, tags.treatment(id)] },
  procedure: { schema: procedureSchema, owner: false, path: (id: string) => `procedures/${id}`, tag: () => [tags.procedures] },
  gallery: { schema: galleryItemSchema, owner: false, path: (id: string) => `gallery/${id}`, tag: () => [tags.gallery] },
  faq: { schema: faqSchema, owner: false, path: (id: string) => `faqs/${id}`, tag: () => [tags.faqs] },
} as const;
export type ContentKind = keyof typeof contentKinds;

const idSchema = z.string().regex(/^[a-z0-9-]{1,80}$/);

/** Validate (Zod) → wording guard → write → audit → revalidateTag. */
export async function saveContent(kind: ContentKind, id: string, data: unknown, overrideWording = false): Promise<ActionResult> {
  try {
    const cfg = contentKinds[kind];
    if (!cfg) return { ok: false, error: "invalid" };
    const user = await requireStaff(cfg.owner ? "owner" : undefined);
    if (kind !== "clinic" && !idSchema.safeParse(id).success) return { ok: false, error: "invalid", issues: ["id"] };
    const parsed = (cfg.schema as z.ZodTypeAny).safeParse(data);
    if (!parsed.success) {
      return { ok: false, error: "invalid", issues: parsed.error.issues.slice(0, 10).map((i) => `${i.path.join(".")}: ${i.message}`) };
    }
    const hits = checkWordingDeep(parsed.data);
    if (hits.length && !(overrideWording && user.role === "owner")) return { ok: false, error: "wording", hits, canOverride: user.role === "owner" };
    if (kind === "treatment" && (parsed.data as { slug: string }).slug !== id) return { ok: false, error: "invalid", issues: ["slug must match id"] };

    const value = { ...(parsed.data as Record<string, unknown>) };
    delete value.id;
    await adminDb()
      .doc(cfg.path(id))
      .set({ ...value, updatedAt: FieldValue.serverTimestamp(), updatedBy: user.email });
    await audit(user, `content.save.${kind}`, cfg.path(id), hits.length ? `saved (wording override: ${hits.join(", ")})` : "saved");
    for (const tag of (cfg.tag as (id: string) => string[])(id)) revalidateTag(tag);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteContent(kind: "procedure" | "gallery" | "faq", id: string): Promise<ActionResult> {
  try {
    const user = await requireStaff();
    if (!idSchema.safeParse(id).success) return { ok: false, error: "invalid" };
    const cfg = contentKinds[kind];
    await adminDb().doc(cfg.path(id)).delete();
    await audit(user, `content.delete.${kind}`, cfg.path(id), "deleted");
    for (const tag of (cfg.tag as (id: string) => string[])(id)) revalidateTag(tag);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

const IMAGE_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX_UPLOAD = 8 * 1024 * 1024;

/** Upload an image to Storage (JPEG/PNG/WebP ≤ 8 MB). Returns its public URL. */
export async function uploadImage(form: FormData): Promise<ActionResult<{ url: string }>> {
  try {
    const user = await requireStaff();
    const file = form.get("file");
    const folder = String(form.get("folder") ?? "");
    if (!(file instanceof File) || !["gallery", "treatments", "doctors", "brand"].includes(folder)) return { ok: false, error: "invalid" };
    const ext = IMAGE_TYPES[file.type];
    if (!ext || file.size > MAX_UPLOAD || file.size === 0) return { ok: false, error: "invalid", issues: ["JPEG, PNG or WebP up to 8 MB"] };
    const buf = Buffer.from(await file.arrayBuffer());
    // Magic-byte check (don't trust the declared type alone).
    const sig = buf.subarray(0, 12);
    const isJpeg = sig[0] === 0xff && sig[1] === 0xd8;
    const isPng = sig[0] === 0x89 && sig[1] === 0x50 && sig[2] === 0x4e && sig[3] === 0x47;
    const isWebp = sig.subarray(0, 4).toString() === "RIFF" && sig.subarray(8, 12).toString() === "WEBP";
    if (!({ jpg: isJpeg, png: isPng, webp: isWebp } as Record<string, boolean>)[ext]) return { ok: false, error: "invalid", issues: ["file content does not match type"] };

    const bucket = adminStorage().bucket();
    const path = `images/${folder}/${randomUUID()}.${ext}`;
    await bucket.file(path).save(buf, { contentType: file.type, metadata: { cacheControl: "public, max-age=31536000, immutable" } });
    await audit(user, "image.upload", path, `${file.type} ${Math.round(file.size / 1024)} KB`);
    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media`;
    return { ok: true, data: { url } };
  } catch (e) {
    return fail(e);
  }
}

/* ───────────── Staff (owner) ───────────── */

export interface StaffRow {
  uid: string;
  email: string;
  displayName: string | null;
  role: StaffRole;
  providers: string[];
  lastLoginAt: string;
}
export interface InviteRow {
  email: string;
  role: StaffRole;
  expiresAt: string;
}

export async function listStaff(): Promise<ActionResult<{ staff: StaffRow[]; invites: InviteRow[] }>> {
  try {
    await requireStaff("owner");
    const [s, i] = await Promise.all([adminDb().collection("staff").get(), adminDb().collection("staffInvites").get()]);
    return {
      ok: true,
      data: {
        staff: s.docs.map((d) => ({
          uid: d.id,
          email: d.get("email"),
          displayName: d.get("displayName") ?? null,
          role: d.get("role"),
          providers: d.get("providers") ?? [],
          lastLoginAt: iso(d.get("lastLoginAt")),
        })),
        invites: i.docs.map((d) => ({ email: d.id, role: d.get("role"), expiresAt: iso(d.get("expiresAt")) })),
      },
    };
  } catch (e) {
    return fail(e);
  }
}

export async function inviteStaff(emailRaw: string, role: StaffRole): Promise<ActionResult<{ setupLink: string | null }>> {
  try {
    const user = await requireStaff("owner");
    const email = emailRaw.trim().toLowerCase();
    if (!z.string().email().max(254).safeParse(email).success || !staffRoles.includes(role)) return { ok: false, error: "invalid" };
    await adminDb()
      .collection("staffInvites")
      .doc(email)
      .set({ role, invitedBy: user.email, createdAt: FieldValue.serverTimestamp(), expiresAt: Timestamp.fromMillis(Date.now() + 7 * 24 * 3600 * 1000) });
    // Email/password option: create the account (if missing) and produce a set-password link for the owner to share.
    let setupLink: string | null = null;
    try {
      await adminAuth()
        .getUserByEmail(email)
        .catch(() => adminAuth().createUser({ email, emailVerified: false }));
      setupLink = await adminAuth().generatePasswordResetLink(email);
    } catch {
      setupLink = null;
    }
    await audit(user, "staff.invite", `staffInvites/${email}`, `role=${role}`);
    return { ok: true, data: { setupLink } };
  } catch (e) {
    return fail(e);
  }
}

export async function cancelInvite(email: string): Promise<ActionResult> {
  try {
    const user = await requireStaff("owner");
    await adminDb().collection("staffInvites").doc(email.toLowerCase()).delete();
    await audit(user, "staff.invite_cancel", `staffInvites/${email}`, "cancelled");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function changeStaffRole(uid: string, role: StaffRole): Promise<ActionResult> {
  try {
    const user = await requireStaff("owner");
    if (!staffRoles.includes(role)) return { ok: false, error: "invalid" };
    if (uid === user.uid) return { ok: false, error: "invalid", issues: ["You can't change your own role."] };
    await adminAuth().setCustomUserClaims(uid, { role });
    await adminAuth().revokeRefreshTokens(uid); // pick up the new role on next sign-in
    await adminDb().collection("staff").doc(uid).update({ role });
    await audit(user, "staff.role", `staff/${uid}`, `role=${role}`);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function revokeStaff(uid: string): Promise<ActionResult> {
  try {
    const user = await requireStaff("owner");
    if (uid === user.uid) return { ok: false, error: "invalid", issues: ["You can't revoke yourself."] };
    await adminAuth().setCustomUserClaims(uid, null);
    await adminAuth().revokeRefreshTokens(uid);
    await adminDb().collection("staff").doc(uid).delete();
    await audit(user, "staff.revoke", `staff/${uid}`, "access revoked");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/* ───────────── Audit + settings (owner) ───────────── */

export interface AuditRow {
  id: string;
  actorEmail: string;
  action: string;
  target: string;
  summary: string;
  at: string;
}

export async function listAudit(): Promise<ActionResult<AuditRow[]>> {
  try {
    await requireStaff("owner");
    const snap = await adminDb().collection("auditLog").orderBy("at", "desc").limit(500).get();
    return {
      ok: true,
      data: snap.docs.map((d) => ({
        id: d.id,
        actorEmail: d.get("actorEmail") ?? "",
        action: d.get("action") ?? "",
        target: d.get("target") ?? "",
        summary: d.get("summary") ?? "",
        at: iso(d.get("at")),
      })),
    };
  } catch (e) {
    return fail(e);
  }
}

const notifSettingsSchema = z.object({
  patientStatusEmails: z.boolean(),
  retentionEnabled: z.boolean(),
  retentionMonths: z.number().int().min(1).max(120),
});
export type NotificationSettings = z.infer<typeof notifSettingsSchema>;

export async function saveNotificationSettings(data: NotificationSettings): Promise<ActionResult> {
  try {
    const user = await requireStaff("owner");
    const parsed = notifSettingsSchema.safeParse(data);
    if (!parsed.success) return { ok: false, error: "invalid" };
    await adminDb()
      .doc("settings/notifications")
      .set({ ...parsed.data, updatedAt: FieldValue.serverTimestamp(), updatedBy: user.email });
    await audit(user, "settings.notifications", "settings/notifications", JSON.stringify(parsed.data));
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
