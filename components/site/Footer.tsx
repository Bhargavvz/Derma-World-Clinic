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

const heading = "font-display text-lg font-semibold text-brand-900";

export async function Footer() {
  const t = await getTranslations();
  const locale = (await getLocale()) as Locale;
  const treatments = await getTreatments();
  return (
    <footer className="no-print border-t border-sage-200 bg-sage-50 text-ink/85">
      <div className="container-page grid gap-x-10 gap-y-12 py-16 sm:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Image src="/images/brand/logo-full.webp" alt={t("common.logoAlt")} width={402} height={96} className="h-auto w-60" />
          <p className="mt-5 max-w-sm text-[0.9375rem] leading-relaxed">{t("footer.tagline")}</p>
          <div className="mt-6">
            <ClinicPhoneNumbers />
          </div>
        </div>

        <nav aria-label={t("footer.explore")} className="lg:col-span-2">
          <h2 className={heading}>{t("footer.explore")}</h2>
          <ul className="mt-3">
            {navItems.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="inline-flex min-h-10 items-center text-[0.9375rem] hover:text-rose-700">
                  {t(`nav.${n.key}`)}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/appointment" className="inline-flex min-h-10 items-center text-[0.9375rem] font-semibold text-rose-700 hover:text-rose-800">
                {t("common.bookAnAppointment")}
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label={t("footer.treatments")} className="lg:col-span-3">
          <h2 className={heading}>{t("footer.treatments")}</h2>
          <ul className="mt-3 text-[0.9375rem]">
            {treatments.map((tr) => (
              <li key={tr.slug}>
                <Link href={`/treatments/${tr.slug}`} className="inline-flex min-h-9 items-center hover:text-rose-700">
                  {L(tr.name, locale, tr.reviewStatus)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-3">
          <h2 className={heading}>{t("footer.visitUs")}</h2>
          <ClinicAddress className="mt-3 text-[0.9375rem]" />
          <div className="mt-5 text-[0.9375rem]">
            <OpeningHoursList />
          </div>
          <div className="mt-6">
            <DirectionsLinks />
          </div>
        </div>
      </div>

      <div className="border-t border-sage-200">
        <div className="container-page flex flex-col gap-4 py-6 text-[0.8125rem] leading-relaxed text-sage-600 lg:flex-row lg:items-center lg:justify-between">
          <p className="max-w-3xl">{t("footer.copyright", { year: new Date().getFullYear() })}</p>
          <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/privacy" className="underline-offset-4 hover:text-brand-900 hover:underline">
              {t("footer.privacy")}
            </Link>
            <CookieSettingsLink label={t("footer.cookieSettings")} />
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}
