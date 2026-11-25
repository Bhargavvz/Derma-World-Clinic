import { z } from "zod";
import { addDays, isRealDate, todayIST } from "@/lib/dates";
import { digitsOnly, sanitizeText } from "./sanitize";

/**
 * Shared (client + server) appointment schema.
 * Error messages are i18n keys under "booking.errors.*".
 */
/** Select value for "General Inquiry". */
export const GENERAL_VALUE = "general";

export const PREFERRED_TIMES = ["Morning", "Afternoon", "Evening"] as const;
export type PreferredTime = (typeof PREFERRED_TIMES)[number];

const text = z.preprocess(sanitizeText, z.string());

export const phoneSchema = text
  .pipe(
    z
      .string()
      .min(1, "phone")
      .max(20, "phone")
      .regex(/^\+?[0-9 ()-]+$/, "phone"),
  )
  .refine((v) => {
    const n = digitsOnly(v).length;
    return n >= 7 && n <= 15;
  }, "phone");

export const optionalEmail = text.pipe(
  z.union([
    z.literal(""),
    z
      .string()
      .max(254, "email")
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "email"),
  ]),
);

export function appointmentSchema(allowedTreatments: readonly string[], now: Date = new Date()) {
  const today = todayIST(now);
  const max = addDays(today, 365);
  return z.object({
    name: text.pipe(z.string().min(1, "nameRequired").min(2, "nameShort").max(100, "nameLong")),
    phone: phoneSchema,
    email: optionalEmail,
    treatment: text.pipe(z.string().min(1, "treatment")).refine((v) => allowedTreatments.includes(v), "treatment"),
    preferredDate: text
      .pipe(z.string().min(1, "dateRequired"))
      .refine(isRealDate, "dateInvalid")
      .refine((v) => v >= today, "datePast")
      .refine((v) => v <= max, "dateFar"),
    preferredTime: z.enum(PREFERRED_TIMES, { errorMap: () => ({ message: "time" }) }),
    notes: text.pipe(z.string().max(500, "notes")),
    website: z.string().max(0, "honeypot").optional().default(""),
  });
}
export type AppointmentInput = z.infer<ReturnType<typeof appointmentSchema>>;

export function dateBounds(now: Date = new Date()) {
  const today = todayIST(now);
  return { min: today, max: addDays(today, 365) };
}

/** Flatten Zod issues to { field: messageKey } (first error per field). */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
