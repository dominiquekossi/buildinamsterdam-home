#!/usr/bin/env python3
"""Regenerate ONLY the narrow-source /cases covers at higher resolution.

Replicates the (now-absent) gen-webp.mjs behaviour: resize the staged source
(public/cases-assets/<name>) preserving aspect ratio, encode webp q=80.
The object-position crop is applied in CSS (not baked), so this is a pure resize.

Targets: 1x = 512px wide, 2x = 1024px wide (matches the live's ~512px decode).
Safety gate: before overwriting, downscale the source to the CURRENT webp size and
compare to the existing file; only proceed if they match (correct slug->source map).
"""
import os
from PIL import Image, ImageChops
import numpy as np

ASSETS = "workspace/public/cases-assets"
OUT = "workspace/public/images"
Q = 80
W1X, W2X = 512, 1024

# slug -> staged source filename
SRC = {
 "x-bionic":"xbionic-cycling.jpg",
 "foam-platform":"mous-lamrabat.jpg",
 "x-bionic-terraskin":"xbionic-terraskin-trail-running.jpg",
 "klabu":"hibo-en-hani-from-somalia.jpg",
 "roger-vivier":"roger-vivier-express-campaign.jpg",
 "secrid":"secrid-cover.jpg",
 "foam-talent-2021":"foam-talent-2021.jpg",
 "stellar-development":"stellar-development-hero.jpg",
 "moooi":"moooi-milan-design-week-2024.webp",
 "alpine":"alpine-earplugs-photography.jpg",
 "ace-and-tate":"ace-and-tate-portrait.jpg",
 "ark8":"elden-ring-campaign-by-ark8.jpg",
 "rocycle":"rocycle-staged-set.jpg",
}

def mean_diff(a, b):
    a = a.convert("RGB"); b = b.convert("RGB").resize(a.size)
    return float(np.asarray(ImageChops.difference(a, b)).mean())

print(f"{'slug':20s} {'mapcheck':10s} {'old 1x':10s} -> {'new 1x':10s} {'new 2x':10s}")
rows = []
for slug, fn in SRC.items():
    src = Image.open(os.path.join(ASSETS, fn))
    cur1x_path = os.path.join(OUT, f"{slug}.webp")
    cur = Image.open(cur1x_path)
    cw, ch = cur.size
    # safety gate: source resized to current size should resemble the current webp
    md = mean_diff(cur, src)
    ok = md < 28
    if not ok:
        print(f"{slug:20s} MISMATCH({md:.1f})  -- SKIPPED (verify mapping)")
        continue
    sw, sh = src.size
    h1 = round(W1X * sh / sw)
    h2 = round(W2X * sh / sw)
    im1 = src.resize((W1X, h1), Image.LANCZOS)
    im2 = src.resize((W2X, h2), Image.LANCZOS)
    im1.save(cur1x_path, "WEBP", quality=Q, method=6)
    im2.save(os.path.join(OUT, f"{slug}@2x.webp"), "WEBP", quality=Q, method=6)
    print(f"{slug:20s} ok({md:4.1f})   {cw}x{ch:<6} -> {W1X}x{h1:<6} {W2X}x{h2}")
    rows.append((slug, W1X, h1, W2X, h2))

# Emit casesCovers.ts entries for the regenerated cards (to paste/update)
print("\n--- new casesCovers dims ---")
for slug, w, h, w2, h2 in rows:
    print(f'  "{slug}": w:{w} h:{h} w2:{w2} h2:{h2}')
