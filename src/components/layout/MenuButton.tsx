import { useEffect, useLayoutEffect, useRef, useState } from "react";
import MenuButtonGraphic from "@/assets/menu-button.svg?react";
import "./MenuButton.css";

/**
 * MenuButton — fixed terracotta circle straddling the split, with curved "Menu" text.
 *
 * SVGR refactor (guide §7.3): the graphic is a standalone file, src/assets/menu-button.svg,
 * imported as a React component — no inline SVG markup lives here. This wrapper only owns
 * the interaction STATE MACHINE (hover / press / open / exit sweep / idle attract loop) and
 * surfaces it as data-* attributes on the svg root; ALL visuals — poses, timing, colors —
 * live in MenuButton.css keyed off those attributes ([data-open="true"] etc.).
 *
 * Verified behavior (Phase 3 + live re-extraction 2026-06-11, Chrome DevTools):
 * - viewBox 0 0 90 90 rendered at 104px; disc = path r37 (#C38133 closed / #3C4CC7 open);
 *   curved label on path #circle (r44.5): RecklessNeue-Book 16px, letter-spacing −0.16px,
 *   font-feature-settings ss04/06/07/10/14; black "Menu" closed / WHITE "Close" open.
 * - Toggle: the label STRING swaps instantly (live renames #menu-open↔#menu-close and swaps
 *   the styled classes) while both the disc fill and the label fill crossfade over 0.5s ease
 *   (live computed `transition: …, fill 0.5s`); the new label inherits the outgoing colour
 *   and eases to its own. Open holds the rotor at 70° even without hover (live-verified).
 * - Rotor poses (REVIEWER: always top-down): hidden-top (0,20px,−20°,.85) → visible (70°,1)
 *   → exit-bottom (0,−20px,170°,.85) then invisible snap back to top. Tween 0.65s house ease.
 * - Hover pulse 1→1.05 (back-out ≈13% overshoot); press dips to 0.9375 (0.35s), release
 *   springs back through ≈1.064. Idle attract loop until first interaction (≈3.03s period).
 */
interface MenuButtonProps {
  onClick?: () => void;
  isOpen?: boolean;
  /** Reveal cue (IntroLoader handoff): triggers the entrance into the pointer state. */
  revealed?: boolean;
  /** Hide the button (slides down out of view) — used while the showreel is fullscreen. */
  hidden?: boolean;
  /** Optional curved-label override (e.g. the cases filter "Close"). When provided, the visible
   *  curved label shows this string and stays swung out. Omit → default Menu/Close behavior. */
  label?: string;
  /** Optional activation handler that REPLACES the default click (`onClick`, the nav toggle).
   *  Omit → the existing nav-toggle click behavior is unchanged. */
  onActivate?: () => void;
}

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function MenuButton({ onClick, isOpen = false, revealed = true, hidden = false, label, onActivate }: MenuButtonProps) {
  // Whether the pointer is over the circle (verified driver of the label visibility + pulse).
  const [hovered, setHovered] = useState(false);
  // Whether the button is held down (drives the press-dip of the click pulse).
  const [pressed, setPressed] = useState(false);
  // Exit phase: after hover-out the label sweeps DOWN to the bottom pose (70°→170°), then
  // snaps back (transition off, hidden behind the disc) to the top pose for the next entrance.
  const [exiting, setExiting] = useState(false);
  const exitTimer = useRef<ReturnType<typeof setTimeout>>();
  // Mid-exit re-entry snap (bug fix 2026-06-12): the pointer is over the button while the
  // committed base-pose frame waits on the double-rAF; cancelled if the pointer leaves first.
  const hoverIntent = useRef(false);
  const snapRafs = useRef<number[]>([]);
  // Root ref — used only to write the optional `label` override into the curved textPaths.
  const btnRef = useRef<HTMLButtonElement>(null);
  // Idle "attract" loop (frame-sampled live): until the FIRST pointer interaction the label
  // periodically plays a hover-in/out cycle — in (−20°→70°) ≈0.45s after reveal, out + snap
  // ≈3.03s later, repeating every ≈3.03s. Killed permanently by the first hover (or open).
  const [attractOut, setAttractOut] = useState(false);
  const [interacted, setInteracted] = useState(false);

  // The word is visible while hovering the circle / nav open / reduced motion — or during the
  // "in" phase of the idle attract loop. Otherwise it exits downward, then rests tucked above.
  const labelOut = (revealed && (hovered || isOpen || attractOut || prefersReducedMotion)) || label != null;
  const beginExit = () => {
    if (prefersReducedMotion) return;
    setExiting(true);
    clearTimeout(exitTimer.current);
    exitTimer.current = setTimeout(() => setExiting(false), 700); // after the 0.65s sweep
  };
  useEffect(
    () => () => {
      clearTimeout(exitTimer.current);
      snapRafs.current.forEach(cancelAnimationFrame);
    },
    [],
  );

  // Optional label override (additive; default path untouched): write the string into BOTH baked
  // curved textPaths so whichever one the existing CSS shows (Menu when closed / Close when open)
  // displays it. When `label` is omitted, restore the SVG's baked words — so behavior is identical.
  // React won't clobber this on re-render (its tracked vdom text is unchanged), and the SVG file
  // and CSS stay untouched.
  useLayoutEffect(() => {
    const root = btnRef.current;
    if (!root) return;
    const menuPath = root.querySelector(".mb-label--menu");
    const closePath = root.querySelector(".mb-label--close");
    if (menuPath) menuPath.textContent = label != null ? label : "Menu";
    if (closePath) closePath.textContent = label != null ? label : "Close";
  }, [label]);

  // Idle attract loop driver — alternates in/out every ≈3.03s (live-measured), first swing
  // ≈0.45s after the reveal; killed permanently by the first pointer interaction or open.
  useEffect(() => {
    if (!revealed || interacted || isOpen || prefersReducedMotion) return;
    let out = false;
    let interval: ReturnType<typeof setInterval>;
    const first = setTimeout(() => {
      out = true;
      setAttractOut(true);
      interval = setInterval(() => {
        out = !out;
        setAttractOut(out);
        if (!out) beginExit(); // swing out downward + invisible snap, like a real hover-out
      }, 3030);
    }, 450);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed, interacted, isOpen]);

  return (
    <div className="mb-wrap fixed bottom-[33px] left-1/2 z-40" data-hidden={hidden}>
      <button
        ref={btnRef}
        type="button"
        aria-label={label != null ? label : isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        onClick={onActivate ?? onClick}
        onPointerEnter={() => {
          // First real interaction kills the idle attract loop permanently (verified live).
          setInteracted(true);
          setAttractOut(false);
          hoverIntent.current = true;
          if (exiting) {
            // Re-entry while the exit sweep runs (or before its 700ms snap): the live ALWAYS
            // snaps the rotor to the hidden-top pose before the in-swing — the gesture is
            // top→down no matter where the cursor enters. Drop the exit NOW so one frame
            // commits at the tucked base pose (transition: none — the invisible snap), then
            // start the swing on the following frame. Without this, the in-swing transition
            // departed from the mid-exit angle (~158°) and rotated in REVERSE (the
            // "entering from below spins backwards" bug, fixed 2026-06-12).
            clearTimeout(exitTimer.current);
            setExiting(false);
            const r1 = requestAnimationFrame(() => {
              const r2 = requestAnimationFrame(() => {
                if (hoverIntent.current) setHovered(true);
              });
              snapRafs.current.push(r2);
            });
            snapRafs.current.push(r1);
          } else {
            setHovered(true);
          }
        }}
        onPointerLeave={() => {
          hoverIntent.current = false;
          setHovered(false);
          setPressed(false);
          if (!isOpen) beginExit();
        }}
        onPointerDown={() => {
          setInteracted(true);
          setPressed(true);
        }}
        onPointerUp={() => setPressed(false)}
        className="block"
      >
        <MenuButtonGraphic
          className="mb-svg"
          data-open={isOpen}
          data-label-out={labelOut}
          data-exiting={exiting}
          data-hovered={hovered}
          data-pressed={pressed}
        />
      </button>
    </div>
  );
}
