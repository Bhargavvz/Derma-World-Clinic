import type { MetadataRoute } from "next";
import { htmlLang, locales, type Locale } from "@/i18n/routing";
import { getClinic, getDoctor, getGallery, getHomeFaqs, getProcedures, getTreatments, getUpdatedAtMap } from "@/lib/content/loaders";
import { isReviewed } from "@/lib/i18n/localize";
import { absolute, localePath } from "@/lib/seo/metadata";
import type { ReviewStatus } from "@/lib/content/types";

export const revalidate = 3600;

/**
 * All public pages × indexable (reviewed) locales, with hreflang alternates,
 * lastModified from the newest Firestore `updatedAt` behind each page, and
 * the page's main images (image sitemap extension).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [clinic, doctor, treatments, procedures, gallery, faqs, updated] = await Promise.all([
    getClinic(),
    getDoctor(),
    getTreatments(),
    getProcedures(),
    getGallery(),
    getHomeFaqs(),
    getUpdatedAtMap(),
  ]);
  const allTreatments = treatments.map((t) => t.reviewStatus);
  const latest = (...keys: string[]): Date | undefined => {
    const v = keys.map((k) => updated[k]).filter(Boolean).sort().pop();
    return v ? new Date(v) : undefined;
  };
  const img = (p: string) => absolute(p);
  const C = "settings/clinic";
  const tKeys = treatments.map((t) => `treatments/${t.slug}`);
  const pKeys = procedures.map((p) => `procedures/${p.id}`);
  const gKeys = gallery.map((g) => `gallery/${g.id}`);
  const dKey = `doctors/${doctor.id}`;

  const pages: { path: string; reviews: ReviewStatus[]; priority: number; modified?: Date; images?: string[] }[] = [
    {
      path: "/",
      reviews: [clinic.reviewStatus, doctor.reviewStatus, ...faqs.map((f) => f.reviewStatus), ...allTreatments],
      priority: 1,
      modified: latest(C, dKey, ...tKeys, ...faqs.map((f) => `faqs/${f.id}`)),
      images: ["/images/brand/logo-hero-1100.webp", "/images/clinic/hero-reception-900.webp"].map(img),
    },
    {
      path: "/about",
      reviews: [clinic.reviewStatus, ...procedures.map((p) => p.reviewStatus), ...gallery.map((g) => g.reviewStatus)],
      priority: 0.8,
      modified: latest(C, ...pKeys, ...gKeys),
    },
    { path: "/doctor", reviews: [doctor.reviewStatus], priority: 0.8, modified: latest(dKey), images: [img(doctor.photo.path)] },
    {
      path: "/treatments",
      reviews: [...allTreatments, ...procedures.map((p) => p.reviewStatus)],
      priority: 0.9,
      modified: latest(...tKeys, ...pKeys),
      images: treatments.map((t) => img(t.image.path)),
    },
    ...treatments.map((t) => ({
      path: `/treatments/${t.slug}`,
      reviews: [t.reviewStatus],
      priority: 0.8,
      modified: latest(`treatments/${t.slug}`),
      images: [img(t.image.path)],
    })),
    { path: "/gallery", reviews: gallery.map((g) => g.reviewStatus), priority: 0.6, modified: latest(...gKeys), images: gallery.map((g) => img(g.image.path)) },
    { path: "/contact", reviews: [clinic.reviewStatus], priority: 0.8, modified: latest(C) },
    { path: "/appointment", reviews: [clinic.reviewStatus, ...allTreatments], priority: 0.9, modified: latest(C, ...tKeys) },
    { path: "/privacy", reviews: [{ te: "missing", hi: "missing" }], priority: 0.3 },
  ];

  const out: MetadataRoute.Sitemap = [];
  for (const p of pages) {
    const ok = locales.filter((l: Locale) => isReviewed(l, ...p.reviews));
    const languages = Object.fromEntries(ok.map((l) => [htmlLang[l], absolute(localePath(l, p.path))]));
    for (const l of ok) {
      out.push({
        url: absolute(localePath(l, p.path)),
        ...(p.modified ? { lastModified: p.modified } : {}),
        changeFrequency: "monthly",
        priority: p.priority,
        alternates: { languages: { ...languages, "x-default": absolute(p.path) } },
        ...(p.images?.length ? { images: p.images } : {}),
      });
    }
  }
  return out;
}
