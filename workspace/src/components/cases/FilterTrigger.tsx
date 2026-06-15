import { useLayoutEffect, useRef } from "react";

/**
 * FilterTrigger — the closed-state "Filter Work" control (Section 4), cases-scoped.
 *
 * Verified live (1024/1440): a vertically-rotated label centred in the viewport
 * (transform `matrix(0,1,-1,0,0,0)` = `rotate(90deg)`; rect centre = vw/2, vh/2). Clicking it
 * opens the filter. DOM text is canonical "Filter Work" (uppercased via CSS).
 *
 * Fade-in (Section 4 close re-fade AND Section 5 entrance — the SAME motion): when the trigger
 * mounts it appears with TWO overlaid opacity 0→1 fades — an outer layer over 300ms
 * cubic-bezier(0.25,0.1,0.35,1) and an inner layer over 1500ms cubic-bezier(0.45,0.02,0.09,0.98).
 * The trigger mounts in exactly two situations and both want this fade: the page-load ENTRANCE
 * (Section 5) and a filter CLOSE (Section 4, the panel unmounts and the trigger remounts). They
 * leave it in the same visible state, so it runs unconditionally on mount. It does NOT replay on
 * nav toggle or scroll (those don't remount the trigger).
 */
export default function FilterTrigger({ onOpen }: { onOpen: () => void }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const opts = { fill: "both" as const };
    outerRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: "cubic-bezier(0.25, 0.1, 0.35, 1)", ...opts });
    innerRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1500, easing: "cubic-bezier(0.45, 0.02, 0.09, 0.98)", ...opts });
  }, []);

  return (
    <div ref={outerRef} className="fixed left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2">
      <div ref={innerRef}>
        <button
          type="button"
          onClick={onOpen}
          aria-label="Filter Work"
          className="block whitespace-nowrap p-[1em] font-ui text-[calc(8.4px+0.25vw)] font-medium uppercase leading-none tracking-wide text-black [transform:rotate(90deg)]"
        >
          Filter Work
        </button>
      </div>
    </div>
  );
}
