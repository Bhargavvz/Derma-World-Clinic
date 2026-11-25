"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type Hours = { schemaDays: string[]; sessions: { open: string; close: string }[]; byAppointment?: boolean }[];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Current weekday + minutes in the clinic's time zone (Asia/Kolkata). */
function clinicNow(): { day: number; mins: number } {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", weekday: "long", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return { day: DAYS.indexOf(get("weekday")), mins: (Number(get("hour")) % 24) * 60 + Number(get("minute")) };
}
const toMins = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

type Status = { kind: "open"; until: string; appt: boolean } | { kind: "closed"; nextDay: number; at: string; appt: boolean };

export function computeStatus(hours: Hours, now = clinicNow()): Status | null {
  const sessionsFor = (d: number) => hours.filter((h) => h.schemaDays.includes(DAYS[d]!)).flatMap((h) => h.sessions.map((s) => ({ ...s, appt: !!h.byAppointment })));
  const today = sessionsFor(now.day).sort((a, b) => toMins(a.open) - toMins(b.open));
  const cur = today.find((s) => now.mins >= toMins(s.open) && now.mins < toMins(s.close));
  if (cur) return { kind: "open", until: cur.close, appt: cur.appt };
  const later = today.find((s) => toMins(s.open) > now.mins);
  if (later) return { kind: "closed", nextDay: now.day, at: later.open, appt: later.appt };
  for (let i = 1; i <= 7; i++) {
    const d = (now.day + i) % 7;
    const first = sessionsFor(d).sort((a, b) => toMins(a.open) - toMins(b.open))[0];
    if (first) return { kind: "closed", nextDay: d, at: first.open, appt: first.appt };
  }
  return null;
}

export function OpenStatus({ hours, tone = "light" }: { hours: Hours; tone?: "light" | "dark" }) {
  const t = useTranslations("status");
  const locale = useLocale();
  const [status, setStatus] = useState<Status | null>(null);
  const [today, setToday] = useState(-1);

  useEffect(() => {
    const tick = () => {
      const now = clinicNow();
      setToday(now.day);
      setStatus(computeStatus(hours, now));
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [hours]);

  const fmt = (hhmm: string) =>
    new Intl.DateTimeFormat(locale === "en" ? "en-IN" : `${locale}-IN`, { hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(new Date(Date.UTC(2000, 0, 1, toMins(hhmm) / 60, toMins(hhmm) % 60)));
  const dayName = (d: number) => new Intl.DateTimeFormat(`${locale}-IN`, { weekday: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2023, 0, 1 + d)));

  // Server render / before hydration: a neutral placeholder of the same height.
  if (!status) return <p className="h-7" aria-hidden="true" />;

  const open = status.kind === "open";
  const text = open
    ? t(status.appt ? "openAppt" : "open", { time: fmt(status.until) })
    : status.nextDay === today
      ? t("opensToday", { time: fmt(status.at) })
      : status.nextDay === (today + 1) % 7
        ? t("opensTomorrow", { time: fmt(status.at) })
        : t("opensOn", { day: dayName(status.nextDay), time: fmt(status.at) });

  return (
    <p className={`flex items-center gap-2.5 text-[0.9375rem] font-semibold ${tone === "dark" ? "text-white" : "text-ink"}`} role="status">
      <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
        {open && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-60 motion-reduce:hidden" />}
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${open ? "bg-rose-500" : "bg-sage-400"}`} />
      </span>
      {text}
    </p>
  );
}
