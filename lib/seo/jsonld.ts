import { SITE_URL } from "@/lib/env";
import type { ClinicSettings, Doctor, Treatment } from "@/lib/content/types";

type Json = Record<string, unknown>;

/** Serialize JSON-LD safely for a <script> tag (escapes "<"). */
export function jsonLdString(data: Json | Json[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

const clinicId = `${SITE_URL}/#clinic`;

function postalAddress(c: ClinicSettings) {
  return {
    "@type": "PostalAddress",
    streetAddress: c.address.street,
    addressLocality: c.address.locality,
    addressRegion: c.address.region,
    postalCode: c.address.postalCode,
    addressCountry: c.address.country,
  };
}

export function clinicJsonLd(c: ClinicSettings, treatments: Treatment[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": ["MedicalClinic", "MedicalBusiness"],
    "@id": clinicId,
    name: c.name,
    alternateName: c.alternateNames,
    url: SITE_URL,
    logo: `${SITE_URL}/images/brand/logo-full.png`,
    image: [`${SITE_URL}/images/brand/og-image.jpg`, `${SITE_URL}/images/clinic/hero-reception-900.webp`],
    telephone: c.phones.map((p) => p.tel),
    ...(c.email ? { email: c.email } : {}),
    address: postalAddress(c),
    geo: { "@type": "GeoCoordinates", latitude: c.geo.lat, longitude: c.geo.lng },
    ...(c.mapsPlaceUrl ? { hasMap: c.mapsPlaceUrl } : {}),
    medicalSpecialty: "Dermatology",
    areaServed: c.areasServed.map((name) => ({ "@type": "Place", name })),
    openingHoursSpecification: c.openingHours.flatMap((h) =>
      h.sessions.map(({ open: opens, close: closes }) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: h.schemaDays, opens, closes })),
    ),
    availableService: treatments.map((t) => ({
      "@type": "MedicalProcedure",
      name: t.name.en,
      url: `${SITE_URL}/treatments/${t.slug}`,
    })),
    ...(c.socialLinks.length ? { sameAs: c.socialLinks.map((s) => s.url) } : {}),
  };
}

export function websiteJsonLd(c: ClinicSettings): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: c.name,
    inLanguage: ["en-IN"],
    publisher: { "@id": clinicId },
  };
}

export function physicianJsonLd(d: Doctor, c: ClinicSettings): Json {
  return {
    "@context": "https://schema.org",
    "@type": "IndividualPhysician",
    "@id": `${SITE_URL}/doctor#physician`,
    name: d.name,
    url: `${SITE_URL}/doctor`,
    image: `${SITE_URL}${d.photo.path}`,
    description: `${d.role.en}. ${d.qualificationsShort}.`,
    medicalSpecialty: "Dermatology",
    address: postalAddress(c),
    telephone: c.phones[0]?.tel,
    practicesAt: { "@id": clinicId },
    memberOf: [
      { "@type": "Organization", name: "Indian Association of Dermatologists, Venereologists and Leprologists (IADVL)" },
      { "@type": "Organization", name: "Association of Cutaneous Surgeons of India (ACSI)" },
    ],
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path === "/" ? "" : it.path}` || SITE_URL,
    })),
  };
}

/** Strip simple [label](/path) links to plain text for FAQPage answers. */
export const plainText = (s: string) => s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");

export function faqJsonLd(faqs: { question: string; answer: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: plainText(f.answer) },
    })),
  };
}

/** MedicalWebPage for a treatment page. No claims, ratings or reviewer info: facts the page already shows. */
export function treatmentPageJsonLd(p: { name: string; description: string; path: string; imagePath: string; lang: string }): Json {
  const url = `${SITE_URL}${p.path}`;
  return {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "@id": `${url}#webpage`,
    url,
    name: p.name,
    description: p.description,
    inLanguage: p.lang,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    primaryImageOfPage: { "@type": "ImageObject", url: `${SITE_URL}${p.imagePath}` },
    audience: { "@type": "MedicalAudience", audienceType: "Patient" },
    about: { "@type": "MedicalProcedure", name: p.name, url },
    provider: { "@id": `${SITE_URL}/#clinic` },
  };
}
