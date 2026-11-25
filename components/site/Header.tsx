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
      <div className="container-page flex min-h-10 items-center justify-between gap-6 whitespace-nowrap">
        {c.mapsPlaceUrl ? (
          <TrackedLink event="map_open" href={c.mapsPlaceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-w-0 items-center gap-2 hover:text-white">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-gold-300" aria-hidden="true" />
            <span className="truncate">{c.address.lines[0]}, {c.address.lines[1]}</span>
            <span className="sr-only"> ({t("common.opensMaps")})</span>
          </TrackedLink>
        ) : (
          <span>{c.address.lines[0]}</span>
        )}
        <div className="flex items-center divide-x divide-white/15">
          <span className="hidden items-center gap-2 pr-5 xl:inline-flex">
            <Clock className="h-3.5 w-3.5 text-gold-300" aria-hidden="true" />
            {t("topbar.hours")}
          </span>
          <TrackedLink event="phone_click" href={`tel:${primary.tel}`} className="inline-flex items-center gap-2 px-5 font-semibold text-white hover:text-gold-200">
            <Phone className="h-3.5 w-3.5 text-gold-300" aria-hidden="true" />
            {primary.display}
          </TrackedLink>
          <div className="pl-3">
            <LanguageSwitcher inverted compact />
          </div>
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
    <header className="no-print sticky top-0 z-40 border-b border-sage-200 bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/85">
      <div className="container-page flex h-[4.5rem] items-center gap-6 lg:h-20">
        <Link href="/" aria-label={t("common.homeLink")} className="shrink-0">
          <Image src="/images/brand/logo-navbar.webp" alt={t("common.navLogoAlt")} width={733} height={112} priority className="h-8 w-auto sm:h-10" />
        </Link>
        <nav aria-label={t("nav.primary")} className="ml-auto hidden xl:block">
          <NavLinks items={items} />
        </nav>
        <div className="ml-auto flex items-center gap-2 xl:ml-2">
          <TrackedLink
            event="phone_click"
            href={`tel:${primary.tel}`}
            aria-label={t("common.callClinicOn", { phone: primary.display })}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-sage-200 text-brand-800 hover:border-rose-300 hover:text-rose-700 lg:hidden"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
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
