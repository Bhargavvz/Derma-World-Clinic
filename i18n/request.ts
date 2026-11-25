import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import en from "../messages/en.json";

type Msgs = Record<string, unknown>;

function deepMerge(base: Msgs, over: Msgs): Msgs {
  const out: Msgs = { ...base };
  for (const [k, v] of Object.entries(over)) {
    const b = out[k];
    out[k] =
      v && typeof v === "object" && !Array.isArray(v) && b && typeof b === "object"
        ? deepMerge(b as Msgs, v as Msgs)
        : v;
  }
  return out;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  const own = locale === "en" ? {} : ((await import(`../messages/${locale}.json`)).default as Msgs);
  // Missing keys fall back to English.
  return { locale, messages: deepMerge(en as Msgs, own), timeZone: "Asia/Kolkata" };
});
