import { useLayoutEffect, useRef } from "react";

/**
 * FilterPanel — the open-state filter panel (Section 4 + the Section-2..7 fidelity pass), cases-scoped.
 *
 * Verified live (1024 & 1440): mounts ONLY when open; a fixed, horizontally-centred 424px-wide layer,
 * full viewport height; fades in opacity 0→1 over 850ms cubic-bezier(0.45,0.02,0.09,0.98) (WAAPI).
 *
 * Layout (measured live, panel `sc-418a1e14` / sections `sc-49c9b502` / item buttons `sc-7ba4bdcc`):
 * - The CONTENT is a 240px column HORIZONTALLY CENTRED in the 424px panel (each section/list is 240px,
 *   `mx-auto` → centre x = panel centre 512, L≈392, 92px each side). NOT text-align:center.
 * - Section headings `<h2>` render at 16px (the live size — our earlier calc(8.4px+0.25vw)=10.96px was wrong).
 * - Each item is a flex `justify-between` row: label (left) + count (right). Count = same 20px as the label,
 *   black, pushed right by space-between. Counts are STATIC catalog totals (not derived from the 33 cards).
 * - Hover: the live tints an item accent blue (#3C4CC7) — replicated via `hover:text-blue`.
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
      className="fixed inset-y-0 left-1/2 z-30 flex w-[424px] -translate-x-1/2 flex-col justify-center gap-[40px]"
    >
      {SECTIONS.map((s) => (
        // 240px content column, centred in the 424px panel (mx-auto → centre x = panel centre).
        <section key={s.heading} className="mx-auto w-[240px]">
          <h2 className="mb-[16px] font-ui text-[16px] font-medium uppercase tracking-wide text-black">
            {s.heading}
          </h2>
          <ul className="font-serif-lead flex flex-col gap-[2px] text-[20px] leading-[1.4] text-black">
            {s.items.map((it) => (
              // flex justify-between row: label left, count right (count pushed right by space-between).
              <li key={it.label} className="flex cursor-pointer justify-between transition-colors duration-200 hover:text-blue">
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
