/**
 * /cases portfolio data — verified live 2026-06-14 (buildId _MsCuqDt4GbkeAFMyjWlP),
 * canonical DOM text (names render uppercase via CSS; stored in their source case).
 *
 * The four arrays are the masonry COLUMNS in DOM order (col-0 … col-3). The visual
 * left→right order is set by the grid's `grid-template-areas: "col-2 col-0 col-1 col-3"`
 * (see CaseGrid) — NOT by this array order. Each column is aspect-uniform (verified live):
 *   col-0 → 2:3 (9 cards) · col-1 → 3:4 (8) · col-2 → 3:4 (8) · col-3 → 2:3 (8) = 33.
 *
 * `desc` strings are byte-faithful to the live (incl. a trailing space on x-bionic-terraskin
 * and the curly apostrophe / en-dash the live ships). `alt` is the live's alt text verbatim
 * (used only as the placeholder label this round; real cover assets land in Section 7).
 */
export type CaseAR = "2:3" | "3:4";

export interface CaseItem {
  slug: string;
  name: string;
  desc: string;
  pill?: string;
  alt: string;
  ar: CaseAR;
  /** Caption text colour. Live paints 5 light-cover cases' captions BLACK; absence = white default. */
  caption?: "dark";
}

/** DOM column order col-0..col-3. Visual placement is via grid-template-areas in CaseGrid. */
export const CASE_COLUMNS: CaseItem[][] = [
  // col-0 — visual slot 2 — 9 cards, 2:3
  [
    { slug: "suitsupply", name: "Suitsupply", desc: "Creative partnership since 2018", alt: "Suitsupply Case Cover", ar: "2:3" },
    { slug: "bloom-wolf", name: "Bloom & Wolf", desc: "Rebranding, content creation and a scalable e-commerce solution", pill: "Newly Added", alt: "Bloom & Wolf Calle bouquet", ar: "2:3" },
    { slug: "akris", name: "AKRIS", desc: "Meticulous redesign & development of a sensual minimalist fashion house", pill: "Shopify", alt: "A woman in a blue dress poses confidently against a swirling blue background, holding a matching blue handbag.", ar: "2:3" },
    { slug: "x-bionic", name: "X-BIONIC", desc: "Science-based sportswear", alt: "XBIONIC cycling", ar: "2:3" },
    { slug: "mammut", name: "Mammut", desc: "Moved by mountains", alt: "Climbers ascending the Matterhorn mountain", ar: "2:3" },
    { slug: "foam-platform", name: "Foam Museum", desc: "Cultural platform all about photography", alt: "Mous Lamrabat", ar: "2:3" },
    { slug: "expedition-baikal", name: "Expedition Baikal", desc: "Shoppable expedition", alt: "Climber in cave", ar: "2:3" },
    { slug: "powerhouse-company", name: "Powerhouse Company", desc: "Giving meaning to space", alt: "Powerhouse floating office in Rotterdam", ar: "2:3" },
    { slug: "mollie", name: "Mollie", desc: "Grow your way", alt: "Mollie case header", ar: "2:3" },
  ],
  // col-1 — visual slot 3 — 8 cards, 3:4
  [
    { slug: "polaroid", name: "Polaroid", desc: "Rebuilding Polaroid’s digital flagship with headless Shopify", pill: "Headless Shopify", alt: "polaroid-poster", ar: "3:4" },
    { slug: "x-bionic-terraskin", name: "XBIONIC Terraskin", desc: "Launching the first trail running footwear system ", pill: "Headless Shopify", alt: "XBIONIC Terraskin trail running", ar: "3:4" },
    { slug: "adidas", name: "Adidas", desc: "Design system to unify all digital touchpoints", alt: "IVYPARK 2020", ar: "3:4" },
    { slug: "klabu", name: "KLABU", desc: "Building an expressive platform that embodies an unbeatable spirit", pill: "Shopify", alt: "hibo-en-hani-from-somalia-foto-in-2019-gemaakt-in-kenia", ar: "3:4" },
    { slug: "bezier", name: "Bézier", desc: "Envisioning a futurist identity & flagship store for a pioneering type foundry", alt: "Bezier reveal", ar: "3:4" },
    { slug: "rocycle", name: "Rocycle Studios", desc: "Kinetic branding & platform", alt: "Rocycle", ar: "3:4" },
    { slug: "foam-talent-2020", name: "Foam Talent 2020", desc: "An exhibition without walls", alt: "Foam Talent 2020", ar: "3:4" },
    { slug: "abel-vita-odor", name: "Abel vita odor", desc: "Sparking all senses but smell", alt: "Abel nori", ar: "3:4" },
  ],
  // col-2 — visual slot 1 (leftmost) — 8 cards, 3:4
  [
    { slug: "vitra-gift-finder", name: "Vitra", desc: "Designing & engineering an immersive gift finder", pill: "Most Awarded", alt: "Objects and gifts from the Vitra Gift Finder website. There is a wooden bird in the middle, surrounded by a cork stool, an elephant, sculptures, a clock and a small table.", ar: "3:4", caption: "dark" },
    { slug: "roger-vivier", name: "Roger Vivier", desc: "Parisian Luxury meets digital elegance", alt: "Roger Vivier Express Campaign", ar: "3:4" },
    { slug: "polaroid-i-2", name: "Polaroid I-2", desc: "Shoppable campaign site to launch the premium I–2 camera", pill: "Shopify", alt: "Polaroid cover", ar: "3:4" },
    { slug: "the-balvenie", name: "The Balvenie", desc: "A digital journey", alt: "Rare Marriages The Balvenie", ar: "3:4" },
    { slug: "land-of-ride", name: "Land of Ride", desc: "Unfold the world of adventures", pill: "Shopify", alt: "Land of Ride", ar: "3:4" },
    { slug: "secrid", name: "Secrid", desc: "A better world starts in your pocket", alt: "s", ar: "3:4", caption: "dark" },
    { slug: "foam-talent-2021", name: "Foam Talent 2021", desc: "A digital exhibition celebrating emotional browsing", pill: "Most Awarded", alt: "Foam Talent 2021", ar: "3:4" },
    { slug: "moooi", name: "Moooi", desc: "Multi-sensory flagship store", alt: "Moooi-Milan-Design-Week-2024-", ar: "3:4" },
  ],
  // col-3 — visual slot 4 (rightmost) — 8 cards, 2:3
  [
    { slug: "alpine", name: "Alpine", desc: "Renewed identity, packaging and digital flagship store", pill: "Shopify", alt: "close-up photography of a girl wearing Alpine earplugs", ar: "2:3", caption: "dark" },
    { slug: "just-brands", name: "Just Brands", desc: "Three brands, one shopping experience.", alt: "Man in sunglasses and a green jacket sits in a vintage car, looking out the window with a serious expression.", ar: "2:3" },
    { slug: "ark8", name: "ARK8", desc: "Digital flagship store for a luxury streetwear brand", pill: "Shopify", alt: "Elden Ring campaign by ARK8, photography by Luca Mastroianni", ar: "2:3" },
    { slug: "ace-and-tate", name: "Ace & Tate", desc: "Envisioning the omnichannel future of eyewear", alt: "Ace andTate portrait", ar: "2:3" },
    { slug: "koleksiyon", name: "Koleksiyon", desc: "A digital platform inspired by life", pill: "Newly Added", alt: "A red modern armchair with a metal base on a red background, with a tabby cat partially hidden behind the chair.", ar: "2:3" },
    { slug: "studio-job", name: "Studio Job", desc: "Digital art piece for an artist", alt: "Studio Job Banana", ar: "2:3", caption: "dark" },
    { slug: "stellar-development", name: "Stellar development", desc: "Developing destinations", alt: "sd", ar: "2:3" },
    { slug: "vitra", name: "Vitra", desc: "Office chair finder", alt: "1", ar: "2:3", caption: "dark" },
  ],
];
