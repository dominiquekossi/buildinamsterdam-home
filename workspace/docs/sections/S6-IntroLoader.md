# Section 6 — IntroLoader — Comparison Report

**Status:** implemented · build green · sequence validated vs scroll.webm · autonomously continued.
Files: `src/motion/IntroLoader.tsx`, `src/App.tsx` (phase state + reduced-motion).

## Loop results

**1. Implement** — GSAP timeline (signature ease `CustomEase "0.45,0.02,0.09,0.98"`):
- **A1** wordmark draw-on: `clip-path inset(0 100% 0 0) → inset(0 0% 0 0)`, 0.8s @ t0.
- **A2** move to header slot: logo (placed at the real header position, left 2vw / top 30 / 144px)
  starts transformed to viewport centre + `scale 1.8`, animates to identity, 0.45s @ t0.9.
- **A3** reveal: full-black field `clip-path → inset(0 50% 0 0)` (wipes back to the left half,
  exposing the white hero panel), 0.55s @ t1.2; fires `onReveal` (HeroReveal cue) on start.
- On complete the loader unmounts → SplitCanvas's black left panel + the real HeaderLogo take
  over at the identical position (seamless handoff). `prefers-reduced-motion` skips the loader.

**2. Build / typecheck** — ✓ / ✓ (GSAP + CustomEase bundled).

**3/4. Sequence validation** (paused timeline via dev-only `?introspeed`, `docs/diffs/sbs-intro-seq.png`):

| Phase | Recon | scroll.webm reference | Match |
|---|---|---|---|
| A1 @ t0.4 | full black, centred enlarged wordmark mid-draw ("FRONT R") | f10 (400ms): "BiA. … FRONT R" drawing | ✅ |
| A2 end | wordmark at top-left header slot, 144px | f22+ (~880ms): logo settled top-left | ✅ |
| A3 @ t1.45 | black wiped to left half, white hero panel revealed | f35–45 (1.4–1.8s): panel wipes in, hero appears | ✅ |
| End state | loader gone; logo @ (28.8,30,144); hero visible | final hero | ✅ (measured) |

**5. Refine** — none needed; sequence and handoff verified. End-state geometry re-measured:
header logo (28.8, 30, 144), headline correct, loader unmounted.

## Known / provisional items

- **Timings — MEDIUM (video-derived):** durations/delays (0.8 / 0.45 / 0.55s; offsets 0 / 0.9 /
  1.2) and the A2 start scale (1.8) are estimated from scroll.webm (25fps ⇒ ±~40–80ms) per the
  approved policy. Structure + easing match; exact per-tween values to be fine-tuned (e.g.
  against a fresh live recording) — non-blocking.
- **Dev affordances:** `window.__introTl` + `?introspeed=` are `import.meta.env.DEV`-gated and
  stripped from production builds (validation tooling only).
- The loader logo is the white SVG on black (no blend needed on pure black); hands off to the
  blend-mode HeaderLogo. Logo-over-video tone still pending ShowreelSlot media (S2/S5 carry).

## Frozen S1–S5 characteristics — unchanged
Static layout untouched; IntroLoader is an additive overlay + App phase state.

## Conclusion
IntroLoader reproduces the verified loader sequence (draw → move → wipe) with the house easing
and a seamless handoff to the static hero. Timings are MEDIUM (flagged). Proceeding to
**Section 7 — HeroReveal**.
