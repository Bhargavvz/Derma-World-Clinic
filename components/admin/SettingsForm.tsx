"use client";

import { useState, type FormEvent } from "react";
import { saveNotificationSettings, type NotificationSettings } from "@/app/admin/actions";

export function SettingsForm({ initial }: { initial: NotificationSettings }) {
  const [v, setV] = useState(initial);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (v.retentionEnabled && !initial.retentionEnabled) {
      const ok = window.confirm(
        `Turn on automatic deletion? Every day, appointment requests and messages older than ${v.retentionMonths} months will be permanently deleted. This can't be undone.`,
      );
      if (!ok) return;
    }
    const res = await saveNotificationSettings(v);
    setMsg(res.ok ? "Settings saved." : "Could not save settings.");
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-5">
      <h2 className="text-xl font-semibold">Notifications and data retention</h2>
      <label className="flex items-start gap-3">
        <input type="checkbox" className="mt-1 h-5 w-5 accent-brand-700" checked={v.patientStatusEmails} onChange={(e) => setV({ ...v, patientStatusEmails: e.target.checked })} />
        <span>
          Email the patient when a request is set to <strong>confirmed</strong> or <strong>cancelled</strong> (only if they gave an email and email is configured).
        </span>
      </label>
      <fieldset className="space-y-3 rounded-2xl border border-sage-200 p-4">
        <legend className="px-1 font-semibold">Data retention</legend>
        <label className="flex items-start gap-3">
          <input type="checkbox" className="mt-1 h-5 w-5 accent-brand-700" checked={v.retentionEnabled} onChange={(e) => setV({ ...v, retentionEnabled: e.target.checked })} />
          <span>Automatically delete appointment requests and messages older than:</span>
        </label>
        <div className="flex items-center gap-2">
          <label htmlFor="months" className="sr-only">
            Months
          </label>
          <input
            id="months"
            type="number"
            min={1}
            max={120}
            className="input !w-28"
            value={v.retentionMonths}
            onChange={(e) => setV({ ...v, retentionMonths: Math.max(1, Math.min(120, Number(e.target.value) || 1)) })}
          />
          <span>months</span>
        </div>
        <p className="hint">Off until you decide. When on, a daily job deletes old items and records the count in the audit log.</p>
      </fieldset>
      <button type="submit" className="btn-primary">
        Save settings
      </button>
      {msg && (
        <p role="status" className="text-sm text-brand-800">
          {msg}
        </p>
      )}
    </form>
  );
}
