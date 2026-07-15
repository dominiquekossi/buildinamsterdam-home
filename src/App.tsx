import { useCallback, useEffect, useState } from "react";
import SplitCanvas from "./components/home/SplitCanvas";
import Hero from "./components/home/Hero";
import ShowreelSlot from "./components/home/ShowreelSlot";
import HeaderLogo from "./components/layout/HeaderLogo";
import MenuButton from "./components/layout/MenuButton";
import NavOverlay from "./components/layout/NavOverlay";
import IntroLoader from "./components/home/IntroLoader";
import CasesPage from "./components/cases/CasesPage";
import ContactPage from "./components/contact/ContactPage";

/**
 * HomePage — the homepage composition.
 *
 * Build order (CLAUDE.md → Approved reconstruction workflow):
 * SplitCanvas → HeaderLogo → MenuButton → NavOverlay → Hero → IntroLoader → HeroReveal.
 *
 * - Nav (S4): opening slides the content wrapper up by `max(450px,50vh)` (0.65s house ease),
 *   revealing the fixed NavOverlay behind it; MenuButton stays fixed at the bottom.
 * - IntroLoader (S6): black loader over everything on load; hands off to the hero.
 * - HeroReveal (S7): `heroRevealed` cues the hero content choreography.
 */
const NAV_EASE = "cubic-bezier(0.45, 0.02, 0.09, 0.98)";
// Verified live: the content shifts 1px LESS than the nav panel height (panel − 1px), and the
// panel height steps at min-width:1280px — <1280: 400px FIXED (shift 399, measured @1024×768);
// ≥1280: max(450px, 50vh) (shift 449 @900). The --nav-shift var below carries both regimes.

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function HomePage() {
  const [navOpen, setNavOpen] = useState(false);
  // When reduced-motion is requested, skip the loader and reveal the hero immediately.
  const [introComplete, setIntroComplete] = useState(prefersReducedMotion);
  const [heroRevealed, setHeroRevealed] = useState(prefersReducedMotion);
  // Showreel fullscreen — hides the MenuButton while the showreel plays full-screen (verified
  // live: the menu button slides down out of view when the showreel opens).
  const [showreelFullscreen, setShowreelFullscreen] = useState(false);
  // VISUAL fullscreen (white-bg/stage position): equals the logical state on open, but on
  // CLOSE it stays true until the GSAP close timeline's t≈0.75s triple snap (live-verified:
  // the white bg snaps back at ≈750ms after Close, not at t0 — see ShowreelSlot).
  const [showreelVisual, setShowreelVisual] = useState(false);

  // Stable identities so IntroLoader's effect does NOT re-run (and rebuild its timeline /
  // restart the intro) when these state flips trigger an App re-render. Root cause of the
  // audited restart defect was passing fresh inline arrows here every render.
  const handleReveal = useCallback(() => setHeroRevealed(true), []);
  const handleIntroComplete = useCallback(() => setIntroComplete(true), []);
  const toggleNav = useCallback(() => setNavOpen((o) => !o), []);
  const closeNav = useCallback(() => setNavOpen(false), []);

  // Lock page (y) scrolling while the nav is open — copied from live: the original sets
  // `body { overflow: hidden }` when the menu opens (html stays visible), so short viewports
  // can't scroll the shifted content while navigating.
  useEffect(() => {
    document.body.style.overflow = navOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [navOpen]);

  return (
    <>
      <NavOverlay open={navOpen} />
      {/* Content wrapper: shifts up to reveal the nav. HeaderLogo rides up with it;
          MenuButton is OUTSIDE the wrapper so it stays fixed at the bottom (verified). */}
      <div
        className="relative z-10 [--nav-shift:399px] min-[1280px]:[--nav-shift:calc(max(450px,50vh)-1px)]"
        style={{
          transform: navOpen
            ? "translateY(calc(-1 * var(--nav-shift)))"
            : "none",
          transition: prefersReducedMotion
            ? "none"
            : `transform 0.65s ${NAV_EASE}`,
        }}
        // While the nav is open the shifted home is a click-to-close backdrop (live renames
        // #main → #menu-close-backdrop while open; clicking it closes the menu).
        onClick={navOpen ? closeNav : undefined}
      >
        <SplitCanvas
          videoSlot={
            <ShowreelSlot
              onFullscreenChange={setShowreelFullscreen}
              onVisualChange={setShowreelVisual}
              navOpen={navOpen}
              onCloseNav={closeNav}
            />
          }
          contentSlot={
            <Hero revealed={heroRevealed} fsHidden={showreelFullscreen} />
          }
          videoFullscreen={showreelVisual}
        />
        <HeaderLogo />
      </div>
      <MenuButton
        isOpen={navOpen}
        onClick={toggleNav}
        revealed={heroRevealed}
        hidden={showreelFullscreen}
      />

      {!introComplete && (
        <IntroLoader onReveal={handleReveal} onComplete={handleIntroComplete} />
      )}
    </>
  );
}

/**
 * App — top-level route registration. No router library exists in this project (the home was
 * mounted directly), so routing is a minimal pathname switch: `/cases` renders the Work page,
 * `/contact` renders the Contact page, every other path renders the homepage (unchanged). Full
 * page loads only — no client-side navigation — so the path is stable for the component's lifetime.
 */
export default function App() {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, "");
  const raw =
    typeof window !== "undefined"
      ? window.location.pathname.replace(/\/+$/, "")
      : "";
  const path = raw.startsWith(base) ? raw.slice(base.length) : raw;
  if (path === "/cases") return <CasesPage />;
  if (path === "/contact") return <ContactPage />;
  return <HomePage />;
}
