import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, CalendarCheck, Clock, MapPin, Phone, ShieldCheck, Stethoscope, Syringe } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getClinic, getDoctor, getGallery, getHomeFaqs, getTreatments } from "@/lib/content/loaders";
import { heroClinicImage } from "@/lib/content/seed";
import { L, isReviewed } from "@/lib/i18n/localize";
import { pageMetadata } from "@/lib/seo/metadata";
import { faqJsonLd } from "@/lib/seo/jsonld";
import { CtaBanner, FaqList, TranslationNotice } from "@/components/site/blocks";
import { ClinicAddress, ClinicPhoneNumbers, directionsUrl, OpeningHoursList, WhatsAppLink } from "@/components/site/clinic";
import { MapEmbed } from "@/components/site/MapEmbed";
import { OpenStatus } from "@/components/site/OpenStatus";
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

/** The "S" swoosh of the clinic's logo, drawn as a single line. */
function Swoosh({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 600" fill="none" aria-hidden="true" className={className}>
      <path d="M470 70C330 20 150 70 150 190c0 150 320 120 320 260 0 110-170 150-330 90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M500 110C380 60 210 95 205 190c-6 125 310 110 305 250" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity=".55" />
    </svg>
  );
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
  const dr = (x: Parameters<typeof L>[0]) => L(x, locale, doctor.reviewStatus);
  const groups = [
    { title: t("home.groupSkin"), text: t("home.groupSkinText"), items: treatments.filter((x) => x.group === "skin") },
    { title: t("home.groupHair"), text: t("home.groupHairText"), items: treatments.filter((x) => x.group === "hair") },
    { title: t("home.groupCosmetic"), text: t("home.groupCosmeticText"), items: treatments.filter((x) => x.group === "cosmetology" || x.group === "nails") },
  ].filter((g) => g.items.length);
  const faqItems = faqs.map((f) => ({ question: L(f.question, locale, f.reviewStatus), answer: L(f.answer, locale, f.reviewStatus) }));
  const expect = [
    { icon: ShieldCheck, title: t("home.expect1"), text: t("home.expect1Text") },
    { icon: Stethoscope, title: t("home.expect2"), text: t("home.expect2Text") },
    { icon: Syringe, title: t("home.expect3"), text: t("home.expect3Text") },
    { icon: Clock, title: t("home.expect4"), text: t("home.expect4Text") },
  ];
  const hours = clinic.openingHours.map((h) => ({ schemaDays: h.schemaDays, sessions: h.sessions, byAppointment: !!h.note }));

  return (
    <>
      <TranslationNotice show={!indexable.includes(locale)} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-sage-50">
        <Swoosh className="pointer-events-none absolute hidden lg:block -top-24 right-[-12rem] h-[44rem] w-[44rem] text-gold-400/60 lg:right-[-6rem]" />
        <div className="container-page relative grid gap-14 pt-14 pb-20 sm:pt-20 lg:grid-cols-[1.08fr_1fr] lg:gap-16 lg:pt-24 lg:pb-28">
          <div className="animate-rise lg:pt-6">
            <p className="inline-flex items-center gap-2 text-[0.9375rem] font-medium text-rose-700"><span aria-hidden="true" className="h-px w-8 bg-gold-400" />{t("home.pill")}</p>
            <h1 className="mt-5 text-[2.75rem] leading-[1.02] font-semibold text-brand-800 sm:text-[4rem] lg:text-[4.75rem]">
              <span className="sr-only">{t("home.h1Sr")} </span>
              {t("home.h1")}
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink/75 sm:text-[1.25rem]">{t("home.intro")}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/appointment" className="btn-primary">
                <CalendarCheck className="h-[1.125rem] w-[1.125rem]" aria-hidden="true" />
                {t("common.bookAnAppointment")}
              </Link>
              <TrackedLink event="phone_click" href={`tel:${primary.tel}`} className="btn-secondary">
                <Phone className="h-4 w-4" aria-hidden="true" />
                {t("common.call", { phone: primary.display })}
              </TrackedLink>
            </div>

            <Link href="/doctor" className="group mt-12 flex max-w-md items-center gap-4 border-t border-sage-300 pt-6">
              <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-gold-300">
                <Image src={doctor.photo.path} alt="" fill sizes="56px" className="object-cover object-top" />
              </span>
              <span>
                <span className="block text-sm text-sage-600">{t("hero.doctorLine")}</span>
                <span className="block font-display text-lg font-semibold text-brand-800 group-hover:text-rose-700">{doctor.name}</span>
                <span className="block text-sm text-sage-600">{doctor.qualificationsShort}</span>
              </span>
            </Link>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-frame)] bg-sage-200 lg:ml-10">
              <Image src={heroClinicImage.path} alt={L(heroClinicImage.alt, locale)} fill priority fetchPriority="high" sizes="(min-width: 1024px) 520px, 92vw" className="object-cover" />
            </div>
            {/* Clinic card, modelled on the visiting card */}
            <div className="relative -mt-24 mr-4 ml-4 animate-card-in rounded-[var(--radius-frame)] bg-white p-6 text-ink shadow-[0_24px_60px_-24px_rgba(74,31,61,0.35)] ring-1 ring-sage-200 sm:mr-auto sm:ml-0 sm:max-w-sm lg:absolute lg:-bottom-10 lg:-left-6 lg:mt-0">
              <p className="font-display text-xl font-semibold text-brand-900">{t("hero.cardTitle")}</p>
              <div className="mt-3">
                <OpenStatus hours={hours} />
              </div>
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink/80">
                {clinic.address.lines[0]}
                <br />
                {clinic.address.lines[1]}
              </p>
              <p className="mt-2 text-sm text-sage-600">{tr(clinic.shortHours)}</p>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1 border-t border-sage-200 pt-4 text-[0.9375rem] font-semibold">
                <TrackedLink event="directions_click" href={directionsUrl(clinic)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 text-rose-700 hover:text-rose-800">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  {t("hero.directions")}
                  <span className="sr-only"> ({t("common.opensNewTab")})</span>
                </TrackedLink>
                <TrackedLink event="phone_click" href={`tel:${primary.tel}`} className="inline-flex min-h-11 items-center gap-1.5 text-brand-800 hover:text-rose-700">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {primary.display}
                </TrackedLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Treatments directory */}
      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-16">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <h2 className="section-title">{t("hero.servicesTitle")}</h2>
            <p className="lede mt-5">{t("hero.servicesText")}</p>
            <Link href="/treatments" className="link mt-7 inline-flex items-center gap-1.5">
              {t("home.viewAll", { count: treatments.length })}
            </Link>
          </div>
          <div className="space-y-14">
            {groups.map((g) => (
              <div key={g.title}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b-2 border-gold-400 pb-3">
                  <h3 className="text-[1.625rem] font-semibold">{g.title}</h3>
                  <p className="text-[0.9375rem] text-sage-600">{g.text}</p>
                </div>
                <ul>
                  {g.items.map((x) => (
                    <li key={x.slug} className="border-b border-sage-200">
                      <Link href={`/treatments/${x.slug}`} className="group grid grid-cols-[4.5rem_1fr_auto] items-center gap-5 py-5 sm:grid-cols-[5.5rem_1fr_auto]">
                        <span className="relative aspect-square overflow-hidden rounded-[var(--radius-soft)] bg-sage-100">
                          <Image src={x.image.path} alt="" fill sizes="88px" className="object-cover" />
                        </span>
                        <span>
                          <span className="block font-display text-xl font-semibold text-brand-900 group-hover:text-rose-700 sm:text-[1.375rem]">{L(x.name, locale, x.reviewStatus)}</span>
                          <span className="mt-1 line-clamp-2 block text-[0.9375rem] leading-relaxed text-ink/75">{L(x.summary, locale, x.reviewStatus)}</span>
                        </span>
                        <ArrowRight className="h-5 w-5 text-sage-400 transition-[transform,color] duration-300 group-hover:translate-x-1 group-hover:text-rose-600" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctor */}
      <section className="section bg-sage-50">
        <div className="container-page grid items-start gap-12 lg:grid-cols-[5fr_7fr] lg:gap-20">
          <figure className="mx-auto w-full max-w-md">
            <Image
              src={doctor.photo.path}
              alt={dr(doctor.photo.alt)}
              width={doctor.photo.width}
              height={doctor.photo.height}
              sizes="(min-width: 1024px) 440px, 88vw"
              className="h-auto w-full rounded-[var(--radius-frame)]"
            />
          </figure>
          <div>
            <p className="eyebrow">{t("home.doctorEyebrow")}</p>
            <h2 className="section-title">{doctor.name}</h2>
            <p className="mt-3 text-lg text-sage-600">{dr(doctor.role)}</p>
            <p className="mt-7 max-w-2xl text-lg leading-[1.75]">{dr(doctor.introduction[0]!)}</p>

            <dl className="mt-10 grid gap-x-10 gap-y-8 border-t border-sage-300 pt-8 sm:grid-cols-2">
              {doctor.qualifications.length > 0 && (
                <div>
                  <dt className="font-display text-lg font-semibold text-brand-900">{t("hero.credentials")}</dt>
                  {doctor.qualifications.map((q, i) => (
                    <dd key={i} className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink/80">
                      {dr(q)}
                    </dd>
                  ))}
                </div>
              )}
              {doctor.positions.length > 0 && (
                <div>
                  <dt className="font-display text-lg font-semibold text-brand-900">{t("hero.position")}</dt>
                  {doctor.positions.map((q, i) => (
                    <dd key={i} className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink/80">
                      {dr(q)}
                    </dd>
                  ))}
                </div>
              )}
            </dl>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/appointment" className="btn-primary">
                {t("common.bookAnAppointment")}
              </Link>
              <Link href="/doctor" className="btn-secondary">
                {t("home.doctorProfile")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What to expect */}
      <section className="section">
        <div className="container-page">
          <h2 className="section-title max-w-2xl">{t("home.expectTitle")}</h2>
          <ul className="mt-14 grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {expect.map(({ icon: Icon, title, text }) => (
              <li key={title} className="border-t-2 border-gold-400 pt-6">
                <Icon className="h-6 w-6 text-rose-600" aria-hidden="true" strokeWidth={1.75} />
                <h3 className="mt-5 text-[1.375rem] leading-snug font-semibold">{title}</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink/80">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Inside the clinic */}
      <section className="overflow-hidden bg-sage-100 py-18 sm:py-24">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="section-title">{t("home.insideTitle")}</h2>
              <p className="lede mt-4">{t("hero.insideText")}</p>
            </div>
            <Link href="/gallery" className="btn-secondary">
              {t("common.viewGallery")}
            </Link>
          </div>
          <ul className="mt-14 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {gallery.slice(0, 4).map((g, i) => (
              <li key={g.id} className={i % 2 === 1 ? "lg:mt-16" : undefined}>
                <figure>
                  <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-frame)] bg-sage-200">
                    <Image src={g.image.path} alt={L(g.image.alt, locale, g.reviewStatus)} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
                  </div>
                  <figcaption className="mt-3 text-[0.9375rem] text-sage-600">{L(g.caption, locale, g.reviewStatus)}</figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How booking works: a real sequence, so numbered */}
      <section className="section">
        <div className="container-page">
          <h2 className="section-title">{t("home.bookingEyebrow")}</h2>
          <ol className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            <span aria-hidden="true" className="absolute top-6 right-[16%] left-[16%] hidden h-px bg-sage-300 md:block" />
            {[1, 2, 3].map((n) => (
              <li key={n} className="relative md:text-center">
                <span aria-hidden="true" className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-rose-500 bg-white font-display text-xl font-semibold text-brand-900 md:mx-auto">
                  {n}
                </span>
                <h3 className="mt-5 text-[1.375rem] font-semibold">{t(`home.step${n}`)}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink/80 md:mx-auto md:max-w-xs">{t(`home.step${n}Text`)}</p>
              </li>
            ))}
          </ol>
          <div className="mt-14 flex flex-wrap gap-3 md:justify-center">
            <Link href="/appointment" className="btn-primary">
              <CalendarCheck className="h-[1.125rem] w-[1.125rem]" aria-hidden="true" />
              {t("common.bookAnAppointment")}
            </Link>
            <WhatsAppLink variant="outline" />
          </div>
        </div>
      </section>

      {/* Visit */}
      <section className="section border-t border-sage-200 bg-sage-50">
        <div className="container-page grid gap-12 lg:grid-cols-[2fr_3fr]">
          <div>
            <h2 className="section-title">{t("home.visitTitle")}</h2>
            <div className="mt-5">
              <OpenStatus hours={hours} />
            </div>
            <ClinicAddress withName className="mt-6 text-[1.0625rem]" />
            <p className="mt-3 text-[0.9375rem] text-sage-600">{tr(clinic.landmarks)}</p>
            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <OpeningHoursList />
              <ClinicPhoneNumbers />
            </div>
          </div>
          <MapEmbed embedUrl={clinic.mapsEmbedUrl} />
        </div>
      </section>

      {/* FAQs */}
      <section className="section">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
          <div>
            <h2 className="section-title">{t("home.faqTitle")}</h2>
            <p className="lede mt-5">{t("home.faqText")}</p>
          </div>
          <FaqList faqs={faqItems} />
        </div>
      </section>
      <JsonLd data={faqJsonLd(faqItems)} />

      <CtaBanner />
    </>
  );
}
