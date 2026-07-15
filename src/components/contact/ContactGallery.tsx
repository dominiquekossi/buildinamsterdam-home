import { useLayoutEffect, useRef } from "react";

/**
 * ContactGallery — the left (order-1) gallery of /contact: two vertical image tracks driven by a
 * single S that responds to BOTH user input (wheel/touch) and a TIME auto-pan — exactly like /cases.
 *
 * Engine = the SAME model as /cases (useCasesScroll): per-column `translateY = −S·(R_col/R_max)`,
 * clamp at S = R_max so both tracks reach their bottom-aligned end SIMULTANEOUSLY (lockstep), all
 * ranges measured at RUNTIME (never hardcoded). TWO writers into one `target`: (1) wheel/touch — raw
 * 1:1, NO lerp/inertia (the page doesn't scroll natively, so we `preventDefault` and drive S
 * ourselves), and (2) the TIME auto-pan (advances DOWN only, SUSPENDED while input is recent, resumes
 * after an idle HOLD). The useCasesScroll hook is NOT imported (it is coupled to /cases' `filterOpen`
 * branch); its full two-input pattern is replicated INLINE here, keeping /contact's measured constants.
 *
 * Verified live numbers (buildId _MsCuqDt4GbkeAFMyjWlP):
 * - Master velocity on the dominant (R_max) track ≈ 18.5 px/s, WIDTH-INVARIANT (18.43@1440,
 *   18.7@1024). Track B = vA·(R_B/R_A) → finishes with A. Duration scales with range (~38s@1440,
 *   ~13s@1024). [NB: this ~18.5 px/s is the REAL auto-pan speed — confirmed frame-0 @60fps +
 *   plateau — NOT the throttled-sample artifact useCasesScroll's comment warns about for /cases.]
 * - LINEAR cruise (constant velocity) + hard clamp at the end (no bounce), matching the /cases
 *   engine's constant-velocity glide. START-UP RAMP: the live ramps VELOCITY linearly 0→cruise over
 *   ~375ms (constant acceleration) before the cruise — measured frame-0 @60fps (ramp ≈350–400ms; the
 *   real shape is a mild ease-in, OFF the house set, so linear acceleration is used, no named curve).
 *   Modelled by integrating v in the rAF (S = ∫v·dt), NOT an eased tween of S. See _gallery-mechanism.md.
 * - ENTRANCE (outer wrapper layer, SEPARATE from the pan): each column slides translateY ±50→0
 *   (A +50, B −50) + opacity 0→1, simultaneous & mirrored, over ~1.6s easing cubic-bezier(0.42,0,0.21,1)
 *   (RMS-confirmed; NOT 0.45,0.02,0.09,0.98). ±50px FIXED (width-invariant). Then a ~2.6s real hold.
 * - PAN starts ~4.2s after mount (live frame-0: 4195.8ms = entrance ~1.6s + real hold ~2.6s).
 * - reduced-motion → entrance AND pan SKIPPED; columns rest at translateY 0 / opacity 1, static
 *   (live reads matchMedia and snaps to the settled state).
 * - Drivers: entrance = WAAPI on the wrapper (the CaseCard/FilterTrigger pattern; visually == live's rAF);
 *   pan = rAF/JS on the track. TWO nested transform layers (wrapper entrance ∘ track pan). Cleaned on unmount.
 *
 * Geometry: 2 tracks, 34px gap (between tracks AND vertically between images); each track = 3
 * images stacked, NO duplication (it is not a loop). Track A boxes 2:3 (pb-150%), Track B boxes
 * ≈141.17% — the asymmetric ranges that produce the lockstep speed difference. Images served via
 * the home pipeline (local /images/*.webp from Storyblok `/m/<w>x<h>/filters:format(webp):quality(82)`).
 */
const PAN_PX_PER_SEC = 18.5; // master rate on the R_max track (live ≈18.4–18.7, width-invariant)
const RAMP_MS = 375; // start-up ramp: velocity rises LINEARLY 0→cruise over ~375ms (constant
// acceleration). Live-measured ramp ≈350–400ms; the real curve is a mild ease-in OFF the house set
// (no house curve fits — RMS over S_norm: linear 0.129 < others), so linear acceleration is used —
// no named/house curve, per reviewer. We integrate v in the rAF (S = ∫v·dt), not an eased S tween.
const HOLD_MS = 4200; // pan starts ~4.2s after mount (live frame-0: 4195.8ms) = entrance ~1.6s + real hold ~2.6s

// ENTRANCE (outer wrapper layer, separate from the pan): each column slides translateY ±50→0 +
// opacity 0→1, simultaneous & mirrored (A +50, B −50), over ENTER_MS, easing the RMS-confirmed
// house curve cubic-bezier(0.42,0,0.21,1) (NOT 0.45,0.02,0.09,0.98). Offset FIXED px (width-invariant).
const ENTER_OFFSET_PX = 50;
const ENTER_MS = 1600;
const ENTER_EASE = "cubic-bezier(0.42, 0, 0.21, 1)";

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const TRACK_A = [
  { src: "/images/contact-office-1.webp", alt: "Office 1" },
  { src: "/images/contact-simon.webp", alt: "Simon on the couch" },
  { src: "/images/contact-office-3.webp", alt: "Office 3" },
];
const TRACK_B = [
  { src: "/images/contact-office-2.webp", alt: "Office 2" },
  { src: "/images/contact-kitchen.webp", alt: "Kitchen view and a chair" },
  { src: "/images/contact-stacia.webp", alt: "Stacia in the office" },
];

export default function ContactGallery() {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = rootRef.current;
    if (!container) return;
    const wrappers = Array.from(container.children) as HTMLElement[];
    if (wrappers.length === 0) return;
    const tracks = wrappers.map((w) => w.firstElementChild as HTMLElement); // inner PAN layer

    // PAN range per track = contentHeight − viewport, measured at RUNTIME (like useCasesScroll).
    let ranges: number[] = [];
    let rMax = 1;
    const measure = () => {
      ranges = tracks.map((c) => Math.max(0, c.scrollHeight - window.innerHeight));
      rMax = Math.max(1, ...ranges);
    };
    const apply = (S: number) => {
      for (let i = 0; i < tracks.length; i++) {
        const ty = -S * (ranges[i] / rMax);
        tracks[i].style.transform = `translateY(${ty}px) translateZ(0px)`;
      }
    };
    measure();
    apply(0);

    // ENTRANCE (outer wrapper layer — SEPARATE from the pan): each column enters translateY ±50→0
    // + opacity 0→1 over ENTER_MS, easing cubic-bezier(0.42,0,0.21,1) (RMS-confirmed), A & B
    // simultaneous + mirrored (A +50, B −50). WAAPI (the CaseCard/FilterTrigger pattern); fill:both
    // holds the settled 0 / opacity-1 end state. reduced-motion → SKIP the entrance: wrappers rest at
    // their default (translateY 0 / opacity 1; the JSX has no initial offset), visible & static.
    const enterAnims = prefersReducedMotion
      ? []
      : wrappers.map((w, i) =>
          w.animate(
            [
              { transform: `translateY(${i === 0 ? ENTER_OFFSET_PX : -ENTER_OFFSET_PX}px)`, opacity: 0 },
              { transform: "translateY(0px)", opacity: 1 },
            ],
            { duration: ENTER_MS, easing: ENTER_EASE, fill: "both" as const },
          ),
        );

    // PAN — a single S driven by TWO writers into one `target` (the /cases useCasesScroll model,
    // replicated inline): (1) USER INPUT (wheel/touch) — raw 1:1, NO lerp/inertia; (2) TIME auto-pan —
    // advances DOWN only, gated to run ONLY when idle (no input within HOLD_MS). S tracks clamp(target)
    // each frame; per-track translateY = −S·(range_i/rMax) keeps A & B in lockstep (unchanged).
    // lastInputT starts at mount → the first auto-pan begins HOLD_MS after load (entrance ~1.6s has
    // settled by then) — same initial behaviour as before. autoStartT (null = suspended) re-ramps
    // 0→cruise over RAMP_MS from the CURRENT S on start AND on every resume after input (no catch-up).
    let S = 0;
    let target = 0;
    let raf = 0;
    let lastInputT = performance.now();
    let autoStartT: number | null = null;
    let lastFrameT = performance.now();
    const markInput = () => { lastInputT = performance.now(); };

    const frame = () => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastFrameT) / 1000); // clamp dt so a stalled tab can't jump
      lastFrameT = now;
      if (!prefersReducedMotion && now - lastInputT >= HOLD_MS) {
        // Idle ≥ HOLD_MS → auto-pan DOWN, re-ramping 0→cruise from this resume's start (autoStartT).
        if (autoStartT === null) autoStartT = now;
        const rampElapsed = now - autoStartT;
        const v = rampElapsed >= RAMP_MS ? PAN_PX_PER_SEC : PAN_PX_PER_SEC * (rampElapsed / RAMP_MS);
        target = Math.min(rMax, target + v * dt); // advance from CURRENT S; clamp at R_max (no reverse)
      } else {
        // Recent input (or reduced-motion) → no auto; reset the ramp so the next resume starts at rest.
        autoStartT = null;
      }
      const next = clamp(target, 0, rMax);
      if (next !== S) { S = next; apply(S); }
      raf = requestAnimationFrame(frame); // runs continuously — the user may scroll up again after clamp
    };

    // USER INPUT — wheel + touch write `target` raw 1:1 (mirrors useCasesScroll). deltaY in px, NOT
    // normalized (paridade com /cases). preventDefault blocks any native page scroll. touchstart only
    // records the start Y + marks input; touchmove integrates the drag delta. markInput() suspends the
    // auto-pan for HOLD_MS and (via the else branch) resets the ramp so the resume re-ramps from rest.
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
      apply(S);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("resize", onResize);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      enterAnims.forEach((a) => a.cancel());
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("resize", onResize);
      wrappers.forEach((w) => { w.style.transform = ""; w.style.opacity = ""; });
      tracks.forEach((c) => (c.style.transform = ""));
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="grid h-full w-full items-start [gap:34px] [grid-template-columns:repeat(2,calc(50%_-_17px))]"
    >
      {/* Column A: ENTRANCE wrapper (translateY +50→0 + opacity, WAAPI) → PAN track (rAF). */}
      <div className="will-change-[transform,opacity]">
        {/* Track A (left) — boxes 2:3 (pb-150%); range larger → it is R_max (master, ~18.5 px/s). */}
        <div className="flex flex-col [gap:34px] will-change-transform">
          {TRACK_A.map((img) => (
            <div key={img.src} className="relative w-full overflow-hidden bg-off-white pb-[150%]">
              <img src={img.src} alt={img.alt} loading="eager" className="absolute inset-0 h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </div>
      {/* Column B: ENTRANCE wrapper (translateY −50→0 + opacity) → PAN track. */}
      <div className="will-change-[transform,opacity]">
        {/* Track B (right) — boxes ≈141.17% (shorter → smaller range → slaved slower, finishes with A). */}
        <div className="flex flex-col [gap:34px] will-change-transform">
          {TRACK_B.map((img) => (
            <div key={img.src} className="relative w-full overflow-hidden bg-off-white pb-[141.17%]">
              <img src={img.src} alt={img.alt} loading="eager" className="absolute inset-0 h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
