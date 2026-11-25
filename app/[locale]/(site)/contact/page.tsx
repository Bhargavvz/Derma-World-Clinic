import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getClinic } from "@/lib/content/loaders";
import { isReviewed } from "@/lib/i18n/localize";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { TranslationNotice } from "@/components/site/blocks";
import { ClinicAddress, ClinicPhoneNumbers, DirectionsLinks, OpeningHoursList, WhatsAppLink, whatsappNumberFor } from "@/components/site/clinic";
import { ContactForm } from "@/components/site/ContactForm";
import { MapEmbed } from "@/components/site/MapEmbed";
import { Breadcrumbs, JsonLd, PageHero } from "@/components/site/primitives";

type Props = { params: Promise<{ locale: Locale }> };

async function indexable() {
  const c = await getClinic();
  return (["en", "te", "hi"] as Locale[]).filter((l) => isReviewed(l, c.reviewStatus));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return pageMetadata({ locale, path: "/contact", title: t("metaTitle"), description: t("metaDescription"), indexableLocales: await indexable() });
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const [clinic, idx] = await Promise.all([getClinic(), indexable()]);

  const Box = ({ icon: Icon, title, children }: { icon: typeof MapPin; title: string; children: React.ReactNode }) => (
    <div className="card">
      <h2 className="flex items-center gap-2 font-sans text-lg font-bold text-gray-900">
        <Icon className="h-5 w-5 text-brand-600" aria-hidden="true" />
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </div>
  );

  return (
    <>
      <TranslationNotice show={!idx.includes(locale)} />
      <Breadcrumbs items={[{ name: t("common.home"), href: "/" }, { name: t("contact.breadcrumb") }]} />
      <PageHero eyebrow={t("contact.eyebrow")} title={t("contact.title")} intro={t("contact.intro")} />
      <section className="section">
        <div className="container-page grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <Box icon={MapPin} title={t("common.address")}>
              <ClinicAddress withName />
              <div className="mt-4">
                <DirectionsLinks />
              </div>
            </Box>
            <Box icon={Phone} title={t("common.phone")}>
              <ClinicPhoneNumbers size="lg" />
              <div className="mt-4">
                <WhatsAppLink />
              </div>
            </Box>
            {clinic.email && (
              <Box icon={Mail} title={t("common.email")}>
                <a href={`mailto:${clinic.email}`} className="font-semibold break-all text-brand-700 underline">
                  {clinic.email}
                </a>
              </Box>
            )}
            <Box icon={Clock} title={t("common.openingHours")}>
              <OpeningHoursList showSundayNote />
            </Box>
            <MapEmbed embedUrl={clinic.mapsEmbedUrl} />
          </div>
          <div className="space-y-6">
            <div className="card bg-brand-800 text-white">
              <h2 className="text-2xl font-semibold text-white">{t("contact.wantToBook")}</h2>
              <p className="mt-2 text-brand-50">{t("contact.wantToBookText")}</p>
              <Link href="/appointment" className="btn-light mt-5">
                {t("common.bookAnAppointment")}
              </Link>
            </div>
            <ContactForm whatsappNumber={whatsappNumberFor(clinic)} />
          </div>
        </div>
      </section>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t("common.home"), path: "/" },
          { name: t("contact.breadcrumb"), path: "/contact" },
        ])}
      />
    </>
  );
}
