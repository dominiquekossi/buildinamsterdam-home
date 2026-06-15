import { useLayoutEffect, useRef } from "react";

/**
 * ContactGallery — the left (order-1) gallery of /contact: two vertical image tracks that
 * auto-PAN once from top to bottom-aligned, then STOP (verified live, _gallery-mechanism.md).
 *
 * Engine = the SAME model as /cases (useCasesScroll): per-column `translateY = −S·(R_col/R_max)`,
 * clamp at S = R_max so both tracks reach their bottom-aligned end SIMULTANEOUSLY (lockstep), all
 * ranges measured at RUNTIME (never hardcoded). The DIFFERENCE: /cases drives S by wheel/touch;
 * here there is NO input — S auto-advances by TIME. So the hook is NOT reused (its wheel/touch
 * listeners would wrongly hijack scrolling on a non-scrolling page); its pattern is replicated
 * inline, time-driven, per the project guide ("replique o padrão se inline").
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

    // reduced-motion: skip BOTH entrance and pan — columns rest at translateY 0 / opacity 1
    // (wrappers keep their default), static. Matches live (it snaps to the settled state).
    if (prefersReducedMotion) {
      const onResizeRM = () => { measure(); apply(0); };
      window.addEventListener("resize", onResizeRM);
      return () => {
        window.removeEventListener("resize", onResizeRM);
        tracks.forEach((c) => (c.style.transform = ""));
      };
    }

    // ENTRANCE (outer wrapper layer — SEPARATE from the pan): each column enters translateY ±50→0
    // + opacity 0→1 over ENTER_MS, easing cubic-bezier(0.42,0,0.21,1) (RMS-confirmed), from t=0,
    // A & B simultaneous + mirrored (A +50, B −50). WAAPI (the CaseCard/FilterTrigger pattern) —
    // visually equivalent to the live's rAF; fill:both holds the settled 0 / opacity-1 end state.
    const enterOpts = { duration: ENTER_MS, easing: ENTER_EASE, fill: "both" as const };
    const enterAnims = wrappers.map((w, i) =>
      w.animate(
        [
          { transform: `translateY(${i === 0 ? ENTER_OFFSET_PX : -ENTER_OFFSET_PX}px)`, opacity: 0 },
          { transform: "translateY(0px)", opacity: 1 },
        ],
        enterOpts,
      ),
    );

    let S = 0;
    let raf = 0;
    let startT = 0;
    let last = 0;
    let motionMs = 0; // elapsed motion time since the pan began — drives the velocity ramp
    const frame = (t: number) => {
      if (!startT) startT = t;
      if (t - startT < HOLD_MS) { raf = requestAnimationFrame(frame); return; } // hold at top
      if (!last) last = t;
      const dt = Math.min(0.05, (t - last) / 1000); // clamp dt so a stalled tab can't jump
      last = t;
      // Start-up ramp: velocity rises LINEARLY 0→cruise over RAMP_MS (constant acceleration,
      // live-measured ~350–400ms), then saturates at cruise. S = ∫v·dt → S grows quadratically
      // during the ramp, linearly after — NOT an eased tween of S, and no named/house curve.
      // The ramp acts on the MASTER S, so A & B share it and stay in lockstep automatically.
      motionMs += dt * 1000;
      const v = motionMs < RAMP_MS ? PAN_PX_PER_SEC * (motionMs / RAMP_MS) : PAN_PX_PER_SEC;
      S = Math.min(rMax, S + v * dt); // integrate velocity; clamp at R_max (settle)
      apply(S);
      if (S < rMax) raf = requestAnimationFrame(frame); // stop once clamped at the end (settles)
    };
    raf = requestAnimationFrame(frame);

    const onResize = () => { measure(); apply(Math.min(S, rMax)); };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      enterAnims.forEach((a) => a.cancel());
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
