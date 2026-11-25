"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTranslations } from "next-intl";

export interface GalleryPhoto {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
}

/** Grid of genuine clinic photos with an accessible lightbox (Esc closes, arrows navigate, focus trapped). */
export function GalleryGrid({ photos, eagerCount = 3 }: { photos: GalleryPhoto[]; eagerCount?: number }) {
  const t = useTranslations("gallery");
  const [index, setIndex] = useState<number | null>(null);
  const go = useCallback((d: number) => setIndex((i) => (i === null ? i : (i + d + photos.length) % photos.length)), [photos.length]);
  const current = index !== null ? photos[index] : null;

  return (
    <>
      <ul className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
        {photos.map((p, i) => (
          <li key={p.src}>
            <figure>
              <button
                type="button"
                onClick={() => setIndex(i)}
                className="group block w-full overflow-hidden rounded-[var(--radius-frame)] bg-sage-100 focus-visible:outline-2"
              >
                <span className="relative block aspect-[9/16]">
                  <Image
                    src={p.src}
                    alt={`${p.alt} — ${t("open")}`}
                    fill
                    sizes="(min-width: 1024px) 33vw, 50vw"
                    priority={i < eagerCount}
                    loading={i < eagerCount ? "eager" : "lazy"}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </span>
              </button>
              <figcaption className="mt-3 text-center text-sm font-semibold text-ink">{p.caption}</figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <Dialog.Root open={index !== null} onOpenChange={(o) => !o && setIndex(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/85" />
          <Dialog.Content
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") go(1);
              if (e.key === "ArrowLeft") go(-1);
            }}
          >
            {current && (
              <>
                <Dialog.Title className="sr-only">{current.caption}</Dialog.Title>
                <Dialog.Description className="sr-only">
                  {t("counter", { current: (index ?? 0) + 1, total: photos.length })}
                </Dialog.Description>
                <div className="relative h-[80vh] w-full max-w-3xl">
                  <Image src={current.src} alt={current.alt} fill sizes="100vw" className="object-contain" />
                </div>
                <p className="mt-3 text-center text-white">
                  {current.caption} · {t("counter", { current: (index ?? 0) + 1, total: photos.length })}
                </p>
                <div className="mt-4 flex gap-3">
                  <button type="button" className="btn-light !px-3" onClick={() => go(-1)} aria-label={t("previous")}>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <Dialog.Close className="btn-light" aria-label={t("close")}>
                    <X className="h-5 w-5" aria-hidden="true" />
                  </Dialog.Close>
                  <button type="button" className="btn-light !px-3" onClick={() => go(1)} aria-label={t("next")}>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
