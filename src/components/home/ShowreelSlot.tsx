import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import DotLabel from "../shared/DotLabel";
import { asset } from "@/utils/assetPath";

/**
 * ShowreelSlot — the left (video) half + its showreel interactions.
 *
 * Recovered media: the original's PUBLIC Mux stream, downloaded as the 1080p rendition to
 * /videos/showreel.mp4 (project guide §6.7 — all assets local; stream-copied with ffmpeg,
 * no re-encode). Same playback behavior as live (rendered-DOM video tag: muted, loop,
 * playsinline, NO poster; playback started via JS; object-fit cover from CSS).
 *
 * Verified showreel interactions (live re-inspection, 2026-06-11):
 *  1. CURSOR LABEL — a fixed, full-viewport layer (`mix-blend-mode: exclusion`,
 *     `pointer-events:none`, high z) carries a "Play showreel" label that translates to the
 *     exact pointer position every frame. It is `opacity:1` only while the pointer is over the
 *     video panel and `opacity:0` over the content panel. Text: NHaasGroteskTXPro 11px /
 *     line-height 13.2px, white, `white-space:nowrap`.
 *  2. CLICK → FULLSCREEN — clicking the video panel expands the SAME video to cover the
 *     viewport (`object-fit:cover`) and UNMUTES it (sound on); it keeps playing from where it
 *     was. Bottom-left controls appear: "Close" and "Mute" — a flex row, `gap:32px`, padding
 *     `0 0 48px 48px`, white 16px NeueHaasGrotesk-Roman. "Mute" toggles the audio and its label
 *     to "Unmute". "Close" exits fullscreen, restores the split, and re-mutes the background.
 *
 * Labels are the CMS values (verified in __NEXT_DATA__): hero_label_video_play/close/mute/unmute.
 */
const SHOWREEL_SRC = asset("/videos/showreel.mp4");

const LABEL_PLAY = "Play showreel";
const LABEL_CLOSE = "Close";
const LABEL_MUTE = "Mute";
const LABEL_UNMUTE = "Unmute";

interface ShowreelSlotProps {
  /** Notifies the app when the showreel enters/exits fullscreen (used to hide the MenuButton). */
  onFullscreenChange?: (fullscreen: boolean) => void;
  /** VISUAL fullscreen signal (drives the SplitCanvas white-bg position): on open it flips
   *  with the logical state, but on CLOSE it stays true until the t≈0.75s triple snap of the
   *  GSAP close timeline (live-verified — the white bg snaps at ≈750ms, not at t0). */
  onVisualChange?: (visual: boolean) => void;
  /** While the nav is open, clicking the showreel CLOSES the nav instead of going fullscreen
   *  (verified live: menu open + click on the video area → menu closes, no fullscreen). */
  navOpen?: boolean;
  onCloseNav?: () => void;
}

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Ease of the live fullscreen open/close choreography — measured via getAnimations() on the
 *  original (Web Animations API, 2026-06-12). */
const CLOSE_EASE = "cubic-bezier(0.42, 0, 0.21, 1)";

export default function ShowreelSlot({
  onFullscreenChange,
  onVisualChange,
  navOpen = false,
  onCloseNav,
}: ShowreelSlotProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  // True while the GSAP close timeline runs: the stage + white bg HOLD the fullscreen
  // position (live-verified) until the t≈0.75s triple snap flips this back to false.
  const [closing, setClosing] = useState(false);
  const [muted, setMuted] = useState(true); // mirrors video.muted for the fullscreen control label
  const [overVideo, setOverVideo] = useState(false);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const stageRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  // Active Web-Animations of each choreography — cross-cancelled between open/close and on
  // unmount (cancel() never touches el.style, so elements fall back to the React underlying).
  const closeAnims = useRef<Animation[]>([]);
  const openAnims = useRef<Animation[]>([]);

  // Surface fullscreen state to the app (MenuButton hides while the showreel is fullscreen).
  useEffect(() => {
    onFullscreenChange?.(fullscreen);
  }, [fullscreen, onFullscreenChange]);

  // Visual signal (white-bg position): true through open AND the close hold; false at the snap.
  useEffect(() => {
    onVisualChange?.(fullscreen || closing);
  }, [fullscreen, closing, onVisualChange]);

  // Cancel pending animations on unmount.
  useEffect(() => {
    return () => {
      closeAnims.current.forEach((a) => a.cancel());
      openAnims.current.forEach((a) => a.cancel());
    };
  }, []);

  // Controls fade-IN on open (live WAAPI: opacity 0→1, 500ms, choreography bezier). Runs
  // after mount — the controls do not exist yet during openFullscreen's own task.
  useEffect(() => {
    if (!fullscreen || prefersReducedMotion || !controlsRef.current) return;
    const a = controlsRef.current.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 500,
      easing: CLOSE_EASE,
      fill: "both",
    });
    openAnims.current.push(a);
    a.finished.then(
      () => a.cancel(), // underlying opacity is the natural 1 — zero visual change
      () => {},
    );
  }, [fullscreen]);

  // Start playback via JS like the live original (the autoPlay attribute alone can be
  // ignored under some autoplay policies).
  useEffect(() => {
    videoRef.current?.play?.().catch(() => {});
  }, []);

  // Cursor-follow position (the label rides the pointer every frame — no CSS lag, like the original).
  useEffect(() => {
    const onMove = (e: PointerEvent) =>
      setCursor({ x: e.clientX, y: e.clientY });
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const openFullscreen = useCallback(() => {
    // With the nav open, the click acts as "Close" for the menu (verified live) —
    // the showreel must NOT go fullscreen.
    if (navOpen) {
      onCloseNav?.();
      return;
    }
    // Cross-cancel both choreographies (reopen mid-close / double open): cancel() drops the
    // animation effects WITHOUT touching el.style, so every element falls back to its
    // underlying React-rendered state in the same task — no manual prop cleanup needed.
    closeAnims.current.forEach((a) => a.cancel());
    closeAnims.current = [];
    openAnims.current.forEach((a) => a.cancel());
    openAnims.current = [];
    setClosing(false);
    // OPEN choreography (approved live timeline 2026-06-13, WAAPI): all tracks born at t0,
    // 500ms stage/bg + 300ms column drift, choreography bezier, fill:"both". The underlying
    // React state committed below IS the fullscreen end pose, so when the fills are dropped
    // at finish nothing changes visually. The column's opacity fade-out is CSS (~150ms via
    // the Hero fsHidden class) — the original's own mechanism for it, NOT WAAPI.
    const col = document.querySelector<HTMLElement>("[data-fs-column]");
    const bg = document.querySelector<HTMLElement>("[data-fs-whitebg]");
    const stage = stageRef.current;
    if (!prefersReducedMotion && col && bg && stage) {
      const anims = [
        stage.animate(
          [{ transform: "translateX(-25%)" }, { transform: "translateX(0%)" }],
          { duration: 500, easing: CLOSE_EASE, fill: "both" },
        ),
        bg.animate(
          [{ transform: "translateX(0%)" }, { transform: "translateX(100%)" }],
          { duration: 500, easing: CLOSE_EASE, fill: "both" },
        ),
        col.animate(
          [{ transform: "translateX(0%)" }, { transform: "translateX(20%)" }],
          { duration: 300, easing: CLOSE_EASE, fill: "both" },
        ),
      ];
      openAnims.current = anims;
      Promise.all(anims.map((a) => a.finished)).then(
        () => {
          anims.forEach((a) => a.cancel());
          if (openAnims.current === anims) openAnims.current = [];
        },
        () => {
          /* cancelled (close-mid-open / double open) */
        },
      );
    }
    const v = videoRef.current;
    if (v) {
      v.muted = false;
      v.play?.().catch(() => {});
    }
    setMuted(false);
    setOverVideo(false);
    setFullscreen(true);
  }, [navOpen, onCloseNav]);

  // CLOSE choreography — Web Animations API, the live original's literal engine (verified
  // via getAnimations() 2026-06-12; reviewer-approved timeline). t0 = Close click, all eases
  // CLOSE_EASE cubic-bezier(0.42,0,0.21,1):
  //   stage      transform   0% → −25%   700ms          (video pushed to the left half)
  //   white bg   transform 100% →   0%   700ms          (slides right-edge → middle, in sync)
  //   controls   opacity     1  →   0    300ms
  //   column     transform +20% →   0    650ms delay 50 (phrases drift left — never a snap)
  //   column     opacity     0  →   1    400ms delay 350
  // fill:"both" covers the delays (the column paints displaced+invisible from frame one) and
  // holds the end values until the React state flip at the end masks the bookkeeping.
  const closeFullscreen = useCallback(() => {
    const v = videoRef.current;
    if (v) v.muted = true;
    setMuted(true);
    const col = document.querySelector<HTMLElement>("[data-fs-column]");
    const bg = document.querySelector<HTMLElement>("[data-fs-whitebg]");
    const stage = stageRef.current;
    closeAnims.current.forEach((a) => a.cancel());
    closeAnims.current = [];
    // Cross-cancel a running OPEN (close-mid-open): elements fall back to the fullscreen
    // underlying pose and the close tweens below play from there.
    openAnims.current.forEach((a) => a.cancel());
    openAnims.current = [];
    if (!prefersReducedMotion && col && bg && stage) {
      const anims: Animation[] = [
        stage.animate(
          [{ transform: "translateX(0%)" }, { transform: "translateX(-25%)" }],
          { duration: 700, easing: CLOSE_EASE, fill: "both" },
        ),
        bg.animate(
          [{ transform: "translateX(100%)" }, { transform: "translateX(0%)" }],
          { duration: 700, easing: CLOSE_EASE, fill: "both" },
        ),
        col.animate(
          [{ transform: "translateX(20%)" }, { transform: "translateX(0%)" }],
          { duration: 650, delay: 50, easing: CLOSE_EASE, fill: "both" },
        ),
        col.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 400,
          delay: 350,
          easing: CLOSE_EASE,
          fill: "both",
        }),
      ];
      if (controlsRef.current) {
        anims.push(
          controlsRef.current.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: 300,
            easing: CLOSE_EASE,
            fill: "both",
          }),
        );
      }
      closeAnims.current = anims;
      setClosing(true);
      // End bookkeeping (last fill ends at 750ms): flip the underlying React state to the
      // final values IN THE SAME TASK, then drop the fills — zero visual change. flushSync
      // keeps the stage (local `closing`) and the white bg (App visual state) in one commit.
      Promise.all(anims.map((a) => a.finished)).then(
        () => {
          flushSync(() => {
            setClosing(false);
            onVisualChange?.(false);
          });
          anims.forEach((a) => a.cancel());
          closeAnims.current = [];
        },
        () => {
          /* cancelled (reopen mid-close) — openFullscreen restores the state */
        },
      );
    }
    setFullscreen(false);
  }, [onVisualChange]);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }, []);

  return (
    <div className="absolute inset-0 bg-black">
      {/* Video stage — copied from the live structure (its sticky cell `eVBLXd`): the video is
          ALWAYS viewport-sized (100vw×100vh, object-cover) and the stage rests at
          `translateX(-25vw)` (showing the video's central band in the left half; the white
          panel paints over the right overhang). Fullscreen = the stage slides to 0 covering
          the viewport — `transition: transform 0.65s` house ease (frame-sampled live: −360px↔0
          @1440 over ≈0.65s). The video itself never resizes or remounts. */}
      {/* Width = 200% of the half-width section = the full PAGE width (clientWidth — like the
          live cell, so no scrollbar-gutter overflow), and translateX(-25%) of the element's own
          width = −25% of the page width (the live values verbatim: eVBLXd translateX(-25%)). */}
      <div
        ref={stageRef}
        className="absolute left-0 top-0 h-screen w-full transition-none desktop:w-[200%]"
        style={{
          // BOTH directions are WAAPI-driven (open 500ms / close 700ms, approved live
          // timelines). This inline value is only the UNDERLYING state the animations play
          // over — it must never transition on its own (the state flips are bookkeeping
          // masked by the animation fills; `transition-none` in className carries that).
          transform: `translateX(${fullscreen || closing ? "0%" : "-25%"})`,
        }}
      >
        <video
          ref={videoRef}
          src={SHOWREEL_SRC}
          muted
          loop
          playsInline
          autoPlay
          className="h-full w-full object-cover object-center"
        />
      </div>

      {/* Click target over the panel → open fullscreen; also drives the cursor-label visibility. */}
      {!fullscreen && (
        <button
          type="button"
          aria-label={LABEL_PLAY}
          onClick={openFullscreen}
          onPointerEnter={() => setOverVideo(true)}
          onPointerLeave={() => setOverVideo(false)}
          className="absolute inset-0 z-[1] block h-full w-full cursor-pointer"
        />
      )}

      {/* Cursor-following "Play showreel" label — fixed layer, mix-blend exclusion, follows
          pointer. PORTALED TO <body> like the original (its exclusion layer is a body-level
          sibling of the content): inside the App's nav-shift wrapper a `transform` would turn
          `fixed` into wrapper-relative positioning, and the off-edge label would stretch the
          page (horizontal scrollbar — verified defect when hovering near the right edge with
          the nav open). At body level it stays viewport-fixed and creates no overflow. */}
      {!fullscreen &&
        createPortal(
          <div
            className="pointer-events-none fixed inset-0 z-[50] mix-blend-exclusion"
            aria-hidden
          >
            <span
              className="absolute left-0 top-0 whitespace-nowrap font-ui text-[11px] font-medium uppercase leading-[13.2px] text-white"
              style={{
                // Sits 27.5px to the right of the cursor, top-aligned to it (verified live).
                transform: `translate3d(${cursor.x + 27.5}px, ${cursor.y}px, 0)`,
                opacity: overVideo ? 1 : 0,
                transition: "opacity 0.3s ease",
              }}
            >
              {LABEL_PLAY}
            </span>
          </div>,
          document.body,
        )}

      {/* Fullscreen controls — bottom-left: Close + Mute (gap 32px, padding 0 0 48 48).
          mix-blend-mode: exclusion (verified live) so the white labels invert against the video
          and stay legible over both light and dark frames. */}
      {/* Mounted through the close timeline so the GSAP fade-out (0.36s, live-verified) can
          play before the unmount at the t≈0.75s snap. */}
      {(fullscreen || closing) && (
        <div
          ref={controlsRef}
          className="fixed bottom-0 left-0 z-[70] flex flex-row gap-[32px] pb-[48px] pl-[48px] mix-blend-exclusion"
        >
          <button
            type="button"
            onClick={closeFullscreen}
            className="group font-ui text-[11px] font-medium uppercase leading-[13.2px] text-white"
          >
            <DotLabel label={LABEL_CLOSE} dotColor="#FFFFFF" />
          </button>
          <button
            type="button"
            onClick={toggleMute}
            className="group font-ui text-[11px] font-medium uppercase leading-[13.2px] text-white"
          >
            <DotLabel
              label={muted ? LABEL_UNMUTE : LABEL_MUTE}
              dotColor="#FFFFFF"
            />
          </button>
        </div>
      )}
    </div>
  );
}
