import { useCallback, useEffect, useState } from "react";
import HeaderLogo from "../layout/HeaderLogo";
import MenuButton from "../layout/MenuButton";
import NavOverlay from "../layout/NavOverlay";
import ContactGallery from "./ContactGallery";
import InfoLink from "./InfoLink";

/**
 * ContactPage — the /contact page shell (FRAME ONLY — Phase 2).
 *
 * Mirrors how the home (App.tsx) and /cases (CasesPage.tsx) compose the shell: NavOverlay
 * behind a content wrapper that slides up by `--nav-shift` on open (0.65s house ease),
 * HeaderLogo riding up INSIDE the wrapper, MenuButton fixed OUTSIDE it at the bottom.
 *
 * Differences from CasesPage, each traced to the live /contact frame-spec
 * (workspace/contact/_frame-spec.md) — NOT redesigns:
 *  - The page DOES NOT SCROLL: it is a single fixed-viewport screen. The live locks this on
 *    html+body (height:100vh + overflow:hidden). We scope that lock to THIS page via a mount
 *    effect (applied on mount, previous inline values restored on unmount). globals.css is
 *    shared with home/cases and is NOT touched.
 *  - Because the page never scrolls, the nav-open `body{overflow:hidden}` scroll-lock that
 *    CasesPage adds is unnecessary here (the page is already locked) and is intentionally
 *    omitted — re-adding it would fight the page lock on nav-close.
 *  - Body = a 2-column 50/50 grid (gap-0 → columns touch, like live). The INFO column is FIRST
 *    in the DOM with order:2 (renders right, sticky); the GALLERY is SECOND with order:1
 *    (renders left, static) — verified live: content is DOM-first, visually reversed via `order`.
 *
 * Real gallery + info content are dedicated later phases — here both columns are PLACEHOLDERS.
 */
const NAV_EASE = "cubic-bezier(0.45, 0.02, 0.09, 0.98)";

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// The five contact-info blocks share one structure (label + InfoLink); driven from data so the
// markup isn't copy-pasted (the live renders the same five from a single repeated component).
const CONTACT_INFO: { label: string; href: string; text: string }[] = [
  { label: "Start a project", href: "https://www.buildinamsterdam.com/contact-form", text: "Contact form" },
  { label: "Just Say ‘Hi’", href: "mailto:hello@buildinamsterdam.com", text: "hello@buildinamsterdam.com" },
  { label: "Join our team", href: "https://jobs.buildinamsterdam.com/", text: "jobs.buildinamsterdam.com" },
  { label: "Give us a call", href: "tel:+31 (0)20 223 00 66", text: "+31 (0)20 223 00 66" },
  { label: "Visit Us", href: "https://g.page/build-in-amsterdam", text: "Baarsjesweg 285-286 | 1058 AE Amsterdam" },
];

export default function ContactPage() {
  const [navOpen, setNavOpen] = useState(false);

  const toggleNav = useCallback(() => setNavOpen((o) => !o), []);
  const closeNav = useCallback(() => setNavOpen(false), []);

  // Page-scoped non-scroll lock (live: html+body { height:100vh; overflow:hidden }). Applied on
  // mount; the previous inline values are restored on unmount so home/cases scroll normally
  // again. Only inline styles are touched here — never globals.css (shared with other pages).
  useEffect(() => {
    const html = document.documentElement;
    const { body } = document;
    const prev = {
      htmlHeight: html.style.height,
      htmlOverflow: html.style.overflow,
      bodyHeight: body.style.height,
      bodyOverflow: body.style.overflow,
    };
    html.style.height = "100vh";
    html.style.overflow = "hidden";
    body.style.height = "100vh";
    body.style.overflow = "hidden";
    return () => {
      html.style.height = prev.htmlHeight;
      html.style.overflow = prev.htmlOverflow;
      body.style.height = prev.bodyHeight;
      body.style.overflow = prev.bodyOverflow;
    };
  }, []);

  return (
    <>
      <NavOverlay open={navOpen} />
      {/* Content wrapper: shifts up to reveal the nav (mirrors App.tsx / CasesPage). HeaderLogo
          rides up with it; MenuButton is OUTSIDE so it stays fixed at the bottom. */}
      <div
        className="relative z-10 [--nav-shift:399px] min-[1280px]:[--nav-shift:calc(max(450px,50vh)-1px)]"
        style={{
          transform: navOpen ? "translateY(calc(-1 * var(--nav-shift)))" : "none",
          transition: prefersReducedMotion ? "none" : `transform 0.65s ${NAV_EASE}`,
        }}
        // While the nav is open the shifted page is a click-to-close backdrop (mirrors App.tsx).
        onClick={navOpen ? closeNav : undefined}
      >
        {/* Frame root — full-viewport, full-bleed, no scroll (live: section relative,
            max-width:none, height 100vh). The viewport lock lives on html+body (effect above). */}
        <section className="relative h-screen w-full max-w-none">
          {/* 50/50 grid, gap-0 (columns touch, like live — computed column/row-gap = 0px). INFO
              is first in DOM (order-2 → right, sticky); GALLERY is second (order-1 → left,
              static). Do NOT reorder the JSX — the order is the contract. */}
          <div className="grid h-full w-full grid-cols-[1fr_1fr] gap-0">
            {/* INFO column — order-2 → right, sticky (inert: the page doesn't scroll, so it never
                moves). Block vertically centered via justify-center — the H1's y INTENTIONALLY
                varies by width (FOLLOW US wraps @1024 → taller block → H1 sits higher). padding-left
                = 9vw (top/right/bottom 0), like the live. The links are NOT body text — each is an
                InfoLink whose visible glyph is RecklessNeue-Book 19px (see InfoLink). NeueHaasGrotesk-Roman
                is irrelevant to /contact (no visible text uses it); the `leading-[normal]` here is now
                vestigial (label + links carry their own leading) and harmless. The 103.58 rhythm and the
                @1024 FOLLOW US wrap both emerge from the Reckless-19px link line (22.8) + gap-56 + flex-wrap.
                Both the labels and the links are FLUID >1440 via the same s(vw)=max(1,0.7+0.3·vw/1440) as
                the H1 (floors 16px / 19px), so the rhythm tracks the live across widths (103.58 ≤1440 → 107.78 @1920). */}
            <div className="order-2 sticky top-0 flex h-[100svh] flex-col justify-center pl-[9vw] leading-[normal]">
              {/* H1 — RecklessNeue-Book via font-serif-lead (same class the home lead uses; also
                  enables the ss04/06/07/10/14 stylistic sets). Fluid >1440 via the project's s(vw)
                  pattern: max(36px, 25.2px+0.75vw) = 36·max(1, 0.7+0.3·vw/1440); floor 36px ≤1440.
                  lh 1.6 + tracking -0.01em are em-based and scale with the size. */}
              <h1 className="mb-[60px] font-serif-lead text-[max(36px,calc(25.2px+0.75vw))] font-normal leading-[1.6] tracking-[-0.01em] text-black">
                Get in touch
              </h1>

              {/* Blocks 1–5 — flex column; the 56px gap PRODUCES the measured 103.58px label→label
                  rhythm (block 47.58 = label-line 19.2 + h2 mb 5.6 + InfoLink line 22.8; + 56 gap).
                  margin 5.6 + gap 56 are FIXED px; the label/link line-boxes scale >1440, so the
                  pitch grows 103.58 → 107.78 @1920, tracking the live. No manual per-block margins. */}
              <div className="flex flex-col gap-[56px]">
                {CONTACT_INFO.map((b) => (
                  <div key={b.label}>
                    <h2 className="mb-[5.6px] font-ui text-[max(16px,calc(11.2px+0.33333vw))] font-medium uppercase leading-[1.2] text-black">{b.label}</h2>
                    <InfoLink href={b.href}>{b.text}</InfoLink>
                  </div>
                ))}
              </div>

              {/* FOLLOW US (block 6) — separate from the 1–5 wrapper; mt-56 continues the rhythm
                  (Visit Us label → Follow us label = block 47.58 + 56 = 103.58). Socials: flex-wrap
                  + col-gap 48 / row-gap 16, NO separators; the @1024 reflow (IG/FB/Twitter on line 1,
                  LinkedIn on line 2) emerges naturally from the usable width (0.41·vw) — no media query. */}
              <h2 className="mb-[5.6px] mt-[56px] font-ui text-[max(16px,calc(11.2px+0.33333vw))] font-medium uppercase leading-[1.2] text-black">Follow us</h2>
              <ul className="flex flex-wrap gap-x-[48px] gap-y-[16px]">
                <li><InfoLink href="https://www.instagram.com/buildinamsterdam/">Instagram</InfoLink></li>
                <li><InfoLink href="https://www.facebook.com/buildinamsterdam">Facebook</InfoLink></li>
                <li><InfoLink href="https://twitter.com/buildinams">Twitter</InfoLink></li>
                <li><InfoLink href="https://www.linkedin.com/company/build-in-amsterdam/">LinkedIn</InfoLink></li>
              </ul>
            </div>
            {/* GALLERY (order-1 → left) — two image tracks that auto-pan once to the bottom-aligned
                end then stop; this cell clips (overflow-hidden) while the tracks translate within. */}
            <div className="order-1 h-full overflow-hidden">
              <ContactGallery />
            </div>
          </div>
          {/* HeaderLogo (shared) — fixed top-left; its padding (2vw / 30px), z-index and
              mix-blend-mode:exclusion all live INSIDE the shared component and are NOT re-styled
              here. Inside the transformed wrapper, so it rides up with the content on nav-open.
              variant="short" → only the "BiA." mark (live shows the short logo on /contact). */}
          <HeaderLogo variant="short" />
        </section>
      </div>
      <MenuButton isOpen={navOpen} onClick={toggleNav} revealed />
    </>
  );
}
