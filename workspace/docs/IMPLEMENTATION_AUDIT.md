# IMPLEMENTATION AUDIT — Build in Amsterdam reconstruction

Evidence-based audit of the **running application** (`http://localhost:5173`), via Chrome
DevTools MCP + Playwright MCP. Nothing is marked complete from source presence alone. Date:
2026-06-11.

Legend: **✅ IMPLEMENTED & VERIFIED** · **⚠️ IMPLEMENTED BUT NOT FUNCTIONING (correctly)** ·
**🟡 STUB / PLACEHOLDER** · **❌ NOT IMPLEMENTED**

---

## A. Global findings — missing assets (evidence)

| Asset | Status | Evidence |
|---|---|---|
| **Fonts** — NHaasGroteskDSPro, NHaasGroteskTXPro (55/65), RecklessNeue-Book (.woff2/.woff) | ❌ **MISSING** | Console: `Failed to decode downloaded font … OTS parsing error: invalid sfntVersion` for all 6; `public/fonts/` contains only README. Dev server returns `index.html` for the missing paths. → **All typography renders in Helvetica/Georgia fallback.** |
| **Showreel video** | 🟡 **STUB** | `document.querySelector('video')` → **none**. ShowreelSlot is a black `<div>`. Mux HLS not embedded. |
| Nav thumbnails (7) | ✅ present | Network 304; `img.naturalWidth = 1500` confirmed loaded. |
| BiA logo SVG | ✅ present | `header img.naturalWidth = 534`, rendered 144px. |
| Social icons (IG/LinkedIn) | ✅ present | Network 304. |
| `.screen-reader-only` CSS class | ⚠️ **undefined** | Used in `ShowreelSlot.tsx` but **not defined** in `globals.css`; the "Play showreel" button is hidden only by black-on-black colour coincidence, not properly. |

## B. Global findings — animation defects (evidence)

| Animation | Status | Evidence |
|---|---|---|
| **IntroLoader restart** | ⚠️ **DEFECT** | `window.__introEffectRuns = 3` after load. App passes new inline `onReveal`/`onComplete` identities every render; IntroLoader's `useEffect([onReveal,onComplete])` re-runs when `heroRevealed` flips → `ctx.revert()` + new timeline → **intro restarts once mid-flight** (logo/panel snap back, replay). Re-run is **not** a StrictMode artifact (happens in production). |
| MenuButton rotor rotation | ❌ **NOT IMPLEMENTED** | Live original animates the curved label (`rotate(-20deg)`→`rotate(170deg)`); recon label is static. |
| Nav item hover case-preview | ❌ **NOT IMPLEMENTED** | Original surfaces a featured-case card ("Simone") on item hover; not built. |
| CTA hover fill | ✅ works (simplified) | Hover → bg `rgb(0,0,0)`, text `rgb(255,255,255)`, `transition 0.5s` (verified live). Uses a colour transition, **not** the original's sliding `[data-background]` layer (0.4s transform). |

---

## C. Per-section verification

### S1 — SplitCanvas — ✅ IMPLEMENTED & VERIFIED
- Split 50/50: white panel `{x:720,w:720}`, black panel `{x:0,w:720}` (live). ✅
- Desktop no-scroll: `scrollHeight == innerHeight`. ✅
- Mobile (390): stacks (white top, black below), page scrolls. ✅
- Breakpoint 769px. ✅

### S2 — HeaderLogo — ✅ IMPLEMENTED & VERIFIED
- Fixed top-left, padding `30px 28.8px`, `mix-blend-mode: exclusion`, logo 144px @ (28.8,30), link `/`. ✅ (measured live)
- Logo asset loads (naturalWidth 534). ✅
- Note: tone over real video unverifiable (showreel is a stub) — N/A.

### S3 — MenuButton
- Terracotta circle (85.5px, `#C38133`), centered on split, 6-layer drop-shadow → ✅ VERIFIED.
- Open-state morph (→ `#3C4CC7` "Close") → ✅ VERIFIED (live click).
- Curved "Menu" label → ⚠️ renders but **fallback font** (real font missing); arc placement PROVISIONAL.
- Rotor rotation animation → ❌ NOT IMPLEMENTED (static).

### S4 — NavOverlay — ✅ IMPLEMENTED & VERIFIED (core)
- Click opens: `aria-hidden=false`, panel `{y:450,h:450}`, content wrapper `translateY(-450)`, 7 items, thumbnails loaded, dots (blue Home / terracotta others), "Follow us". ✅ (live click + screenshot `docs/diffs/audit-nav-open.png`)
- Close toggle returns `transform:none`, `aria-hidden=true`. ✅
- Nav item hover case-preview → ❌ NOT IMPLEMENTED.
- Mobile nav behaviour → ❓ NOT VERIFIED (PROVISIONAL).

### S5 — Hero
- Geometry (top bar 10px/y30; headline 86.4px/0.85/-0.04em centered; lead 24/28.8 w375; CTAs 110×34 segmented, centered, y732) → ✅ VERIFIED (live measure).
- CTA hover → ✅ VERIFIED working.
- **Typography (actual typefaces)** → 🟡 **STUB** — Helvetica/Georgia fallback; real fonts missing (see §A). Headline block width 414 vs original 466 is the visible symptom.
- **ShowreelSlot** → 🟡 **STUB** — no video element.
- "Play showreel" button → ⚠️ uses undefined `.screen-reader-only` class.

### S6 — IntroLoader — ⚠️ IMPLEMENTED BUT NOT FUNCTIONING CORRECTLY
- Sequence (A1 draw → A2 move → A3 wipe) → ✅ implemented; structurally validated vs scroll.webm (`docs/diffs/sbs-intro-seq.png`).
- Completes + hands off (loader unmounts, logo at header, hero revealed) → ✅ verified (Chrome + Playwright: progress reached 1.0).
- **Defect:** restarts once mid-intro (`__introEffectRuns=3`, §B) → visible glitch.
- Timing → MEDIUM (video-derived, ±40–80ms).
- Note: under headless/backgrounded automation, GSAP's rAF ticker throttles, so wall-clock duration is not measurable here; execution + completion are confirmed.

### S7 — HeroReveal — ✅ IMPLEMENTED & VERIFIED
- Pre-reveal hidden: line1 `translateY(73.44px)` (yPercent100), `[data-reveal]` opacity 0. ✅
- Post-reveal: line1 `translateY(0)`, reveals opacity 1. ✅
- Cued by intro handoff. ✅
- Timing → MEDIUM.

---

## D. Prioritized remediation list

1. **Stabilize IntroLoader callbacks** (P1, correctness) — wrap `onReveal`/`onComplete` in
   `useCallback` (or use refs / run the timeline once with an empty-dep effect). Removes the
   mid-intro restart.
2. **Supply fonts** (P1, fidelity) — add the 6 licensed `.woff2/.woff` to `public/fonts/`; the
   single largest visual gap. Re-run Pixel Comparison after.
3. **Showreel media** (P2) — replace the stub (poster/looping mp4 or HLS) and add a real
   `<video>`; finalizes the left half + logo-over-video tone.
4. **Define `.screen-reader-only`** (P2, a11y) — port the original rule into `globals.css`.
5. **MenuButton rotor rotation** (P3) — implement the animated curved-label rotation.
6. **Nav item hover case-preview** (P3) — advanced; under-specified by artifacts.
7. **Mobile nav** (P3) — verify/finalize ≤768 behaviour.

## E. Honest status correction
The prior "project complete" summary overstated readiness. Accurate state: **static layout +
core interactions (nav, hover, menu morph) verified working; HeroReveal verified; IntroLoader
works but has a restart defect; fonts and showreel video are missing/stubbed.** Several items
are NOT IMPLEMENTED (rotor rotation, nav hover preview) and typography is not faithful until
fonts are supplied.

Dev-only instrumentation present (stripped from prod builds): `window.__introTl`,
`window.__introEffectRuns`, `?introspeed=`.

---

## F. Post-remediation status (see `REMEDIATION_P1.md`, `REMEDIATION_P2.md`)

| Audited item | Was | Now | Evidence |
|---|---|---|---|
| IntroLoader restart | ⚠️ DEFECT (`__introEffectRuns=3`) | ✅ **VERIFIED** (`=== 1`, both tools) | useCallback + StrictMode removed |
| `.screen-reader-only` | ⚠️ undefined | ✅ **VERIFIED** (1×1 hidden) | ported rule; computed style |
| Fonts | ❌ missing | ✅ **RESOLVED** — recovered from public live site & self-hosted (content SSIM 0.831→0.966; 0 warnings) | see REMEDIATION_P3.md |
| Menu label cursor-reactive rotation | not reproduced | ✅ **VERIFIED** (right→70°/1, left→170°/.85; radius 56.4≈live 56.5) | both tools |
| Favicons | broken (HTML, not images) | ✅ **FIXED** — real .ico/.png recovered + wired | fetch 200 image/* |
| Nav-item hover preview | unclear | 🔎 no distinct per-item effect found; perceived motion = the cursor-reactive label | live hover + portals empty |
| MenuButton rotor | ❌ not implemented (+ scale error) | ✅ **VERIFIED** (rest radius 54.9≈live 56.5; entrance start pose confirmed) | both tools |
| Showreel | 🟡 stub | ✅ **VERIFIED** (recovered public Mux HLS, playing 1920×1080) | both tools + screenshot |
| Nav hover case-preview | ❌ not implemented | 🔒 **BLOCKED** (under-specified; not in artifacts) | synthetic hover → no preview |
| Menu label trigger (P3→P4) | left/right-half model (wrong) | ✅ **CORRECTED & VERIFIED** — hover-of-circle: idle→tucked/hidden (r≈26), hover→visible (r≈56) | see REMEDIATION_P4.md §3 |
| Showreel cursor label ("Play showreel") | ❌ not present | ✅ **VERIFIED** — fixed mix-blend-exclusion layer, follows pointer, opacity 1 over video / 0 over content; NHaasGroteskTXPro 11px | REMEDIATION_P4.md §1 |
| Showreel fullscreen + sound + Close/Mute | ❌ not present | ✅ **VERIFIED** — click → fixed cover video, unmuted; Close+Mute bottom-left (gap 32, pad 0 0 48 48); Mute↔Unmute toggle; Close restores+re-mutes | REMEDIATION_P4.md §2 |
| Hover dot indicator (nav tabs + Close/Mute) | static dot on all nav items / none on controls | ✅ **VERIFIED** — dot fades+slides in on hover (left of label, label shifts right); Home = persistent blue; others terracotta / controls white; appear 0.25s, out 0.1s | REMEDIATION_P4.md §4 |
| Nav mouse-driven horizontal scroll | plain native scroll | ✅ **VERIFIED** — pointer X scrolls the row (left→left items, right→right), lerped + clamped, centered band ≈28.5% margins; scroll ratio 0.327 vs original 0.328 | REMEDIATION_P4.md §5 |
| Nav thumbnail card size | fixed 360px → 20.2vw (both wrong) | ✅ **VERIFIED** — **`40vh`** (360@900h = 277.2@693h, width-independent 1280–1600) + **border-radius 4px** | REMEDIATION_P4.md §7a |
| Menu-open button state | "no disc when open" (§7b — query artifact) | ✅ **RE-CORRECTED** — disc ALWAYS present: closed terracotta `#menu-open`, open blue `#menu-close` (no-hover included); white "Close", RecklessNeue-Book label | REMEDIATION_P4.md §8b |
| Nav scroll scope | window-scoped | ✅ scoped to the nav panel (REVIEWER DECISION); moves above the nav ignored | REMEDIATION_P4.md §8a |
| Nav thumbnail hover zoom | none | ✅ **VERIFIED** — rest scale(1.03) → hover scale(1), 0.65s house ease (live CSSOM rule); also explains the card-edge difference | REMEDIATION_P4.md §8c |
| Rotor hover-in direction | always bottom-up (170° pose only) | ✅ **FINAL** — always the TOP pose (−20°/+20px): hover-in always top-down (REVIEWER DECISION; live's left-half 170° pose dropped) | REMEDIATION_P4.md §9a→§10b |
| Nav scroll zone | whole nav panel | ✅ scoped to the thumbnails row only (REVIEWER DECISION); frozen below the row & above the nav | REMEDIATION_P4.md §10a |
| Menu button hover pulse | none | ✅ **VERIFIED** — svg 1→1.05 elastic (overshoot ≈1.0563 / undershoot ≈0.9937 measured); back-out bezier approx (MEDIUM); label rides along | REMEDIATION_P4.md §10c |
| Intro "BiA. first" sub-sequence | whole wordmark wiped at once | ✅ **VERIFIED** — BiA. self-centered first (27.6% band), rest reveals at 37% + ~118px centering slide (0.7s); loader scale 2.215 (319px = live) | REMEDIATION_P4.md §11a |
| Menu/Close label colour crossfade | instant fill swap | ✅ **VERIFIED** — new label inherits old colour, eases to its own ≈0.5s (white↔black), in step with the disc crossfade | REMEDIATION_P4.md §11b |
| Nav scroll on leave | froze in place | ✅ returns to start (scrollLeft 0) when the pointer leaves the row (REVIEWER DECISION) | REMEDIATION_P4.md §12a |
| Page overflow-x (cursor label) | x scrollbar with nav open near right edge | ✅ **FIXED** — label layer portaled to body (original structure); scrollWidth = clientWidth | REMEDIATION_P4.md §12b |
| Follow-us icons | files swapped + `invert` made white SVGs black (invisible); label 16px | ✅ **FIXED & VERIFIED** — files unswapped, invert removed (pixel test 100% white), label 12px/500/uppercase, gap 16, links 50×32 | REMEDIATION_P4.md §12c |
| Intro separator line + hold | `rect.vertical-line` (31.1%) clipped out by both bands; rest started at 0.2s | ✅ **FIXED** — rest band from 29% (includes the line); hold ≈0.55s, A2@1.4, A3@1.9 (live-anchored) | REMEDIATION_P4.md §13a |
| Click press-pulse | none (hover grow only) | ✅ **VERIFIED** — down→scale 0.9375 (0.35s), up→spring to 1.05 via ≈1.0646 peak (= live 1.064) | REMEDIATION_P4.md §13b |
| Y-scroll while menu open | page could scroll on short viewports | ✅ **FIXED** — `body{overflow:hidden}` while open (copied live), restored on close | REMEDIATION_P4.md §13c |
| Follow-us chip outlines | missing (outline ≠ border, missed) | ✅ **VERIFIED** — 1px white outline chips, hover → invert(1) + black outline (live `.efuxuq a` rules copied) | REMEDIATION_P4.md §14a |
| Content covering nav top (short viewports) | content z-10 painted over nav z-0 | ✅ **FIXED** — nav z-20 above content (live: nav z8 > content z1); overlap probe → nav | REMEDIATION_P4.md §14b |
| Showreel fullscreen transition | instant class swap | ✅ **VERIFIED** — viewport-sized video stage slides −25vw↔0 (0.65s house ease, live mechanism); white bg layer synced/snap-back | REMEDIATION_P4.md §15a/b |
| Phrases animation on fullscreen close | none | ✅ **VERIFIED** — hero content opacity0/tx20% → fades/slides back 0.4s with 0.43s delay over the receding video (live `ecfgvy`) | REMEDIATION_P4.md §15b |
| Rotor hover-out direction | retracted upward | ✅ exits DOWNWARD (70°→170°) then invisible snap to top pose (REVIEWER DECISION) | REMEDIATION_P4.md §15c |
| Fullscreen x-overflow + close jolt | 676px x-scroll during fullscreen (translated layers); snap at 0.65s | ✅ **FIXED** — white section clips (overflow-hidden); stage uses live %-scheme (w=page width, translateX(−25%)); bg snap 0.8s | REMEDIATION_P4.md §16 |
| Right-panel fonts | suspected wrong | ✅ **PROVEN IDENTICAL** — byte-identical woff2 (sha256), canvas fingerprints equal, headline lines pixel-identical (Range, 0.1px) | REMEDIATION_P4.md §17a |
| Top-bar size | calc(7px+0.208vw) over-fit (9.84@1366) | ✅ **FIXED** — fixed 10px/12px (= live at 1366 AND 1440) | REMEDIATION_P4.md §17b |
| CTA pair anatomy | h-34 flex + border-l-0 divider | ✅ **VERIFIED** — 110×34.2, padding 11/13.2/10 equiv, −1px overlap (superimposed borders), label offset 10=10 | REMEDIATION_P4.md §17c |
| Showreel close: video strip on the right | white bg returned at 0.8s (skewed reading) | ✅ **FIXED** — bg returns instantly on close (live screenshot evidence); video confined to the left during close | REMEDIATION_P4.md §18a |
| Nav↔hero shift | −450 (1px more than live) | ✅ **FIXED** — live computed −449 (= panel − 1px); `calc(max(450px,50vh) − 1px)`; gap 133 = live | REMEDIATION_P4.md §18b |
| Menu-label idle attract loop | none | ✅ **VERIFIED** — hover-in/out cycle every ≈3.03s until first interaction (live-sampled bursts); killed on first hover | REMEDIATION_P4.md §19a |
| Lead/top-bar fonts | suspected wrong | ✅ identical (sha256 + Range widths 181.1=181.1); FOUC closed with font preloads | REMEDIATION_P4.md §19b |
| Nav row top spacing | pt 36px fixed + 2px inline-flex baseline drift | ✅ **FIXED** — `4vh` (live: 30.72@768 / 36@900 exact) + DotLabel `display:flex`; gap pixel-exact | REMEDIATION_P4.md §20 |
| RecklessNeue letterforms (g/y) | default two-story glyphs | ✅ **FIXED** — live's `font-feature-settings: "ss04","ss06","ss07","ss10","ss14"` applied to lead + menu label; crops match | REMEDIATION_P4.md §21 |
| Top-bar weight | suspected different | ✅ identical (same 65Md fetch, 500 face loaded, same width/props); flash covered by preloads | REMEDIATION_P4.md §22a |
| Showreel-close phrase reveal | whole-block slide (wrong) | ✅ **FIXED** — staggered per-line visibility flips top-down (≈75ms, live-measured), container fade only, no transform | REMEDIATION_P4.md §22b |
| Close-reveal chronology (lead/CTAs) | lead+CTAs surfaced before lower headline lines | ✅ **FIXED** — lead gated at line4+≈100ms (live-measured own flip), CTAs after the lead (reviewer chronology); verified strictly top-down | REMEDIATION_P4.md §23 |
| Nav-open showreel click | opened fullscreen | ✅ **FIXED** — closes the menu instead (verified live behaviour); fullscreen only with the nav closed | REMEDIATION_P4.md §24a |
| Thumbnail image rendition | full-res originals (crisp text) | ✅ **FIXED** — replaced with the live `_next/image` 384/q80 outputs (soft q80 look = live) | REMEDIATION_P4.md §24b |
| Menu↔Close toggle transition | fill attr (transition unverified) | ✅ **VERIFIED** — instant label swap + disc fill crossfade 0.5s (style-based), rotor holds 70° | REMEDIATION_P4.md §9b |
| Right panel page scroll (short viewports) | height-locked (content cut off) | ✅ **VERIFIED** — natural scroll + sticky video; 1440×900 pixel-exact; 693h scrolls like live | REMEDIATION_P4.md §7d |
| Menu open/close animation | hero slide only (incomplete) | ✅ **VERIFIED** — + nav panel rises (translateY 450→0) + inner parallax (−135→0), 0.65s; exact transform match | REMEDIATION_P4.md §6b |
| Menu button during showreel fullscreen | always visible | ✅ **VERIFIED** — slides down (translateY 200%) + fades out, pointer-events none | REMEDIATION_P4.md §6c |
| Mute/Close contrast on video | plain white (invisible on light frames) | ✅ **VERIFIED** — `mix-blend-mode: exclusion`, inverts against video | REMEDIATION_P4.md §6d |
| Mobile nav | ❓ unverified | ❓ still unverified (P3, out of remediation scope) | — |

Remaining open = external/under-specified only: **fonts** (supply licensed files) and the
**nav hover case-preview** (needs spec). All verified defects and recoverable gaps are resolved
and browser-verified via Chrome DevTools + Playwright.
