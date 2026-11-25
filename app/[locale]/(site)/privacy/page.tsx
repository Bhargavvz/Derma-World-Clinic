import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getClinic } from "@/lib/content/loaders";
import { flags } from "@/lib/env";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { TranslationNotice } from "@/components/site/blocks";
import { Breadcrumbs, JsonLd, PageHero } from "@/components/site/primitives";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  // Legal text is English-only until a reviewed translation exists.
  return pageMetadata({ locale, path: "/privacy", title: t("metaTitle"), description: t("metaDescription"), indexableLocales: ["en"] });
}

/**
 * Privacy policy (DPDP Act 2023 structure from the inventory §7.9),
 * updated for the v2 features: stored contact messages, email notifications,
 * and optional consent-based Google Analytics. NEEDS OWNER/LEGAL REVIEW (see CONTENT_TODO.md).
 */
export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const c = await getClinic();
  const ga = flags.ga4;

  return (
    <>
      <TranslationNotice show={locale !== "en"} />
      <Breadcrumbs items={[{ name: t("common.home"), href: "/" }, { name: t("privacy.breadcrumb") }]} />
      <PageHero title={t("privacy.title")} intro={t("privacy.updated")} />
      <section className="section">
        <div className="container-page prose-clinic max-w-3xl" lang="en-IN">
          <h2>Who we are</h2>
          <p>
            This website belongs to {c.name}, {c.address.lines.join(", ")}. Phone: {c.phones.map((p) => p.display).join(", ")}
            {c.email ? `. Email: ${c.email}` : ""}. In this policy, &quot;we&quot; and &quot;the clinic&quot; mean {c.name}.
          </p>

          <h2>What we collect</h2>
          <ul>
            <li>
              <strong>Appointment requests:</strong> your name, phone number, email (optional), the treatment you are interested in, your preferred date and time,
              any notes you add, and the language you used.
            </li>
            <li>
              <strong>Contact messages:</strong> your name, phone number and/or email, and your message.
            </li>
            <li>
              <strong>WhatsApp:</strong> if you choose to send your request or message on WhatsApp, that conversation is governed by WhatsApp&apos;s own privacy
              policy.
            </li>
            <li>
              <strong>Technical data:</strong> to protect the forms from spam we check that requests come from a real browser (Google reCAPTCHA Enterprise via
              Firebase App Check) and count recent requests using a one-way, scrambled form of your IP address and phone number. Raw IP addresses are not
              stored.
            </li>
          </ul>
          <p>Please don&apos;t include sensitive medical details in the forms. These can be discussed at your consultation.</p>

          <h2>Why we use it</h2>
          <p>
            We use your details only to respond to your request: to arrange, confirm or change an appointment and to reply to your message, including by
            phone, WhatsApp or email. If you give an email address, we send you a copy of your request and, if the clinic chooses, an update when it is
            confirmed or cancelled. We rely on your consent under India&apos;s Digital Personal Data Protection Act, 2023 (DPDP Act), which you give by
            submitting the form. You can withdraw it at any time (see &quot;Your choices and requests&quot;). Your data is not sold and is not used for
            advertising.
          </p>

          <h2>Where it is stored and who can see it</h2>
          <p>
            Requests and messages are stored in Google Firebase (Cloud Firestore). Only authorised clinic staff can see them, after signing in. We use these
            service providers: Google Firebase (storage, sign-in, App Check), Resend (sending notification emails), Vercel (hosting this website), Google Maps
            (only if you choose &quot;Show map&quot;), WhatsApp (only if you choose to use it){ga ? ", and Google Analytics (only if you accept analytics)" : ""}.
            Their servers may be in or outside India.
          </p>

          <h2>How long we keep it</h2>
          <p>
            We keep appointment requests and messages only as long as needed for the purpose above, and then delete them. You can ask us to delete them
            sooner. Medical records from your visit are kept separately at the clinic, as required by law.
          </p>

          <h2>Cookies and tracking</h2>
          {ga ? (
            <p>
              We use Google Analytics to understand how the website is used, <strong>only if you choose &quot;Accept analytics&quot;</strong>. Until then, no
              analytics script is loaded and no analytics cookies are set. Analytics never receives the details you type into forms. Advertising features are
              switched off. You can change your choice at any time with &quot;Cookie settings&quot; at the bottom of every page; your choice is remembered on
              your device for 12 months.
            </p>
          ) : (
            <p>This website does not use advertising or analytics cookies.</p>
          )}
          <p>
            The Google Map is loaded only after you press &quot;Show map&quot;, so Google&apos;s cookies and scripts are not loaded when you simply view a
            page. We store small notes in your browser&apos;s local storage to remember that you dismissed a notice, your analytics choice and your language
            (a <code>NEXT_LOCALE</code> cookie). Clinic staff who sign in to the admin area use a secure session cookie.
          </p>

          <h2>Your choices and requests</h2>
          <p>Under the DPDP Act you have the right to:</p>
          <ul>
            <li>access a summary of the personal data we hold about you;</li>
            <li>have it corrected, completed or updated;</li>
            <li>have it erased;</li>
            <li>withdraw your consent;</li>
            <li>nominate someone to exercise these rights for you; and</li>
            <li>grievance redressal.</li>
          </ul>
          <p>
            To make a request, call the clinic on {c.phones.map((p) => p.display).join(" or ")}
            {c.email ? ` or email ${c.email}` : ""}, or visit the clinic. We may need to confirm your identity first. If you are not satisfied with our
            response, you can complain to the Data Protection Board of India.
          </p>

          <h2>Changes to this policy</h2>
          <p>We may update this policy. The date at the top shows when it last changed.</p>

          <p className="mt-10 rounded-[var(--radius-soft)] bg-sage-50 p-4 text-sm">
            Information on this website is general and is not a substitute for a medical consultation. This website does not provide medical advice. See{" "}
            <Link href="/contact">contact details</Link>.
          </p>
        </div>
      </section>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t("common.home"), path: "/" },
          { name: t("privacy.breadcrumb"), path: "/privacy" },
        ])}
      />
    </>
  );
}
