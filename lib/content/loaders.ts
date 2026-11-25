import "server-only";
import { unstable_cache } from "next/cache";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import {
  clinicSettingsSchema,
  doctorSchema,
  faqSchema,
  galleryItemSchema,
  procedureSchema,
  treatmentSchema,
  type ClinicSettings,
  type Doctor,
  type Faq,
  type GalleryItem,
  type Procedure,
  type Treatment,
} from "./types";
import { seedClinic, seedDoctor, seedFaqs, seedGallery, seedProcedures, seedTreatments } from "./seed";

export const tags = {
  clinic: "settings:clinic",
  doctors: "doctors",
  treatments: "treatments",
  treatment: (slug: string) => `treatment:${slug}`,
  procedures: "procedures",
  gallery: "gallery",
  faqs: "faqs",
} as const;

async function readCollection<T>(name: string, schema: { safeParse: (v: unknown) => { success: boolean; data?: T } }, fallback: T[]): Promise<T[]> {
  if (!isAdminConfigured()) return fallback;
  try {
    const snap = await adminDb().collection(name).get();
    if (snap.empty) return fallback;
    const out: T[] = [];
    for (const d of snap.docs) {
      const parsed = schema.safeParse({ id: d.id, ...d.data() });
      if (parsed.success) out.push(parsed.data as T);
      else console.warn(`[content] invalid ${name}/${d.id} skipped`);
    }
    return out;
  } catch (err) {
    console.error(`[content] reading ${name} failed:`, (err as Error).message);
    return fallback;
  }
}

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;

export const getClinic = unstable_cache(
  async (): Promise<ClinicSettings> => {
    if (!isAdminConfigured()) return seedClinic;
    try {
      const snap = await adminDb().doc("settings/clinic").get();
      const parsed = clinicSettingsSchema.safeParse(snap.data());
      return parsed.success ? parsed.data : seedClinic;
    } catch {
      return seedClinic;
    }
  },
  ["clinic"],
  { tags: [tags.clinic] },
);

export const getDoctor = unstable_cache(
  async (): Promise<Doctor> => {
    const all = await readCollection<Doctor>("doctors", doctorSchema, [seedDoctor]);
    return all.filter((d) => d.published).sort(byOrder)[0] ?? seedDoctor;
  },
  ["doctor"],
  { tags: [tags.doctors] },
);

export const getTreatments = unstable_cache(
  async (): Promise<Treatment[]> => {
    const all = await readCollection<Treatment>("treatments", treatmentSchema, seedTreatments);
    return all.filter((t) => t.published).sort(byOrder);
  },
  ["treatments"],
  { tags: [tags.treatments] },
);

export async function getTreatment(slug: string): Promise<Treatment | null> {
  const all = await getTreatments();
  return all.find((t) => t.slug === slug) ?? null;
}

export const getProcedures = unstable_cache(
  async (): Promise<Procedure[]> => (await readCollection<Procedure>("procedures", procedureSchema, seedProcedures)).sort(byOrder),
  ["procedures"],
  { tags: [tags.procedures] },
);

export const getGallery = unstable_cache(
  async (): Promise<GalleryItem[]> =>
    (await readCollection<GalleryItem>("gallery", galleryItemSchema, seedGallery)).filter((g) => g.published).sort(byOrder),
  ["gallery"],
  { tags: [tags.gallery] },
);

export const getHomeFaqs = unstable_cache(
  async (): Promise<Faq[]> => (await readCollection<Faq>("faqs", faqSchema, seedFaqs)).filter((f) => f.page === "home").sort(byOrder),
  ["faqs"],
  { tags: [tags.faqs] },
);

export const GENERAL_INQUIRY = "General Inquiry";
export const LEGACY_TREATMENT_NAMES = ["Skin Care", "Hair Care"];

/** Last-updated ISO dates for the sitemap, keyed "collection/id" (plus "settings/clinic"). */
export const getUpdatedAtMap = unstable_cache(
  async (): Promise<Record<string, string>> => {
    if (!isAdminConfigured()) return {};
    const out: Record<string, string> = {};
    const iso = (v: unknown) => (v && typeof (v as { toDate?: () => Date }).toDate === "function" ? (v as { toDate: () => Date }).toDate().toISOString() : undefined);
    try {
      const db = adminDb();
      const [clinic, ...cols] = await Promise.all([
        db.doc("settings/clinic").get(),
        ...["doctors", "treatments", "procedures", "gallery", "faqs"].map((c) => db.collection(c).select("updatedAt").get()),
      ]);
      const c = iso(clinic.get("updatedAt"));
      if (c) out["settings/clinic"] = c;
      for (const snap of cols) for (const d of snap.docs) {
        const v = iso(d.get("updatedAt"));
        if (v) out[`${d.ref.parent.id}/${d.id}`] = v;
      }
    } catch (err) {
      console.error("[content] reading updatedAt failed:", (err as Error).message);
    }
    return out;
  },
  ["updatedAtMap"],
  { tags: [tags.clinic, tags.doctors, tags.treatments, tags.procedures, tags.gallery, tags.faqs], revalidate: 3600 },
);
