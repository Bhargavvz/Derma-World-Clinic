import { notFound } from "next/navigation";

/** Any unknown URL under a locale → real 404 rendered by [locale]/not-found.tsx. */
export default function CatchAll() {
  notFound();
}
