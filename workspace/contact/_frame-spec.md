# `/contact` — Frame Spec (Passo 0 + Fase 1)

> Sessão CONTACT, **apenas a página `/contact`** (o `/contact-form` está FORA de escopo). Esta tarefa = RECONHECER o workspace + MEDIR o esqueleto/frame no LIVE. **Nada implementado.** Régua = `www.buildinamsterdam.com/contact`. Medições: aba focada, sub-pixel, computed, DPR1, altura travada 900, viewport emulado **1024** e **1440**. buildId LIVE: `_MsCuqDt4GbkeAFMyjWlP`.
>
> ⚠️ Guard-rail: a página USA mas **não modifica** `layout/` e `shared/` (HeaderLogo, MenuButton, NavOverlay, DotLabel). Se algo exigir mudar um compartilhado → PARAR e perguntar.

---

## PASSO 0 — Reconhecimento do workspace (read-only)

Projeto = reconstrução "golden" da **home** da BiA. Stack: **Vite + React 18 + TS (strict) + Tailwind 3**. Não é Next.js (o LIVE é). Raiz: `workspace/`.

### Roteamento / padrão de página
- **Sem biblioteca de router.** `src/App.tsx` faz um **switch por pathname** com full page loads (sem navegação client-side):
  ```tsx
  const path = window.location.pathname.replace(/\/+$/, "");
  return path === "/cases" ? <CasesPage /> : <HomePage />;
  ```
- `HomePage` é definido **dentro de** `App.tsx`. Páginas não-home são **componentes próprios** em `src/components/<page>/` e plugadas no switch (precedente: `/cases` → `src/components/cases/CasesPage.tsx`).
- **`/contact` hoje cai no fallback → renderiza `<HomePage />`** (ainda não existe rota contact).
- Entry: `src/main.tsx` → `createRoot(...).render(<App/>)`, importa `./styles/globals.css`. **StrictMode omitido de propósito** (evita double-invoke do IntroLoader).

### Organização de componentes (page vs layout/ vs shared/)
```
src/
  components/
    layout/   → HeaderLogo.tsx · MenuButton.tsx (+ .css) · NavOverlay.tsx   (shell/nav)
    shared/   → DotLabel.tsx                                                (primitivos reutilizáveis)
    home/     → SplitCanvas · Hero · ShowreelSlot · IntroLoader             (só da home)
    cases/    → CasesPage.tsx                                               (só do /cases)
  motion/     → homeEntrance.ts (utilitários de motion não-componente)
  styles/     → globals.css (importa fonts.css) · fonts.css
  assets/     → SVGs interativos via SVGR (?react)
public/       → images/ icons/ videos/ fonts/   (logos vivem em icons/)
artifacts/    → READ-ONLY fonte de verdade
docs/         → PHASE3_FINDINGS.md, MOTION_AUDIT.md
```
Regra (CLAUDE.md + guia §6–7): componentes de página em `src/components/<page>/`, reutilizáveis em `shared/`, shell/nav em `layout/`. Estilo via **utilitários Tailwind inline** nos componentes (sem CSS por componente, salvo MenuButton.css). **Sem `<svg>` inline em .tsx** — SVG estático via `<img>` de `public/`; SVG interativo via SVGR de `src/assets/`.

### Como a HOME monta os shared (padrão a espelhar)
`App.tsx` (HomePage) e `cases/CasesPage.tsx` montam o shell **identicamente**:
```tsx
<NavOverlay open={navOpen} />                                  {/* atrás do conteúdo */}
<div className="relative z-10 [--nav-shift:399px] min-[1280px]:[--nav-shift:calc(max(450px,50vh)-1px)]"
     style={{ transform: navOpen ? 'translateY(calc(-1*var(--nav-shift)))' : 'none',
              transition: 'transform 0.65s cubic-bezier(0.45,0.02,0.09,0.98)' }}
     onClick={navOpen ? closeNav : undefined}>
  {/* corpo da página (na home: SplitCanvas; em cases: <main>) */}
  <HeaderLogo />                                               {/* sobe junto com o wrapper */}
</div>
<MenuButton isOpen={navOpen} onClick={toggleNav} revealed /> {/* FORA do wrapper → fixo no fundo */}
```
- Estado: `navOpen` (toggle/close), `useEffect` trava `document.body.style.overflow="hidden"` enquanto o menu abre.
- **APIs dos shared** (props):
  - `HeaderLogo` — **sem props**. `header.fixed left-0 top-0 z-50 px-[2vw] py-[30px] mix-blend-exclusion` > `<a href="/">` > `<img src="/icons/bia-logo.svg" w=534 h=60 className="w-36">` (=144px). (Rebuild usa `<img>`; o LIVE usa `<svg>` inline.)
  - `MenuButton` — `{ onClick?, isOpen?, revealed?=true, hidden? }`. Wrapper `.mb-wrap fixed bottom-[33px] left-1/2 z-40`. Visual/timing no `MenuButton.css` via `data-*`; gráfico SVGR `@/assets/menu-button.svg?react`.
  - `NavOverlay` — `{ open }`. `nav.fixed bottom-0 left-0 z-20 h-[400px] w-full overflow-hidden bg-black min-[1280px]:h-[max(450px,50vh)]`, `aria-hidden={!open}`, `translateY(open?0:100%)` 0.65s house. 7 itens (`DotLabel`) + "Follow us".
- **z-stack do rebuild** (baixo→topo): conteúdo `z-10` < NavOverlay `z-20` < MenuButton `z-40` < HeaderLogo `z-50`. (Ordem preserva o LIVE; valores absolutos diferem — ver Fase 1 item 6.)

### Tailwind config (`tailwind.config.ts`) + `globals.css`
- **Cores** (todas já existem — nenhum token novo p/ contact): `white #FFFFFF` · `black #000000` · `off-white #F2EFE6` · `dark-gray #231F20` · `light-gray #3E3739` · `grey #B3B3B3` · `blue #3C4CC7` · **`terracotta.DEFAULT #C38133`** · `terracotta.2020 #BA7160`. (espelhadas em CSS vars `--color-*` no `:root`.)
- **Fontes** (registradas em `fonts.css` via `@font-face`, mapeadas no config): `font-display`=NHaasGroteskDSPro · `font-ui`=NHaasGroteskTXPro (400/500) · `font-serif-lead`=RecklessNeue-Book (+italic) · `font-body`=NeueHaasGrotesk-Roman. Body global = NeueHaasGrotesk-Roman 16px. Util `.font-serif-lead` liga os stylistic sets `ss04/06/07/10/14`.
- **Breakpoints / fluido**:
  - Único `screen` nomeado: `desktop: 769px`. Demais breakpoints são **variantes arbitrárias inline** — `min-[1280px]:` (o "degrau 1280") e `min-[768px]:`.
  - Larguras fluidas **NÃO** vivem no config — são expressas como **valores arbitrários / `calc`/`max`/`vw` inline** (ex.: `px-[2vw]`, `[--nav-shift:calc(max(450px,50vh)-1px)]`, `text-[max(16px,calc(11.2px+0.33333vw))]`). Padrão fluido da home (CLAUDE.md): `s(vw)=max(1, 0.7+0.3·vw/1440)` acima de 1440 (topbar/CTA).
  - `letterSpacing.headline=-0.04em`, `lineHeight.headline=0.85`, `borderRadius.none=0`.

### Caminho proposto para `/contact` (PROPOR, não criar)
1. **Shell da página**: `src/components/contact/ContactPage.tsx` — espelhando `cases/CasesPage.tsx` (mesmo padrão NavOverlay+wrapper+HeaderLogo+MenuButton).
2. **Sub-componentes da página** (galeria, coluna info): `src/components/contact/` (nomes a definir na fase de build — ex. `ContactGallery.tsx`, `ContactInfo.tsx`).
3. **Registro de rota** em `src/App.tsx` — estender o switch:
   ```tsx
   if (path === "/cases") return <CasesPage />;
   if (path === "/contact") return <ContactPage />;   // novo
   return <HomePage />;
   ```
4. **Tokens/fontes/shared**: nenhum novo necessário (reusar). **Heads-up**: `globals.css` tem `html,body{height:auto}` → o contract de "não rola" (item 1) precisará de lock a nível de página/contêiner (`height:100vh + overflow:hidden`), pois o LIVE trava em `html/body`. (Decidir na fase de build; **não tocar** o reset compartilhado sem aprovação.)

---

## FASE 1 — Contrato do frame (LIVE), medido @1024 e @1440

### 1. Mecanismo "não rola"
`scrollHeight === innerHeight (900)` e `scrollWidth === innerWidth` em ambos os widths. Produzido por:
- **`html`**: `height:900px` (=100vh), **`overflow-x:hidden` + `overflow-y:hidden`**, `width:100%`.
- **`body`**: `height:900px` (=100vh), **`overflow:hidden` (ambos eixos)**, `position:relative`, `width:100%`.
- Contêineres internos (`#__next` → `#main` → `section` → grid) são todos `height:100%` (=900px) e **`overflow:visible`** — o overflow da galeria é clipado pelos próprios wrappers internos dela, nunca empurra a raiz. → **O lock está em `html`+`body` (altura = viewport + overflow hidden).**

### 2. Contêiner raiz da section
- `#main` (`div.sc-69d4811d-0`): `position:relative`, `height:100%`(900), `width:100%`, `overflow:visible`, **`z-index:1`** ← raiz de posicionamento/empilhamento do conteúdo.
- `section` (`sc-231592f4-0`): `position:relative`, full-bleed (x0, w=vw), `height:900`, **`max-width:none`**, `overflow:visible`, `z-index:auto`.

### 3. Grid 50/50
- Grid (`div.sc-231592f4-1`, filho da section): `display:grid`, **`grid-template-columns: 720px 720px` @1440 / `512px 512px` @1024** (= `1fr 1fr`), **`column-gap:normal` / `row-gap:normal` → SEM gap de grid**. `height:900`.
- (O gap **34px** visto no inventário é **interno à célula da galeria**, não do grid.)
- **Ordem DOM vs visual (importante)**: a **coluna info é o 1º filho no DOM** com **`order:2`** → renderiza à **direita** (`position:sticky`, x720/x512). A **galeria é o 2º filho** com **`order:1`** → renderiza à **esquerda** (`position:static`, x0). `grid-column:auto`, `direction:ltr`. (Conteúdo-primeiro no DOM, invertido visualmente via `order`.)

### 4. "Rail" esquerdo + HeaderLogo
- **Não é uma coluna estrutural** — é só a "pegada" (shrink-to-fit) do header do logo. Wrapper `div.sc-d6217fba-0`: `position:absolute`, x0 y0, `height:900`, **width = 144 + 2·(2vw)** → **201.59px @1440 / 184.94px @1024**, `z-index:auto` (dentro de `#main` z1).
- **HeaderLogo** (`header#awwwards-paragraph`, `sc-ea59293f-0`): `position:sticky` (top:0 left:0), `display:flex`, **`mix-blend-mode:exclusion`** ✅, **padding `30px` (V) / `2vw` (H = 28.8@1440 / 20.48@1024)**, **`z-index:3`**, `pointer-events:none`. Logo = `<svg>` inline, **144px de largura fixa** (x=2vw, y≈30→32), link `href="/"` (`pointer-events:auto`, clicável).

### 5. Montagem dos shared fixos (só posição/tamanho/z — sem animação)
- **NavOverlay** (`nav.sc-ff8673df-0`): `position:fixed`, `bottom:0 left:0`, `width:100%`, **`height:450px @1440 / 400px @1024`** (degrau min-1280: `<1280`=400 fixo; `≥1280`=`max(450,50vh)`), **`z-index:8`**, `overflow:hidden`, `pointer-events:none`, `visibility:visible`, `opacity:1`. **Estacionado abaixo da dobra** via `transform:translateY(panelHeight)` (450@1440 / 400@1024) → box em y900. ⚠️ **sem `aria-hidden`** no LIVE (fechado).
- **MenuButton** (wrapper fixo `div.sc-ed9e62d2-0`): `position:fixed`, `bottom:0 left:0`, `width:100%`, `height:136.8px`, **`z-index:8`**, `pointer-events:none`, `display:flex`, **`justify-content:center` + `align-items:flex-end`** → disco centralizado embaixo. Disco (`button`): **104×108**, `position:static`, x668@1440 / x460@1024 (centrado), y763.2 (base ~28.8px acima do fundo).

### 6. Stack de z-index dos nós do frame (baixo → topo)
| z | nó | posição | obs |
|---|----|---------|-----|
| **1** | `#main` (raiz do conteúdo) | relative | contém section + grid (galeria `static` / info `sticky`, ambos z auto) + rail absoluto (z auto) |
| **3** | HeaderLogo `header` | sticky | dentro de `#main` |
| **7** | wrapper do cursor (`fixed`) | fixed | portal interno (`#cursor-portal-renderer`) `absolute` z auto, `pointer-events:none` |
| **8** | NavOverlay | fixed | |
| **8** | MenuButton (barra fixa) | fixed | mesmo z da nav, mas **depois no DOM** → pinta por cima |

### Tabela-resumo do contrato (1024 / 1440)
| Item | @1024 | @1440 |
|------|-------|-------|
| scrollH / scrollW | 900 / 1024 | 900 / 1440 |
| lock não-rola | html+body `height:900` + `overflow:hidden` | idem |
| #main | relative, 900h, **z1** | idem |
| section | relative, full-bleed, `max-width:none`, 900h | idem |
| grid-template-columns | **512px 512px** | **720px 720px** |
| grid gap | nenhum | nenhum |
| info column | 1º DOM, `order:2`, **sticky**, x512 w512 | order:2, sticky, x720 w720 |
| gallery cell | 2º DOM, `order:1`, static, x0 w512 | order:1, static, x0 w720 |
| rail (footprint logo) | abs, w**184.94**, h900 | abs, w**201.59**, h900 |
| HeaderLogo | sticky, mix-blend:exclusion, pad 30/**20.48**, z3 | pad 30/**28.8**, z3 |
| logo width | 144px | 144px |
| NavOverlay h / z | **400px** / z8, translateY(400) | **450px** / z8, translateY(450) |
| MenuButton | barra fixed full-w z8, disco 104×108 @x460 | disco @x668 |
| cursor wrap z | 7 | 7 |

---

## (c) Divergências entre o medido agora e o inventário (Fase 1 anterior)
1. **Grid: novo detalhe** — a inversão DOM/visual é via **`order` (info `order:2`, galeria `order:1`)**; info é o **1º filho no DOM** (o inventário só dizia "info sticky à direita"). Confirma 50/50 sem gap de grid.
2. **NavOverlay height** — inventário (só @1440) registrou parking `translateY(450)`. Refinado: **400px @1024 / 450px @1440** (degrau min-1280), parking = `translateY(altura do painel)`.
3. **Mecanismo não-rola** — agora identificado o CSS que produz: **`html`+`body` `height:100vh`+`overflow:hidden`** (inventário só constatara `scrollH===innerH`).
4. **"Rail" esquerdo** — não é coluna estrutural; é a **pegada do header do logo** (`abs`, `144 + 4vw` → 184.94/201.59). HeaderLogo padding = **30px / 2vw** (não medido antes).
5. **Stack z completo** — adicionados `#main z1` (raiz do conteúdo) e **cursor wrap z7** entre HeaderLogo(3) e NavOverlay/MenuButton(8). Inventário só tinha nav/menu z8 e logo z3.
6. **Sem divergências de contradição** — tudo o que o inventário afirmou (grid 50/50, max-width none, sticky info, z8 nav/menu, blend exclusion, não-rola) **confirmou-se**; as mudanças acima são refinamentos/adições ao nível de build, não correções.

> **Nota de build (heads-up, não-ação):** o rebuild não tem o lock de viewport (`globals.css: html,body{height:auto}`); a `/contact` precisará reproduzir `height:100vh + overflow:hidden` num contêiner de página — sem alterar o reset compartilhado sem aprovação. Os valores absolutos de z do rebuild (10/20/40/50) preservam a ordem do LIVE (1/3/7/8).

**FIM — PARAR e aguardar OK. Nada implementado.**
