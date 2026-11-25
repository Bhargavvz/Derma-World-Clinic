import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getClinic, getGallery, getProcedures } from "@/lib/content/loaders";
import { heroClinicImage } from "@/lib/content/seed";
import { L, isReviewed } from "@/lib/i18n/localize";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { CtaBanner, TranslationNotice } from "@/components/site/blocks";
import { ClinicAddress, ClinicPhoneNumbers, DirectionsLinks, OpeningHoursList } from "@/components/site/clinic";
import { Breadcrumbs, JsonLd, PageHero } from "@/components/site/primitives";

type Props = { params: Promise<{ locale: Locale }> };

async function indexable() {
  const [clinic, procedures, gallery] = await Promise.all([getClinic(), getProcedures(), getGallery()]);
  const all = [clinic.reviewStatus, ...procedures.map((p) => p.reviewStatus), ...gallery.map((g) => g.reviewStatus)];
  return (["en", "te", "hi"] as Locale[]).filter((l) => isReviewed(l, ...all));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return pageMetadata({ locale, path: "/about", title: t("metaTitle"), description: t("metaDescription"), indexableLocales: await indexable() });
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const [procedures, gallery, idx] = await Promise.all([getProcedures(), getGallery(), indexable()]);

  return (
    <>
      <TranslationNotice show={!idx.includes(locale)} />
      <Breadcrumbs items={[{ name: t("common.home"), href: "/" }, { name: t("about.breadcrumb") }]} />
      <PageHero eyebrow={t("about.eyebrow")} title={t("about.title")} intro={t("about.intro")} />

      <section className="section">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow">{t("about.approachEyebrow")}</p>
            <h2 className="section-title">{t("about.approachTitle")}</h2>
            <p className="mt-5 leading-relaxed">{t("about.approach1")}</p>
            <p className="mt-4 leading-relaxed">{t("about.approach2")}</p>
            <p className="mt-4 leading-relaxed font-semibold text-brand-800">{t("about.approach3")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/doctor" className="btn-primary">
                {t("about.meetDoctor")}
              </Link>
              <Link href="/treatments" className="btn-secondary">
                {t("about.viewTreatments")}
              </Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <div aria-hidden="true" className="absolute -inset-4 rotate-2 rounded-[2.5rem] bg-sage-200" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-xl">
              <Image src={heroClinicImage.path} alt={L(heroClinicImage.alt, locale)} fill sizes="(min-width: 1024px) 448px, 90vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-sage-50">
        <div className="container-page">
          <p className="eyebrow">{t("about.servicesEyebrow")}</p>
          <h2 className="section-title">{t("about.servicesTitle")}</h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {procedures.map((p) => (
              <li key={p.id} className="card">
                <h3 className="text-lg font-semibold">{L(p.name, locale, p.reviewStatus)}</h3>
                <p className="mt-2 text-sm">{L(p.description, locale, p.reviewStatus)}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-gray-600">{t("about.servicesNote")}</p>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <h2 className="section-title">{t("about.careTitle")}</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="card">
                <h3 className="text-lg font-semibold">{t(`about.care${n}`)}</h3>
                <p className="mt-2 text-sm leading-relaxed">{t(`about.care${n}Text`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-sage-50">
        <div className="container-page grid gap-10 lg:grid-cols-[3fr_2fr]">
          <div>
            <h2 className="section-title">{t("about.insideTitle")}</h2>
            <ul className="mt-8 grid grid-cols-2 gap-4">
              {gallery.slice(1, 5).map((g) => (
                <li key={g.id}>
                  <figure>
                    <div className="relative aspect-[9/16] overflow-hidden rounded-3xl bg-sage-100">
                      <Image src={g.image.path} alt={L(g.image.alt, locale, g.reviewStatus)} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
                    </div>
                    <figcaption className="mt-2 text-center text-sm font-semibold">{L(g.caption, locale, g.reviewStatus)}</figcaption>
                  </figure>
                </li>
              ))}
            </ul>
            <Link href="/gallery" className="btn-secondary mt-8">
              {t("common.viewGallery")}
            </Link>
          </div>
          <div className="card h-fit space-y-6">
            <div>
              <h3 className="font-sans text-sm font-bold text-gray-900">{t("common.address")}</h3>
              <ClinicAddress withName className="mt-2 text-sm" />
            </div>
            <ClinicPhoneNumbers />
            <DirectionsLinks />
            <div>
              <h3 className="mb-2 font-sans text-sm font-bold text-gray-900">{t("common.openingHours")}</h3>
              <OpeningHoursList />
            </div>
          </div>
        </div>
      </section>

      <CtaBanner />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t("common.home"), path: "/" },
          { name: t("about.breadcrumb"), path: "/about" },
        ])}
      />
    </>
  );
}
