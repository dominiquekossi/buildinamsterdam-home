import { useEffect, useRef } from "react";
import type { RefObject } from "react";

/**
 * useCasesScroll — Section 3: virtual scroll + per-column parallax for /cases, plus the
 * Section-3-extension AUTO-PAN (the page pans DOWN on its own; pauses on input/filter; resumes after idle).
 *
 * Mechanism replicated from the live (verified 2026-06-14 via a clean single-synthetic-wheel
 * Playwright probe at a real 60Hz; auto-pan verified 2026-06-15):
 * - No native scroll (CasesPage locks html/body overflow:hidden). A wheel/touch listener
 *   accumulates a target S into [0, R_max].
 * - RAW PASSTHROUGH for input — NO smoothing/lerp/glide/inertia. The live applies the scroll INSTANTLY:
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
 *
 * AUTO-PAN (Section-3 extension, ALL VALUES MEASURED live 2026-06-15, width-invariant @1024 & 1440):
 * - A SECOND writer into the SAME `target` the wheel/touch write. It does NOT touch the parallax
 *   formula or the node it writes — it only changes HOW `target` advances. Parallax reads S exactly
 *   as before.
 * - HOLD_MS = 4100: idle delay. `lastInputT` is initialised to mount, so the FIRST auto-pan begins
 *   ~4.1s after load (by then the entrance settle ~1.34s has finished and S holds at 0 — matches live).
 *   The SAME constant is the resume-after-input idle (IDLE_MS ≈ HOLD_MS, one reused ~4.1s constant).
 * - RAMP_MS = 375: on start AND on every resume the velocity re-ramps LINEARLY 0→CRUISE over 375ms
 *   (measured from the resume start — `autoStartT`, reset to null whenever auto is suspended, so each
 *   resume re-ramps from rest).
 * - CRUISE = 18.62 px/s: steady-state auto velocity (same at 1024 & 1440 — width-invariant).
 * - DOWN only: `target = min(R_max, target + v·dt)` (dt clamped ≤ 50ms). Advances from the CURRENT S
 *   (target≈S in passthrough) — NO catch-up jump to where it "would have been" during the pause. Auto
 *   never moves up; it STOPS at R_max (no loop/reverse). The user can still scroll up manually.
 * - SUSPENDED while a wheel/touch is recent (within HOLD_MS) — the user fully drives, incl. UP (S may
 *   decrease); auto does not add to / fight the user's delta. SUSPENDED while the filter is open
 *   (verified live: panel open → S freezes); closing re-arms the HOLD_MS countdown so it resumes ~4.1s
 *   after close. reduced-motion: auto-pan is skipped entirely (manual input still works).
 */
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// Auto-pan constants — measured live, do NOT change.
const HOLD_MS = 4100; // idle before auto-pan starts after load AND before resuming after input
const RAMP_MS = 375; // linear 0→CRUISE ramp on start and on every resume (re-ramp from rest)
const CRUISE = 18.62; // px/s steady-state auto velocity (width-invariant)

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

declare global {
  interface Window {
    __casesScroll?: {
      state: () => {
        S: number;
        target: number;
        rMax: number;
        ranges: number[];
        factors: number[];
        translateY: number[];
        v: number;
        autoActive: boolean;
        msSinceInput: number;
        filterOpen: boolean;
      };
      scrollTo: (v: number) => void;
      setTarget: (v: number) => void;
    };
  }
}

export function useCasesScroll(
  containerRef: RefObject<HTMLDivElement | null>,
  filterOpen = false,
) {
  // Live-tracked filter state, read inside the rAF loop WITHOUT re-running the main effect (a
  // restart would reset S to 0 and kill the parallax/auto-pan). The loop reads filterOpenRef.current.
  const filterOpenRef = useRef(filterOpen);
  useEffect(() => {
    filterOpenRef.current = filterOpen;
  }, [filterOpen]);

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
    // Auto-pan clocks. lastInputT initialised to mount → the first auto-pan begins HOLD_MS after
    // load. autoStartT marks the start of the CURRENT auto run (for the 0→CRUISE ramp); null =
    // suspended, so the next resume re-ramps from rest. currentV is exposed for the DEV probe.
    let lastInputT = performance.now();
    let autoStartT: number | null = null;
    let lastFrameT = performance.now();
    let currentV = 0;

    const markInput = () => {
      lastInputT = performance.now();
    };

    const apply = () => {
      for (let i = 0; i < columns.length; i++) {
        const ty = -S * (ranges[i] / rMax);
        columns[i].style.transform = `translateY(${ty}px) translateZ(0px)`;
      }
    };

    // Two writers into one `target`: input (raw passthrough, set in the listeners) and auto-pan
    // (here, when idle). S then tracks clamp(target) each frame (no glide/lerp — see header).
    const frame = () => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastFrameT) / 1000);
      lastFrameT = now;

      if (filterOpenRef.current) {
        // Filter open → auto-pan paused (verified live). Keep the idle clock fresh so the HOLD_MS
        // countdown restarts when the filter closes; reset the ramp so it re-ramps from rest then.
        lastInputT = now;
        autoStartT = null;
        currentV = 0;
      } else if (!prefersReducedMotion && now - lastInputT >= HOLD_MS) {
        // Idle long enough → auto-pan DOWN, re-ramping 0→CRUISE from the resume start.
        if (autoStartT === null) autoStartT = now;
        const rampElapsed = now - autoStartT;
        currentV = rampElapsed >= RAMP_MS ? CRUISE : CRUISE * (rampElapsed / RAMP_MS);
        target = Math.min(rMax, target + currentV * dt); // advance from CURRENT S; clamp at R_max
      } else {
        // Recent input (or reduced-motion) → no auto; reset ramp so the next resume starts from rest.
        autoStartT = null;
        currentV = 0;
      }

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
      markInput();
    };
    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? 0;
      markInput();
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? touchY;
      target = clamp(target + (touchY - y), 0, rMax);
      touchY = y;
      markInput();
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
      // Test affordance (dev only): geometry checks set S directly (speed-independent); scrollTo/
      // setTarget also bump lastInputT so a programmatic set isn't immediately overwritten by
      // auto-pan. state() exposes the auto-pan clocks (v, autoActive, msSinceInput) for verification.
      window.__casesScroll = {
        state: () => ({
          S,
          target,
          rMax,
          ranges: [...ranges],
          factors: ranges.map((r) => r / rMax),
          translateY: columns.map((c) => parseFloat((c.style.transform.match(/translateY\(([-\d.]+)px\)/) || [])[1] || "0")),
          v: Math.round(currentV * 100) / 100,
          autoActive: autoStartT !== null,
          msSinceInput: Math.round(performance.now() - lastInputT),
          filterOpen: filterOpenRef.current,
        }),
        scrollTo: (v: number) => {
          target = clamp(v, 0, rMax);
          S = target;
          lastInputT = performance.now();
          apply();
        },
        setTarget: (v: number) => {
          target = clamp(v, 0, rMax);
          lastInputT = performance.now();
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
