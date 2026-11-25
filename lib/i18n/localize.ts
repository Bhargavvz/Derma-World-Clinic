import type { Locale } from "@/i18n/routing";
import type { Localized, ReviewStatus } from "@/lib/content/types";

/** Pick the localized string, falling back to English when missing or not reviewed. */
export function L(text: Localized | null | undefined, locale: Locale, review?: ReviewStatus): string {
  if (!text) return "";
  if (locale === "en") return text.en;
  const value = text[locale];
  if (!value) return text.en;
  if (review && review[locale] !== "reviewed") return text.en;
  return value;
}

/** A localized page is indexable only when every content document on it is reviewed. */
export function isReviewed(locale: Locale, ...reviews: (ReviewStatus | undefined)[]): boolean {
  if (locale === "en") return true;
  return reviews.every((r) => r?.[locale] === "reviewed");
}
