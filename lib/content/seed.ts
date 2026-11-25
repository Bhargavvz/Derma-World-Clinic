/**
 * Seed content, written faithfully from docs/WEBSITE_INVENTORY.md.
 * Used by scripts/seed.ts to populate Firestore, and as the fallback when
 * Firestore isn't configured (local development without Firebase).
 * Telugu/Hindi are "missing" until drafted and reviewed (see CONTENT_TODO).
 */
import type { ClinicSettings, Doctor, Faq, GalleryItem, Localized, Procedure, ReviewStatus, Treatment } from "./types";

const e = (en: string): Localized => ({ en });
const rs: ReviewStatus = { te: "missing", hi: "missing" };

export const seedClinic: ClinicSettings = {
  name: "Derma World Skin & Hair Clinic",
  alternateNames: ["Derma World Skin and Hair Clinic", "Derma World Clinic"],
  tagline: "Dermatology, Cosmetology, Hair, Laser",
  address: {
    lines: ["Above Lucid Diagnostics, Beside More Supermarket", "Moula Ali, Near ECIL", "Secunderabad, Telangana 500040"],
    street: "Above Lucid Diagnostics, Beside More Supermarket, Moula Ali, Near ECIL",
    locality: "Secunderabad",
    region: "Telangana",
    postalCode: "500040",
    country: "IN",
  },
  landmarks: e("Above Lucid Diagnostics, beside More Supermarket, Moula Ali — near ECIL"),
  geo: { lat: 17.4541174, lng: 78.5660833 },
  mapsPlaceUrl: "https://www.google.com/maps?cid=7322615052301373528",
  mapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m3!3m2!1m1!4s7322615052301373528!3m1!1sen!5m1!1sen",
  directionsDestination:
    "DERMA WORLD SKIN & HAIR CLINIC (Dr.Sathaiah Sudhamalla), Street Number 1, APHB Colony, Moula Ali, Hyderabad, Telangana 500040",
  phones: [
    { display: "+91 78931 71659", tel: "+917893171659", label: e("Calls & WhatsApp"), whatsapp: true },
    { display: "+91 95156 43181", tel: "+919515643181", label: e("Calls only"), whatsapp: false },
  ],
  whatsappNumber: "917893171659",
  email: null,
  socialLinks: [],
  openingHours: [
    {
      days: e("Monday – Saturday"),
      schemaDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      sessions: [{ open: "10:00", close: "22:00" }],
      display: e("10:00 AM – 10:00 PM"),
      note: null,
    },
    {
      days: e("Sunday"),
      schemaDays: ["Sunday"],
      sessions: [
        { open: "10:00", close: "14:00" },
        { open: "17:00", close: "22:00" },
      ],
      display: e("10:00 AM – 2:00 PM and 5:00 PM – 10:00 PM"),
      note: e("By prior appointment only"),
    },
  ],
  shortHours: e("Mon–Sat 10 AM – 10 PM · Sunday by prior appointment"),
  sundayNote: e("Sunday consultations are by prior appointment only, subject to confirmation by the clinic."),
  feesNote: e("Please call or message the clinic for current fees."),
  areasServed: ["Moula Ali", "ECIL", "Hyderabad", "Secunderabad"],
  reviewStatus: rs,
};

export const seedDoctor: Doctor = {
  id: "sathaiah-sudhamalla",
  name: "Dr. Sathaiah Sudhamalla",
  role: e("Consultant Dermatologist & Cosmetologist"),
  qualificationsShort: "MBBS (Osmania), MD DVL (Gandhi)",
  qualifications: [e("MBBS — Osmania"), e("MD in Dermatology, Venereology & Leprosy (DVL) — Gandhi")],
  positions: [
    e("Consultant Dermatologist & Cosmetologist, Derma World Skin & Hair Clinic, Moula Ali"),
    e("Assistant Professor, Department of DVL (Dermatology, Venereology & Leprosy), Gandhi Medical College, Secunderabad"),
  ],
  memberships: [
    { name: e("Life Member, Indian Association of Dermatologists, Venereologists and Leprologists (IADVL)"), number: "LM/TS/9586" },
    { name: e("Life Member, Association of Cutaneous Surgeons of India (ACSI)"), number: "TS/ACSI/2942/LM" },
  ],
  publications: 15,
  interestsIntro: e("Clinical dermatology, particularly:"),
  interests: [e("Psoriasis"), e("Urticaria"), e("Autoimmune bullous diseases (AIBDs)")],
  introduction: [
    e(
      "Dr. Sathaiah Sudhamalla is a Consultant Dermatologist & Cosmetologist at Derma World Skin & Hair Clinic, Moula Ali, and an Assistant Professor in the Department of DVL (Dermatology, Venereology & Leprosy) at Gandhi Medical College, Secunderabad.",
    ),
    e(
      "Each consultation starts with understanding your concern and examining your skin, hair, scalp or nails, followed by a clear explanation of the options suited to you — so you can make an informed decision about your care.",
    ),
  ],
  photo: {
    path: "/images/clinic/doctor-sathaiah-sudhamalla-380.webp",
    alt: e("Dr. Sathaiah Sudhamalla at the consultation desk"),
    width: 380,
    height: 462,
  },
  conferencePhoto: {
    path: "/images/clinic/doctor-cuticon-telangana-900.webp",
    alt: e("Dr. Sathaiah Sudhamalla (second from left) at CUTICON Telangana"),
    caption: e("Dr. Sathaiah Sudhamalla (second from left) at CUTICON Telangana, a dermatology conference."),
    width: 900,
    height: 1200,
  },
  registrationNumber: null,
  published: true,
  order: 0,
  reviewStatus: rs,
};

function treatment(t: {
  slug: string;
  name: string;
  group: Treatment["group"];
  summary: string;
  overview: string[];
  concerns: string[];
  consultation: string[];
  alt: string;
  credit: string;
  seoTitle: string;
  seoDescription: string;
  faqs: [string, string][];
  order: number;
}): Treatment {
  return {
    slug: t.slug,
    name: e(t.name),
    group: t.group,
    summary: e(t.summary),
    overview: t.overview.map(e),
    concerns: t.concerns.map(e),
    consultation: t.consultation.map(e),
    image: {
      path: `/images/treatments/${t.slug}-960.webp`,
      alt: e(t.alt),
      credit: t.credit,
      illustrative: true,
      width: 960,
      height: 640,
    },
    seo: { title: e(t.seoTitle), description: e(t.seoDescription) },
    faqs: t.faqs.map(([q, a]) => ({ question: e(q), answer: e(a) })),
    order: t.order,
    published: true,
    bookable: true,
    reviewStatus: rs,
  };
}

export const seedTreatments: Treatment[] = [
  treatment({
    slug: "acne-pimple-treatment",
    name: "Acne & Pimple Treatment",
    group: "skin",
    summary: "Assessment and management of acne and pimples — from blackheads and whiteheads to red, inflamed breakouts.",
    overview: [
      "Acne is one of the most common skin conditions and affects teenagers and adults alike. It can range from occasional pimples to persistent, painful breakouts.",
      "At your consultation, the doctor examines your skin, asks about your skincare routine and possible triggers, and explains the options suited to your skin type and the type of acne you have.",
    ],
    concerns: ["Blackheads and whiteheads", "Red, inflamed pimples", "Painful, deeper breakouts", "Acne that keeps coming back"],
    consultation: [
      "A skin examination and discussion of your history",
      "A treatment plan, which may include medicines applied to the skin or taken by mouth",
      "Practical skincare advice for acne-prone skin",
      "Follow-up visits to review progress",
    ],
    alt: "Young woman applying a serum to a pimple on her cheek",
    credit: "https://www.pexels.com/photo/woman-applying-facial-serum-6476077/",
    seoTitle: "Acne & Pimple Treatment in Moula Ali, near ECIL | Derma World",
    seoDescription:
      "Acne and pimple treatment with a dermatologist in Moula Ali, near ECIL: skin examination, a treatment plan for your acne type, and follow-up visits.",
    faqs: [
      [
        "When should I see a dermatologist for acne?",
        "If pimples are frequent, painful, leaving marks or scars, or not improving with regular skincare, a consultation can help identify the type of acne you have and the treatment options suited to it.",
      ],
      [
        "How long does acne treatment take?",
        "It differs from person to person. Acne treatments usually take several weeks to show a change, and follow-up visits let the doctor review progress and adjust the plan.",
      ],
      [
        "Should I bring my current skincare products?",
        "Yes — bring them or a list of them. Some products can aggravate acne, and the doctor will advise which ones to continue.",
      ],
    ],
    order: 1,
  }),
  treatment({
    slug: "acne-scar-treatment",
    name: "Acne Scar Treatment",
    group: "skin",
    summary: "Evaluation of acne scars and marks, with a plan matched to the type of scarring.",
    overview: [
      "Acne can leave behind dark marks or textured scars. Different types of scars respond to different approaches, so treatment starts by identifying the kind of scarring you have.",
      "The doctor will explain the options available at the clinic, how many sessions may be needed, and what improvement is realistic for your skin.",
    ],
    concerns: ["Dark marks left after pimples", "Pitted or depressed scars", "Uneven skin texture"],
    consultation: [
      "Assessment of your scar type and skin",
      "Discussion of suitable in-clinic options",
      "Clear, realistic expectations before you begin",
      "Active acne is usually brought under control first",
    ],
    alt: "Doctor examining facial skin with a digital dermatoscope",
    credit: "https://www.pexels.com/photo/a-tablet-with-a-magnifier-7446660/",
    seoTitle: "Acne Scar Treatment in Moula Ali, Hyderabad | Derma World",
    seoDescription:
      "Acne scar and acne mark treatment in Moula Ali, Hyderabad. The dermatologist identifies your scar type and explains suitable in-clinic options and realistic results.",
    faqs: [
      [
        "Does active acne need to be treated before acne scars?",
        "Usually, yes. New breakouts can cause new marks and scars, so the doctor generally brings active acne under control before starting scar treatment.",
      ],
      [
        "Can acne scars be removed completely?",
        "Scar treatments aim to improve the appearance of scars. How much improvement is possible depends on the type and depth of scarring and on your skin, and the doctor will discuss realistic expectations with you.",
      ],
      [
        "Are dark marks after pimples the same as scars?",
        "Not always. Flat dark marks are often pigmentation, while pitted or depressed areas are textural scars. They are treated differently, which is why the type is assessed first.",
      ],
    ],
    order: 2,
  }),
  treatment({
    slug: "hair-fall-prp-therapy",
    name: "Hair Fall & PRP Therapy",
    group: "hair",
    summary: "Consultation to understand the cause of your hair fall, with PRP therapy offered where it is suitable.",
    overview: [
      "Hair fall can have many causes, including genetics, stress, nutrition, hormonal changes, and scalp conditions. The consultation focuses on finding the likely cause before recommending treatment.",
      "Platelet-rich plasma (PRP) therapy uses a concentrate prepared from a small sample of your own blood, which is then applied to the scalp. The doctor will advise whether PRP is appropriate for you.",
    ],
    concerns: ["Increased hair shedding", "Thinning hair", "Patterned hair loss", "Scalp conditions linked to hair fall"],
    consultation: [
      "A scalp and hair examination",
      "Blood tests or a scalp biopsy, if the doctor advises them",
      "A plan that may include medicines and/or PRP sessions",
      "Regular reviews to monitor progress",
    ],
    alt: "Hand holding strands of fallen hair beside a comb",
    credit: "https://www.pexels.com/photo/close-up-photo-of-a-person-holding-hair-9755382/",
    seoTitle: "Hair Fall Treatment & PRP Therapy near ECIL | Derma World",
    seoDescription:
      "Hair fall treatment and PRP hair therapy near ECIL, Hyderabad. A dermatologist finds the likely cause of your hair fall first and advises whether PRP suits you.",
    faqs: [
      [
        "What causes hair fall?",
        "Hair fall can be linked to genetics, stress, illness, nutrition, hormonal changes, certain medicines and scalp conditions. Finding the likely cause is the first step, and the doctor may suggest blood tests.",
      ],
      [
        "Is PRP suitable for everyone?",
        "No. PRP is offered only where the doctor finds it suitable, after examining your scalp and reviewing the cause of your hair fall and your medical history.",
      ],
      [
        "How many PRP sessions will I need?",
        "This varies from person to person. If PRP is suitable for you, the doctor will explain the planned number of sessions and how progress will be reviewed.",
      ],
    ],
    order: 3,
  }),
  treatment({
    slug: "pigmentation-chemical-peels",
    name: "Pigmentation & Chemical Peels",
    group: "skin",
    summary: "Care for dark spots, patches, and uneven skin tone, including chemical peel treatments.",
    overview: [
      "Pigmentation — such as dark spots, patches, melasma, and tanning — is a common concern and can have several causes, including sun exposure and hormonal changes.",
      "A chemical peel is a controlled treatment in which a solution is applied to the skin to gently remove its outer layers. The doctor assesses your skin to decide whether a peel, other treatment, or a combination is appropriate.",
    ],
    concerns: ["Dark spots and patches", "Melasma", "Tanning and uneven skin tone", "Marks left after acne"],
    consultation: [
      "A skin assessment to understand the type of pigmentation",
      "A peel or treatment chosen for your skin type",
      "Sun-protection and aftercare advice",
      "More than one session may be advised",
    ],
    alt: "Gloved practitioner applying a facial treatment to a woman lying down",
    credit: "https://www.pexels.com/photo/cosmetologist-applying-facial-mask-on-customer-face-in-spa-salon-5069494/",
    seoTitle: "Pigmentation Treatment & Chemical Peels in Moula Ali | Derma World",
    seoDescription:
      "Pigmentation treatment and chemical peels in Moula Ali, near ECIL: care for dark spots, melasma, tanning and uneven skin tone after a dermatologist's assessment.",
    faqs: [
      [
        "Is a chemical peel suitable for my skin?",
        "The doctor assesses your skin type and the kind of pigmentation before recommending a peel. Temporary redness or peeling can occur, and you will be given aftercare advice.",
      ],
      [
        "Why is sun protection important for pigmentation?",
        "Sun exposure can darken pigmentation and make it return, so daily sun protection is an important part of any pigmentation treatment plan.",
      ],
      ["Will I need more than one session?", "Often, yes. The doctor will explain how many sessions may be advised for your skin and concern."],
    ],
    order: 4,
  }),
  treatment({
    slug: "skin-allergies",
    name: "Skin Allergies",
    group: "skin",
    summary: "Diagnosis and management of itchy rashes, hives, and allergic skin reactions.",
    overview: [
      "Skin allergies can cause itching, redness, rashes, or hives. Finding the trigger — for example certain cosmetics, detergents, metals, foods, or medicines — is an important part of managing them.",
      "The doctor examines the skin, reviews your history, and recommends treatment to relieve symptoms and help reduce future flare-ups.",
    ],
    concerns: ["Itchy rashes and redness", "Hives (urticaria)", "Reactions to cosmetics, detergents, or metals", "Recurring skin irritation"],
    consultation: [
      "A skin examination and detailed history",
      "Help identifying possible triggers",
      "Treatment to relieve symptoms",
      "Advice to help prevent flare-ups",
    ],
    alt: "Man scratching an itchy arm",
    credit: "https://www.pexels.com/photo/man-scratching-a-hand-14387797/",
    seoTitle: "Skin Allergy Treatment near ECIL, Moula Ali | Derma World",
    seoDescription:
      "See a dermatologist near ECIL, Moula Ali for itchy rashes, hives and allergic skin reactions. Diagnosis, help identifying triggers and treatment to relieve symptoms.",
    faqs: [
      [
        "When should I see a doctor for a skin rash?",
        "Book a consultation if a rash spreads, lasts more than a few days, keeps coming back, or affects your sleep or daily life. Seek emergency care immediately for swelling of the face, lips or tongue, or any difficulty breathing.",
      ],
      [
        "Can the doctor find out what I am allergic to?",
        "The doctor reviews your history and examines your skin to identify likely triggers, such as cosmetics, detergents, metals, foods or medicines, and may suggest tests if they are needed.",
      ],
    ],
    order: 5,
  }),
  treatment({
    slug: "fungal-infections",
    name: "Fungal Infections",
    group: "skin",
    summary: "Diagnosis and treatment of common fungal infections of the skin, scalp, and nails.",
    overview: [
      "Fungal infections such as ringworm (tinea) are common, especially in warm and humid weather. They can cause itchy, red, ring-shaped, or scaly patches, and may spread or return if not treated fully.",
      "The doctor confirms the diagnosis, prescribes a suitable course of treatment, and explains how to help prevent the infection from coming back.",
    ],
    concerns: ["Ringworm (tinea) on the body or groin", "Fungal infections of the scalp", "Fungal nail infections", "Infections that keep returning"],
    consultation: [
      "A skin examination to confirm the diagnosis",
      "A prescribed treatment course — completing it matters",
      "Hygiene and prevention advice",
      "Follow-up for persistent infections",
    ],
    alt: "Person washing their feet as part of foot care",
    credit: "https://www.pexels.com/photo/close-up-of-woman-washing-feet-with-organic-soap-5240788/",
    seoTitle: "Fungal Infection Treatment in Moula Ali, Hyderabad | Derma World",
    seoDescription:
      "Diagnosis and treatment of ringworm and other fungal infections of the skin, scalp and nails by a dermatologist in Moula Ali, Hyderabad, with prevention advice.",
    faqs: [
      [
        "Why do fungal infections keep coming back?",
        "Common reasons include stopping treatment as soon as the itching settles, heat and sweating, tight clothing, and infection in family members or shared items. Completing the full course and following prevention advice both matter.",
      ],
      [
        "Should I use creams from the pharmacy first?",
        "It is better to get a diagnosis first. Some creams sold over the counter, especially those containing steroids, can make a fungal infection harder to diagnose and treat.",
      ],
    ],
    order: 6,
  }),
  treatment({
    slug: "warts-skin-tags",
    name: "Warts & Skin Tags",
    group: "skin",
    summary: "Assessment and removal of warts and skin tags.",
    overview: [
      "Warts are small skin growths caused by a viral infection, while skin tags are soft growths that often appear on the neck, underarms, or other skin folds. Both are common and can be bothersome or affect appearance.",
      "The doctor examines the growth to confirm what it is and discusses suitable removal options at the clinic.",
    ],
    concerns: ["Common warts on the hands or feet", "Warts on the soles of the feet", "Skin tags on the neck, underarms, or skin folds"],
    consultation: [
      "An examination to confirm the diagnosis",
      "Discussion of removal options, which may include radiofrequency ablation",
      "Aftercare advice",
    ],
    alt: "Magnifying glass held over a small spot on the forearm",
    credit: "https://www.pexels.com/photo/person-holding-magnifying-glass-with-white-background-5701545/",
    seoTitle: "Warts & Skin Tag Removal near Moula Ali, ECIL | Derma World",
    seoDescription:
      "Warts and skin tags assessed and removed at a dermatology clinic in Moula Ali, near ECIL. Removal options, which may include radiofrequency ablation, explained first.",
    faqs: [
      [
        "Are warts contagious?",
        "Warts are caused by a viral infection and can spread through direct contact or by picking or shaving over them. The doctor will confirm the diagnosis before discussing removal.",
      ],
      [
        "How are warts and skin tags removed?",
        "The doctor examines the growth and discusses suitable removal options at the clinic, which may include radiofrequency ablation, along with aftercare advice.",
      ],
    ],
    order: 7,
  }),
  treatment({
    slug: "laser-treatments",
    name: "Laser Treatments",
    group: "cosmetology",
    summary: "Laser-based skin treatments, offered after the doctor has assessed whether laser is suitable for you.",
    overview: [
      "Lasers use focused light energy and are used in dermatology for a range of skin concerns. Whether a laser treatment is right for you depends on your skin type and the concern being treated.",
      "The doctor assesses your skin first and, if laser is suitable, explains the likely number of sessions, the aftercare involved, and possible side effects before you decide.",
    ],
    concerns: [],
    consultation: [
      "A skin assessment to decide whether laser is suitable for you",
      "An explanation of the procedure, sessions and expected recovery",
      "Protective eyewear and aftercare advice, including sun protection",
      "Results vary between individuals; more than one session is often needed",
    ],
    alt: "Practitioner performing a laser treatment on a patient wearing protective glasses",
    credit: "https://www.pexels.com/photo/cosmetologist-performing-scar-whitening-on-a-woman-4586726/",
    seoTitle: "Laser Skin Treatments in Moula Ali, Hyderabad | Derma World",
    seoDescription:
      "Laser skin treatments in Moula Ali, Hyderabad, offered only after a dermatologist checks that laser suits your skin type and concern. Sessions and aftercare explained.",
    faqs: [
      [
        "Is laser treatment suitable for every skin type?",
        "Not always. Suitability depends on your skin type and the concern being treated, so the doctor assesses your skin before recommending any laser treatment.",
      ],
      [
        "How many laser sessions are needed?",
        "More than one session is often needed, and results vary between individuals. The doctor explains the likely number of sessions, recovery and aftercare before you decide.",
      ],
    ],
    order: 8,
  }),
  treatment({
    slug: "anti-ageing-fillers-botox",
    name: "Anti-ageing (Fillers & Botox)",
    group: "cosmetology",
    summary: "Injectable anti-ageing treatments — dermal fillers and botulinum toxin (Botox®) — after a medical assessment.",
    overview: [
      "Dermal fillers and botulinum toxin (widely known by the brand name Botox®) are injectable treatments used to soften the appearance of certain lines and wrinkles and to restore lost facial volume.",
      "These are medical procedures. The doctor assesses your face, medical history and goals, and explains what each option can and cannot do, before any treatment.",
    ],
    concerns: ["Forehead and frown lines", "Lines around the eyes (crow's feet)", "Loss of facial volume"],
    consultation: [
      "An assessment of your face, medical history and goals",
      "An explanation of the options, expected results and possible side effects",
      "Results are temporary and vary between individuals; repeat treatments may be needed",
    ],
    alt: "Gloved practitioner giving a cosmetic injection in a woman's forehead",
    credit: "https://www.pexels.com/photo/woman-getting-a-face-botox-3985311/",
    seoTitle: "Anti-ageing Treatments, Fillers & Botox in Hyderabad | Derma World",
    seoDescription:
      "Anti-ageing consultations in Moula Ali, Hyderabad: dermal fillers and Botox® for lines and volume loss, after a medical assessment by a dermatologist.",
    faqs: [
      [
        "How long do fillers and Botox last?",
        "Results are temporary, and how long they last varies between individuals and treatments. The doctor will explain what to expect and when repeat treatment may be considered.",
      ],
      [
        "Are fillers and Botox medical procedures?",
        "Yes. They are injectable medical treatments. The doctor assesses your face, medical history and goals and explains possible side effects before any treatment.",
      ],
    ],
    order: 9,
  }),
  treatment({
    slug: "nail-disorders",
    name: "Nail Disorders",
    group: "nails",
    summary: "Diagnosis and treatment of nail problems, from fungal infections to brittle, discoloured or painful nails.",
    overview: [
      "Nail problems such as infection, discolouration, thickening, brittleness, or changes in nail shape can have many causes — and some reflect skin conditions or general health.",
      "The doctor examines your nails, may suggest tests to confirm the cause, and then recommends a suitable treatment.",
    ],
    concerns: [
      "Fungal nail infections",
      "Discoloured or thickened nails",
      "Brittle, splitting or ridged nails",
      "Painful or ingrown nails",
      "Infection around the nail (paronychia)",
    ],
    consultation: [
      "An examination of your nails and surrounding skin",
      "Tests, if the doctor advises them, to confirm the cause",
      "A treatment plan and nail-care advice",
    ],
    alt: "Close-up of a hand with natural, unpolished fingernails",
    credit: "https://www.pexels.com/photo/close-up-photo-of-person-s-hand-7298694/",
    seoTitle: "Nail Disorder Treatment near ECIL, Moula Ali | Derma World",
    seoDescription:
      "Dermatologist care near ECIL, Moula Ali for nail problems: fungal nail infections, discoloured, thickened, brittle, painful or ingrown nails and paronychia.",
    faqs: [
      [
        "When should I see a dermatologist about my nails?",
        "Book a consultation if a nail changes colour, thickness or shape and does not improve, or if the nail or the skin around it becomes painful, swollen or infected.",
      ],
      [
        "Why does a fungal nail infection take long to treat?",
        "Nails grow slowly, so treatment often continues for months until healthy nail grows out. Completing the course the doctor prescribes is important.",
      ],
    ],
    order: 10,
  }),
];

export const seedProcedures: Procedure[] = [
  ["Skin, hair and nail disorders", "Consultation, diagnosis and treatment for a wide range of conditions."],
  ["Chemical peeling", "Controlled peels for pigmentation, acne marks and uneven skin tone."],
  ["PRP (platelet-rich plasma) therapy", "Offered for hair regrowth where the doctor finds it suitable."],
  ["Acne scar treatments", "Options chosen according to the type of scarring."],
  ["Laser", "Laser-based treatments after a suitability assessment."],
  ["Anti-ageing (fillers, Botox®)", "Injectable treatments for lines, wrinkles and volume loss."],
  ["Radiofrequency ablation", "Used to remove certain skin growths, such as warts and skin tags."],
  ["Intralesional injections", "Medicine injected directly into a skin lesion, when appropriate."],
  ["Skin and scalp biopsy", "A small sample taken to help confirm a diagnosis."],
].map(([name, description], i) => ({
  id: `procedure-${i + 1}`,
  name: e(name!),
  description: e(description!),
  order: i + 1,
  reviewStatus: rs,
}));

function photo(id: string, file: string, alt: string, caption: string, order: number): GalleryItem {
  return {
    id,
    image: { path: `/images/clinic/${file}-900.webp`, alt: e(alt), width: 900, height: 1600 },
    caption: e(caption),
    order,
    published: true,
    genuine: true,
    reviewStatus: rs,
  };
}

export const seedGallery: GalleryItem[] = [
  photo("reception", "reception-and-pharmacy", "Reception desk and in-clinic pharmacy", "Reception & pharmacy", 1),
  {
    ...photo("entrance", "clinic-entrance-signboard", "Clinic entrance with the Derma World services signboard", "Clinic entrance", 2),
    image: { path: "/images/clinic/clinic-entrance-signboard-720.webp", alt: e("Clinic entrance with the Derma World services signboard"), width: 720, height: 1280 },
  },
  photo("waiting-seating", "waiting-area-seating", "Patient waiting area with seating", "Waiting area", 3),
  photo("waiting-tv", "waiting-area-tv", "Second waiting area with a wall-mounted TV", "Waiting lounge", 4),
  photo("procedure-room", "procedure-room-door", "Entrance to the clinic's procedure room", "Procedure room", 5),
];

/** Hero photo (not a gallery item). */
export const heroClinicImage = {
  path: "/images/clinic/hero-reception-900.webp",
  alt: e("Reception desk and pharmacy at Derma World Skin & Hair Clinic"),
  width: 900,
  height: 1125,
};

export const seedFaqs: Faq[] = [
  [
    "Where is the clinic?",
    "Derma World Skin & Hair Clinic is above Lucid Diagnostics, beside More Supermarket, Moula Ali, near ECIL, Secunderabad, Telangana 500040. See [contact and directions](/contact).",
  ],
  [
    "What are the clinic timings?",
    "Monday to Saturday, 10:00 AM – 10:00 PM. Sunday, 10:00 AM – 2:00 PM and 5:00 PM – 10:00 PM, by prior appointment only.",
  ],
  [
    "How do I book an appointment?",
    "Send a request through the [appointment page](/appointment), call +91 78931 71659 or +91 95156 43181, or message the clinic on WhatsApp. Your visit is confirmed only when the clinic confirms it.",
  ],
  [
    "Who is the doctor?",
    "[Dr. Sathaiah Sudhamalla](/doctor), MBBS (Osmania), MD DVL (Gandhi), Consultant Dermatologist & Cosmetologist and Assistant Professor at Gandhi Medical College, Secunderabad.",
  ],
  [
    "Which treatments are available?",
    "Consultations and treatment for skin, hair, scalp and nail concerns, including acne and acne scars, pigmentation, hair fall and PRP, skin allergies, fungal infections, warts and skin tags, laser and anti-ageing. See [all treatments](/treatments).",
  ],
  ["What are the consultation fees?", "Please call or message the clinic for current fees."],
].map(([question, answer], i) => ({
  id: `home-faq-${i + 1}`,
  page: "home" as const,
  question: e(question!),
  answer: e(answer!),
  order: i + 1,
  reviewStatus: rs,
}));
