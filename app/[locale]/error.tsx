"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("error");
  useEffect(() => {
    console.error("[page error]", error.digest ?? error.name);
  }, [error]);
  return (
    <section className="section" role="alert">
      <div className="container-page max-w-xl text-center">
        <h1 className="text-3xl font-semibold">{t("title")}</h1>
        <p className="mt-4">{t("text")}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button type="button" className="btn-primary" onClick={reset}>
            {t("retry")}
          </button>
          <a href="tel:+917893171659" className="btn-secondary">
            +91 78931 71659
          </a>
        </div>
      </div>
    </section>
  );
}
