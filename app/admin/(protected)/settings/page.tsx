import { requireStaffPage } from "@/lib/auth/session";
import { adminDb } from "@/lib/firebase/admin";
import { flags } from "@/lib/env";
import { emailConfigured } from "@/lib/email/send";
import { whatsappCloudConfigured } from "@/lib/whatsapp/cloudApi";
import { SettingsForm } from "@/components/admin/SettingsForm";
import type { NotificationSettings } from "@/app/admin/actions";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requireStaffPage("owner");
  let current: NotificationSettings = { patientStatusEmails: false, retentionEnabled: false, retentionMonths: 12 };
  try {
    const d = (await adminDb().doc("settings/notifications").get()).data();
    if (d) current = { patientStatusEmails: !!d.patientStatusEmails, retentionEnabled: !!d.retentionEnabled, retentionMonths: Number(d.retentionMonths) || 12 };
  } catch {
    /* defaults */
  }
  const appCheckConfigured = !!process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY;
  const rows: [string, boolean, string][] = [
    ["Email notifications (Resend)", emailConfigured(), "Needs NOTIFY_EMAIL_ENABLED=true, RESEND_API_KEY, a verified EMAIL_FROM domain and CLINIC_NOTIFY_EMAILS."],
    ["WhatsApp Business Cloud API", whatsappCloudConfigured(), "Planned. Needs Meta Business credentials and approved templates."],
    ["Google Analytics 4", flags.ga4, "Needs GA4_ENABLED=true and NEXT_PUBLIC_GA4_ID. Loads only after visitor consent."],
    [
      "Firebase App Check",
      appCheckConfigured,
      flags.appCheckEnforced ? "Enforced on the booking and contact forms." : "Not enforced (APP_CHECK_ENFORCED=false): tokens are not required.",
    ],
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Settings</h1>
      <section className="card">
        <h2 className="text-xl font-semibold">Integrations</h2>
        <ul className="mt-4 divide-y divide-sage-100">
          {rows.map(([name, ok, note]) => (
            <li key={name} className="py-3">
              <p className="font-semibold">
                {name}:{" "}
                <span className={ok ? "text-brand-700" : "text-amber-800"}>{ok ? "configured" : "not configured"}</span>
              </p>
              <p className="text-sm text-gray-600">{note}</p>
            </li>
          ))}
        </ul>
      </section>
      <SettingsForm initial={current} />
    </div>
  );
}
