import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Clock, MapPin, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getClinic } from "@/lib/content/loaders";
import { L } from "@/lib/i18n/localize";
import { NavLinks } from "./NavLinks";
import { MobileMenu } from "./MobileMenu";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { TrackedLink } from "./TrackedLink";

export const navItems = [
  { href: "/", key: "home" },
  { href: "/about", key: "about" },
  { href: "/doctor", key: "doctor" },
  { href: "/treatments", key: "treatments" },
  { href: "/gallery", key: "gallery" },
  { href: "/contact", key: "contact" },
] as const;

export async function TopBar() {
  const c = await getClinic();
  const t = await getTranslations();
  const primary = c.phones[0]!;
  return (
    <div className="hidden bg-brand-800 text-[0.8125rem] text-brand-100 lg:block">
      <div className="container-page flex items-center justify-between gap-6 py-2.5 whitespace-nowrap">
        {c.mapsPlaceUrl ? (
          <TrackedLink event="map_open" href={c.mapsPlaceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-white">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            {c.address.lines[0]}, {c.address.lines[1]}
            <span className="sr-only"> ({t("common.opensMaps")})</span>
          </TrackedLink>
        ) : (
          <span>{c.address.lines[0]}</span>
        )}
        <div className="flex items-center gap-6">
          <span className="hidden items-center gap-2 xl:inline-flex">
            <Clock className="h-4 w-4" aria-hidden="true" />
            {t("topbar.hours")}
          </span>
          <TrackedLink event="phone_click" href={`tel:${primary.tel}`} className="inline-flex items-center gap-2 font-semibold hover:text-white">
            <Phone className="h-4 w-4" aria-hidden="true" />
            {primary.display}
          </TrackedLink>
        </div>
      </div>
    </div>
  );
}

export async function Header() {
  const c = await getClinic();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations();
  const primary = c.phones[0]!;
  const items = navItems.map((n) => ({ href: n.href, label: t(`nav.${n.key}`) }));
  return (
    <header className="no-print sticky top-0 z-40 border-b border-sage-200/80 bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/80">
      <div className="container-page flex h-20 items-center justify-between gap-4">
        <Link href="/" aria-label={t("common.homeLink")} className="shrink-0">
          <Image src="/images/brand/logo-navbar.webp" alt={t("common.navLogoAlt")} width={733} height={112} priority className="h-9 w-auto sm:h-11" />
        </Link>
        <nav aria-label={t("nav.primary")} className="hidden lg:block">
          <NavLinks items={items} />
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden 2xl:block">
            <LanguageSwitcher />
          </div>
          <TrackedLink
            event="phone_click"
            href={`tel:${primary.tel}`}
            aria-label={t("common.callClinicOn", { phone: primary.display })}
            className="hidden min-h-11 items-center gap-2 px-3 text-[0.9375rem] font-semibold text-brand-900 hover:text-rose-700 sm:inline-flex"
          >
            <Phone className="h-4 w-4 text-rose-600" aria-hidden="true" />
            <span className="hidden 2xl:inline">{primary.display}</span>
          </TrackedLink>
          <Link href="/appointment" className="btn-primary hidden sm:inline-flex">
            {t("common.bookAppointment")}
          </Link>
          <MobileMenu items={items} hours={L(c.shortHours, locale, c.reviewStatus)} />
        </div>
      </div>
    </header>
  );
}
