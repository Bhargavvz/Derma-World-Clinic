import { z } from "zod";
import { sanitizeText } from "./sanitize";
import { optionalEmail } from "./appointment";

const text = z.preprocess(sanitizeText, z.string());

export const contactSchema = z
  .object({
    name: text.pipe(z.string().min(1, "nameRequired").min(2, "nameShort").max(100, "nameLong")),
    phone: text
      .pipe(
        z.union([
          z.literal(""),
          z
            .string()
            .max(20, "phone")
            .regex(/^\+?[0-9 ()-]+$/, "phone"),
        ]),
      )
      .refine((v) => {
        if (!v) return true;
        const n = v.replace(/\D/g, "").length;
        return n >= 7 && n <= 15;
      }, "phone"),
    email: optionalEmail,
    message: text.pipe(z.string().min(1, "messageRequired").min(10, "messageShort").max(1000, "messageLong")),
    website: z.string().max(0, "honeypot").optional().default(""),
  })
  .refine((v) => v.phone !== "" || v.email !== "", { message: "phoneOrEmail", path: ["phone"] });

export type ContactInput = z.infer<typeof contactSchema>;
