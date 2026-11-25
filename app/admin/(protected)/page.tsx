import Link from "next/link";
import { listAppointments, listMessages } from "@/app/admin/actions";
import { appointmentStats } from "@/lib/admin/appointments";
import { addDays, formatYmd, todayIST } from "@/lib/dates";
import { emailConfigured } from "@/lib/email/send";

export const metadata = { title: "Dashboard" };

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const sp = await searchParams;
  const [ap, msgs] = await Promise.all([listAppointments(), listMessages()]);
  const appointments = ap.ok ? ap.data : [];
  const messages = msgs.ok ? msgs.data : [];
  const stats = appointmentStats(appointments);
  const today = todayIST();
  const next7 = appointments
    .filter((a) => a.status !== "cancelled" && a.preferredDate >= today && a.preferredDate <= addDays(today, 7))
    .sort((a, b) => a.preferredDate.localeCompare(b.preferredDate));
  const recent = appointments.slice(0, 50);
  const failedEmails = recent.filter((a) => a.notifications.clinicEmail === "failed" || a.notifications.patientEmail === "failed").length;
  const newMessages = messages.filter((m) => m.status === "new");

  const cards: [string, number][] = [
    ["Submitted today", stats.today],
    ["Last 7 days", stats.last7],
    ["Upcoming (7 days)", stats.upcoming7],
    ["Pending", stats.pending],
    ["Confirmed", stats.confirmed],
    ["New messages", newMessages.length],
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold">Dashboard</h1>
      {sp.denied && (
        <p role="alert" className="rounded-2xl bg-amber-50 p-3 text-amber-800">
          That page is for owners only.
        </p>
      )}
      {!ap.ok && (
        <p role="alert" className="rounded-2xl bg-red-50 p-3 text-red-700">
          Could not load appointments. Please refresh.
        </p>
      )}
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {cards.map(([label, n]) => (
          <li key={label} className="card !p-4">
            <p className="text-sm text-gray-600">{label}</p>
            <p className="font-display text-3xl font-semibold text-brand-800">{n}</p>
          </li>
        ))}
      </ul>

      <section className="card">
        <h2 className="text-xl font-semibold">Today and the next 7 days</h2>
        {next7.length === 0 ? (
          <p className="mt-3 text-gray-600">No requests for the coming week.</p>
        ) : (
          <ul className="mt-4 divide-y divide-sage-100">
            {next7.map((a) => (
              <li key={a.id} className="flex flex-wrap justify-between gap-2 py-2">
                <span>
                  <strong>{formatYmd(a.preferredDate)}</strong> · {a.preferredTime} — {a.name} ({a.treatmentName})
                </span>
                <span className="text-sm text-gray-600">{a.status}</span>
              </li>
            ))}
          </ul>
        )}
        <Link href="/admin/appointments" className="btn-secondary mt-4">
          All appointments
        </Link>
      </section>

      <section className="card">
        <h2 className="text-xl font-semibold">Notification health</h2>
        <p className="mt-2">
          Email notifications: <strong>{emailConfigured() ? "configured" : "not configured"}</strong>
        </p>
        {emailConfigured() && (
          <p className="mt-1 text-sm">
            {failedEmails === 0 ? "No failed emails in the last 50 requests." : `${failedEmails} of the last 50 requests had a failed email. Check the server logs.`}
          </p>
        )}
      </section>
    </div>
  );
}
