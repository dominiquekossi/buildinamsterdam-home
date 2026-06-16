import { useLayoutEffect, useRef } from "react";

/**
 * FilterPanel — the open-state filter panel (Section 4 + the Section-2..7 fidelity pass), cases-scoped.
 *
 * Verified live (1024 & 1440): mounts ONLY when open; a fixed, horizontally-centred 424px-wide layer,
 * full viewport height; fades in opacity 0→1 over 850ms cubic-bezier(0.45,0.02,0.09,0.98) (WAAPI).
 *
 * Layout (measured live 2026-06-15, computed styles — ALL viewport-INVARIANT: identical px at 1024 & 1440):
 * - The CONTENT is a 240px column HORIZONTALLY CENTRED in the 424px panel (each section/list is 240px,
 *   `mx-auto` → centre x = panel centre 512/720). NOT text-align:center. (Live uses 92px panel side-padding
 *   to get the 240; our `w-[240px] mx-auto` lands the same centre x.)
 * - VERTICAL: content is TOP-ANCHORED at y=74 (live = 74px panel pad-top + flex flex-start; NOT centred).
 *   We mirror it with `pt-[74px]` + flex column (no justify-center). Inter-section gap = 87px (flex `gap`).
 * - Section headings `<h2>`: 16px, font-medium(500), uppercase, line-height 1.2 (19.2px), NO letter-spacing,
 *   black, margin-bottom 15px (heading→list gap).
 * - Each item is a flex `justify-between` row: label (left) + count (right). Label/count 20px RecklessNeue-Book
 *   400 black, line-height 1.1 (22px), letter-spacing −0.2px; li-to-li gap 9px. Count is pushed right by
 *   space-between (STATIC catalog totals, not derived from the 33 cards). Font SIZE 20px is correct — the
 *   earlier "too large" was line-height (was 1.4/28px, now 1.1/22px).
 * - Hover: the live tints an item accent blue #3C4CC7 (rgb 60,76,199 — endpoint verified) over `color 0.15s`;
 *   replicated via `hover:text-blue` + `duration-150`.
 *
 * TAXONOMY (verbatim live, with counts): Categories[Strategy 8, Branding 16, Most awarded 4];
 * Industries[Fashion 11, Beauty 1, Sport 8, Furniture 6, Arts & culture 5, Travel 1, Architecture 2,
 * Fintech 1]; Technology[] — the live Technology list is EMPTY (heading only); our earlier invented
 * Shopify/Headless Shopify items are removed.
 */
type FilterItem = { label: string; count: number };
const SECTIONS: { heading: string; items: FilterItem[] }[] = [
  { heading: "Categories", items: [
    { label: "Strategy", count: 8 }, { label: "Branding", count: 16 }, { label: "Most awarded", count: 4 },
  ] },
  { heading: "Industries", items: [
    { label: "Fashion", count: 11 }, { label: "Beauty", count: 1 }, { label: "Sport", count: 8 },
    { label: "Furniture", count: 6 }, { label: "Arts & culture", count: 5 }, { label: "Travel", count: 1 },
    { label: "Architecture", count: 2 }, { label: "Fintech", count: 1 },
  ] },
  { heading: "Technology", items: [] }, // live: heading present, list empty
];

export default function FilterPanel() {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    ref.current?.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 850,
      easing: "cubic-bezier(0.45, 0.02, 0.09, 0.98)",
      fill: "both",
    });
  }, []);

  return (
    <div
      ref={ref}
      aria-label="Filter work"
      className="fixed inset-y-0 left-1/2 z-30 flex w-[424px] -translate-x-1/2 flex-col gap-[87px] pt-[74px]"
    >
      {SECTIONS.map((s) => (
        // 240px content column, centred in the 424px panel (mx-auto → centre x = panel centre).
        <section key={s.heading} className="mx-auto w-[240px]">
          <h2 className="mb-[15px] font-ui text-[16px] font-medium uppercase leading-[1.2] text-black">
            {s.heading}
          </h2>
          <ul className="font-serif-lead flex flex-col gap-[9px] text-[20px] leading-[1.1] tracking-[-0.2px] text-black">
            {s.items.map((it) => (
              // flex justify-between row: label left, count right (count pushed right by space-between).
              <li key={it.label} className="flex cursor-pointer justify-between transition-colors duration-150 hover:text-blue">
                <span>{it.label}</span>
                <span>{it.count}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
