import { useLayoutEffect } from "react";
import type { RefObject } from "react";

/**
 * useColumnEntrance — Section 5: the /cases cold-load COLUMN SETTLE, cases-scoped.
 *
 * MEASURED (live, document-start recorder): on cold load each column starts at a FIXED ±50px
 * translateY and eases to 0 over ~1340ms on the house curve cubic-bezier(0.45,0.02,0.09,0.98).
 * The offset alternates by VISUAL column L→R: +50, −50, +50, −50. Visual order ≠ DOM order
 * (grid-template-areas is [col-2,col-0,col-1,col-3]), so in DOM order c0..c3 the signs are
 * −50, +50, +50, −50 → on screen +,−,+,−. Magnitude is FIXED 50px (viewport-INVARIANT — same at
 * 1024 and 1440; NOT scaled). Ends EXACTLY at translateY 0.
 *
 * LAYER COMPOSITION (critical): the Section-3 parallax writes translateY on [data-cases-col] every
 * rAF frame. This settle is ALSO translateY — so it rides a SEPARATE wrapper layer ([data-cases-settle])
 * that WRAPS [data-cases-col]. Parent(settle translateY) ∘ child(parallax translateY) compose; once the
 * settle finishes at 0 the only translateY left on the column is the parallax → Section 3 behaves
 * exactly as verified (ratios [1,0.737,0.737,0.8547]@1024). The grid-item's translateX (Section-4
 * spread) is a further ancestor; all three live on different nodes and never clobber each other.
 *
 * Mirrors /contact's entrance structure (ContactGallery: a dedicated motion effect on its own wrapper,
 * NOT the shared scroll hook, reduced-motion aware) — but the curve is a single named house easing, so
 * WAAPI (element.animate) is used here rather than contact's rAF velocity-integrator.
 *
 * OVERLAPS the fade: starts on mount together with the card-wrapper opacity stagger (useCardEntrance);
 * neither gates the other. Plays ONCE on mount ([] dep + stable nodes) — not on filter toggle / scroll
 * / re-render. fill:"both" holds the initial ±50 before first paint (no jump) and 0 after.
 */
const SETTLE_OFFSET = [-50, 50, 50, -50]; // DOM col 0..3 → visual +,−,+,− L→R
const SETTLE_MS = 1340;
const SETTLE_EASE = "cubic-bezier(0.45, 0.02, 0.09, 0.98)";

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function useColumnEntrance(containerRef: RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const settles = Array.from(container.querySelectorAll<HTMLElement>("[data-cases-settle]"));
    if (settles.length === 0) return;

    // reduced-motion: skip the slide — rest at translateY 0 immediately (matches contact's behaviour).
    if (prefersReducedMotion) {
      settles.forEach((el) => { el.style.transform = "translateY(0px)"; });
      return;
    }

    settles.forEach((el, i) => {
      const from = SETTLE_OFFSET[i] ?? 0;
      el.animate(
        [{ transform: `translateY(${from}px)` }, { transform: "translateY(0px)" }],
        { duration: SETTLE_MS, easing: SETTLE_EASE, fill: "both" },
      );
    });
    // Animations are GC'd with the nodes on unmount; never re-armed — the settle plays exactly once.
  }, [containerRef]);
}
