import { z } from "zod";

export const localizedSchema = z.object({
  en: z.string().max(5000),
  te: z.string().max(5000).optional(),
  hi: z.string().max(5000).optional(),
});
export type Localized = z.infer<typeof localizedSchema>;

export const reviewStateSchema = z.enum(["missing", "draft", "reviewed"]);
export const reviewStatusSchema = z.object({ te: reviewStateSchema, hi: reviewStateSchema });
export type ReviewStatus = z.infer<typeof reviewStatusSchema>;

const imageSchema = z.object({
  path: z.string().min(1).max(500),
  alt: localizedSchema,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const clinicSettingsSchema = z.object({
  name: z.string().min(1).max(120),
  alternateNames: z.array(z.string().max(120)).max(10),
  tagline: z.string().max(200),
  address: z.object({
    lines: z.array(z.string().max(200)).min(1).max(5),
    street: z.string().max(300),
    locality: z.string().max(100),
    region: z.string().max(100),
    postalCode: z.string().max(20),
    country: z.string().length(2),
  }),
  landmarks: localizedSchema,
  geo: z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }),
  mapsPlaceUrl: z.string().url().nullable(),
  mapsEmbedUrl: z.string().url().nullable(),
  directionsDestination: z.string().max(300),
  phones: z
    .array(
      z.object({
        display: z.string().max(30),
        tel: z.string().regex(/^\+\d{7,15}$/),
        label: localizedSchema,
        whatsapp: z.boolean(),
      }),
    )
    .min(1)
    .max(5),
  whatsappNumber: z.string().regex(/^\d{7,15}$/).nullable(),
  email: z.string().email().nullable(),
  socialLinks: z.array(z.object({ label: z.string().max(50), url: z.string().url() })).max(10),
  openingHours: z
    .array(
      z.object({
        days: localizedSchema,
        schemaDays: z.array(z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"])),
        sessions: z.array(z.object({ open: z.string().regex(/^\d{2}:\d{2}$/), close: z.string().regex(/^\d{2}:\d{2}$/) })),
        display: localizedSchema,
        note: localizedSchema.nullable(),
      }),
    )
    .max(7),
  shortHours: localizedSchema,
  sundayNote: localizedSchema,
  feesNote: localizedSchema,
  areasServed: z.array(z.string().max(100)).max(20),
  reviewStatus: reviewStatusSchema,
});
export type ClinicSettings = z.infer<typeof clinicSettingsSchema>;

export const doctorSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(120),
  role: localizedSchema,
  qualificationsShort: z.string().max(200),
  qualifications: z.array(localizedSchema).max(10),
  positions: z.array(localizedSchema).max(10),
  memberships: z.array(z.object({ name: localizedSchema, number: z.string().max(50) })).max(10),
  publications: z.number().int().min(0).nullable(),
  interestsIntro: localizedSchema,
  interests: z.array(localizedSchema).max(20),
  introduction: z.array(localizedSchema).max(5),
  photo: imageSchema,
  conferencePhoto: imageSchema.extend({ caption: localizedSchema }).nullable(),
  registrationNumber: z.string().max(50).nullable(),
  published: z.boolean(),
  order: z.number().int(),
  reviewStatus: reviewStatusSchema,
});
export type Doctor = z.infer<typeof doctorSchema>;

export const treatmentGroups = ["skin", "hair", "nails", "cosmetology"] as const;
export type TreatmentGroup = (typeof treatmentGroups)[number];

export const treatmentSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/).max(80),
  name: localizedSchema,
  group: z.enum(treatmentGroups),
  summary: localizedSchema,
  overview: z.array(localizedSchema).max(6),
  concerns: z.array(localizedSchema).max(12),
  consultation: z.array(localizedSchema).max(12),
  image: z.object({
    path: z.string().max(500),
    alt: localizedSchema,
    credit: z.string().max(500),
    illustrative: z.boolean(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  }),
  seo: z.object({ title: localizedSchema, description: localizedSchema }),
  faqs: z.array(z.object({ question: localizedSchema, answer: localizedSchema })).max(12),
  order: z.number().int(),
  published: z.boolean(),
  bookable: z.boolean(),
  reviewStatus: reviewStatusSchema,
});
export type Treatment = z.infer<typeof treatmentSchema>;

export const procedureSchema = z.object({
  id: z.string(),
  name: localizedSchema,
  description: localizedSchema,
  order: z.number().int(),
  reviewStatus: reviewStatusSchema,
});
export type Procedure = z.infer<typeof procedureSchema>;

export const galleryItemSchema = z.object({
  id: z.string(),
  image: imageSchema,
  caption: localizedSchema,
  order: z.number().int(),
  published: z.boolean(),
  genuine: z.literal(true),
  reviewStatus: reviewStatusSchema,
});
export type GalleryItem = z.infer<typeof galleryItemSchema>;

export const faqSchema = z.object({
  id: z.string(),
  page: z.literal("home"),
  question: localizedSchema,
  /** Simple rich text: [label](/internal-path) links are allowed. */
  answer: localizedSchema,
  order: z.number().int(),
  reviewStatus: reviewStatusSchema,
});
export type Faq = z.infer<typeof faqSchema>;

export const appointmentStatuses = ["pending", "confirmed", "cancelled", "completed"] as const;
export type AppointmentStatus = (typeof appointmentStatuses)[number];

export interface Appointment {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  treatmentSlug: string;
  treatmentName: string;
  preferredDate: string;
  preferredTime: "Morning" | "Afternoon" | "Evening";
  notes: string | null;
  locale: string;
  status: AppointmentStatus;
  source: "web";
  createdAt: string;
  updatedAt: string;
  statusHistory: { status: AppointmentStatus; by: string; at: string }[];
  notifications: { clinicEmail: NotifyState; patientEmail: NotifyState };
}
export type NotifyState = "sent" | "failed" | "skipped";

export interface ContactMessage {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  message: string;
  locale: string;
  status: "new" | "replied" | "archived";
  createdAt: string;
  notifications?: { clinicEmail: NotifyState };
}

export const staffRoles = ["owner", "staff"] as const;
export type StaffRole = (typeof staffRoles)[number];
