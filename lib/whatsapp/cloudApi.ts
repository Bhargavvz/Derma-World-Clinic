import "server-only";
import { flags } from "@/lib/env";

/**
 * WhatsApp Business Cloud API provider — BUILT BUT DISABLED.
 * Status: planned, not configured. Active only when WHATSAPP_CLOUD_API_ENABLED=true
 * and WHATSAPP_CLOUD_API_TOKEN + WHATSAPP_PHONE_NUMBER_ID are set, with
 * Meta-approved templates. Click-to-chat (wa.me) is unaffected.
 */
export const GRAPH_VERSION = "v21.0";

export function whatsappCloudConfigured(): boolean {
  return flags.whatsappCloudApi && !!process.env.WHATSAPP_CLOUD_API_TOKEN && !!process.env.WHATSAPP_PHONE_NUMBER_ID;
}

export interface TemplateMessage {
  to: string; // E.164 digits, no "+"
  template: string; // approved template name
  languageCode: "en" | "te" | "hi" | "en_US";
  bodyParams: string[];
}

export type SendResult = { status: "sent"; id: string } | { status: "skipped" } | { status: "failed"; error: string };

export function buildTemplatePayload(m: TemplateMessage) {
  return {
    messaging_product: "whatsapp",
    to: m.to,
    type: "template",
    template: {
      name: m.template,
      language: { code: m.languageCode },
      components: m.bodyParams.length
        ? [{ type: "body", parameters: m.bodyParams.map((text) => ({ type: "text", text })) }]
        : [],
    },
  };
}

export async function sendTemplate(m: TemplateMessage, fetchImpl: typeof fetch = fetch): Promise<SendResult> {
  if (!whatsappCloudConfigured()) return { status: "skipped" };
  if (!/^\d{7,15}$/.test(m.to)) return { status: "failed", error: "invalid recipient" };
  try {
    const res = await fetchImpl(`https://graph.facebook.com/${GRAPH_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.WHATSAPP_CLOUD_API_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(buildTemplatePayload(m)),
    });
    const json = (await res.json().catch(() => ({}))) as { messages?: { id: string }[]; error?: { message?: string } };
    if (!res.ok) return { status: "failed", error: json.error?.message ?? `HTTP ${res.status}` };
    return { status: "sent", id: json.messages?.[0]?.id ?? "" };
  } catch (err) {
    return { status: "failed", error: (err as Error).message };
  }
}

/** Webhook-ready: parse status updates from a Cloud API webhook body. */
export function parseWebhookStatuses(body: unknown): { id: string; status: string }[] {
  const out: { id: string; status: string }[] = [];
  const entries = (body as { entry?: { changes?: { value?: { statuses?: { id: string; status: string }[] } }[] }[] })?.entry ?? [];
  for (const e of entries) for (const c of e.changes ?? []) for (const s of c.value?.statuses ?? []) out.push({ id: s.id, status: s.status });
  return out;
}
