import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { htmlLang, routing, type Locale } from "@/i18n/routing";
import { localePath } from "@/lib/seo/metadata";
import { getTreatment, getTreatments } from "@/lib/content/loaders";
import { seedTreatments } from "@/lib/content/seed";
import { L, isReviewed } from "@/lib/i18n/localize";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, faqJsonLd, treatmentPageJsonLd } from "@/lib/seo/jsonld";
import { CtaBanner, FaqList, TranslationNotice, TreatmentCard } from "@/components/site/blocks";
import { WhatsAppLink } from "@/components/site/clinic";
import { Breadcrumbs, InfoNote, JsonLd } from "@/components/site/primitives";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export const dynamicParams = true;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => seedTreatments.map((t) => ({ locale, slug: t.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const tr = await getTreatment(slug);
  if (!tr) return { title: "Not found", robots: { index: false } };
  return pageMetadata({
    locale,
    path: `/treatments/${slug}`,
    title: L(tr.seo.title, locale, tr.reviewStatus),
    description: L(tr.seo.description, locale, tr.reviewStatus),
    indexableLocales: (["en", "te", "hi"] as Locale[]).filter((l) => isReviewed(l, tr.reviewStatus)),
    // og:image comes from the colocated opengraph-image.tsx (file metadata wins).
  });
}

export default async function TreatmentPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const tr = await getTreatment(slug);
  if (!tr) notFound();
  const t = await getTranslations();
  const all = await getTreatments();
  const x = (v: Parameters<typeof L>[0]) => L(v, locale, tr.reviewStatus);
  const name = x(tr.name);
  const sameGroup = all.filter((o) => o.slug !== slug && o.group === tr.group);
  const related = [...sameGroup, ...all.filter((o) => o.slug !== slug && o.group !== tr.group)].slice(0, 3);
  const faqs = tr.faqs.map((f) => ({ question: x(f.question), answer: x(f.answer) }));
  const showNotice = !isReviewed(locale, tr.reviewStatus);

  return (
    <>
      <TranslationNotice show={showNotice} />
      <Breadcrumbs
        items={[
          { name: t("common.home"), href: "/" },
          { name: t("treatments.breadcrumb"), href: "/treatments" },
          { name },
        ]}
      />

      <section className="bg-sage-50">
        <div className="container-page grid items-center gap-10 py-12 lg:grid-cols-2 lg:py-16">
          <div className="animate-rise">
            <p className="eyebrow">{t(`common.groups.${tr.group}`)}</p>
            <h1 className="text-4xl leading-tight font-semibold sm:text-5xl">{name}</h1>
            <p className="mt-5 text-lg leading-relaxed">{x(tr.summary)}</p>
          </div>
          <figure>
            <div className="relative aspect-[3/2] overflow-hidden rounded-[var(--radius-frame)] bg-sage-100">
              <Image src={tr.image.path} alt={x(tr.image.alt)} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
            {tr.image.illustrative && <figcaption className="mt-2 text-xs text-sage-600">{t("treatments.illustrative")}</figcaption>}
          </figure>
        </div>
      </section>

      <div className="container-page grid gap-12 py-14 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-12">
          <section>
            <h2 className="section-title">{t("treatments.overview")}</h2>
            {tr.overview.map((p, i) => (
              <p key={i} className="mt-4 text-lg leading-relaxed">
                {x(p)}
              </p>
            ))}
          </section>

          {tr.concerns.length > 0 && (
            <section>
              <h2 className="section-title">{t("treatments.concerns")}</h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {tr.concerns.map((c, i) => (
                  <li key={i} className="flex gap-3 rounded-[var(--radius-soft)] bg-sage-50 p-4">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
                    <span>{x(c)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="section-title">{t("treatments.consultation")}</h2>
            <ul className="mt-6 space-y-3">
              {tr.consultation.map((c, i) => (
                <li key={i} className="flex gap-3">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
                  <span className="leading-relaxed">{x(c)}</span>
                </li>
              ))}
            </ul>
          </section>

          {faqs.length > 0 && (
            <section>
              <h2 className="section-title">{t("treatments.faqs")}</h2>
              <div className="mt-6">
                <FaqList faqs={faqs} />
              </div>
            </section>
          )}

          <InfoNote>{t("treatments.disclaimer")}</InfoNote>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="card bg-brand-900 text-white">
            <h2 className="text-2xl font-semibold text-white">{t("treatments.bookTitle")}</h2>
            <p className="mt-3 text-sm text-brand-50">{t("treatments.bookText")}</p>
            <div className="mt-6 flex flex-col gap-3">
              {tr.bookable && (
                <Link href={{ pathname: "/appointment", query: { treatment: tr.slug } }} className="btn-light">
                  {t("common.bookAnAppointment")}
                </Link>
              )}
              <WhatsAppLink variant="light" message={`${t("whatsapp.default")} (${name})`} />
            </div>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="section bg-sage-50">
          <div className="container-page">
            <h2 className="section-title">{t("treatments.related")}</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <TreatmentCard key={r.slug} treatment={r} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBanner />
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: t("common.home"), path: "/" },
            { name: t("treatments.breadcrumb"), path: "/treatments" },
            { name, path: `/treatments/${slug}` },
          ]),
          treatmentPageJsonLd({ name, description: x(tr.seo.description), path: localePath(locale, `/treatments/${slug}`), imagePath: tr.image.path, lang: htmlLang[locale] }),
          ...(faqs.length ? [faqJsonLd(faqs)] : []),
        ]}
      />
    </>
  );
}
