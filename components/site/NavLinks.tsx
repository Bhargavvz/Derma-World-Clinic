"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "./primitives";

export function NavLinks({ items, vertical = false, onNavigate }: { items: { href: string; label: string }[]; vertical?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className={cn("flex", vertical ? "flex-col gap-1" : "items-center gap-1")}>
      {items.map((it) => {
        const active = it.href === "/" ? pathname === "/" : pathname === it.href || pathname.startsWith(`${it.href}/`);
        return (
          <li key={it.href}>
            <Link
              href={it.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center rounded-full px-4 text-sm font-semibold transition-colors",
                vertical && "text-base",
                active ? "bg-brand-50 text-brand-800" : "text-gray-700 hover:bg-sage-50 hover:text-brand-700",
              )}
            >
              {it.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
