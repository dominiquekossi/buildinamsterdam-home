import { useEffect, useRef } from "react";
import type { CaseItem } from "./casesData";
import { CASE_COVERS } from "./casesCovers";

/**
 * CaseCard — one portfolio tile.
 *
 * Aspect is driven by `padding-bottom` exactly like the live (`.cEDrqq` 150% = 2:3 /
 * `.iuXmP` 133.333% = 3:4) on a full-width relative box; the cover image, pill and caption are
 * absolutely positioned inside it.
 *
 * Section 7 (real assets): the cover is a LOCAL WebP (q=80) from `public/images/<slug>.webp`
 * (+ `@2x`), generated offline from the project-provided originals (see casesCovers.ts). It fills
 * the AR box with `object-fit: cover` so a landscape source is cropped to the portrait card exactly
 * like the live. DPR (`x`) descriptors pick 1x at DPR1 (the fidelity ruler) and 2x at DPR2; the 1x
 * is sized to fully cover the 1440 box (sharp at 1440, mild ~1.45× oversize at 1024 — far under the
 * live's own ~2.7×). No external/CDN, no /_next/image — assets are local (guide §6.7 / assets-local).
 *
 * Image fade (Section 5 mechanism, now on the REAL load): the cover fades opacity 0→1 over 250ms
 * cubic-bezier(0.45,0.02,0.09,0.98) on the <img>'s own `load` event (Next/image-style). This is a
 * SEPARATE layer from the row-staggered wrapper entrance (useCardEntrance, 300ms ease-out / 150ms
 * stagger on [data-card-wrapper]) and from the parallax/spread transforms — it fades the <img> only;
 * the <a>, pill and caption stay opacity 1.
 *
 * Caption: name (NHaasGroteskTXPro 500, uppercased via CSS) · description (NHaasGroteskDSPro 400),
 * white, fluid `max(14px, calc(9.8px + 0.291667vw))` / lh 1.2 (live-verified 14px @1024–1440). The
 * category pill (when present) is a translucent-black rounded chip, top-right.
 */

/** Live-verified caption/pill type scale (floored fluid). */
const FLUID_TEXT = "text-[max(14px,calc(9.8px_+_0.291667vw))] leading-[19.2px]";
const IMG_FADE_EASE = "cubic-bezier(0.45, 0.02, 0.09, 0.98)";

export default function CaseCard({ item, eager = false }: { item: CaseItem; eager?: boolean }) {
  const padBottom = item.ar === "2:3" ? "pb-[150%]" : "pb-[133.333%]";
  const cover = CASE_COVERS[item.slug];
  const imgRef = useRef<HTMLImageElement>(null);

  // 250ms opacity fade-in, fired once per image when it finishes loading.
  const fadeIn = () => {
    const el = imgRef.current;
    if (!el || el.dataset.faded) return;
    el.dataset.faded = "1";
    el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, easing: IMG_FADE_EASE, fill: "both" });
  };
  // If the image was already complete before React wired onLoad (cache / sync decode), fade now so
  // it can't get stuck invisible at the initial opacity-0.
  useEffect(() => {
    const el = imgRef.current;
    if (el?.complete && el.naturalWidth > 0) fadeIn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const srcSet = cover?.src2x ? `${cover.src} 1x, ${cover.src2x} 2x` : undefined;

  return (
    <a href={`/case/${item.slug}`} className="block cursor-pointer">
      <div className={`relative block w-full overflow-hidden bg-off-white ${padBottom}`}>
        {/* Real cover — local WebP, object-fit:cover crops to the AR box (Section 7). */}
        {cover && (
          <img
            ref={imgRef}
            src={cover.src}
            srcSet={srcSet}
            width={cover.w}
            height={cover.h}
            alt={item.alt}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            onLoad={fadeIn}
            className="absolute inset-0 h-full w-full object-cover opacity-0"
            style={{ objectPosition: item.focal ?? "50% 50%" }}
          />
        )}

        {/* Category pill — top-right, translucent black chip */}
        {item.pill && (
          <div className="absolute inset-x-[10px] top-[11px] flex justify-end">
            <span className={`rounded-full bg-black/20 px-[16px] py-[5px] font-ui font-normal text-white ${FLUID_TEXT}`}>
              {item.pill}
            </span>
          </div>
        )}

        {/* Caption — bottom-left, 20px inset. Color is per-card (live paints light-cover cases BLACK):
            item.caption === "dark" → text-black, else default white. The "·" separator is 16px to
            match the live (title/desc stay 14px, lh 1.2). */}
        <div className={`absolute inset-x-0 bottom-0 p-[20px] ${item.caption === "dark" ? "text-black" : "text-white"}`}>
          <div className={FLUID_TEXT}>
            <span className="font-ui font-medium uppercase">{item.name}</span>
            <span className="text-[16px]"> · </span>
            <span className="font-display font-normal">{item.desc}</span>
          </div>
        </div>
      </div>
    </a>
  );
}
