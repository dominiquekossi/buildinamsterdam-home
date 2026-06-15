/**
 * DotLabel — a label preceded by a small circular dot that animates in on hover.
 *
 * Verified live (2026-06-11): used by both the nav items and the fullscreen showreel
 * Close/Mute controls (same original component). The dot is hidden by default and fades +
 * slides in to the LEFT of the label when the enclosing `group` link/button is hovered,
 * while the label shifts right to make room. An `active` item (the current page, e.g. Home)
 * shows its dot permanently. The dot is sized in `em`, so it scales with the label's
 * font-size automatically.
 *
 * Measured live geometry/timing, expressed as Tailwind utilities: dot 0.6em, slide offset
 * 0.36em, label shift 0.96em, house easing; ASYMMETRIC timing — appear 0.25s
 * (group-hover:duration-[250ms]), fade-out 0.1s (duration-100). Corroborated 2026-06-12 on
 * the nav items: dot in 5.76px/250ms house, partial reversals 93ms (≈0.1s base × progress).
 *
 * Hover variants are gated `@media (hover:hover) and (pointer:fine)` — the live declares the
 * whole hover block under that media (CSSOM-extracted 2026-06-12), so touch/coarse pointers
 * never trigger it. `active` poses are unconditional, like live.
 *
 * The enclosing interactive element MUST carry the `group` class for the hover to trigger.
 */
interface DotLabelProps {
  label: string;
  /** Dot fill colour (e.g. terracotta nav, blue active Home, white showreel controls). */
  dotColor: string;
  /** Current-page item — dot stays visible without hover. */
  active?: boolean;
  /** Typography classes for the label line (font/size/transform). */
  className?: string;
}

export default function DotLabel({ label, dotColor, active = false, className = "" }: DotLabelProps) {
  return (
    // Block-level flex (like the live grid container): an inline-level box here picks up
    // ~2px of baseline offset inside the link's line box, sitting the nav row visibly lower.
    <span className={`relative flex items-center ${className}`.trim()}>
      <span
        aria-hidden="true"
        className={`absolute left-0 top-1/2 h-[0.6em] w-[0.6em] -translate-y-1/2 rounded-[100%] transition-[opacity,transform] duration-100 ease-[cubic-bezier(0.45,0.02,0.09,0.98)] ${
          active
            ? "translate-x-0 opacity-100"
            : "translate-x-[0.36em] opacity-0 [@media(hover:hover)_and_(pointer:fine)]:group-hover:translate-x-0 [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100 [@media(hover:hover)_and_(pointer:fine)]:group-hover:duration-[250ms]"
        }`}
        style={{ backgroundColor: dotColor }}
      />
      <span
        className={`transition-transform duration-[250ms] ease-[cubic-bezier(0.45,0.02,0.09,0.98)] ${
          active ? "translate-x-[0.96em]" : "translate-x-0 [@media(hover:hover)_and_(pointer:fine)]:group-hover:translate-x-[0.96em]"
        }`}
      >
        {label}
      </span>
    </span>
  );
}
