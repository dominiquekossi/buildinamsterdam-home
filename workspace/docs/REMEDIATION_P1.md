# P1 Remediation — Critical Fixes (evidence)

Source of truth: `docs/IMPLEMENTATION_AUDIT.md`. Validation via Chrome DevTools MCP +
Playwright MCP against the running app. Build + typecheck green throughout.

---

## P1.1 — IntroLoader restart defect — ✅ VERIFIED FIXED

**Problem.** The intro visibly restarted once mid-flight. Audit evidence: `window.__introEffectRuns === 3`.

**Root cause (investigated, not assumed).**
1. `App` passed **fresh inline callback identities** every render:
   `onReveal={() => setHeroRevealed(true)}`, `onComplete={() => setIntroComplete(true)}`.
2. `IntroLoader`'s effect declared `useEffect(…, [onReveal, onComplete])`. When the intro fired
   `onReveal` at A3, `setHeroRevealed(true)` re-rendered `App` → new callback identities →
   effect dependencies changed → effect re-ran → `ctx.revert()` + a new GSAP timeline from 0
   → **the intro replayed**.
3. Additionally, `<StrictMode>` double-invokes effects **in dev**, inflating the count
   (mount = 2) and remounting the one-shot intro.

**Implementation.**
- `src/App.tsx`: wrapped the callbacks in `useCallback(…, [])` → stable identities, so the
  `heroRevealed` flip no longer changes `IntroLoader`'s effect deps (no re-run / restart).
- `src/main.tsx`: removed `<StrictMode>`. Its dev-only double-invoke remounts the
  gsap.context+revert intro and replays it; a ref-guard would break the revert cleanup.
  Removing it makes dev == production (single mount → single intro run). Rationale documented
  in `main.tsx`.

**Verification (both tools, fresh loads, after the intro completed and `heroRevealed` flipped):**

| Tool | `__introEffectRuns` | timeline progress | loader | headline |
|------|--------------------|-------------------|--------|----------|
| Chrome DevTools | **1** | 1.0 (complete) | unmounted | revealing→0 |
| Playwright | **1** | 1.0 (complete) | unmounted | transform 0 (revealed) |

- Console: **0 errors**.
- Before: `__introEffectRuns === 3`. After: `=== 1`. **Acceptance met.**
- Screenshot: `docs/diffs/p1-intro-fixed-settled.png`.

**Classification: VERIFIED.**

---

## P1.2 — `.screen-reader-only` utility — ✅ VERIFIED FIXED

**Problem.** `ShowreelSlot` used `className="screen-reader-only"` but the class was **undefined**
in `globals.css` (only invisible by black-on-black coincidence).

**Implementation.** Ported the original rule verbatim from `artifacts/crawl/css.css` into
`src/styles/globals.css` (`@layer utilities`):
`position:absolute; width:1px; height:1px; padding:0; overflow:hidden; white-space:nowrap; border:0`.

**Verification (Chrome DevTools, live computed style of the "Play showreel" button):**
- `position: absolute`, `width: 1px`, `height: 1px`, `overflow: hidden`, rect `1×1`. ✅
- Console: **no missing-CSS or related warnings** (only the font warnings remain, see P1.3).

**Classification: VERIFIED.**

---

## P1.3 — Font situation — 🔒 BLOCKED BY EXTERNAL DEPENDENCY (diagnosed)

**Problem.** Console: `Failed to decode downloaded font … OTS parsing error: invalid sfntVersion: 1008821359` (×6).

**Diagnosis (conclusive, evidence-based).** Fetched the font URLs and inspected the bytes:

| URL | HTTP | content-type | bytes | first bytes | woff2/woff magic? |
|-----|------|--------------|-------|-------------|-------------------|
| `/fonts/NHaasGroteskDSPro-55Rg.woff2` | 200 | **text/html** | 866 | `3c 21 64 6f…` = `<!doctype html>` | no |
| `/fonts/RecklessNeue-Book.woff` | 200 | **text/html** | 866 | `<!doctype html>` | no |

- The server returns the SPA fallback `index.html` for these paths → **the font files do not exist**.
- `1008821359` = `0x3C21646F` = `"<!do"` — the HTML doctype, explaining the OTS error.
- `public/fonts/` contains only `README.md`.

**Scenario determination:**
- **A — never supplied → ✅ THIS ONE.** No font files present; only the README.
- B — wrong paths → ❌ ruled out: `@font-face` `src` paths are correct (they would resolve if the files existed in `public/fonts/`).
- C — corrupted → ❌ ruled out: there is no font file at all (the response is HTML, not a damaged font).
- D — wrong format → ❌ ruled out: no font binary present to be mis-formatted.

**Resolution.** The fonts are proprietary/licensed (NHaasGroteskDSPro, NHaasGroteskTXPro,
RecklessNeue-Book) and **must be supplied by the reviewer** — I will not fabricate or
substitute them. Fallback rendering (Helvetica/Arial/Georgia, declared in `tailwind.config.ts`)
is correctly in place and the page is fully functional. Once the `.woff2/.woff` files are
dropped into `public/fonts/` (matching the names in `src/styles/fonts.css`), the warnings clear
and the right-half Pixel Comparison SSIM should rise toward ~1.0.

**Classification: BLOCKED BY EXTERNAL DEPENDENCY** (diagnosis complete; action requires the
licensed files).

---

## P1 build/quality gate
`npm run typecheck` ✅ · `npm run build` ✅ · console **0 errors** (only the 6 external-blocker
font warnings). Dev-only instrumentation (`__introTl`, `__introEffectRuns`, `?introspeed`) is
`import.meta.env.DEV`-gated and stripped from production builds.
