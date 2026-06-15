# Section 1 — SplitCanvas — Comparison Report

**Status:** implemented · build green · Pixel Comparison done · **awaiting approval**.
Files: `src/components/homepage/SplitCanvas.tsx`, `tailwind.config.ts` (added `desktop: 769px`),
`src/App.tsx` (mounts SplitCanvas, empty slots).

## Loop results

**1. Implement** — `SplitCanvas` renders a content panel (white, DOM-first for a11y) and a
video panel (dark). Desktop uses `flex-row-reverse` (video left, content right); mobile
`flex-col` (content top, video below). Accepts `videoSlot` / `contentSlot` for later sections.

**2. Build / typecheck** — `npm run typecheck` ✓, `npm run build` ✓.

**3. Match viewport** — Chrome DevTools emulated 1440×900 (dpr 1), matching baseline.

**4. Pixel Comparison** — recon `docs/diffs/recon-splitcanvas-1440.png` vs baseline
`docs/baselines/original-1440x900.png`; difference image `docs/diffs/diff-splitcanvas-1440.png`.

**5. Measured discrepancies** — DOM measurement (authoritative for geometry):

| Property | Original | Recon | Match |
|---|---|---|---|
| Split boundary (desktop) | x = 720 (50%) | x = 720 (50%) | ✅ exact |
| Right/content panel bg | `#FFFFFF` | `#FFFFFF` | ✅ |
| Left/video panel bg | dark (video) → black placeholder | `#000000` | ✅ (placeholder) |
| Desktop page scroll | none (fixed hero) | none (`scrollH = vh`) | ✅ |
| Root layout | fixed, overflow hidden | fixed, overflow hidden, row-reverse | ✅ |
| Breakpoint | 769px | `desktop: 769px` | ✅ |
| Mobile stack order | content top, video below | content top, video below | ✅ |
| Mobile scroll | scrolls | scrolls | ✅ |

- **Difference image reading:** the split seam at x=720 is crisp with **no offset band**
  (a misaligned split would show a solid vertical strip — none present). All remaining
  difference is **content owned by later sections**: left = showreel video imagery; right =
  headline / lead / CTA glyphs; plus header logo + Menu button. Expected and tracked.
- **Whole-frame SSIM = 0.408** (PSNR ~4.3 dB). Low *by design* at this stage — it scores all
  unbuilt content; treat as a progress baseline expected to climb each section, not a pass/fail.

**6. Refine** — no structural refinement needed; geometry/colors/scroll match exactly.

## Known / provisional items (carried forward)

- **Mobile content-section height (MEDIUM confidence):** original content section is
  content-driven (~780px @390, ~960px @768), not full-viewport. Placeholder currently forces
  `min-h-screen`; will be finalized in the **Hero** section once real content sets the height,
  then re-compared.
- **Left panel** is a flat black placeholder; real showreel video arrives in the **Hero**
  section (`ShowreelSlot`, stubbed per reviewer decision — Mux HLS not embedded yet).
- Typography-dependent layout remains **PROVISIONAL** pending licensed fonts.

## Conclusion

SplitCanvas reproduces the verified structural shell exactly (50/50 split, panel colors,
fixed no-scroll desktop, stacked scrolling mobile). No meaningful discrepancies within this
section's scope. **Requesting approval to proceed to Section 2 — HeaderLogo.**
