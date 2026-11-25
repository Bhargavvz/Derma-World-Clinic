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
                vertical
                  ? "flex min-h-13 items-center border-b border-sage-100 font-display text-xl font-semibold"
                  : "relative flex min-h-11 items-center px-3 text-[0.9375rem] font-medium whitespace-nowrap transition-colors after:absolute after:inset-x-3 after:bottom-1.5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-rose-500 after:transition-transform after:duration-300 hover:after:scale-x-100",
                active ? (vertical ? "text-rose-700" : "text-brand-900 after:scale-x-100") : vertical ? "text-brand-900" : "text-ink/75 hover:text-brand-900",
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
