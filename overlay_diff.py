#!/usr/bin/env python3
"""Pixel-perfect overlay-diff harness for /cases (LIVE vs BUILD).

Repeatable validation tool. Usage:
  1. Capture two full-viewport PNGs at the SAME viewport (1024x768) + DSR1,
     with the page FROZEN to a static base grid. In the Playwright session, on
     EACH page (live + build) run this in the console before screenshotting:

       for (let i=1;i<200000;i++){try{cancelAnimationFrame(i)}catch(e){}}      // stop auto-pan rAF
       const s=document.createElement('style');
       s.textContent='*,*::before,*::after{animation:none!important;transition:none!important}';
       document.head.appendChild(s);
       document.querySelectorAll('*').forEach(e=>{const t=getComputedStyle(e).transform;
         if(t&&t!=='none')e.style.setProperty('transform','none','important');});           // reset to base grid
       document.querySelectorAll('a[href^="/case/"] img').forEach(im=>im.style.setProperty('opacity','1','important'));

     Save as overlay-live-1024.png and overlay-build-1024.png.
     NOTE: the global transform:none reset can reveal off-screen/hidden panels in
     the LOWER half differently per site -> trust the TOP ROW (in-viewport cards),
     or prefer per-card crops (boxes below) for the cleanest comparison.

  2. python overlay_diff.py
"""
from PIL import Image, ImageChops
import numpy as np

LIVE, BUILD = "overlay-live-1024.png", "overlay-build-1024.png"

def stats(diff, box=None):
    d = diff.crop(box) if box else diff
    a = np.asarray(d).astype("int16").max(axis=2)   # per-pixel max-channel delta
    return {"mean": round(float(a.mean()), 2),
            "pct>16": round(float((a > 16).mean() * 100), 2),
            "pct>32": round(float((a > 32).mean() * 100), 2),
            "max": int(a.max())}

def main():
    live = Image.open(LIVE).convert("RGB")
    build = Image.open(BUILD).convert("RGB")
    assert live.size == build.size, f"size mismatch {live.size} vs {build.size}"
    diff = ImageChops.difference(live, build)

    print("OVERALL:", stats(diff))
    # First-row card boxes at base grid, 1024x768 (x, y, x2, y2). Adjust per layout.
    cards = {
        "vitra (x0)":        (0, 0, 230, 307),
        "suitsupply (x265)": (265, 0, 495, 346),
        "polaroid (x529)":   (529, 0, 759, 307),
        "alpine (x794)":     (794, 0, 1024, 346),
    }
    for name, box in cards.items():
        print(f"{name:20s}", stats(diff, box))

    # Visual outputs
    diff.point(lambda p: min(255, p * 4)).save("overlay-diff-1024.png")   # 4x heatmap
    Image.blend(live, build, 0.5).save("overlay-blend-1024.png")          # 50/50 overlay
    print("wrote overlay-diff-1024.png, overlay-blend-1024.png")

if __name__ == "__main__":
    main()
