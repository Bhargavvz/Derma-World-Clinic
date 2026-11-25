import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getTreatments } from "@/lib/content/loaders";
import { L } from "@/lib/i18n/localize";
import { navItems } from "./Header";
import { ClinicAddress, ClinicPhoneNumbers, DirectionsLinks, OpeningHoursList } from "./clinic";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { CookieSettingsLink } from "./ConsentBanner";

export async function Footer() {
  const t = await getTranslations();
  const locale = (await getLocale()) as Locale;
  const treatments = await getTreatments();
  return (
    <footer className="no-print bg-brand-900 text-brand-50">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-1">
          <Image
            src="/images/brand/logo-full.webp"
            alt={t("common.logoAlt")}
            width={402}
            height={96}
            className="h-auto w-56 rounded-xl bg-white p-2"
          />
          <p className="mt-4 text-sm leading-relaxed text-brand-100">{t("footer.tagline")}</p>
          <div className="mt-5">
            <ClinicPhoneNumbers inverted />
          </div>
          <Link href="/appointment" className="btn-light mt-5">
            {t("common.bookAnAppointment")}
          </Link>
        </div>
        <div>
          <h2 className="font-sans text-sm font-bold tracking-widest text-white uppercase">{t("footer.explore")}</h2>
          <ul className="mt-4 space-y-1">
            {navItems.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="inline-flex min-h-11 items-center hover:text-white hover:underline">
                  {t(`nav.${n.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-sans text-sm font-bold tracking-widest text-white uppercase">{t("footer.treatments")}</h2>
          <ul className="mt-4 space-y-1 text-sm">
            {treatments.map((tr) => (
              <li key={tr.slug}>
                <Link href={`/treatments/${tr.slug}`} className="inline-flex min-h-9 items-center hover:text-white hover:underline">
                  {L(tr.name, locale, tr.reviewStatus)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-sans text-sm font-bold tracking-widest text-white uppercase">{t("footer.visitUs")}</h2>
          <ClinicAddress className="mt-4 text-sm text-brand-100" withName />
          <div className="mt-4">
            <DirectionsLinks inverted />
          </div>
        </div>
        <div>
          <h2 className="font-sans text-sm font-bold tracking-widest text-white uppercase">{t("common.openingHours")}</h2>
          <div className="mt-4 text-sm">
            <OpeningHoursList inverted />
          </div>
          <div className="mt-6">
            <LanguageSwitcher inverted />
          </div>
        </div>
      </div>
      <div className="border-t border-brand-800">
        <div className="container-page flex flex-col gap-3 py-6 text-xs leading-relaxed text-brand-100 sm:flex-row sm:items-start sm:justify-between">
          <p className="max-w-3xl">{t("footer.copyright", { year: new Date().getFullYear() })}</p>
          <div className="flex shrink-0 gap-4">
            <Link href="/privacy" className="underline hover:text-white">
              {t("footer.privacy")}
            </Link>
            <CookieSettingsLink label={t("footer.cookieSettings")} />
          </div>
        </div>
      </div>
    </footer>
  );
}
