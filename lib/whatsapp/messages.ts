import { formatYmd } from "@/lib/dates";

export const CLINIC_WHATSAPP = "917893171659";

/** Resolve the WhatsApp number: override (tests) → clinic number. Invalid → null (buttons hidden). */
export function resolveWhatsAppNumber(override?: string | null, fallback: string | null = CLINIC_WHATSAPP): string | null {
  const raw = (override ?? "").trim();
  if (!raw || /x|placeholder/i.test(raw)) return fallback && /^\d{7,15}$/.test(fallback) ? fallback : null;
  if (/[^\d+\s()-]/.test(raw)) return null;
  const digits = raw.replace(/\D/g, "");
  return /^\d{7,15}$/.test(digits) ? digits : null;
}

export function waLink(number: string, text: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export interface WaTemplates {
  greeting: string;
  bookIntro: string;
  patientName: string;
  phone: string;
  email: string;
  treatment: string;
  date: string;
  time: string;
  notes: string;
  closing: string;
  times: Record<"Morning" | "Afternoon" | "Evening", string>;
  contactIntro: string;
}

export const enTemplates: WaTemplates = {
  greeting: "Hello Derma World Skin & Hair Clinic,",
  bookIntro: "I would like to book an appointment.",
  patientName: "Patient Name",
  phone: "Phone Number",
  email: "Email",
  treatment: "Treatment",
  date: "Preferred Date",
  time: "Preferred Time",
  notes: "Notes",
  closing: "Please confirm my appointment. Thank you.",
  times: { Morning: "Morning (10 AM – 12 PM)", Afternoon: "Afternoon (12 PM – 5 PM)", Evening: "Evening (5 PM – 10 PM)" },
  contactIntro: "Hello Derma World Skin & Hair Clinic, this is {name}.",
};

export interface BookingDetails {
  name: string;
  phone: string;
  email?: string;
  treatment: string;
  preferredDate: string;
  preferredTime: "Morning" | "Afternoon" | "Evening";
  notes?: string;
}

/** Field values are never translated; only labels follow the patient's language. */
export function buildBookingMessage(d: BookingDetails, t: WaTemplates = enTemplates, locale = "en"): string {
  return [
    t.greeting,
    t.bookIntro,
    "",
    `${t.patientName}: ${d.name}`,
    `${t.phone}: ${d.phone}`,
    ...(d.email ? [`${t.email}: ${d.email}`] : []),
    `${t.treatment}: ${d.treatment}`,
    `${t.date}: ${formatYmd(d.preferredDate, locale)}`,
    `${t.time}: ${t.times[d.preferredTime]}`,
    ...(d.notes ? [`${t.notes}: ${d.notes}`] : []),
    "",
    t.closing,
  ].join("\n");
}

export function buildContactMessage(
  d: { name: string; message: string; phone?: string; email?: string },
  t: WaTemplates = enTemplates,
): string {
  return [
    t.contactIntro.replace("{name}", d.name),
    "",
    d.message,
    ...(d.phone || d.email ? [""] : []),
    ...(d.phone ? [`${t.phone}: ${d.phone}`] : []),
    ...(d.email ? [`${t.email}: ${d.email}`] : []),
  ].join("\n");
}
