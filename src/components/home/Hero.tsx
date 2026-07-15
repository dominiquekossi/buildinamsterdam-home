import { useEffect, useRef, useState } from "react";
import { asset } from "@/utils/assetPath";

/**
 * Hero — the right (white) panel content.
 *
 * Verified layout (Phase 3, docs/PHASE3_FINDINGS.md §3–§6 + live inspection):
 * - Container: flex column, justify-center, items-center, padding 100px 0 68px.
 *   The top-bar badge is absolutely positioned at top (y=30); the headline + lead + CTA
 *   group is vertically centered (group centre ≈ panel centre).
 * - Headline: NHaasGroteskDSPro 400, 6vw (= 86.4px @1440), line-height 0.85,
 *   letter-spacing -0.04em, uppercase, centered. 5 explicit lines, each in an
 *   overflow-hidden mask (ready for the Section 7 line-mask reveal).
 * - Lead: RecklessNeue-Book 24/28.8, -0.01em, width 375, centered, margin-top 43.
 * - CTAs: segmented pair (110px each, 1px black border, second shares left border),
 *   uppercase 11px, hover → black fill / white text (color transition 0.5s ease),
 *   margin-top 41, centered.
 *
 * Confidence flags: licensed fonts now present in public/fonts/ (typography no longer
 * provisional); CTA/topbar fluid scale above 1440 derived 2026-06-12 — s(vw) =
 * max(1, 0.7 + 0.3·vw/1440), exact at 1536/1600/1920; mobile headline size MEDIUM (approx clamp).
 */
const HEADLINE_LINES = [
  "We build",
  "brands &",
  "digital",
  "flagship",
  "stores",
];

// CTA anatomy DEEP re-measured 2026-06-13 (BUG 2 — buildId _MsCuqDt4GbkeAFMyjWlP, unchanged):
// the live's 6-column grid CELLS are 109px adjacent (pair 218, centered) — BUT the visible
// bordered <span> nested in each cell is 110px and HANGS 1px left of its cell, so the two
// borders overlap 1px at the divider and the VISIBLE pair is 219 (outer edges 969.98/1188.98
// @1440, 658/877 @1024) with a single shared 1px divider (button-1's right border; button-2
// runs border-left:0 + padding-left:1px). The 2026-06-12 "109 adjacent" note measured the
// CELLS and missed the 110px spans — that 1px (left edge + each width) was the CTA "jump".
// Replicated here: both boxes w-[110px] -ml-px — the border-box hangs 1px left while the −1
// margin keeps each margin-box 109, so flex still centers the 218 footprint (right edge +
// divider land on the live); the 2nd adds border-l-0 + pl-[1.2em] (the +1px left pad offsets
// the missing left border so its glyph stays centered = live inset 18.65; box-1 inset 23.76 =
// live 23.75). Paddings stay em-based as per the fluid-scale fix (same 34.2 outer height @1440).
// FLUID ABOVE 1440 (live-derived 2026-06-12, 4-point fit + exact prediction @1920): the
// topbar/CTA system scales by s(vw) = max(1, 0.7 + 0.3·vw/1440) — font-size
// max(11px, 7.7px + 0.22917vw) (=11 @≤1440, 11.22 @1536, 12.1 @1920); line-height and
// paddings ride along in em (live: 1em/1.2em/0.90909em inner pads; here −1px for the
// on-box border so the ≤1440 rendering is byte-identical to the verified snapshot).
// Width does NOT scale (live ~constant: 110 @≤1440, 109 above — 1px step, LOW confidence,
// kept at the verified 110). Lead (24/28.8), the 43 gap and the h2 formula stay fixed.
const CTA_BASE =
  "inline-block w-[110px] -ml-px border border-black px-[calc(1.2em-1px)] pb-[calc(0.90909em-1px)] pt-[calc(1em-1px)] text-center font-ui text-[max(11px,calc(7.7px+0.22917vw))] font-medium uppercase leading-[1.2] text-black transition-colors duration-500 ease-[ease] hover:bg-black hover:text-white";

interface HeroProps {
  /** Cue from the IntroLoader handoff; drives the HeroReveal choreography. */
  revealed?: boolean;
  /** Showreel fullscreen — hides the content (fade + slide right); on close it returns with
   *  the live-verified choreography (delay ≈0.43s, ≈0.4s fade/slide over the receding video). */
  fsHidden?: boolean;
}

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function Hero({ revealed = true, fsHidden = false }: HeroProps) {
  const root = useRef<HTMLDivElement>(null);

  // Showreel-close reveal chronology (frame-sampled live): while fullscreen, the headline
  // lines / top-bar / lead are `visibility: hidden`; on close they flip back in order:
  //   lines top-down at 396/463/546/612/696ms (≈75ms stagger, no transform — "writing"),
  //   top-bar ≈ line0+100ms (own flip, measured), lead ≈ line4+100ms (own flip, measured 741
  //   in a slower run ⇒ ≈800 normalized). The CTAs have NO gate on live (re-measured
  //   2026-06-12: visible+opacity:1 from the first close frame — they appear purely with the
  //   column fade, BEFORE the menu button lands ≈t1.1s); the old 870ms gate inverted the
  //   live menu↔CTA order and was removed per reviewer instruction.
  // At load (motion enabled) everything starts HIDDEN until the IntroLoader's reveal cue —
  // the live headline does NOT rise on load (transform stays 0, verified 2026-06-13); it
  // "writes" in via the same visibility staggers as the showreel close. CTAs are NEVER
  // visibility-gated on live (the column fade alone gates them).
  const [linesShown, setLinesShown] = useState<boolean[]>(() =>
    HEADLINE_LINES.map(() => prefersReducedMotion),
  );
  const [partsShown, setPartsShown] = useState({
    topbar: prefersReducedMotion,
    lead: prefersReducedMotion,
    cta: true,
  });

  // LOAD-entrance "writing" (live, anchored to E = home-entrance start: lines at
  // E+220/285/368/435/518 (≈70–85ms cadence), top-bar ≈E+320, lead ≈E+620; `revealed`
  // flips exactly at E via the IntroLoader schedule).
  useEffect(() => {
    if (!revealed) return;
    if (prefersReducedMotion) {
      setLinesShown(HEADLINE_LINES.map(() => true));
      setPartsShown({ topbar: true, lead: true, cta: true });
      return;
    }
    const lineTimes = [220, 285, 368, 435, 518];
    const ids = lineTimes.map((t, i) =>
      setTimeout(
        () =>
          setLinesShown((v) => {
            const n = [...v];
            n[i] = true;
            return n;
          }),
        t,
      ),
    );
    ids.push(
      setTimeout(() => setPartsShown((p) => ({ ...p, topbar: true })), 320),
      setTimeout(() => setPartsShown((p) => ({ ...p, lead: true })), 620),
    );
    return () => ids.forEach(clearTimeout);
  }, [revealed]);

  // Showreel-close staggers — must NOT run at mount (the load entrance above owns the first
  // reveal); only after a real fullscreen session (fsHidden true→false transition).
  const wasFsHidden = useRef(false);
  useEffect(() => {
    if (fsHidden) {
      wasFsHidden.current = true;
      setLinesShown(HEADLINE_LINES.map(() => false));
      setPartsShown({ topbar: false, lead: false, cta: false });
      return;
    }
    if (!wasFsHidden.current) return;
    wasFsHidden.current = false;
    const zero = prefersReducedMotion;
    const lineTimes = [396, 463, 546, 612, 696]; // live-measured per-line visibility flips
    const ids = lineTimes.map((t, i) =>
      setTimeout(
        () =>
          setLinesShown((v) => {
            const n = [...v];
            n[i] = true;
            return n;
          }),
        zero ? 0 : t,
      ),
    );
    ids.push(
      setTimeout(
        () => setPartsShown((p) => ({ ...p, topbar: true })),
        zero ? 0 : 500,
      ),
      setTimeout(
        () => setPartsShown((p) => ({ ...p, lead: true })),
        zero ? 0 : 800,
      ),
      setTimeout(() => setPartsShown((p) => ({ ...p, cta: true })), 0), // live: fade-only, no gate
    );
    return () => ids.forEach(clearTimeout);
  }, [fsHidden]);

  // (The former GSAP HeroReveal — line-mask yPercent rises + data-reveal fade-and-rise — was
  // REMOVED 2026-06-13: the live headline does not rise on load; the entrance is the column
  // choreography (motion/homeEntrance.ts) + the visibility "writing" above. The [data-line]
  // masks and [data-reveal] attributes remain — the live ships the same structure.)

  return (
    <div
      ref={root}
      // Showreel fullscreen choreography (live WAAPI timelines, 2026-06-13): the column is
      // the open/close animation target (data-fs-column, see ShowreelSlot). The class below
      // is the UNDERLYING fullscreen pose: opacity 0 + translateX(20%).
      // OPEN: opacity fades 1→0 via the 0.15s CSS transition in the class (the original's
      // own mechanism for this one — not WAAPI) while ShowreelSlot's WAAPI drifts the
      // transform 0→+20% over 300ms above the class value.
      // CLOSE: WAAPI drives transform +20%→0 (650ms d50) and opacity 0→1 (400ms d350).
      // Classes (not inline style) so React re-renders from the visibility staggers never
      // clobber the animations' computed values.
      data-fs-column
      className={`relative min-h-screen w-full${
        fsHidden
          ? " opacity-0 [transform:translateX(20%)] [transition:opacity_0.15s_cubic-bezier(0.42,0,0.21,1)]"
          : ""
      }`}
      data-revealed={revealed}
    >
      {/* Top bar badge — absolute, top-[30px] fixed, centered (out of the centered flow) */}
      {/* 10px/12px at 1024–1440; ABOVE 1440 it rides the same fluid scale as the CTAs
          (live-verified 2026-06-12: 10.2 @1536, 10.333 @1600, 11 @1920 = max(10px,
          7px + 0.20833vw), line-height 1.2em). The old "fixed everywhere" note only
          checked ≤1440 widths. */}
      <p
        data-reveal
        className="absolute left-1/2 top-[30px] -translate-x-1/2 whitespace-nowrap text-center font-ui text-[max(10px,calc(7px+0.20833vw))] font-medium uppercase leading-[1.2] text-black"
        style={{ visibility: partsShown.topbar ? "visible" : "hidden" }}
      >
        Certified shopify plus partner
      </p>

      {/* Centered content group — min 100vh; grows with content so short viewports scroll
          (verified live: flex column justify-center, padding 100px 0 68px, min-height 100vh) */}
      <div className="flex min-h-screen flex-col items-center justify-center pb-[68px] pt-[100px]">
        {/* Desktop size = max(80px, 6vw) — live-verified mechanism (multi-width curve: 80px
            @1024/@1200, 81.96px = 6vw @1366, 86.4px @1440 → 80px floor, crossover ≈1333px).
            Short/wide windows compress the type like the original (17-point live curve):
            @media (min-width:1280px) and (min-aspect-ratio:2/1) → 11.25vh flat (no 80px
            floor inside — 73.125px observed @1440×650; spacing stays fixed). */}
        <h2 className="text-center font-display text-[clamp(64px,16.5vw,80px)] font-normal uppercase leading-[0.85] tracking-[-0.04em] text-black desktop:text-[max(80px,6vw)] [@media(min-width:1280px)_and_(min-aspect-ratio:2/1)]:text-[11.25vh]">
          {HEADLINE_LINES.map((line, i) => (
            <span key={line} className="block overflow-hidden">
              <span
                data-line
                className="block"
                style={{ visibility: linesShown[i] ? "visible" : "hidden" }}
              >
                {line}
              </span>
            </span>
          ))}
        </h2>

        <div
          data-reveal
          className="mt-[43px] w-[300px] text-center desktop:w-[375px]"
          style={{ visibility: partsShown.lead ? "visible" : "hidden" }}
        >
          {/* Lead size steps at min-width:1280px (live-verified bisect: 22px/26.4 at
              1024–1279 → 24px/28.8 from 1280); tracking −0.01em is em-based and scales. */}
          <p className="font-serif-lead text-[18px] leading-[21.6px] tracking-[-0.01em] text-black desktop:text-[22px] desktop:leading-[26.4px] min-[1280px]:text-[24px] min-[1280px]:leading-[28.8px]">
            We shape the future of commerce by delivering cohesive &amp;
            captivating omnichannel experiences that connect to convert.
          </p>
        </div>

        <p
          data-reveal
          // 41px at ≤1440; above it scales with the same s(vw) law as the CTA font
          // (live: 41.82 @1536, 42.37 @1600, 45.1 @1920 = max(41px, 28.7px + 0.85417vw)).
          className="mt-[max(41px,calc(28.7px+0.85417vw))] flex justify-center"
          style={{ visibility: partsShown.cta ? "visible" : "hidden" }}
        >
          <a href={asset("/cases")} className={CTA_BASE}>
            Our work
          </a>
          <a
            href={asset("/contact")}
            className={`${CTA_BASE} border-l-0 pl-[1.2em]`}
          >
            Contact us
          </a>
        </p>
      </div>
    </div>
  );
}
