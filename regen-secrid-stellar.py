#!/usr/bin/env python3
"""Regenerate secrid + stellar-development covers from the live's LANDSCAPE sources.
Same pipeline as regen-narrow-webp.py: resize preserving source AR, webp q=80.
1x = 512px wide, 2x = 1024px wide. Crop into the card box is CSS (object-fit:cover)."""
import os
from PIL import Image

ASSETS = "workspace/public/cases-assets"
OUT = "workspace/public/images"
Q, W1X, W2X = 80, 512, 1024

SRC = {
 "secrid": "secrid-cover-desktop.jpg",
 "stellar-development": "stellar-development-desktop.jpg",
}

print(f"{'slug':22s} {'source WxH':14s} -> {'1x':10s} {'2x':10s}")
rows = []
for slug, fn in SRC.items():
    src = Image.open(os.path.join(ASSETS, fn)).convert("RGB")
    sw, sh = src.size
    h1, h2 = round(W1X * sh / sw), round(W2X * sh / sw)
    src.resize((W1X, h1), Image.LANCZOS).save(os.path.join(OUT, f"{slug}.webp"), "WEBP", quality=Q, method=6)
    src.resize((W2X, h2), Image.LANCZOS).save(os.path.join(OUT, f"{slug}@2x.webp"), "WEBP", quality=Q, method=6)
    print(f"{slug:22s} {str(sw)+'x'+str(sh):14s} -> {W1X}x{h1:<6} {W2X}x{h2}")
    rows.append((slug, W1X, h1, W2X, h2))

print("\n--- new casesCovers dims ---")
for slug, w, h, w2, h2 in rows:
    print(f'  "{slug}": w:{w} h:{h} w2:{w2} h2:{h2}')
