import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { MapPin, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getClinic, getTreatments } from "@/lib/content/loaders";
import { L } from "@/lib/i18n/localize";
import { waLink } from "@/lib/whatsapp/messages";
import { navItems } from "./Header";
import { ClinicAddress, directionsUrl, whatsappNumberFor } from "./clinic";
import { OpenStatus } from "./OpenStatus";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { CookieSettingsLink } from "./ConsentBanner";
import { TrackedLink } from "./TrackedLink";
import { WhatsAppIcon } from "./primitives";

const heading = "font-display text-lg font-semibold text-brand-900";
const linkCls = "inline-flex min-h-9 items-center text-[0.9375rem] text-ink/80 hover:text-rose-700";

export async function Footer() {
  const t = await getTranslations();
  const locale = (await getLocale()) as Locale;
  const [c, treatments] = await Promise.all([getClinic(), getTreatments()]);
  const wa = whatsappNumberFor(c);
  const hours = c.openingHours.map((h) => ({ schemaDays: h.schemaDays, sessions: h.sessions, byAppointment: !!h.note }));

  const reach = [
    ...c.phones.map((p) => ({
      key: p.tel,
      event: "phone_click" as const,
      href: `tel:${p.tel}`,
      icon: <Phone className="h-5 w-5" aria-hidden="true" />,
      title: p.display,
      sub: L(p.label, locale, c.reviewStatus),
      external: false,
    })),
    ...(wa
      ? [{ key: "wa", event: "whatsapp_open" as const, href: waLink(wa, t("whatsapp.greeting")), icon: <WhatsAppIcon className="h-5 w-5" />, title: t("common.whatsapp"), sub: c.phones[0]!.display, external: true }]
      : []),
    { key: "dir", event: "directions_click" as const, href: directionsUrl(c), icon: <MapPin className="h-5 w-5" aria-hidden="true" />, title: t("common.getDirections"), sub: c.address.lines[1] ?? "", external: true },
  ];

  return (
    <footer className="no-print bg-sage-50 text-ink/85">
      {/* Reach the clinic */}
      <div className="border-b border-sage-200">
        <div className="container-page grid gap-6 py-10">
          <div>
            <p className="font-display text-2xl font-semibold text-brand-900">{t("footer.reach")}</p>
            <p className="mt-1 text-sage-600">{t("footer.reachText")}</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {reach.map((r) => (
              <li key={r.key}>
                <TrackedLink
                  event={r.event}
                  href={r.href}
                  {...(r.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group flex h-full items-center gap-3 rounded-[var(--radius-frame)] border border-sage-200 bg-white px-4 py-3.5 transition-colors hover:border-rose-300"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-700 group-hover:bg-rose-600 group-hover:text-white">{r.icon}</span>
                  <span className="min-w-0">
                    <span className="block font-semibold whitespace-nowrap text-brand-900">{r.title}</span>
                    <span className="block truncate text-xs text-sage-600">{r.sub}</span>
                  </span>
                  {r.external && <span className="sr-only"> ({t("common.opensNewTab")})</span>}
                </TrackedLink>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Directory */}
      <div className="container-page grid gap-x-10 gap-y-12 py-14 sm:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Image src="/images/brand/logo-full.webp" alt={t("common.logoAlt")} width={402} height={96} className="h-auto w-56" />
          <p className="mt-5 max-w-xs text-[0.9375rem] leading-relaxed">{t("footer.tagline")}</p>
          <ClinicAddress className="mt-5 text-[0.9375rem] text-ink/75" />
        </div>

        <nav aria-label={t("footer.explore")} className="lg:col-span-2">
          <h2 className={heading}>{t("footer.explore")}</h2>
          <ul className="mt-3">
            {navItems.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className={linkCls}>
                  {t(`nav.${n.key}`)}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/appointment" className="inline-flex min-h-9 items-center text-[0.9375rem] font-semibold text-rose-700 hover:text-rose-800">
                {t("common.bookAnAppointment")}
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label={t("footer.treatments")} className="sm:col-span-2 lg:col-span-3">
          <h2 className={heading}>{t("footer.treatments")}</h2>
          <ul className="mt-3 grid gap-x-6 sm:grid-cols-2 lg:grid-cols-1">
            {treatments.map((tr) => (
              <li key={tr.slug}>
                <Link href={`/treatments/${tr.slug}`} className={linkCls}>
                  {L(tr.name, locale, tr.reviewStatus)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-3">
          <h2 className={heading}>{t("footer.hours")}</h2>
          <div className="mt-3">
            <OpenStatus hours={hours} />
          </div>
          <dl className="mt-4 divide-y divide-sage-200 border-y border-sage-200 text-[0.9375rem]">
            {c.openingHours.map((h, i) => (
              <div key={i} className="py-3">
                <dt className="font-semibold text-ink">{L(h.days, locale, c.reviewStatus)}</dt>
                <dd className="text-ink/75">
                  {L(h.display, locale, c.reviewStatus)}
                  {h.note && <span className="block text-sm text-sage-600">{L(h.note, locale, c.reviewStatus)}</span>}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Legal */}
      <div className="border-t border-sage-200 bg-white/60">
        <div className="container-page flex flex-col gap-4 py-6 text-[0.8125rem] leading-relaxed text-sage-600 lg:flex-row lg:items-center lg:justify-between">
          <p className="max-w-3xl">{t("footer.copyright", { year: new Date().getFullYear() })}</p>
          <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/privacy" className="underline-offset-4 hover:text-brand-900 hover:underline">
              {t("footer.privacy")}
            </Link>
            <CookieSettingsLink label={t("footer.cookieSettings")} />
            <LanguageSwitcher compact />
          </div>
        </div>
      </div>
    </footer>
  );
}
