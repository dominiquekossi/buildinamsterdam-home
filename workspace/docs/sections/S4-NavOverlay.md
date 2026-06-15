# Section 4 — NavOverlay — Comparison Report

**Status:** implemented · build green · Pixel Comparison done · autonomously approved (continued).
Files: `src/components/layout/NavOverlay.tsx`, `src/components/layout/MenuButton.tsx` (open morph),
`src/App.tsx` (toggle + content shift), `src/styles/globals.css` (`.no-scrollbar`).

## Loop results

**1. Implement** — black bottom-sheet nav (`max(450px,50vh)`) behind the page content;
opening slides the content wrapper up by the same amount (transition `0.65s cubic-bezier(0.45,0.02,0.09,0.98)`),
revealing it. Items: flex row, 360px wide, 35px gap/padding, horizontal scroll (scrollbar
hidden). Each = status dot (Home blue `#3C4CC7` active, others terracotta `#C38133`, .6em) +
uppercase label (NHaasGroteskTXPro 500, 16/19.2, white) + thumbnail. "Follow us" + IG/LinkedIn
bottom-right. MenuButton morphs terracotta→blue + "Menu"→"Close" on open (`fill 0.5s ease`).

**2. Build / typecheck** — ✓ / ✓.

**3/4. Pixel Comparison** (`docs/diffs/sbs-navoverlay.png`, recon top / original bottom; panel = bottom 50vh).

DOM measurement (authoritative), open state @1440×900:

| Property | Original | Recon | Match |
|---|---|---|---|
| Nav panel rect | x0 y450 w1440 h450 | x0 y450 w1440 h450 | ✅ |
| Panel bg | `#000` | `#000` | ✅ |
| Content shift on open | translateY(-449) | translateY(-450) | ✅ |
| Shift transition | `transform .65s cubic-bezier(.45,.02,.09,.98)` | same | ✅ |
| Item width / gap / pad | 360 / 35 / 35 | 360 / 35 / 35 | ✅ |
| Item x positions | 35, 430, 825, 1220, … | 35, 430, 825, 1220, … | ✅ exact |
| Thumbnail (resting) | 360 × 192.7 | 360 × 192.7 | ✅ |
| Dot colors | Home blue, rest terracotta | same | ✅ |
| Label | NHaasGrotesk TX 500 16/19.2 uppercase white | same | ✅ |
| Menu button on open | stays fixed @ (720, 817) | (720, 815) | ✅ |
| Header on open | rides up off-top (−449) | (−411 center, top off-screen) | ✅ |
| Button morph | blue `#3C4CC7` + "Close" | `#3C4CC7` + "Close" | ✅ |
| Toggle close | returns transform→none | transform→none, aria-hidden true | ✅ |

**5. Refine** — two corrections during the loop:
1. **Scrollbar:** the horizontal item row showed a native scrollbar; added `.no-scrollbar` (matches the original's hidden-scrollbar drag row).
2. **Menu button containment (important):** first build placed MenuButton *inside* the shifting
   wrapper, so it rode up to y365. Live measurement proved the original button is **NOT** in the
   shift wrapper (`insideShiftWrapper:false`) and stays at y≈817. Moved MenuButton outside the
   wrapper → now stays put at the bottom over the nav (verified (720, 815)). The HeaderLogo
   *is* inside the wrapper and correctly rides up (verified both original and recon).

## Known / provisional items (carried forward)

- **Nav item hover case-preview** (the "Simone" featured-case card that appears on item hover)
  is **not implemented** — it is an advanced interaction not fully specified by the artifacts
  (which case, card layout, trigger). Deferred; flagged MEDIUM. Non-blocking for the homepage
  resting/menu states.
- **"Follow us" width/spacing** slightly narrower than original (127 vs 188px; right edge aligns).
  Minor; entangled with fallback-font metrics + icon sizing. PROVISIONAL (fonts).
- **Mobile nav behavior** (≤768) not yet validated — the desktop content-shift model needs a
  mobile-appropriate variant. PROVISIONAL; revisit with mobile pass.
- Labels use NHaasGroteskTXPro → Helvetica fallback. PROVISIONAL (fonts).

## Frozen S1–S3 characteristics — unchanged
Split, header (position/blend/144px/link), menu-button circle geometry/shadow all intact;
MenuButton only gained an `isOpen` morph (additive).

## Conclusion
NavOverlay reproduces the verified panel geometry, item layout, dots, labels, thumbnails,
the content-shift reveal (−450, 0.65s house easing), the fixed-bottom menu button, and the
blue/"Close" morph. Residual items are advanced / mobile / font-dependent and flagged.
Proceeding to **Section 5 — Hero**.
