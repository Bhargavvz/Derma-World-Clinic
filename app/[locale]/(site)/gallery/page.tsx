import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getGallery } from "@/lib/content/loaders";
import { L, isReviewed } from "@/lib/i18n/localize";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { CtaBanner, TranslationNotice } from "@/components/site/blocks";
import { GalleryGrid } from "@/components/site/GalleryGrid";
import { Breadcrumbs, JsonLd, PageHero } from "@/components/site/primitives";

type Props = { params: Promise<{ locale: Locale }> };

async function indexable() {
  const g = await getGallery();
  return (["en", "te", "hi"] as Locale[]).filter((l) => isReviewed(l, ...g.map((x) => x.reviewStatus)));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "gallery" });
  return pageMetadata({ locale, path: "/gallery", title: t("metaTitle"), description: t("metaDescription"), indexableLocales: await indexable() });
}

export default async function GalleryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const [gallery, idx] = await Promise.all([getGallery(), indexable()]);
  // Only genuine clinic photos — never stock.
  const photos = gallery
    .filter((g) => g.genuine)
    .map((g) => ({
      src: g.image.path,
      alt: L(g.image.alt, locale, g.reviewStatus),
      caption: L(g.caption, locale, g.reviewStatus),
      width: g.image.width,
      height: g.image.height,
    }));

  return (
    <>
      <TranslationNotice show={!idx.includes(locale)} />
      <Breadcrumbs items={[{ name: t("common.home"), href: "/" }, { name: t("gallery.breadcrumb") }]} />
      <PageHero eyebrow={t("gallery.eyebrow")} title={t("gallery.title")} intro={t("gallery.intro")} />
      <section className="section">
        <div className="container-page">
          <GalleryGrid photos={photos} />
        </div>
      </section>
      <CtaBanner />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t("common.home"), path: "/" },
          { name: t("gallery.breadcrumb"), path: "/gallery" },
        ])}
      />
    </>
  );
}
