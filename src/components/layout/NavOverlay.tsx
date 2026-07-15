/**
 * NavOverlay — full navigation, revealed when the Menu button is pressed.
 *
 * Verified behavior (Phase 3, docs/PHASE3_FINDINGS.md §9 + live inspection):
 * - A fixed black (#000) panel at the bottom — height steps at min-width:1280px (live-verified
 *   2026-06-12): <1280 = 400px FIXED (constant at 700/768/850 heights); ≥1280 = max(450px,50vh).
 *   It sits BEHIND the page content; opening slides the content wrapper up by panel−1px (see
 *   App --nav-shift), which reveals this panel. (Transition on the wrapper: 0.65s house ease.)
 * - Items: flex row, **40vh wide** (= 360px @ 900-high viewport — verified: 360 @900h and
 *   277.2 @693h, both exactly 40vh; width-independent 1280–1600), 35px gap, 35px side padding.
 *   The row scrolls horizontally (~4 visible at 1440×900). Thumbnails: aspect 1.869,
 *   border-radius 4px, overflow hidden, 12px below the label.
 * - Each item: a status dot + uppercase label (NHaasGroteskTXPro 500, 16/19.2, white) +
 *   thumbnail (~360 wide, ratio ~1.868) below. The dot animates in on hover (see DotLabel /
 *   globals.css): non-active items hide it by default and fade+slide it in to the LEFT of the
 *   label on hover (label shifts right to make room); the active item (Home) keeps its blue dot
 *   permanently with no animation. Dot colours: active Home = blue #3C4CC7, others = terracotta
 *   #C38133. Verified live 2026-06-11.
 * - "Follow us" + Instagram + LinkedIn, bottom-right.
 *
 * - Mouse-driven horizontal scroll (verified live, 2026-06-11): while the nav is open the item
 *   row scrolls with the pointer's X — pointer left → row scrolls to the left items, pointer
 *   right → right items, smoothly lerped and clamped at both ends. The original translateX-es
 *   the track; we animate `scrollLeft` instead (visually identical, and it preserves keyboard
 *   focus scroll-into-view). The scroll maps a centered active band (~28.5% dead margin each
 *   side) of the viewport width onto [0 … maxScroll]; disabled under reduced motion (native
 *   scroll remains).
 *
 * Thumbnails use the local desktop copies in /images/.
 */
import { useEffect, useRef } from "react";
import DotLabel from "../shared/DotLabel";
import { asset } from "@/utils/assetPath";

/** Fraction of the viewport on each side that maps to the clamped ends (verified ≈0.285). */
const SCROLL_MARGIN = 0.285;
/** Per-frame lerp toward the target scroll (≈0.5s settle, matching the live smoothing). */
const SCROLL_LERP = 0.1;
/** House easing + duration for the open/close panel + parallax (verified live 0.65s). */
const NAV_EASE = "cubic-bezier(0.45, 0.02, 0.09, 0.98)";

interface NavItem {
  id: string;
  label: string;
  href: string;
  thumb: string;
  active?: boolean;
  external?: boolean;
}

// Thumbnails are WebP at ~900px wide (Storyblok `/m/900x476/filters:format(webp):quality(82)`
// from the live source files — same crop/version as the live, Knowledge = v2). WebP at ~display
// size replicates the live's Next/image mechanism: the browser downscales only ~1–2.4× (not the
// 4× of the old 1500px JPEGs, which softened fine text + added gradient moiré at DPR1). Verified
// legible at 1024/1440, DPR1/DPR2. ~15–44KB each (was ~80KB JPEG). See live-reference-drift memory.
const ITEMS: NavItem[] = [
  {
    id: "Home",
    label: "Home",
    href: "/",
    thumb: "/images/home-page-desktop-thumbnail.webp",
    active: true,
  },
  {
    id: "Work",
    label: "Work",
    href: "/cases",
    thumb: "/images/work-page-desktop-thumbnail.webp",
  },
  {
    id: "Expertise",
    label: "Expertise",
    href: "/expertise",
    thumb: "/images/expertise-desktop-thumbnail.webp",
  },
  {
    id: "About",
    label: "About",
    href: "/about",
    thumb: "/images/about-us-desktop-thumbnail.webp",
  },
  {
    id: "Contact",
    label: "Contact",
    href: "/contact",
    thumb: "/images/contacts-page-desktop-thumbnail.webp",
  },
  {
    id: "Join us",
    label: "Join us",
    href: "https://jobs.buildinamsterdam.com/",
    thumb: "/images/join-us-desktop-thumbnail.webp",
    external: true,
  },
  {
    id: "Knowledge",
    label: "Knowledge",
    href: "/articles",
    thumb: "/images/knowledge-page-desktop-thumbnail.webp",
  },
];

/** Follow-us social links — the chip styling is identical for both (verified byte-equal
 *  class strings); only the destination/icon metadata varies per item. */
const SOCIALS = [
  {
    href: "https://www.instagram.com/buildinamsterdam/",
    label: "Instagram",
    icon: "/icons/social-instagram.svg",
    alt: "Instagram logo",
    w: 15,
    h: 15,
  },
  {
    href: "https://nl.linkedin.com/company/build-in-amsterdam",
    label: "LinkedIn",
    icon: "/icons/social-linkedin.svg",
    alt: "Linkedin logo",
    w: 15,
    h: 16,
  },
];

interface NavOverlayProps {
  open: boolean;
}

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function NavOverlay({ open }: NavOverlayProps) {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const rootRef = useRef<HTMLElement>(null);

  // Mouse-X-driven horizontal scroll while the nav is open (see header doc). Imperative rAF
  // lerp on scrollLeft — no React re-render per frame.
  // REVIEWER DECISION (2026-06-11): the scroll reacts ONLY while the pointer is over the nav
  // panel itself (moves above it are ignored, freezing the row where it is).
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || !open || prefersReducedMotion) return;

    let raf = 0;
    let cur = el.scrollLeft;
    let target = el.scrollLeft;

    const onMove = (e: PointerEvent) => {
      // REVIEWER DECISION (2026-06-11): the scroll reacts ONLY while the pointer is inside the
      // thumbnails row itself; when the pointer LEAVES the row, the row scrolls back to the
      // start (Home first).
      const r = el.getBoundingClientRect();
      if (e.clientY < r.top || e.clientY > r.bottom) {
        target = 0;
        return;
      }
      const W = window.innerWidth;
      const m = W * SCROLL_MARGIN;
      const t = Math.min(1, Math.max(0, (e.clientX - m) / (W - 2 * m)));
      target = t * (el.scrollWidth - el.clientWidth);
    };
    const tick = () => {
      cur += (target - cur) * SCROLL_LERP;
      el.scrollLeft = cur;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [open]);

  return (
    <nav
      ref={rootRef}
      aria-label="Main"
      aria-hidden={!open}
      // z-20 — ABOVE the content wrapper (z-10), matching live (nav z:8 > content z:1): on
      // short viewports the shifted content overlaps the nav's top edge, and the NAV must
      // paint over it (verified live via elementFromPoint in the overlap band). Closed, the
      // panel is translateY(100%) (off-screen), so the higher z is inert.
      className="fixed bottom-0 left-0 z-20 h-[400px] w-full overflow-hidden bg-black text-white min-[1280px]:h-[max(450px,50vh)]"
      style={{
        // The panel rises from below on open (verified live: translateY 100% → 0, 0.65s).
        transform: `translateY(${open ? "0%" : "100%"})`,
        transition: prefersReducedMotion
          ? "none"
          : `transform 0.65s ${NAV_EASE}`,
      }}
    >
      {/* Parallax track: the content rises slightly slower than the panel (verified -30% → 0),
          so the items trail the panel as it opens. */}
      <div
        className="relative h-full"
        style={{
          transform: `translateY(${open ? "0%" : "-30%"})`,
          transition: prefersReducedMotion
            ? "none"
            : `transform 0.65s ${NAV_EASE}`,
        }}
      >
        {/* Top inset steps at min-width:1280px like everything else (live-verified): <1280 =
            3vh (23 @768h / 21 @700h / 25.5 @850h), ≥1280 = 4vh (30.72 @768h, 36 @900h).
            Card width / gap / side padding step at the same breakpoint (live-verified curve:
            <1280 → card 350px FIXED + gap/pad 15; ≥1280 → card 40vh + gap/pad 35). */}
        <ul
          ref={scrollerRef}
          className="no-scrollbar flex gap-[15px] overflow-x-auto px-[15px] pt-[3vh] min-[1280px]:gap-[35px] min-[1280px]:px-[35px] min-[1280px]:pt-[4vh]"
        >
          {ITEMS.map((it) => (
            <li key={it.id} className="shrink-0">
              <a
                id={`menu-nav-${it.id}`}
                href={it.external ? it.href : asset(it.href)}
                tabIndex={open ? 0 : -1}
                {...(it.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="group block w-[350px] min-[1280px]:w-[40vh]"
              >
                {/* Label font rides the fluid scale above 1440 (live-verified 2026-06-13:
                    16px/19.2 ≤1440 → 17.6px/21.12 @1920, lh ratio exactly 1.2 both widths =
                    max(16px, 11.2px+0.33333vw)). The dot is 0.6em, so it scales with the
                    label (9.59px ≤1440 → 10.55px @1920 = live). Font-size is passed HERE, not
                    in DotLabel — the showreel controls pass their own 11px, so they're
                    unaffected (BUG 4 fix). */}
                <DotLabel
                  label={it.label}
                  dotColor={it.active ? "#3C4CC7" : "#C38133"}
                  active={it.active}
                  className="font-ui text-[max(16px,calc(11.2px+0.33333vw))] font-medium uppercase leading-[1.2]"
                />
                {/* Thumbnail: 4px-radius clip; the inner zoom layer rests at scale(1.03) and
                    zooms OUT to scale(1) on item hover (verified live CSS rule:
                    `.ckMkXW:hover .sc-e74a5d29-0 { transform: scale(1) }`, 0.65s house ease,
                    under `@media (hover:hover) and (pointer:fine)` — the arbitrary variant). */}
                <span className="mt-[12px] block aspect-[71/38] w-full overflow-hidden rounded-[4px]">
                  <span className="block h-full w-full scale-[1.03] transition-transform duration-[650ms] ease-[cubic-bezier(0.45,0.02,0.09,0.98)] group-focus-visible:scale-100 [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-100">
                    <img
                      src={asset(it.thumb)}
                      alt={`${it.label} page thumbnail`}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>

        {/* Follow us — bottom right (verified live: container flex items-center gap 16px at
            right 60 / bottom 64; label NHaasGroteskTXPro 12px/500/uppercase white; each social
            link is a 50×32 black chip with a 1px WHITE OUTLINE that inverts on hover
            (utilities below = the live `.efuxuq a` rules verbatim); icon row sits 2px down). */}
        <nav
          aria-label="Follow us"
          className="absolute bottom-16 right-[60px] flex items-center gap-[16px]"
        >
          {/* The LABEL font rides the Hero's fluid scale above 1440 (live 2026-06-12: 12px at
            1024–1440, 13.2px @1920 = max(12px, 8.4px+0.25vw)) while the CHIPS stay fixed
            (h 32 / right 60 / dist-to-base 62 measured constant at 1024/1440/1920).
            line-height: normal (NOT 1.2) — the live wraps this text in a flex-item with
            line-height:normal (≈15px @12px), which centers the glyph 1px lower than a 14.4
            box; `normal` also scales with the fluid font (a fixed 15px would break @1920).
            Re-extracted 2026-06-13 (BUG 3): glyph cy 819.3→820 @1440 / 687.3→688 @1024,
            matching the live (820.5/688.5; ~0.5px residual is sub-pixel glyph rounding). */}
          <span className="font-ui text-[max(12px,calc(8.4px+0.25vw))] font-medium uppercase leading-[normal]">
            Follow us
          </span>
          <ul className="flex translate-y-[2px] items-center">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  tabIndex={open ? 0 : -1}
                  className="flex h-[1.88rem] min-w-[2.5rem] items-center justify-center bg-black px-[0.88rem] py-[0.56rem] outline outline-1 outline-white focus-visible:invert-[1] focus-visible:outline-black active:invert-[1] active:outline-black min-[768px]:h-8 min-[768px]:min-w-[3.125rem] [@media(hover:hover)_and_(pointer:fine)]:hover:invert-[1] [@media(hover:hover)_and_(pointer:fine)]:hover:outline-black"
                >
                  <img
                    src={asset(s.icon)}
                    alt={s.alt}
                    width={s.w}
                    height={s.h}
                    className="h-[14px] w-auto"
                  />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </nav>
  );
}
