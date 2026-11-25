import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getClinic, getTreatments } from "@/lib/content/loaders";
import { L, isReviewed } from "@/lib/i18n/localize";
import { isClientFirebaseConfigured } from "@/lib/env";
import { GENERAL_VALUE } from "@/lib/validation/appointment";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { TranslationNotice } from "@/components/site/blocks";
import { ClinicAddress, ClinicPhoneNumbers, OpeningHoursList, whatsappNumberFor } from "@/components/site/clinic";
import { BookingForm, type TreatmentOption } from "@/components/site/BookingForm";
import { Breadcrumbs, JsonLd, PageHero } from "@/components/site/primitives";

type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<{ treatment?: string | string[] }> };

async function indexable() {
  const [c, tr] = await Promise.all([getClinic(), getTreatments()]);
  return (["en", "te", "hi"] as Locale[]).filter((l) => isReviewed(l, c.reviewStatus, ...tr.map((x) => x.reviewStatus)));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "booking" });
  return pageMetadata({ locale, path: "/appointment", title: t("metaTitle"), description: t("metaDescription"), indexableLocales: await indexable() });
}

export default async function AppointmentPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const [clinic, treatments, idx] = await Promise.all([getClinic(), getTreatments(), indexable()]);
  const bookable = treatments.filter((x) => x.bookable);
  const opt = (x: (typeof bookable)[number]): TreatmentOption => ({ value: x.slug, label: L(x.name, locale, x.reviewStatus), group: x.group });
  const groups = [
    { label: t("booking.groupSkin"), options: bookable.filter((x) => x.group === "skin").map(opt) },
    { label: t("booking.groupHairNails"), options: bookable.filter((x) => x.group === "hair" || x.group === "nails").map(opt) },
    { label: t("booking.groupCosmetology"), options: bookable.filter((x) => x.group === "cosmetology").map(opt) },
  ].filter((g) => g.options.length);

  // ?treatment=<slug>, or the old ?treatment=<exact name>
  const sp = await searchParams;
  const q = (Array.isArray(sp.treatment) ? sp.treatment[0] : sp.treatment)?.trim() ?? "";
  const match = bookable.find((x) => x.slug === q || x.name.en === q);
  const initial = match ? match.slug : q.toLowerCase() === "general inquiry" || q === GENERAL_VALUE ? GENERAL_VALUE : "";
  const primary = clinic.phones[0]!;

  return (
    <>
      <TranslationNotice show={!idx.includes(locale)} />
      <Breadcrumbs items={[{ name: t("common.home"), href: "/" }, { name: t("booking.breadcrumb") }]} />
      <PageHero eyebrow={t("booking.eyebrow")} title={t("booking.title")} intro={t("booking.intro")} />
      <section className="section">
        <div className="container-page grid gap-10 lg:grid-cols-[3fr_2fr]">
          <BookingForm
            groups={groups}
            general={{ value: GENERAL_VALUE, label: t("booking.general"), group: "general" }}
            initialTreatment={initial}
            whatsappNumber={whatsappNumberFor(clinic)}
            primaryPhone={{ display: primary.display, tel: primary.tel }}
            sundayNote={L(clinic.sundayNote, locale, clinic.reviewStatus)}
            firebaseConfigured={isClientFirebaseConfigured()}
          />
          <aside className="space-y-6">
            <div className="card space-y-6">
              <h2 className="text-xl font-semibold">{t("booking.sidebarTitle")}</h2>
              <div>
                <h3 className="font-sans text-sm font-bold text-ink">{t("common.address")}</h3>
                <ClinicAddress withName className="mt-2 text-sm" />
              </div>
              <div>
                <h3 className="mb-2 font-sans text-sm font-bold text-ink">{t("common.openingHours")}</h3>
                <OpeningHoursList showSundayNote />
              </div>
              <div>
                <h3 className="mb-2 font-sans text-sm font-bold text-ink">{t("common.phone")}</h3>
                <ClinicPhoneNumbers />
              </div>
            </div>
          </aside>
        </div>
      </section>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t("common.home"), path: "/" },
          { name: t("booking.breadcrumb"), path: "/appointment" },
        ])}
      />
    </>
  );
}
