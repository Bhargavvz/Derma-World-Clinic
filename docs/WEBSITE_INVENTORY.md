# Derma World Skin & Hair Clinic — Complete Website Inventory

**What this is:** a complete record of everything the current website
contains and does: clinic facts, pages, copy, features, images, data, SEO,
security, accessibility, tests and operations. It is the content and
behaviour source for rebuilding the site as a new project (see
`REBUILD_PROMPT.md` in this folder).

**Snapshot:** 2026-11-25, from the `derma-world-clinic` repository (React 19 +
Vite + Firebase), branch `main-ivvbsl`, commit `84fe8f2` plus uncommitted work
(privacy policy text, EC2 deployment, site-URL fix).

**Live today:** https://derma-world-clinic.web.app (Firebase Hosting, project
`derma-world-clinic`).

> **Golden rule carried over from the original project:** never invent
> real-world facts. Every clinic fact below came from the owner (messages,
> visiting card, doctor profile slides, signboard, timings poster, Google
> Maps listing). Anything marked _not supplied_ must stay out of the site, or
> be shown as an obvious placeholder, until the owner provides it.

---

## Contents

1. [Clinic facts](#1-clinic-facts-verified)
2. [Doctor profile](#2-doctor-profile-verified)
3. [Facts not supplied](#3-facts-not-supplied--do-not-invent)
4. [Brand and design system](#4-brand-and-design-system)
5. [Site map and routes](#5-site-map-and-routes)
6. [Global layout and shared UI](#6-global-layout-and-shared-ui)
7. [Page-by-page content](#7-page-by-page-content)
8. [Treatments (full content)](#8-treatments-full-content)
9. [Procedures list](#9-procedures-at-the-clinic)
10. [Appointment booking](#10-appointment-booking-whatsapp-first)
11. [Contact form](#11-contact-form)
12. [Admin area](#12-admin-area)
13. [Data model and security rules](#13-data-model-and-firestore-security-rules)
14. [SEO](#14-seo)
15. [Images and media](#15-images-and-media)
16. [Privacy, compliance and medical wording](#16-privacy-compliance-and-medical-wording)
17. [Security](#17-security)
18. [Accessibility](#18-accessibility)
19. [Performance](#19-performance)
20. [Testing](#20-testing)
21. [Tooling, configuration and operations](#21-tooling-configuration-and-operations)
22. [Open items](#22-open-items-content-todo)

---

## 1. Clinic facts (verified)

| Fact                    | Value                                                                                                                                                                                               | Source / note                                                           |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Name                    | **Derma World Skin & Hair Clinic**                                                                                                                                                                  | Logo, signboard                                                         |
| Alternate names         | Derma World Skin and Hair Clinic; Derma World Clinic                                                                                                                                                | Used in structured data                                                 |
| Logo tagline            | Dermatology, Cosmetology, Hair, Laser                                                                                                                                                               | Logo artwork                                                            |
| Area                    | Moula Ali, Hyderabad (near ECIL)                                                                                                                                                                    | Always "in Moula Ali, **near** ECIL" — never "in ECIL"                  |
| Address (3 lines)       | Above Lucid Diagnostics, Beside More Supermarket / Moula Ali, Near ECIL / Secunderabad, Telangana 500040                                                                                            | Owner's wording, 2026-11-03                                             |
| Address (one line)      | Above Lucid Diagnostics, Beside More Supermarket, Moula Ali, Near ECIL, Secunderabad, Telangana 500040, India                                                                                       |                                                                         |
| Structured address      | streetAddress "Above Lucid Diagnostics, Beside More Supermarket, Moula Ali, Near ECIL"; locality Secunderabad; region Telangana; postal 500040; country IN                                          |                                                                         |
| Landmarks               | Above Lucid Diagnostics, beside More Supermarket, Moula Ali — near ECIL                                                                                                                             |                                                                         |
| Map pin                 | latitude **17.4541174**, longitude **78.5660833**                                                                                                                                                   | Read from the Google Maps listing, 2026-10-29                           |
| Google Maps listing     | https://www.google.com/maps?cid=7322615052301373528                                                                                                                                                 | Listing name: "DERMA WORLD SKIN & HAIR CLINIC (Dr.Sathaiah Sudhamalla)" |
| Maps embed (no API key) | https://www.google.com/maps/embed?pb=!1m3!3m2!1m1!4s7322615052301373528!3m1!1sen!5m1!1sen                                                                                                           | Verified 2026-11-06                                                     |
| Directions link         | `https://www.google.com/maps/dir/?api=1&destination=` + URL-encoded "DERMA WORLD SKIN & HAIR CLINIC (Dr.Sathaiah Sudhamalla), Street Number 1, APHB Colony, Moula Ali, Hyderabad, Telangana 500040" | Resolves to the same listing                                            |
| Primary phone           | **+91 78931 71659** (tel `+917893171659`) — calls **and WhatsApp**                                                                                                                                  | Visiting card; owner confirmed                                          |
| Additional phone        | **+91 95156 43181** (tel `+919515643181`) — **calls only, never WhatsApp**                                                                                                                          | Visiting card; added at owner's request 2026-10-29                      |
| WhatsApp                | +91 78931 71659 → `wa.me/917893171659`                                                                                                                                                              | Owner confirmed 2026-10-29                                              |
| Opening hours           | **Mon–Sat 10:00 AM – 10:00 PM** · **Sunday 10:00 AM – 2:00 PM and 5:00 PM – 10:00 PM, by prior appointment only**                                                                                   | Timings poster; owner confirmed                                         |
| Sunday note             | "Sunday consultations are by prior appointment only, subject to confirmation by the clinic."                                                                                                        |                                                                         |
| Short hours line        | "Mon–Sat 10 AM – 10 PM · Sunday by prior appointment"                                                                                                                                               | Hero, top bar                                                           |
| In-clinic pharmacy      | Yes, at reception                                                                                                                                                                                   | Photos                                                                  |
| Areas served            | Moula Ali, ECIL, Hyderabad, Secunderabad                                                                                                                                                            | Structured data `areaServed`                                            |
| Consultation fees       | Not published: "Please call or message the clinic for current fees."                                                                                                                                |                                                                         |
| Live URL                | https://derma-world-clinic.web.app                                                                                                                                                                  | Custom domain planned                                                   |
| Search Console file     | `/googleb905c7b65609e4b5.html` must be served unchanged at the site root                                                                                                                            | Verifies the web.app property                                           |

**Do not confuse** with similarly named clinics elsewhere (e.g. a "Derma
World" in Rajouri Garden, New Delhi). Never use their listings, photos,
reviews or contacts.

---

## 2. Doctor profile (verified)

| Field                  | Value                                                                                                                                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name                   | **Dr. Sathaiah Sudhamalla**                                                                                                                                                                             |
| Role                   | Consultant Dermatologist & Cosmetologist                                                                                                                                                                |
| Qualifications (short) | **MBBS (Osmania), MD DVL (Gandhi)**                                                                                                                                                                     |
| Qualifications (long)  | MBBS — Osmania; MD in Dermatology, Venereology & Leprosy (DVL) — Gandhi                                                                                                                                 |
| Current positions      | Consultant Dermatologist & Cosmetologist, Derma World Skin & Hair Clinic, Moula Ali · Assistant Professor, Department of DVL (Dermatology, Venereology & Leprosy), Gandhi Medical College, Secunderabad |
| Memberships            | Life Member, Indian Association of Dermatologists, Venereologists and Leprologists (IADVL) — **LM/TS/9586** · Life Member, Association of Cutaneous Surgeons of India (ACSI) — **TS/ACSI/2942/LM**      |
| Publications           | **15**                                                                                                                                                                                                  |
| Special interests      | Clinical dermatology, particularly: Psoriasis; Urticaria; Autoimmune bullous diseases (AIBDs)                                                                                                           |
| Conference photo       | At **CUTICON Telangana** (dermatology conference), second from left                                                                                                                                     |
| Registration number    | _Not supplied — never shown_                                                                                                                                                                            |

**Introduction (exact copy, 2 paragraphs):**

1. "Dr. Sathaiah Sudhamalla is a Consultant Dermatologist & Cosmetologist at
   Derma World Skin & Hair Clinic, Moula Ali, and an Assistant Professor in
   the Department of DVL (Dermatology, Venereology & Leprosy) at Gandhi
   Medical College, Secunderabad."
2. "Each consultation starts with understanding your concern and examining
   your skin, hair, scalp or nails, followed by a clear explanation of the
   options suited to you — so you can make an informed decision about your
   care."

No years of experience, awards, ratings or claims beyond these materials.

---

## 3. Facts not supplied — do not invent

- Contact **email** (email rows are hidden until supplied)
- **Social media** links
- Doctor's **medical council registration number**
- **Legal entity** name/registration (privacy policy)
- Exact **Firestore region**; fixed **data-retention period**
- **Consultation fees / prices**
- **Ratings, reviews, testimonials, before/after photos** (none shown; only
  ever with written patient consent and no implied guarantees)
- **Custom domain** (not chosen yet)
- WhatsApp Business API (WABA) credentials

---

## 4. Brand and design system

### Logos (owner-supplied)

| Asset                                            | Size (px)                                                               | Use                                                     |
| ------------------------------------------------ | ----------------------------------------------------------------------- | ------------------------------------------------------- |
| `/images/brand/logo-full.webp` / `.png`          | 402×96                                                                  | Full logo with tagline (footer, inverted variant)       |
| `/images/brand/logo-hero-640.webp`, `-1100.webp` | 1186×272 intrinsic                                                      | Large logo inside the homepage H1 (decorative `alt=""`) |
| `/images/brand/logo-navbar.webp`                 | 733×112                                                                 | Navbar: symbol + "DERMA WORLD" line only                |
| `/images/brand/og-image.jpg`                     | 1200×630                                                                | Open Graph / social share image                         |
| Favicons                                         | 16/32/48 `.ico`, 48, 96, 180 (apple-touch), 192, 512                    | `site.webmanifest`                                      |
| Originals                                        | `assets-src/clinic/logo-full.jpg`, `logo-mark.jpg`, `logo-original.jpg` |                                                         |

Logo alt text: "Derma World Skin & Hair Clinic — Dermatology, Cosmetology,
Hair, Laser". Navbar logo alt: "Derma World".

### Colours (Tailwind theme tokens)

| Token        | Hex                                                                                                                              |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| brand-50…950 | `#eff6f1` `#d8eadf` `#b2d4c0` `#82b699` `#4f9271` `#2f7556` `#1f5f44` **`#184d38` (700, primary)** `#133e2e` `#0f3025` `#081d16` |
| sage-50…600  | `#f6f8f3` `#ebf0e5` `#d8e1cd` `#bccaad` `#9caf89` `#7f946b` `#637654`                                                            |
| whatsapp     | `#0e7a6d` (dark `#0b6358`), AA-contrast teal instead of WhatsApp's light green                                                   |
| theme-color  | `#184d38` (browser UI + manifest)                                                                                                |

Deep green + soft sage on white; grey-700 body text; red-700 for errors;
amber-800 for warnings.

### Typography

- **Display/headings:** Playfair Display Variable (serif), self-hosted via
  `@fontsource-variable/playfair-display`
- **Body/UI:** Manrope Variable (sans), self-hosted via
  `@fontsource-variable/manrope`
- No Google Fonts requests (CSP `font-src 'self'`).

### Visual language

- Rounded cards (`rounded-3xl`), soft shadows, sage-tinted section
  backgrounds alternating with white.
- Reusable classes: `card`, `btn-primary` (solid brand-700 pill),
  `btn-secondary` (outline pill), `btn-light` (white on dark), `btn`,
  `eyebrow` (small uppercase label above headings), `section-title`.
- Decorative blurred brand-100 circles behind heroes; rotated sage
  rectangle behind hero/doctor photos.
- Entry animation `fade-up` (0.7 s, cubic-bezier(0.22,1,0.36,1)).
- Icons: Lucide (stroke icons) plus a custom WhatsApp glyph.
- Mobile-first; tested at 390 px, tablet and 1366 px.

---

## 5. Site map and routes

| Path                                             | Page                          | Indexed | Notes                                                    |
| ------------------------------------------------ | ----------------------------- | ------- | -------------------------------------------------------- |
| `/`                                              | Home                          | Yes     |                                                          |
| `/about`                                         | About the clinic              | Yes     |                                                          |
| `/doctor`                                        | Our Doctor                    | Yes     |                                                          |
| `/treatments`                                    | Our Treatments                | Yes     |                                                          |
| `/treatments/acne-pimple-treatment`              | Acne & Pimple Treatment       | Yes     |                                                          |
| `/treatments/acne-scar-treatment`                | Acne Scar Treatment           | Yes     |                                                          |
| `/treatments/hair-fall-prp-therapy`              | Hair Fall & PRP Therapy       | Yes     |                                                          |
| `/treatments/pigmentation-chemical-peels`        | Pigmentation & Chemical Peels | Yes     |                                                          |
| `/treatments/skin-allergies`                     | Skin Allergies                | Yes     |                                                          |
| `/treatments/fungal-infections`                  | Fungal Infections             | Yes     |                                                          |
| `/treatments/warts-skin-tags`                    | Warts & Skin Tags             | Yes     |                                                          |
| `/treatments/laser-treatments`                   | Laser Treatments              | Yes     |                                                          |
| `/treatments/anti-ageing-fillers-botox`          | Anti-ageing (Fillers & Botox) | Yes     |                                                          |
| `/treatments/nail-disorders`                     | Nail Disorders                | Yes     |                                                          |
| `/gallery`                                       | Clinic gallery                | Yes     |                                                          |
| `/contact`                                       | Contact & directions          | Yes     |                                                          |
| `/appointment`                                   | Book an Appointment           | Yes     | Accepts `?treatment=<exact treatment name>` to preselect |
| `/privacy`                                       | Privacy Policy                | Yes     |                                                          |
| `/treatments/skin-care`, `/treatments/hair-care` | Legacy URLs                   | —       | Redirect to `/treatments` (from the first site version)  |
| `/admin/login`                                   | Admin sign in                 | No      | noindex, robots.txt `Disallow: /admin`                   |
| `/admin`                                         | Appointments dashboard        | No      | Admin-only                                               |
| anything else                                    | Not Found                     | No      | Real **404** status, noindex                             |

Navigation (header and footer "Explore"): Home, About, Our Doctor,
Treatments, Gallery, Contact + "Book Appointment" button.

---

## 6. Global layout and shared UI

### Top bar (desktop)

Address snippet linking to Google Maps ("opens Google Maps"), hours line
"Mon–Sat 10 AM – 10 PM · Sunday by appointment", phone.

### Header / navbar

- Sticky header with the navbar logo (link labelled "Derma World Skin & Hair
  Clinic — home").
- Primary nav links with active-page styling.
- "Book Appointment" button; phone call button labelled "Call the clinic on
  +91 78931 71659".
- **Mobile menu:** hamburger toggle (`aria-expanded`, `aria-controls`,
  "Open menu" / "Close menu"), closes on navigation, includes Book
  Appointment and the hours line "Mon–Sat 10 AM – 10 PM · Sunday by prior
  appointment".

### Footer (dark brand background)

- Inverted logo + tagline "Consultations and treatment for skin and hair
  concerns in Moula Ali, Hyderabad."
- Both phone numbers; "Book an Appointment".
- Columns: **Explore** (nav links), **Treatments** (all 10), **Visit us**
  (address, directions), **Opening hours**.
- Privacy Policy link.
- Bottom line: "© {year} Derma World Skin & Hair Clinic. All rights
  reserved. Information on this website is general and is not a substitute
  for a medical consultation. Treatment suitability and results vary between
  individuals."

### Floating WhatsApp button

Fixed bottom-right on every public page, label "Chat with us on WhatsApp",
opens `wa.me/917893171659` with the default message "Hello Derma World Skin &
Hair Clinic, I would like to enquire about an appointment." Hidden when no
valid WhatsApp number is configured.

### Privacy notice banner

Fixed bottom banner (labelled "Privacy notice"): "This website doesn't use
advertising or analytics cookies. We only receive the details you choose to
submit. Privacy Policy" + **OK**. Dismissal stored in `localStorage` key
`dw-privacy-notice-dismissed` = `1` (guarded: if storage is unavailable it
just shows again). A spacer keeps it from covering the footer. It is
informational, not a consent prompt (there's nothing to consent to today).

### CTA banner (end of most pages)

Heading "Book a consultation for your skin or hair concern"; text "Send an
appointment request online. The clinic will contact you to confirm a time —
your visit isn't booked until then."; buttons Book an Appointment + WhatsApp.

### Page hero (inner pages)

Eyebrow + H1 + intro paragraph on a sage gradient.

### Map embed

Card with address and a **"Show map"** button. The Google Maps iframe
(`title="Google Map showing the location of Derma World Skin & Hair
Clinic"`) loads **only after the click**, so Google's cookies/scripts never
load on page view. "Get directions" and "View on Google Maps" links open in
a new tab. If no verified embed URL exists, only the card is shown (never a
wrong pin).

### Other shared pieces

- `ClinicAddress`, `ClinicPhoneNumbers` (size/inverted variants),
  `OpeningHoursList`, `DirectionsLink`, `MapsPlaceLink`
- `WhatsAppLink` (variants solid/outline/light; `hideWhenUnavailable`)
- `FaqList` (accessible accordion of question/answer)
- `TreatmentCard` (image, group label, name, summary, link)
- `SiteImage` / `ImagePlaceholder` (responsive `srcset`, width/height,
  lazy by default, `priority` for above-the-fold; labelled placeholder if a
  photo is missing)
- `InfoNote`, `PlaceholderNote`, `FormField` (label, hint, error wiring),
  `HoneypotField`, `SelectWrapper`
- `ErrorBoundary` with a friendly fallback
- `SeoHead` (title, description, canonical, OG/Twitter, breadcrumbs JSON-LD,
  noindex)

---

## 7. Page-by-page content

### 7.1 Home (`/`)

**SEO:** title "Derma World Skin & Hair Clinic | Dermatologist in Moula Ali,
Hyderabad"; description "Looking for a dermatologist in Moula Ali,
Hyderabad? Visit Derma World Skin & Hair Clinic for skin consultations, acne
care, pigmentation and hair treatments near ECIL."

Sections in order:

1. **Hero:** pill "Skin & hair clinic · Moula Ali, near ECIL"; **H1** = the
   large logo image (decorative) + visible text "Dermatologist in Moula Ali,
   Hyderabad" (screen readers hear "Derma World Skin & Hair Clinic –
   Dermatologist in Moula Ali, Hyderabad"). Paragraph: "Consult Dr. Sathaiah
   Sudhamalla at Derma World Skin & Hair Clinic for acne scars, pigmentation,
   hair fall, skin allergies, fungal infections, and more." Buttons: Book an
   Appointment · Call +91 78931 71659 · WhatsApp. Hours line. Right side:
   reception photo (4:5) with a floating card "Dr. Sathaiah Sudhamalla /
   MBBS (Osmania), MD DVL (Gandhi)".
2. **Clinic at a glance** (3-column card): Location "Above Lucid
   Diagnostics, Beside More Supermarket, Moula Ali, Near ECIL, Secunderabad
   500040" · Opening hours "Mon–Sat 10 AM – 10 PM · Sun 10 AM – 2 PM & 5 – 10
   PM (by appointment)" · Call the clinic (tel link).
3. **About the clinic:** "A skin and hair clinic in Moula Ali, near ECIL" +
   paragraph (clinic above Lucid Diagnostics, close to ECIL; consultations
   with the doctor for skin, hair, scalp and nail concerns). Three service
   group cards listing linked treatments:
   - _Skin care_ — "Diagnosis and treatment of common skin conditions, marks
     and growths." (skin group)
   - _Hair & scalp care_ — "Finding the likely cause of hair fall before
     recommending treatment." (hair group)
   - _Cosmetic & nail care_ — "Laser, anti-ageing and nail treatments, after
     a medical assessment." (cosmetology + nails)
4. **Treatments:** "Care for common skin and hair concerns" — "Every
   treatment starts with a consultation, so your plan is based on an
   assessment of your skin or scalp." First 6 treatment cards + "View all 10
   treatments".
5. **Meet the Doctor** (summary profile on sage background): photo, name,
   qualifications, role, first intro paragraph, Book / WhatsApp ("…enquire
   about a consultation with Dr. Sathaiah Sudhamalla.") / Doctor profile.
6. **What to expect at the clinic** (4 cards): _A qualified dermatologist_
   (qualifications + Assistant Professor at Gandhi Medical College) ·
   _Diagnosis before treatment_ · _Procedures at the clinic_ (chemical
   peels, PRP therapy, radiofrequency ablation, intralesional injections,
   skin or scalp biopsy, where suitable) · _Open until 10 PM_.
7. **A look inside:** first 4 gallery photos with captions + "View gallery".
8. **How booking works** (3 numbered steps): _Send a request_ ("Choose a
   concern and a preferred date and time online, or call the clinic.") ·
   _Clinic confirms_ ("…Requests are not confirmed automatically.") ·
   _Consultation_.
9. **Visit the clinic:** address with name, landmarks line, opening hours
   list, phones + WhatsApp, map embed.
10. **Frequently asked questions** ("For questions about a specific skin or
    hair concern, please book a consultation…"): Where is the clinic? · What
    are the clinic timings? · How do I book an appointment? · Who is the
    doctor? · Which treatments are available? · What are the consultation
    fees? ("Please call or message the clinic for current fees.")
11. CTA banner.

### 7.2 About (`/about`)

**SEO:** "About the Clinic | Derma World Skin & Hair Clinic, Moula Ali";
description mentions dermatology, cosmetology, hair and laser care with the
doctor and qualifications. Breadcrumb "About".

- Hero: "About Derma World Skin & Hair Clinic" — "A dermatology clinic in
  Moula Ali, Hyderabad, near ECIL, offering dermatology, cosmetology, hair
  and laser care under Dr. Sathaiah Sudhamalla."
- **Our approach — "Consultation first, treatment second"**: every visit
  begins with a consultation; the clinic manages skin, hair and nail
  disorders (acne and acne scars, pigmentation, hair fall, skin allergies,
  fungal infections, warts and skin tags) and offers PRP, chemical peels,
  laser and anti-ageing where suitable; **in-clinic pharmacy at reception**.
  Buttons: Meet the doctor · View treatments. Reception photo.
- **Services available — "What the clinic offers"**: the 9 procedures (§9),
  "As listed at the clinic. The doctor will advise which, if any, is right
  for you."
- **How we care for patients** (draft copy for owner review): _Clear
  explanations_ · _Care that fits you_ ("not a one-size-fits-all package") ·
  _Honest expectations_ ("Results vary from person to person…").
- **Inside the clinic:** gallery photos 2–5 + View gallery; card with
  address, phones, directions button, opening hours.
- CTA banner.

### 7.3 Our Doctor (`/doctor`)

**SEO:** "Dr. Sathaiah Sudhamalla, Dermatologist in Moula Ali | Derma
World"; Physician JSON-LD. Breadcrumb "Our Doctor".

- Full profile header (H1 = doctor's name, qualifications with a verified
  badge, role, both intro paragraphs, Book + WhatsApp).
- Six credential cards: **Qualifications** · **Current positions** ·
  **Professional memberships** (with membership numbers) · **Special areas
  of interest** · **Publications** (big "15") · **Consultations at the
  clinic** (chips linking to all 10 treatments).
- Conference figure: CUTICON photo, caption "Dr. Sathaiah Sudhamalla (second
  from left) at CUTICON Telangana, a dermatology conference."
- CTA banner.

### 7.4 Treatments (`/treatments`)

**SEO:** "Skin & Hair Treatments in Moula Ali, near ECIL | Derma World".

- Hero "Our Treatments" — "Every treatment begins with a consultation, so
  the doctor can assess your concern and recommend what is suitable for
  you."
- In-page category nav (`aria-label="Treatment categories"`).
- Sections: **Skin treatments** (skin) · **Hair and nail treatments** (hair,
  nails) · **Cosmetology and laser** (cosmetology), each a grid of
  treatment cards.
- **Procedures at the clinic** — the 9 procedures, "As listed at the clinic.
  Whether a procedure is suitable is decided at your consultation."
- Disclaimer: "Treatment suitability and results vary from person to person,
  and a consultation is needed to decide what is appropriate for you. For
  fees, please contact the clinic. Treatment photos are illustrative stock
  images (from Pexels) and do not show clinic patients or results. This
  website does not provide medical advice."

### 7.5 Treatment detail (`/treatments/[slug]`, 10 pages)

Per page: SEO title/description/FAQs from §8; breadcrumbs Home › Treatments ›
{name}; hero with the illustration, group label, name, summary;
**Overview** (2 paragraphs); **Concerns we can help with** (omitted when the
list is empty — Laser); **What your consultation includes**; **Frequently
asked questions**; **Book a consultation** box with "Book an Appointment"
linking to `/appointment?treatment=<name>` and WhatsApp; **3 related
treatments**; the disclaimer. Unknown slug → Not Found (404); legacy slugs →
redirect to `/treatments`.

### 7.6 Gallery (`/gallery`)

**SEO:** "Clinic Gallery | Derma World Skin & Hair Clinic". Hero "Inside the
clinic" — "Photographs of Derma World Skin & Hair Clinic, Moula Ali, near
ECIL." Grid of the 5 genuine clinic photos (caption + alt as description);
each opens the full-size photo in a new tab ("— open full-size photo"). First
3 load eagerly. **Only the owner's real photos — never stock.** CTA banner.

### 7.7 Contact (`/contact`)

**SEO:** "Contact & Directions | Derma World Skin & Hair Clinic, Moula Ali".
Hero "Contact Us" — "Call the clinic, send us a message, or get directions
to our clinic above Lucid Diagnostics, Moula Ali, near ECIL."

- Left column cards: **Address** (+ Get directions, View on Google Maps) ·
  **Phone** (both numbers, large, + WhatsApp button) · **Email** (only if
  supplied) · **Opening hours** (+ Sunday note) · map embed.
- Right column: dark card "Want to book a visit?" → Book an Appointment;
  **Send us a message** form (§11).

### 7.8 Appointment (`/appointment`)

See §10. **SEO:** "Book a Dermatologist Appointment in Moula Ali | Derma
World". Hero "Book an Appointment" — "Fill in your details and we'll open
WhatsApp with your request ready to send to the clinic. Your appointment is
confirmed only when the clinic replies." Sidebar: address, opening hours,
phone numbers.

### 7.9 Privacy Policy (`/privacy`)

Last updated 25 November 2026. Sections: Who we are (address, phones; email
if supplied) · What we collect (appointment fields; contact form is not sent
or stored; WhatsApp is governed by WhatsApp's policy; don't include
sensitive medical details) · Why we use it (only to arrange the appointment;
consent under India's **Digital Personal Data Protection Act, 2023**;
withdraw any time; not sold, not used for ads) · Where it is stored and who
can see it (Google Firebase/Cloud Firestore; staff-only; service providers:
Google Firebase, Google Maps on opt-in, WhatsApp on opt-in; servers may be
in or outside India) · How long we keep it (only as long as needed, then
deleted; delete sooner on request; medical records kept separately at the
clinic) · Cookies and tracking (none; map only after "Show map";
localStorage note for the banner; admin session storage) · Your choices and
requests (DPDP rights: access, correction/completion/update, erasure,
withdraw consent, nominate, grievance redressal; how to ask; identity check;
complaint to the **Data Protection Board of India**) · Changes to this policy
· medical-advice disclaimer.

### 7.10 Not Found (any unknown URL)

"Page not found" — "We couldn't find the page you were looking for. It may
have moved, or the link may be incorrect." Back to Home + helpful links
(Treatments, Book an Appointment, Contact Us). noindex, HTTP 404.

---

## 8. Treatments (full content)

Groups: `skin` "Skin", `hair` "Hair", `nails` "Nails", `cosmetology`
"Cosmetology". The treatment **name** is also the value stored with a
booking. Booking dropdown optgroups: _Skin treatments_ (skin) · _Hair & nail
treatments_ (hair, nails) · _Cosmetology & laser_ (cosmetology) + **General
Inquiry**. Images: `/images/treatments/<slug>-{480,720,960}.webp`
(illustrative Pexels stock, see §15).

### 8.1 Acne & Pimple Treatment — `acne-pimple-treatment` (skin)

- **Summary:** Assessment and management of acne and pimples — from
  blackheads and whiteheads to red, inflamed breakouts.
- **Overview:** (1) Acne is one of the most common skin conditions and
  affects teenagers and adults alike. It can range from occasional pimples to
  persistent, painful breakouts. (2) At your consultation, the doctor
  examines your skin, asks about your skincare routine and possible
  triggers, and explains the options suited to your skin type and the type
  of acne you have.
- **Concerns:** Blackheads and whiteheads · Red, inflamed pimples · Painful,
  deeper breakouts · Acne that keeps coming back
- **Consultation includes:** A skin examination and discussion of your
  history · A treatment plan, which may include medicines applied to the skin
  or taken by mouth · Practical skincare advice for acne-prone skin ·
  Follow-up visits to review progress
- **Image alt:** Young woman applying a serum to a pimple on her cheek —
  https://www.pexels.com/photo/woman-applying-facial-serum-6476077/
- **SEO title:** Acne & Pimple Treatment in Moula Ali, near ECIL | Derma
  World
- **SEO description:** Acne and pimple treatment with a dermatologist in
  Moula Ali, near ECIL: skin examination, a treatment plan for your acne
  type, and follow-up visits.
- **FAQs:**
  - _When should I see a dermatologist for acne?_ — If pimples are frequent,
    painful, leaving marks or scars, or not improving with regular skincare,
    a consultation can help identify the type of acne you have and the
    treatment options suited to it.
  - _How long does acne treatment take?_ — It differs from person to person.
    Acne treatments usually take several weeks to show a change, and
    follow-up visits let the doctor review progress and adjust the plan.
  - _Should I bring my current skincare products?_ — Yes — bring them or a
    list of them. Some products can aggravate acne, and the doctor will
    advise which ones to continue.

### 8.2 Acne Scar Treatment — `acne-scar-treatment` (skin)

- **Summary:** Evaluation of acne scars and marks, with a plan matched to the
  type of scarring.
- **Overview:** (1) Acne can leave behind dark marks or textured scars.
  Different types of scars respond to different approaches, so treatment
  starts by identifying the kind of scarring you have. (2) The doctor will
  explain the options available at the clinic, how many sessions may be
  needed, and what improvement is realistic for your skin.
- **Concerns:** Dark marks left after pimples · Pitted or depressed scars ·
  Uneven skin texture
- **Consultation includes:** Assessment of your scar type and skin ·
  Discussion of suitable in-clinic options · Clear, realistic expectations
  before you begin · Active acne is usually brought under control first
- **Image alt:** Doctor examining facial skin with a digital dermatoscope —
  https://www.pexels.com/photo/a-tablet-with-a-magnifier-7446660/
- **SEO title:** Acne Scar Treatment in Moula Ali, Hyderabad | Derma World
- **SEO description:** Acne scar and acne mark treatment in Moula Ali,
  Hyderabad. The dermatologist identifies your scar type and explains
  suitable in-clinic options and realistic results.
- **FAQs:**
  - _Does active acne need to be treated before acne scars?_ — Usually, yes.
    New breakouts can cause new marks and scars, so the doctor generally
    brings active acne under control before starting scar treatment.
  - _Can acne scars be removed completely?_ — Scar treatments aim to improve
    the appearance of scars. How much improvement is possible depends on the
    type and depth of scarring and on your skin, and the doctor will discuss
    realistic expectations with you.
  - _Are dark marks after pimples the same as scars?_ — Not always. Flat dark
    marks are often pigmentation, while pitted or depressed areas are
    textural scars. They are treated differently, which is why the type is
    assessed first.

### 8.3 Hair Fall & PRP Therapy — `hair-fall-prp-therapy` (hair)

- **Summary:** Consultation to understand the cause of your hair fall, with
  PRP therapy offered where it is suitable.
- **Overview:** (1) Hair fall can have many causes, including genetics,
  stress, nutrition, hormonal changes, and scalp conditions. The
  consultation focuses on finding the likely cause before recommending
  treatment. (2) Platelet-rich plasma (PRP) therapy uses a concentrate
  prepared from a small sample of your own blood, which is then applied to
  the scalp. The doctor will advise whether PRP is appropriate for you.
- **Concerns:** Increased hair shedding · Thinning hair · Patterned hair loss
  · Scalp conditions linked to hair fall
- **Consultation includes:** A scalp and hair examination · Blood tests or a
  scalp biopsy, if the doctor advises them · A plan that may include
  medicines and/or PRP sessions · Regular reviews to monitor progress
- **Image alt:** Hand holding strands of fallen hair beside a comb —
  https://www.pexels.com/photo/close-up-photo-of-a-person-holding-hair-9755382/
- **SEO title:** Hair Fall Treatment & PRP Therapy near ECIL | Derma World
- **SEO description:** Hair fall treatment and PRP hair therapy near ECIL,
  Hyderabad. A dermatologist finds the likely cause of your hair fall first
  and advises whether PRP suits you.
- **FAQs:**
  - _What causes hair fall?_ — Hair fall can be linked to genetics, stress,
    illness, nutrition, hormonal changes, certain medicines and scalp
    conditions. Finding the likely cause is the first step, and the doctor
    may suggest blood tests.
  - _Is PRP suitable for everyone?_ — No. PRP is offered only where the
    doctor finds it suitable, after examining your scalp and reviewing the
    cause of your hair fall and your medical history.
  - _How many PRP sessions will I need?_ — This varies from person to person.
    If PRP is suitable for you, the doctor will explain the planned number of
    sessions and how progress will be reviewed.

### 8.4 Pigmentation & Chemical Peels — `pigmentation-chemical-peels` (skin)

- **Summary:** Care for dark spots, patches, and uneven skin tone, including
  chemical peel treatments.
- **Overview:** (1) Pigmentation — such as dark spots, patches, melasma, and
  tanning — is a common concern and can have several causes, including sun
  exposure and hormonal changes. (2) A chemical peel is a controlled
  treatment in which a solution is applied to the skin to gently remove its
  outer layers. The doctor assesses your skin to decide whether a peel,
  other treatment, or a combination is appropriate.
- **Concerns:** Dark spots and patches · Melasma · Tanning and uneven skin
  tone · Marks left after acne
- **Consultation includes:** A skin assessment to understand the type of
  pigmentation · A peel or treatment chosen for your skin type ·
  Sun-protection and aftercare advice · More than one session may be advised
- **Image alt:** Gloved practitioner applying a facial treatment to a woman
  lying down —
  https://www.pexels.com/photo/cosmetologist-applying-facial-mask-on-customer-face-in-spa-salon-5069494/
- **SEO title:** Pigmentation Treatment & Chemical Peels in Moula Ali | Derma
  World
- **SEO description:** Pigmentation treatment and chemical peels in Moula
  Ali, near ECIL: care for dark spots, melasma, tanning and uneven skin tone
  after a dermatologist's assessment.
- **FAQs:**
  - _Is a chemical peel suitable for my skin?_ — The doctor assesses your
    skin type and the kind of pigmentation before recommending a peel.
    Temporary redness or peeling can occur, and you will be given aftercare
    advice.
  - _Why is sun protection important for pigmentation?_ — Sun exposure can
    darken pigmentation and make it return, so daily sun protection is an
    important part of any pigmentation treatment plan.
  - _Will I need more than one session?_ — Often, yes. The doctor will
    explain how many sessions may be advised for your skin and concern.

### 8.5 Skin Allergies — `skin-allergies` (skin)

- **Summary:** Diagnosis and management of itchy rashes, hives, and allergic
  skin reactions.
- **Overview:** (1) Skin allergies can cause itching, redness, rashes, or
  hives. Finding the trigger — for example certain cosmetics, detergents,
  metals, foods, or medicines — is an important part of managing them. (2)
  The doctor examines the skin, reviews your history, and recommends
  treatment to relieve symptoms and help reduce future flare-ups.
- **Concerns:** Itchy rashes and redness · Hives (urticaria) · Reactions to
  cosmetics, detergents, or metals · Recurring skin irritation
- **Consultation includes:** A skin examination and detailed history · Help
  identifying possible triggers · Treatment to relieve symptoms · Advice to
  help prevent flare-ups
- **Image alt:** Man scratching an itchy arm —
  https://www.pexels.com/photo/man-scratching-a-hand-14387797/
- **SEO title:** Skin Allergy Treatment near ECIL, Moula Ali | Derma World
- **SEO description:** See a dermatologist near ECIL, Moula Ali for itchy
  rashes, hives and allergic skin reactions. Diagnosis, help identifying
  triggers and treatment to relieve symptoms.
- **FAQs:**
  - _When should I see a doctor for a skin rash?_ — Book a consultation if a
    rash spreads, lasts more than a few days, keeps coming back, or affects
    your sleep or daily life. Seek emergency care immediately for swelling of
    the face, lips or tongue, or any difficulty breathing.
  - _Can the doctor find out what I am allergic to?_ — The doctor reviews
    your history and examines your skin to identify likely triggers, such as
    cosmetics, detergents, metals, foods or medicines, and may suggest tests
    if they are needed.

### 8.6 Fungal Infections — `fungal-infections` (skin)

- **Summary:** Diagnosis and treatment of common fungal infections of the
  skin, scalp, and nails.
- **Overview:** (1) Fungal infections such as ringworm (tinea) are common,
  especially in warm and humid weather. They can cause itchy, red,
  ring-shaped, or scaly patches, and may spread or return if not treated
  fully. (2) The doctor confirms the diagnosis, prescribes a suitable course
  of treatment, and explains how to help prevent the infection from coming
  back.
- **Concerns:** Ringworm (tinea) on the body or groin · Fungal infections of
  the scalp · Fungal nail infections · Infections that keep returning
- **Consultation includes:** A skin examination to confirm the diagnosis · A
  prescribed treatment course — completing it matters · Hygiene and
  prevention advice · Follow-up for persistent infections
- **Image alt:** Person washing their feet as part of foot care —
  https://www.pexels.com/photo/close-up-of-woman-washing-feet-with-organic-soap-5240788/
- **SEO title:** Fungal Infection Treatment in Moula Ali, Hyderabad | Derma
  World
- **SEO description:** Diagnosis and treatment of ringworm and other fungal
  infections of the skin, scalp and nails by a dermatologist in Moula Ali,
  Hyderabad, with prevention advice.
- **FAQs:**
  - _Why do fungal infections keep coming back?_ — Common reasons include
    stopping treatment as soon as the itching settles, heat and sweating,
    tight clothing, and infection in family members or shared items.
    Completing the full course and following prevention advice both matter.
  - _Should I use creams from the pharmacy first?_ — It is better to get a
    diagnosis first. Some creams sold over the counter, especially those
    containing steroids, can make a fungal infection harder to diagnose and
    treat.

### 8.7 Warts & Skin Tags — `warts-skin-tags` (skin)

- **Summary:** Assessment and removal of warts and skin tags.
- **Overview:** (1) Warts are small skin growths caused by a viral
  infection, while skin tags are soft growths that often appear on the neck,
  underarms, or other skin folds. Both are common and can be bothersome or
  affect appearance. (2) The doctor examines the growth to confirm what it is
  and discusses suitable removal options at the clinic.
- **Concerns:** Common warts on the hands or feet · Warts on the soles of
  the feet · Skin tags on the neck, underarms, or skin folds
- **Consultation includes:** An examination to confirm the diagnosis ·
  Discussion of removal options, which may include radiofrequency ablation ·
  Aftercare advice
- **Image alt:** Magnifying glass held over a small spot on the forearm —
  https://www.pexels.com/photo/person-holding-magnifying-glass-with-white-background-5701545/
- **SEO title:** Warts & Skin Tag Removal near Moula Ali, ECIL | Derma World
- **SEO description:** Warts and skin tags assessed and removed at a
  dermatology clinic in Moula Ali, near ECIL. Removal options, which may
  include radiofrequency ablation, explained first.
- **FAQs:**
  - _Are warts contagious?_ — Warts are caused by a viral infection and can
    spread through direct contact or by picking or shaving over them. The
    doctor will confirm the diagnosis before discussing removal.
  - _How are warts and skin tags removed?_ — The doctor examines the growth
    and discusses suitable removal options at the clinic, which may include
    radiofrequency ablation, along with aftercare advice.

### 8.8 Laser Treatments — `laser-treatments` (cosmetology)

- **Summary:** Laser-based skin treatments, offered after the doctor has
  assessed whether laser is suitable for you.
- **Overview:** (1) Lasers use focused light energy and are used in
  dermatology for a range of skin concerns. Whether a laser treatment is
  right for you depends on your skin type and the concern being treated. (2)
  The doctor assesses your skin first and, if laser is suitable, explains
  the likely number of sessions, the aftercare involved, and possible side
  effects before you decide.
- **Concerns:** _(none listed — depends on the individual assessment; the
  section is hidden)_
- **Consultation includes:** A skin assessment to decide whether laser is
  suitable for you · An explanation of the procedure, sessions and expected
  recovery · Protective eyewear and aftercare advice, including sun
  protection · Results vary between individuals; more than one session is
  often needed
- **Image alt:** Practitioner performing a laser treatment on a patient
  wearing protective glasses —
  https://www.pexels.com/photo/cosmetologist-performing-scar-whitening-on-a-woman-4586726/
- **SEO title:** Laser Skin Treatments in Moula Ali, Hyderabad | Derma World
- **SEO description:** Laser skin treatments in Moula Ali, Hyderabad,
  offered only after a dermatologist checks that laser suits your skin type
  and concern. Sessions and aftercare explained.
- **FAQs:**
  - _Is laser treatment suitable for every skin type?_ — Not always.
    Suitability depends on your skin type and the concern being treated, so
    the doctor assesses your skin before recommending any laser treatment.
  - _How many laser sessions are needed?_ — More than one session is often
    needed, and results vary between individuals. The doctor explains the
    likely number of sessions, recovery and aftercare before you decide.

### 8.9 Anti-ageing (Fillers & Botox) — `anti-ageing-fillers-botox` (cosmetology)

- **Summary:** Injectable anti-ageing treatments — dermal fillers and
  botulinum toxin (Botox®) — after a medical assessment.
- **Overview:** (1) Dermal fillers and botulinum toxin (widely known by the
  brand name Botox®) are injectable treatments used to soften the appearance
  of certain lines and wrinkles and to restore lost facial volume. (2) These
  are medical procedures. The doctor assesses your face, medical history and
  goals, and explains what each option can and cannot do, before any
  treatment.
- **Concerns:** Forehead and frown lines · Lines around the eyes (crow's
  feet) · Loss of facial volume
- **Consultation includes:** An assessment of your face, medical history and
  goals · An explanation of the options, expected results and possible side
  effects · Results are temporary and vary between individuals; repeat
  treatments may be needed
- **Image alt:** Gloved practitioner giving a cosmetic injection in a
  woman's forehead —
  https://www.pexels.com/photo/woman-getting-a-face-botox-3985311/
- **SEO title:** Anti-ageing Treatments, Fillers & Botox in Hyderabad | Derma
  World
- **SEO description:** Anti-ageing consultations in Moula Ali, Hyderabad:
  dermal fillers and Botox® for lines and volume loss, after a medical
  assessment by a dermatologist.
- **FAQs:**
  - _How long do fillers and Botox last?_ — Results are temporary, and how
    long they last varies between individuals and treatments. The doctor
    will explain what to expect and when repeat treatment may be considered.
  - _Are fillers and Botox medical procedures?_ — Yes. They are injectable
    medical treatments. The doctor assesses your face, medical history and
    goals and explains possible side effects before any treatment.

### 8.10 Nail Disorders — `nail-disorders` (nails)

- **Summary:** Diagnosis and treatment of nail problems, from fungal
  infections to brittle, discoloured or painful nails.
- **Overview:** (1) Nail problems such as infection, discolouration,
  thickening, brittleness, or changes in nail shape can have many causes —
  and some reflect skin conditions or general health. (2) The doctor
  examines your nails, may suggest tests to confirm the cause, and then
  recommends a suitable treatment.
- **Concerns:** Fungal nail infections · Discoloured or thickened nails ·
  Brittle, splitting or ridged nails · Painful or ingrown nails · Infection
  around the nail (paronychia)
- **Consultation includes:** An examination of your nails and surrounding
  skin · Tests, if the doctor advises them, to confirm the cause · A
  treatment plan and nail-care advice
- **Image alt:** Close-up of a hand with natural, unpolished fingernails —
  https://www.pexels.com/photo/close-up-photo-of-person-s-hand-7298694/
- **SEO title:** Nail Disorder Treatment near ECIL, Moula Ali | Derma World
- **SEO description:** Dermatologist care near ECIL, Moula Ali for nail
  problems: fungal nail infections, discoloured, thickened, brittle, painful
  or ingrown nails and paronychia.
- **FAQs:**
  - _When should I see a dermatologist about my nails?_ — Book a
    consultation if a nail changes colour, thickness or shape and does not
    improve, or if the nail or the skin around it becomes painful, swollen or
    infected.
  - _Why does a fungal nail infection take long to treat?_ — Nails grow
    slowly, so treatment often continues for months until healthy nail grows
    out. Completing the course the doctor prescribes is important.

---

## 9. Procedures at the clinic

From the clinic signboard ("Services available"). Wording deliberately
general.

| Procedure                          | Description                                                           |
| ---------------------------------- | --------------------------------------------------------------------- |
| Skin, hair and nail disorders      | Consultation, diagnosis and treatment for a wide range of conditions. |
| Chemical peeling                   | Controlled peels for pigmentation, acne marks and uneven skin tone.   |
| PRP (platelet-rich plasma) therapy | Offered for hair regrowth where the doctor finds it suitable.         |
| Acne scar treatments               | Options chosen according to the type of scarring.                     |
| Laser                              | Laser-based treatments after a suitability assessment.                |
| Anti-ageing (fillers, Botox®)      | Injectable treatments for lines, wrinkles and volume loss.            |
| Radiofrequency ablation            | Used to remove certain skin growths, such as warts and skin tags.     |
| Intralesional injections           | Medicine injected directly into a skin lesion, when appropriate.      |
| Skin and scalp biopsy              | A small sample taken to help confirm a diagnosis.                     |

---

## 10. Appointment booking (WhatsApp-first)

### Flow

1. Patient fills the form and presses submit.
2. Client validation runs; on error, messages appear under fields and
   **focus moves to the first invalid field**. Honeypot filled → generic
   "could not be processed" message, nothing saved.
3. On success, **WhatsApp opens synchronously in the click** (so pop-up
   blockers allow it) at `wa.me/917893171659?text=<prefilled request>`
   (opener nulled). On phones this hands off to the WhatsApp app, on
   computers to WhatsApp Web/desktop.
4. **In parallel**, a best-effort copy is written to Firestore
   (`appointments`, status `pending`) for the admin dashboard. A failed save
   **never blocks** the WhatsApp route and is reported honestly.
5. Success screen: "Now send your request on WhatsApp — Your appointment is
   **not booked yet**." Steps: (1) WhatsApp has opened with your details
   (or tap "Open WhatsApp") (2) **Press Send in WhatsApp** — the message is
   not sent until you do (3) Wait for the clinic to reply; confirmed only
   when the clinic confirms. Buttons: Open WhatsApp (or "Call +91 78931
   71659" if no WhatsApp number) · Edit details. Summary list of the
   submitted details. Save-status line: "Saving a copy of your request for
   the clinic…" → "A copy of your request has also been saved for the
   clinic." or (amber) "We couldn't confirm that a copy of your request was
   saved online, so please make sure you send the WhatsApp message — or call
   +91 78931 71659." (hidden when Firebase isn't configured).
6. The clinic confirms by phone/WhatsApp and updates status in the admin
   dashboard. No automatic confirmations today.

### Fields and validation

| Field          | Type               | Rules                                                                                                                                                                |
| -------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name           | text, required     | sanitized; 2–100 chars                                                                                                                                               |
| Phone          | tel, required      | ≤ 20 chars; only `+ digits space - ( )`; 7–15 digits. Hint "Include your country code if outside India."                                                             |
| Email          | email, optional    | ≤ 254 chars; `x@y.z` shape                                                                                                                                           |
| Treatment      | select, required   | one of the 10 treatment names or "General Inquiry" (optgroups as §8); preselected from `?treatment=`                                                                 |
| Preferred date | date, required     | real date; not in the past; ≤ 365 days ahead (`min`/`max` on the input). Hint "Mon–Sat 10 AM – 10 PM. Sundays by prior appointment." A Sunday shows the Sunday note. |
| Preferred time | radio, required    | Morning (10 AM – 12 PM) / Afternoon (12 PM – 5 PM) / Evening (5 PM – 10 PM)                                                                                          |
| Notes          | textarea, optional | ≤ 500 chars                                                                                                                                                          |
| `website`      | hidden honeypot    | must be empty                                                                                                                                                        |

Sanitizing: strip control characters (keep newlines/tabs) and `<` `>`, then
trim. Error copy examples: "Please enter your name." · "Please enter a valid
phone number with 7–15 digits, e.g. 98765 43210 or +91 98765 43210." ·
"Please enter a valid email address, or leave it blank." · "Please choose a
treatment." · "The preferred date cannot be in the past." · "Please choose a
date within the next year." · "Please choose a preferred time of day." ·
"Notes must be 500 characters or fewer."

Privacy line under the form: don't include sensitive medical details + link
to the Privacy Policy.

### Prefilled WhatsApp message

```
Hello Derma World Skin & Hair Clinic,
I would like to book an appointment.

Patient Name: {name}
Phone Number: {phone}
Email: {email}            (only if given)
Treatment: {treatment}
Preferred Date: {formatted date}
Preferred Time: {Morning/Afternoon/Evening + range}
Notes: {notes}            (only if given)

Please confirm my appointment. Thank you.
```

Other prefilled messages: default "Hello Derma World Skin & Hair Clinic, I
would like to enquire about an appointment." · doctor "…I would like to
enquire about a consultation with Dr. Sathaiah Sudhamalla." · contact form
(§11).

`VITE_WHATSAPP_NUMBER` may override the number (tests); placeholder/empty
falls back to the clinic number; invalid → WhatsApp buttons hidden.

---

## 11. Contact form

Fields: Name (required, 2–100) · Phone and Email (**at least one**; hint
"Phone or email — at least one is needed so we can reply.") · Message
(required, 10–1000; "Your message is a little short — please add more
detail.") · honeypot. **There is no backend:** on a valid submit the form
says "Online messaging isn't connected yet, so your message has not been
sent. You can send it to us on WhatsApp — it will open with your message
filled in — or use the contact details on this page." with **Send via
WhatsApp** and **Edit message**. WhatsApp text: "Hello Derma World Skin &
Hair Clinic, this is {name}." / {message} / "Phone: …" / "Email: …".

---

## 12. Admin area

- **Code-split:** the admin app (and the Firebase Auth/Firestore SDKs) only
  load on `/admin…` routes.
- **Sign in** (`/admin/login`): email + password (Firebase Auth). Errors:
  wrong credentials; **signed in but not an admin** (signs out again);
  "Sign-in failed. Please check your connection and try again."; empty
  fields "Please enter your email and password." Button shows "Signing in…".
- **Authorization:** Firebase **custom claim `admin: true`** on the ID token,
  set only server-side by `scripts/set-admin-claim.mjs <email> [--revoke]
[--emulator]` (Admin SDK, service-account key kept outside the repo; user
  re-signs in to pick it up). `RequireAdmin` guard redirects anyone else to
  the login page; the UI check is convenience — **Firestore rules enforce
  it**.
- **Layout:** admin header with sign-out; signing out returns to login.
- **Dashboard (`/admin`) — "Appointments":**
  - Buttons: **Refresh**, **Export CSV** (`appointments-YYYY-MM-DD.csv`,
    UTF-8), **Print** (print stylesheet hides controls).
  - **Stats cards:** total; count per status (pending, confirmed, cancelled,
    completed); submitted today; submitted in the last 7 days; **upcoming in
    the next 7 days** (not cancelled, preferred date within 7 days incl.
    today).
  - **Filters:** text search (name, email, treatment, notes; phone digits
    when ≥ 3 digits typed) · status (all/each) · preferred-date from/to
    (inclusive). Sorted newest-submitted first.
  - **Table/list:** name, phone (tel link), email, treatment, preferred
    date + time, notes, submitted at, status badge (colour per status) and a
    **status dropdown** — optimistic update with rollback and an inline error
    "Could not save the new status. Please try again." on failure.
  - States: loading ("Loading appointments…"), error with retry, empty.
- No delete button in the UI (rules allow admins to delete; done in the
  Firebase console for test bookings).

---

## 13. Data model and Firestore security rules

### `appointments/{id}`

| Field           | Type                            | Notes                                                            |
| --------------- | ------------------------------- | ---------------------------------------------------------------- |
| `name`          | string 2–100, no `<>`           |                                                                  |
| `phone`         | string                          | ≤ 20 chars, `^\+?[0-9 ()\-]+$`, 7–15 digits                      |
| `email`         | string \| null                  | ≤ 254, email shape, no `<>`                                      |
| `treatment`     | string (allowlist)              | 10 names + "General Inquiry" (+ legacy "Skin Care", "Hair Care") |
| `preferredDate` | string `YYYY-MM-DD`             | ≥ now − 1 day and ≤ now + 366 days                               |
| `preferredTime` | `Morning`/`Afternoon`/`Evening` |                                                                  |
| `notes`         | string \| null                  | ≤ 500, no `<>`                                                   |
| `status`        | `pending` on create             | then `pending`/`confirmed`/`cancelled`/`completed`               |
| `createdAt`     | server timestamp                | must equal `request.time`                                        |
| `updatedAt`     | server timestamp                | set on status change, must equal `request.time`                  |

### Rules (summary)

- Default deny.
- **create:** anyone, only if the document has **exactly** the 9 create
  fields and every field passes the checks above, `status == 'pending'`,
  `createdAt == request.time`.
- **read, delete:** `request.auth.token.admin == true` only.
- **update:** admin only, and only `status` + `updatedAt` may change; status
  must be valid; `updatedAt == request.time`.
- Rules are covered by `@firebase/rules-unit-testing` tests (allow and deny
  cases) on the emulator.
- Firestore indexes file present (none required beyond defaults).

---

## 14. SEO

- **Prerendering:** all 18 public pages are rendered to static HTML at build
  time (`scripts/prerender.mjs`, Playwright Chromium), so crawlers get full
  content, title and canonical without running JavaScript. Admin and unknown
  URLs use the unrendered app shell.
- **Per-page tags:** unique `<title>` (≈ 60 chars) and meta description
  (≈ 160) for every page (see §7, §8); `<link rel="canonical">` to
  `{SITE_URL}{path}`; Open Graph (`og:site_name`, `og:type`, `og:locale
en_IN`, `og:title`, `og:description`, `og:url`, `og:image` 1200×630) and
  `twitter:card summary_large_image`; `<html lang="en-IN">`;
  `theme-color`. Static fallbacks in `index.html` for link previews.
- **Site URL:** `VITE_SITE_URL` (custom domain) else
  `https://derma-world-clinic.web.app`; used by canonicals, OG, JSON-LD,
  sitemap and robots.
- **Structured data (JSON-LD):**
  - On every page: `["MedicalClinic","MedicalBusiness"]` with `@id
{SITE}/#clinic`, name, alternate names, url, logo, images, telephone(s),
    address, geo, `hasMap`, `medicalSpecialty: Dermatology`, `areaServed`
    (Moula Ali, ECIL, Hyderabad, Secunderabad), opening hours
    specification, `availableService` (MedicalProcedure per treatment with
    URL); plus `WebSite` (`@id {SITE}/#website`).
  - `/doctor`: `IndividualPhysician` (`@id {SITE}/doctor#physician`, name,
    url, image, description "{role}. {qualifications}.", `medicalSpecialty`
    Dermatology, address, telephone, `practicesAt` the clinic `@id`,
    `memberOf` IADVL and ACSI organisations).
  - Inner pages: `BreadcrumbList`.
  - **No ratings or reviews** in structured data, ever.
- **robots.txt:** `User-agent: *` / `Disallow: /admin` / `Allow: /` /
  `Sitemap: {SITE}/sitemap.xml`.
- **sitemap.xml:** the 18 public URLs, generated at build; served with its
  own CSP so browsers display it.
- **noindex:** admin pages and Not Found (meta robots).
- **Status codes:** real 404 for unknown URLs; no soft 404s.
- **Keyword strategy (one main page per intent):** home → "dermatologist in
  Moula Ali", "skin clinic near ECIL", "dermatologist near me" (with the
  Business Profile); `/appointment` → "dermatologist appointment Moula Ali";
  `/doctor` → the doctor's name; `/contact` → directions/timings; each
  treatment page → its own service + location. **No "best"** claims. No thin
  locality pages (an "ECIL" page would imply the clinic is in ECIL).
- **Google Business Profile** (manual): website link, phone alignment,
  categories, photos (`LOCAL_SEO.md`, `GOOGLE_SETUP.md`).
- **Search Console:** verified with the HTML file; sitemap submitted;
  indexing requests for key pages.
- Possible future page (needs doctor's input): "Psoriasis care".

---

## 15. Images and media

All web images are WebP with fixed `width`/`height` (no layout shift),
`srcset`/`sizes`, lazy loading except above-the-fold (`priority` /
`fetchpriority="high"`). Originals live in `assets-src/` and are converted by
`scripts/optimize-images.mjs` (sharp); `public/images/manifest.json` records
outputs.

### Genuine clinic photos (owner's own — never replace with stock)

| Key            | Files (`/images/clinic/…`)                      | Aspect | Alt text                                                        | Caption              | Used on              |
| -------------- | ----------------------------------------------- | ------ | --------------------------------------------------------------- | -------------------- | -------------------- |
| doctor         | `doctor-sathaiah-sudhamalla-380.webp` (380×462) | —      | Dr. Sathaiah Sudhamalla at the consultation desk                | —                    | Home, Doctor         |
| heroClinic     | `hero-reception-560.webp`, `-900.webp`          | 4:5    | Reception desk and pharmacy at Derma World Skin & Hair Clinic   | —                    | Home hero            |
| reception      | `reception-and-pharmacy-480/900.webp`           | 9:16   | Reception desk and in-clinic pharmacy                           | Reception & pharmacy | About, Gallery, Home |
| entrance       | `clinic-entrance-signboard-480/720.webp`        | 9:16   | Clinic entrance with the Derma World services signboard         | Clinic entrance      | Gallery, Home, About |
| waitingSeating | `waiting-area-seating-480/900.webp`             | 9:16   | Patient waiting area with seating                               | Waiting area         | Gallery, Home, About |
| waitingTv      | `waiting-area-tv-480/900.webp`                  | 9:16   | Second waiting area with a wall-mounted TV                      | Waiting lounge       | Gallery, Home, About |
| procedureRoom  | `procedure-room-door-480/900.webp`              | 9:16   | Entrance to the clinic's procedure room                         | Procedure room       | Gallery, About       |
| conference     | `doctor-cuticon-telangana-480/900.webp`         | 3:4    | Dr. Sathaiah Sudhamalla (second from left) at CUTICON Telangana | At CUTICON Telangana | Doctor               |

Gallery order: reception, entrance, waiting area, waiting lounge, procedure
room.

Other originals in `assets-src/clinic/` (reference material, not shown):
`doctor-photo.jpg`, `doctor-profile-slide.jpg`,
`doctor-profile-slide-portrait.jpg`, `timings-poster.jpg`,
`visiting-card.jpg`, logo originals.

### Treatment illustrations (licensed stock)

`/images/treatments/<slug>-480/720/960.webp` for all 10 treatments (alt
texts and source URLs in §8). Source: **Pexels**, Pexels License (free
commercial use, attribution not required), recorded in
`assets-src/treatments/CREDITS.json` with `"illustrative": true`. The site
states they are illustrative and do not show clinic patients or results.

### Brand

See §4. OG image `/images/brand/og-image.jpg` 1200×630.

---

## 16. Privacy, compliance and medical wording

- No analytics, advertising or tracking scripts; no cookies set by the site.
- Google Maps loads only on request; WhatsApp only when the patient chooses.
- Minimum data collected; staff-only access; privacy policy under India's
  DPDP Act 2023 (§7.9).
- Medical wording rules: general, patient-friendly information only; no
  promised results, success rates, prices, "best" claims, testimonials or
  before/after images; everything individual goes to a consultation; "This
  website does not provide medical advice" on treatment pages, the privacy
  page and in the footer.
- Emergency safety line in the skin-allergy FAQ (swelling of face/lips/
  tongue or difficulty breathing → emergency care).
- Draft copy that needs owner review is marked in `CONTENT_TODO.md`.

---

## 17. Security

- **HTTP headers on every response:** `Content-Security-Policy: default-src
'self'; script-src 'self'; style-src 'self'; img-src 'self' data:;
font-src 'self'; connect-src 'self' https://firestore.googleapis.com
https://identitytoolkit.googleapis.com https://securetoken.googleapis.com;
frame-src https://www.google.com; frame-ancestors 'none'; base-uri 'self';
form-action 'self'; object-src 'none'; upgrade-insecure-requests` ·
  `X-Content-Type-Options: nosniff` · `X-Frame-Options: DENY` ·
  `Referrer-Policy: strict-origin-when-cross-origin` · `Permissions-Policy:
camera=(), microphone=(), geolocation=(), payment=()` ·
  `Strict-Transport-Security: max-age=31536000; includeSubDomains` ·
  `Cache-Control: no-cache` (pages); `/assets/**` `public, max-age=31536000,
immutable`; sitemap gets `default-src 'none'; style-src 'unsafe-inline';
frame-ancestors 'none'`.
- No inline scripts except JSON-LD data blocks; fonts never inlined as
  `data:` URLs (keeps `font-src 'self'`).
- Validation on the client **and** in Firestore rules; honeypot on forms.
- Secrets: `.env.local` (gitignored), `.env.example` with placeholders only;
  service-account keys never in the repo; `SECURITY.md` explains the model
  and what to do if a key leaks.
- Open decision carried forward: App Check / reCAPTCHA and rate limiting.

---

## 18. Accessibility

- Semantic landmarks, one H1 per page, logical heading order, skip-friendly
  nav with `aria-label="Primary"`.
- All images have alt text; decorative ones `alt=""`/`aria-hidden`.
- Forms: visible labels, required markers, hints and errors linked via
  `aria-describedby`, `aria-invalid`, focus moved to the first error,
  `role="alert"`/`aria-live` for results.
- Mobile menu with `aria-expanded`/`aria-controls`; links that open new tabs
  or apps say so in screen-reader text.
- WCAG 2.1 AA colour contrast (custom WhatsApp teal for contrast); visible
  focus styles; keyboard operable throughout.
- Lighthouse targets ≥ 90 for Accessibility, SEO, Best Practices.

---

## 19. Performance

- Prerendered HTML; self-hosted variable fonts; WebP responsive images with
  intrinsic sizes; hero image `fetchpriority="high"`.
- Admin + Firebase SDKs code-split; Firestore SDK loaded lazily for the
  booking save. Main bundle ≈ 127 kB gzipped.
- Long-cache hashed assets; gzip; map iframe deferred until requested.

---

## 20. Testing

- **Unit/component (Vitest + Testing Library, 22 files, 212 tests):** app
  routes render with their H1; navbar; footer privacy link; error boundary;
  privacy notice; WhatsApp links; About/Doctor/Contact/Appointment pages;
  validation; appointment service; admin dashboard, login and guard; admin
  list/filter/stats/CSV logic; phone numbers; SEO files (sitemap paths match
  routes and treatments, robots, prerender map); structured data; treatment
  SEO (title/description lengths, FAQs present); treatments data; WhatsApp
  messages; site URL env handling.
- **Firestore rules tests** (`@firebase/rules-unit-testing`, emulator): valid
  create allowed; extra/missing/oversized/malformed fields rejected; past or
  far-future dates rejected; non-admin read/update/delete denied; admin
  read and status update allowed; other field updates denied.
- **E2E (Playwright, against emulators):** booking flow incl. WhatsApp
  hand-off, honeypot rejection, admin login → status change persists after
  reload, sign-out blocks dashboard, WhatsApp prefilled text, responsive
  layouts.
- **Production checks (Playwright against the built, prerendered site with
  the real headers):** no CSP violations on every public page and admin
  login; unique titles/descriptions/canonicals on all 18 pages; JSON-LD valid
  and describes the real clinic; admin and unknown pages noindex; favicons
  and manifest served; robots.txt and sitemap use the live URL.
- Lighthouse reports stored in `lighthouse-reports/` (gitignored).

---

## 21. Tooling, configuration and operations

- **Stack today:** React 19, Vite 8, TypeScript 6 (strict), React Router 7,
  Tailwind CSS 4, lucide-react, react-helmet-async, Firebase JS SDK 13
  (Auth, Firestore), Playwright, Vitest, ESLint 10, Prettier, pnpm 11,
  Node ≥ 20.19.
- **Scripts:** `dev`, `build` (tsc + vite build + prerender), `lint`,
  `format`, `preview`, `test`, `test:rules`, `test:e2e`, `admin:claim`,
  `emulators`.
- **Environment variables:** `VITE_FIREBASE_API_KEY`, `_AUTH_DOMAIN`,
  `_PROJECT_ID`, `_STORAGE_BUCKET`, `_MESSAGING_SENDER_ID`, `_APP_ID`,
  `VITE_USE_FIREBASE_EMULATOR`, `VITE_SITE_URL`, `VITE_RECAPTCHA_SITE_KEY`
  (unused), `VITE_WHATSAPP_NUMBER` (override). WABA token/phone ID reserved,
  not used.
- **Emulators:** Auth 9099, Firestore 8080, project `demo-derma-world`.
- **Deployment:** Firebase Hosting (`firebase.json` rewrites each public path
  to its prerendered file, `trailingSlash: false`, headers above), Firestore
  rules/indexes via Firebase CLI. Alternative EC2 + nginx deployment in
  `deploy/` (`DEPLOYMENT_EC2.md`).
- **Docs:** `README.md`, `MASTER_PROMPT.md`, `DEPLOYMENT.md`,
  `DEPLOYMENT_EC2.md`, `SECURITY.md`, `CONTENT_TODO.md`, `SEO_AUDIT.md`,
  `LOCAL_SEO.md`, `GOOGLE_SETUP.md`.

---

## 22. Open items (content TODO)

- Owner/legal review of the privacy policy; legal entity; Firestore region;
  fixed retention period.
- Contact email; social links; doctor's registration number (optional).
- Before/after or testimonials only with written consent (none today).
- Admin accounts: create in Firebase Auth, then grant the admin claim.
- Decisions: anti-spam (App Check/reCAPTCHA), admin Google sign-in, custom
  domain, WhatsApp Business API provider.
- Google Business Profile: website link and phone alignment; Search Console
  follow-ups.
