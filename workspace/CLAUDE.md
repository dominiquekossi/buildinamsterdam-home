# CLAUDE.md — Build in Amsterdam Homepage Reconstruction

High-fidelity ("golden") reconstruction of the Build in Amsterdam homepage
(<https://www.buildinamsterdam.com>) for an RLE benchmark dataset. The reviewer is the
human decision-maker; Claude analyzes, extracts, documents, and implements.

## Prime directive

**Fidelity over everything.** The output is judged by direct side-by-side visual
comparison with the original. When fidelity and convenience conflict, choose fidelity.
Do not redesign, modernize, simplify, or "improve" the original. Reconstruct it.

## Non-negotiable rules

1. **No invented values.** Every color, size, spacing, radius, duration, and easing must
   trace to a verified source: `artifacts/`, `guidelines.json`, the rendered DOM, or live
   browser inspection. If a value cannot be verified, STOP, state what is missing, propose
   labeled alternatives, and wait for the reviewer.
2. **Source-of-truth precedence:** verified live inspection (Chrome DevTools MCP) →
   rendered DOM (`artifacts/crawl/html.html`) → `guidelines.json` → screenshot/video
   inference (assumption, must be labeled). The rendered DOM beats the `__NEXT_DATA__`
   CMS payload where they disagree.
3. **Local assets first.** Use files under `public/` (extracted from `artifacts/`). Only
   pull from the live site when an asset is missing, and document why. Runtime asset URLs
   must be LOCAL (guide §6.7): recovered media is downloaded into `public/` (e.g. the Mux
   showreel → `public/videos/showreel.mp4`), never streamed from external hosts.
4. **Section by section.** Never build the whole page in one pass. Per section:
   re-read artifacts → verify live → list uncertainties → implement → self-review against
   references → present → wait for confirmation.
5. **Human checkpoints.** Wait for approval at each phase gate (audit → plan → live
   analysis → per-section implementation).

## Critical project facts (from the Phase 0/1 audit)

- **The component CSS is NOT in the artifacts.** The styled-components `<style>` was
  captured empty; `artifacts/crawl/css.css` is only the global reset + `@font-face`.
  Exact split ratio, headline px sizes, paddings, the Menu-button geometry, breakpoints,
  and all motion timings/easings **must come from live inspection** — never guess them.
- **Licensed fonts are PRESENT** in `public/fonts/` (RecklessNeue Book/Italic, TXPro 55/65,
  DSPro 55 — woff2+woff) and load via `src/styles/fonts.css`; the Helvetica/Arial/Georgia
  fallbacks only cover the pre-load flash. (The earlier "absent" note is obsolete.)
- **Topbar + CTA system is FLUID above 1440** (derived 2026-06-12, exact at 1536/1600/1920):
  scale `s(vw) = max(1, 0.7 + 0.3·vw/1440)` on font-size (CTA `max(11px, 7.7px+0.22917vw)`,
  topbar `max(10px, 7px+0.20833vw)`) with line-height/paddings in em, and the CTA block's
  `margin-top: max(41px, 28.7px+0.85417vw)`. Lead (24/28.8), the 43px gap, `top: 30px` and
  the headline formula do NOT scale; CTA width stays 110px.
- **The page does not scroll.** It is a single fixed-viewport hero. The `scroll.webm`
  captures the on-load motion, which we model as TWO separate systems (see "Approved
  reconstruction workflow"): **IntroLoader** ("BiA. Powered by FRONT ROW" wordmark draws on
  black → moves to top-left → cream right panel wipes in) then **HeroReveal** (headline
  lines rise via line-mask → top bar / lead / CTAs reveal).
- **Original stack:** Next.js + Storyblok + styled-components v5.3.11. We rebuild in
  Vite + React + TS (strict) + Tailwind (motion via CSS transitions/@keyframes + the Web
  Animations API — GSAP was removed 2026-06-12 once the last usage became dead code).

## Verified tokens (safe to use)

- Colors: white `#FFFFFF`, black `#000000`, off-white `#F2EFE6`, dark-gray `#231F20`,
  light-gray `#3E3739`, grey `#B3B3B3`, blue `#3C4CC7`, terracotta `#C38133` / `#BA7160`.
- Fonts: `NHaasGroteskDSPro` (headline), `RecklessNeue-Book` (lead serif),
  `NHaasGroteskTXPro` 500 (UI/labels), `NeueHaasGrotesk-Roman` (body).
- Headline: uppercase, `letter-spacing: -0.04em`, `line-height: 0.85`, size `max(80px,6vw)`
  (floor 80px live-verified 2026-06-12 — wins ≤1333px; the earlier `max(16px,6vw)` floor was inert).
- Lead paragraph: `24px / 28.8px`.
- Buttons: square (`radius: 0`), 1px black border, `12px 24px`, hover → black fill /
  white text. Menu button: terracotta `#C38133`, circular, ~90px, curved "Menu" text.
- Defined in `tailwind.config.ts` and `src/styles/globals.css`.

## Verified content (rendered DOM = canonical)

- Top bar: `Certified shopify plus partner`
- Headline lines: `We build` / `brands &` / `digital` / `flagship` / `stores`
- Lead: `We shape the future of commerce by delivering cohesive & captivating
  omnichannel experiences that connect to convert.`
- CTAs: `Our work` → `/cases`, `Contact us` → `/contact`
- Menu nav items: Home `/`, Work `/cases`, Expertise `/expertise`, About `/about`,
  Contact `/contact`, Join us `https://jobs.buildinamsterdam.com/`, Knowledge `/articles`
- Social: Instagram, LinkedIn ("Follow us")

## Project structure

```
src/
  assets/       # standalone .svg sources imported as components via SVGR (`?react`, guide §7.3)
  components/
    layout/     # HeaderLogo, MenuButton, NavOverlay (nav/shell)
    shared/     # DotLabel + other reusable primitives
    home/       # SplitCanvas, Hero, ShowreelSlot, IntroLoader (home-page-only components)
  motion/       # NON-component motion utilities only (homeEntrance.ts); every
                # .tsx component lives under src/components/ (guide §7.1)
  hooks/
  styles/       # globals.css, fonts.css
public/
  images/  icons/  videos/  fonts/   # per guide §7.1 — no logos/ (logo SVGs live in icons/)
docs/           # PHASE3_FINDINGS.md (live inspection), MOTION_AUDIT.md (animation analysis)
artifacts/      # READ-ONLY source of truth (do not edit)
```

- **The project guide (§6–7) is the source of truth for structure rules** — where this
  file and the guide disagree, the guide wins. Page-specific components go in
  `src/components/<page>/` (home page → `home/`), reusable ones in `shared/`,
  nav/footer/shell in `layout/`; style with Tailwind utilities directly in the components.
- One component per file; keep components small.
- **No `<svg>` markup in .tsx** (guide §7.3): static image SVGs live in `public/` and are
  referenced via `<img>` (e.g. the BiA logo); interactive/stateful graphics live as
  standalone files in `src/assets/` imported via SVGR (`import G from "@/assets/x.svg?react"`),
  with state passed as `data-*` attributes and behavior driven by CSS.

## Approved reconstruction workflow

**Motion is two separate systems — never merge them:**
- **IntroLoader** — the page-load loader: "BiA. Powered by FRONT ROW" wordmark draws on
  black, then translates to the top-left header position; the cream right panel wipes in.
  Owns only the loader→header handoff and panel reveal.
- **HeroReveal** — the in-place reveal of hero content after the loader hands off: headline
  lines rise (line-mask), then top bar / lead paragraph / CTAs reveal. Owns only hero
  content choreography. It must not depend on IntroLoader internals beyond a start signal.

**Approved implementation order (build strictly in this sequence):**

1. **SplitCanvas** — black-left / cream-right panels + the layout grid.
2. **HeaderLogo** — fixed top-left BiA wordmark (extracted SVG).
3. **MenuButton** — terracotta circular button, curved "Menu" text, drop-shadow filter.
4. **NavOverlay** — full menu (7 links + status dots + hover thumbnails + "Follow us"), hidden until Menu click.
5. **Hero** — top bar, 5-line headline, lead paragraph, CTA pair, showreel video slot.
6. **IntroLoader** — page-load loader motion system (see above).
7. **HeroReveal** — hero content reveal motion system (see above).

**Per-section loop (mandatory):** re-read artifacts → verify live (Chrome DevTools MCP) →
list uncertainties → implement → self-review → **Pixel Comparison pass against the live
original** (match viewport, screenshot both, diff, measure don't eyeball) → refine until no
meaningful discrepancies remain → present → wait for confirmation before the next section.

**Documentation outputs:**
- Live inspection findings → `docs/PHASE3_FINDINGS.md` (computed styles, geometry, breakpoints, states).
- Animation analysis → `docs/MOTION_AUDIT.md` (per animation: purpose, trigger, sequence, duration, delay, easing, loop, responsive variation, recommended impl).

## Assumptions (require reviewer approval before being relied upon)

These are explicit, labeled assumptions. **Do not rely on any A# for implementation until
the reviewer has approved it.** If an assumption is rejected, stop and re-scope.

- **A1 — Scope:** reconstruct only the rendered homepage (IntroLoader + Hero + MenuButton +
  the hidden NavOverlay shipped in the DOM). Other routes/pages are out of scope.
- **A2 — Canonical content:** the rendered DOM (`artifacts/crawl/html.html`) is canonical
  over the `__NEXT_DATA__` CMS payload where they disagree (e.g. headline text, top-bar copy).
- **A3 — Split ratio:** the black/cream split is ~50% (screenshot ≈ 49.5%); the exact value
  is pending live measurement in Phase 3 and will replace this estimate.

## Workflow & commands

- `npm run dev` — local dev server
- `npm run build` — typecheck + production build
- `npm run typecheck` / `npm run lint`
- Live verification uses the `chrome-devtools` / `playwright` MCP servers (registered;
  require a Claude Code restart to load). Measure computed styles and timings there.
- `dscomp validate --no-build` / `--deep` are referenced by the brief but `dscomp` is not
  yet installed. **Do not block progress waiting for `dscomp`** while its source is unknown:
  proceed using `npm run build` / `npm run typecheck` + the Pixel Comparison pass as the
  working gates, and run `dscomp` retroactively once the reviewer provides its source.

## Self-check before every delivery

No invented values · artifact/live-verified values used · local assets used · interactions
verified · animations documented (purpose/trigger/duration/delay/easing/loop) ·
accessibility preserved · matches references. If uncertainty remains, stop and ask.
