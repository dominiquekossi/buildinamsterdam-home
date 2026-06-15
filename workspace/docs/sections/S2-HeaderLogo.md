# Section 2 — HeaderLogo — Comparison Report

**Status:** implemented · build green · Pixel Comparison done · **awaiting approval**.
Files: `src/components/layout/HeaderLogo.tsx`, `src/App.tsx` (mounts it),
`public/logos/bia-logo.svg` (baked white fill).

## Loop results

**1. Implement** — fixed `<header>` top-left with the BiA wordmark referenced from
`public/logos/bia-logo.svg` (not inlined, per CLAUDE.md). Asset edited so the SVG carries a
baked `fill:#FFFFFF` (the live site colored it via CSS absent from artifacts), so it renders
white as an `<img>`; `mix-blend-mode: exclusion` on the header handles inversion.

**2. Build / typecheck** — `npm run typecheck` ✓, `npm run build` ✓.

**3/4. Pixel Comparison (section scope = header region only).**

Geometry by DOM measurement (authoritative) @1440×900:

| Property | Original | Recon | Match |
|---|---|---|---|
| Header position | fixed/sticky top-left | `fixed top:0 left:0` | ✅ |
| Padding | `30px 28.8px` (2vw horiz) | `30px 28.8px` (`py-[30px] px-[2vw]`) | ✅ |
| `mix-blend-mode` | exclusion | exclusion | ✅ |
| Logo width | 144px | 144px | ✅ |
| Logo x / y @1440 | 28.8 / 30 | 28.8 / 30 | ✅ |
| Aspect ratio | 534:60 (8.9) | 534:60 (8.9) | ✅ |
| Link href | `/` | `/` | ✅ |
| Header box height | 80.2px | 76.2px | ⚠️ Δ4px (see below) |

**Visual / blend verification:**
- Side-by-side (`docs/diffs/sbs-headerlogo.png`): wordmark **shape, proportions, internal
  spacing, and position are identical**. Only the *tone* differs.
- Header-crop SSIM was **negative (−0.06)** — investigated and **explained**, not a defect:
  the logo tone is a function of the backdrop because of `mix-blend-mode: exclusion`. The
  recon's left panel is the **black placeholder**, so the logo is **white**; the live
  baseline happened to capture a **light beige video frame**, so its logo is **dark**.
  - Recon matches `artifacts/crawl/screenshot.jpeg` (white-on-black) exactly.
  - Confirmed the blend inverts **both ways**: on mobile (header over the white content
    panel) the recon logo renders **dark** (`docs/diffs/recon-headerlogo-390.png`) — exactly
    what exclusion should do. So the blend is correct; tone will reconcile once `ShowreelSlot`
    video lands behind the header.

**5. Refine** — none needed; geometry + blend verified exact.

## Known / provisional items

- **Header box height Δ4px** (76.2 vs 80.2): does **not** move the logo glyph (logo x/y/size
  identical). Likely the original `<a>` inline line-height; immaterial to visual fidelity.
  Flagged, not changed (no measurable visual impact).
- **Logo tone over desktop left panel** depends on the **ShowreelSlot** video (not yet built).
  Re-compare the header over real video during the **Hero** section.
- Typography of the logo is a vector asset (not font-dependent), so it is **not** subject to
  the PROVISIONAL-fonts caveat.

## Frozen Section-1 characteristics — unchanged
SplitCanvas split (50/50, x=720), panel colors, fixed-no-scroll desktop, breakpoint 769px,
mobile stacking — all untouched by this section.

## Conclusion
HeaderLogo reproduces the verified position, size, padding, blend mode, and link exactly;
the wordmark shape matches the original. The only delta (logo tone on desktop) is a correct
consequence of the placeholder backdrop and resolves with the video. **Requesting approval to
proceed to Section 3 — MenuButton.**
