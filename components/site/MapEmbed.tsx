"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Map } from "lucide-react";
import { track } from "@/lib/analytics";

/** Card with a "Show map" button; Google's iframe loads only after the click. */
export function MapEmbed({ embedUrl, children }: { embedUrl: string | null; children?: ReactNode }) {
  const [shown, setShown] = useState(false);
  const t = useTranslations("map");
  return (
    <div className="card overflow-hidden !p-0">
      {children && <div className="p-6">{children}</div>}
      {embedUrl && (
        <div className="border-t border-sage-100">
          {shown ? (
            <iframe
              src={embedUrl}
              title={t("iframeTitle")}
              className="aspect-[4/3] w-full sm:aspect-video"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          ) : (
            <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 bg-sage-50 p-6 text-center sm:aspect-video">
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setShown(true);
                  track("map_open");
                }}
              >
                <Map className="h-4 w-4" aria-hidden="true" />
                {t("show")}
              </button>
              <p className="max-w-xs text-sm text-gray-600">{t("note")}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
