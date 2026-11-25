"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { htmlLang, localeNames, locales, type Locale } from "@/i18n/routing";
import { localePath } from "@/lib/seo/metadata";
import { track } from "@/lib/analytics";
import { cn } from "./primitives";

/** Plain <a hreflang> links to the current page in each language; the choice is remembered in a cookie. */
export function LanguageSwitcher({ inverted = false, compact = false }: { inverted?: boolean; compact?: boolean }) {
  const current = useLocale() as Locale;
  const pathname = usePathname(); // without locale prefix
  const t = useTranslations("common");
  return (
    <div role="group" aria-label={t("language")} className="flex items-center gap-1 text-sm">
      {locales.map((l) => (
        <a
          key={l}
          href={localePath(l, pathname)}
          hrefLang={htmlLang[l]}
          lang={htmlLang[l]}
          aria-current={l === current ? "true" : undefined}
          onClick={() => {
            document.cookie = `NEXT_LOCALE=${l}; path=/; max-age=31536000; samesite=lax`;
            if (l !== current) track("language_change", { language: l });
          }}
          className={cn(
            "inline-flex items-center justify-center rounded-[var(--radius-soft)] px-2 font-semibold",
            compact ? "min-h-7 min-w-9 text-[0.8125rem]" : "min-h-11 min-w-11",
            l === current
              ? inverted
                ? "bg-white/15 text-white"
                : "bg-white text-brand-900 ring-1 ring-sage-200"
              : inverted
                ? "text-brand-100 hover:text-white"
                : "text-sage-600 hover:text-brand-700",
          )}
        >
          {localeNames[l]}
        </a>
      ))}
    </div>
  );
}
