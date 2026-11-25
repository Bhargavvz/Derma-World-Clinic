import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getClinic } from "@/lib/content/loaders";
import type { Treatment } from "@/lib/content/types";
import { L } from "@/lib/i18n/localize";
import { waLink } from "@/lib/whatsapp/messages";
import { whatsappNumberFor, WhatsAppLink } from "./clinic";
import { RichText, WhatsAppIcon } from "./primitives";
import { TrackedLink } from "./TrackedLink";

export async function CtaBanner() {
  const t = await getTranslations();
  return (
    <section className="section no-print">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-3xl bg-brand-700 px-6 py-12 text-center text-white sm:px-12">
          <div aria-hidden="true" className="absolute -top-16 -left-16 h-56 w-56 rounded-full bg-brand-500 opacity-40 blur-3xl" />
          <h2 className="relative text-3xl font-semibold text-white sm:text-4xl">{t("cta.title")}</h2>
          <p className="relative mx-auto mt-4 max-w-2xl text-brand-50">{t("cta.text")}</p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/appointment" className="btn-light">
              {t("common.bookAnAppointment")}
            </Link>
            <WhatsAppLink variant="solid" className="!bg-whatsapp-dark ring-1 ring-white/40" />
          </div>
        </div>
      </div>
    </section>
  );
}

export async function WhatsAppFloat() {
  const c = await getClinic();
  const t = await getTranslations();
  const number = whatsappNumberFor(c);
  if (!number) return null;
  return (
    <TrackedLink
      event="whatsapp_open"
      href={waLink(number, t("whatsapp.default"))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${t("common.chatWhatsApp")} (${t("common.opensWhatsApp")})`}
      className="no-print fixed right-4 bottom-4 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg hover:bg-whatsapp-dark sm:right-6 sm:bottom-6"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </TrackedLink>
  );
}

export function FaqList({ faqs }: { faqs: { question: string; answer: string }[] }) {
  return (
    <div className="divide-y divide-sage-200 rounded-3xl border border-sage-200 bg-white">
      {faqs.map((f, i) => (
        <details key={i} className="group p-5 sm:p-6">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-semibold text-gray-900 [&::-webkit-details-marker]:hidden">
            <h3 className="font-sans text-base">{f.question}</h3>
            <span aria-hidden="true" className="text-2xl leading-none text-brand-600 transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="mt-3 leading-relaxed text-gray-700">
            <RichText text={f.answer} />
          </p>
        </details>
      ))}
    </div>
  );
}

export async function TreatmentCard({ treatment, priority = false }: { treatment: Treatment; priority?: boolean }) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("common");
  const name = L(treatment.name, locale, treatment.reviewStatus);
  return (
    <article className="card group flex flex-col overflow-hidden !p-0 transition-shadow hover:shadow-xl">
      <div className="relative aspect-[3/2] overflow-hidden bg-sage-100">
        <Image
          src={treatment.image.path}
          alt={L(treatment.image.alt, locale, treatment.reviewStatus)}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="eyebrow !mb-2">{t(`groups.${treatment.group}`)}</p>
        <h3 className="text-xl font-semibold">{name}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed">{L(treatment.summary, locale, treatment.reviewStatus)}</p>
        <Link
          href={`/treatments/${treatment.slug}`}
          className="mt-4 inline-flex min-h-11 items-center gap-1 font-semibold text-brand-700 hover:text-brand-900"
        >
          {t("learnMore")}
          <span className="sr-only">: {name}</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export async function TranslationNotice({ show }: { show: boolean }) {
  if (!show) return null;
  const t = await getTranslations("common");
  return (
    <div className="border-b border-amber-200 bg-amber-50">
      <p className="container-page py-2 text-sm text-amber-800">{t("translationNotice")}</p>
    </div>
  );
}
