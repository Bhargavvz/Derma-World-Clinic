import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { Noto_Sans_Devanagari, Noto_Sans_Telugu, Public_Sans, Spectral } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { htmlLang, routing, type Locale } from "@/i18n/routing";
import { SITE_URL, flags } from "@/lib/env";
import { getClinic, getTreatments } from "@/lib/content/loaders";
import { clinicJsonLd, websiteJsonLd } from "@/lib/seo/jsonld";
import { Header, TopBar } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/blocks";
import { ConsentAndAnalytics } from "@/components/site/ConsentBanner";
import { LanguageSuggestion } from "@/components/site/LanguageSuggestion";
import { JsonLd } from "@/components/site/primitives";
import "../globals.css";

const publicSans = Public_Sans({ subsets: ["latin"], variable: "--font-public", display: "swap" });
const spectral = Spectral({ subsets: ["latin"], weight: ["400", "500", "600", "700"], style: ["normal", "italic"], variable: "--font-spectral", display: "swap" });
const telugu = Noto_Sans_Telugu({ subsets: ["telugu"], variable: "--font-indic", display: "swap", preload: false });
const devanagari = Noto_Sans_Devanagari({ subsets: ["devanagari"], variable: "--font-indic", display: "swap", preload: false });

export const viewport: Viewport = { themeColor: "#184d38", width: "device-width", initialScale: 1 };

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const t = await getTranslations("common");
  const [clinic, treatments] = await Promise.all([getClinic(), getTreatments()]);
  const fontClass = [publicSans.variable, spectral.variable, locale === "te" ? telugu.variable : "", locale === "hi" ? devanagari.variable : ""].join(" ");

  return (
    <html lang={htmlLang[locale as Locale]} className={fontClass}>
      <body className="flex min-h-screen flex-col">
        <a href="#main" className="sr-only z-[60] rounded-lg bg-brand-900 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
          {t("skipToContent")}
        </a>
        <NextIntlClientProvider>
          <TopBar />
          <Header />
          <LanguageSuggestion />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
          <WhatsAppFloat />
          <ConsentAndAnalytics gaId={flags.ga4 ? (process.env.NEXT_PUBLIC_GA4_ID ?? null) : null} nonce={nonce} />
          <div aria-hidden="true" className="h-24 bg-sage-50 sm:h-16" />
        </NextIntlClientProvider>
        <JsonLd data={[clinicJsonLd(clinic, treatments), websiteJsonLd(clinic)]} />
      </body>
    </html>
  );
}
