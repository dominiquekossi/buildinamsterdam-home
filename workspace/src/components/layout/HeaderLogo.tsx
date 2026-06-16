/**
 * HeaderLogo — fixed top-left "BiA. Powered by FRONT ROW" wordmark.
 *
 * Verified behavior (Phase 3, docs/PHASE3_FINDINGS.md §2):
 * - Fixed at top-left; padding 30px (vertical) / 2vw (horizontal, = 28.8px @1440).
 * - Logo SVG width 144px (aspect preserved); rendered white.
 * - `mix-blend-mode: exclusion` on the header inverts the white wordmark over the white
 *   content panel (reads dark) while staying white over the dark video panel.
 * - Links to "/".
 *
 * SVG is referenced from public/ (not inlined), per CLAUDE.md. The asset has a baked-in
 * white fill so it renders correctly as an <img> (the live site's coloring CSS was not in
 * the artifacts).
 *
 * Variant (live-verified): the live shows the FULL wordmark on the home, but a SHORT "BiA."
 * (the "Powered by Front Row" half + divider hidden) on /contact and /cases. The trigger is
 * per-route, so it is passed as a PROP by the page that mounts the logo (the component never
 * reads the pathname). The box does NOT shrink — the live keeps the svg at the same 144px and
 * only hides the right half, so the short asset shares the SAME viewBox (0 0 534 60) and the
 * SAME 144px render; only the visible glyphs differ. Default = "full" so the home is unchanged.
 */
export default function HeaderLogo({ variant = "full" }: { variant?: "full" | "short" }) {
  const src = variant === "short" ? "/icons/bia-logo-short.svg" : "/icons/bia-logo.svg";
  return (
    <header className="fixed left-0 top-0 z-50 px-[2vw] py-[30px] mix-blend-exclusion">
      <a href="/" aria-label="Build in Amsterdam — home">
        <img
          src={src}
          alt="Build in Amsterdam, powered by Front Row"
          width={534}
          height={60}
          className="block w-36"
        />
      </a>
    </header>
  );
}
