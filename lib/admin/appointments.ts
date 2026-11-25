import type { Appointment, AppointmentStatus } from "@/lib/content/types";
import { addDays, todayIST } from "@/lib/dates";

export interface Filters {
  q: string;
  status: AppointmentStatus | "all";
  from: string;
  to: string;
}

export const emptyFilters: Filters = { q: "", status: "all", from: "", to: "" };

/** Text search (name, email, treatment, notes; phone digits when ≥ 3 digits typed), status and inclusive date range. */
export function filterAppointments(list: Appointment[], f: Filters): Appointment[] {
  const q = f.q.trim().toLowerCase();
  const digits = f.q.replace(/\D/g, "");
  return list
    .filter((a) => {
      if (f.status !== "all" && a.status !== f.status) return false;
      if (f.from && a.preferredDate < f.from) return false;
      if (f.to && a.preferredDate > f.to) return false;
      if (!q) return true;
      const text = [a.name, a.email ?? "", a.treatmentName, a.notes ?? ""].join(" ").toLowerCase();
      if (text.includes(q)) return true;
      return digits.length >= 3 && a.phone.replace(/\D/g, "").includes(digits);
    })
    .sort((x, y) => (y.createdAt > x.createdAt ? 1 : y.createdAt < x.createdAt ? -1 : 0));
}

export function appointmentStats(list: Appointment[], now: Date = new Date()) {
  const today = todayIST(now);
  const weekAgo = addDays(today, -6);
  const weekAhead = addDays(today, 6);
  const createdDay = (a: Appointment) => (a.createdAt ? todayIST(new Date(a.createdAt)) : "");
  return {
    total: list.length,
    pending: list.filter((a) => a.status === "pending").length,
    confirmed: list.filter((a) => a.status === "confirmed").length,
    cancelled: list.filter((a) => a.status === "cancelled").length,
    completed: list.filter((a) => a.status === "completed").length,
    today: list.filter((a) => createdDay(a) === today).length,
    last7: list.filter((a) => createdDay(a) >= weekAgo).length,
    upcoming7: list.filter((a) => a.status !== "cancelled" && a.preferredDate >= today && a.preferredDate <= weekAhead).length,
  };
}

const csvCell = (v: string) => {
  // Neutralise spreadsheet formulas and quote.
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return `"${safe.replace(/"/g, '""')}"`;
};

export function appointmentsCsv(list: Appointment[]): string {
  const header = ["Submitted", "Name", "Phone", "Email", "Treatment", "Preferred date", "Preferred time", "Notes", "Status", "Language"];
  const rows = list.map((a) => [a.createdAt, a.name, a.phone, a.email ?? "", a.treatmentName, a.preferredDate, a.preferredTime, a.notes ?? "", a.status, a.locale]);
  return "﻿" + [header, ...rows].map((r) => r.map((c) => csvCell(String(c))).join(",")).join("\r\n");
}

export const statusStyles: Record<AppointmentStatus, string> = {
  pending: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
  confirmed: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
  cancelled: "bg-red-50 text-red-700 ring-1 ring-red-200",
  completed: "bg-sage-100 text-sage-600 ring-1 ring-sage-200",
};
