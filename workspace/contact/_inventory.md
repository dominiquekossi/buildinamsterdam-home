# FASE 1 — Inventário (READ-ONLY) — `/contact` no LIVE

> Rascunho de inventário. Régua = LIVE. Medições em aba focada, sub-pixel, DPR1, altura travada 900, viewport emulado a **1024** e **1440** (+ sonda a 1920 para escala fluida). Nenhum arquivo do projeto tocado; nenhuma implementação. **PARAR após o relatório.**

## 0. Confirmação de rota

- `https://buildinamsterdam.com/contact` → **redirect para `https://www.buildinamsterdam.com/contact`** (apex → www). Sem outro redirect.
- Rota **real** Next.js: `__NEXT_DATA__.page = "/contact"`. `buildId = _MsCuqDt4GbkeAFMyjWlP`.
- `<title>` = "Contact | Build in Amsterdam"; `meta description` = "Get in touch"; `h1` = "Get in touch".
- **Página NÃO rola**: `scrollHeight === innerHeight === 900` em todos os widths. Layout full-viewport fixo.
- ⚠️ **O formulário NÃO está em `/contact`.** O CTA "Start a project → **Contact form**" é um link para **outra rota**: `https://www.buildinamsterdam.com/contact-form` (title "Contact Form | Build in Amsterdam", mesmo `buildId`, também não-rolável; o painel escuro do form rola internamente). A Seção C abaixo inventaria essa rota separada.

---

## A. Mapa de seções (`/contact`)

### Hierarquia DOM (só nós estruturais)
```
#__next  (1440×900)
└─ #main  div.kjMtqo  (full-bleed 1440×900)
   ├─ section.JQtER  (full-bleed 1440×900)  ← conteúdo da página
   │  ├─ div.kmdCFR  (rail esq., x0 w201.6 h900)
   │  │  └─ header#awwwards-paragraph  (sticky, z3, mix-blend:exclusion, w201.6 h80.2)
   │  │     └─ a[href="/"]  → HeaderLogo (SVG "BiA.", x28.8 y32.2, 144×17)
   │  ├─ div.hIAuwQ  (full-bleed 1440×900)  ← camada do grid
   │  │  ├─ [grid]  display:grid  grid-template-columns: 1fr 1fr
   │  │  │  ├─ célula esq. → galeria (2 trilhas de imagem)
   │  │  │  └─ célula dir. → div sticky/flex (x720 w720) = coluna info (padding-left 9vw)
   │  │  └─ ul.fNtOgV  → linha "FOLLOW US" (canto inf. dir.)
   │  └─ nav.RIRwC  (NavOverlay; fixed z8; 1440×450; estacionado y900 via translateY(450); pointer-events:none)
   ├─ div.fjxLZT  (wrapper MenuButton; fixed z8; barra full-width y763.2 1440×136.8; pe:none; flex-centra)
   │  └─ button.ibzlBB  (104×108, x668 bottom-center) → disco SVG #C38133 + DotLabel "Menu"
   ├─ div.lmiRHM  (overlay 1440×900) > #cursor-portal-renderer (absolute, pe:none) ← cursor custom
   └─ p#__next-route-announcer  (live region a11y)
```

### Blocos topo→base
A página é **2 colunas (50/50)**: **esquerda = galeria de imagens**, **direita = bloco "Get in touch"**. Tudo cabe em 1 viewport (sem scroll). Coordenadas medidas a 1440 / 1024.

| # | Bloco | Papel | Container | Bleed | y @1440 | y @1024 |
|---|-------|-------|-----------|-------|---------|---------|
| 1 | HeaderLogo "BiA." | logo / home | rail esq. sticky | contido | 32.2 | ~32 | 
| 2 | Galeria (col 1) | imagens (3) | célula grid esq. | contido (metade esq.) | trilha clipada | idem |
| 3 | Galeria (col 2) | imagens (3) | célula grid esq. | contido | trilha clipada | idem |
| 4 | H1 "Get in touch" | título | col. info (dir.) | contido | 108.5 | 89.1 |
| 5 | START A PROJECT + "Contact form"→/contact-form | label+link | col. info | contido | 226 / 253 | reflui |
| 6 | JUST SAY 'HI' + hello@buildinamsterdam.com (mailto) | label+link | col. info | contido | 329.6 / 356.6 | — |
| 7 | JOIN OUR TEAM + jobs.buildinamsterdam.com | label+link | col. info | contido | 433.2 / 460.2 | — |
| 8 | GIVE US A CALL + +31 (0)20 223 00 66 (tel:) | label+link | col. info | contido | 536.8 / 563.8 | — |
| 9 | VISIT US + Baarsjesweg 285-286 \| 1058 AE Amsterdam (→ g.page) | label+link | col. info | contido | 640.4 / 667.3 | — |
| 10 | FOLLOW US + Instagram/Facebook/Twitter/LinkedIn | label+linha de links | col. info | contido | 744 / 770.9 | wrap p/ 2 linhas @1024 |
| 11 | MenuButton (disco "Menu") | abrir menu | fixed bottom-center | — | 763.2 | 763.2 |
| 12 | NavOverlay (menu fechado) | navegação | fixed, abaixo da dobra | full-bleed | y900 (off) | y900 |

- **Coluna info (dir.)**: começa em x720 (=50%), texto inicia em **x849.6 @1440 / x604.2 @1024** (padding-left = **9vw**). Largura do texto 590.4 @1440 / 419.8 @1024.
- **Galeria (esq.)**: 2 trilhas verticais, cada uma **343 wide @1440 / 239 @1024**, gap **constante 34px**. 6 imagens retrato clipadas; trilhas com `translateY` de descanso assimétrico (col1 −711.5, col2 −620.7) → recorte escalonado (masonry). Não rola, não auto-anima (ver D).

---

## B. Componentes compartilhados (presentes; sem variação específica de contact)

| Componente | Presente | Seletor / posição | Detalhes | vs Home |
|-----------|----------|-------------------|----------|---------|
| **HeaderLogo** | ✅ | `header#awwwards-paragraph` (sticky, z3) > `a[href="/"]` SVG (viewBox 0 0 534 60) | fill `#FFFFFF` + **`mix-blend-mode: exclusion`** → lê escuro sobre a galeria clara. Wrapper `pointer-events:none` (o link em si é clicável). Top-left. | idêntico (mesmo tratamento blend) |
| **NavOverlay** | ✅ | `nav.RIRwC` (fixed, z8) | Estado **fechado**: estacionado abaixo da dobra via `translateY(450)`, `pointer-events:none`, `opacity:1`/`visible`. Contém 7 itens (Home/Work/Expertise/About/Contact/Join us/Knowledge) com thumb Storyblok cada + sub-nav "Follow us" (IG/LinkedIn). Thumbs em repouso `scale(1.03)` (zoom-out 1.03→1 no hover). ⚠️ **sem `aria-hidden`** no overlay fechado. | idêntico (menu compartilhado) |
| **MenuButton** | ✅ | `button.ibzlBB` (fixed bottom-center, z8, 104×108) | SVG: disco `path.ioDDHZ` fill **#C38133** + `<filter>` (gooey) + DotLabel. Hover → escala **1.0→1.05**. ⚠️ **sem nome acessível** (a11y tree mostra `button` vazio; label é SVG textPath, não exposto). | idêntico |
| **DotLabel** | ✅ | `g.hPmiX > text > textPath.kLWxjp` "Menu" dentro do disco | texto curvado num path, rotacionado ~70° (matrix 0.342/0.940), fill `#000`, 16px. | idêntico |

Conclusão: os 4 são as versões compartilhadas/home, **sem variação de cor/posição/label/estado** própria de contact. Única diferença é contextual (o blend do logo o faz aparecer escuro sobre as fotos claras à esquerda).

---

## C. Formulário — rota separada `/contact-form` (HubSpot)

> ⚠️ Peça mais espinhosa e **não é código próprio**: é um **formulário HubSpot embarcado** (`formsnext`), marca **"Front Row"** (matriz da BiA).

- **action** = `https://forms.hsforms.com/submissions/v3/public/submit/formsnext/multipart/9188263/7a08796b-62cc-4436-8f76-2383842ea945`
- **method** = `POST` · **id** = `hsForm_7a08796b-…` · **`noValidate=true`** (validação HTML5 desligada → validação JS do HubSpot). Portal **9188263**.
- **Layout**: split 50/50. **Esq.** = grade interativa de cadeiras sobre fundo claro; o painel esquerdo inteiro (720×900) é um `<button>` **"Play showreel"** (gatilho de showreel) + slider **"Sitting Time"** que é um **controle custom (NÃO é `<input type=range>`)**. **Dir.** = painel escuro **#231F20** com o form, **rolável internamente** (form ~955–1019px de altura, `overflow-y:scroll`).

### Campos (ordem DOM) — 16 no total
| # | Label | name | tipo | required | placeholder | autocomplete | obs |
|---|-------|------|------|----------|-------------|--------------|-----|
| 1 | Email* | `email` | email | ✅ | — | email (`inputmode=email`) | |
| 2 | First Name* | `firstname` | text | ✅ | — | given-name | |
| 3 | Last Name* | `lastname` | text | ✅ | — | family-name | |
| 4 | Company Name* | `0-2/name` | text | ✅ | — | — | campo de objeto Company do HubSpot |
| 5–8 | I'm interested in: | `services_interested_in__lead_` | checkbox (grupo multi) | ❌ | — | — | **D2C Strategy / Brand Strategy & Identity / Web Design & Development / Other** |
| 9 | Share your project details: | `message` | textarea | ❌ | — | — | |
| 10 | I want to stay informed about Front Row news. | `marketing_checkbox___forms` | checkbox | ❌ | — | — | opt-in marketing |
| 11 | I agree with the Privacy Policy.* | `LEGAL_CONSENT.subscription_type_11493439` | checkbox | ✅ (via JS; `required`=false no HTML) | — | — | consentimento legal |
| — | (sistema) | `g-recaptcha-response` (textarea+hidden), `gclid`, `hs_context` | hidden | — | — | — | reCAPTCHA + tracking + contexto embed |
| — | Submit | — | submit | — | value="Submit" | — | |

- **Sem placeholders** em nenhum campo (labels flutuam acima). **Sem máscara/format**. Telefone **não** é coletado aqui.

### Estados visuais
- **Default**: a borda branca visível está no **wrapper do campo**; o `input` em si tem `border:none`, bg transparente, **texto branco**, **Arial 13.33px** (default HubSpot), padding 15px 8px, radius 0. **Label** = NeueHaasGrotesk 12px **uppercase** branco. Painel **#231F20**.
- **Focus**: outline branco 3px (parece UA ring; sem box-shadow custom).
- **Filled**: igual ao default (texto branco).
- **Error**: input ganha classes `hs-input invalid error`; **borda do wrapper → #BA7160** (terracota); mensagem inline abaixo do campo. ⚠️ **`aria-invalid` NÃO é setado** (gap a11y).
- **Disabled**: nenhum campo desabilitado observado.

### Validação
- **Client-side (JS do HubSpot)**. Dispara **no blur** de cada campo tocado (e novamente no submit). Limpa no blur válido (classe volta a `hs-input`).
- Mensagens medidas: email inválido → **"Email must be formatted correctly."**; obrigatório vazio → **"Please complete this required field."** (HubSpot renderiza a msg em 3 containers por breakpoint).

### Submit
- `input[type=submit]` value="Submit", estilo **ghost** (transparente, borda 1px branca, uppercase, **full-width 365px @1440**, padding 17px 20px, radius 0). POST ao endpoint HubSpot, com reCAPTCHA + `gclid` + `hs_context`.
- **NÃO submeti** (evitar enviar dados reais ao CRM). Animação de loading/sucesso/erro = padrão `formsnext` do HubSpot (em sucesso normalmente troca o form por mensagem inline ou redireciona) — **não verificado**; marcar p/ Fase 1 dedicada se necessário.

### a11y / labels
- `label[for=id]` associado a cada campo; obrigatórios marcados com `*` no texto. **Gaps**: sem `aria-invalid` no erro, sem `aria-required` (depende do `*` visual), botões submit/menu sem `aria-label`.

### Responsivo do form
- Largura da coluna do form = **larguraPainel − ~355px de padding FIXO** (~170 esq. / ~185 dir., px iguais a 1024 e 1440). → @1440 painel 720 ⇒ form **365**; @1024 painel 512 ⇒ form **157** (apertado); @1920 painel 960 ⇒ form ~**605**.
- H2 "Start Your project With us" = **NHaasGroteskDSPro 48px fixo** → quebra muito em widths estreitos. Conforto **≥~1280**; abaixo fica espremido (provável origem da preocupação "min-1280"). **Sem media step abrupto** — estreitamento contínuo pelo padding fixo.

---

## D. Censo de animações (`/contact`) — censo, não extração de keyframes

- **No load assentado: `document.getAnimations()` = 0.** Nenhuma animação WAAPI/CSS rodando após a entrada assentar. (A animação de entrada já havia terminado no momento da medição — leituras feitas com a entrada *settled*.)
- **Transforms de repouso (estáticos):**
  - Trilhas da galeria `div.eAvfXc`: `translateY(-711.5)` (col1) / `translateY(-620.7)` (col2) — offsets de descanso **assimétricos**. **Não** mudaram em 450ms; **não** responderam a `mousemove`/`wheel` sintéticos. → ou recorte estático *settled*, ou movimento condicionado a eventos *trusted*/drag. **CANDIDATA a Fase 1 dedicada** (mecanismo de movimento da galeria).
  - Thumbnails do nav `.lggbZm`: repouso em `scale(1.03)` → zoom-out p/ 1.0 no hover (gate `(hover:hover)+(pointer:fine)`).
- **Hover / interação:**
  - Links de info (mailto/tel/cta/sociais): **sem mudança CSS no hover** (cor/decoração/transform inalterados; sem `::after` underline). Afordância de hover é só o **cursor custom** (`#cursor-portal-renderer`) — não capturável sob hover sintético. **CANDIDATO a Fase 1** (cursor custom + micro-interação de link).
  - MenuButton: hover → escala **1.0→1.05**. Sequência completa de abertura/rotor (disco fill +220ms, rotor ~650ms, parallax) = **Fase 1 dedicada conhecida**.
  - **Cursor custom**: overlay `#cursor-portal-renderer` presente (renderiza só em ponteiro real). **CANDIDATO a Fase 1**.
- (`/contact-form`: showreel no painel esq., slider "Sitting Time" custom, menu gooey — outra página; Fase 1 própria se for perseguida.)

**Marcar p/ Fase 1 dedicada:** (1) galeria — entrada + mecanismo de movimento; (2) cursor custom + hover de links; (3) sequência de abertura do menu/rotor (já parcialmente medida); (4) animações do `/contact-form` (showreel, slider).

---

## E. Tipografia & cor

### Famílias carregadas (`document.fonts`)
`RecklessNeue-Book` (400 normal+italic, serifa display) · `NHaasGroteskTXPro` (400, 500) · `NHaasGroteskDSPro` (400). Body declara `NeueHaasGrotesk-Roman` (fallback Helvetica/Arial) — essa face exata não aparece em `document.fonts` (pode cair no fallback).

### Por papel (`/contact`)
| Papel | Família | Tamanho | Peso | Line-height | Tracking | Transform | Cor |
|-------|---------|---------|------|-------------|----------|-----------|-----|
| Título (H1 "Get in touch") | RecklessNeue-Book | **36px** (piso; cresce >1440, 39.6px@1920) | 400 | 57.6px (1.6) | −0.36px | none | #000 |
| Label seção (H2) | NHaasGroteskTXPro | 16px | **500** | 19.2px (1.2) | normal | **uppercase** | #000 |
| Body / links | NeueHaasGrotesk-Roman | 16px | 400 | normal | normal | none | #000 (sem underline) |
| (form-page H2) | NHaasGroteskDSPro | 48px | 400 | — | — | uppercase | #FFF |
| (form labels) | NeueHaasGrotesk | 12px | 400 | — | — | uppercase | #FFF |
| (form inputs) | Arial (default HubSpot) | 13.33px | 400 | — | — | none | #FFF |

### Tokens de cor
- **bg**: `#FFFFFF` (html). section/body transparentes sobre branco.
- **texto**: `#000000` (títulos, labels, links).
- **acento**: `#C38133` (rgb 195,129,51) — disco do MenuButton (ocre).
- **logo**: SVG fill `#FFFFFF` + `mix-blend-mode: exclusion` (adaptativo → escuro sobre claro).
- **borda**: nenhuma na `/contact` (sem divisores; só tipografia).
- (`/contact-form`: painel `#231F20`; texto/borda do form `#FFFFFF`; **erro `#BA7160`** terracota.)

---

## F. Imagens / assets Storyblok (`/contact`)

- **Entrega**: tudo via otimizador Next.js `/_next/image` (`q=80`, `w=384` ou `640` conforme contexto/DPR), DPR1. **Fonte = Storyblok** `a.storyblok.com/f/158533/…` (pasta **158533**).

### Galeria (6 imagens, coluna esquerda)
| alt | Fonte Storyblok (natural) | render @1024 | render @1440 | render @1920 |
|-----|---------------------------|--------------|--------------|--------------|
| Office 1 | `/f/158533/1439x1068/3cdb423a42/photo1.jpg` (1439×1068) | 239×358.5 | 343×514.5 | 463×694.5 |
| Simon on the couch | `/f/158533/4413x6619/12faf82125/simon.jpg` (4413×6619) | 239×358.5 | 343×514.5 | 463×694.5 |
| Office 3 | `/f/158533/960x1440/e9b8841c26/photo3.jpg` (960×1440) | 239×358.5 | 343×514.5 | — |
| Office 2 | `/f/158533/960x1440/e5a286f1e9/photo2.jpg` (960×1440) | 239×337.4 | 343×484.2 | — |
| Kitchen view and a chair | `/f/158533/960x1440/8e16fc86a4/kitchen-view.jpg` (960×1440) | 239×337.4 | 343×484.2 | — |
| Stacia in the office | `/f/158533/959x1440/ec2e6a2715/stacia-office.jpg` (959×1440) | 239×337.4 | 343×484.2 | — |

`loading="lazy"`. Col1 recorta a ~**0.667** (2:3), col2 a ~**0.708** → alturas de célula diferentes por coluna (escalonado).

> **Office 1 — crop retrato centrado é DELIBERADO (2026-06-17).** Source é paisagem (`1439×1068`, AR 1.347), mas o asset local é crop retrato centrado **`686×1029`** (AR 0.667). A caixa retrato + `object-cover 50% 50%` mostram só a faixa central — medido **idêntico ao live** (Δ horizontal ≈ 0 em S=0). O live também **não** serve a paisagem cheia (`sizes=22vw`, rendition ~316px dimensionada ao display); servir a paisagem completa só adicionaria banda nunca exibida (+82 KB). **NÃO regenerar como paisagem** — ver `_gallery-mechanism.md`.

### NavOverlay (menu compartilhado) — thumbnails Storyblok (render ~370.8×198.5 @1440, abaixo da dobra)
`home-desktop.png` 1500×794 · `work-desktop-2024-july.jpg` 3000×1588 · `expertise-desktop-thumb.jpg` 6000×3176 · `about-desktop.png` 1500×794 · `contacts-desktop.png` 1500×794 · `joinus-desktop.jpg` 1420×752 · `knowledge-desktop-v2.png` 1500×794. (Alguns aparecem duplicados em 0×0 = variantes picture/mobile ocultas.)
Ícones sociais SVG: `/f/158533/15x15/8feb7017f5/logo-instagram.svg` (render 14.1×14.1) · `/f/158533/15x16/d9a6eabb37/logo-linkedin.svg` (render 13.2×14.1).

### Embeds
- **Sem iframe, sem `<video>`, sem mapa embarcado** na `/contact`. "VISIT US" linka para `g.page/build-in-amsterdam` (Google Maps) como **link**, não embed.
- (`/contact-form`: grade de cadeiras usa muitas imagens extras + showreel em vídeo — outra página, não enumerado aqui.)

---

## G. Responsivo

- **Estrutura idêntica a 1024 e 1440**: grid `1fr 1fr` (50/50). @1024 → 512|512 · @1440 → 720|720 · @1920 → 960|960. **`max-width:none`** (sem cap, totalmente fluido, sem centralização).
- **Célula esq. (galeria)**: 2 trilhas, largura = **(célula − 34px gap)/2** → 239@1024 / 343@1440 / 463@1920. **Gap constante 34px**. Retrato ~2:3 mantido; alturas escalam com a largura.
- **Célula dir. (info)**: sticky flex, **padding-left = 9vw** (92.2@1024 / 129.6@1440 / 172.8@1920 = 9% do vw, limpo).
- **Tipo**: H2/body **fixos 16px** em todos os widths. **H1 fixo 36px até ≤1440**, cresce acima (~39.6px@1920) → piso estilo `max(36px, termo·vw)` / clamp (não fixar px exato).
- **Reflow 1024↔1440**: nenhum estrutural. Única mudança: a linha **FOLLOW US quebra @1024** (IG/Facebook/Twitter na linha 1, LinkedIn na 2) — a coluna mais estreita não comporta 4 itens inline; @1440 cabem os 4.
- **"degrau min-1280"**: **NÃO observado** como mudança estrutural/colunas na `/contact` (2-col 50/50 vale a 1024 e 1440). Ele se manifesta na **`/contact-form`** (coluna do form estreita por padding fixo → apertada abaixo de ~1280). Ou seja, é característica do **form**, não breakpoint do grid de `/contact`.
- **>1440**: continua escalando linearmente (grid 50/50 sem cap; padding 9vw; larguras da galeria crescem; H1 cresce pouco). Sem cap detectado até 1920.
- **MenuButton**: fixo **104×108 bottom-center** em todos os widths.

---

## Itens para Fase 1 dedicada (não medidos aqui)
1. **Galeria** — animação de entrada + mecanismo de movimento (eventos trusted? drag? parallax de ponteiro?).
2. **Cursor custom** (`#cursor-portal-renderer`) + micro-interações de hover dos links de info.
3. **Sequência de abertura do menu / rotor** (parcialmente conhecida; confirmar curvas na contact).
4. **`/contact-form`** — showreel (gatilho/fullscreen/som), slider "Sitting Time" custom, estados de submit do HubSpot (loading/sucesso/erro) sem enviar dados.

## Notas de a11y observadas (só reporte)
- MenuButton sem nome acessível; NavOverlay fechado sem `aria-hidden`; form HubSpot sem `aria-invalid`/`aria-required`.

## Metadados da captura
- buildId LIVE: `_MsCuqDt4GbkeAFMyjWlP` (re-checar antes de comparações de fidelidade — referência viva pode mudar de build).
- Widths: 1024 / 1440 (canônicos) + 1920 (sonda >1440). DPR1, altura 900.
