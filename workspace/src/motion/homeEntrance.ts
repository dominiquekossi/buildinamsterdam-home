/**
 * playHomeEntrance — the HOME ENTRANCE on page load.
 *
 * Live-verified (getAnimations() registry, 2026-06-13): at load the original plays the SAME
 * choreography as the showreel CLOSE, verbatim — white-bg 100%→0% (700ms) + video stage
 * 0%→−25% (700ms, the split FORMS here) + content column drift +20%→0 (650ms, delay 50) and
 * fade 0→1 (400ms, delay 350) — plus a load-only track: the header-logo wrapper fades 0→1
 * over 700ms. All Web Animations API, cubic-bezier(0.42, 0, 0.21, 1), fill "both"; the fills
 * are dropped at finish with zero visual change (the underlying DOM is already the rest pose).
 *
 * The five shared tweens are duplicated from ShowreelSlot.closeFullscreen ONLY because that
 * file is review-frozen (approved showreel) — keep the parameters in lockstep if either side
 * ever changes.
 */
const ENTRANCE_EASE = "cubic-bezier(0.42, 0, 0.21, 1)";

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function playHomeEntrance(): void {
  if (prefersReducedMotion) return;
  // The stage div belongs to ShowreelSlot (review-frozen — queried, not edited).
  const stage = document.querySelector("video")?.parentElement ?? null;
  const bg = document.querySelector<HTMLElement>("[data-fs-whitebg]");
  const col = document.querySelector<HTMLElement>("[data-fs-column]");
  const header = document.querySelector<HTMLElement>("header");

  const anims: Animation[] = [];
  if (stage) {
    anims.push(
      stage.animate(
        [{ transform: "translateX(0%)" }, { transform: "translateX(-25%)" }],
        { duration: 700, easing: ENTRANCE_EASE, fill: "both" },
      ),
    );
  }
  if (bg) {
    anims.push(
      bg.animate(
        [{ transform: "translateX(100%)" }, { transform: "translateX(0%)" }],
        { duration: 700, easing: ENTRANCE_EASE, fill: "both" },
      ),
    );
  }
  if (col) {
    anims.push(
      col.animate(
        [{ transform: "translateX(20%)" }, { transform: "translateX(0%)" }],
        { duration: 650, delay: 50, easing: ENTRANCE_EASE, fill: "both" },
      ),
      col.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: 400, delay: 350, easing: ENTRANCE_EASE, fill: "both" },
      ),
    );
  }
  if (header) {
    anims.push(
      header.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: 700, easing: ENTRANCE_EASE, fill: "both" },
      ),
    );
  }
  Promise.all(anims.map((a) => a.finished)).then(
    () => anims.forEach((a) => a.cancel()),
    () => {
      /* cancelled — nothing to restore (underlying DOM is the rest pose) */
    },
  );
}
