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
    <section className="no-print relative overflow-hidden bg-brand-800 text-white">
      <div className="container-page grid items-end gap-10 py-18 sm:py-24 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <h2 className="text-[2.25rem] leading-[1.1] font-semibold text-white sm:text-[3rem]">{t("cta.title")}</h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-brand-100">{t("cta.text")}</p>
        </div>
        <div className="flex flex-wrap gap-3 lg:justify-end">
          <Link href="/appointment" className="btn bg-gold-300 text-brand-950 hover:bg-gold-200">
            {t("common.bookAnAppointment")}
          </Link>
          <WhatsAppLink variant="light" />
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
      className="no-print fixed right-4 bottom-4 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-[0_8px_24px_-6px_rgba(14,122,109,0.55)] ring-4 ring-white hover:bg-whatsapp-dark sm:right-6 sm:bottom-6"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </TrackedLink>
  );
}

export function FaqList({ faqs }: { faqs: { question: string; answer: string }[] }) {
  return (
    <div className="border-t border-sage-300">
      {faqs.map((f, i) => (
        <details key={i} className="group border-b border-sage-300">
          <summary className="flex min-h-11 cursor-pointer list-none items-start justify-between gap-6 py-6 text-brand-900 [&::-webkit-details-marker]:hidden">
            <h3 className="font-display text-xl leading-snug font-semibold sm:text-[1.375rem]">{f.question}</h3>
            <span aria-hidden="true" className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sage-300 text-lg leading-none text-rose-600 transition-transform duration-300 group-open:rotate-45 group-open:border-rose-400">
              +
            </span>
          </summary>
          <p className="max-w-3xl pb-7 leading-[1.75] text-ink/85">
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
    <article className="group relative flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-frame)] bg-sage-100">
        <Image
          src={treatment.image.path}
          alt={L(treatment.image.alt, locale, treatment.reviewStatus)}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      </div>
      <p className="mt-5 text-sm font-medium text-rose-700">{t(`groups.${treatment.group}`)}</p>
      <h3 className="mt-1 text-[1.5rem] leading-snug font-semibold">
        <Link href={`/treatments/${treatment.slug}`} className="after:absolute after:inset-0 hover:text-rose-700 focus-visible:outline-none focus-visible:after:rounded-[var(--radius-frame)] focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-rose-500">
          {name}
        </Link>
      </h3>
      <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-ink/80">{L(treatment.summary, locale, treatment.reviewStatus)}</p>
      <p aria-hidden="true" className="mt-4 inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold text-brand-800 group-hover:text-rose-700">
        {t("learnMore")}
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </p>
    </article>
  );
}

export async function TranslationNotice({ show }: { show: boolean }) {
  if (!show) return null;
  const t = await getTranslations("common");
  return (
    <div className="border-b border-amber-300 bg-amber-50">
      <p className="container-page py-2 text-sm text-amber-800">{t("translationNotice")}</p>
    </div>
  );
}
