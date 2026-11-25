"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { contactSchema } from "@/lib/validation/contact";
import { fieldErrors } from "@/lib/validation/appointment";
import { buildContactMessage, enTemplates, waLink } from "@/lib/whatsapp/messages";
import { getAppCheckToken, preloadAppCheck } from "@/lib/firebase/client";
import { track } from "@/lib/analytics";
import { submitContactMessage, type SubmitResult } from "@/app/actions/public";
import { FormField, HoneypotField, describedBy } from "./FormField";
import { WhatsAppIcon } from "./primitives";

const ORDER = ["name", "phone", "email", "message"] as const;

export function ContactForm({ whatsappNumber }: { whatsappNumber: string | null }) {
  const t = useTranslations("contact");
  const tw = useTranslations("whatsapp");
  const tf = useTranslations("footer");
  const locale = useLocale();
  const [v, setV] = useState({ name: "", phone: "", email: "", message: "", website: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<SubmitResult["status"] | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => preloadAppCheck(), []);
  useEffect(() => {
    if (result) statusRef.current?.focus();
  }, [result]);

  const set = (k: keyof typeof v) => (val: string) => setV((s) => ({ ...s, [k]: val }));
  const err = (k: string) => (errors[k] ? t(`errors.${errors[k]}`) : undefined);
  const waUrl = whatsappNumber
    ? waLink(
        whatsappNumber,
        buildContactMessage(
          { name: v.name.trim(), message: v.message.trim(), phone: v.phone.trim() || undefined, email: v.email.trim() || undefined },
          { ...enTemplates, contactIntro: tw("contactIntro"), phone: tw("phone"), email: tw("email") },
        ),
      )
    : null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (v.website) {
      setErrors({ form: "honeypot" });
      return;
    }
    const parsed = contactSchema.safeParse(v);
    if (!parsed.success) {
      const fe = fieldErrors(parsed.error);
      setErrors(fe);
      const first = ORDER.find((f) => fe[f]);
      if (first) formRef.current?.querySelector<HTMLElement>(`#c-${first}`)?.focus();
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const token = await getAppCheckToken();
      const res = await submitContactMessage({ ...v }, token, locale);
      if (res.status === "rejected") {
        setErrors(res.errors);
      } else {
        setResult(res.status);
      }
    } catch {
      setResult("failed");
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    const sent = result === "saved";
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="card focus:outline-none">
        {sent && <CheckCircle2 className="h-8 w-8 text-brand-600" aria-hidden="true" />}
        <p className={`mt-3 ${sent ? "text-brand-800" : "text-amber-800"}`}>
          {sent ? t("sent") : result === "rate_limited" ? t("rateLimited") : t("sentNotStored")}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {!sent && waUrl && (
            <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp" onClick={() => track("whatsapp_open")}>
              <WhatsAppIcon />
              {t("viaWhatsApp")}
            </a>
          )}
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              if (sent) setV({ name: "", phone: "", email: "", message: "", website: "" });
              setResult(null);
            }}
          >
            {sent ? t("sendAnother") : t("edit")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="card relative space-y-5">
      <h2 className="text-2xl font-semibold">{t("formTitle")}</h2>
      {Object.keys(errors).length > 0 && (
        <p role="alert" className="rounded-2xl bg-red-50 p-3 text-sm font-medium text-red-700">
          {errors.form ? t(`errors.${errors.form}`) : t("errorSummary")}
        </p>
      )}
      <FormField id="c-name" label={t("name")} required error={err("name")}>
        <input
          id="c-name"
          className="input"
          autoComplete="name"
          maxLength={100}
          value={v.name}
          onChange={(e) => set("name")(e.target.value)}
          aria-invalid={!!errors.name}
          aria-required="true"
          aria-describedby={describedBy("c-name", false, !!errors.name)}
        />
      </FormField>
      <p id="c-contact-hint" className="hint !mt-0">
        {t("phoneEmailHint")}
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="c-phone" label={t("phone")} error={err("phone")}>
          <input
            id="c-phone"
            type="tel"
            inputMode="tel"
            className="input"
            autoComplete="tel"
            maxLength={20}
            value={v.phone}
            onChange={(e) => set("phone")(e.target.value)}
            aria-invalid={!!errors.phone}
            aria-describedby={["c-contact-hint", errors.phone ? "c-phone-error" : ""].filter(Boolean).join(" ")}
          />
        </FormField>
        <FormField id="c-email" label={t("email")} error={err("email")}>
          <input
            id="c-email"
            type="email"
            className="input"
            autoComplete="email"
            maxLength={254}
            value={v.email}
            onChange={(e) => set("email")(e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={["c-contact-hint", errors.email ? "c-email-error" : ""].filter(Boolean).join(" ")}
          />
        </FormField>
      </div>
      <FormField id="c-message" label={t("message")} required error={err("message")}>
        <textarea
          id="c-message"
          rows={5}
          className="input"
          maxLength={1000}
          value={v.message}
          onChange={(e) => set("message")(e.target.value)}
          aria-invalid={!!errors.message}
          aria-required="true"
          aria-describedby={describedBy("c-message", false, !!errors.message)}
        />
      </FormField>
      <HoneypotField value={v.website} onChange={set("website")} />
      <div className="flex flex-wrap gap-3">
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? t("sending") : t("send")}
        </button>
        {waUrl && (
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp-outline" onClick={() => track("whatsapp_open")}>
            <WhatsAppIcon />
            {t("viaWhatsApp")}
          </a>
        )}
      </div>
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
