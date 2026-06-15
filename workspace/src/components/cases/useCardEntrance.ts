import { useLayoutEffect } from "react";
import type { RefObject } from "react";

/**
 * useCardEntrance — Section 5: the /cases load-in (card row-stagger), cases-scoped.
 *
 * MEASURED (live, Playwright, opacity-only — NO translate): each card fades opacity 0→1 over 300ms
 * `ease-out`, staggered by MASONRY ROW. Cards aligned at the same height fade together; rows cascade
 * top→bottom ~150ms apart (0,150,300,…,1200 for ~9 rows). The fade lives on a per-card WRAPPER
 * ([data-card-wrapper]) — NOT the column ([data-cases-col], which carries the Section 3 parallax
 * translateY) and NOT the card's <a> (which stays opacity 1). Opacity-on-wrapper composes cleanly
 * with the column's translateY and the grid-item's translateX (Section 4 spread): three separate
 * nodes, so transform and opacity never clobber each other.
 *
 * Row = a horizontal BAND of the grid: rowIndex = round((cardTop − minTop) / rowHeight). rowHeight is
 * the tallest column's card pitch — col-0 (DOM index 0) is the 2:3, 9-card column, the densest/tallest
 * pitch — so its 9 cards land one-per-band → a contiguous 0,150,…,1200ms staircase. The shorter (3:4)
 * columns interleave into the same bands by absolute Y, so a 3:4 card sitting level with a 2:3 card
 * shares its row (the live's "same height → same delay"). minTop is subtracted so row 0 = delay 0
 * regardless of any constant grid offset. We `round` (not `floor`): offsetTop is integer-quantised by
 * the browser, so a `floor` boundary drifts by the accumulated sub-pixel pitch error (~2px over 8
 * cards) — enough to collide one mid-stack row and drop the last — whereas `round` snaps each card to
 * its nearest band centre, giving the exact contiguous 9-row staircase (verified 8→9 rows at 1024).
 *
 * Plays ONCE on mount: the [] dep means it arms a single time, and the wrapper nodes are stable across
 * re-renders (filter open/close just toggles the grid-item translateX; scroll is imperative), so the
 * finished animations are never re-created. (No StrictMode in this app — single mount, single run.)
 * The fade is set up in useLayoutEffect (before paint, before useCasesScroll's useEffect applies any
 * transform), so measurement is clean and there is no opacity flash on first paint.
 */
const ROW_STAGGER_MS = 150;
const CARD_FADE_MS = 300;

export function useCardEntrance(containerRef: RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const columns = Array.from(container.querySelectorAll<HTMLElement>("[data-cases-col]"));
    if (columns.length === 0) return;

    // rowHeight = the tallest column's card pitch (col-0, the 2:3 / 9-card column). Flooring by it
    // gives col-0 a contiguous 0..8 row staircase; shorter columns interleave by absolute Y.
    const col0Wraps = Array.from(columns[0].querySelectorAll<HTMLElement>("[data-card-wrapper]"));
    let rowHeight = col0Wraps[0]?.offsetHeight ?? 0;
    if (col0Wraps.length >= 2) {
      const pitch = col0Wraps[1].offsetTop - col0Wraps[0].offsetTop;
      if (pitch > 0) rowHeight = pitch;
    }
    if (rowHeight <= 0) rowHeight = 1;

    const wrappers = Array.from(container.querySelectorAll<HTMLElement>("[data-card-wrapper]"));
    if (wrappers.length === 0) return;
    const tops = wrappers.map((w) => w.offsetTop);
    const minTop = Math.min(...tops);

    wrappers.forEach((w, i) => {
      const row = Math.max(0, Math.round((tops[i] - minTop) / rowHeight));
      w.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: CARD_FADE_MS,
        delay: row * ROW_STAGGER_MS,
        easing: "ease-out",
        fill: "both",
      });
    });
    // Animations are GC'd with the nodes on unmount; never re-armed — the entrance plays exactly once.
  }, [containerRef]);
}
