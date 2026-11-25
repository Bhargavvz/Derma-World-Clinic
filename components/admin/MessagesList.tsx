"use client";

import { useState } from "react";
import type { ContactMessage } from "@/lib/content/types";
import { formatDateTime } from "@/lib/dates";
import { updateMessageStatus } from "@/app/admin/actions";

const STATUSES: ContactMessage["status"][] = ["new", "replied", "archived"];

export function MessagesList({ initial }: { initial: ContactMessage[] }) {
  const [items, setItems] = useState(initial);
  const [show, setShow] = useState<ContactMessage["status"] | "all">("new");
  const [err, setErr] = useState<string | null>(null);
  const view = items.filter((m) => show === "all" || m.status === show);

  async function setStatus(m: ContactMessage, status: ContactMessage["status"]) {
    const prev = m.status;
    setItems((l) => l.map((x) => (x.id === m.id ? { ...x, status } : x)));
    const res = await updateMessageStatus(m.id, status);
    if (!res.ok) {
      setItems((l) => l.map((x) => (x.id === m.id ? { ...x, status: prev } : x)));
      setErr("Could not save. Please try again.");
    }
  }

  return (
    <div className="space-y-4">
      <div role="group" aria-label="Filter messages" className="flex flex-wrap gap-2">
        {(["new", "replied", "archived", "all"] as const).map((s) => (
          <button key={s} type="button" aria-pressed={show === s} className={show === s ? "btn-primary" : "btn-secondary"} onClick={() => setShow(s)}>
            {s} ({s === "all" ? items.length : items.filter((m) => m.status === s).length})
          </button>
        ))}
      </div>
      {err && (
        <p role="alert" className="error-text">
          {err}
        </p>
      )}
      {view.length === 0 ? (
        <p className="rounded-2xl bg-white p-6 text-center text-gray-600">No messages here.</p>
      ) : (
        <ul className="space-y-3">
          {view.map((m) => (
            <li key={m.id} className="card !p-5">
              <div className="flex flex-wrap justify-between gap-2">
                <p className="font-semibold text-gray-900">{m.name}</p>
                <p className="text-sm text-gray-600">{m.createdAt ? formatDateTime(m.createdAt) : ""}</p>
              </div>
              <p className="mt-1 text-sm">
                {m.phone && (
                  <a className="mr-3 text-brand-700" href={`tel:${m.phone.replace(/[^\d+]/g, "")}`}>
                    {m.phone}
                  </a>
                )}
                {m.email && (
                  <a className="break-all text-brand-700" href={`mailto:${m.email}`}>
                    {m.email}
                  </a>
                )}
              </p>
              <p className="mt-3 whitespace-pre-wrap">{m.message}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {STATUSES.filter((s) => s !== m.status).map((s) => (
                  <button key={s} type="button" className="btn-secondary !min-h-9 !py-1" onClick={() => setStatus(m, s)}>
                    Mark {s}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
