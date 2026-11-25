import Link from "next/link";
import { requireStaffPage } from "@/lib/auth/session";
import { getClinic, getDoctor, getGallery, getHomeFaqs, getProcedures, getTreatments } from "@/lib/content/loaders";
import { adminDb } from "@/lib/firebase/admin";

export const metadata = { title: "Content" };

/** Lists every editable document, including unpublished ones (read directly, not from the public cache). */
async function allTreatmentSlugs(): Promise<{ slug: string; name: string; published: boolean }[]> {
  try {
    const snap = await adminDb().collection("treatments").get();
    if (!snap.empty) return snap.docs.map((d) => ({ slug: d.id, name: d.get("name")?.en ?? d.id, published: d.get("published") !== false })).sort((a, b) => a.slug.localeCompare(b.slug));
  } catch {
    /* fall through */
  }
  return (await getTreatments()).map((t) => ({ slug: t.slug, name: t.name.en, published: t.published }));
}

export default async function ContentIndex() {
  const user = await requireStaffPage();
  const [clinic, doctor, treatments, procedures, gallery, faqs] = await Promise.all([
    getClinic(),
    getDoctor(),
    allTreatmentSlugs(),
    getProcedures(),
    getGallery(),
    getHomeFaqs(),
  ]);
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="card">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
  const item = (href: string, label: string, extra?: string) => (
    <li key={href}>
      <Link href={href} className="inline-flex min-h-9 items-center text-brand-700 underline">
        {label}
      </Link>
      {extra && <span className="ml-2 text-xs text-gray-600">{extra}</span>}
    </li>
  );
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Content</h1>
      <p className="max-w-3xl text-sm text-gray-700">
        Changes are validated, checked for medical wording, saved, recorded in the audit log, and the public pages update within seconds. Telugu and Hindi
        text stays hidden (English is shown, not indexed) until its review status is set to <code>reviewed</code> by a qualified reviewer.
      </p>
      <div className="grid gap-6 lg:grid-cols-2">
        {user.role === "owner" && (
          <Section title="Clinic settings (owner)">
            <ul>{item("/admin/content/clinic/clinic", clinic.name)}</ul>
          </Section>
        )}
        <Section title="Doctor profile">
          <ul>{item(`/admin/content/doctor/${doctor.id}`, doctor.name)}</ul>
        </Section>
        <Section title="Treatments">
          <ul>{treatments.map((t) => item(`/admin/content/treatment/${t.slug}`, t.name, t.published ? undefined : "unpublished"))}</ul>
          <Link href="/admin/content/treatment/new" className="btn-secondary mt-3">
            New treatment
          </Link>
        </Section>
        <Section title="Procedures">
          <ul>{procedures.map((p) => item(`/admin/content/procedure/${p.id}`, p.name.en))}</ul>
          <Link href="/admin/content/procedure/new" className="btn-secondary mt-3">
            New procedure
          </Link>
        </Section>
        <Section title="Gallery (genuine clinic photos only)">
          <ul>{gallery.map((g) => item(`/admin/content/gallery/${g.id}`, g.caption.en))}</ul>
          <Link href="/admin/content/gallery/new" className="btn-secondary mt-3">
            Add photo
          </Link>
        </Section>
        <Section title="Home FAQs">
          <ul>{faqs.map((f) => item(`/admin/content/faq/${f.id}`, f.question.en))}</ul>
          <Link href="/admin/content/faq/new" className="btn-secondary mt-3">
            New FAQ
          </Link>
        </Section>
      </div>
    </div>
  );
}
