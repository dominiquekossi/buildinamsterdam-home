# Section 5 — Hero — Comparison Report

**Status:** implemented · build green · Pixel Comparison done · autonomously continued.
Files: `src/components/homepage/Hero.tsx`, `src/components/homepage/ShowreelSlot.tsx`,
`src/App.tsx` (slots wired into SplitCanvas).

## Loop results

**1. Implement** — right panel = Hero (top bar absolute at top; headline + lead + CTA group
vertically centered via flex `justify-center`, padding 100/0/68). Headline = 5 explicit lines
each in an `overflow-hidden` mask (ready for S7). Left panel = ShowreelSlot stub (black + a11y
"Play showreel" control).

**2. Build / typecheck** — ✓ / ✓.

**3/4. Pixel Comparison** — recon `docs/diffs/recon-hero-1440.png` vs baseline
`docs/baselines/original-1440x900.png`; right-half diff `docs/diffs/diff-hero-right.png`.

DOM measurement (authoritative) @1440×900:

| Element | Original | Recon | Match |
|---|---|---|---|
| Top bar | 10px, y30, centered (cx1080), uppercase | 9.99px, y30, cx1080, uppercase | ✅ |
| Headline font/metrics | 86.4px (6vw) / 0.85 / -0.04em, center | 86.4 / 73.44 / -3.456, center | ✅ exact |
| Headline center / y | cx1080, y165.7 | cx1080, y165.8 | ✅ |
| Lead | 24/28.8, w375, center, cx1080 | 24/28.8, w375, center, cx1080 | ✅ |
| CTA each box | 110 × 34.2, 1px border | 110 × 34, 1px border | ✅ |
| CTA pair | shared border, centered cx1080, y732 | border-l-0 share, cx1080, y732.2 | ✅ |
| CTA hover | bg→#000 / text→#fff, color 0.5s ease | `hover:bg-black hover:text-white` 0.5s | ✅ |

- **Right-half SSIM = 0.831** (up from ~0.4 unbuilt). **Full-frame SSIM = 0.416** (left half is
  the black ShowreelSlot stub vs the original's video frame — expected).
- **Diff reading** (`diff-hero-right.png`): the only residual is **font substitution** —
  classic glyph "ghosting" (Helvetica vs NHaasGroteskDSPro; Georgia vs RecklessNeue). Line
  baselines, centering, lead wrapping (4 lines, same y), CTA boxes, and the segmented divider
  all **align exactly**. With the licensed fonts the right-half SSIM should approach ~1.0.

**5. Refine** — added responsive lead (18px/300px ≤768 → 24px/375px desktop) and tuned the
mobile headline clamp to `clamp(64px,16.5vw,80px)`. Verified mobile @390: headline 64.35px
(orig 64.48), lead 18px/300px (orig 18/300). Desktop unchanged (uses `desktop:` overrides:
headline 6vw, lead 24/375 — re-verified exact).

## Known / provisional items (carried forward)

- **Typography — PROVISIONAL (fonts):** all text uses fallbacks (Helvetica/Georgia). Re-run
  the Pixel Comparison once `NeueHaasGroteskDSPro` / `RecklessNeue-Book` / `NHaasGroteskTXPro`
  are supplied; headline block width (recon 414 vs orig 466) and the right-half SSIM converge then.
- **CTA font-size** fixed at the measured 11px@1440 (the live `var(--_font-size)` fluid
  formula was not derivable from artifacts). Flag; revisit if a formula is confirmed.
- **ShowreelSlot — STUBBED:** black placeholder; Mux HLS stream not embedded (reviewer
  decision). Logo-over-video tone (S2 carry) and left-half SSIM finalize when media lands.
- **Mobile vertical rhythm — MEDIUM:** sizes now match measured points, but exact mobile
  content-section height / vertical centering vs the original (content-driven ~780px) is
  approximate; a dedicated mobile pass can finalize. Desktop (frozen target) is exact.

## Frozen S1–S4 characteristics — unchanged
Split, header, menu button, nav all intact; SplitCanvas slots now populated (its geometry
unchanged — split still 50/50, no-scroll desktop).

## Conclusion
Hero reproduces the verified top-bar, headline (6vw/0.85/-0.04em, centered), lead (24/28.8,
w375), and segmented CTAs exactly in geometry/position/color; the sole residual is font
glyph shape (PROVISIONAL). Proceeding to **Section 6 — IntroLoader**.
