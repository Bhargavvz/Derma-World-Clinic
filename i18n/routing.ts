import { defineRouting } from "next-intl/routing";

export const locales = ["en", "te", "hi"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  localePrefix: "as-needed",
  // No automatic redirect by browser language (a dismissible suggestion is shown instead).
  localeDetection: false,
  localeCookie: { name: "NEXT_LOCALE", maxAge: 60 * 60 * 24 * 365 },
});

export const htmlLang: Record<Locale, string> = { en: "en-IN", te: "te-IN", hi: "hi-IN" };
export const ogLocale: Record<Locale, string> = { en: "en_IN", te: "te_IN", hi: "hi_IN" };
export const localeNames: Record<Locale, string> = { en: "English", te: "తెలుగు", hi: "हिन्दी" };

export function isLocale(v: string): v is Locale {
  return (locales as readonly string[]).includes(v);
}
