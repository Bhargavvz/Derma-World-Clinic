import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { requireStaffPage } from "@/lib/auth/session";
import { listMessages } from "@/app/admin/actions";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { AdminMobileNav, AdminNav, type AdminLink } from "@/components/admin/AdminNav";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const user = await requireStaffPage();
  const msgs = await listMessages();
  const newMessages = msgs.ok ? msgs.data.filter((m) => m.status === "new").length : 0;
  const links: AdminLink[] = [
    { href: "/admin", label: "Dashboard", icon: "dashboard" },
    { href: "/admin/appointments", label: "Appointments", icon: "appointments" },
    { href: "/admin/messages", label: "Messages", icon: "messages", badge: newMessages },
    { href: "/admin/content", label: "Website content", icon: "content" },
    ...(user.role === "owner"
      ? ([
          { href: "/admin/staff", label: "Staff", icon: "staff" },
          { href: "/admin/audit", label: "Audit log", icon: "audit" },
          { href: "/admin/settings", label: "Settings", icon: "settings" },
        ] as AdminLink[])
      : []),
  ];
  const initials = (user.email ?? "?").slice(0, 2).toUpperCase();

  const userBlock = (
    <div className="flex items-center gap-3">
      <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-800">
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink" title={user.email ?? undefined}>
          {user.email}
        </p>
        <p className="text-sm text-sage-600 capitalize">{user.role}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17rem_1fr]">
      {/* Sidebar (desktop) */}
      <aside className="no-print sticky top-0 hidden h-screen flex-col border-r border-sage-200 bg-white lg:flex">
        <Link href="/admin" className="block px-6 pt-6 pb-5">
          <Image src="/images/brand/logo-navbar.webp" alt="Derma World" width={733} height={112} className="h-8 w-auto" priority />
          <span className="mt-2 block text-sm text-sage-600">Clinic admin</span>
        </Link>
        <div className="flex-1 overflow-y-auto px-3">
          <AdminNav links={links} />
        </div>
        <div className="space-y-4 border-t border-sage-200 p-4">
          <a href="/" target="_blank" rel="noopener noreferrer" className="flex min-h-10 items-center gap-2 rounded-[var(--radius-soft)] px-3 text-sm font-medium text-ink/75 hover:bg-sage-100 hover:text-brand-800">
            <ExternalLink className="h-4 w-4" aria-hidden="true" /> View website
          </a>
          {userBlock}
          <SignOutButton />
        </div>
      </aside>

      {/* Top bar (mobile) */}
      <header className="no-print relative flex items-center justify-between gap-3 border-b border-sage-200 bg-white px-4 py-3 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <Image src="/images/brand/logo-navbar.webp" alt="Derma World" width={733} height={112} className="h-7 w-auto" />
        </Link>
        <div className="flex items-center gap-2">
          <SignOutButton compact />
          <AdminMobileNav links={links} />
        </div>
      </header>

      <main className="min-w-0 px-4 py-8 sm:px-8 lg:px-12 lg:py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
