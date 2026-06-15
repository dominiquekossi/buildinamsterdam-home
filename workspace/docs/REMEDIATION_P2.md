# P2 Remediation — Deferred Improvements (evidence)

Proceeded only after P1 passed. Each item investigated live first; implemented only where
measurable, otherwise documented as a blocker. No invention.

---

## P2.1 — MenuButton rotor animation — ✅ VERIFIED (+ resting-state correction)

**Problem.** Audit: rotor animation NOT IMPLEMENTED (static label). Live re-measurement also
revealed my S3 resting label used `scale(0.85)`, pulling it too tight.

**Root cause.** The S3 `scale(0.85)`/`rotate(170deg)` values were read **mid-entrance** (the
rotor animates on load). The true **settled** rotor is `rotate(70deg) scale(1)`; the label sits
at radius ~56.5px (outside the 42.8px edge), ~3 o'clock.

**Implementation (`MenuButton.tsx`).**
- Resting label positioned deterministically via `textPath startOffset="27%" textAnchor="middle"`
  at `scale(1)` → correct radius (rotor REST = identity transform).
- Rotor **entrance** (measured endpoints): GSAP tween from `rotation:-90, scale:0.85` → identity
  (`rotation:0, scale:1`) on the IntroLoader reveal cue (`revealed` prop), signature easing
  `cubic-bezier(0.45,0.02,0.09,0.98)`, `svgOrigin "44.5 44.5"`. (The live entrance is
  `rotate(-20°)/scale(.85)`→`rotate(70°)/scale(1)`; reproduced as an equivalent ~90° sweep ending
  at the startOffset-defined rest. Duration MEDIUM — entangled with the load sequence.)
- Callback/effect stability preserved (no re-run); `__introEffectRuns` stays 1.

**Verification (Chrome DevTools, live recon).**
| Metric | Live original | Recon (after) | Before |
|---|---|---|---|
| Resting label radius from circle centre | 56.5px | **54.9px** | 31.8px (scale .85 → too tight) |
| Resting label angle | 7.5° | **8.6°** | −29° |
| Rotor rest transform | rotate(70) scale(1) | identity (≡ startOffset rest) | — |
| Entrance start pose (pre-reveal) | rotate(-20)/scale(.85) | **rotate(−90)/scale(.85)** (confirmed `matrix(0,-0.85,0.85,0,…)`) | none (static) |
| `__introEffectRuns` | — | **1** (no regression) | — |

Screenshot: `docs/diffs/p2-menu-rotor-rest.png`. **Classification: VERIFIED** (timing MEDIUM, flagged).

---

## P2.2 — Showreel media — ✅ VERIFIED (recovered public media)

**Problem.** Audit: ShowreelSlot was a 🟡 STUB (black div, no `<video>`).

**Investigation (live).** The original left panel plays a **muted, looping background video** —
verified: `paused:false`, `currentTime` advanced 1.22s/1.2s, 1920×1080, source
`https://stream.mux.com/00sLHcaqvlYdkqwiPNeWeO00BIMzlwcn00011TSMs18vtqQ.m3u8?min_resolution=1080p`.
This is a **publicly accessible** Mux HLS stream (allowed source: public live site). So the black
stub was a real at-rest gap, not a non-playing poster.

**Implementation (`ShowreelSlot.tsx`).** Added `hls.js` (Chrome/Firefox lack native HLS; Safari
falls back to native). Renders `<video muted loop playsInline autoPlay object-cover>` loading the
recovered stream; matches the original `.Video_container` (`object-fit:cover; object-position:center;
margin-bottom:-4px`).

**Verification (Chrome DevTools, live recon).**
- `<video>` present; source = the Mux stream; `readyState 4`; decoded `1920×1080`.
- `paused:false`; `currentTime` advanced **1.52s / 1.5s** → actually playing.
- Fills the left panel (`x:0, 720×900`).
- Screenshot `docs/diffs/p2-showreel-playing.png` shows real footage (a "Polaroid" case frame).
- Console: **0 errors / no hls.js warnings**.
- Side effect: resolves the S2 carry-forward — the `mix-blend-exclusion` HeaderLogo now composites over real video.

**Classification: VERIFIED.** (Note: references the original's public stream directly, per the
"recover from public live website" allowance; a self-hosted copy would be used in real production.)

---

## P2.3 — Nav item hover case-preview — 🔒 BLOCKED (under-specified)

**Problem.** Audit: NOT IMPLEMENTED (original surfaces a featured-case card, e.g. "Simone", on item hover).

**Investigation (live).** Synthetic `mouseover`/`mouseenter` on a nav item produced **no preview**
(`htmlLenDelta: 0`; the cursor portal stayed at "Play showreel", opacity 0). The preview is a
real-pointer, cursor-following case card whose **per-item content/source is not in the artifacts**
(which case maps to which item, the card layout, the trigger geometry).

**Decision.** Reproducing it faithfully would require **inventing** the per-item preview data and
interaction. Per the rules ("if under-specified: document limitations; do not invent"), **not
implemented**.

**Classification: BLOCKED BY EXTERNAL DEPENDENCY / under-specified** (needs the CMS mapping +
interaction spec, or reviewer-provided definition).

---

## P2 build/quality gate
`npm run typecheck` ✅ · `npm run build` ✅ (chunk-size hint from bundling hls.js — non-error;
could be code-split later). Console **0 errors**; only the 6 external-blocker font warnings.
