import { useCallback, useEffect, useState } from "react";
import HeaderLogo from "../layout/HeaderLogo";
import MenuButton from "../layout/MenuButton";
import NavOverlay from "../layout/NavOverlay";
import CaseGrid from "./CaseGrid";
import FilterTrigger from "./FilterTrigger";
import FilterPanel from "./FilterPanel";

/**
 * CasesPage — the /cases ("Work") page shell + static portfolio grid.
 *
 * Section 1 (shell): reuses the approved layout components (HeaderLogo, MenuButton,
 * NavOverlay) and mirrors how the home (App.tsx) composes the shell — NavOverlay behind a
 * content wrapper that slides up by `--nav-shift` on open, MenuButton fixed at the bottom,
 * body scroll locked while the nav is open. No IntroLoader (the /cases entrance is its own
 * system — Section 5).
 *
 * Section 2: the masonry CaseGrid. Section 3: virtual scroll + per-column parallax (html/body
 * overflow:hidden, `main` is the viewport-locked clipper; CaseGrid's useCasesScroll). Section 4
 * (this round): the filter — the "Filter Work" trigger opens it; CaseGrid spreads the columns
 * ±65% and FilterPanel mounts; the shared MenuButton is handed `label="Close"` + `onActivate` ONLY
 * while open (so it shows "Close" and closes the filter; otherwise it reverts to "Menu" + nav).
 *
 * Section 5 (this round): the load-in. Opacity-only, no translate — three concerns: the card grid
 * fades in row-staggered (CaseGrid/useCardEntrance, on per-card wrappers), each cover fades on load
 * (CaseCard), and the "Filter Work" trigger fades in with its two Section-4 fades (FilterTrigger,
 * now on every mount → entrance + close share one path). Hover (6) and real cover assets (7) later.
 *
 * The nav-shift regime + house easing are copied verbatim from the home shell (App.tsx):
 * the panel height (and therefore the content shift) steps at min-width:1280px — <1280 the
 * panel is 400px fixed (shift 399), ≥1280 it is max(450px,50vh) (shift panel−1px).
 */
const NAV_EASE = "cubic-bezier(0.45, 0.02, 0.09, 0.98)";

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function CasesPage() {
  const [navOpen, setNavOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const toggleNav = useCallback(() => setNavOpen((o) => !o), []);
  const closeNav = useCallback(() => setNavOpen(false), []);
  const openFilter = useCallback(() => setFilterOpen(true), []);
  const closeFilter = useCallback(() => setFilterOpen(false), []);

  // /cases has no native scroll: the live locks html AND body to overflow:hidden and drives the
  // grid via the virtual scroll (useCasesScroll). Lock on mount, restore on unmount. This also
  // removes the native scrollbar, so the 100vw grid fits exactly (no rightmost-column clip).
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, []);

  return (
    <>
      <NavOverlay open={navOpen} />
      {/* Content wrapper: shifts up to reveal the nav. HeaderLogo rides up with it;
          MenuButton is OUTSIDE the wrapper so it stays fixed at the bottom (mirrors App.tsx). */}
      <div
        className="relative z-10 [--nav-shift:399px] min-[1280px]:[--nav-shift:calc(max(450px,50vh)-1px)]"
        style={{
          transform: navOpen ? "translateY(calc(-1 * var(--nav-shift)))" : "none",
          transition: prefersReducedMotion ? "none" : `transform 0.65s ${NAV_EASE}`,
        }}
        // While the nav is open the shifted page is a click-to-close backdrop (mirrors App.tsx).
        onClick={navOpen ? closeNav : undefined}
      >
        {/* Page body — viewport-locked white surface that clips the tall grid (the live keeps the
            grid container at viewport height with overflow:hidden; the columns translate within). */}
        <main className="h-screen w-full overflow-hidden bg-white">
          <CaseGrid filterOpen={filterOpen} />
        </main>
        <HeaderLogo variant="short" />

        {/* Filter (Section 4): trigger when closed, panel when open. Rendered INSIDE the nav-shift
            wrapper (not a fixed sibling) so it rides the wrapper's translateY when the nav opens —
            matching the live, where "Filter Work" is a descendant of the shifted content container
            (verified 2026-06-17: live & build both translateY −399px / 0.65s house ease; only the DOM
            placement differed, so our trigger used to stay put and overlap the opened nav). They keep
            position:fixed: when the nav opens the wrapper's transform becomes their containing block so
            they ride the −399 shift; when the nav is closed (transform: none) they stay viewport-fixed
            (trigger centered, panel full-height). The live shows NO bottom "Work" context label in the
            filter-open state, so none is rendered. */}
        {filterOpen ? <FilterPanel /> : <FilterTrigger onOpen={openFilter} />}
      </div>

      <MenuButton
        isOpen={navOpen}
        onClick={toggleNav}
        revealed
        {...(filterOpen ? { label: "Close", onActivate: closeFilter } : {})}
      />
    </>
  );
}
