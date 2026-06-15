# `/contact` — Cursor custom + hover de links (Fase 1: verificar rebuild + medir live)

> Read-only no LIVE `www.buildinamsterdam.com/contact`. Aba `visible` (capturado em toda amostra), sub-pixel, computed. Widths 1024 e 1440. buildId `_MsCuqDt4GbkeAFMyjWlP`. **Nada implementado.** Escopo: cursor custom (#cursor-portal-renderer) + afordância de hover nos LINKS da coluna INFO.

## TL;DR (3 destaques)
- **(a) Cursor no rebuild:** **NÃO existe** cursor custom global. Só há o label "Play showreel" do `ShowreelSlot.tsx` (home-only, portal no body). Sem `#cursor-portal-renderer`, sem componente/portal de cursor em `layout/`/`shared/`, sem `cursor:none`.
- **(b) Modelo de seguimento (live /contact):** **N/A — não há cursor custom ativo na /contact.** O `#cursor-portal-renderer` existe mas fica **VAZIO** (0 filhos) sobre links, galeria, sociais e espaço vazio (real + sintético, 1024 e 1440). O cursor **nativo NÃO é escondido** (`body`/`html cursor: auto`).
- **(c) Hover sobre link INFO:** a afordância é o **cursor NATIVO `pointer`** (do `<a href>`). O **link é INERTE** — sem mudança de cor/underline/escala/transform/`::after`. **Não muda nada no cursor custom** (ele não renderiza aqui). Sem diferença entre links de info e sociais (todos inertes, pointer nativo).

> ⚠️ **CORREÇÃO do inventário:** a Fase 1 inicial afirmou "a única afordância de hover é o cursor custom (cursor-portal-renderer)" — **INCORRETO**. Medição dedicada: a afordância é o **cursor nativo `pointer`** + link inerte; o portal custom está **dormente** na /contact.

## PASSO 0 — Rebuild (read-only)
- `grep cursor|portal|createPortal` em `src/`: **nenhum** cursor custom global. Único portal: `ShowreelSlot.tsx` (`createPortal` → `<body>`) = label "Play showreel" que segue o ponteiro (mix-blend exclusion), **específico do showreel da home**, não um cursor global.
- `globals.css`: só `button,label{cursor:pointer}` (padrão). **Sem `cursor:none`.**
- ⇒ O cursor custom global do live **não existe** no rebuild. (Se for construído, é provável **componente global** — `layout/` ou `App.tsx` — decisão do reviewer; guard-rail: não mexer em shared sem OK.)

## FASE 1 — Live /contact

### 1. Cursor custom — repouso e movimento
- `#cursor-portal-renderer` (`div.ichMw`): `position:absolute`, `pointer-events:none`, `mix-blend:normal`, 1440×900 (cobre o viewport), **0 filhos / innerHTML vazio** em repouso.
- `body cursor: auto`, `html cursor: auto` → **cursor nativo VISÍVEL (não escondido).**
- **Trajetória** (warmup contínuo + parar sobre 6 alvos: empty-top, contact-form, mailto, gallery-img, follow-instagram, empty-right; sintético) → o portal **nunca populou** (`portalEverPopulated:false`, 0 filhos em todos). Scan global por elemento "cursor-like" (fixed/absolute, pointer-events:none, ≤200px): **nenhum**.
- Hover **REAL** (chrome-devtools, ponteiro de verdade) sobre "Contact form" → portal **vazio**, nenhum elemento de cursor.
- ⇒ **Modelo de seguimento: não aplicável** — não há cursor custom renderizando na /contact. (O portal é uma camada global dormente; presumivelmente usada por outros contextos, ex. showreel da home — fora de escopo.)

### 2. Hover nos links da INFO
- Sobre "Contact form" (real + sintético), 1024 e 1440: `cursor: pointer` (nativo do `<a href>`). **Link inerte:** `color rgb(0,0,0)`, `text-decoration: none`, `transform: none`, `opacity: 1`, `::after content: none` — **nada muda no hover**.
- Cursor custom: **sem mudança** (continua vazio). Nenhum label/seta/escala/cor.
- **Info links vs sociais (FOLLOW US):** sem diferença — todos `<a>` com pointer nativo, inertes.

### 3. Transição default↔hover
- **N/A** — não há cursor custom para transicionar. A única mudança é o cursor do SO (seta `auto` → mão `pointer`), que é **nativo do browser**, não animado pelo site. Sem WAAPI/CSS/rAF envolvido.

## Conclusão / implicação para o build
- A **/contact NÃO usa cursor custom** nem afordância de hover além do **`pointer` nativo** + **link inerte**.
- O rebuild **já corresponde**: os links da INFO são `<a href>` simples → o browser aplica `cursor:pointer` por padrão (igual ao live), e os links não têm estilo de hover. **Nada a construir para o cursor/hover da /contact.**
- O cursor custom GLOBAL (`#cursor-portal-renderer`) é uma peça de **outros contextos** (provável showreel da home); se/quando for construído, é decisão separada de shared/global — **fora do escopo da /contact**.

## Medições (computed, ambos os widths)
| | @1024 | @1440 |
|---|---|---|
| body / html cursor | auto / auto | auto / auto |
| link cursor | pointer | pointer |
| link color / decoration / transform | #000 / none / none | #000 / none / none |
| #cursor-portal-renderer filhos | 0 (vazio) | 0 (vazio) |
| cursor custom no hover de link | nenhum (portal vazio) | nenhum |
| elemento de cursor no DOM | nenhum | nenhum |

**FIM — cursor custom AUSENTE/dormente na /contact; afordância = pointer nativo + link inerte (rebuild já corresponde). PARAR e aguardar OK.**
