import type { ReactNode } from "react";

// House curve (measured live, same as the nav) — the link hover uses it, NOT a generic ease.
const LINK_EASE = "ease-[cubic-bezier(0.45,0.02,0.09,0.98)]";

/**
 * InfoLink — one INFO action-link / social. The visible text is NOT painted by the <a> (which the
 * live leaves inert): it lives in an inner node in RecklessNeue-Book (font-serif-lead), 19px floor,
 * FLUID >1440 via the SAME s(vw) the H1 uses (max(19px, calc(13.3px+0.39583vw)) = 19·max(1,0.7+0.3·vw/1440)),
 * line-height 1.2em (22.8), letter-spacing -0.01em. This 22.8 link-line is what makes the block 47.58
 * and the label→label rhythm 103.58 (was 98.78 with the old plain Helvetica 16px link).
 *
 * Hover (measured live, transform-only → no reflow; the <a> stays inert, no colour/underline):
 *  - the text slides right +15.36px in 0.25s (house curve);
 *  - a 9.59px terracotta (#C38133) square fades in (opacity 0→1) and slides translateX 5.76→0 in 0.1s.
 * The square + slide offsets are FIXED px (verified identical @1440 and @1920 — they do NOT scale with
 * the fluid font). reduced-motion drops the transition (live does the same via @media prefers-reduced-motion).
 */
export default function InfoLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="group block w-fit">
      <span className="grid">
        {/* terracotta square — hidden at rest (opacity 0 + translateX 5.76px), appears on hover */}
        <span
          aria-hidden
          className={`col-start-1 row-start-1 h-[9.59px] w-[9.59px] self-center justify-self-start translate-x-[5.76px] bg-terracotta opacity-0 transition-[opacity,transform] duration-100 ${LINK_EASE} group-hover:translate-x-0 group-hover:opacity-100 motion-reduce:transition-none`}
        />
        {/* visible text — RecklessNeue-Book 19px (floor, fluid >1440); slides right +15.36px on hover */}
        <span
          className={`col-start-1 row-start-1 transition-transform duration-[250ms] ${LINK_EASE} group-hover:translate-x-[15.36px] motion-reduce:transition-none`}
        >
          <span className="block font-serif-lead text-[max(19px,calc(13.3px+0.39583vw))] font-normal leading-[1.2] tracking-[-0.01em] text-black">
            {children}
          </span>
        </span>
      </span>
    </a>
  );
}
