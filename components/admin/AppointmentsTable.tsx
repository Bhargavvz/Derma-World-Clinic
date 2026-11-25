"use client";

import { useMemo, useState, useTransition } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowDownUp, Download, Mail, Phone, Printer, RefreshCw, Trash2, X } from "lucide-react";
import { appointmentStatuses, type Appointment, type AppointmentStatus } from "@/lib/content/types";
import { appointmentStats, appointmentsCsv, emptyFilters, filterAppointments, statusStyles, type Filters } from "@/lib/admin/appointments";
import { formatDateTime, formatYmd, todayIST } from "@/lib/dates";
import { waLink } from "@/lib/whatsapp/messages";
import { deleteAppointment, listAppointments, updateAppointmentStatus } from "@/app/admin/actions";

type SortKey = "createdAt" | "preferredDate" | "name" | "status";
const PAGE_SIZE = 25;

function patientWhatsApp(phone: string): string | null {
  const d = phone.replace(/\D/g, "");
  if (d.length === 10) return `91${d}`;
  return d.length >= 11 && d.length <= 15 ? d : null;
}

function confirmTemplate(a: Appointment) {
  return `Hello ${a.name}, this is Derma World Skin & Hair Clinic. Your appointment for ${a.treatmentName} on ${formatYmd(a.preferredDate)} (${a.preferredTime}) is confirmed. Please reply if you need to change it.`;
}

export function AppointmentsTable({ initial, loadError, isOwner, openId }: { initial: Appointment[]; loadError: boolean; isOwner: boolean; openId: string | null }) {
  const [items, setItems] = useState(initial);
  const [error, setError] = useState<string | null>(loadError ? "Could not load appointments." : null);
  const [rowError, setRowError] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "createdAt", dir: -1 });
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<string | null>(openId);
  const [confirmDelete, setConfirmDelete] = useState<Appointment | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const f = filterAppointments(items, filters);
    if (sort.key === "createdAt" && sort.dir === -1) return f;
    return [...f].sort((a, b) => (a[sort.key] > b[sort.key] ? 1 : a[sort.key] < b[sort.key] ? -1 : 0) * sort.dir);
  }, [items, filters, sort]);
  const stats = useMemo(() => appointmentStats(items), [items]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const view = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const current = items.find((a) => a.id === selected) ?? null;

  const setF = (patch: Partial<Filters>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(0);
  };

  function refresh() {
    startTransition(async () => {
      const res = await listAppointments();
      if (res.ok) {
        setItems(res.data);
        setError(null);
      } else setError("Could not load appointments.");
    });
  }

  async function changeStatus(a: Appointment, status: AppointmentStatus) {
    const prev = a.status;
    setItems((list) => list.map((x) => (x.id === a.id ? { ...x, status } : x))); // optimistic
    setRowError((e) => ({ ...e, [a.id]: "" }));
    const res = await updateAppointmentStatus(a.id, status);
    if (!res.ok) {
      setItems((list) => list.map((x) => (x.id === a.id ? { ...x, status: prev } : x))); // rollback
      setRowError((e) => ({ ...e, [a.id]: "Could not save the new status. Please try again." }));
    } else {
      setItems((list) =>
        list.map((x) => (x.id === a.id ? { ...x, statusHistory: [...x.statusHistory, { status, by: "you", at: new Date().toISOString() }] } : x)),
      );
    }
  }

  function exportCsv() {
    const blob = new Blob([appointmentsCsv(filtered)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `appointments-${todayIST()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <button
      type="button"
      className="inline-flex items-center gap-1 font-semibold"
      onClick={() => setSort((s) => ({ key: k, dir: s.key === k ? ((s.dir * -1) as 1 | -1) : 1 }))}
      aria-label={`Sort by ${label}`}
    >
      {label}
      <ArrowDownUp className="h-3 w-3" aria-hidden="true" />
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold">Appointments</h1>
        <div className="no-print flex flex-wrap gap-2">
          <button type="button" className="btn-secondary" onClick={refresh} disabled={pending}>
            <RefreshCw className={`h-4 w-4 ${pending ? "animate-spin" : ""}`} aria-hidden="true" /> Refresh
          </button>
          <button type="button" className="btn-secondary" onClick={exportCsv}>
            <Download className="h-4 w-4" aria-hidden="true" /> Export CSV
          </button>
          <button type="button" className="btn-secondary" onClick={() => window.print()}>
            <Printer className="h-4 w-4" aria-hidden="true" /> Print
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-2xl bg-red-50 p-3 text-red-700">
          {error}{" "}
          <button type="button" className="underline" onClick={refresh}>
            Retry
          </button>
        </p>
      )}

      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
        {(
          [
            ["Total", stats.total],
            ["Pending", stats.pending],
            ["Confirmed", stats.confirmed],
            ["Cancelled", stats.cancelled],
            ["Completed", stats.completed],
            ["Today", stats.today],
            ["Last 7 days", stats.last7],
            ["Upcoming 7 days", stats.upcoming7],
          ] as [string, number][]
        ).map(([l, n]) => (
          <li key={l} className="rounded-2xl bg-white p-3 shadow-sm">
            <p className="text-xs text-gray-600">{l}</p>
            <p className="text-2xl font-bold text-brand-800">{n}</p>
          </li>
        ))}
      </ul>

      <div className="no-print grid gap-3 rounded-2xl bg-white p-4 shadow-sm md:grid-cols-4">
        <div>
          <label htmlFor="q" className="label">
            Search
          </label>
          <input id="q" className="input" placeholder="Name, email, treatment, notes or phone" value={filters.q} onChange={(e) => setF({ q: e.target.value })} />
        </div>
        <div>
          <label htmlFor="st" className="label">
            Status
          </label>
          <select id="st" className="input" value={filters.status} onChange={(e) => setF({ status: e.target.value as Filters["status"] })}>
            <option value="all">All</option>
            {appointmentStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="from" className="label">
            Preferred date from
          </label>
          <input id="from" type="date" className="input" value={filters.from} onChange={(e) => setF({ from: e.target.value })} />
        </div>
        <div>
          <label htmlFor="to" className="label">
            Preferred date to
          </label>
          <input id="to" type="date" className="input" value={filters.to} onChange={(e) => setF({ to: e.target.value })} />
        </div>
      </div>

      {items.length === 0 && !error ? (
        <p className="rounded-2xl bg-white p-6 text-center text-gray-600">No appointment requests yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Appointment requests</caption>
            <thead className="bg-sage-100 text-gray-900">
              <tr>
                <th className="p-3">
                  <SortBtn k="name" label="Name" />
                </th>
                <th className="p-3">Contact</th>
                <th className="p-3">Treatment</th>
                <th className="p-3">
                  <SortBtn k="preferredDate" label="Preferred" />
                </th>
                <th className="p-3">Notes</th>
                <th className="p-3">
                  <SortBtn k="createdAt" label="Submitted" />
                </th>
                <th className="p-3">
                  <SortBtn k="status" label="Status" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100">
              {view.map((a) => (
                <tr key={a.id} className="align-top">
                  <td className="p-3">
                    <button type="button" className="font-semibold text-brand-700 underline" onClick={() => setSelected(a.id)}>
                      {a.name}
                    </button>
                  </td>
                  <td className="p-3">
                    <a href={`tel:${a.phone.replace(/[^\d+]/g, "")}`} className="block text-brand-700">
                      {a.phone}
                    </a>
                    {a.email && <span className="block break-all text-gray-600">{a.email}</span>}
                  </td>
                  <td className="p-3">{a.treatmentName}</td>
                  <td className="p-3 whitespace-nowrap">
                    {a.preferredDate}
                    <span className="block text-gray-600">{a.preferredTime}</span>
                  </td>
                  <td className="max-w-xs p-3 break-words whitespace-pre-wrap">{a.notes}</td>
                  <td className="p-3 whitespace-nowrap">{a.createdAt ? formatDateTime(a.createdAt) : ""}</td>
                  <td className="p-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${statusStyles[a.status]}`}>{a.status}</span>
                    <label className="sr-only" htmlFor={`s-${a.id}`}>
                      Change status for {a.name}
                    </label>
                    <select id={`s-${a.id}`} className="no-print input mt-2 !min-h-9 !py-1 text-sm" value={a.status} onChange={(e) => changeStatus(a, e.target.value as AppointmentStatus)}>
                      {appointmentStatuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {rowError[a.id] && (
                      <p role="alert" className="error-text">
                        {rowError[a.id]}
                      </p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="no-print flex items-center justify-between p-3 text-sm">
            <span>
              {filtered.length} result{filtered.length === 1 ? "" : "s"} · page {page + 1} of {pages}
            </span>
            <div className="flex gap-2">
              <button type="button" className="btn-secondary !min-h-9 !py-1" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                Previous
              </button>
              <button type="button" className="btn-secondary !min-h-9 !py-1" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)}>
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail drawer */}
      <Dialog.Root open={!!current} onOpenChange={(o) => !o && setSelected(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
          <Dialog.Content className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl">
            {current && (
              <>
                <div className="flex items-start justify-between gap-3">
                  <Dialog.Title className="font-display text-2xl text-brand-900">{current.name}</Dialog.Title>
                  <Dialog.Close className="btn-secondary !px-3" aria-label="Close">
                    <X className="h-4 w-4" aria-hidden="true" />
                  </Dialog.Close>
                </div>
                <Dialog.Description className="text-sm text-gray-600">
                  {current.treatmentName} · {formatYmd(current.preferredDate)} · {current.preferredTime}
                </Dialog.Description>
                <dl className="mt-6 space-y-2 text-sm">
                  {(
                    [
                      ["Phone", current.phone],
                      ["Email", current.email ?? "—"],
                      ["Notes", current.notes ?? "—"],
                      ["Language", current.locale],
                      ["Submitted", current.createdAt ? formatDateTime(current.createdAt) : ""],
                      ["Clinic email", current.notifications.clinicEmail],
                      ["Patient email", current.notifications.patientEmail],
                    ] as [string, string][]
                  ).map(([k, v]) => (
                    <div key={k} className="grid grid-cols-3 gap-2">
                      <dt className="font-semibold">{k}</dt>
                      <dd className="col-span-2 break-words whitespace-pre-wrap">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-6 flex flex-wrap gap-2">
                  <a href={`tel:${current.phone.replace(/[^\d+]/g, "")}`} className="btn-secondary">
                    <Phone className="h-4 w-4" aria-hidden="true" /> Call
                  </a>
                  {patientWhatsApp(current.phone) && (
                    <a href={waLink(patientWhatsApp(current.phone)!, confirmTemplate(current))} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
                      WhatsApp confirmation
                    </a>
                  )}
                  {current.email && (
                    <a href={`mailto:${current.email}`} className="btn-secondary">
                      <Mail className="h-4 w-4" aria-hidden="true" /> Email
                    </a>
                  )}
                </div>
                <h3 className="mt-8 font-sans text-sm font-bold uppercase">Status history</h3>
                <ol className="mt-2 space-y-1 text-sm">
                  {current.statusHistory.map((h, i) => (
                    <li key={i}>
                      <strong>{h.status}</strong> · {h.by} · {formatDateTime(h.at)}
                    </li>
                  ))}
                </ol>
                {isOwner && (
                  <button type="button" className="btn mt-8 border border-red-700 text-red-700 hover:bg-red-50" onClick={() => setConfirmDelete(current)}>
                    <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete request
                  </button>
                )}
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete confirmation (owners only) */}
      <Dialog.Root open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
          <Dialog.Content role="alertdialog" className="fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-6 shadow-xl">
            <Dialog.Title className="text-xl font-semibold">Delete this request?</Dialog.Title>
            <Dialog.Description className="mt-2 text-sm">
              The request from {confirmDelete?.name} will be permanently deleted. This can&apos;t be undone.
            </Dialog.Description>
            <div className="mt-6 flex justify-end gap-2">
              <Dialog.Close className="btn-secondary">Cancel</Dialog.Close>
              <button
                type="button"
                className="btn bg-red-700 text-white hover:bg-red-800"
                onClick={async () => {
                  const a = confirmDelete!;
                  const res = await deleteAppointment(a.id);
                  if (res.ok) {
                    setItems((l) => l.filter((x) => x.id !== a.id));
                    setSelected(null);
                  } else setError("Could not delete the request.");
                  setConfirmDelete(null);
                }}
              >
                Delete
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
