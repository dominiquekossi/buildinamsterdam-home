# Section 3 — MenuButton — Comparison Report

**Status:** implemented · build green · Pixel Comparison done · **awaiting approval**.
Files: `src/components/layout/MenuButton.tsx`, `src/App.tsx` (mounts it).

## Loop results

**1. Implement** — fixed terracotta circle straddling the split, with curved "Menu" text and
a 6-layer soft drop shadow. SVG is inlined (justified: the control is interactive and will
morph to "Close"/blue in Section 4). The shadow is reproduced with stacked `<feDropShadow>`
using the **exact** dy / stdDeviation / opacity values from the artifact filter `#filter`.
A `scale(0.85)` about the circle centre (verified from source) pulls "Menu" in to hug the
visible edge and shrinks the glyphs.

**2. Build / typecheck** — `npm run typecheck` ✓, `npm run build` ✓.

**3/4. Pixel Comparison (section scope = menu-button region).**

Geometry by DOM measurement (authoritative) @1440×900:

| Property | Original | Recon | Match |
|---|---|---|---|
| Visible circle diameter | 85.5px | 85.5px | ✅ exact |
| Circle centre (x, y) | (719.4, 814.6) | (719.4, 814.4) | ✅ sub-pixel |
| Circle fill | `#C38133` | `#C38133` | ✅ |
| Horizontal position | centered on split (x=720) | x=720 (`left-1/2 -translate-x-1/2`) | ✅ |
| Curved label | "Menu", on right edge, top→bottom | same | ✅ |
| Label font / size | NeueHaasGrotesk-Roman 16px | 16px (Helvetica fallback) | ⚠️ PROVISIONAL (font) |
| Text scale | `scale(0.85)` (hugs edge) | `scale(0.85)` about centre | ✅ |
| Drop shadow | 6-layer (dy/blur/opacity set) | 6× `feDropShadow`, same values | ✅ (re-encoded) |

**Visual comparison** (`docs/diffs/sbs-menubutton-2x.png`, recon | original, 2× zoom):
- Circle position, size, and colour are indistinguishable.
- "Menu" now hugs the circle edge at matching size and reads top→bottom along the right arc
  in both (the `scale(0.85)` refinement fixed the earlier float-too-far-out / too-large issue).
- The circle fill is **opaque terracotta**, so it looks identical over the recon's black
  placeholder and the original's beige video frame (backdrop-independent) — unlike the logo.

**5. Refine** — applied `scale(0.85)` about the circle centre (verified from source) after the
first comparison showed the label floating too far out and slightly large. Re-compared: match
improved to indistinguishable except the two flagged items below.

## Known / provisional items (carried forward)

- **Label glyph shapes — PROVISIONAL (fonts):** uses Helvetica fallback; exact letterforms
  and the resulting arc placement (anchor=middle depends on word width) finalize when
  `NeueHaasGrotesk-Roman` is supplied.
- **Rotor angle — MEDIUM (animated):** the live label rotates — the `<g>` transform differed
  between captures (`rotate(-20deg)` at load vs `rotate(170deg)` live). Recon uses a static
  canonical 3-o'clock placement; the live baseline frame shows it slightly lower. The exact
  angle is dynamic and will be driven by the rotor animation in the **motion** sections, where
  this is reconciled. (Residual static vertical offset vs baseline ≈ a small arc fraction.)
- **Open-state morph** (terracotta→blue `#3C4CC7`, "Menu"→"Close") + click→open behavior is
  **deferred to Section 4 (NavOverlay)**; `onClick` prop is already plumbed.
- **Backdrop:** circle is opaque so unaffected by the not-yet-built ShowreelSlot.

## Frozen S1 / S2 characteristics — unchanged
SplitCanvas (50/50, x=720, colors, no-scroll, breakpoint) and HeaderLogo (position, blend,
144px, link) untouched.

## Conclusion
MenuButton reproduces the verified circle geometry, color, position, curved-label mechanism,
edge-hugging scale, and the exact 6-layer shadow values. Residual deltas are limited to the
font-dependent glyphs (PROVISIONAL) and the animated rotor angle (MEDIUM, handled in motion).
**Requesting approval to proceed to Section 4 — NavOverlay.**
