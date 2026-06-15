# MOTION_AUDIT.md — Animation Analysis (buildinamsterdam.com)

Per the approved workflow, on-load motion is modeled as **two separate systems**:
**IntroLoader** (loader → header handoff + panel wipe) and **HeroReveal** (hero content
choreography). This doc also covers the interactive transitions (CTA hover, Menu morph,
Nav slide).

**Measurement sources & confidence:**
- **Interactive transitions** (hover, nav, menu) — durations/easings read **live** from
  computed `transition` values → **high confidence**.
- **Intro/reveal timeline** — derived from `artifacts/crawl/scroll.webm` (25 fps ⇒ 40 ms /
  frame) by frame stepping → **approximate (±~40–80 ms)**. Exact per-tween GSAP
  durations/eases are **not extractable** (minified JS; styled-components `<style>` captured
  empty), so these are video-measured estimates to be fine-tuned in the per-section motion
  comparison. The site's measured **signature easing** `cubic-bezier(0.45, 0.02, 0.09, 0.98)`
  is the recommended default for the intro/reveal tweens.

Per-animation template: Purpose · Trigger · Sequence · Duration · Delay · Easing · Loop ·
Responsive · Recommended impl.

---

## A. IntroLoader

Overall: full-black screen → wordmark draws → wordmark relocates to the header → white
right panel wipes in. Approx window **0 → ~1.7s**.

### A1 — Wordmark draw-on
- **Purpose:** brand entrance ("BiA. Powered by FRONT ROW").
- **Trigger:** page load.
- **Sequence:** "BiA." visible first (~0–200 ms) → "Powered by FRONT ROW" draws/reveals left→right (~200–800 ms), centered on black.
- **Duration:** ~800 ms. **Delay:** 0.
- **Easing:** ease-out-ish (est.) → use signature `cubic-bezier(0.45,0.02,0.09,0.98)`.
- **Loop:** none (once). **Responsive:** same concept all widths.
- **Recommended impl:** GSAP timeline; reveal via clip/mask or staggered opacity on logo segments. (The logo is a single SVG — a left→right `clip-path` wipe is the simplest faithful match.)

### A2 — Wordmark move to header
- **Purpose:** loader logo becomes the persistent top-left header logo.
- **Trigger:** end of A1.
- **Sequence:** centered wordmark translates to top-left + settles at final 144px width.
- **Duration:** ~200–300 ms (settled top-left by ~880 ms in the recording). **Delay:** ~800 ms (after A1).
- **Easing:** signature cubic-bezier.
- **Loop:** none. **Responsive:** target = header position per breakpoint.
- **Recommended impl:** GSAP `to` on x/y (+ scale) of the same logo node, or a FLIP from center → header slot. Hand off to the real sticky header at the end.

### A3 — White right panel wipe-in
- **Purpose:** reveal the content half.
- **Trigger:** ~during/after A2.
- **Sequence:** white (`#FFFFFF`) panel enters from the right edge and fills to the 50% split line.
- **Duration:** ~400–500 ms. **Delay:** ~1.2s.
- **Easing:** signature cubic-bezier.
- **Loop:** none. **Responsive:** on ≤768 the panels stack — wipe direction/handling differs (treat separately; primary target is desktop).
- **Recommended impl:** GSAP width/clip or `transform: translateX` on the panel; the left video sits underneath.

---

## B. HeroReveal

Overall: once the white panel is in, hero content animates in. Approx window **~1.4 → ~2.1s**.
Depends on IntroLoader only via a start signal (do not couple internals).

### B1 — Headline line-mask rise
- **Purpose:** dramatic headline entrance.
- **Trigger:** start signal from IntroLoader (panel settled).
- **Sequence:** each of the 5 lines (`We build`/`brands &`/`digital`/`flagship`/`stores`) sits in an `overflow:hidden` mask and translates up from below (`translateY(100%) → 0`), staggered line-by-line; appears to settle from a lighter→full-black tone.
- **Duration:** ~600–800 ms total across the stagger (per-line ~400–500 ms). **Delay:** ~1.4–1.5s from load. **Stagger:** ~60–100 ms/line (est.).
- **Easing:** signature cubic-bezier.
- **Loop:** none. **Responsive:** same mechanism; sizes per breakpoint (`PHASE3_FINDINGS §10`).
- **Recommended impl:** GSAP timeline, `y: 100% → 0` on each `[data-line]` inside its mask, `stagger`. The masks already exist in the DOM structure.

### B2 — Top bar / lead / CTA reveal
- **Purpose:** bring in supporting content after the headline.
- **Trigger:** alongside / just after B1.
- **Sequence:** top-bar badge, lead paragraph, and CTA pair fade + translate up slightly into place.
- **Duration:** ~300–500 ms each. **Delay:** ~1.8–2.0s from load (after headline begins). **Stagger:** small.
- **Easing:** signature cubic-bezier.
- **Loop:** none. **Responsive:** same.
- **Recommended impl:** GSAP, `opacity 0→1` + `y: small→0`. Settled by ~2.0–2.1s.

---

## C. Interactive transitions (measured live — high confidence)

### C1 — CTA hover (fill-to-black)
- **Purpose:** primary/secondary button hover affordance.
- **Trigger:** pointer hover on each CTA.
- **Sequence:** `[data-background]` layer fills → background `transparent→#000`, text `#000→#FFF`, border stays `#000`.
- **Duration / Easing (exact):** `background-color .5s ease`, `color .5s ease`, `border-color .5s ease`, `fill .5s ease`, `outline-color .5s ease`, **`transform .4s cubic-bezier(0.45,0.02,0.09,0.98)`**.
- **Loop:** none (reverses on leave). **Responsive:** same.
- **Recommended impl:** **CSS transition** (not GSAP) on the bg layer + text color.

### C2 — Menu button morph (open/close)
- **Purpose:** toggle affordance for the nav.
- **Trigger:** click Menu button.
- **Sequence:** terracotta `#C38133` → blue `#3C4CC7`; curved label `Menu` → `Close`; the `<g>` rotation transform animates the arc text.
- **Duration / Easing:** color transition (est. ~0.5s ease, consistent with site); arc transform via signature cubic-bezier. (Re-measure live during the MenuButton section to lock exact values.)
- **Loop:** none (toggles). **Responsive:** same.
- **Recommended impl:** CSS transition for fill/color; GSAP or CSS for the arc-text rotation.

### C3 — Nav overlay slide
- **Purpose:** reveal/hide the bottom-sheet nav.
- **Trigger:** Menu open/close.
- **Sequence:** black 50vh panel slides up from bottom; page content shifts into the top half.
- **Duration / Easing (exact):** **`transform 0.65s cubic-bezier(0.45,0.02,0.09,0.98)`**.
- **Loop:** none. **Responsive:** panel sizing per breakpoint.
- **Recommended impl:** **CSS transition** on `transform: translateY`. Per-item thumbnail/label reveal can be a small GSAP stagger.

---

## D. Ambient / media

### D1 — Showreel video
- **Behavior:** `muted`, `loop`, `playsinline`, **not autoplay** (plays on user action via "Play showreel"). HLS Mux source (`PHASE3_FINDINGS §7`). `object-fit: cover`.
- **Recommended impl:** decide source handling with reviewer (poster + looping mp4, HLS proxy, or still). Stub the slot; non-blocking.

### D2 — Menu arc-text resting rotation
- The "Menu" label is rotated on the circle (`rotate(170deg) ... scale(0.85)`); whether it rotates continuously or only on hover/open was not isolated — **re-verify live in the MenuButton section**.

---

## E. Implementation guidance summary

| System | Tech | Why |
|--------|------|-----|
| IntroLoader (A1–A3) | **GSAP timeline** | sequenced, multi-element choreography with handoff |
| HeroReveal (B1–B2) | **GSAP timeline** | staggered line masks + content reveal; needs ordering |
| CTA hover (C1) | **CSS transition** | simple state toggle, exact values known |
| Menu morph (C2) | CSS + (GSAP for arc) | color toggle + arc rotation |
| Nav slide (C3) | **CSS transition** | single transform, exact value known |

**Single source of truth for easing:** `cubic-bezier(0.45, 0.02, 0.09, 0.98)` (site signature).
Define once (CSS var + GSAP `CustomEase`/equivalent) and reuse.

**Verification debt to clear during implementation:** intro/reveal exact per-tween durations,
delays, stagger, and eases are video-estimates — re-capture the live intro (reload + frame
grab / performance trace) during the IntroLoader & HeroReveal sections and tune to match.
