import "server-only";
import { Resend } from "resend";
import { flags } from "@/lib/env";
import type { NotifyState } from "@/lib/content/types";
import type { RenderedEmail } from "./templates";

export function emailConfigured(): boolean {
  return flags.notifyEmail && !!process.env.RESEND_API_KEY && !!process.env.EMAIL_FROM;
}

export function clinicRecipients(): string[] {
  return (process.env.CLINIC_NOTIFY_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s));
}

let client: Resend | null = null;

/** Send an email; returns sent/failed/skipped. Never throws. */
export async function sendEmail(to: string[], email: RenderedEmail, replyTo?: string | null): Promise<NotifyState> {
  if (!emailConfigured() || to.length === 0) return "skipped";
  try {
    client ??= new Resend(process.env.RESEND_API_KEY);
    const { error } = await client.emails.send({
      from: process.env.EMAIL_FROM!,
      to,
      subject: email.subject,
      html: email.html,
      text: email.text,
      ...(replyTo ? { replyTo } : {}),
    });
    if (error) {
      console.error("[email] send failed:", error.name);
      return "failed";
    }
    return "sent";
  } catch (err) {
    console.error("[email] send threw:", (err as Error).name);
    return "failed";
  }
}
