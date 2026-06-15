# `/contact` — Validação do menu/rotor (REBUILD vs LIVE)

> Read-only. Régua = LIVE `www.buildinamsterdam.com/contact`. Comparação REBUILD /contact (localhost) vs LIVE, widths 1024 e 1440, aba `visible` (capturado), computed, sub-pixel. NavOverlay/MenuButton/DotLabel são SHARED já aprovados — a /contact USA, não modifica. **Nada implementado.**

## VEREDITO: ✅ o rebuild CORRESPONDE ao live em todos os aspectos do mounting da /contact. Nenhuma divergência exige tocar shared.

## Tabela REBUILD vs LIVE
| Item | LIVE @1440 | REBUILD @1440 | LIVE @1024 | REBUILD @1024 | classe |
|---|---|---|---|---|---|
| **deslocamento do conteúdo (open)** | translateY **−449** | **−449** | **−399** | **−399** | (i) ✅ |
| --nav-shift / degrau 1280 | 449 (=450−1) | `calc(max(450px,50vh)-1px)`=449 | 399 | `399px` | (i) ✅ |
| altura do NavOverlay | 450 | 450 | 400 | 400 | (i) ✅ |
| NavOverlay parked (closed) | translateY(450) | translateY(450) | translateY(400) | translateY(400) | (i) ✅ |
| NavOverlay aberto | translateY **0** (top y450) | **0** | **0** | **0** | (i) ✅ |
| transição (conteúdo E nav) | **0.65s cubic-bezier(0.45,0.02,0.09,0.98)** (house) | **idem** | idem | idem | (i) ✅ |
| disco closed→open | #C38133 → **#3C4CC7** (blue) | #C38133 → **#3C4CC7** | idem | idem | (i) ✅ |
| label closed→open | "Menu" → **"Close"** | "Menu" → **"Close"** (2 textPaths, visibility toggla) | idem | idem | (i) ✅ |
| rotor (DotLabel) aberto | **70°** visível | **70°** visível | 70° | 70° | (i) ✅ |
| disco hover scale | 1.0→**1.05** | 1.05 (shared MenuButton) | — | — | (i) ✅ |
| fechamento | reverse → content 0, nav park, "Menu" | **idem** (content→0, nav→park, "Menu") | idem | idem | (i) ✅ |
| backdrop click-to-close | renomeia `#main`→`#menu-close-backdrop` | `onClick={navOpen?closeNav}` no wrapper | idem | idem | (i) ✅ equiv. funcional |
| z-stack (open) | content z1 < nav z8 = menu z8 (menu pinta acima por DOM) | content z**10** < nav z**20** < menu z**40** | idem | idem | (i) ✅ ordem preservada |
| page lock no open | html+body overflow:hidden (sem lock extra de nav) | html+body hidden (lock de página da ContactPage; nav-lock OMITIDO) — **sem conflito** | idem | idem | (i) ✅ |

## Detalhe por item da tarefa

### 1. Abertura
- **Mecanismo:** o wrapper de conteúdo desliza para cima por **−nav-shift** (−449@1440 / −399@1024) E o NavOverlay sobe de `translateY(altura)` para `0` — **ambos animam** com a **mesma curva-casa 0.65s** `cubic-bezier(0.45,0.02,0.09,0.98)`. Idêntico no rebuild (wrapper z-10 com `--nav-shift` + NavOverlay `translateY(open?0:100%)`).
- **Degrau min-1280:** confirmado — shift 449 / nav 450 @1440; shift 399 / nav 400 @1024, nos DOIS (rebuild encoda `[--nav-shift:399px] min-[1280px]:[--nav-shift:calc(max(450px,50vh)-1px)]`).

### 2. Rotor + disco
- **Rotor:** a label "Menu/Close" fica a **70°** (pose visível) no estado ABERTO em ambos. O swing entre poses (hidden-top −20° / visible 70° / exit 170°) + idle attract loop é da **shared MenuButton/DotLabel (aprovada)**. No OPEN os dois batem (70°, "Close" branco).
- **Disco:** closed #C38133 → open **#3C4CC7** (crossfade `transition: ... 0.5s`) nos dois. Hover scale 1.0→1.05 (shared).
- **Observação (não-divergência):** num instante FECHADO/repouso, a label do live estava a 70° (visível) e a do rebuild a 170° (tucked) — é a **fase do idle attract loop** (rest animado), governado pela shared MenuButton aprovada, não pelo mounting da /contact. Mecanismo igual nos dois; o ângulo instantâneo em repouso varia com a fase do loop. (Se o reviewer quiser paridade exata do repouso, é micro-fase da shared MenuButton — fora do escopo /contact; não mexer sem OK.)

### 3. Fechamento
- Fecha por **clique no disco** (toggle) ou **clique no backdrop** (conteúdo deslocado). Live renomeia `#main`→`#menu-close-backdrop` (handler de close); rebuild usa `onClick={navOpen?closeNav}` no wrapper — **equivalente funcional**. Curva/duração = **mesma da abertura** (reverse, 0.65s house). Confirmado no rebuild: content→0, nav→park, label→"Menu".

### 4. Contexto /contact
- **Scroll-lock omitido:** a ContactPage trava html+body (`100vh`+`overflow:hidden`) na montagem e **omite** o lock de nav-open do CasesPage. Confirmado que **NÃO quebra** abertura/fechamento — o conteúdo desliza −449/−399 e volta a 0 corretamente; html+body ficam `hidden` o tempo todo (igual ao live, que também já está travado). Sem conflito.
- **z-stack:** menu/disco ficam acima do conteúdo deslocado (rebuild content z10 < nav z20 < menu z40; live content z1 < nav z8 = menu z8). Ordem preservada; no open o NavOverlay cobre o conteúdo (a11y: itens do menu expostos, info coberta) — igual nos dois.

## Diferenças observadas (todas classe (i) — rebuild corresponde / shared aprovado)
1. **Valores absolutos de z** (rebuild 10/20/40/50 vs live 1/3/7/8): ordem preservada; mapeamento conhecido do rebuild (inert). 
2. **`aria-hidden` no nav fechado:** rebuild seta `true`/`false`; live não tinha (`null`). Rebuild é **melhoria de a11y** — não é divergência a corrigir.
3. **Backdrop:** rename de id (live) vs `onClick` no wrapper (rebuild) — equivalente funcional.
4. **Pose de repouso do rotor (idle):** fase do attract loop da shared MenuButton (aprovada) — não é do mounting /contact.

**Nenhuma divergência classe (iii) (que exigiria tocar shared).** O menu/rotor da /contact **valida** contra o live. **PARAR e aguardar OK.**
