# PHASE3_FINDINGS.md — Live Inspection (buildinamsterdam.com)

All values below were **measured live** via Chrome DevTools MCP (`evaluate_script` →
`getComputedStyle` / `getBoundingClientRect`) against <https://www.buildinamsterdam.com>,
unless explicitly labeled an estimate. Source-of-truth tier: **verified live inspection**
(highest). Motion timings are in `MOTION_AUDIT.md`.

- **Reference viewport:** 1440 × 900, `devicePixelRatio: 1` (set via `emulate`).
- **Baseline screenshots:** `docs/baselines/original-1440x900.png` (hero), `docs/baselines/original-menu-open-1440x900.png` (nav open).
- Responsive spot-checks at 768 × 1024 and 390 × 844.

---

## 0. Headline corrections vs earlier assumptions

| Earlier note | Live measurement | Status |
|---|---|---|
| Headline "left-aligned" (from screenshot) | `text-align: center` (centered in right panel) | **Corrected** |
| Right panel "off-white / cream #F2EFE6" | computed bg `rgb(255,255,255)` = **#FFFFFF** (cream look was JPEG compression) | **Corrected** |
| Split ≈ 49.5% (A3 estimate) | **exactly 50%** (panel x=720/1440; menu-btn center x=720) | **A3 verified = 50%** |

---

## 1. Page model & split

- **Desktop (≥769px):** single **fixed full-viewport hero, NO page scroll**. Two halves:
  - **Left = showreel video panel** (dark). `<video>` with `object-fit: cover`, overflows its half.
  - **Right = white content panel** (`#FFFFFF`), holds all text.
  - **Split = 50 / 50.** Boundary at viewport center (x = 720 @1440). Confirmed by white-panel rect `{x:720, w:720}` and Menu-button center `x:720`.
- `html` / body background: `#FFFFFF`.

## 2. Header logo

- `<header>`: `position: sticky` (pinned top-left), `padding: 30px 28.8px` (28.8px ≈ 2vw), **`mix-blend-mode: exclusion`** — this is how the single-color logo auto-inverts across the black/white boundary (white SVG reads dark on the white panel).
- Logo: inline SVG **144px** wide × ~16.17px tall, `color: #FFFFFF`. Link box at ~`x:27, y:30`. (Local copy: `public/logos/bia-logo.svg`.)

## 3. Top bar badge

- Text: `CERTIFIED SHOPIFY PLUS PARTNER` (uppercased via CSS; DOM text "Certified shopify plus partner").
- Font: `NHaasGroteskTXPro` 500, **10px / 12px**, `letter-spacing: normal`, `text-transform: uppercase`, color `#000`.
- Position: centered in the right panel (center x≈1080), `y: 30`. Fluid size ≈ `calc(7px + 0.208vw)` → 10px @1440.

## 4. Headline (`<h2>`)

- Font: `NHaasGroteskDSPro` 400, **`font-size: 86.4px` = 6vw**, **`line-height: 73.44px` = 0.85**, **`letter-spacing: -3.456px` = -0.04em**, `text-transform: uppercase`, **`text-align: center`**, color `#000`.
- 5 lines, each wrapped in an `overflow: hidden` mask div (`We build` / `brands &` / `digital` / `flagship` / `stores`).
- Block rect @1440 ≈ `{x:847, y:166, w:467, h:367}`, centered on x≈1080.

## 5. Lead paragraph

- Font: `RecklessNeue-Book` 400, **24px / 28.8px**, `letter-spacing: -0.24px` (-0.01em), `text-align: center`, color `#000`.
- **`width: 375px`** (fixed), centered. Rect @1440 ≈ `{x:892, y:576, w:375, h:115}`.

## 6. CTA buttons (segmented pair)

- Two links rendered as a **shared-border segmented control** (no gap):
  - `Our work` → `/cases`, grid-column `2 / span 2`.
  - `Contact us` → `/contact`, grid-column `4 / span 2`; **`border-left: none`** + `padding-left: 1px` so the pair shares one divider.
- Each bordered box: **110px × 34.2px**, `border: 1px solid #000`, background transparent, color `#000`.
- Label: `NHaasGroteskTXPro` 500, **11px / 13.2px** (`var(--_font-size)`, fluid), `text-transform: uppercase`.
- Placed via a 6-column grid on the container: `grid-template-columns: 0 54.5px 54.5px 54.5px 54.5px 0` (width 218px), so each button = 2 × 54.5 = 109–110px. Combined pair centered on x≈1080, `y:732–766`.
- **Hover (measured):** background → `#000`, text → `#FFF`, border `#000`; driven by an absolutely-positioned `[data-background]` fill layer.
  - `transition: background-color .5s ease, color .5s ease, border-color .5s ease, outline-color .5s ease, fill .5s ease, transform .4s cubic-bezier(0.45, 0.02, 0.09, 0.98)`.

## 7. Showreel video

- `<video>` source: **HLS (Mux)** `https://stream.mux.com/00sLHcaqvlYdkqwiPNeWeO00BIMzlwcn00011TSMs18vtqQ.m3u8?min_resolution=1080p`.
- Attributes: `muted`, `loop`, `playsinline`, **not** `autoplay` (`readyState: 4`). `object-fit: cover`, fills the left half (overflows beyond it).
- A `Play showreel` button + a cursor-following "Play showreel" label (`#cursor-portal-renderer`) sit over the video.
- ⚠️ Asset note: this is a streamed `.m3u8`, not a file in artifacts. Reconstruction options (need reviewer call): embed a poster/looping `.mp4`, proxy the HLS stream, or use a static still. **Do not block** — stub the video slot and decide during the Hero section.

## 8. Menu button

- `position: fixed`, `bottom: 0`, **horizontally centered on the split (x = 720)**; straddles the boundary.
- Visible terracotta circle **≈ 85.5px diameter**, fill **`#C38133`**. Hit-area/bbox 104 × 108 (includes the drop-shadow).
- Curved **"Menu"** text on a circle path: `NeueHaasGrotesk-Roman` 16px, fill `#000`; `<g>` transform `translate3d(0,-20px,0) rotate(170deg) scale(0.85)` (the label sits/rotates along the arc).
- **6-layer SVG drop-shadow** filter (`#filter`) — exact `feDropShadow`/`feGaussianBlur` values are in `artifacts/crawl/html.html` (lines ~476–541); reuse verbatim.
- **On menu open:** the button morphs **terracotta `#C38133` → blue `#3C4CC7`** and label **"Menu" → "Close"**.

## 9. Nav overlay (open state)

- Opens as a **black (`#000`) bottom-sheet**: `position: fixed`, full width, **height 50vh** (450px @900; guideline `max(450px, 50vh)`). The page content shifts up into the top half (see baseline screenshot).
- Reveal: **`transition: transform 0.65s cubic-bezier(0.45, 0.02, 0.09, 0.98)`** (slides up).
- **7 items** in a horizontal row: Home / Work / Expertise / About / Contact / Join us / Knowledge. Only ~4 fit at 1440 (remainder reached by horizontal scroll/drag). Each item:
  - Uppercase label `NHaasGroteskTXPro` 500, **16px / 19.2px**, color `#FFF`.
  - Status **dot** (`--db--size: .6em`): **Home = blue `#3C4CC7` (active)**, all others **terracotta `#C38133`**.
  - **Thumbnail** below the label (~371 × 198 @1440; desktop image, `sizes: 25vw`). Local copies in `public/images/`.
- Hovering an item surfaces a **case-preview card** (observed "Simone — Jean-Vincent Simonet…") in the upper area.
- **"Follow us"**: label (16px) + Instagram + LinkedIn icon links, bottom-right (~`x:1192, y:804`).

## 10. Responsive behavior

- **Breakpoint at 768 / 769px** (matches `guidelines.json`).

| Width | Layout | Scroll? | Headline | Lead | Top bar | Menu |
|------|--------|--------|----------|------|---------|------|
| ≥769 (e.g. 1440) | Horizontal **50/50 split** | **No** (fixed hero) | 86.4px / 73.44 (6vw) | 24px, w375 | 10px | circle ~85px @ x=split, bottom |
| ≤768 (e.g. 768) | **Vertical stack**: white content top (~100vh), video below | **Yes** | 80px / 68 | 20px, w375 | ~ | ~84px, centered near seam |
| 390 (mobile) | Vertical stack | **Yes** | 64.48px / 54.8 | 18px, w300 | 9px | ~84px |

- ⚠️ The headline size on the **stacked layout is not a clean fraction of the full viewport** (80px@768, 64.48px@390). Reproduce by matching these measured sizes per breakpoint; the exact `calc()`/`clamp()` is **not derivable** from artifacts (styled tag empty) and was not isolated live — **flagged estimate**.

## 11. Interaction / focus states

- **CTA hover:** §6 (fill-to-black, white text, 0.5s ease + 0.4s custom-ease transform).
- **Menu open/close:** §8 morph + §9 0.65s slide.
- **Site signature easing:** `cubic-bezier(0.45, 0.02, 0.09, 0.98)` — appears on button transform (0.4s) and nav transform (0.65s); treat as the house easing.
- **Focus-visible** (from reset): `outline: 1px solid var(--highlight-color)`.

---

## 12. Open items / decisions surfaced by Phase 3

- **Showreel video source** (§7) — reviewer decision on how to represent the Mux HLS stream locally.
- **Fonts** still required in `public/fonts/` for exact headline metrics (line widths shift the centered layout).
- **Mobile headline size formula** (§10) — flagged estimate; will be tuned in the Pixel Comparison pass.
- **A3 resolved:** split is exactly **50%** (no longer an assumption).
