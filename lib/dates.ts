export const TZ = "Asia/Kolkata";

/** Today's date (YYYY-MM-DD) in Asia/Kolkata. */
export function todayIST(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

function parts(ymd: string): [number, number, number] {
  const [y, m, d] = ymd.split("-").map(Number);
  return [y ?? 0, m ?? 0, d ?? 0];
}

export function addDays(ymd: string, days: number): string {
  const [y, m, d] = parts(ymd);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

export function isRealDate(ymd: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return false;
  const [y, m, d] = parts(ymd);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export function isSunday(ymd: string): boolean {
  if (!isRealDate(ymd)) return false;
  const [y, m, d] = parts(ymd);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay() === 0;
}

export const intlLocale = (locale: string) => (locale === "te" ? "te-IN" : locale === "hi" ? "hi-IN" : "en-IN");

/** Format a YYYY-MM-DD date for display, e.g. "Monday, 1 December 2026". */
export function formatYmd(ymd: string, locale = "en"): string {
  if (!isRealDate(ymd)) return ymd;
  const [y, m, d] = parts(ymd);
  return new Intl.DateTimeFormat(intlLocale(locale), {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

export function formatDateTime(iso: string, locale = "en"): string {
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return iso;
  return new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: "medium", timeStyle: "short", timeZone: TZ }).format(dt);
}
