import { useEffect } from "react";
import type { RefObject } from "react";

/**
 * useCasesScroll — Section 3: virtual scroll + per-column parallax for /cases.
 *
 * Mechanism replicated from the live (verified 2026-06-14 via a clean single-synthetic-wheel
 * Playwright probe at a real 60Hz):
 * - No native scroll (CasesPage locks html/body overflow:hidden). A wheel/touch listener
 *   accumulates a target S into [0, R_max].
 * - RAW PASSTHROUGH — NO smoothing/lerp/glide/inertia. The live applies the scroll INSTANTLY:
 *   one wheel event of delta D moves S to its target within a SINGLE frame (measured: live
 *   600/1200/2400 jump to target in one frame, then flat). The perceived inertia on the live is
 *   the trackpad/OS momentum (a train of decreasing wheel events), not JS easing. So each frame
 *   S = clamp(S_target) and we write `transform: translateY(<-S·R_col/R_max>px) translateZ(0px)`
 *   inline on every column node. (An earlier velocity-cap glide was WRONG and is removed.)
 * - R_col = columnContentHeight − viewportHeight, computed at RUNTIME (never hardcoded); R_max is
 *   the tallest column's range (col-0). The parallax factors R_col/R_max emerge from the live
 *   heights (~[1, 0.74, 0.74, 0.86] @1024). col-0 moves 1:1 with S; shorter columns slower.
 * - Clamp: S∈[0,R_max] ⇒ at S=R_max every column locks at −R_col simultaneously (all bottoms
 *   align to the viewport bottom). No overshoot/bounce. Baseline S=0 ⇒ translateY 0 on all.
 */
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

declare global {
  interface Window {
    __casesScroll?: {
      state: () => { S: number; target: number; rMax: number; ranges: number[]; factors: number[]; translateY: number[] };
      scrollTo: (v: number) => void;
      setTarget: (v: number) => void;
    };
  }
}

export function useCasesScroll(containerRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // The parallax translateY rides the INNER column node ([data-cases-col]); the per-column
    // filter spread (translateX) lives on its grid-item ancestor (Section 4) so the two compose
    // without fighting — see CaseGrid.
    const columns = Array.from(container.querySelectorAll<HTMLElement>("[data-cases-col]"));
    if (columns.length === 0) return;

    // Content height of a column = bottom of its last card (stretch-immune: the grid items are
    // align-items:stretch unless overridden, so offsetHeight may exceed content).
    const contentHeight = (col: HTMLElement) => {
      const cards = col.querySelectorAll<HTMLElement>('a[href^="/case/"]');
      const last = cards[cards.length - 1];
      return last ? last.offsetTop + last.offsetHeight : col.offsetHeight;
    };

    let ranges: number[] = [];
    let rMax = 1;
    const measure = () => {
      ranges = columns.map((c) => Math.max(0, contentHeight(c) - window.innerHeight));
      rMax = Math.max(1, ...ranges);
    };
    measure();

    let S = 0;
    let target = 0;
    let raf = 0;

    const apply = () => {
      for (let i = 0; i < columns.length; i++) {
        const ty = -S * (ranges[i] / rMax);
        columns[i].style.transform = `translateY(${ty}px) translateZ(0px)`;
      }
    };

    // Raw passthrough: S tracks S_target directly each frame (no glide/lerp — see header).
    const frame = () => {
      const next = clamp(target, 0, rMax);
      if (next !== S) {
        S = next;
        apply();
      }
      raf = requestAnimationFrame(frame);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      target = clamp(target + e.deltaY, 0, rMax);
    };
    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? touchY;
      target = clamp(target + (touchY - y), 0, rMax);
      touchY = y;
      e.preventDefault();
    };
    const onResize = () => {
      measure();
      target = clamp(target, 0, rMax);
      S = clamp(S, 0, rMax);
      apply();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("resize", onResize);
    apply();
    raf = requestAnimationFrame(frame);

    if (import.meta.env.DEV) {
      // Test affordance (dev only): geometry checks set S directly (speed-independent), and the
      // glide nature is sampled while target!=S. Removed on unmount.
      window.__casesScroll = {
        state: () => ({
          S,
          target,
          rMax,
          ranges: [...ranges],
          factors: ranges.map((r) => r / rMax),
          translateY: columns.map((c) => parseFloat((c.style.transform.match(/translateY\(([-\d.]+)px\)/) || [])[1] || "0")),
        }),
        scrollTo: (v: number) => {
          target = clamp(v, 0, rMax);
          S = target;
          apply();
        },
        setTarget: (v: number) => {
          target = clamp(v, 0, rMax);
        },
      };
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("resize", onResize);
      columns.forEach((c) => {
        c.style.transform = "";
      });
      if (import.meta.env.DEV) delete window.__casesScroll;
    };
  }, [containerRef]);
}
