import type { Metadata } from "next";
import { SITE_URL } from "@/lib/env";
import { locales, ogLocale, htmlLang, type Locale } from "@/i18n/routing";

export function localePath(locale: Locale, path: string): string {
  const p = path === "/" ? "" : path;
  return locale === "en" ? p || "/" : `/${locale}${p}`;
}

export const absolute = (path: string) => `${SITE_URL}${path === "/" ? "" : path}` || SITE_URL;

interface PageMetaInput {
  locale: Locale;
  path: string; // English path, e.g. "/about"
  title: string;
  description: string;
  /** Locales whose content is reviewed (indexable). English always. */
  indexableLocales?: Locale[];
  ogImage?: string;
  noindex?: boolean;
}

export function pageMetadata({ locale, path, title, description, indexableLocales = ["en"], ogImage, noindex }: PageMetaInput): Metadata {
  const languages: Record<string, string> = {};
  for (const l of locales) if (indexableLocales.includes(l)) languages[htmlLang[l]] = absolute(localePath(l, path));
  languages["x-default"] = absolute(path);
  const url = absolute(localePath(locale, path));
  const indexable = !noindex && indexableLocales.includes(locale);
  const image = ogImage ?? "/images/brand/og-image.jpg";
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url, languages },
    robots: indexable ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      type: "website",
      siteName: "Derma World Skin & Hair Clinic",
      locale: ogLocale[locale],
      alternateLocale: indexableLocales.filter((l) => l !== locale).map((l) => ogLocale[l]),
      title,
      description,
      url,
      images: [{ url: image, width: 1200, height: 630, alt: "Derma World Skin & Hair Clinic" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}
