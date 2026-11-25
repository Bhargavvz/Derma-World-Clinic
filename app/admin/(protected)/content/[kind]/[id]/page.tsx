import { notFound } from "next/navigation";
import { requireStaffPage } from "@/lib/auth/session";
import { adminDb } from "@/lib/firebase/admin";
import { seedClinic, seedDoctor, seedFaqs, seedGallery, seedProcedures, seedTreatments } from "@/lib/content/seed";
import { ContentEditor } from "@/components/admin/ContentEditor";
import type { ContentKind } from "@/app/admin/actions";

export const metadata = { title: "Edit content" };

const rs = { te: "missing", hi: "missing" };
const blank: Record<Exclude<ContentKind, "clinic" | "doctor">, unknown> = {
  treatment: { ...seedTreatments[0], slug: "new-slug", name: { en: "" }, summary: { en: "" }, overview: [], concerns: [], consultation: [], faqs: [], published: false, order: 99, reviewStatus: rs },
  procedure: { name: { en: "" }, description: { en: "" }, order: 99, reviewStatus: rs },
  gallery: { image: { path: "", alt: { en: "" }, width: 900, height: 1600 }, caption: { en: "" }, order: 99, published: false, genuine: false, reviewStatus: rs },
  faq: { page: "home", question: { en: "" }, answer: { en: "" }, order: 99, reviewStatus: rs },
};

const collections: Record<ContentKind, string> = {
  clinic: "settings",
  doctor: "doctors",
  treatment: "treatments",
  procedure: "procedures",
  gallery: "gallery",
  faq: "faqs",
};

function seedFor(kind: ContentKind, id: string): unknown {
  switch (kind) {
    case "clinic":
      return seedClinic;
    case "doctor":
      return seedDoctor;
    case "treatment":
      return seedTreatments.find((t) => t.slug === id);
    case "procedure":
      return seedProcedures.find((p) => p.id === id);
    case "gallery":
      return seedGallery.find((g) => g.id === id);
    case "faq":
      return seedFaqs.find((f) => f.id === id);
  }
}

export default async function EditContent({ params }: { params: Promise<{ kind: string; id: string }> }) {
  const { kind, id } = await params;
  if (!(kind in collections)) notFound();
  const k = kind as ContentKind;
  const user = await requireStaffPage(k === "clinic" ? "owner" : undefined);

  const isNew = id === "new";
  let value: unknown;
  if (isNew) {
    if (k === "clinic" || k === "doctor") notFound();
    value = blank[k];
  } else {
    const docPath = k === "clinic" ? "settings/clinic" : `${collections[k]}/${id}`;
    try {
      const snap = await adminDb().doc(docPath).get();
      if (snap.exists) {
        const data = { ...snap.data() };
        delete data.updatedAt;
        delete data.updatedBy;
        value = k === "clinic" ? data : { id, ...data };
      }
    } catch {
      /* fall back to seed */
    }
    value ??= seedFor(k, id);
    if (!value) notFound();
  }

  const previewPath =
    k === "treatment" ? `/treatments/${id}` : k === "doctor" ? "/doctor" : k === "gallery" ? "/gallery" : k === "procedure" ? "/treatments#procedures" : k === "faq" ? "/" : "/contact";

  return (
    <ContentEditor kind={k} id={isNew ? "" : id} isNew={isNew} initial={JSON.stringify(value, null, 2)} isOwner={user.role === "owner"} previewPath={previewPath} />
  );
}
