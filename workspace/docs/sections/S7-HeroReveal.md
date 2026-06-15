# Section 7 — HeroReveal — Comparison Report

**Status:** implemented · build green · validated · **final section — project complete**.
Files: `src/components/homepage/Hero.tsx` (reveal logic), `src/motion/ease.ts` (shared easing),
`src/motion/IntroLoader.tsx` (now imports shared easing).

## Loop results

**1. Implement** — HeroReveal (docs/MOTION_AUDIT.md §B), triggered by the IntroLoader's
`onReveal` cue (A3 start) via the `revealed` prop:
- Pre-reveal (set on mount): headline `[data-line]` spans `yPercent:100` (tucked below their
  `overflow-hidden` masks); top bar / lead / CTAs `[data-reveal]` `autoAlpha:0, y:20`.
- **B1** headline line-mask rise: `yPercent 100 → 0`, duration 0.7s, stagger 0.08s, house easing.
- **B2** supporting content: `autoAlpha 0→1, y 20→0`, duration 0.5s, stagger 0.1s, overlapping B1 (−0.35s).
- `prefers-reduced-motion` skips hidden state + animation (content shown immediately; App also
  pre-reveals).

**2. Build / typecheck** — ✓ / ✓.

**3/4. Validation** (paused intro via `?introspeed`, DOM measurement):

| State | Expectation | Measured | Match |
|---|---|---|---|
| Pre-reveal (intro t0.5) | lines translated down; content faded | line1 `translateY(73.44px)`=yPercent100; reveal opacity 0 | ✅ |
| Post-reveal end | lines at 0; content opaque; loader gone | line1 `translateY(0)`; reveals opacity [1,1,1]; loader unmounted | ✅ |
| Settled full page | = verified hero | right-half SSIM 0.831 vs baseline (font-limited) | ✅ |

- The line-mask rise begins as the A3 panel wipe exposes the hero (cue at A3 start) — matching
  the scroll.webm ordering (headline rises as the cream/white panel arrives).

**5. Refine** — none needed; hidden/animate/settled states verified. Centralized the signature
easing into `src/motion/ease.ts` (used by both IntroLoader and HeroReveal).

## Known / provisional items

- **Timings — MEDIUM (video-derived):** B1/B2 durations (0.7 / 0.5s), stagger (0.08 / 0.1s) and
  overlap (−0.35s) are estimates per the approved policy; the mechanism + ordering + easing
  match. Fine-tune against a fresh live recording if desired — non-blocking.
- **Typography PROVISIONAL** (fonts) — unchanged; the reveal animates the same elements.

## Frozen S1–S6 characteristics — unchanged
Static layout + IntroLoader untouched; HeroReveal only adds pre-reveal state + a triggered
timeline on the existing hero elements.

## Conclusion
HeroReveal reproduces the verified line-mask headline rise + supporting-content fade, correctly
cued by the IntroLoader handoff, settling to the pixel-validated hero. **This completes the
approved section workflow (S1–S7).**
