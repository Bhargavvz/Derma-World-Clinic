"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { readConsent, writeConsent, type ConsentValue } from "@/lib/analytics";

const OPEN_EVENT = "dw-open-consent";

/**
 * Consent banner + GA4 loader (Consent Mode v2). Nothing from Google loads
 * before the visitor accepts. Never rendered on /admin.
 */
export function ConsentAndAnalytics({ gaId, nonce }: { gaId: string | null; nonce?: string }) {
  const t = useTranslations("consent");
  const pathname = usePathname();
  const [consent, setConsent] = useState<ConsentValue | null | "unknown">("unknown");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const c = readConsent();
    setConsent(c);
    setOpen(gaId !== null && c === null);
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, [gaId]);

  useEffect(() => {
    if (consent === "granted" && window.gtag) window.gtag("event", "page_view", { page_path: pathname });
  }, [pathname, consent]);

  if (!gaId) return <PrivacyNotice />;

  const choose = (v: ConsentValue) => {
    writeConsent(v);
    setConsent(v);
    setOpen(false);
    if (window.gtag) window.gtag("consent", "update", { analytics_storage: v });
  };

  return (
    <>
      {consent === "granted" && (
        <>
          <Script id="ga-consent" nonce={nonce} strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied'});
gtag('consent','update',{analytics_storage:'granted'});
gtag('js',new Date());gtag('config','${gaId}',{allow_google_signals:false,allow_ad_personalization_signals:false,send_page_view:false});`}
          </Script>
          <Script id="ga-src" nonce={nonce} strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`} />
        </>
      )}
      {open && (
        <section
          aria-label={t("label")}
          className="no-print fixed inset-x-0 bottom-0 z-50 border-t border-sage-200 bg-white p-4 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.2)]"
        >
          <div className="container-page flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-gray-700">
              {t("text")}{" "}
              <Link href="/privacy" className="font-semibold text-brand-700 underline">
                {t("privacy")}
              </Link>
            </p>
            <div className="flex shrink-0 gap-3">
              <button type="button" className="btn-secondary" onClick={() => choose("denied")}>
                {t("reject")}
              </button>
              <button type="button" className="btn-secondary" onClick={() => choose("granted")}>
                {t("accept")}
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

export function CookieSettingsLink({ label }: { label: string }) {
  return (
    <button type="button" className="underline hover:text-white" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}>
      {label}
    </button>
  );
}

const NOTICE_KEY = "dw-privacy-notice-dismissed";

/** Informational notice shown when analytics is not configured (nothing to consent to). */
function PrivacyNotice() {
  const t = useTranslations("privacyNotice");
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      setShow(window.localStorage.getItem(NOTICE_KEY) !== "1");
    } catch {
      setShow(true);
    }
  }, []);
  if (!show) return null;
  return (
    <section aria-label={t("label")} className="no-print fixed inset-x-0 bottom-0 z-50 border-t border-sage-200 bg-white p-4 shadow-lg">
      <div className="container-page flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-700">
          {t("text")}{" "}
          <Link href="/privacy" className="font-semibold text-brand-700 underline">
            {t("privacy")}
          </Link>
        </p>
        <button
          type="button"
          className="btn-primary shrink-0"
          onClick={() => {
            try {
              window.localStorage.setItem(NOTICE_KEY, "1");
            } catch {
              /* ignore */
            }
            setShow(false);
          }}
        >
          {t("ok")}
        </button>
      </div>
    </section>
  );
}
