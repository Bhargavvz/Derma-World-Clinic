/**
 * Consent-gated GA4 helpers (client). Nothing is loaded or sent before consent.
 * Never pass personal data or form contents to track().
 */
export type AnalyticsEvent =
  | "page_view"
  | "booking_submitted"
  | "whatsapp_open"
  | "phone_click"
  | "directions_click"
  | "map_open"
  | "language_change";

export const CONSENT_KEY = "dw-analytics-consent";
export const CONSENT_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 365;
export type ConsentValue = "granted" | "denied";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function readConsent(): ConsentValue | null {
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as { value: ConsentValue; at: number };
    if (Date.now() - v.at > CONSENT_MAX_AGE_MS) return null;
    return v.value === "granted" || v.value === "denied" ? v.value : null;
  } catch {
    return null;
  }
}

export function writeConsent(value: ConsentValue) {
  try {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify({ value, at: Date.now() }));
  } catch {
    /* storage unavailable: banner will show again */
  }
  window.dispatchEvent(new CustomEvent("dw-consent", { detail: value }));
}

const ALLOWED_PARAMS = new Set(["treatment_group", "language", "page_path"]);

export function track(event: AnalyticsEvent, params: Record<string, string> = {}) {
  if (typeof window === "undefined" || !window.gtag) return;
  if (window.location.pathname.startsWith("/admin")) return;
  if (readConsent() !== "granted") return;
  const safe: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) if (ALLOWED_PARAMS.has(k)) safe[k] = v;
  window.gtag("event", event, safe);
}
