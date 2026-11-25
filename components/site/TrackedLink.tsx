"use client";

import type { AnchorHTMLAttributes } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics";

/** A plain <a> that records a consent-gated analytics event on click (no personal data). */
export function TrackedLink({ event, onClick, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { event: AnalyticsEvent }) {
  return (
    <a
      {...props}
      onClick={(e) => {
        track(event);
        onClick?.(e);
      }}
    />
  );
}
