import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BadgeCheck, BookOpen, Briefcase, GraduationCap, Heart, Stethoscope, Users } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getClinic, getDoctor, getTreatments } from "@/lib/content/loaders";
import { L, isReviewed } from "@/lib/i18n/localize";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, physicianJsonLd } from "@/lib/seo/jsonld";
import { CtaBanner, TranslationNotice } from "@/components/site/blocks";
import { WhatsAppLink } from "@/components/site/clinic";
import { Breadcrumbs, JsonLd } from "@/components/site/primitives";

type Props = { params: Promise<{ locale: Locale }> };

async function indexable() {
  const d = await getDoctor();
  return (["en", "te", "hi"] as Locale[]).filter((l) => isReviewed(l, d.reviewStatus));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "doctor" });
  const d = await getDoctor();
  return pageMetadata({
    locale,
    path: "/doctor",
    title: t("metaTitle"),
    description: t("metaDescription"),
    indexableLocales: await indexable(),
    ogImage: d.photo.path.startsWith("/") ? undefined : d.photo.path,
  });
}

export default async function DoctorPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const [d, clinic, treatments, idx] = await Promise.all([getDoctor(), getClinic(), getTreatments(), indexable()]);
  const tr = (x: Parameters<typeof L>[0]) => L(x, locale, d.reviewStatus);

  const Card = ({ icon: Icon, title, children }: { icon: typeof GraduationCap; title: string; children: React.ReactNode }) => (
    <div className="card">
      <Icon className="h-7 w-7 text-brand-600" aria-hidden="true" />
      <h2 className="mt-3 text-xl font-semibold">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed">{children}</div>
    </div>
  );

  return (
    <>
      <TranslationNotice show={!idx.includes(locale)} />
      <Breadcrumbs items={[{ name: t("common.home"), href: "/" }, { name: t("doctor.breadcrumb") }]} />

      <section className="relative overflow-hidden bg-gradient-to-b from-sage-100 to-sage-50">
        <div className="container-page grid items-center gap-12 py-14 lg:grid-cols-[2fr_3fr]">
          <div className="relative mx-auto w-full max-w-sm">
            <div aria-hidden="true" className="absolute -inset-4 -rotate-3 rounded-[2.5rem] bg-sage-200" />
            <Image
              src={d.photo.path}
              alt={tr(d.photo.alt)}
              width={d.photo.width}
              height={d.photo.height}
              priority
              sizes="(min-width: 1024px) 380px, 80vw"
              className="relative h-auto w-full rounded-[2rem] shadow-xl"
            />
          </div>
          <div className="animate-fade-up">
            <p className="eyebrow">{t("doctor.eyebrow")}</p>
            <h1 className="text-4xl font-semibold sm:text-5xl">{d.name}</h1>
            <p className="mt-3 inline-flex items-center gap-2 font-semibold text-brand-700">
              {d.qualificationsShort}
              <BadgeCheck className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">({t("doctor.verified")})</span>
            </p>
            <p className="text-gray-600">{tr(d.role)}</p>
            {d.introduction.map((p, i) => (
              <p key={i} className="mt-4 leading-relaxed">
                {tr(p)}
              </p>
            ))}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/appointment" className="btn-primary">
                {t("common.bookAnAppointment")}
              </Link>
              <WhatsAppLink variant="outline" message={t("whatsapp.doctor", { doctor: d.name })} />
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card icon={GraduationCap} title={t("doctor.qualifications")}>
            <ul className="space-y-1">
              {d.qualifications.map((q, i) => (
                <li key={i}>{tr(q)}</li>
              ))}
            </ul>
          </Card>
          <Card icon={Briefcase} title={t("doctor.positions")}>
            <ul className="space-y-2">
              {d.positions.map((q, i) => (
                <li key={i}>{tr(q)}</li>
              ))}
            </ul>
          </Card>
          <Card icon={Users} title={t("doctor.memberships")}>
            <ul className="space-y-2">
              {d.memberships.map((m) => (
                <li key={m.number}>
                  {tr(m.name)} — <strong>{m.number}</strong>
                </li>
              ))}
            </ul>
          </Card>
          <Card icon={Heart} title={t("doctor.interests")}>
            <p>{tr(d.interestsIntro)}</p>
            <ul className="mt-2 list-disc pl-5">
              {d.interests.map((x, i) => (
                <li key={i}>{tr(x)}</li>
              ))}
            </ul>
          </Card>
          {d.publications !== null && (
            <Card icon={BookOpen} title={t("doctor.publications")}>
              <p>
                <span className="font-display text-5xl font-semibold text-brand-700">{d.publications}</span>{" "}
                <span>{t("doctor.publicationsText")}</span>
              </p>
            </Card>
          )}
          <Card icon={Stethoscope} title={t("doctor.consultations")}>
            <ul className="flex flex-wrap gap-2">
              {treatments.map((x) => (
                <li key={x.slug}>
                  <Link
                    href={`/treatments/${x.slug}`}
                    className="inline-flex min-h-9 items-center rounded-full bg-brand-50 px-3 text-xs font-semibold text-brand-800 hover:bg-brand-100"
                  >
                    {L(x.name, locale, x.reviewStatus)}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      {d.conferencePhoto && (
        <section className="section bg-sage-50">
          <div className="container-page">
            <figure className="mx-auto max-w-xl">
              <Image
                src={d.conferencePhoto.path}
                alt={tr(d.conferencePhoto.alt)}
                width={d.conferencePhoto.width}
                height={d.conferencePhoto.height}
                sizes="(min-width: 640px) 576px, 100vw"
                className="h-auto w-full rounded-3xl shadow-lg"
              />
              <figcaption className="mt-3 text-center text-sm text-gray-700">{tr(d.conferencePhoto.caption)}</figcaption>
            </figure>
          </div>
        </section>
      )}

      <CtaBanner />
      <JsonLd
        data={[
          physicianJsonLd(d, clinic),
          breadcrumbJsonLd([
            { name: t("common.home"), path: "/" },
            { name: t("doctor.breadcrumb"), path: "/doctor" },
          ]),
        ]}
      />
    </>
  );
}
