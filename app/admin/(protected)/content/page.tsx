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
    <section className="rounded-[var(--radius-frame)] border border-sage-200 bg-white p-6">
      <h2 className="text-[1.375rem] font-semibold">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
  const item = (href: string, label: string, extra?: string) => (
    <li key={href} className="border-b border-sage-100 last:border-0">
      <Link href={href} className="group -mx-2 flex min-h-11 items-center gap-3 rounded-[var(--radius-soft)] px-2 text-ink hover:bg-sage-50 hover:text-rose-700">
        <span className="flex-1">{label}</span>
        {extra && <span className="text-xs text-sage-600">{extra}</span>}
        <span aria-hidden="true" className="text-sage-400 group-hover:text-rose-600">›</span>
      </Link>
    </li>
  );
  return (
    <div className="space-y-6">
      <h1 className="text-[2.25rem] leading-tight font-semibold">Website content</h1>
      <p className="max-w-3xl text-sage-600">
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
