import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { jsonLdString } from "@/lib/seo/jsonld";

export function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

export function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className} fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91A9.85 9.85 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.22 8.22 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.2 8.2 0 0 1 8.23 8.25c0 4.54-3.7 8.23-8.23 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.42h-.48a.92.92 0 0 0-.66.31c-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.29Z" />
    </svg>
  );
}

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(data) }} />;
}

export function SrOnly({ children }: { children: ReactNode }) {
  return <span className="sr-only">{children}</span>;
}

export function PageHero({ eyebrow, title, intro, children }: { eyebrow?: string; title: string; intro?: string; children?: ReactNode }) {
  return (
    <section className="border-b border-sage-200 bg-sage-50">
      <div className="container-page pt-10 pb-14 sm:pt-14 sm:pb-20">
        <div className="max-w-3xl animate-rise">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className="text-[2.5rem] leading-[1.08] font-semibold sm:text-[3.5rem]">{title}</h1>
          {intro && <p className="lede mt-6 max-w-2xl">{intro}</p>}
          {children}
        </div>
      </div>
    </section>
  );
}

export function Breadcrumbs({ items, label = "Breadcrumb" }: { items: { name: string; href?: string }[]; label?: string }) {
  return (
    <div className="bg-sage-50">
    <nav aria-label={label} className="container-page pt-6 text-sm text-sage-600">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true" className="text-sage-400">/</span>}
            {it.href ? (
              <Link href={it.href} className="underline-offset-4 hover:text-brand-900 hover:underline">
                {it.name}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-ink">
                {it.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
    </div>
  );
}

export function InfoNote({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "warn" }) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-soft)] border-l-4 p-4 text-[0.9375rem] leading-relaxed",
        tone === "warn" ? "border-amber-500 bg-amber-50 text-amber-900" : "border-rose-400 bg-rose-50 text-ink/85",
      )}
    >
      {children}
    </div>
  );
}

/** Renders simple rich text: paragraphs and [label](/internal-path) links. */
export function RichText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const re = /\[([^\]]+)\]\((\/[^)\s]*)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(
      <Link key={i++} href={m[2]!} className="link">
        {m[1]}
      </Link>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}
