import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export const metadata = { title: "Page not found | Derma World Skin & Hair Clinic", robots: { index: false, follow: true } };

export default async function NotFound() {
  const t = await getTranslations();
  return (
    <section className="section">
      <div className="container-page max-w-2xl text-center">
        <p className="eyebrow">404</p>
        <h1 className="text-4xl font-semibold">{t("notFound.title")}</h1>
        <p className="mt-4 text-lg">{t("notFound.text")}</p>
        <Link href="/" className="btn-primary mt-8">
          {t("notFound.back")}
        </Link>
        <h2 className="mt-12 font-sans text-sm font-bold tracking-widest uppercase">{t("notFound.helpful")}</h2>
        <ul className="mt-4 flex flex-wrap justify-center gap-3">
          <li>
            <Link href="/treatments" className="btn-secondary">
              {t("nav.treatments")}
            </Link>
          </li>
          <li>
            <Link href="/appointment" className="btn-secondary">
              {t("common.bookAnAppointment")}
            </Link>
          </li>
          <li>
            <Link href="/contact" className="btn-secondary">
              {t("contact.title")}
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}
