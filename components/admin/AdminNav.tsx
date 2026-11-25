"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CalendarDays, FileText, LayoutDashboard, Menu, MessageSquare, ScrollText, Settings, Users, X } from "lucide-react";

const icons = { dashboard: LayoutDashboard, appointments: CalendarDays, messages: MessageSquare, content: FileText, staff: Users, audit: ScrollText, settings: Settings };
export type AdminLink = { href: string; label: string; icon: keyof typeof icons; badge?: number };

function Links({ links, onNavigate }: { links: AdminLink[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className="space-y-1">
      {links.map((l) => {
        const Icon = icons[l.icon];
        const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
        return (
          <li key={l.href}>
            <Link
              href={l.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-11 items-center gap-3 rounded-[var(--radius-soft)] px-3 font-medium transition-colors ${
                active ? "bg-rose-50 text-rose-800" : "text-ink/75 hover:bg-sage-100 hover:text-brand-800"
              }`}
            >
              <Icon className={`h-[1.125rem] w-[1.125rem] ${active ? "text-rose-600" : "text-sage-500"}`} aria-hidden="true" strokeWidth={1.75} />
              <span className="flex-1">{l.label}</span>
              {!!l.badge && (
                <span className="min-w-6 rounded-full bg-rose-600 px-1.5 text-center text-xs leading-5 font-semibold text-white">
                  {l.badge}
                  <span className="sr-only"> new</span>
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function AdminNav({ links }: { links: AdminLink[] }) {
  return (
    <nav aria-label="Admin">
      <Links links={links} />
    </nav>
  );
}

export function AdminMobileNav({ links }: { links: AdminLink[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:hidden">
      <button type="button" className="btn-secondary !min-h-10 !px-3" aria-expanded={open} aria-controls="admin-mobile-nav" onClick={() => setOpen((o) => !o)}>
        {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
      </button>
      {open && (
        <nav id="admin-mobile-nav" aria-label="Admin" className="absolute inset-x-0 top-full z-40 border-b border-sage-200 bg-white p-4 shadow-[0_16px_32px_-16px_rgba(74,31,61,0.25)]">
          <Links links={links} onNavigate={() => setOpen(false)} />
        </nav>
      )}
    </div>
  );
}
