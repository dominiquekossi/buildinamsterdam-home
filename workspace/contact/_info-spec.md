# `/contact` — INFO Column Spec (Fase 1, medição LIVE)

> Sessão CONTACT, **somente a coluna INFO** ("Get in touch", order:2, sticky, à direita). Medição read-only no LIVE `www.buildinamsterdam.com/contact` — aba em foco, sub-pixel, computed, DPR1, altura 900. Widths: **1024 / 1440** (+ **1680/1920** p/ a escala fluida do H1). **buildId `_MsCuqDt4GbkeAFMyjWlP`** (igual às fases anteriores). NÃO medido: galeria, cursor, NavOverlay, MenuButton, animações, hover. **Nada implementado.**

---

## 1. Container da coluna INFO  (`div.sc-cd0cb232-0`)

| Propriedade | @1024 | @1440 | @1920 |
|---|---|---|---|
| position / top | `sticky` / `0px` | idem | idem |
| order | 2 | 2 | 2 |
| display / flex-direction | `flex` / `column` | idem | idem |
| **justify-content** | **`center`** (bloco centrado vertical nos 900px) | idem | idem |
| height / width | 900 / 512 | 900 / 720 | 900 / 960 |
| **padding-left** | **92.16px** | **129.6px** | **172.8px** |
| padding top/right/bottom | 0 / 0 / 0 | idem | idem |
| box-sizing | border-box | — | — |

- **`padding-left` = 9vw exato** (92.16/1024 = 129.6/1440 = 172.8/1920 = 0.09). Demais paddings = 0. **Largura útil do conteúdo** = `larguraColuna − 9vw` = `0.41·vw` → **419.84 @1024 / 590.41 @1440 / ~787 @1920**.
- **Sticky é INERTE/decorativo**: a página não rola (`scrollHeight===innerHeight===900`), então o `sticky top:0` nunca se desloca — `infoY` permanece 0. A coluna já é full-height (900). Reproduzir o valor é fiel, mas funcionalmente é estático.
- **Alinhamento vertical = centrado** (`justify-content:center`). O bloco (H1 + 5 blocos + FOLLOW US) é centrado nos 900px: top-gap @1440 = (900−683.06)/2 = **108.47**; @1024 = (900−721.86)/2 = **89.06**. Como o bloco é mais alto @1024 (FOLLOW US quebra em 2 linhas, +38px), o H1 começa **mais acima** @1024 → o y do H1 NÃO é fixo, decorre do centro.

**Estrutura DOM (filhos flex diretos do container):**
```
info.sc-cd0cb232-0  (sticky, flex col, justify-center, pad-left 9vw)
├─ h1 wrapper .sc-42a5a972-0           (margin-bottom 60px)
├─ div .sc-cd0cb232-2                  (flex column, gap:56px — blocos 1–5)
│    ├─ block .sc-713ab7b7-0  (Start a project)
│    ├─ block .sc-713ab7b7-0  (Just Say 'Hi')
│    ├─ block .sc-713ab7b7-0  (Join our team)
│    ├─ block .sc-713ab7b7-0  (Give us a call)
│    └─ block .sc-713ab7b7-0  (Visit Us)
├─ h2 .sc-42a5a972-0  "Follow us"      (margin-top 56px, margin-bottom 5.6px)
└─ ul .sc-cd0cb232-4                   (socials — flex-wrap, gap 16px 48px)
```

---

## 2. H1 "Get in touch"  (`h1` em `.sc-42a5a972-0`)

| | @1024 | @1440 | @1680 | @1920 |
|---|---|---|---|---|
| font-family | RecklessNeue-Book, Helvetica, Arial, sans-serif | — | — | — |
| font-weight | 400 | 400 | 400 | 400 |
| **font-size** | **36px** | **36px** | **37.8px** | **39.6px** |
| line-height | 57.6px (1.6) | 57.6 (1.6) | 60.48 (1.6) | 63.36 (1.6) |
| letter-spacing | −0.36px (−0.01em) | −0.36 | −0.378 | −0.396 |
| color | #000 | — | — | — |
| text-transform | none | — | — | — |
| margin-bottom | 60px | 60px | — | — |
| x / y (rect) | 604.16 / 89.06 | 849.59 / 108.47 | — / — | 1132.8 / — |

- **Piso 36px confirmado em ≤1440** (36 @1024 e @1440).
- **Escala fluida >1440 — DERIVADA (3 pontos: 36 / 37.8 / 39.6):**
  > **font-size = 36px · max(1, 0.7 + 0.3·(vw / 1440))**
  > equivalente: **max(36px, calc(25.2px + 0.75vw))**
  - Verificação: @1680 → 36·(0.7+0.3·1680/1440) = 36·1.05 = **37.8** ✓ · @1920 → 36·1.1 = **39.6** ✓.
  - **Importante:** é a MESMA função de escala `s(vw)=max(1, 0.7+0.3·vw/1440)` que o projeto já usa no topbar/CTA da home (CLAUDE.md "FLUID above 1440"), aplicada à base 36px.
  - **line-height = 1.6 (em-based)** e **letter-spacing = −0.01em** — ambos ESCALAM com o size (não fixar px): lh 57.6→63.36, tracking −0.36→−0.396.
- **Margem até o 1º bloco** = `margin-bottom:60px` do H1 (H1.bottom + 60 = 1º label). Medido 60px @1024 e @1440 (>1440 não verificado).

---

## 3. Os 6 blocos rotulados (topo→base)

**Label pequeno (H2)** — todos: `NHaasGroteskTXPro, 500, line-height 19.2px (1.2em), letter-spacing normal, text-transform UPPERCASE, color #000`. Nó: `h2.izYFrf` (blocos 1–5) / `h2.beVkuk` (Follow us). O texto no DOM é mixed-case; o **uppercase é via CSS** (`text-transform`). **font-size = 16px PISO ≤1440, FLUIDO >1440** pela mesma `s(vw)=max(1, 0.7+0.3·vw/1440)` do H1: `max(16px, calc(11.2px + 0.33333vw))` (medido 16/16.8/17.6 @1440/1680/1920). lh 1.2em ESCALA; tracking permanece `normal`.

**Link de ação** — ⚠️ CORRIGIDO (a leitura anterior pegou o `<a>` wrapper, que herda `NeueHaasGrotesk-Roman 16px` mas **NUNCA pinta glifo**). O texto visível é pintado por um **nó interno** (`A > div.sc-1f088082-0 > div.sc-af2a3ede-0 (grid 2 spans) > span.sc-af2a3ede-2 > div.sc-42a5a972-0`) em: **`RecklessNeue-Book (= font-serif-lead), 400, 19px PISO fluido >1440 (s(vw): max(19px, calc(13.3px + 0.39583vw))), line-height 1.2em (22.8px), letter-spacing −0.01em (−0.19px), color #000`**. (Idêntico nos 4 sociais.)
- **HOVER (medido, NÃO inerte):** CSS transition, curva-CASA `cubic-bezier(0.45,0.02,0.09,0.98)`, transform-only (sem reflow), `<a>` em si inerte (sem cor/underline):
  - texto (span2) desliza **+15.36px à direita** em **0.25s**;
  - quadrado **terracota #C38133** de **9.59×9.59px** (span1, oculto em repouso: opacity 0 + translateX 5.76) **aparece**: opacity 0→1 + translateX 5.76→0 em **0.1s**.
  - offsets (15.36 / 9.59 / 5.76) são **px FIXOS** (não escalam >1440); reduced-motion → `transition:none` (o live tem `@media (prefers-reduced-motion){transition:none}`).
- Label→link: `h2 margin-bottom: 5.6px` (fixo, não escala).

| # | Label (texto DOM) | Link (texto) | **href EXATO** | y label @1440 | y link @1440 | y label @1024 |
|---|---|---|---|---|---|---|
| 1 | Start a project | Contact form | `https://www.buildinamsterdam.com/contact-form` | 226.06 | 253.03 | 206.66 |
| 2 | Just Say 'Hi' (aspas curvas ' ') | hello@buildinamsterdam.com | `mailto:hello@buildinamsterdam.com` | 329.64 | 356.61 | 310.23 |
| 3 | Join our team | jobs.buildinamsterdam.com | `https://jobs.buildinamsterdam.com/` | 433.22 | 460.19 | 413.81 |
| 4 | Give us a call | +31 (0)20 223 00 66 | `tel:+31 (0)20 223 00 66` *(href contém espaços literais)* | 536.80 | 563.77 | 517.39 |
| 5 | Visit Us | Baarsjesweg 285-286 \| 1058 AE Amsterdam | `https://g.page/build-in-amsterdam` | 640.38 | 667.34 | 620.97 |
| 6 | Follow us | (linha de 4 sociais — ver §4) | — | 743.95 | 770.92 | 724.55 |

*(y do link @1024 = y label + 26.97.)*

**Ritmo vertical (FIXO em px, idêntico nos dois widths):**
- **103.58px** label→label (medido: [103.57, 103.58, 103.58, 103.58, 103.58] em 1024 **e** 1440).
- Mecanismo: wrapper dos blocos 1–5 (`sc-cd0cb232-2`) é `flex column` com **`gap: 56px`**; cada bloco tem **47.58px** de altura = **label-line 19.2 + h2 margin-bottom 5.6 + link-line 22.8** (link = Reckless 19px·1.2em) → 47.58 + 56 = **103.58**. O FOLLOW US (fora do wrapper) fica 56px abaixo via `margin-top:56px` no h2 → mesmo ritmo.
- **Escala >1440:** `gap 56` e `margin-bottom 5.6` são px FIXOS, mas os line-boxes (label/link) escalam pela s(vw) → o pitch CRESCE: **103.58 ≤1440 → 105.68 @1680 → 107.78 @1920** (medido no live). (A nota anterior "não escala" valia só ≤1440.)

---

## 4. FOLLOW US (o único reflow 1024↔1440)

- **Lista**: `ul.sc-cd0cb232-4`, `display:flex`, **`flex-wrap: wrap`**, **`gap: 16px 48px`** (row-gap **16px**, column-gap **48px**), width = largura útil (419.84 @1024 / 590.41 @1440), max-width none. Itens são `<li>` (sem `margin`), o gap do flex faz todo o espaçamento.
- **Itens (texto + href exato):**

| Item | href EXATO |
|---|---|
| Instagram | `https://www.instagram.com/buildinamsterdam/` |
| Facebook | `https://www.facebook.com/buildinamsterdam` |
| Twitter | `https://twitter.com/buildinams` |
| LinkedIn | `https://www.linkedin.com/company/build-in-amsterdam/` |

- **Separadores: NENHUM.** Sem vírgula/bullet/`::before`/`::after` (afterContent/beforeContent = `none`). A separação é só o **column-gap 48px**.
- **Reflow @1024 (confirmado):** Linha 1 = **Instagram / Facebook / Twitter** (y≈752); Linha 2 = **LinkedIn** (y≈790, volta ao x da esquerda). @1440 e @1920 os 4 ficam em 1 linha.
  - **Mecanismo:** `flex-wrap` + largura útil `0.41·vw`. Soma dos 4 itens + 3 gaps ≈ 82+48+79+48+58+48+73 = **436px**. Quebra quando `0.41·vw < 436` → **vw < ~1063px**. @1024 (419.84 < 436) → LinkedIn cai pra 2ª linha; @1440 (590.41 > 436) → 1 linha. (Larguras dependem da fonte; ~1063px é o ponto aproximado de quebra.)

---

## 5. Tipografia/cor consolidada (computed LIVE → candidato no Tailwind do projeto)

| Papel | Computed (LIVE) | Candidato Tailwind (só reporte) |
|---|---|---|
| H1 título | `RecklessNeue-Book` 400, 36px(piso), lh 1.6em, −0.01em | `font-serif-lead` (= RecklessNeue-Book) |
| Label (H2) | `NHaasGroteskTXPro` 500, 16px PISO (fluido >1440: max(16px, calc(11.2px+0.33333vw))), uppercase, lh 1.2em | `font-ui` + `font-medium` + `uppercase` (= NHaasGroteskTXPro) |
| Link de ação (texto visível) | `RecklessNeue-Book` 400, 19px PISO (fluido >1440: max(19px, calc(13.3px+0.39583vw))), lh 1.2em, tracking −0.01em, #000 — pintado por nó interno, NÃO o `<a>` | `font-serif-lead` (= RecklessNeue-Book) |
| Cor (tudo) | `#000000` | `text-black` |
| Fundo coluna | transparente sobre branco da página | `#FFFFFF` (`white`) |

As 3 famílias batem com as registradas em `tailwind.config.ts` / `fonts.css`. **Não decidir mapeamento ainda — só reporte.**

---

## Divergências / refinamentos vs inventário (`_inventory.md`)
1. **H1 fluido — fórmula derivada (nova):** `36px · max(1, 0.7+0.3·vw/1440)` = `max(36px, 25.2px+0.75vw)`; lh `1.6em` e tracking `−0.01em` ESCALAM. Inventário só tinha "36px piso, 39.6@1920".
2. **Alinhamento vertical (novo):** `justify-content:center` — o bloco é centrado nos 900px; o y do H1 varia por width (89@1024 / 108@1440) por causa da altura do bloco (FOLLOW US quebra @1024). Inventário listava y's absolutos sem o mecanismo.
3. **Ritmo (refino):** **103.58px** = `gap:56px` (flex, no wrapper dos blocos 1–5) + bloco ~47.58. Fixo px nos dois widths. Inventário dizia "~103px" sem o mecanismo.
4. **Sticky (novo):** `position:sticky; top:0` porém **inerte** (página não rola).
5. **FOLLOW US (refino):** mecanismo = `flex-wrap` + `gap 16px/48px`, **sem separadores**, quebra ≈vw<1063. Inventário confirmava o reflow mas não o gap/mecanismo.
6. **Label→link:** `margin-bottom:5.6px` no h2 (offset 26.97px). Padding da coluna confirmado **9vw**. H1 `margin-bottom:60px`.
7. **href do LinkedIn (atenção):** na coluna INFO o FOLLOW US LinkedIn = `https://www.linkedin.com/company/build-in-amsterdam/` (www, com barra). NÃO confundir com o LinkedIn do **NavOverlay** (`https://nl.linkedin.com/company/build-in-amsterdam`, sem www, sem barra) — destinos DIFERENTES. (NavOverlay fora de escopo; só sinalizo.)
8. **Sem contradições** com o inventário; tudo confirmado, o resto são adições/refinos.

**FIM — PARAR e aguardar OK. Nada implementado.**
