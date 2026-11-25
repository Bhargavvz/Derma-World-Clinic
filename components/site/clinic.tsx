import { getLocale, getTranslations } from "next-intl/server";
import { MapPin, Phone } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { getClinic } from "@/lib/content/loaders";
import type { ClinicSettings } from "@/lib/content/types";
import { L } from "@/lib/i18n/localize";
import { resolveWhatsAppNumber, waLink } from "@/lib/whatsapp/messages";
import { cn, WhatsAppIcon } from "./primitives";
import { TrackedLink } from "./TrackedLink";

export function directionsUrl(c: ClinicSettings) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(c.directionsDestination)}`;
}

export function whatsappNumberFor(c: ClinicSettings): string | null {
  return resolveWhatsAppNumber(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER, c.whatsappNumber);
}

export async function ClinicAddress({ withName = false, className }: { withName?: boolean; className?: string }) {
  const c = await getClinic();
  return (
    <address className={cn("not-italic leading-relaxed", className)}>
      {withName && <strong className="block text-ink">{c.name}</strong>}
      {c.address.lines.map((l) => (
        <span key={l} className="block">
          {l}
        </span>
      ))}
    </address>
  );
}

export async function ClinicPhoneNumbers({ size = "md", inverted = false }: { size?: "md" | "lg"; inverted?: boolean }) {
  const c = await getClinic();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("common");
  return (
    <ul className="space-y-2">
      {c.phones.map((p) => (
        <li key={p.tel}>
          <TrackedLink
            event="phone_click"
            href={`tel:${p.tel}`}
            aria-label={t("callClinicOn", { phone: p.display })}
            className={cn(
              "inline-flex min-h-11 items-center gap-2 font-semibold",
              size === "lg" ? "text-xl" : "text-base",
              inverted ? "text-white hover:text-brand-100" : "text-brand-700 hover:text-brand-900",
            )}
          >
            <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
            {p.display}
          </TrackedLink>
          <span className={cn("ml-6 block text-xs", inverted ? "text-brand-100" : "text-sage-600")}>{L(p.label, locale, c.reviewStatus)}</span>
        </li>
      ))}
    </ul>
  );
}

export async function OpeningHoursList({ inverted = false, showSundayNote = false }: { inverted?: boolean; showSundayNote?: boolean }) {
  const c = await getClinic();
  const locale = (await getLocale()) as Locale;
  return (
    <div>
      <dl className="space-y-2">
        {c.openingHours.map((h, i) => (
          <div key={i}>
            <dt className={cn("font-semibold", inverted ? "text-white" : "text-ink")}>{L(h.days, locale, c.reviewStatus)}</dt>
            <dd className={inverted ? "text-brand-100" : "text-ink/85"}>
              {L(h.display, locale, c.reviewStatus)}
              {h.note && <span className="block text-sm">({L(h.note, locale, c.reviewStatus)})</span>}
            </dd>
          </div>
        ))}
      </dl>
      {showSundayNote && <p className={cn("mt-3 text-sm", inverted ? "text-brand-100" : "text-sage-600")}>{L(c.sundayNote, locale, c.reviewStatus)}</p>}
    </div>
  );
}

export async function DirectionsLinks({ inverted = false }: { inverted?: boolean }) {
  const c = await getClinic();
  const t = await getTranslations("common");
  return (
    <div className="flex flex-wrap gap-3">
      <TrackedLink event="directions_click" href={directionsUrl(c)} target="_blank" rel="noopener noreferrer" className={inverted ? "btn-light" : "btn-primary"}>
        <MapPin className="h-4 w-4" aria-hidden="true" />
        {t("getDirections")}
        <span className="sr-only"> ({t("opensNewTab")})</span>
      </TrackedLink>
      {c.mapsPlaceUrl && (
        <TrackedLink event="map_open" href={c.mapsPlaceUrl} target="_blank" rel="noopener noreferrer" className={inverted ? "btn-light" : "btn-secondary"}>
          {t("viewOnMaps")}
          <span className="sr-only"> ({t("opensNewTab")})</span>
        </TrackedLink>
      )}
    </div>
  );
}

export async function WhatsAppLink({
  message,
  variant = "solid",
  label,
  className,
}: {
  message?: string;
  variant?: "solid" | "outline" | "light";
  label?: string;
  className?: string;
}) {
  const c = await getClinic();
  const t = await getTranslations();
  const number = whatsappNumberFor(c);
  if (!number) return null; // hideWhenUnavailable
  const cls = variant === "solid" ? "btn-whatsapp" : variant === "outline" ? "btn-whatsapp-outline" : "btn-light";
  return (
    <TrackedLink
      event="whatsapp_open"
      href={waLink(number, message ?? t("whatsapp.default"))}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(cls, className)}
    >
      <WhatsAppIcon />
      {label ?? t("common.whatsapp")}
      <span className="sr-only"> ({t("common.opensWhatsApp")})</span>
    </TrackedLink>
  );
}
