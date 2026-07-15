import { useEffect, useRef } from "react";
import { playHomeEntrance } from "../../motion/homeEntrance";
import { asset } from "@/utils/assetPath";
import "./IntroLoader.css";

interface IntroLoaderProps {
  /** Fires at E — the home-entrance cue (≈75ms after the exit fade begins; overlap). */
  onReveal: () => void;
  /** Fires when the loader is finished and can be unmounted. */
  onComplete: () => void;
}

/**
 * IntroLoader — page-load loader, rebuilt to the live mechanism (init-script capture +
 * getAnimations() registry, 2026-06-13; reviewer-approved Phase 2):
 *
 * - "BiA." is STATIC from first paint, self-centered on black (NO fade-in).
 * - After a 300ms delay, three parallel CSS @keyframes tracks (fill forwards — see
 *   IntroLoader.css): the separator line draws downward (300ms, house ease), "Powered by
 *   FRONT ROW" reveals left→right (1000ms) and the wordmark slides translateX(37%→0)
 *   (1000ms), both easeOutExpo cubic-bezier(0.19,1,0.22,1) — easings re-extracted
 *   2026-06-12 via getKeyframes() (they live per-keyframe; "all linear" was an artifact).
 * - ≈80ms after the tracks end (live: 75–150ms), the loader EXITS by a 200ms WAAPI fade
 *   (cubic-bezier(0.4, 0, 0.2, 1)) and unmounts. There is NO flight/scale to the header and
 *   NO black wipe — the live removed beliefs (old A2/A3) were sampler artifacts.
 * - The HOME ENTRANCE starts ≈75ms after the fade begins (overlap, loader still ~50–70%
 *   opaque): playHomeEntrance() — the showreel-close choreography verbatim + the header-logo
 *   700ms fade-in (src/motion/homeEntrance.ts). onReveal fires at the same moment (cues the
 *   Hero "writing" staggers + the MenuButton reveal).
 *
 * Schedule (t = effect arm): tracks 300→1300 · fade 1380→1580 · E = 1455 · unmount ≈1580.
 * The live's variable 35–150ms framework startup lag is intentionally NOT replicated.
 */
const TRACKS_END_MS = 1300; // 300ms delay + 1000ms longest track
const FADE_AFTER_MS = 80; // live: fade starts 75–150ms after the tracks end (MEDIUM)
const FADE_MS = 200;
const ENTRANCE_AFTER_FADE_MS = 75; // live: home entrance ≈75–80ms into the fade
const FADE_EASE = "cubic-bezier(0.4, 0, 0.2, 1)"; // live loader-exit ease (authoritative)

export default function IntroLoader({
  onReveal,
  onComplete,
}: IntroLoaderProps) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (import.meta.env.DEV) {
      const w = window as unknown as { __introEffectRuns?: number };
      w.__introEffectRuns = (w.__introEffectRuns ?? 0) + 1;
    }
    const el = root.current;
    if (!el) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    let fade: Animation | null = null;

    timers.push(
      setTimeout(() => {
        // Loader exit: 200ms opacity fade (WAAPI — the live's literal engine for it). The
        // fill holds 0 until the unmount, so there is no end-of-fade blip.
        fade = el.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: FADE_MS,
          easing: FADE_EASE,
          fill: "both",
        });
        timers.push(
          setTimeout(() => {
            playHomeEntrance();
            onReveal();
          }, ENTRANCE_AFTER_FADE_MS),
        );
        fade.finished.then(
          () => onComplete(), // unmount while the fill still holds opacity 0
          () => {},
        );
      }, TRACKS_END_MS + FADE_AFTER_MS),
    );

    return () => {
      timers.forEach(clearTimeout);
      fade?.cancel();
    };
  }, [onReveal, onComplete]);

  return (
    <div
      ref={root}
      className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-black"
    >
      {/* Wordmark: three stacked copies of the SVG, clipped to the "BiA." band (static), the
          separator-line band (draws downward) and the words band (reveals left→right) — the
          live clips `g.powered-by` / `rect.vertical-line` inside its inline svg; with the
          file-referenced logo we clip equivalent bands of whole-image copies. */}
      <div className="il-wordmark relative">
        <img
          src={asset("/icons/bia-logo.svg")}
          alt="Build in Amsterdam, powered by Front Row"
          className="il-bia block w-full"
        />
        <img
          src={asset("/icons/bia-logo.svg")}
          alt=""
          aria-hidden="true"
          className="il-line absolute inset-0 block w-full"
        />
        <img
          src={asset("/icons/bia-logo.svg")}
          alt=""
          aria-hidden="true"
          className="il-words absolute inset-0 block w-full"
        />
      </div>
    </div>
  );
}
