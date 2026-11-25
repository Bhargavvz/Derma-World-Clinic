import { escapeHtml } from "@/lib/validation/sanitize";
import { formatYmd } from "@/lib/dates";

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

const wrap = (title: string, body: string) => `<!doctype html><html><body style="margin:0;background:#f6f8f3;font-family:Arial,Helvetica,sans-serif;color:#374151">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="background:#184d38;color:#ffffff;padding:20px 24px;font-size:18px;font-weight:bold">Derma World Skin &amp; Hair Clinic</td></tr>
<tr><td style="padding:24px"><h1 style="font-size:20px;color:#184d38;margin:0 0 16px">${escapeHtml(title)}</h1>${body}</td></tr>
</table></td></tr></table></body></html>`;

const rows = (pairs: [string, string | null | undefined][]) =>
  `<table role="presentation" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%">${pairs
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="font-weight:bold;vertical-align:top;width:35%;border-bottom:1px solid #ebf0e5">${escapeHtml(k)}</td><td style="border-bottom:1px solid #ebf0e5;white-space:pre-wrap">${escapeHtml(v!)}</td></tr>`,
    )
    .join("")}</table>`;

const textRows = (pairs: [string, string | null | undefined][]) =>
  pairs
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

export interface AppointmentEmailData {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  treatmentName: string;
  preferredDate: string;
  preferredTime: string;
  notes: string | null;
  locale: string;
}

export interface ClinicInfo {
  name: string;
  phones: string[];
  address: string;
  hours: string[];
}

export function clinicAppointmentEmail(a: AppointmentEmailData, adminUrl: string): RenderedEmail {
  const pairs: [string, string | null][] = [
    ["Name", a.name],
    ["Phone", a.phone],
    ["Email", a.email],
    ["Treatment", a.treatmentName],
    ["Preferred date", formatYmd(a.preferredDate)],
    ["Preferred time", a.preferredTime],
    ["Notes", a.notes],
    ["Language", a.locale],
  ];
  return {
    subject: `New appointment request: ${a.name} – ${a.preferredDate}`,
    html: wrap(
      "New appointment request",
      `${rows(pairs)}<p style="margin-top:20px">Status: <strong>pending</strong>. The patient was asked to send the request on WhatsApp too.</p><p><a href="${escapeHtml(adminUrl)}" style="color:#184d38">Open in the admin area</a></p>`,
    ),
    text: `New appointment request\n\n${textRows(pairs)}\n\nOpen in the admin area: ${adminUrl}`,
  };
}

export function patientAppointmentEmail(a: AppointmentEmailData, clinic: ClinicInfo): RenderedEmail {
  const pairs: [string, string | null][] = [
    ["Name", a.name],
    ["Phone", a.phone],
    ["Treatment", a.treatmentName],
    ["Preferred date", formatYmd(a.preferredDate, a.locale)],
    ["Preferred time", a.preferredTime],
    ["Notes", a.notes],
  ];
  const info = `<p><strong>${escapeHtml(clinic.name)}</strong><br>${escapeHtml(clinic.address)}<br>Phone: ${clinic.phones
    .map(escapeHtml)
    .join(", ")}<br>${clinic.hours.map(escapeHtml).join("<br>")}</p>`;
  return {
    subject: "We've received your appointment request – Derma World Skin & Hair Clinic",
    html: wrap(
      "We've received your request",
      `<p>Thank you, ${escapeHtml(a.name)}. Your appointment is <strong>not confirmed yet</strong>; the clinic will contact you to confirm a time.</p>${rows(
        pairs,
      )}<p style="margin-top:20px">If you need to change anything, please call the clinic.</p>${info}<p style="font-size:12px;color:#6b7280">This is an automated message. Please do not include sensitive medical details in replies.</p>`,
    ),
    text: `We've received your request\n\nThank you, ${a.name}. Your appointment is not confirmed yet; the clinic will contact you to confirm a time.\n\n${textRows(
      pairs,
    )}\n\n${clinic.name}\n${clinic.address}\nPhone: ${clinic.phones.join(", ")}\n${clinic.hours.join("\n")}`,
  };
}

export function patientStatusEmail(
  a: AppointmentEmailData,
  status: "confirmed" | "cancelled",
  clinic: ClinicInfo,
): RenderedEmail {
  const title = status === "confirmed" ? "Your appointment is confirmed" : "Your appointment request was cancelled";
  const msg =
    status === "confirmed"
      ? `Your appointment for ${a.treatmentName} on ${formatYmd(a.preferredDate, a.locale)} (${a.preferredTime}) has been confirmed by the clinic.`
      : `Your appointment request for ${a.treatmentName} on ${formatYmd(a.preferredDate, a.locale)} has been cancelled. Please call the clinic if you would like to arrange another time.`;
  return {
    subject: `${title} – Derma World Skin & Hair Clinic`,
    html: wrap(title, `<p>${escapeHtml(msg)}</p><p>${escapeHtml(clinic.address)}<br>Phone: ${clinic.phones.map(escapeHtml).join(", ")}</p>`),
    text: `${title}\n\n${msg}\n\n${clinic.address}\nPhone: ${clinic.phones.join(", ")}`,
  };
}

export function clinicContactEmail(
  m: { id: string; name: string; phone: string | null; email: string | null; message: string; locale: string },
  adminUrl: string,
): RenderedEmail {
  const pairs: [string, string | null][] = [
    ["Name", m.name],
    ["Phone", m.phone],
    ["Email", m.email],
    ["Message", m.message],
    ["Language", m.locale],
  ];
  return {
    subject: `New website message from ${m.name}`,
    html: wrap("New contact message", `${rows(pairs)}<p style="margin-top:20px"><a href="${escapeHtml(adminUrl)}" style="color:#184d38">Open in the admin area</a></p>`),
    text: `New contact message\n\n${textRows(pairs)}\n\nOpen in the admin area: ${adminUrl}`,
  };
}
