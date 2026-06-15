# P3 Remediation — Font recovery, cursor-reactive menu label, icons, nav hover

Follow-up from reviewer feedback. All verified in the running app (Chrome DevTools + Playwright).
Build + typecheck green; console **0 errors / 0 warnings**.

---

## 1. Fonts — ✅ RESOLVED (recovered from public live site, self-hosted)

**Reclassification.** P1.3 marked fonts an external blocker ("never supplied" in artifacts).
Reviewer correctly noted they can be **copied from the live site**. The live site serves them
publicly at `/fonts/*.woff2|woff`.

**Action.** Downloaded all 10 files (verified `wOF2`/`wOFF` magic) into `public/fonts/`:
NHaasGroteskDSPro-55Rg, NHaasGroteskTXPro-55Rg, NHaasGroteskTXPro-65Md, RecklessNeue-Book,
RecklessNeue-BookItalic (woff2 + woff each). (`NeueHaasGrotesk-Roman` has no `@font-face` in the
original either → stays a system fallback, matching the original.)

**Verification.**
- `document.fonts.status: "loaded"`; NHaasGroteskDSPro / NHaasGroteskTXPro / RecklessNeue-Book all `loaded`.
- Headline now renders in the real condensed display face (text width 414px Helvetica → 378px real).
- **Right-half (content) SSIM vs baseline: 0.831 → 0.966.**
- Console: the 6 `Failed to decode font` warnings are **gone** (0 warnings).

**Classification: VERIFIED.**

---

## 2. Menu label cursor-reactive rotation ("gira e some") — ✅ VERIFIED

**Problem (reviewer).** The "Menu" label rotates / shrinks as the cursor moves — not reproduced.

**Live inspection.** The `<g>` (CSS transform, `transform-origin:50% 50%`) has two confirmed
cursor-driven states:
- pointer over RIGHT (content) half → `rotate(70deg) scale(1)` (label out at 3 o'clock)
- pointer over LEFT (video) half → `rotate(170deg) scale(0.85) translateY(-20px)` (rotated away + smaller)

**Implementation (`MenuButton.tsx`).** Rewrote the rotor to the original's CSS-transform model
(`text-anchor:start`, `transform-box:view-box`, `transform-origin:50% 50%`), driven by a window
`pointermove` listener (left/right of viewport centre), transitioned `0.6s` with the signature
easing. The entrance (reveal cue) folds into the same transition from `rotate(-20deg) scale(0.85)`.

**Verification (Chrome DevTools).**
- Resting label radius **56.4px** (live 56.5) at `rotate(70°)` — the earlier `scale(0.85)`
  misposition (radius 31.8) is fixed by `transform-box:view-box`.
- pointer right → `70°/scale 1`; pointer left → `170°/scale 0.85/y-20` — matches live exactly.
- `__introEffectRuns` still **1** (no intro regression).

**Note.** The exact *continuous* cursor→transform curve in the minified source wasn't fully
recoverable (one hover sample didn't fit a pure left/right split); reproduced as the two
confirmed endpoint states by pointer half — MEDIUM confidence, documented.

**Classification: VERIFIED** (mapping MEDIUM).

---

## 3. Favicons / icons — ✅ FIXED

**Problem.** The favicon PNGs in `artifacts/site-assets/logos` (and the copied `public/favicon.png`)
are actually **HTML documents** (broken crawl artifacts), so the favicon never rendered.

**Action.** Recovered the real icons from the live site: `favicon.ico`, `favicon-32x32.png`,
`favicon-16x16.png`, `apple-touch-icon.png` (verified PNG/ICO magic), removed the broken
`favicon.png`, and wired proper `<link rel="icon"/apple-touch-icon>` tags in `index.html`.

**Verification.** All four fetch `200` with image content-types and valid magic bytes.
(Other icons: `menu-open` circle is the inline SVG path; Instagram/LinkedIn use the real
`secondary*.svg` brand SVGs — both present and rendering.)

**Classification: VERIFIED.**

---

## 4. Nav-item hover animation — 🔎 INVESTIGATED (no distinct per-item effect found)

**Investigation (live, real hover + synthetic).** Hovering a nav item produced **no** measurable
per-item change: thumbnail `transform` stays `none`, item/label `opacity` stays `1`, and the
`#case_intro_portal` is **empty** (the "Simone"/case imagery seen earlier was a frame of the
looping showreel montage, not a hover preview). The only nav transition is a subtle thumbnail
`opacity 0.25s` (load fade).

**Conclusion.** The animation perceived "over the navigation" is the **global cursor-reactive
menu-label rotation** (§2) — it rotates as you move the mouse across the nav's left/right while
the menu is open. No separate per-item hover animation could be confirmed; **not invented**.

**Classification: VERIFIED (the cursor-reactive label) + documented limitation** for any
additional per-item effect.

---

## Final state
`typecheck` ✅ · `build` ✅ · console **0 errors / 0 warnings**. Verified in-browser:
intro runs once, real fonts loaded (content SSIM 0.966), showreel playing, menu label
cursor-reactive, favicons valid. Dev-only instrumentation (`__introTl`, `__introEffectRuns`,
`?introspeed=`) remains DEV-gated/stripped from production.
