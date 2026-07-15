# Fonts (place licensed files here)

The original site self-hosts proprietary, licensed fonts. They are **not** included
in the artifacts. Drop the following files into this folder — the names must match
exactly so `src/styles/fonts.css` resolves them:

| File | Family | Weight | Used for |
|------|--------|--------|----------|
| `NHaasGroteskDSPro-55Rg.woff2` / `.woff` | NHaasGroteskDSPro | 400 | Display headline (`We build brands & …`) |
| `NHaasGroteskTXPro-55Rg.woff2` / `.woff` | NHaasGroteskTXPro | 400 | UI text |
| `NHaasGroteskTXPro-65Md.woff2` / `.woff` | NHaasGroteskTXPro | 500 | UI labels / buttons / badge |
| `RecklessNeue-Book.woff2` / `.woff` | RecklessNeue-Book | 400 | Lead serif paragraph |
| `RecklessNeue-BookItalic.woff2` / `.woff` | RecklessNeue-Book | 400 italic | (italic variant) |

`NeueHaasGrotesk-Roman` (body default) is referenced as a local/system font by the
original and has no self-hosted file; it falls back to Helvetica/Arial until provided.

Until these are added, the page renders with the Helvetica/Arial/Georgia fallbacks
declared in `tailwind.config.ts` and glyph metrics will not match the original exactly.
