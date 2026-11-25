import type { ReactNode } from "react";
import Link from "next/link";
import { requireStaffPage } from "@/lib/auth/session";
import { SignOutButton } from "@/components/admin/SignOutButton";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const user = await requireStaffPage();
  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/appointments", label: "Appointments" },
    { href: "/admin/messages", label: "Messages" },
    { href: "/admin/content", label: "Content" },
    ...(user.role === "owner"
      ? [
          { href: "/admin/staff", label: "Staff" },
          { href: "/admin/audit", label: "Audit log" },
          { href: "/admin/settings", label: "Settings" },
        ]
      : []),
  ];
  return (
    <>
      <header className="no-print border-b border-brand-800 bg-brand-900 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link href="/admin" className="font-display text-lg">
            Derma World admin
          </Link>
          <nav aria-label="Admin">
            <ul className="flex flex-wrap gap-1 text-sm">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="inline-flex min-h-11 items-center rounded-full px-3 hover:bg-brand-800">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-brand-100">
              {user.email} · {user.role}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </>
  );
}
