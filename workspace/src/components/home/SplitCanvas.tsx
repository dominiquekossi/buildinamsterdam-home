import type { ReactNode } from "react";

interface SplitCanvasProps {
  /** Left half on desktop — the showreel video panel (dark). */
  videoSlot?: ReactNode;
  /** Right half on desktop — the white content panel (hero text). */
  contentSlot?: ReactNode;
  /** Showreel fullscreen state — slides the white background away so the video shows through
   *  (copied from the live layer choreography; see the white-layer comment below). */
  videoFullscreen?: boolean;
}

/**
 * SplitCanvas — the structural shell of the homepage.
 *
 * Verified behavior (Phase 3 + live re-inspection 2026-06-11):
 * - Desktop (≥769px): horizontal 50/50 split — video panel left (dark), white content panel
 *   right. The layout is NOT height-locked: the content column has `min-height: 100vh` and
 *   grows with its content, so on short viewports the PAGE scrolls (verified live: doc 736 @
 *   700-high viewport → scrolls 36px). The video panel is `position: sticky; top: 0; 100vh`,
 *   so it stays pinned while the content scrolls (verified: video top stays 0 during scroll).
 *   At 1440×900 the content fits (doc height = 900) → no scroll, same as before.
 * - ≤768px: vertical stack that scrolls — white content section on top, video below.
 *
 * Content panel is first in DOM (a11y/reading order); on desktop `flex-row-reverse`
 * places the video on the left, content on the right.
 */
export default function SplitCanvas({ videoSlot, contentSlot, videoFullscreen = false }: SplitCanvasProps) {
  return (
    <div className="relative flex flex-col desktop:flex-row-reverse">
      {/* Right half (desktop) / top (mobile): white content panel — natural height, min 100vh.
          z-10: paints ABOVE the video stage (the always-100vw video's right overhang hides
          under it at rest — live: the white cell is a later sibling above the video cell).
          overflow-hidden: clips the fullscreen-translated layers (white bg at 100%, hero at
          20%) — without it they extend past the page edge and create a ~676px horizontal
          scroll area during fullscreen (verified defect; live clips them inside the cell). */}
      <section className="relative z-10 min-h-screen w-full overflow-hidden desktop:w-1/2">
        {/* White background layer (live `JGffg`): BOTH directions are WAAPI tweens driven by
            ShowreelSlot via [data-fs-whitebg] (open 0%→100% 500ms / close 100%→0% 700ms, in
            sync with the video stage — live choreography 2026-06-13). The inline value below
            is only the UNDERLYING state the animations play over; the prop flips are
            bookkeeping masked by the animation fills — never transition here. */}
        <div
          aria-hidden
          data-fs-whitebg
          className="absolute inset-0 bg-white transition-none"
          style={{
            transform: `translateX(${videoFullscreen ? "100%" : "0%"})`,
          }}
        />
        {contentSlot}
      </section>

      {/* Left half (desktop) / bottom (mobile): showreel video panel (dark) — sticky on desktop */}
      <section className="relative z-0 min-h-screen w-full bg-black desktop:sticky desktop:top-0 desktop:h-screen desktop:min-h-0 desktop:w-1/2 desktop:self-start">
        {videoSlot}
      </section>
    </div>
  );
}
