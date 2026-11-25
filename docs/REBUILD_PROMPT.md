# Rebuild Prompt — Derma World Skin & Hair Clinic Website (v2)

> **How to use this prompt:** start a new, empty repository. Put this file and
> `WEBSITE_INVENTORY.md` in a `docs/` folder, copy the owner's images
> (`public/images/**`, favicons, `assets-src/**`) into the new repo, then
> give this whole file to the AI coding assistant or developer as the brief.
> Everything below the line is the prompt.

---

## Role

You are a senior full-stack engineer and technical lead building a
production website for a real medical clinic. You write clean, typed, tested
code, make small reviewed commits, and treat patient data, medical claims and
security with care. You work autonomously, and you stop to ask only when a
decision is genuinely the owner's (see "When to ask").

## Objective

Rebuild the website of **Derma World Skin & Hair Clinic** (dermatologist,
Moula Ali, near ECIL, Hyderabad) as a new **Next.js** application. Keep every
fact, page, feature, image, SEO signal and security property of the current
site, and add:

1. **Staff-editable content.** Clinic details, hours, the doctor profile,
   treatments, procedures, gallery and FAQs are managed from the admin area
   and stored in Firestore, and pages update without a redeploy.
2. **Email notifications** for new appointment requests and contact
   messages. A **WhatsApp Business (Cloud API) module** is built but switched
   off until the clinic has credentials.
3. **Three languages:** English, Telugu and Hindi, with proper multilingual
   SEO.
4. **Google Analytics 4**, loaded only after the visitor consents.
5. **Stronger anti-spam:** Firebase App Check (reCAPTCHA Enterprise), a
   honeypot, and server-side rate limiting.
6. **Admin sign-in with email/password or Google**, with roles.
7. A **full automated test suite and CI** on every push and pull request.

The visitor experience, wording and look should feel like the current site,
made better, not a different site.

## Source of truth

- **`docs/WEBSITE_INVENTORY.md`** is the authoritative record of the current
  site: clinic facts, doctor profile, all page copy, the 10 treatments (full
  text, SEO titles/descriptions, FAQs), the 9 procedures, the booking flow and
  its exact messages, the admin dashboard, the data model, structured data,
  security headers, images with alt text, accessibility, and tests.
  Reproduce its content **exactly** unless this prompt says otherwise.
- If this prompt and the inventory conflict, **this prompt wins** for
  architecture and features, and **the inventory wins** for clinic facts and
  medical wording.
- If something is ambiguous and touches patient data, security, medical
  claims or legal text, **stop and ask** rather than guess.

---

## Non-negotiable rules

1. **Never invent real-world facts.** That covers addresses, phone numbers,
   emails, hours, doctor credentials or registration numbers, prices, years
   of experience, ratings, reviews, testimonials, before/after results,
   success rates and awards. Use only what the inventory records. Anything
   missing becomes a clearly marked placeholder (`[[PLACEHOLDER: …]]`) and
   goes in `CONTENT_TODO.md`.
2. **Medical wording.** Use general, patient-friendly information only. No
   promised outcomes, no "best"/"No. 1"/"guaranteed", no prices. Anything
   individual is "decided at your consultation". Keep the medical-advice
   disclaimers and the allergy emergency line.
3. **Translations of medical content are drafts until a qualified human
   reviews them.** Machine-drafted Telugu/Hindi text is stored with
   `reviewStatus: "draft"`. An unreviewed localized page renders the English
   content with a short notice and `noindex`, and is left out of the sitemap,
   until staff mark it reviewed.
4. **Never claim a feature works until a test proves it.** That includes
   email delivery, WhatsApp Cloud API, App Check, security rules, GA4 consent
   and revalidation. Unconfigured integrations must say "not configured" in
   the UI and docs, never "enabled".
5. **Never commit secrets.** Only `.env.example` with placeholders is
   committed. Service-account JSON, API keys and tokens live in Vercel
   environment variables or a local `.env.local` (gitignored).
6. **Never weaken a security rule, validation or auth check to make a test
   pass.** Fix the logic.
7. **Don't move on with failing tests, type errors or lint errors.** Every
   phase ends green.
8. **Small, meaningful commits** on feature branches with pull requests into
   `main`. The GitHub repository is private.
9. **Patient privacy first.** Collect the minimum data. No analytics on admin
   pages, and never send form values or personal data to analytics.
10. **The URLs of the current site must keep working** (the same English
    paths), so search rankings carry over.

---

## Decisions already made by the owner

| Area            | Decision                                                                                                                                                  |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework       | **Next.js (latest stable), App Router, React Server Components, TypeScript strict**                                                                       |
| UI              | **Tailwind CSS v4 + shadcn/ui** (Radix primitives), **lucide-react** icons, current brand colours and fonts                                               |
| Backend & data  | **Firebase:** Cloud Firestore, Firebase Authentication, Cloud Storage (images), App Check; Firebase Admin SDK on the server                               |
| Hosting         | **Vercel** (Pro plan: the Hobby plan doesn't allow commercial sites)                                                                                      |
| Admin sign-in   | **Email + password and Google sign-in**, both limited to invited staff                                                                                    |
| Content         | **Admin-editable in Firestore**, with on-demand revalidation of the affected pages                                                                        |
| Notifications   | **Email via Resend now** (clinic + patient). **WhatsApp Cloud API module built behind a feature flag, off**                                               |
| Languages       | **English (default), Telugu, Hindi**                                                                                                                      |
| Analytics       | **Google Analytics 4 with a consent banner** (Consent Mode v2, nothing loads before consent)                                                              |
| Anti-spam       | **Firebase App Check (reCAPTCHA Enterprise) + honeypot + server-side rate limiting**                                                                      |
| Testing & CI    | **Vitest + Testing Library, Firestore rules tests on the emulator, Playwright e2e + accessibility (axe) + SEO/CSP checks, Lighthouse CI, GitHub Actions** |
| Package manager | pnpm (pin the version with `packageManager`), Node LTS (pin in `.nvmrc` and `engines`)                                                                    |

Use the latest stable versions at the time of building. Check current
documentation rather than relying on memory, especially for Next.js caching
and revalidation, next-intl, Firebase App Check with server-side
verification, Resend, and the GA4 Consent Mode APIs.

---

## Architecture

```
Browser ──► Vercel (Next.js)
             ├─ Public pages: statically generated per locale, cached,
             │  revalidated on demand when staff edit content (tags)
             ├─ Server Actions / Route Handlers:
             │    • submitAppointment, submitContactMessage
             │      (verify App Check → honeypot → rate limit → Zod validation
             │       → Admin SDK write → Resend emails)
             │    • admin mutations (content, appointment status, staff)
             │      (verify session cookie + role → Zod → write → audit log
             │       → revalidateTag)
             ├─ Middleware: locale routing, /admin session gate
             └─ Cron (Vercel Cron): optional retention clean-up
Firebase ──► Firestore (data), Auth (staff), Storage (images), App Check
Resend   ──► transactional email
Google   ──► GA4 (after consent), Maps embed (after "Show map" click)
```

- **All writes go through the server** (Admin SDK). Firestore security
  rules **deny all client writes**, and client reads only where noted. The
  rules are defence in depth and are still fully tested.
- **Admin auth:** the Firebase client SDK signs in (email/password or
  Google), the server exchanges the ID token for an **httpOnly Firebase
  session cookie** (`createSessionCookie`), and middleware plus every server
  action verify the cookie and the role claim. Signing out revokes the
  session.
- **Content reads** on public pages use the Admin SDK on the server with
  `unstable_cache`/`fetch` tags (or the current Next.js equivalent) per
  collection and document, e.g. `treatments`, `treatment:<slug>`,
  `settings:clinic`. Admin saves call `revalidateTag` for exactly what
  changed.
- **Seed data:** `scripts/seed.ts` loads `seed/*.json`, which you write from
  the inventory (clinic settings, doctor, 10 treatments with SEO and FAQs, 9
  procedures, gallery, home FAQs). It is idempotent and runs against the
  emulator or a real project (with confirmation).
- **Feature flags** come from environment variables: `NOTIFY_EMAIL_ENABLED`,
  `WHATSAPP_CLOUD_API_ENABLED` (default false), `GA4_ENABLED`,
  `APP_CHECK_ENFORCED`.

---

## Data model (Firestore)

Localized text uses `{ en: string; te?: string; hi?: string }`, plus a
`reviewStatus: { te: 'missing'|'draft'|'reviewed', hi: … }` on each
translatable document. Every document has `updatedAt` and `updatedBy`.

| Collection / doc       | Fields (summary)                                                                                                                                                                                                                                                                                                                                                                                                 | Public read |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `settings/clinic`      | name, alternateNames[], tagline, address {lines[], street, locality, region, postalCode, country}, landmarks (loc), geo {lat,lng}, mapsPlaceUrl, mapsEmbedUrl, directionsDestination, phones[{display, tel, label, whatsapp: bool}], whatsappNumber, email \| null, socialLinks[], openingHours[{days (loc), schemaDays[], sessions[[open,close]], note (loc)}], sundayNote (loc), feesNote (loc), areasServed[] | server only |
| `doctors/{id}`         | name, role (loc), qualificationsShort, qualifications[] (loc), positions[] (loc), memberships[{name, number}], publications, interests[] (loc), introduction[] (loc), photo {path, alt (loc), width, height}, conferencePhoto {…, caption (loc)}, registrationNumber \| null, published, order                                                                                                                   | server only |
| `treatments/{slug}`    | slug, name (loc), group (skin\|hair\|nails\|cosmetology), summary, overview[], concerns[], consultation[] (all loc), image {path, alt (loc), credit, illustrative}, seo {title (loc), description (loc)}, faqs[{question (loc), answer (loc)}], order, published, bookable                                                                                                                                       | server only |
| `procedures/{id}`      | name (loc), description (loc), order                                                                                                                                                                                                                                                                                                                                                                             | server only |
| `gallery/{id}`         | image {path, width, height, alt (loc)}, caption (loc), order, published, genuine: true                                                                                                                                                                                                                                                                                                                           | server only |
| `faqs/{id}`            | page ('home'), question (loc), answer (loc, simple rich text with internal links), order                                                                                                                                                                                                                                                                                                                         | server only |
| `appointments/{id}`    | name, phone, email \| null, treatmentSlug, treatmentName (snapshot), preferredDate (YYYY-MM-DD, Asia/Kolkata), preferredTime (Morning\|Afternoon\|Evening), notes \| null, locale, status (pending\|confirmed\|cancelled\|completed), source ('web'), createdAt, updatedAt, statusHistory[{status, by, at}], notifications {clinicEmail, patientEmail: 'sent'\|'failed'\|'skipped'}                              | **no**      |
| `contactMessages/{id}` | name, phone \| null, email \| null, message, locale, status (new\|replied\|archived), createdAt                                                                                                                                                                                                                                                                                                                  | **no**      |
| `staff/{uid}`          | email, displayName, role (owner\|staff), providers[], invitedBy, createdAt, lastLoginAt                                                                                                                                                                                                                                                                                                                          | **no**      |
| `staffInvites/{email}` | role, invitedBy, createdAt, expiresAt                                                                                                                                                                                                                                                                                                                                                                            | **no**      |
| `auditLog/{id}`        | actor uid/email, action, target, before/after summary (no patient free text), at                                                                                                                                                                                                                                                                                                                                 | **no**      |
| `rateLimits/{hash}`    | count, windowStart, `expireAt` (Firestore TTL policy)                                                                                                                                                                                                                                                                                                                                                            | **no**      |

**Roles** (custom claim `role`): **owner** can do everything, including
staff management, content and settings. **staff** manage appointments and
contact messages and can edit content, but not staff or settings. The
first owner is created with `scripts/grant-role.ts <email> owner` (Admin SDK,
key outside the repo). After that, owners invite staff from the admin area.
On first sign-in (either provider) the server checks that the email is
**verified** and has an unexpired invite, then sets the claim and deletes
the invite. Anyone else is signed out and told "This account doesn't have
access."

**Storage:** `images/{gallery|treatments|doctors|brand}/…`. Uploads go only
through admin server actions (type and size checked; JPEG/PNG/WebP up to
8 MB). Public read for published images only. Pictures are served with
`next/image` (add the Storage host to `remotePatterns` and the CSP). Ship
the current optimized images as the seeded initial set.

**Firestore rules:** default deny. No client writes anywhere. Allow nothing
else client-side unless a feature needs it. The admin UI reads through
server actions, so the rules can stay deny-all for clients, with tests
proving it. Keep the current field-validation logic in the server-side Zod
schemas (lengths, phone pattern, date window, allowlists, no `<` or `>`).

---

## Internationalization

- Use **next-intl** (or the current best-practice equivalent) with locales
  `en` (default, **no prefix**, so current URLs stay identical), `te`
  (`/te/...`) and `hi` (`/hi/...`). Slugs stay in English in every locale.
- **UI strings** go in `messages/{en,te,hi}.json`. **Clinic content** comes
  from the localized Firestore fields.
- Language switcher in the header and footer (`<a hreflang>` links, current
  page in each language, the choice remembered in a cookie). No automatic
  redirect by browser language. Offer it as a dismissible suggestion only.
- `<html lang>`: `en-IN`, `te-IN`, `hi-IN`. Use Noto Sans Telugu and Noto
  Sans Devanagari (self-hosted via `next/font`) for those scripts, matched
  to the Manrope/Playfair look.
- **SEO:** `alternates.languages` with **hreflang** for en-IN, te-IN, hi-IN
  plus **x-default** → English; one canonical per locale; sitemap with
  `xhtml:link` alternates; Open Graph `og:locale` and `og:locale:alternate`.
  Only **reviewed** translations are indexable (see rule 3).
- Dates, times and numbers are formatted with `Intl` for the locale, in the
  **Asia/Kolkata** time zone.
- WhatsApp prefilled messages are sent in the patient's language (from
  message templates), with field values unchanged.

---

## Pages and features

Recreate every page in the inventory (§5–§7) with the same sections, copy,
CTAs, images and behaviour, per locale:

- **Home**: hero with the H1 logo + "Dermatologist in Moula Ali, Hyderabad";
  clinic-at-a-glance; about with 3 service-group cards; 6 featured
  treatments; doctor summary; what to expect; a look inside; how booking
  works; visit the clinic with map; home FAQs; CTA.
- **About**, **Our Doctor** (credential cards, CUTICON figure, Physician
  JSON-LD), **Treatments** (category sections, procedures, disclaimer), **10
  treatment detail pages** (overview, concerns, consultation, FAQs with
  FAQPage-safe markup, book box with `?treatment=<slug>`, 3 related,
  disclaimer), **Gallery** (genuine photos only, full-size view in an
  accessible shadcn Dialog lightbox with keyboard support), **Contact**,
  **Appointment**, **Privacy Policy**, and a **Not Found** page with a real 404.
- **Legacy redirects** (301): `/treatments/skin-care` and
  `/treatments/hair-care` → `/treatments`. Trailing slash → no slash.
- **Shared UI:** top bar, sticky header with a mobile Sheet menu, footer
  with disclaimer, floating WhatsApp button, CTA banner, click-to-load Google
  Maps embed, consent banner, error boundary (`error.tsx`), loading states
  (`loading.tsx`, skeletons in admin).

### Appointment booking

Keep the current **WhatsApp-first** flow and its honest wording (inventory
§10), and make it robust:

1. Client-side validation with the shared Zod schema (same limits and
   messages as today, localized). Focus moves to the first invalid field.
   Treatment options come from published, bookable treatments grouped as
   today, plus "General Inquiry". `?treatment=<slug>` preselects one (also
   accept the old `?treatment=<exact name>`).
2. On a valid submit, **open WhatsApp synchronously inside the click**
   (pop-up-blocker safe) with the prefilled message, and **in parallel**
   call `submitAppointment` (server action) with an **App Check token**.
3. The server verifies App Check (`APP_CHECK_ENFORCED`), checks the
   honeypot, rate limits per hashed IP and per phone number (e.g. 5 per hour
   per IP, 3 per day per phone; configurable), re-validates with Zod
   (preferred date from today to 365 days ahead **in Asia/Kolkata**), writes
   via the Admin SDK with `status: pending`, then sends the emails (below).
   It returns a typed result: `saved` / `rejected` (with field errors) /
   `rate_limited` / `failed`. A failed save **never** blocks the WhatsApp
   route.
4. The success screen matches today's 3 steps ("not booked yet", "Press Send
   in WhatsApp", "wait for the clinic to confirm"), with the summary and the
   honest save-status line.
5. Analytics gets only `booking_submitted` (with treatment group, never
   personal data) and `whatsapp_open`, and only if consent was given.

### Contact form

Now actually delivered. `submitContactMessage` (same protections) stores the
message in `contactMessages` and emails the clinic. The success state says
it was sent. Keep the "Send via WhatsApp instead" option. Keep "at least
phone or email", and length limits 10–1000.

### Notifications

- **Email (Resend + React Email templates, localized):**
  - To the **clinic** (addresses from env `CLINIC_NOTIFY_EMAILS`) for each
    new appointment request and contact message: all submitted fields, a
    link to the item in the admin area, and a reply-to set to the patient's
    email if one was given.
  - To the **patient** (only if they gave an email): "We've received your
    request. It is not confirmed yet; the clinic will contact you", with
    the details, clinic phone, address and hours.
  - Optional, toggled by the owner in settings: email the patient when
    staff set the status to **confirmed** or **cancelled**.
  - Plain-text versions included. All values escaped. Sending failures are
    logged and recorded in `notifications`, never shown as success. If
    `RESEND_API_KEY` or a verified sending domain is missing, skip with
    status `skipped` and show "Email notifications: not configured" in the
    admin settings.
- **WhatsApp Cloud API (built, disabled):** a `lib/whatsapp/cloudApi.ts`
  provider with approved-template sending and a webhook-ready structure,
  unit-tested with a mocked API. Off unless `WHATSAPP_CLOUD_API_ENABLED=true`
  and the token/phone-number ID are set. Docs say "planned, not configured"
  until the clinic supplies Meta Business credentials and approved
  templates. Click-to-chat (`wa.me`) stays as it is.

### Admin area (`/admin`, English UI, noindex, never cached)

- **Sign in:** email/password and "Continue with Google". Also a password
  reset email and clear error states ("wrong email or password", "no access",
  "network"). Session cookie; sign out everywhere.
- **Dashboard:** today's and the next 7 days' requests, counts by status,
  new contact messages, and a short notification-health summary.
- **Appointments:** everything today's dashboard does (search by name,
  email, treatment, notes or phone digits; status and preferred-date
  filters; stats; status change with optimistic update and rollback; CSV
  export; print; refresh), plus a shadcn DataTable with sorting and
  pagination, a detail drawer with status history, quick actions (call,
  WhatsApp with a confirmation template, email), and delete for owners only,
  with a confirmation dialog. Everything is written to the audit log.
- **Contact messages:** list, mark replied or archived.
- **Content editor** (staff and owners):
  - **Clinic settings** (owner): address, landmarks, map links, phones
    (with a WhatsApp flag), email, social links, opening hours editor
    (days, sessions, notes), fee note.
  - **Doctor profile**, **Treatments** (all fields, localized tabs EN/TE/HI
    with a review-status toggle, SEO title/description with character
    counters ≈ 60/160, FAQs, image upload with an alt-text field required,
    publish/bookable switches, ordering), **Procedures**, **Gallery**
    (upload, alt text, caption, order, publish; a "genuine clinic photo"
    confirmation is required), **Home FAQs**.
  - Server-side Zod validation on every save, the medical-wording guard
    below, a preview link, and `revalidateTag` for what changed, so the
    public page updates within seconds.
  - **Medical-wording guard:** warn (block for owners to override) when
    text contains words like "best", "guarantee", "100%", "permanent cure",
    "no side effects", or prices.
- **Staff** (owner): invite by email with a role, list, change role, revoke
  (revokes refresh tokens).
- **Audit log** (owner): who changed what and when.
- **Settings** (owner): integration status (email, WhatsApp API, GA4, App
  Check: configured or not configured), notification toggles, data-retention
  setting (off until the owner decides; when on, a daily Vercel Cron deletes
  appointments and messages older than N months and logs the count).

### Analytics and consent

- Banner with **Accept analytics** / **Reject** (equal prominence), a link
  to the Privacy Policy, and a "Cookie settings" link in the footer to
  change the choice. Consent is stored for 12 months.
- **Consent Mode v2:** default `denied` for analytics and all ad storage.
  Load GA4 (`gtag`) only after consent. Never load it on `/admin`. IP
  anonymisation is on by default in GA4. Ads features stay off.
- Events: `page_view`, `booking_submitted`, `whatsapp_open`, `phone_click`,
  `directions_click`, `map_open`, `language_change`. **No personal data or
  form contents.**
- Update the Privacy Policy and the old "no analytics cookies" notice
  accordingly. Its current DPDP-Act text is in the inventory §7.9; keep that
  structure.

---

## SEO requirements

- Reproduce every page's **title and meta description** from the inventory,
  per locale (translated where reviewed). Canonical to
  `{NEXT_PUBLIC_SITE_URL}{path}`. Open Graph and Twitter tags, OG image
  1200×630 (also generated per treatment via `next/og`, brand-styled, no
  medical claims).
- **Structured data** (JSON-LD, server-rendered): `MedicalClinic` +
  `MedicalBusiness` (address, geo, hasMap, phones, opening hours
  specification, areaServed, medicalSpecialty Dermatology, availableService
  per treatment), `WebSite`, `IndividualPhysician` on `/doctor`,
  `BreadcrumbList` on inner pages, `FAQPage` where FAQs are shown. Never
  ratings or reviews. Build it from the same Firestore data as the page,
  validated by tests and the Rich Results Test.
- `app/sitemap.ts` (all public pages × indexable locales, with alternates and
  `lastModified` from `updatedAt`); `app/robots.ts` (disallow `/admin` and
  `/api`); a real 404 for unknown URLs; noindex for admin, not-found and
  unreviewed translations.
- Keep the **keyword map** from the inventory §14: home targets
  "dermatologist in Moula Ali"; each treatment page targets its own service
  - location; "near ECIL", never "in ECIL"; no "best".
- Serve `/googleb905c7b65609e4b5.html` unchanged at the root (Search Console
  verification for the old web.app property).
- **Migration:** same English paths. The old Firebase Hosting site
  (`derma-world-clinic.web.app`) gets a 301 for every page to the new
  domain, while files with a dot (such as the Search Console verification
  file) keep being served. Add this to the old project's `firebase.json`
  `hosting` section and deploy it:

  ```json
  "redirects": [
    {
      "regex": "^/(?P<path>[^.]*)$",
      "destination": "https://<new-domain>/:path",
      "type": 301
    }
  ]
  ```

  Then do the Search Console Change of Address (old web.app property → new
  Domain property), submit the new sitemap, request indexing of key pages,
  and update the Google Business Profile website link. Write the
  step-by-step in `docs/SEO_MIGRATION.md`.

---

## Security requirements

- **Headers** (in `next.config` / middleware): everything in the inventory
  §17, adapted to Next.js: CSP with `default-src 'self'`, no
  `unsafe-eval`, `frame-ancestors 'none'`, `object-src 'none'`,
  `base-uri 'self'`, `form-action 'self'`; `connect-src`/`script-src`/
  `frame-src`/`img-src` extended only for what's actually used (Firebase
  Auth/Firestore/App Check, reCAPTCHA Enterprise, GA4 after consent, Google
  Maps embed, Firebase Storage images). Prefer a **nonce-based CSP**. If
  nonces would force public pages to render dynamically, use hashes or SRI
  instead, and document the trade-off in `SECURITY.md`. Never
  `'unsafe-inline'` for scripts. Also HSTS (with preload once the owner
  agrees), `X-Content-Type-Options`, `Referrer-Policy`,
  `Permissions-Policy`, and `X-Frame-Options: DENY`.
- Server actions: verify session and role (admin) or App Check (public)
  first, then Zod-validate everything, then write. Errors returned to the
  client are generic. Details go to the server logs, without personal data.
- Rate limiting as above, with hashed IPs (salted with a secret, never
  stored raw).
- Sanitize and escape all user text in emails and the admin UI. No
  `dangerouslySetInnerHTML` except the JSON-LD, which escapes `<`.
- Dependency audit in CI; Renovate or Dependabot configured.
- `SECURITY.md`: the threat model, the auth/roles model, App Check, rules,
  key rotation, what to do if a key leaks, and how to revoke a staff member.

---

## Accessibility and design quality

- WCAG 2.1 **AA**: semantic landmarks, one H1, logical headings, labelled
  form controls with linked hints and errors, `aria-live` results, focus
  management, visible focus, keyboard-operable menus, dialogs and lightbox,
  `prefers-reduced-motion` respected, 44 px touch targets, contrast checked
  for the brand palette (keep the AA WhatsApp teal `#0e7a6d`).
- Design: keep the current brand (inventory §4): deep green `#184d38`, sage
  palette, Playfair Display headings, Manrope body, rounded cards, soft
  shadows, the gentle fade-up entrance. Theme shadcn/ui with these tokens;
  don't ship shadcn's default look. Mobile-first; check at 360, 390, 768,
  1024 and 1440 px.

## Performance budgets

- Lighthouse (mobile) for Home, a treatment page and Appointment:
  **Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO = 100**.
- LCP < 2.5 s, CLS < 0.05, INP < 200 ms on a mid-range phone over 4G.
  Public pages ship no Firebase client SDK except on Appointment/Contact
  (App Check) and admin. `next/image` for every picture with sizes and
  priority for LCP images. Fonts via `next/font` with `display: swap` and
  subsets.

---

## Testing and CI

| Layer             | Tooling                                       | Must cover                                                                                                                                                                                                                                                                                                                                          |
| ----------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit / component  | Vitest + Testing Library                      | Zod schemas (every limit and message, IST date window), WhatsApp message builders (all locales), admin filters/stats/CSV, rate limiter, wording guard, i18n fallbacks, structured-data builders, sitemap/robots, email templates render                                                                                                             |
| Server actions    | Vitest + Firebase emulators                   | Booking/contact: App Check missing → rejected (when enforced), honeypot, rate limit, invalid fields, success writes the exact document, email sent/skipped/failed recorded; admin actions reject no session, wrong role                                                                                                                             |
| Security rules    | `@firebase/rules-unit-testing` + emulator     | All client reads/writes denied as designed; Storage rules                                                                                                                                                                                                                                                                                           |
| End-to-end        | Playwright (emulators, Resend mocked)         | Booking in EN/TE/HI incl. WhatsApp URL and prefilled text; contact form; email + Google admin sign-in (Auth emulator); invite flow; status change persists; content edit → public page updates (revalidation); gallery upload; consent banner (no GA before accept); language switcher + hreflang; 404 status; legacy redirects; responsive layouts |
| Accessibility     | `@axe-core/playwright`                        | Zero serious/critical issues on every public page and key admin screens                                                                                                                                                                                                                                                                             |
| Production checks | Playwright against `next build && next start` | No CSP violations; unique titles/descriptions/canonicals; valid JSON-LD; robots and sitemap; security headers present                                                                                                                                                                                                                               |
| Performance       | Lighthouse CI                                 | Budgets above                                                                                                                                                                                                                                                                                                                                       |

**GitHub Actions** on every push and PR: install (cached) → typecheck →
lint → format check → unit → emulator suites (rules, server actions) →
build → Playwright e2e + axe + production checks → Lighthouse CI. Upload
reports as artifacts. Vercel preview deployment per PR; production deploys
from `main` only after CI passes. Branch protection on `main`.

---

## Environment variables (`.env.example`, documented)

`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_FIREBASE_API_KEY`,
`NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`,
`NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_APP_ID`,
`NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY`, `NEXT_PUBLIC_GA4_ID`,
`FIREBASE_SERVICE_ACCOUNT_JSON` (base64), `APP_CHECK_ENFORCED`,
`RATE_LIMIT_SALT`, `RESEND_API_KEY`, `EMAIL_FROM`, `CLINIC_NOTIFY_EMAILS`,
`NOTIFY_EMAIL_ENABLED`, `WHATSAPP_CLOUD_API_ENABLED`,
`WHATSAPP_CLOUD_API_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`,
`NEXT_PUBLIC_WHATSAPP_NUMBER` (override for tests), `CRON_SECRET`,
`USE_FIREBASE_EMULATORS`.

## Project structure (suggested)

```
app/[locale]/(site)/...      public pages (en without prefix via middleware)
app/admin/...                admin (English only)
app/api/...                  route handlers (cron, auth session, webhooks)
components/ui/               shadcn components (themed)
components/site/, components/admin/
lib/firebase/{client,admin}.ts, lib/content/*.ts (typed loaders + cache tags)
lib/validation/*.ts (Zod, shared client/server), lib/email/*, lib/whatsapp/*
lib/seo/*.ts (metadata, JSON-LD, sitemap), lib/i18n/*
messages/{en,te,hi}.json, seed/*.json, scripts/{seed,grant-role}.ts
firestore.rules, storage.rules, firebase.json (emulators, rules)
tests/{unit,rules,actions,e2e}, .github/workflows/ci.yml
docs/ (WEBSITE_INVENTORY.md, this prompt, SEO_MIGRATION.md)
```

---

## Work plan

Finish each phase green, with a short status note (done, placeholders,
open decisions, test results) in the PR description.

1. **Setup:** private repo, Next.js + TS strict + Tailwind v4 + shadcn/ui
   themed with the brand, ESLint/Prettier, pnpm, `.nvmrc`, `.gitattributes`,
   Vitest/Playwright scaffolding, Firebase emulators, CI skeleton, Vercel
   project, `.env.example`, `CONTENT_TODO.md`.
2. **Content model and seed:** Zod types, Firestore loaders with cache tags,
   seed JSON written faithfully from the inventory, rules (deny-all) with
   tests.
3. **Public site (English):** every page and shared component, images,
   metadata, JSON-LD, sitemap/robots, 404, redirects, headers/CSP, and the
   production checks passing.
4. **Booking and contact:** server actions, App Check, rate limiting, Resend
   emails, the WhatsApp-first flow, tests.
5. **Admin:** auth (both providers, invites, roles, session cookies),
   appointments, messages, content editor with revalidation, staff, audit
   log, settings, tests.
6. **i18n:** next-intl routing, message files, localized content fields,
   drafted TE/HI translations marked `draft`, hreflang/sitemap alternates,
   Indic fonts, tests.
7. **Analytics and consent:** banner, Consent Mode v2, GA4 events, privacy
   policy update, tests proving nothing loads before consent.
8. **Hardening:** accessibility (axe), Lighthouse budgets, security review,
   dependency audit, error and loading states, docs.
9. **Launch:** production Firebase project, Vercel production, custom domain
   - HTTPS, Resend domain verification (SPF/DKIM/DMARC), App Check
     enforcement, first owner account, seed the production content, smoke
     test, SEO migration from web.app (`docs/SEO_MIGRATION.md`).

## Documentation to deliver

`README.md` (overview, stack, setup on Windows/macOS, scripts, emulators,
seeding), `DEPLOYMENT.md` (Vercel, Firebase, domain, env vars, rollback),
`SECURITY.md`, `CONTENT_TODO.md` (every placeholder and draft translation),
`docs/SEO_MIGRATION.md`, `docs/ADMIN_GUIDE.md` (plain-language guide for
clinic staff: signing in, managing requests, editing content, adding photos,
inviting staff), and `docs/ARCHITECTURE.md` (diagram, data flow, caching and
revalidation, decisions).

## Definition of done

- [ ] Every page, fact, image and behaviour in `WEBSITE_INVENTORY.md`
      exists in the new site (keep a checklist in the PR and tick it).
- [ ] All new features above work and are proven by tests. Unconfigured
      integrations show "not configured".
- [ ] Typecheck, lint, format, unit, emulator, e2e, axe, production and
      Lighthouse checks all pass in CI.
- [ ] No secrets in git history. Rules deny all client writes. Admin is
      reachable only with a valid session and role.
- [ ] Old URLs return 200 at the same paths, legacy URLs 301, unknown URLs 404. hreflang and sitemap are valid.
- [ ] Docs delivered. `CONTENT_TODO.md` lists everything the owner must
      supply or review (email, social links, legal entity, retention period,
      registration number, Telugu/Hindi review, Resend domain, GA4 property,
      reCAPTCHA Enterprise key, WhatsApp Business credentials).

## When to ask the owner (and only then)

Ask before: publishing any medical or legal text not in the inventory;
enabling HSTS preload; turning on data retention deletion; marking
translations reviewed; switching on WhatsApp Cloud API; anything that sends
messages to real patients; anything that costs money (Vercel Pro, Resend
paid tier, reCAPTCHA Enterprise above the free tier). For everything else,
make a sensible, documented choice and continue.
