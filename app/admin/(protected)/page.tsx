import Link from "next/link";
import { ArrowRight, CalendarClock, CalendarDays, Clock3, Inbox, MailCheck, MailWarning, PenLine } from "lucide-react";
import { listAppointments, listMessages } from "@/app/admin/actions";
import { appointmentStats, statusStyles } from "@/lib/admin/appointments";
import { addDays, formatDateTime, formatYmd, todayIST } from "@/lib/dates";
import { emailConfigured } from "@/lib/email/send";

export const metadata = { title: "Dashboard" };

const slot = (t: string) => ["Morning", "Afternoon", "Evening"].indexOf(t);

function greeting() {
  const h = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", hour12: false }).format(new Date()));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const sp = await searchParams;
  const [ap, msgs] = await Promise.all([listAppointments(), listMessages()]);
  const appointments = ap.ok ? ap.data : [];
  const messages = msgs.ok ? msgs.data : [];
  const stats = appointmentStats(appointments);
  const today = todayIST();
  const next7 = appointments
    .filter((a) => a.status !== "cancelled" && a.preferredDate >= today && a.preferredDate <= addDays(today, 7))
    .sort((a, b) => a.preferredDate.localeCompare(b.preferredDate) || slot(a.preferredTime) - slot(b.preferredTime));
  const byDay = Object.entries(
    next7.reduce<Record<string, typeof next7>>((acc, a) => {
      (acc[a.preferredDate] ??= []).push(a);
      return acc;
    }, {}),
  );
  const recent = appointments.slice(0, 50);
  const failedEmails = recent.filter((a) => a.notifications.clinicEmail === "failed" || a.notifications.patientEmail === "failed").length;
  const newMessages = messages.filter((m) => m.status === "new");
  const longDate = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
  const dayLabel = (d: string) => (d === today ? "Today" : d === addDays(today, 1) ? "Tomorrow" : new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${d}T00:00:00Z`)));

  const tiles = [
    { label: "Waiting for confirmation", value: stats.pending, href: "/admin/appointments", icon: Clock3, emphasis: stats.pending > 0 },
    { label: "Visits in the next 7 days", value: stats.upcoming7, href: "/admin/appointments", icon: CalendarDays },
    { label: "Requests today", value: stats.today, href: "/admin/appointments", icon: CalendarClock },
    { label: "New messages", value: newMessages.length, href: "/admin/messages", icon: Inbox, emphasis: newMessages.length > 0 },
  ];

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sage-600">{longDate}</p>
          <h1 className="mt-1 text-[2.25rem] leading-tight font-semibold">{greeting()}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/content" className="btn-secondary">
            <PenLine className="h-4 w-4" aria-hidden="true" /> Edit website
          </Link>
          <Link href="/admin/appointments" className="btn-primary">
            <CalendarDays className="h-4 w-4" aria-hidden="true" /> Appointments
          </Link>
        </div>
      </header>

      {sp.denied && (
        <p role="alert" className="rounded-[var(--radius-soft)] border-l-4 border-amber-500 bg-amber-50 p-4 text-amber-900">
          That page is for owners only.
        </p>
      )}
      {!ap.ok && (
        <p role="alert" className="rounded-[var(--radius-soft)] border-l-4 border-red-600 bg-red-50 p-4 text-red-800">
          Couldn&apos;t load appointments. Refresh the page to try again.
        </p>
      )}

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map(({ label, value, href, icon: Icon, emphasis }) => (
          <li key={label}>
            <Link
              href={href}
              className={`group flex h-full flex-col justify-between gap-6 rounded-[var(--radius-frame)] border p-5 transition-colors ${
                emphasis ? "border-rose-200 bg-rose-50 hover:border-rose-300" : "border-sage-200 bg-white hover:border-sage-300"
              }`}
            >
              <span className="flex items-center justify-between">
                <span className={`flex h-10 w-10 items-center justify-center rounded-full ${emphasis ? "bg-rose-600 text-white" : "bg-sage-100 text-brand-700"}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" strokeWidth={1.75} />
                </span>
                <ArrowRight className="h-4 w-4 text-sage-400 transition-transform group-hover:translate-x-0.5 group-hover:text-rose-600" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-display text-[2.5rem] leading-none font-semibold text-brand-800">{value}</span>
                <span className="mt-2 block text-ink/75">{label}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="rounded-[var(--radius-frame)] border border-sage-200 bg-white">
          <div className="flex items-center justify-between border-b border-sage-200 px-6 py-4">
            <h2 className="text-[1.375rem] font-semibold">This week&apos;s visits</h2>
            <span className="text-sm text-sage-600">
              {stats.confirmed} confirmed · {stats.last7} requests in the last 7 days
            </span>
          </div>
          {byDay.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="font-medium text-ink">No visits requested for the coming week.</p>
              <p className="mt-1 text-sage-600">New requests from the website will appear here.</p>
            </div>
          ) : (
            <ol className="divide-y divide-sage-100">
              {byDay.map(([day, items]) => (
                <li key={day} className="grid gap-3 px-6 py-5 sm:grid-cols-[8rem_1fr]">
                  <p className="font-display text-lg font-semibold text-brand-800">{dayLabel(day)}</p>
                  <ul className="space-y-2">
                    {items.map((a) => (
                      <li key={a.id}>
                        <Link href={`/admin/appointments?id=${a.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-[var(--radius-soft)] px-3 py-2 hover:bg-sage-50">
                          <span className="w-24 text-sm text-sage-600">{a.preferredTime}</span>
                          <span className="flex-1">
                            <span className="font-medium text-ink">{a.name}</span>
                            <span className="text-sage-600"> · {a.treatmentName}</span>
                          </span>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusStyles[a.status]}`}>{a.status}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          )}
        </section>

        <div className="space-y-6">
          <section className="rounded-[var(--radius-frame)] border border-sage-200 bg-white">
            <div className="flex items-center justify-between border-b border-sage-200 px-6 py-4">
              <h2 className="text-[1.375rem] font-semibold">New messages</h2>
              <Link href="/admin/messages" className="text-sm font-semibold text-rose-700 hover:text-rose-800">
                Open inbox
              </Link>
            </div>
            {newMessages.length === 0 ? (
              <p className="px-6 py-8 text-sage-600">No unread messages.</p>
            ) : (
              <ul className="divide-y divide-sage-100">
                {newMessages.slice(0, 4).map((m) => (
                  <li key={m.id} className="px-6 py-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="font-medium text-ink">{m.name}</p>
                      <p className="shrink-0 text-xs text-sage-500">{m.createdAt ? formatDateTime(m.createdAt) : ""}</p>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-ink/70">{m.message}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-[var(--radius-frame)] border border-sage-200 bg-white p-6">
            <h2 className="text-[1.375rem] font-semibold">Email notifications</h2>
            {emailConfigured() ? (
              <p className="mt-3 flex items-start gap-2 text-ink/80">
                {failedEmails === 0 ? (
                  <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
                ) : (
                  <MailWarning className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
                )}
                {failedEmails === 0 ? "Working. No failed emails in the last 50 requests." : `${failedEmails} of the last 50 requests had a failed email. Check the server logs.`}
              </p>
            ) : (
              <p className="mt-3 flex items-start gap-2 text-ink/80">
                <MailWarning className="mt-0.5 h-5 w-5 shrink-0 text-sage-500" aria-hidden="true" />
                Not set up. New requests still appear here, but nobody is emailed about them.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
