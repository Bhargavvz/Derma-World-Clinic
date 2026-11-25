import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getProcedures, getTreatments } from "@/lib/content/loaders";
import { L, isReviewed } from "@/lib/i18n/localize";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { CtaBanner, TranslationNotice, TreatmentCard } from "@/components/site/blocks";
import { Breadcrumbs, InfoNote, JsonLd, PageHero } from "@/components/site/primitives";

type Props = { params: Promise<{ locale: Locale }> };

async function indexable() {
  const [tr, pr] = await Promise.all([getTreatments(), getProcedures()]);
  const all = [...tr.map((x) => x.reviewStatus), ...pr.map((x) => x.reviewStatus)];
  return (["en", "te", "hi"] as Locale[]).filter((l) => isReviewed(l, ...all));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "treatments" });
  return pageMetadata({ locale, path: "/treatments", title: t("metaTitle"), description: t("metaDescription"), indexableLocales: await indexable() });
}

export default async function TreatmentsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const [treatments, procedures, idx] = await Promise.all([getTreatments(), getProcedures(), indexable()]);
  const sections = [
    { id: "skin", title: t("treatments.skin"), items: treatments.filter((x) => x.group === "skin") },
    { id: "hair-nails", title: t("treatments.hairNails"), items: treatments.filter((x) => x.group === "hair" || x.group === "nails") },
    { id: "cosmetology", title: t("treatments.cosmetology"), items: treatments.filter((x) => x.group === "cosmetology") },
  ].filter((s) => s.items.length);

  return (
    <>
      <TranslationNotice show={!idx.includes(locale)} />
      <Breadcrumbs items={[{ name: t("common.home"), href: "/" }, { name: t("treatments.breadcrumb") }]} />
      <PageHero eyebrow={t("treatments.eyebrow")} title={t("treatments.title")} intro={t("treatments.intro")}>
        <nav aria-label={t("treatments.categories")} className="mt-8">
          <ul className="flex flex-wrap gap-2">
            {[...sections, { id: "procedures", title: t("treatments.proceduresTitle") }].map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="btn-secondary">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </PageHero>

      {sections.map((s, i) => (
        <section key={s.id} id={s.id} className={`section scroll-mt-24 ${i % 2 ? "bg-sage-50" : ""}`}>
          <div className="container-page">
            <h2 className="section-title">{s.title}</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {s.items.map((x, j) => (
                <TreatmentCard key={x.slug} treatment={x} priority={i === 0 && j < 3} />
              ))}
            </div>
          </div>
        </section>
      ))}

      <section id="procedures" className="section scroll-mt-24 bg-sage-50">
        <div className="container-page">
          <h2 className="section-title">{t("treatments.proceduresTitle")}</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {procedures.map((p) => (
              <li key={p.id} className="card">
                <h3 className="text-lg font-semibold">{L(p.name, locale, p.reviewStatus)}</h3>
                <p className="mt-2 text-sm">{L(p.description, locale, p.reviewStatus)}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-gray-600">{t("treatments.proceduresNote")}</p>
          <div className="mt-8">
            <InfoNote>{t("treatments.disclaimer")}</InfoNote>
          </div>
        </div>
      </section>

      <CtaBanner />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t("common.home"), path: "/" },
          { name: t("treatments.breadcrumb"), path: "/treatments" },
        ])}
      />
    </>
  );
}
