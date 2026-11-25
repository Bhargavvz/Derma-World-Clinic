import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CalendarCheck, Clock, MapPin, Phone, ShieldCheck, Stethoscope, Syringe } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getClinic, getDoctor, getGallery, getHomeFaqs, getTreatments } from "@/lib/content/loaders";
import { heroClinicImage } from "@/lib/content/seed";
import { L, isReviewed } from "@/lib/i18n/localize";
import { pageMetadata } from "@/lib/seo/metadata";
import { faqJsonLd } from "@/lib/seo/jsonld";
import { CtaBanner, FaqList, TranslationNotice, TreatmentCard } from "@/components/site/blocks";
import { ClinicAddress, ClinicPhoneNumbers, OpeningHoursList, WhatsAppLink } from "@/components/site/clinic";
import { MapEmbed } from "@/components/site/MapEmbed";
import { JsonLd } from "@/components/site/primitives";
import { TrackedLink } from "@/components/site/TrackedLink";

type Props = { params: Promise<{ locale: Locale }> };

async function reviewedLocales() {
  const [clinic, doctor, faqs, treatments] = await Promise.all([getClinic(), getDoctor(), getHomeFaqs(), getTreatments()]);
  const all = [clinic.reviewStatus, doctor.reviewStatus, ...faqs.map((f) => f.reviewStatus), ...treatments.map((t) => t.reviewStatus)];
  return (["en", "te", "hi"] as Locale[]).filter((l) => isReviewed(l, ...all));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return pageMetadata({ locale, path: "/", title: t("metaTitle"), description: t("metaDescription"), indexableLocales: await reviewedLocales() });
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const [clinic, doctor, treatments, gallery, faqs, indexable] = await Promise.all([
    getClinic(),
    getDoctor(),
    getTreatments(),
    getGallery(),
    getHomeFaqs(),
    reviewedLocales(),
  ]);
  const primary = clinic.phones[0]!;
  const tr = (x: Parameters<typeof L>[0], r = clinic.reviewStatus) => L(x, locale, r);
  const groups = [
    { title: t("home.groupSkin"), text: t("home.groupSkinText"), items: treatments.filter((x) => x.group === "skin") },
    { title: t("home.groupHair"), text: t("home.groupHairText"), items: treatments.filter((x) => x.group === "hair") },
    { title: t("home.groupCosmetic"), text: t("home.groupCosmeticText"), items: treatments.filter((x) => x.group === "cosmetology" || x.group === "nails") },
  ];
  const faqItems = faqs.map((f) => ({ question: L(f.question, locale, f.reviewStatus), answer: L(f.answer, locale, f.reviewStatus) }));
  const expect = [
    { icon: ShieldCheck, title: t("home.expect1"), text: t("home.expect1Text") },
    { icon: Stethoscope, title: t("home.expect2"), text: t("home.expect2Text") },
    { icon: Syringe, title: t("home.expect3"), text: t("home.expect3Text") },
    { icon: Clock, title: t("home.expect4"), text: t("home.expect4Text") },
  ];

  return (
    <>
      <TranslationNotice show={!indexable.includes(locale)} />

      {/* 1. Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sage-50 to-white">
        <div aria-hidden="true" className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-brand-100 opacity-60 blur-3xl" />
        <div className="container-page relative grid items-center gap-12 py-12 sm:py-16 lg:grid-cols-2 lg:py-20">
          <div className="animate-fade-up">
            <p className="inline-flex rounded-full bg-brand-50 px-4 py-1.5 text-sm font-semibold text-brand-700">{t("home.pill")}</p>
            <h1 className="mt-6">
              <span className="sr-only">{t("home.h1Sr")} </span>
              <Image
                src="/images/brand/logo-hero-1100.webp"
                alt=""
                aria-hidden="true"
                width={1186}
                height={272}
                priority
                sizes="(min-width: 1024px) 560px, 90vw"
                className="h-auto w-full max-w-xl"
              />
              <span className="mt-5 block text-3xl leading-tight font-semibold text-brand-800 sm:text-4xl">{t("home.h1")}</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed">{t("home.intro")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/appointment" className="btn-primary">
                <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                {t("common.bookAnAppointment")}
              </Link>
              <TrackedLink event="phone_click" href={`tel:${primary.tel}`} className="btn-secondary">
                <Phone className="h-4 w-4" aria-hidden="true" />
                {t("common.call", { phone: primary.display })}
              </TrackedLink>
              <WhatsAppLink variant="outline" />
            </div>
            <p className="mt-5 text-sm text-gray-600">{tr(clinic.shortHours)}</p>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <div aria-hidden="true" className="absolute -inset-4 rotate-3 rounded-[2.5rem] bg-sage-200" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-xl">
              <Image
                src={heroClinicImage.path}
                alt={L(heroClinicImage.alt, locale)}
                fill
                priority
                fetchPriority="high"
                sizes="(min-width: 1024px) 448px, 90vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-6 left-4 rounded-2xl bg-white p-4 shadow-lg sm:-left-6">
              <p className="font-display text-lg font-semibold text-brand-900">{doctor.name}</p>
              <p className="text-sm text-gray-600">{doctor.qualificationsShort}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Clinic at a glance */}
      <section className="container-page relative z-10 mt-10">
        <div className="card grid gap-6 sm:grid-cols-3">
          <div className="flex gap-3">
            <MapPin className="mt-1 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
            <div>
              <h2 className="font-sans text-sm font-bold text-gray-900">{t("home.glanceLocation")}</h2>
              <p className="mt-1 text-sm">{t("home.glanceLocationText")}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Clock className="mt-1 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
            <div>
              <h2 className="font-sans text-sm font-bold text-gray-900">{t("home.glanceHours")}</h2>
              <p className="mt-1 text-sm">{t("home.glanceHoursText")}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Phone className="mt-1 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
            <div>
              <h2 className="font-sans text-sm font-bold text-gray-900">{t("home.glanceCall")}</h2>
              <TrackedLink event="phone_click" href={`tel:${primary.tel}`} className="mt-1 inline-flex min-h-11 items-center font-semibold text-brand-700">
                {primary.display}
              </TrackedLink>
            </div>
          </div>
        </div>
      </section>

      {/* 3. About */}
      <section className="section">
        <div className="container-page">
          <div className="max-w-3xl">
            <p className="eyebrow">{t("home.aboutEyebrow")}</p>
            <h2 className="section-title">{t("home.aboutTitle")}</h2>
            <p className="mt-4 text-lg leading-relaxed">{t("home.aboutText")}</p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {groups.map((g) => (
              <div key={g.title} className="card">
                <h3 className="text-xl font-semibold">{g.title}</h3>
                <p className="mt-2 text-sm">{g.text}</p>
                <ul className="mt-4 space-y-1">
                  {g.items.map((x) => (
                    <li key={x.slug}>
                      <Link href={`/treatments/${x.slug}`} className="inline-flex min-h-9 items-center text-sm font-semibold text-brand-700 hover:underline">
                        {L(x.name, locale, x.reviewStatus)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Treatments */}
      <section className="section bg-sage-50">
        <div className="container-page">
          <div className="max-w-3xl">
            <p className="eyebrow">{t("home.treatmentsEyebrow")}</p>
            <h2 className="section-title">{t("home.treatmentsTitle")}</h2>
            <p className="mt-4 text-lg">{t("home.treatmentsText")}</p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {treatments.slice(0, 6).map((x) => (
              <TreatmentCard key={x.slug} treatment={x} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/treatments" className="btn-secondary">
              {t("home.viewAll", { count: treatments.length })}
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Meet the doctor */}
      <section className="section">
        <div className="container-page grid items-center gap-12 lg:grid-cols-[2fr_3fr]">
          <div className="relative mx-auto w-full max-w-sm">
            <div aria-hidden="true" className="absolute -inset-4 -rotate-3 rounded-[2.5rem] bg-sage-200" />
            <Image
              src={doctor.photo.path}
              alt={L(doctor.photo.alt, locale, doctor.reviewStatus)}
              width={doctor.photo.width}
              height={doctor.photo.height}
              sizes="(min-width: 1024px) 380px, 80vw"
              className="relative h-auto w-full rounded-[2rem] shadow-xl"
            />
          </div>
          <div>
            <p className="eyebrow">{t("home.doctorEyebrow")}</p>
            <h2 className="section-title">{doctor.name}</h2>
            <p className="mt-2 font-semibold text-brand-700">{doctor.qualificationsShort}</p>
            <p className="text-gray-600">{L(doctor.role, locale, doctor.reviewStatus)}</p>
            <p className="mt-5 leading-relaxed">{L(doctor.introduction[0], locale, doctor.reviewStatus)}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/appointment" className="btn-primary">
                {t("common.bookAnAppointment")}
              </Link>
              <WhatsAppLink variant="outline" message={t("whatsapp.doctor", { doctor: doctor.name })} />
              <Link href="/doctor" className="btn-secondary">
                {t("home.doctorProfile")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. What to expect */}
      <section className="section bg-sage-50">
        <div className="container-page">
          <p className="eyebrow">{t("home.expectEyebrow")}</p>
          <h2 className="section-title">{t("home.expectTitle")}</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {expect.map(({ icon: Icon, title, text }) => (
              <div key={title} className="card">
                <Icon className="h-8 w-8 text-brand-600" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. A look inside */}
      <section className="section">
        <div className="container-page">
          <p className="eyebrow">{t("home.insideEyebrow")}</p>
          <h2 className="section-title">{t("home.insideTitle")}</h2>
          <ul className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {gallery.slice(0, 4).map((g) => (
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
          <div className="mt-8 text-center">
            <Link href="/gallery" className="btn-secondary">
              {t("common.viewGallery")}
            </Link>
          </div>
        </div>
      </section>

      {/* 8. How booking works */}
      <section className="section bg-sage-50">
        <div className="container-page">
          <p className="eyebrow">{t("home.bookingEyebrow")}</p>
          <h2 className="section-title">{t("home.bookingTitle")}</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <li key={n} className="card">
                <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-700 font-bold text-white">
                  {n}
                </span>
                <h3 className="mt-4 text-lg font-semibold">{t(`home.step${n}`)}</h3>
                <p className="mt-2 text-sm leading-relaxed">{t(`home.step${n}Text`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 9. Visit the clinic */}
      <section className="section">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow">{t("home.visitEyebrow")}</p>
            <h2 className="section-title">{t("home.visitTitle")}</h2>
            <ClinicAddress withName className="mt-6" />
            <p className="mt-2 text-sm text-gray-600">{tr(clinic.landmarks)}</p>
            <div className="mt-6">
              <OpeningHoursList />
            </div>
            <div className="mt-6">
              <ClinicPhoneNumbers />
            </div>
            <div className="mt-4">
              <WhatsAppLink />
            </div>
          </div>
          <MapEmbed embedUrl={clinic.mapsEmbedUrl} />
        </div>
      </section>

      {/* 10. FAQs */}
      <section className="section bg-sage-50">
        <div className="container-page max-w-4xl">
          <p className="eyebrow">{t("home.faqEyebrow")}</p>
          <h2 className="section-title">{t("home.faqTitle")}</h2>
          <p className="mt-4">{t("home.faqText")}</p>
          <div className="mt-8">
            <FaqList faqs={faqItems} />
          </div>
        </div>
      </section>
      <JsonLd data={faqJsonLd(faqItems)} />

      <CtaBanner />
    </>
  );
}
