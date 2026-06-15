# P4 Remediation — Showreel cursor label, fullscreen player, menu-label hover correction

Reviewer feedback (2026-06-11). All three items inspected live (Chrome DevTools, original +
localhost) before any code change, then implemented and re-verified in the running app.
`typecheck` ✅ · `build` ✅ · console **0 errors / 0 warnings**.

Source of truth this round included the `__NEXT_DATA__` CMS payload, which exposes the exact
labels: `hero_label_video_play:"Play showreel"`, `…_close:"Close"`, `…_mute:"Mute"`,
`…_unmute:"Unmute"`. Guidelines documents the **"Play showreel (Text Button)"** ("Triggers video
showreel playback, positioned over the black panel") but no timings → DevTools is canonical.

---

## 1. Cursor-following "Play showreel" label — ✅ VERIFIED

**Live mechanic (original).** A **fixed, full-viewport layer** (`position:fixed`, `z-index:7`,
`pointer-events:none`, **`mix-blend-mode:exclusion`**) holds a follower element whose `transform`
is `translate(clientX, clientY)` updated every frame (no CSS lag). The label is `opacity:1` only
while the pointer is over the video (left) panel and `opacity:0` over the content panel.

**Exact typography (re-verified live, leaf text element — corrects a first pass that read the
container's inherited 16px/NeueHaasGrotesk):** `NHaasGroteskTXPro`, **11px**, **font-weight 500**,
**`text-transform: uppercase`** (renders "PLAY SHOWREEL"), `letter-spacing: normal`, line-height
**13.2px**, white, `white-space: nowrap`. Rendered width 96px. The label sits **27.5px to the
right** of the cursor, **top-aligned** to it (inner wrapper `left: 27.5px`, `dy: 0`).

**Implementation (`ShowreelSlot.tsx`).** A `pointer-events:none fixed inset-0` layer with
`mix-blend-mode:exclusion`; a `<span>` (`font-ui text-[11px] font-medium uppercase
leading-[13.2px] text-white`, nowrap) translated to `(cursor.x + 27.5, cursor.y)` via a
`pointermove` listener; `opacity` gated by `onPointerEnter/Leave` on the video button
(`overVideo`), `transition: opacity 0.3s`. (NHaasGroteskTXPro weight 500 = the self-hosted
`NHaasGroteskTXPro-65Md` face.)

**Verification (localhost).** Over video → `opacity:1`, NHaasGroteskTXPro 11px/500/uppercase/13.2px
white, offset `dx:28 dy:0`, rendered width **96px = original**; over content → `opacity:0`. ✅
**Fullscreen Close/Mute share the same type** (11px NHaasGroteskTXPro 500 uppercase white) — also
corrected from the first pass's 16px/NeueHaasGrotesk reading.

---

## 2. Click → fullscreen showreel with sound + Close/Mute — ✅ VERIFIED

**Live mechanic (original).** Clicking the video panel expands the **same** video to cover the
viewport (`object-fit:cover`, fixed, above content) and **unmutes** it (sound on); it keeps
playing from its current time. Bottom-left controls appear: **"Close" + "Mute"** in a flex row,
**`gap:32px`, padding `0 0 48px 48px`**, white **16px NeueHaasGrotesk-Roman**. "Mute" toggles the
audio and its own label → "Unmute". "Close" exits fullscreen, restores the split, and re-mutes
the background loop.

**Implementation (`ShowreelSlot.tsx`).** Single `<video>`; `fullscreen` state swaps it to
`fixed inset-0 z-[60] object-cover` and sets `muted=false`; a `z-[70]` bottom-left flex row
(`gap-[32px] pb-[48px] pl-[48px]`) renders Close (`closeFullscreen`) and Mute/Unmute
(`toggleMute`, label = `muted ? "Unmute" : "Mute"`).

**Verification (localhost).** Click → `video.muted:false`, `position:fixed`, `z:60`, covers
1440×900; controls white 16px NeueHaasGrotesk-Roman, `gap:32px`, padding `0 0 48 48`, bottom-left.
Mute → `muted:true`, label "Mute"→"Unmute". Close → `muted:true`, `position:static`, w720,
controls gone, play affordance restored. ✅ Full lifecycle matches the original.

---

## 3. Menu label — corrected to HOVER-OF-CIRCLE ("gira e some") — ✅ VERIFIED

**Correction.** P3 modelled the label rotation as a **pointer left/right-half** toggle (visible
on the right half). Re-inspection proved that wrong: the label is driven by **hover of the
circle itself**. Confirmed live by correlating real mouse position with the `<g>` transform —
heading/CTA/logo (anywhere off the circle) → tucked-away state; only hovering the circle →
visible. (The two early "visible" readings in P3 were the initial entrance pose before pointer
reactivity engaged — a measurement artefact.)

**Two states (exact, transform-origin = circle centre, `transform-box:view-box`):**
- **Idle (not hovering):** `rotate(170deg) scale(0.85) translateY(-20px)` → label bbox radius
  **≈26** from centre — the word tucks behind/into the circle → **hidden**.
- **Hover circle:** `rotate(70deg) scale(1)` → radius **≈56**, readable "Menu" at ~3 o'clock.

**Implementation (`MenuButton.tsx`).** Replaced the `pointermove` left/right driver with
`onPointerEnter/Leave` hover state. `labelOut = revealed && (hovered || isOpen || reducedMotion)`;
transform = `TF_VISIBLE` (70°/1) when out else `TF_AWAY` (170°/.85/-20). Transition unchanged
(`transform 0.6s` signature easing).

**Paint-order fix (follow-up).** The idle label was still visible *on top of* the orange disc,
because the recon painted the `<circle>` before the `<g>` text. The original paints the disc
(`#menu-open`) **last, over the text** (verified: svg child order = `g[Menu] … path#menu-open`).
So the word lives **behind** the opaque disc: tucked-in (idle) → fully hidden; swung-out (hover)
→ only the arc past the disc edge shows. Reordered `MenuButton.tsx` to draw the label first,
disc on top.

**Verification (localhost).** At rest → `matrix(-0.837,0.148,-0.148,-0.837,0,-20)`, r=26, and the
disc paints over it — element screenshot shows a **clean disc, no "Menu"** (`docs/diffs/p4-menu-idle.png`).
Hover → `matrix(0.342,0.940,-0.940,0.342,0,0)`, r=56, label centre 40px **outside** the rendered
disc edge (r≈43) at ~3 o'clock → "Menu" reads (`docs/diffs/p4-menu-hover.png`). Leave → back to
hidden. `__introEffectRuns` still **1** (no regression). ✅

---

## 4. Hover dot indicator — nav items + Close/Mute — ✅ VERIFIED

**Problem (reviewer).** A dot animates in on hover of each nav tab and the Close/Mute controls;
it disappears when not hovering. Only **Home** keeps a persistent blue dot with no animation. My
recon showed a static dot on every nav item and none on Close/Mute.

**Live mechanic (verified — nav + Close/Mute use the SAME original component `sc-af2a3ede`).**
On hover of the enclosing link/button, the dot fades + slides in to the **LEFT** of the label
while the **label shifts right** to make room:
- Dot: `0.6em`, `border-radius:100%`. Rest → `opacity:0`, `translateX(0.36em)`; hover →
  `opacity:1`, `translateX(0)`. Label: rest `translateX(0)` → hover `translateX(0.96em)`.
- Timing is asymmetric: **appear 0.25s**, **fade-out 0.1s**, signature easing
  `cubic-bezier(0.45,0.02,0.09,0.98)` throughout.
- Colours: nav non-active = terracotta `#C38133`, **active Home = blue `#3C4CC7` (persistent,
  no hover)**, Close/Mute = white `#FFFFFF`.

**Implementation.** New shared `src/components/shared/DotLabel.tsx` + `.dot-label*` / `.dot-host`
rules in `globals.css`. `NavOverlay` items and the ShowreelSlot Close/Mute buttons carry
`dot-host` and render `<DotLabel>`; Home passes `active`. The dot is sized in `em` so it scales
to the label (16px nav → 9.6px dot; 11px control → 6.6px dot).

**Verification (localhost vs original).** Nav rest: Home dot `opacity:1 translateX(0)` blue;
Work dot `opacity:0 translateX(5.76px=0.36em)` terracotta. Nav hover (Work): dot `opacity:1
translateX(0)`, label `translateX(15.36px=0.96em)`, dot left of label, gap 5.8px. Close hover:
white dot `opacity:1 translateX(0)`, label `translateX(10.56px=0.96em)`, dot left of label,
gap 4px. All match the original endpoints. ✅

## 5. Nav mouse-driven horizontal scroll — ✅ VERIFIED

**Problem (reviewer).** While the nav is open, moving the mouse left/right scrolls the item row
left/right (a "hover scroll"). Not implemented (my row used plain native overflow scroll).

**Live mechanic.** The open nav's item row scrolls with the pointer's X, smoothly lerped and
clamped at both ends. The original translateX-es the track UL (`transform: matrix(…, tx, 0)`,
`tx` from `0` at the left to `-(scrollWidth − viewport)` at the right). Measured points
(viewport 1366, overflow 815): x=52 → 0, **x=582 → −267**, x≥~1090 → −815 (clamped). That fits a
**centered active band with ≈28.5% dead margin each side**: `tx = -clamp((x − 0.285W)/(0.43W),
0, 1) · overflow`. Settling took ~0.5s → a per-frame lerp (~0.1).

**Implementation (`NavOverlay.tsx`).** A rAF loop lerps the row's **`scrollLeft`** toward
`t · maxScroll` where `t = clamp((clientX − 0.285W)/(0.43W), 0, 1)`, driven by a window
`pointermove` while `open`. `scrollLeft` (not transform) is visually identical to the original
but keeps native/keyboard scroll-into-view; disabled under reduced motion (native scroll stays).

**Verification (localhost, viewport 1440, maxScroll 1360).** Pointer x=40 → scrollLeft 0 (left
items); x=720 (centre) → 670 ≈ half (680); x=1400 → 1350 ≈ max. At the original's relative x
(0.426W) the scroll ratio is **0.327** — matching the original's **0.328**. Intro still runs
once. ✅

## 6. Nav cards, open/close animation, menu-button-in-fullscreen, control contrast — ✅ VERIFIED

Four issues, all measured live (viewport matched to 1370–1440 desktop) before changing anything.

**6a. Nav thumbnail card size — SUPERSEDED by §7a.** First pass concluded ~20.2vw from a single
1370×693 sample. Multi-viewport measurement (Playwright, widths 1280/1370/1390/1440/1600 at
h=900) shows the item is **width-independent (360px at every width tested)** and the 1370×693
sample (277.2px) is **exactly 40vh** — as is 360 @ 900h. The card scales with **viewport
height**: `width: 40vh`. Corrected in §7a.

**6b. Open/close animation (was incomplete).** The original coordinates **three** 0.65s
(signature-ease) movements; my recon only slid the hero. Verified transforms (closed → open):
hero/heading rises ~450 (I had this); **nav panel `translateY` 450 → 0** (rises from below);
**inner content `translateY` −135 → 0** (≈−30% of the 450 panel — a parallax so the items trail
the panel). Implemented in `NavOverlay.tsx`: the panel root gets `translateY(open?0:100%)` and an
inner wrapper gets `translateY(open?0:-30%)`, both 0.65s house ease (disabled under reduced
motion). Verified on localhost: closed navRoot ty=450 / parallax ty=−135; open both 0 — **exact
match** to the live transforms.

**6c. Menu button hides in fullscreen.** Live: opening the fullscreen showreel slides the menu
button **down out of view** (wrapper `translateY` ~+199px). Implemented: lifted the showreel
fullscreen state to `App`, passed `hidden` to `MenuButton`, which now `translateY(200%)` +
`opacity:0` + `pointer-events:none` (0.65s) when the showreel is fullscreen. Verified: button
top 971 > viewport 900 (below the fold), opacity 0.

**6d. Mute/Close contrast.** Live: the controls live inside a **`mix-blend-mode: exclusion`**
layer (the same z7 layer as the cursor label), so the white labels invert against the video and
stay legible over light frames. Mine rendered plain white → invisible on bright frames. Fixed:
the controls container now has `mix-blend-mode: exclusion`. Verified: computed `mixBlendMode:
exclusion`.

## 7. Nav card geometry, Close contrast, scroll scope, right-panel page scroll — ✅ VERIFIED

**7a. Nav cards: `40vh` + border-radius 4px.** Measured across viewports (trusted input,
Playwright): item width = **360px at ALL widths 1280–1600 (h=900)** and **277.2px @ h=693** —
both are exactly **40vh** → the card scales with viewport HEIGHT, not width. Gap 35 / pad 35
constant. The thumbnail's clipping layer has **`border-radius: 4px; overflow: hidden`** (layer
`sc-e74a5d29-2`; the radius was missed earlier because it sits on a wrapper above the measured
one). Label→thumbnail gap 12px ✓. Implemented: `w-[40vh]`, `rounded-[4px]`. Verified localhost:
360 @ 900h, 277.2 @ 693h (= live), radius 4px.

**7b. "Close" label contrast (menu open) — disc claim CORRECTED in §8b.** First pass concluded
"no disc when open, blue on hover only". §8b re-verification by element id shows the open-state
disc is simply **renamed `#menu-close`** — it is blue `#3C4CC7` and **always present** (with and
without hover); the earlier "no disc" readings were query artifacts (looked up `#menu-open`,
truncated an HTML dump before the path). What stands from this pass: label `fill = isOpen ?
#FFF : #000` and the real label font **RecklessNeue-Book 16px** (verified live; was
NeueHaasGrotesk in the recon).

**7c. Nav scroll scope — NO CHANGE (live behaves the same).** Reviewer expected the nav not to
scroll when the pointer is outside it. Tested on the ORIGINAL with trusted input (Playwright
`page.mouse.move`): with the menu open, settling the row fully right (tx −1360), then generating
mouse moves ONLY at the top-left of the viewport (y=60, far outside the 450px nav) → the row
returned to 0. **The live site scrolls the nav from pointer moves anywhere in the viewport**
(window-scoped handler). The recon matches live; per the fidelity rule it was not changed.
(One-line change if the reviewer still prefers nav-scoped scrolling.)

**7d. Right panel page scroll (short viewports).** Verified live: the content column is
`flex column; justify-content:center; padding:100px 0 68px; min-height:100vh` and the page
scrolls when content exceeds the viewport (live @1366×693: docH 751 → scrolls 58px; @1440×900:
docH 900 → no scroll). The **video panel is `position:sticky; top:0; 100vh`** — it stays pinned
while the content scrolls (video top stayed 0 during live scroll). My recon's
`desktop:fixed inset-0 overflow-hidden` clamp prevented ALL scroll → on short screens the lead
and CTAs were cut off. Restructured `SplitCanvas` (no fixed; right `min-h-screen` natural
height; left `sticky top-0 h-screen self-start`) and `Hero` (`min-h-screen` instead of
`h-full`). Verified localhost: @1440×900 heading 166–533 / lead 576–691 / CTA 732–766 —
**pixel-exact = live**; @1366×693 docH 749 (live 751), scrolls 56px (live 58), video top stays
0 while scrolling (sticky ✓), nav card 277.2 (= live).

## 8. Scroll scope (reviewer decision), thumbnail zoom, menu-disc correction — ✅ VERIFIED

**8a. Nav scroll scoped to the nav panel — REVIEWER DECISION.** The reviewer twice directed that
the row must scroll only while the pointer is over the nav. (My trusted-input test on the
original suggested window-scoped behaviour, but two of this session's own live readings proved
to be measurement artifacts (§7b/§8b), so the reviewer's direct observation wins.) Implemented:
`onMove` ignores events with `clientY` above the nav panel's top. Verified localhost: moves above
the nav leave the row frozen (stayed at right end); moves inside drive it normally.

**8b. Menu button disc — ALWAYS present (correction of §7b).** Re-verified on the original in
real Chrome by element id: closed = `#menu-open` terracotta; **open = `#menu-close` blue
`#3C4CC7`, opacity 1, present with AND without hover**. The §7b "disc disappears when open
un-hovered" was a query artifact (searched the old id; truncated HTML dump). Restored the
always-rendered disc with `fill = isOpen ? #3C4CC7 : #C38133` (as originally built). Verified
localhost: open + pointer away → blue disc + white "Close" visible.

**8c. Thumbnail hover zoom-out (+ the "border difference").** Found the actual styled-components
rule in the live runtime CSSOM:
`@media (hover:hover) and (pointer:fine) { .ckMkXW:not([disabled]):hover .sc-e74a5d29-0 { transform: scale(1) } }`
— the zoom layer **rests at `scale(1.03)`** and zooms **out to `scale(1)` on item hover**
(`transform 0.65s` house ease; also `:focus-visible`). This rest-zoom is also why the card edges
read slightly differently vs my flat recon (the image bleeds ~1.5% past the 4px-radius clip).
Implemented: `.nav-thumb-zoom` layer inside the 4px clip (rest 1.03 → `.dot-host:hover` 1.0,
0.65s, media-gated). Verified localhost: hovered item `matrix(1,…)`, neighbours `matrix(1.03,…)`.

## 9. Rotor direction (top-down hover-in) + Menu↔Close toggle transition — ✅ VERIFIED

**Method.** Frame-sampled the rotor's **inline GSAP transform string** on the original via rAF
(`g.style.transform`) — this exposes the exact pose values and tween frames.

**9a. Two hidden poses; hover-in is TOP-DOWN (reviewer was right).** The tucked label has TWO
poses, selected by which viewport half the pointer is on:
- pointer on the RIGHT (content) half → hidden ABOVE: `translate3d(0,20px,0) rotate(-20deg) scale(0.85)`
- pointer on the LEFT (video) half → hidden BELOW-LEFT: `translate3d(0,-20px,0) rotate(170deg) scale(0.85)`
Hover/open → `(0, 70deg, 1)`. From the common (right-half) approach the sweep is **−20°→70° —
the word arrives from the top, downward**, exactly as the reviewer described. My recon only had
the 170° pose (always rising bottom-up) — fixed with a `pointerSide` listener choosing the
hidden pose. Measured tween ≈682ms decelerating → `transform 0.65s` house ease (MEDIUM ±30ms).
Verified localhost: pointer right → `(+20px,−20°,.85)`; pointer left → `(−20px,170°,.85)`;
hover → `(0,70°,1)` @0.65s. (This also unifies the P3 "cursor-reactive" observation — those
were the two hidden poses.)

**9b. Menu↔Close toggle transition.** Frame-sampled the click on the original: the **label text
swaps instantly** (the text node is replaced; black↔white fill instant) while the **disc fill
crossfades terracotta↔blue over ~480ms (0.5s, no delay)**; the rotor holds 70° (hovered).
Recon: moved the disc fill into `style` to guarantee the CSS `fill 0.5s` transition; verified
crossfade frames (intermediate `rgb(79,83,178)` → `rgb(60,76,199)`), instant white "Close". ✅

## 10. Scroll zone = thumbnails row only; rotor never bottom-up; button hover pulse — ✅ VERIFIED

**10a. Nav scroll restricted to the thumbnails row (REVIEWER DECISION).** The §8a gate (whole
nav panel) still activated the scroll in the zone below the row (Follow us / Menu button area).
Per the reviewer, the scroll may react ONLY while the pointer is inside the thumbnails row.
Implemented: `onMove` returns unless `clientY` is within the row's bounding rect (the
`overflow-x` UL). Verified localhost (row 450–715): inside-right → max; **below the row
(y=820, menu-button zone) → frozen**; above the nav → frozen; inside-left → 0.

**10b. Rotor: never bottom-up (REVIEWER DECISION).** §9a implemented both live hidden poses
(side-dependent); approaching from the left half then made the label arrive bottom-up
(170°→70°), which the reviewer ruled out: it must ALWAYS arrive top-down. Implemented: the
hidden pose is always the TOP pose `(+20px, −20°, .85)`; hover-in is always −20°→70° (top-down)
and hover-out retracts upward. (Deviation from the live left-half pose, by reviewer order;
documented in the component.) Verified localhost: pointer on the video half → still the top
pose.

**10c. Button hover "pulse" (+ label riding along).** Frame-sampled the original's svg scale:
hover-in **1 → overshoot ≈1.0563 → settles 1.05**; hover-out **1.05 → undershoot ≈0.9937 → 1**
(elastic; GSAP spring). A second click while hovered adds nothing — the perceived click-pulse is
this elastic hover grow/settle. The label follows because it lives inside the scaled svg.
Implemented: svg `scale(hovered ? 1.05 : 1)` with a back-out bezier
`cubic-bezier(0.34,1.56,0.64,1)` (~13% single overshoot ≈ measured; MEDIUM approximation of the
spring), 0.65s. Verified localhost: hover → `scale(1.05)` with the overshoot bezier; rotor and
label ride inside.

## 11. Intro "BiA. first" sub-sequence + Menu/Close label colour crossfade — ✅ VERIFIED

**11a. Intro wordmark: "BiA." first, then the rest.** MOTION_AUDIT §A1 already specified it
("'BiA.' visible first (~0–200ms) → 'Powered by FRONT ROW' draws/reveals left→right"), but the
recon wiped the whole wordmark at once. Live re-measure (initScript rAF sampler from t=0,
viewport 1366): the wordmark svg renders **319px** wide; `path.letter-bia` = the left **88px
(27.6%)**, `g.powered-by` starts at **118px (37%)**. The svg starts positioned so **"BiA." is
self-centered** on the viewport (x=634), then **slides left ~118px (≈700ms eased)** to x=516 so
the FULL wordmark centres, while the rest reveals. Loader scale = 319/144 ≈ **2.215** (replaces
the earlier 1.8 estimate). Reimplemented `IntroLoader` A1 as two stacked clipped copies of the
logo SVG: A1a "BiA." band fades in (0.2s) → A1b rest band clip-wipes left→right (0.7s) + wrap
slides `(0.5 − 0.276/2)·W` to full-centre, then A2/A3 as before (A2 @1.0, A3 @1.3). Verified
localhost (introspeed sampler): BiA band clip `inset(0 72.4% 0 0)`, rest mid-reveal
`inset(0 33% 0 37%)`, rendered width **319 = live**, slide settles at dxFull, ends at header
(144px). `__introEffectRuns` still 1.

**11b. Menu/Close label COLOUR crossfade.** Frame-sampled the original's toggle re-querying the
node each frame (the earlier "instant swap" capture had held a stale node): the label TEXT swaps
instantly, but the **new label inherits the previous colour and eases to its own over ≈477ms**
— Close→Menu starts `rgb(255,255,255)` → `rgb(0,0,0)`; Menu→Close starts black → white — in
step with the disc's terracotta↔blue 0.5s crossfade (contrast always preserved). Implemented:
label `fill` moved to `style` with `transition: fill 0.5s ease` on the persistent `<text>` node.
Verified localhost: opening, "Close" starts `rgb(0,0,0)` → mid `rgb(212,212,212)` → settles
`rgb(255,255,255)`. ✅

## 12. Scroll-back-to-start, overflow-x fix, Follow-us icons — ✅ VERIFIED

**12a. Nav scroll returns to the start on leave (REVIEWER DECISION).** When the pointer leaves
the thumbnails row, the row now lerps back to `scrollLeft 0` (Home first) instead of freezing.
Verified localhost: settle right (1340) → pointer below the row → returns to 0.

**12b. Page overflow-x at the bottom-right (cursor label).** Root cause: the cursor-follow
"Play showreel" layer (`fixed inset-0`) lived INSIDE the App's nav-shift wrapper; when the nav
opens the wrapper gains a `transform`, which makes descendant `fixed` elements position against
the wrapper — the label translated past the right edge then stretched the page (x scrollbar).
`css.css` has no `overflow-x:hidden` (checked: only textarea/.screen-reader-only) — the original
avoids it STRUCTURALLY: its exclusion layer is a body-level sibling of the content. Copied that:
the layer is now PORTALED to `<body>` (`createPortal`). Verified localhost (nav open, pointer at
1436×885): `scrollWidth 1440 = clientWidth` → **no x overflow**; layer present at body level.

**12c. Follow-us icons + styling.** Two real defects: (1) the local SVG files were **swapped**
(`social-instagram.svg` held the 15×16 LinkedIn glyph and vice-versa — live: Instagram 15×15,
LinkedIn 15×16); (2) the files are **white-filled**, and the recon applied `invert` — rendering
them black on the black nav (= "missing"). Also the label/geometry was off. Fixed: files
swapped back, `invert` removed; label = NHaasGroteskTXPro **12px/500/uppercase/14.4** (was
16px); container `gap 16px` @ right 60 / bottom 64; links = **50×32 flex-centred** hit areas,
adjacent (gap 0); icons rendered 14px. All values measured live. Verified localhost: computed
styles match; **pixel test: Instagram 132/132 and LinkedIn 196/196 opaque pixels are white** —
both icons visible on the black panel.

## 13. Intro separator + hold timing; click press-pulse; y-scroll lock — ✅ VERIFIED

**13a. Intro: the "BiA. | …" separator line + longer hold.** The logo SVG contains a
**`rect.vertical-line` (x=166, 2×58)** at **31.1%** of the wordmark — exactly between my two
clip bands (BiA 0–27.6%, rest 37%–100%), so the separator never appeared. Fixed: the REST band
now starts at **29%** (covers the line + powered-by; the 27.6–29% sliver is empty). Timing: live
frame-sampling shows "BiA." holds alone **≈0.45–0.55s** before the rest starts (mine started at
0.2s — too early, as the reviewer noticed). Re-anchored offsets: A1a fade 0.25s → **A1b at
0.55s** (0.7s reveal+slide, ends 1.25) → A2 at 1.4 (lands ≈1.85 ≈ live 1.82) → A3 at 1.9.
Verified localhost: rest band starts `inset(0 71% 0 29%)`, hold ≈387ms sampled (≈0.3s after the
fade completes), reveal 698ms.

**13b. Click press-pulse (full spring resolved).** Frame-sampled the original around
mousedown/up: **DOWN → the button eases to `scale(0.9375)`** (~0.35s decelerating); **UP →
springs back to 1.05 with an overshoot to ≈1.064** and a small undershoot. Implemented: a
`pressed` state (pointerdown/up/leave); scale = pressed ? **0.9375** : hovered ? 1.05 : 1;
press transition `0.35s` house ease, release `0.65s` back-out bezier (its computed peak
0.9375 + 1.13·Δ ≈ **1.0646** matches the measured 1.064). Verified localhost: down → 0.9375,
up → springs to 1.05. (The §10c hover grow remains; clicking now visibly pulses.)

**13c. No y-scroll while the menu is open.** Live: opening the nav sets **`body { overflow:
hidden }`** (html stays `visible`), blocking user scrolling while the menu is open (re-enabled
on close). Copied: `App` toggles `document.body.style.overflow = navOpen ? "hidden" : ""`.
Verified localhost @1366×693 (doc 749): nav open → body `hidden`; closed → `visible`.

## 14. Social-chip outlines + nav-over-content stacking — ✅ VERIFIED

**14a. Follow-us icon borders.** The live "border" is an **`outline: 1px solid var(--color-white)`**
(outlines don't appear in computed `border` — why §12c missed it). Full live rules copied
(`.efuxuq a`): black chip `min-width 3.125rem; height 2rem; padding 0.56rem 0.88rem;
outline 1px solid white` (mobile base 2.5rem/1.88rem); **hover → `filter: invert(1)` +
`outline-color: black`** (white box, black icon), media `(hover:hover)` gated; same on
`:focus-visible/:active`; the icon row has `transform: translateY(2px)`. Implemented as
`.social-chip` in `globals.css` + `translate-y-[2px]` on the UL. Verified localhost: chip 50×32,
`outline rgb(255,255,255) solid 1px`, padding 8.96/14.08, ul ty(2); real hover →
`filter: invert(1)`, outline black. ✅

**14b. Content covering the nav's top (short viewports).** With the page scrolled to the top and
the menu open at a short viewport, the shifted content (bottom ≈299) overlaps the nav's top
(243) by ~56px; my recon painted the CONTENT over the nav (content z-10 > nav z-0). Live
verified: content wrapper `z:1`, **nav `z:8`** — `elementFromPoint` in the overlap band returns
a nav element → the NAV paints on top. Fixed: `NavOverlay` → `z-20` (above content z-10, below
MenuButton z-40 / fullscreen z-60; inert when closed since the panel is `translateY(100%)`
off-screen). Verified localhost @1366×693: probe in the overlap band → inside the nav. ✅

## 15. Fullscreen slide transition + phrase return + rotor exit direction — ✅ VERIFIED

**15a. Showreel fullscreen open/close transition.** Frame-sampled the live mechanism: the video
is **ALWAYS viewport-sized (100vw×100vh, object-cover)** inside a stage (`eVBLXd`) resting at
**`translateX(−25vw)`** (−360px @1440 — shows the video's central band in the left half; the
white cell paints over the right overhang). Fullscreen = the stage slides to **0** (≈0.65s house
ease); close = back to −25vw. The video never resizes/remounts. Restructured `ShowreelSlot`
accordingly (stage div + transition; removed the instant class swap) and re-stacked
`SplitCanvas` (white section z-10 above video z-0).

**15b. White layer + phrase choreography (the "phrases animation").** Live layers: the white
background (`JGffg`) slides `translateX(100%)` on OPEN **in sync** with the video (geometric
fit: its left edge always trails the video's right edge) and **snaps back only at the END of
the close** (~0.8s); the content block (`ecfgvy`) is `opacity:0; translateX(20%)` while
fullscreen and on close **fades/slides back (≈0.4s ease) starting ≈0.43s after Close — over the
still-receding video**. Implemented: SplitCanvas white-bg layer (`translateX(100%)`, transition
0.65s on open / `transform 0s 0.65s` snap on close) + Hero root opacity/translateX with the
0.43s-delayed return. Verified localhost: open → stage −360→0, hero op→0, bg→712.5 in sync;
close → stage →−360, **hero op 0→1 delayed**, bg snaps 0 at end; final state muted/restored.

**15c. Rotor hover-out exits DOWNWARD (REVIEWER DECISION).** On hover-out the label now sweeps
**down** (70°→170°, 0.65s — the live bottom pose) instead of retracting upward; after the sweep
it **snaps (transition off, hidden behind the disc)** back to the top pose (−20°) so the next
entrance always arrives top-down. Verified localhost: leave → `rotate(170deg)` with 0.65s
transition; +900ms → `rotate(-20deg)` with `transition: none`.

## 16. Fullscreen x-overflow ("rest of the right field" visible) + close fluidity — ✅ FIXED

**Defect.** During fullscreen the page gained a **676px horizontal scroll area** (docW 2027 vs
client 1351): the white-bg layer translated `100%` (and the hero at `20%`) extended past the
page's right edge — scrolling revealed a white band ("o restante do campo direito"). The same
overflow collapsing at the snap caused the non-fluid close (scrollbar/layout jolt).

**Fixes (live-faithful).**
1. The white section now **clips** its translated layers (`overflow-hidden` — live clips them
   inside the cell). → fullscreen x-overflow gone.
2. The video stage now uses the **live percentage scheme verbatim**: width = page width (200% of
   the half-width section = clientWidth, like the live cell) and `translateX(-25%)` of its own
   width (live `eVBLXd` value) instead of `100vw/−25vw` — also removes the 15px scrollbar-gutter
   overhang.
3. White-bg snap-back re-timed to **0.8s** (= live ≈801ms, right after the phrase fade completes)
   instead of 0.65s.

**Verified localhost @1366×693.** Rest: video x=−338 (−25% of 1351), docW=clientW. Fullscreen:
video covers 0..1351, **docW = clientW (no x scroll at all)**; y-scroll keeps the sticky video
pinned (top 0) — only the showreel is visible, like live (live does NOT lock body scroll in
fullscreen — verified — the sticky stage covers everything). Close: bg snaps at 0.8s after the
delayed phrase fade-in; final state restored (x=−338, hero opacity 1, re-muted, playing).

## 17. Right-panel typography audit + CTA box anatomy — ✅ VERIFIED

**17a. Fonts: proven identical (no change needed).** Reviewer suspected wrong fonts. Evidence:
local `NHaasGroteskDSPro-55Rg.woff2` is **byte-identical to live** (same sha256); canvas
fingerprints match exactly (`WE BUILD` @86.4px = 385.6 on both; RecklessNeue 208.1; TXPro 62.5);
all five headline lines are **pixel-identical** to live by Range measurement (same x/right/
width/centre to 0.1px at 1366); lead/CTA-label computed styles identical; `fonts.css` matches
the original `@font-face` verbatim (incl. `font-display`). The perceived difference came from
the two real deviations below.

**17b. Top-bar size: fixed 10px (was a fluid over-fit).** Live = **10px/12px at both 1366 and
1440**; my `calc(7px+0.208vw)` (a single-viewport derivation) gave 9.84px @1366. Fixed to
`text-[10px] leading-[12px]`.

**17c. CTA pair anatomy (the "border spacing" difference).** Live structure: each button is a
**110px-wide box, padding `11px 13.2px 10px`, line-height 13.2 → outer 34.2**, with the 1px
border drawn on an **absolute inner layer**, and the second button **overlapping the first by
−1px** (`margin-left:-1px`) — the divider is two superimposed borders, not a missing left
border. Mine was `flex h-[34px]` with `border-l-0` on the second. Rebuilt: inline-block 110px,
`px-[13.2px] pt-[10px] pb-[9px]` (1px less than live's paddings since my border sits on the box
— same 34.2 outer + same label position) + `-ml-px` on Contact. Verified vs live (same method):
**110×34.2 ✓ · overlap 1px ✓ · pair total 219 ✓ · label top offset 10 = 10 ✓**.

## 18. Close "collision" (video strip on the right) + nav↔hero 1px shift — ✅ FIXED

**18a. Showreel close: no video on the right (corrects §15b/§16 snap timing).** A live mid-close
SCREENSHOT settles it: during the close the right half is **white immediately** — the receding
video shows only in the LEFT half, and the phrases fade in over the WHITE background. (The
earlier "white bg snaps at ~0.8s" reading was timing skew between the sampler mark and the real
click; visually the bg is back at close start. Structurally: live's white-bg layer `JGffg` is
clipped inside the right cell `jdKXpS` (z:1, overflow-x hidden) which sits ABOVE the video — so
the video's right overhang is never visible once the bg is back.) Fixed: the recon's white bg
now returns with `transition: none` (instant) on close. Verified by recon mid-close screenshot:
right half clean white at ~120ms, video confined to the left — the reviewer's "showreel strip on
the right" is gone.

**18b. Nav↔hero spacing: live shifts −449, not −450.** Measured the live content wrapper's
computed transform with the menu open: **`translateY(-449px)`** @900 viewport — exactly **1px
less than the 450px panel height** (hence the reviewer's "smaller spacing": live gap CTA→nav =
133 vs my 134). Fixed: `NAV_SHIFT = calc(max(450px, 50vh) - 1px)`. Verified: recon ty −449,
gap 133 = live. (Nav internal spacing was already exact: panel-top → first item = 36px both.)

## 19. Menu-label idle attract loop + font preloads — ✅ VERIFIED

**19a. Idle attract loop (reviewer-spotted, frame-sampled live).** Until the FIRST pointer
interaction, the live label plays a hover-in/out cycle on its own: swing in **−20°→70°**
(0.65s) at ≈0.45s after the reveal → hold ≈2.4s → swing out **70°→170°** (0.65s) + the
invisible snap to −20° → again every **≈3.03s** (bursts measured at 2910/5940/8938ms). The
loop stops permanently on the first hover. Implemented in `MenuButton` (interval driver using
the existing visible/exit poses; killed by `pointerenter`/`pointerdown`/open). Verified recon:
bursts −20→70 @2347, →170 @5378, snap @6094, →70 @8408, →170 @11438 (Δ≈3.03s = live); after a
real hover → **zero further attract bursts**.

**19b. Lead/top-bar fonts: proven identical; FOUC closed with preloads.** Reviewer reported the
lead ("We shape the future…") and top-bar ("Certified shopify plus partner") fonts wrong.
Evidence of identity: **all five woff2 files are byte-identical to live (sha256)**; rendered
Range widths equal (top-bar **181.1px = 181.1px**; lead block equal ±0.5px); identical computed
family/size/weight/letter-spacing/smoothing (`RecklessNeue-Book 24/28.8 −0.24px`;
`NHaasGroteskTXPro 10px/500/uppercase`). The remaining real-world cause of "wrong font" is the
**fallback flash**: with the original's `font-display: swap` and no preload, a slow first load
briefly renders Helvetica/Georgia (most visible during the intro). Fixed: `<link rel="preload"
as="font">` for the four primary woff2 files in `index.html`. (Live itself has no preloads —
this closes the flash window that makes the recon LOOK wrong on cold loads.)

## 20. Nav row top spacing: 4vh (not 36px) + DotLabel baseline fix — ✅ VERIFIED

**Defect (reviewer).** With the menu open, the nav row sat lower in the recon than live (the
top margin looked bigger). Two causes found:
1. **The row's top padding is `4vh`, not a fixed 36px** — live measures **30.72px @768 and
   36px @900, both exactly 4vh** (my `pt-9` only coincided at 900-high viewports, sitting the
   row ~5–8px low on shorter screens). Fixed: `pt-[4vh]`.
2. **+2px of baseline offset from `display:inline-flex`** on `DotLabel` inside the link's line
   box (live's label container is a block-level grid). Fixed: `.dot-label` → `display:flex`.

**Verified localhost:** nav-top → label gap = **30.72 = 4vh @768** and **36 = 4vh @900**
(pixel-exact, matching live's 30.7/36); label height 19.2 unchanged; the shared Close/Mute
controls unaffected (x48 / bottom 48 / gap 32). (Also re-checked: the label→thumbnail gap is
12px on BOTH sites — an earlier 9.5px reading was the thumbnail zoom layer's scale(1.03)
shifting the measured box, not a spacing difference.)

## 21. RecklessNeue stylistic sets (the different g/y letterforms) — ✅ VERIFIED

**Defect (reviewer).** Same font, different LETTERFORMS: live's lead renders alternate glyphs
(curved-tail single-story **y** in "by", single-story **g** in "delivering/captivating"); the
recon rendered the default two-story forms.

**Root cause.** The live CSS enables OpenType stylistic sets on every RecklessNeue-Book usage:
**`font-feature-settings: "ss04", "ss06", "ss07", "ss10", "ss14"`** (verified computed on the
lead AND the curved Menu/Close label; the rule ships in each Reckless styled-components class).
My recon inherited only the global `"kern"`.

**Fix.** `.font-serif-lead { font-feature-settings: "ss04","ss06","ss07","ss10","ss14" }` in
`globals.css` + the same on the MenuButton `<text>`. **Verified:** computed FFS matches live on
both elements; before/after crops (`docs/diffs/lead-live.png` / `lead-recon.png` /
`lead-recon-fixed.png`) show the recon now renders the identical alternate g/y glyphs.

## 22. Top-bar weight: proven identical; close reveal = staggered line "writing" — ✅ VERIFIED

**22a. Top-bar ("Certified shopify plus partner") weight.** Evidence of identity: both sites
fetch **`NHaasGroteskTXPro-65Md.woff2`** and show the **500 face `loaded` / 400 `unloaded`**;
identical computed (10px/500/normal ls/kern/antialiased/uppercase); same rendered width (181.1);
crops differ only by JPEG quantisation at 10px. The perceived weight delta is the load-time
fallback flash, already minimised by the §19b preloads. **No change** (nothing measurably
differs).

**22b. Showreel-close reveal: line-by-line "writing", not a slide.** Reliable re-sampling of the
live close (the earlier capture was inconclusive): during fullscreen all five `[data-line]`s are
**`visibility: hidden`**; on close they flip back **one by one, top-down, at 396/463/546/612/
696ms (≈75ms stagger), with NO transform** — combined with the container fade (§15b). My
implementation slid the whole block (`translateX(20%)` transition) — wrong; removed. Implemented:
`linesShown` state in `Hero` — fullscreen hides all lines; close schedules the measured
staggered visibility flips; the container keeps only the delayed opacity fade.
**Verified recon:** fullscreen → all 5 hidden; close → flips at 537/604/670/754/837 (same ≈75ms
top-down cadence; the ~140ms absolute offset is click-to-mark measurement latency, equal in
both probes); hero transform stays **`none`** (no slide); fade completes at 1.

## 23. Close-reveal chronology: lead and CTAs AFTER the headline — ✅ VERIFIED

**Defect (reviewer).** §22b gated only the headline lines; the lead/CTAs (fading with the
container from 0.43s) became visible BEFORE the middle/lower headline lines. Order must be
top-down chronological.

**Live evidence (checkVisibility sampling + inline-flip capture).** The top-bar and the lead
have their OWN visibility flips: top-bar ≈ line0+~100ms; **lead ≈ line4+~100ms (measured 741 in
a run where line4=640)** — i.e. the lead really does follow the whole headline. The CTAs showed
no own flip on live (container fade only); REVIEWER DECISION: they must follow the lead
chronologically → gated ≈70ms after it.

**Implemented (`Hero`).** `partsShown` state: fullscreen hides top-bar/lead/CTA row (with the
lines); close flips: lines 396…696 (top-down) → top-bar 500 → **lead 800** → **CTAs 870**.

**Verified recon (one run, same ~180ms method latency on every value):** lines 575/659/741/800/
916 (strictly top-down) → topbar 693 → **lead 978 (after the last line)** → **CTA 1057 (last)**;
fullscreen hides all. ✅

## 24. Nav-open showreel click closes the menu; thumbnail image rendition — ✅ VERIFIED

**24a. Menu open + showreel click = close the menu.** Verified live: with the nav open,
clicking the (shifted) video area **closes the nav and does NOT open fullscreen** (no Close
button appears). Implemented: `ShowreelSlot` receives `navOpen`/`onCloseNav`; its click handler
closes the nav and returns when the menu is open. Verified recon: nav open + video click →
`aria-expanded=false`, no fullscreen, no controls; nav closed + click → fullscreen with sound
as before.

**24b. Thumbnail text looked crisper/thinner than live.** Cause: live serves the nav thumbnails
through `_next/image` at the **384px bucket, q=80** (naturalWidth ≈359–384) — the downscaled
JPEG/PNG re-encode softens the text inside the images (the "slightly grey, heavier" look). My
recon used the full-resolution originals (1500–6000px) downscaled by the browser → crisper/
thinner glyphs. Fixed by downloading the live optimizer's actual 384/q80 outputs for all seven
desktop thumbnails over the local files (same filenames; PNG/JPEG magic verified). Verified
recon: `naturalWidth 384×203` on all — same rendition as live.

## Final state
`typecheck` ✅ · `build` ✅ (only the pre-existing hls.js chunk-size hint) · console
**0 errors / 0 warnings** · intro runs once. All behaviours verified in-browser against the live
original (or to reviewer-ordered deviations, marked as such).
