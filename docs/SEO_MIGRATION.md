# SEO migration: derma-world-clinic.web.app → new domain

The new site keeps **the same English paths** as the old one (`/`, `/about`,
`/doctor`, `/treatments`, `/treatments/<slug>`, `/gallery`, `/contact`,
`/appointment`, `/privacy`), so every old URL has an exact new home.

## What the new site already does

| Area | Where |
| --- | --- |
| Unique title + description per page and locale; canonical to `NEXT_PUBLIC_SITE_URL` + path | `lib/seo/metadata.ts`, each page's `generateMetadata` |
| hreflang `en-IN` / `te-IN` / `hi-IN` + `x-default`, only for reviewed translations; unreviewed ones are `noindex` | `pageMetadata`, `app/sitemap.ts` |
| Open Graph + Twitter cards; 1200×630 OG image, plus one generated per treatment | `public/images/brand/og-image.jpg`, `treatments/[slug]/opengraph-image.tsx` |
| JSON-LD: `MedicalClinic`+`MedicalBusiness`, `WebSite`, `IndividualPhysician`, `BreadcrumbList`, `FAQPage`, `MedicalWebPage` (treatments). No ratings or reviews. | `lib/seo/jsonld.ts` |
| `sitemap.xml` with alternates, `lastModified` from Firestore `updatedAt`, and image entries | `app/sitemap.ts` |
| `robots.txt` disallows `/admin` and `/api` | `app/robots.ts` |
| Real 404s (also for unknown `/treatments/<slug>`), single 301 for trailing slashes | `middleware.ts`, `notFound()` |
| Server-rendered HTML: every page has its own H1, content and canonical before any JavaScript | Next.js App Router |
| Search Console file `/googleb905c7b65609e4b5.html` served unchanged | `public/` |
| Keyword map: home → "dermatologist in Moula Ali"; each treatment → its service + location; "near ECIL", never "in ECIL"; no "best" | content in Firestore (`seed.ts`) |

## Steps on launch day

1. **Set the domain.** Set `NEXT_PUBLIC_SITE_URL=https://<new-domain>` in
   Vercel, redeploy, then open `/sitemap.xml` and one page's source and check
   that every canonical and hreflang URL uses the new domain.
2. **Redirect the old site.** In the old project
   (`C:\Users\adepu\Desktop\derma-world-clinic`), add this to the `hosting`
   section of `firebase.json`, with your real domain in place of `<new-domain>`.
   Files with a dot, such as the verification file, keep being served:

   ```json
   "redirects": [
     { "regex": "^/(?P<path>[^.]*)$", "destination": "https://<new-domain>/:path", "type": 301 }
   ]
   ```

   Then run `pnpm exec firebase deploy --only hosting` from the old project.
   Check: `curl -I https://derma-world-clinic.web.app/doctor` returns `301` with
   `location: https://<new-domain>/doctor`.
3. **Search Console.**
   - Add a **Domain property** for the new domain (DNS TXT verification).
   - In the old `https://derma-world-clinic.web.app/` property: Settings →
     **Change of address** → choose the new property. (If Search Console doesn't
     offer this for a `web.app` URL-prefix property, the 301s alone carry the
     signals; it just takes longer.)
   - In the new property: Sitemaps → submit `sitemap.xml`. Remove any old
     `sitemap_index.xml` entry.
   - URL Inspection → **Request indexing** once each for `/`, `/contact`,
     `/doctor`, `/treatments`, `/treatments/acne-pimple-treatment`,
     `/treatments/hair-fall-prp-therapy` and `/treatments/pigmentation-chemical-peels`.
4. **Google Business Profile.** Change the website to `https://<new-domain>/`
   and the appointment link to `https://<new-domain>/appointment`.
5. **Everywhere else.** Update the link on directories (Practo, Justdial,
   ClinicSpots, Lybrate), the WhatsApp Business profile and social pages. Use
   exactly the same name, address and phone as the website.

## Check after deploy

- [Rich Results Test](https://search.google.com/test/rich-results) on `/`,
  `/doctor` and one treatment page: 0 errors.
- [Schema validator](https://validator.schema.org/) on the same pages.
- PageSpeed Insights (mobile) on `/` and a treatment page: aim for Performance ≥ 90, SEO = 100.
- Weekly for 6–8 weeks: Search Console → Pages (indexed vs. not indexed), and
  the old property's traffic moving to the new one.

## Off-site work that moves local rankings most

These aren't code changes, but for "dermatologist near me / in Moula Ali /
near ECIL" searches, the map results depend on them more than on the website:

- Business Profile: name exactly as on the signboard (no doctor's name in it),
  primary category **Dermatologist**, every service added, real photos, hours
  including holiday hours.
- Honest Google reviews from real patients (no incentives), each one answered
  without health details.
- Directory listings with identical name, address and phone.
- Doctor-reviewed educational articles later, only with the doctor's input.
