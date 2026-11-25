"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { appointmentSchema, dateBounds, fieldErrors, PREFERRED_TIMES, type PreferredTime } from "@/lib/validation/appointment";
import { isSunday, formatYmd } from "@/lib/dates";
import { buildBookingMessage, waLink, type WaTemplates } from "@/lib/whatsapp/messages";
import { getAppCheckToken, preloadAppCheck } from "@/lib/firebase/client";
import { track } from "@/lib/analytics";
import { submitAppointment, type SubmitResult } from "@/app/actions/public";
import { FormField, HoneypotField, describedBy } from "./FormField";
import { WhatsAppIcon } from "./primitives";

export interface TreatmentOption {
  value: string;
  label: string;
  group: string;
}

interface Props {
  groups: { label: string; options: TreatmentOption[] }[];
  general: TreatmentOption;
  initialTreatment: string;
  whatsappNumber: string | null;
  primaryPhone: { display: string; tel: string };
  sundayNote: string;
  firebaseConfigured: boolean;
}

type Values = {
  name: string;
  phone: string;
  email: string;
  treatment: string;
  preferredDate: string;
  preferredTime: PreferredTime | "";
  notes: string;
  website: string;
};

const FIELD_ORDER = ["name", "phone", "email", "treatment", "preferredDate", "preferredTime", "notes"] as const;

export function BookingForm({ groups, general, initialTreatment, whatsappNumber, primaryPhone, sundayNote, firebaseConfigured }: Props) {
  const t = useTranslations("booking");
  const tw = useTranslations("whatsapp");
  const tf = useTranslations("footer");
  const locale = useLocale();
  const allOptions = useMemo(() => [...groups.flatMap((g) => g.options), general], [groups, general]);
  const [values, setValues] = useState<Values>({
    name: "",
    phone: "",
    email: "",
    treatment: initialTreatment,
    preferredDate: "",
    preferredTime: "",
    notes: "",
    website: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<{ url: string | null; summary: [string, string][] } | null>(null);
  const [save, setSave] = useState<"idle" | "saving" | SubmitResult["status"]>("idle");
  const [bounds, setBounds] = useState<{ min: string; max: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setBounds(dateBounds());
    preloadAppCheck();
  }, []);
  useEffect(() => {
    if (done) headingRef.current?.focus();
  }, [done]);

  const set = (k: keyof Values) => (v: string) => setValues((s) => ({ ...s, [k]: v }));
  const err = (k: string) => (errors[k] ? t(`errors.${errors[k]}`) : undefined);

  const templates: WaTemplates = {
    greeting: tw("greeting"),
    bookIntro: tw("bookIntro"),
    patientName: tw("patientName"),
    phone: tw("phone"),
    email: tw("email"),
    treatment: tw("treatment"),
    date: tw("date"),
    time: tw("time"),
    notes: tw("notes"),
    closing: tw("closing"),
    contactIntro: tw("contactIntro"),
    times: { Morning: t("times.Morning"), Afternoon: t("times.Afternoon"), Evening: t("times.Evening") },
  };

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (values.website) {
      setErrors({ form: "honeypot" });
      return;
    }
    const parsed = appointmentSchema(allOptions.map((o) => o.value)).safeParse(values);
    if (!parsed.success) {
      const fe = fieldErrors(parsed.error);
      setErrors(fe);
      const first = FIELD_ORDER.find((f) => fe[f]);
      if (first) {
        const el = formRef.current?.querySelector<HTMLElement>(first === "preferredTime" ? 'input[name="preferredTime"]' : `#${first}`);
        el?.focus();
      }
      return;
    }
    setErrors({});
    const d = parsed.data;
    const treatment = allOptions.find((o) => o.value === d.treatment)!;
    const message = buildBookingMessage(
      { name: d.name, phone: d.phone, email: d.email || undefined, treatment: treatment.label, preferredDate: d.preferredDate, preferredTime: d.preferredTime, notes: d.notes || undefined },
      templates,
      locale,
    );
    const url = whatsappNumber ? waLink(whatsappNumber, message) : null;

    // 1) Open WhatsApp synchronously inside the click (pop-up-blocker safe, opener nulled).
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
      track("whatsapp_open");
    }
    track("booking_submitted", { treatment_group: treatment.group });

    setDone({
      url,
      summary: [
        [t("name"), d.name],
        [t("phone"), d.phone],
        ...(d.email ? ([[t("email"), d.email]] as [string, string][]) : []),
        [t("treatment"), treatment.label],
        [t("date"), formatYmd(d.preferredDate, locale)],
        [t("time"), t(`times.${d.preferredTime}`)],
        ...(d.notes ? ([[t("notes"), d.notes]] as [string, string][]) : []),
      ],
    });

    // 2) In parallel, best-effort save. A failure never blocks the WhatsApp route.
    setSave("saving");
    void (async () => {
      try {
        const token = await getAppCheckToken();
        const res = await submitAppointment({ ...values }, token, locale);
        setSave(res.status);
      } catch {
        setSave("failed");
      }
    })();
  }

  if (done) {
    return (
      <div className="card" aria-live="polite">
        <CheckCircle2 className="h-10 w-10 text-brand-600" aria-hidden="true" />
        <h2 ref={headingRef} tabIndex={-1} className="mt-4 text-2xl font-semibold focus:outline-none">
          {t("successTitle")}
        </h2>
        <p className="mt-2 font-semibold text-amber-800">{t("successLead")}</p>
        <ol className="mt-6 space-y-3">
          {[t("successStep1"), t("successStep2"), t("successStep3")].map((s, i) => (
            <li key={i} className="flex gap-3">
              <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white">
                {i + 1}
              </span>
              <span className={i === 1 ? "font-semibold text-gray-900" : ""}>{s}</span>
            </li>
          ))}
        </ol>
        <div className="mt-6 flex flex-wrap gap-3">
          {done.url ? (
            <a href={done.url} target="_blank" rel="noopener noreferrer" className="btn-whatsapp" onClick={() => track("whatsapp_open")}>
              <WhatsAppIcon />
              {t("openWhatsApp")}
            </a>
          ) : (
            <a href={`tel:${primaryPhone.tel}`} className="btn-primary">
              <Phone className="h-4 w-4" aria-hidden="true" />
              {primaryPhone.display}
            </a>
          )}
          <button type="button" className="btn-secondary" onClick={() => setDone(null)}>
            {t("editDetails")}
          </button>
        </div>
        <h3 className="mt-8 font-sans text-sm font-bold tracking-wide text-gray-900 uppercase">{t("summary")}</h3>
        <dl className="mt-3 divide-y divide-sage-100 rounded-2xl border border-sage-200">
          {done.summary.map(([k, v]) => (
            <div key={k} className="grid gap-1 p-3 sm:grid-cols-3">
              <dt className="text-sm font-semibold text-gray-900">{k}</dt>
              <dd className="text-sm whitespace-pre-wrap sm:col-span-2">{v}</dd>
            </div>
          ))}
        </dl>
        {firebaseConfigured && save !== "not_configured" && (
          <p
            role="status"
            className={`mt-6 rounded-2xl p-4 text-sm ${
              save === "saved" ? "bg-brand-50 text-brand-800" : save === "saving" || save === "idle" ? "bg-sage-50" : "bg-amber-50 text-amber-800"
            }`}
          >
            {save === "saving" || save === "idle"
              ? t("saving")
              : save === "saved"
                ? t("saved")
                : save === "rate_limited"
                  ? t("rateLimited", { phone: primaryPhone.display })
                  : t("saveFailed", { phone: primaryPhone.display })}
          </p>
        )}
      </div>
    );
  }

  const hasErrors = Object.keys(errors).length > 0;
  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="card relative space-y-5">
      <h2 className="text-2xl font-semibold">{t("formTitle")}</h2>
      {hasErrors && (
        <p role="alert" className="rounded-2xl bg-red-50 p-3 text-sm font-medium text-red-700">
          {errors.form ? t(`errors.${errors.form}`) : t("errorSummary")}
        </p>
      )}
      <FormField id="name" label={t("name")} required requiredLabel={t("required")} error={err("name")}>
        <input
          id="name"
          name="name"
          className="input"
          autoComplete="name"
          maxLength={100}
          value={values.name}
          onChange={(e) => set("name")(e.target.value)}
          aria-invalid={!!errors.name}
          aria-required="true"
          aria-describedby={describedBy("name", false, !!errors.name)}
        />
      </FormField>
      <FormField id="phone" label={t("phone")} required requiredLabel={t("required")} hint={t("phoneHint")} error={err("phone")}>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          className="input"
          autoComplete="tel"
          maxLength={20}
          value={values.phone}
          onChange={(e) => set("phone")(e.target.value)}
          aria-invalid={!!errors.phone}
          aria-required="true"
          aria-describedby={describedBy("phone", true, !!errors.phone)}
        />
      </FormField>
      <FormField id="email" label={t("email")} optionalLabel={t("optional")} error={err("email")}>
        <input
          id="email"
          name="email"
          type="email"
          className="input"
          autoComplete="email"
          maxLength={254}
          value={values.email}
          onChange={(e) => set("email")(e.target.value)}
          aria-invalid={!!errors.email}
          aria-describedby={describedBy("email", false, !!errors.email)}
        />
      </FormField>
      <FormField id="treatment" label={t("treatment")} required requiredLabel={t("required")} error={err("treatment")}>
        <select
          id="treatment"
          name="treatment"
          className="input"
          value={values.treatment}
          onChange={(e) => set("treatment")(e.target.value)}
          aria-invalid={!!errors.treatment}
          aria-required="true"
          aria-describedby={describedBy("treatment", false, !!errors.treatment)}
        >
          <option value="">{t("choose")}</option>
          {groups.map((g) => (
            <optgroup key={g.label} label={g.label}>
              {g.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </optgroup>
          ))}
          <option value={general.value}>{general.label}</option>
        </select>
      </FormField>
      <FormField
        id="preferredDate"
        label={t("date")}
        required
        requiredLabel={t("required")}
        hint={
          <>
            {t("dateHint")}
            {isSunday(values.preferredDate) && <span className="mt-1 block font-medium text-amber-800">{sundayNote}</span>}
          </>
        }
        error={err("preferredDate")}
      >
        <input
          id="preferredDate"
          name="preferredDate"
          type="date"
          className="input"
          min={bounds?.min}
          max={bounds?.max}
          value={values.preferredDate}
          onChange={(e) => set("preferredDate")(e.target.value)}
          aria-invalid={!!errors.preferredDate}
          aria-required="true"
          aria-describedby={describedBy("preferredDate", true, !!errors.preferredDate)}
        />
      </FormField>
      <fieldset aria-describedby={errors.preferredTime ? "preferredTime-error" : undefined}>
        <legend className="label">
          {t("time")}
          <span className="text-red-700" aria-hidden="true">
            {" "}
            *
          </span>
          <span className="sr-only"> ({t("required")})</span>
        </legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {PREFERRED_TIMES.map((time) => (
            <label
              key={time}
              className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-sage-300 px-3 py-2 text-sm has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50"
            >
              <input
                type="radio"
                name="preferredTime"
                value={time}
                checked={values.preferredTime === time}
                onChange={() => set("preferredTime")(time)}
                aria-invalid={!!errors.preferredTime}
                className="h-4 w-4 accent-brand-700"
              />
              {t(`times.${time}`)}
            </label>
          ))}
        </div>
        {errors.preferredTime && (
          <p id="preferredTime-error" className="error-text">
            {err("preferredTime")}
          </p>
        )}
      </fieldset>
      <FormField id="notes" label={t("notes")} optionalLabel={t("optional")} hint={t("notesHint")} error={err("notes")}>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          className="input"
          maxLength={500}
          value={values.notes}
          onChange={(e) => set("notes")(e.target.value)}
          aria-invalid={!!errors.notes}
          aria-describedby={describedBy("notes", true, !!errors.notes)}
        />
      </FormField>
      <HoneypotField value={values.website} onChange={set("website")} />
      <button type="submit" className="btn-whatsapp w-full sm:w-auto">
        <WhatsAppIcon />
        {t("submit")}
      </button>
      <p className="text-sm text-gray-600">
        {t("privacy")}{" "}
        <Link href="/privacy" className="font-semibold text-brand-700 underline">
          {tf("privacy")}
        </Link>
        .
      </p>
    </form>
  );
}
