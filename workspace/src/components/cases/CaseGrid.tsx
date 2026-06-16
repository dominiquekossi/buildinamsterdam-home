import { useRef } from "react";
import CaseCard from "./CaseCard";
import { CASE_COLUMNS } from "./casesData";
import { useCasesScroll } from "./useCasesScroll";
import { useCardEntrance } from "./useCardEntrance";
import { useColumnEntrance } from "./useColumnEntrance";

/**
 * CaseGrid — masonry grid (Section 2) + virtual-scroll parallax (Section 3) + filter spread (Section 4).
 *
 * Layout (ported VERBATIM from the live `.sc-460e6d5-2`, verified 2026-06-14):
 * - Container: `display:grid`, full-bleed `100vw`, no max-width/padding, `overflow:hidden`.
 *   `grid-template-columns: repeat(4, calc(25% - (var(--column-grid-gap)/4 * 3)))`.
 *   `gap: var(--column-grid-gap)`, breakpoint regime on the gap var: 1rem base → 1.55rem ≥768 →
 *   2.125rem ≥1024 (rem-fixed, so 34px holds at 1024/1440 and above). Columns grow with vw above
 *   1440 on their own (pure %). `items-start` so the grid items size to content.
 * - Visual L→R order is the live's `grid-template-areas` string verbatim: base `"col-0 col-1"`
 *   → ≥768 `"col-2 col-0 col-1 col-3"`. DOM column order stays col-0..col-3; the template reorders.
 *
 * Three layers, kept on SEPARATE nodes so transforms and opacity compose without fighting (the live
 * does the same):
 * - SPREAD wrapper (the grid item, `grid-area:col-N`): on filter open it `translateX(±65%)` of its
 *   OWN width — DOM col-0/col-2 → −65%, col-1/col-3 → +65% (verified live; 0.65·230.5≈149.8px @1024,
 *   0.65·334.5≈217px @1440 — % so it scales, no hardcoded px). CSS transition `transform 0.35s
 *   cubic-bezier(0.45,0.02,0.09,0.98)`, runs both directions.
 * - SETTLE wrapper (`[data-cases-settle]`, wraps the column): carries the Section-5 cold-load COLUMN
 *   SETTLE translateY (±50px → 0 over ~1.34s, house curve, once on mount — useColumnEntrance). Kept a
 *   SEPARATE layer OUTSIDE [data-cases-col] so it composes with (never clobbers) the parallax translateY;
 *   it ends at 0, handing off cleanly to Section 3.
 * - INNER column (`[data-cases-col]`, the flex-col): carries the parallax `translateY` written each
 *   frame by useCasesScroll. translateX(spread) on the grid-item ∘ translateY(settle) on the settle
 *   wrapper ∘ translateY(parallax) on the column — three separate nodes.
 * - CARD wrapper (`[data-card-wrapper]`, one per card): carries ONLY the Section 5 entrance opacity
 *   (row-staggered 0→1 via useCardEntrance) — a child of the column, so it rides the parallax/spread
 *   transforms while keeping opacity on its own node (the <a> and column opacities stay 1).
 */

// Literal classes (Tailwind JIT needs them spelled out, not interpolated).
const COL_AREA = ["[grid-area:col-0]", "[grid-area:col-1]", "[grid-area:col-2]", "[grid-area:col-3]"];
// DOM order col-0..col-3: left pair (0,2) spreads left, right pair (1,3) spreads right (verified live).
const SPREAD_PCT = [-65, 65, -65, 65];

export default function CaseGrid({ filterOpen = false }: { filterOpen?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Section 3 + auto-pan: filterOpen suspends the auto-pan while the panel is open (verified live).
  useCasesScroll(containerRef, filterOpen);
  // Section 5 entrance: row-staggered opacity fade on the per-card wrappers (once, on mount).
  useCardEntrance(containerRef);
  // Section 5 entrance: per-column ±50px translateY settle on the [data-cases-settle] layer (once).
  useColumnEntrance(containerRef);

  return (
    <div
      ref={containerRef}
      className={[
        "grid w-screen items-start overflow-hidden",
        "[--column-grid-gap:1rem] min-[768px]:[--column-grid-gap:1.55rem] min-[1024px]:[--column-grid-gap:2.125rem]",
        "[gap:var(--column-grid-gap)]",
        "[grid-template-columns:repeat(4,calc(25%_-_(var(--column-grid-gap)/4_*_3)))]",
        "[grid-template-areas:'col-0_col-1'] min-[768px]:[grid-template-areas:'col-2_col-0_col-1_col-3']",
      ].join(" ")}
    >
      {CASE_COLUMNS.map((column, i) => (
        // SPREAD wrapper (grid item)
        <div
          key={i}
          className={`${COL_AREA[i]} transition-transform duration-[350ms] ease-[cubic-bezier(0.45,0.02,0.09,0.98)]`}
          style={{ transform: filterOpen ? `translateX(${SPREAD_PCT[i]}%)` : undefined }}
        >
          {/* SETTLE wrapper — Section-5 cold-load column settle translateY (useColumnEntrance); a
              SEPARATE layer outside [data-cases-col] so it composes with the parallax translateY. */}
          <div data-cases-settle className="will-change-transform">
          {/* INNER column — parallax translateY rides here (useCasesScroll) */}
          <div data-cases-col className="flex flex-col [gap:var(--column-grid-gap)]">
            {column.map((item, idx) => (
              // CARD wrapper — Section 5 entrance opacity layer (row-staggered fade via
              // useCardEntrance). Plain static block: it's the flex item now (carries the column
              // gap) and is content-sized to the card, so layout is unchanged. Opacity only — no
              // transform — so it never fights the column translateY / grid-item translateX.
              <div key={item.slug} data-card-wrapper>
                {/* eager-load the top card of each column (above the fold); rest lazy (matches live). */}
                <CaseCard item={item} eager={idx === 0} />
              </div>
            ))}
          </div>
          </div>
        </div>
      ))}
    </div>
  );
}
