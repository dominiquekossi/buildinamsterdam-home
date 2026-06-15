# `/contact` — Gallery Mechanism (Fase 1: medição fina + CORREÇÃO)

> Read-only no LIVE `www.buildinamsterdam.com/contact`. Aba SEMPRE `visible`; `visibilityState` capturado em toda amostra (todas as séries abaixo = `visible`). Captura desde o frame 0 via `initScript` (rAF sampler) — foi o que revelou o início real. buildId `_MsCuqDt4GbkeAFMyjWlP`. Widths 1024/1440 (+ perfis @1440 e @1024). **Nada implementado.**

## ⚠️ CORREÇÃO da fase anterior
A conclusão anterior ("marquee infinito em loop; −711.5/−620.7 era rAF congelado por oclusão") estava **ERRADA**. O correto:

## MECANISMO: **auto-PAN único e LIMITADO (one-shot), que PARA no fim. NÃO há loop, NÃO há reciclagem, NÃO há duplicação.**
Cada trilha (`div.eAvfXc`) translada de `translateY: 0` (topo alinhado) até `translateY: −(alturaTrilha − alturaViewport)` (base alinhada), em velocidade ~constante, e **para** (settled). Os valores −711.5/−620.7 (@1440) e −244/−180 (@1024) NÃO eram artefato de oclusão — são o **FIM assentado** (= −(altura − 900)). Dirigido por **rAF/JS** (`getAnimations()=0`).

---

## Item 6 — Geometria das trilhas (estático)
- Galeria = célula `order:1`, 720 (1440) / 512 (1024) de largura; 2 trilhas lado a lado.
- **Trilha A** (esquerda, x0): imgs **Office 1 · Simon on the couch · Office 3**. **Trilha B** (x377@1440 / x273@1024): **Office 2 · Kitchen view and a chair · Stacia in the office**.
- **3 imagens por trilha, SEM duplicação no DOM** (`imgCount=3`; relTops `[0, 548.5, 1097]` constantes — nunca reciclam).
- Larguras de trilha: **343** @1440 / **239** @1024. **Gap entre trilhas: 34px** (confirmado: x 0 e 377 → 377−343=34).
- **Gap vertical entre imagens dentro da trilha: 34px** (pitch topo-a-topo = imgH+34).
- Alturas (h = 3·imgH + 2·34):
  | | imgH @1440 | hTrilha @1440 | imgH @1024 | hTrilha @1024 |
  |---|---|---|---|---|
  | Trilha A | 514.5 | **1611.5** | 358.5 | **1144** |
  | Trilha B | 484.2 | **1520.7** | 337.4 | **1080** |
- Janela visível = viewport (900); a célula tem 900 de altura visível (o resto da trilha fica fora, recortado pela página).

## Item 3 — ESTRUTURA DO LOOP → **NÃO HÁ LOOP** (one-shot pan)
- **Range por trilha = altura − 900**: A = **711.5** / B = **620.7** (@1440); A = **244** / B = **180** (@1024).
- O `translateY` vai de **0 → −range** e **para (clamp) no fim**. Evidência decisiva @1024 (captura 16.6s): ty subiu 0→−243.5/−180.2 em ~t18.9s e **plateau por +14s** (`resets:[]`, `plateauedAtEnd:true`, `visible`). Sem reset/wrap. Sem reciclagem (relTops fixos). Sem cópias.
- ∴ **não precisa duplicar conteúdo no DOM** para montar — é só 3 imagens por trilha + um pan limitado que para.

## Item 1+2 — VELOCIDADE EXATA + LEI DE ESCALA (o que define o DOM)
Perfil completo desde o frame 0:
- **Antes do pan há uma FASE DE ENTRADA (~1.6s) + um HOLD real (~2.6s)** — o "~4.5s de espera com ty=0" registrado antes media só o TRACK (ty=0 o tempo todo); o movimento de entrada vive num WRAPPER EXTERNO (ver seção "ENTRADA/ENCAIXE" abaixo). Pan **começa ~4.2s** (frame-0: 4195.8ms).
- **Ease-in** ~375ms (0 → cruzeiro; ramp LINEAR de velocidade — ver seção implementada. O "~1s" registrado antes era artefato de amostragem esparsa).
- **Cruzeiro LINEAR** (velocidade constante):
  | | cruise Trilha A | cruise Trilha B | ratio A/B | = range A/B |
  |---|---|---|---|---|
  | @1440 | **−18.43 px/s** | **−16.09 px/s** | 1.145 | 711.5/620.7=1.146 ✓ |
  | @1024 | **−18.7 px/s** | **−13.83 px/s** | 1.351 | 244/180=1.351 ✓ |
- **Clamp/stop** no fim (cruzeiro → 0 em ~1–1.4s; encosta em −range).

**LEI DE ESCALA (DESEMPATADA):** o invariante é a **VELOCIDADE de cruzeiro da trilha dominante (Trilha A, maior range) ≈ −18.5 px/s — IGUAL nos dois widths (18.43@1440, 18.7@1024).** As duas trilhas andam em **lockstep** (terminam JUNTAS): `vB = vA · (rangeB/rangeA)`. Logo:
- **NÃO é duração fixa.** A **DURAÇÃO escala com o range** (≈ range/18.5): **~38s @1440** (711.5/18.5) vs **~13–15s @1024** (244/18.5).
- Modelo (= motor do /cases, mas auto-dirigido por tempo em vez de scroll — ver [[cases-scroll-parallax]]):
  - progresso mestre `S` avança a **~18.5 px/s** (após o hold + ease-in), de 0 até `rangeMax (= rangeA)`.
  - `translateY_A = −S` (A = Rmax, 1:1); `translateY_B = −S·(rangeB/rangeA)`.
  - clamp ambos quando `S = rangeA` → bases alinhadas simultaneamente, e **para**.

## ENTRADA/ENCAIXE — fase ANTES do pan (medida frame-0 + IMPLEMENTADA 2026-06-14) ✓
Camada DOM SEPARADA do pan: cada coluna tem um **wrapper externo** (acima do track do pan). Medido no live:
- **t=0:** colunas DESENCAIXADAS — wrapper **A +50px** (mais baixa) / **B −50px** (mais alta) + **opacity 0**; track ty 0. Offset **±50px FIXO** (idêntico @1024/1440/1920, não escala).
- **Encaixe (~1.6s):** wrapper ±50→0 + opacity 0→1, SINCRONIZADOS (uma curva-mestra). **A e B SIMULTÂNEAS e espelhadas** (wA = −wB todo frame; opacity A=B). Track ty fica 0 (2 camadas).
- **Curva CRAVADA por RMS (não "parece"):** `cubic-bezier(0.42, 0, 0.21, 1)` venceu (RMS 0.0218) vs **house 0.0572** (house NÃO é — mesmo erro do ramp do pan evitado), linear 0.158, cubic-out 0.214, easeOutExpo 0.336. Bezier derivado ótimo (0.5,0,0.15,0.97) RMS 0.0054 — pertíssimo; usar a do projeto `(0.42,0,0.21,1)`.
- **Mecanismo (live):** rAF (getAnimations=[]). **Rebuild:** WAAPI no wrapper (`.animate` com a bezier nativa — padrão CaseCard/FilterTrigger, sem helper; visualmente == live), `useLayoutEffect`+`fill:both` → **sem flash** (1º frame pintado já em ±50/opacity 0).
- **reduced-motion:** entrada PULADA (e pan também) — colunas nascem em 0/opacity 1, estáticas (live snapa em ~150ms; nascer resolvido é equivalente).

**LINHA DO TEMPO real:** [ENTRADA ±50→0 + fade, ~1.6s, (0.42,0,0.21,1)] → [HOLD real ~2.6s] → [PAN ~4.2s: ramp ~375ms → cruzeiro lockstep → clamp]. **O "hold 4.5s" antigo = entrada (~1.6s) + hold real (~2.6s).**

## Item 4 — EASING
- Fase 0 (~0–4.2s): **entrada (~1.6s, wrapper ±50→0 + fade, curva (0.42,0,0.21,1))** + **hold real (~2.6s)** em ty 0 (track).
- Ease-IN (~375ms): 0 → ~18.5 px/s (ramp LINEAR de velocidade; implementado).
- **Cruzeiro: LINEAR** (constante; amostras @1440 t6.7→t18s perfeitamente equiespaçadas ~30px/1.6s).
- Fim: desacelera/clamp a 0 em ~1–1.4s (encaixe na base). Sem oscilação/bounce.

## Item 5 — REDUCED-MOTION
Com `prefers-reduced-motion: reduce` (emulado via override de `matchMedia` no initScript; confirmado `matches=true`): **o pan NÃO roda** — as trilhas ficam **estáticas em ty 0** (topo alinhado) por toda a captura (~17.8s, `aRangeMoved=0`). → o live **respeita reduced-motion desativando o pan** (mostra o topo da galeria, parado). *(Caveat: emulado por override de matchMedia, não pela flag nativa do DevTools — mas é exatamente o sinal que a página lê.)*

---

## Resumo para o DOM (próxima fase de build)
- 2 trilhas, 3 imagens cada (sem duplicar), gap 34 (vertical e horizontal), larguras 343/239, alturas conforme tabela.
- **ENTRADA (wrapper externo):** A +50→0 / B −50→0 + opacity 0→1, ~1.6s, `cubic-bezier(0.42,0,0.21,1)` (RMS), espelhada, WAAPI. Depois hold real ~2.6s.
- Pan (track interno): `translateY` 0 → −(altura−100vh) por trilha; **A e B em lockstep**, A a ~18.5 px/s (fixo), B = A·rangeB/rangeA; **para no fim** (clamp). Arranca ~4.2s (= entrada + hold).
- **Sem loop/duplicação/reciclagem.** Reduced-motion → sem entrada nem pan (estático no topo, opacity 1).
- Drivers: **entrada = WAAPI no wrapper; pan = rAF/JS no track** (2 camadas aninhadas).

## IMPLEMENTADO (2026-06-14) → `src/components/contact/ContactGallery.tsx`
Aplicado conforme spec: 2 trilhas, 3 imgs cada (sem duplicar), gap 34, pb-150% (A) / pb-141.17% (B),
ranges medidos em runtime, `translateY=−S·(range/rMax)`, S auto a **18.5 px/s** (linear), clamp/para no fim
(lockstep A↔B), reduced-motion → ty:0, driver rAF/JS (cleanup no unmount).
**ENTRADA adicionada (2026-06-14):** wrapper externo por coluna, WAAPI translateY ±50→0 (A+50/B−50) + opacity 0→1,
ENTER_MS 1600, `cubic-bezier(0.42,0,0.21,1)` (RMS-cravada), espelhada, `useLayoutEffect`+`fill:both` (no-flash);
**HOLD_MS do pan 4500→4200** (pan arranca ~4.2s = entrada ~1.6s + hold real ~2.6s; era 4500 embutindo a entrada).
reduced-motion pula entrada E pan (0/opacity 1). Verificado @1024/1440: frame-0 ±50/opacity 0 sem flash, encaixe ~1.55s,
mirror exato, track ty 0 na entrada, pan inalterado (cruzeiro 18.5/16.13, lockstep, clamp).
Padrão do `useCasesScroll` replicado inline (NÃO reusado — o hook é wheel/touch). 6 webp locais em
`public/images/contact-*.webp` (Storyblok `/m/686x1029|686x968/filters:format(webp):quality(82)`).
Verificado @1024/1440: geometria exata, A&B terminam juntas, A 18.5 px/s, plateau sem reset, reduced-motion ty:0.

### EASE-IN DE ARRANQUE — MEDIDO + IMPLEMENTADO (micro-fase 1 + fase 2, 2026-06-14) ✓
Medido frame-a-frame desde o frame 0, @1440, aba `visible` (revisado: o "~1s" anterior era **artefato de amostragem esparsa**):
- **Duração do ramp ≈ 350–400ms** (velocidade 0→cruzeiro 18.64 px/s; depois CONSTANTE). Não ~1s.
- **Forma = EASE-IN** (acelera do repouso): S_norm = **0.31** no ponto médio (tn=0.5) — bem abaixo de 0.5 ⇒ desloc. lento no início, acelerando.
- **MODELO = interpolar a VELOCIDADE** (ramp v: 0→cruzeiro ao longo de ~375ms, depois segura constante). O deslocamento S = ∫v ⇒ S é ease-in no ramp e linear depois. NÃO é "ease de S sobre T inteiro" (o cruzeiro é perfeitamente constante após o ramp).
- **Lockstep no arranque: SIM** — trilhas A e B começam juntas (motionStart ~4315ms) e atingem seus cruzeiros (18.64 / 16.26) no MESMO instante (~350ms).
- **Ajuste das curvas-casa (RMS sobre S_norm):** linear 0.129 · `0.42,0,0.21,1` 0.279 · house 0.308 · cubic-out 0.398 · easeOutExpo 0.514. → **NENHUMA curva-casa ajusta** — todas são ease-out / ease-in-out (família ERRADA; o ramp é ease-IN, sinal oposto), todas piores que até a linear. A curva real é um **ease-in suave** (~entre linear e easeInQuad; S_norm 0.31 no meio ≈ easeInQuad-ish, ex. `cubic-bezier(0.11,0,0.5,0)` dá 0.25).
- **Impacto visual:** o "atraso" do ramp acumula só **~3px** ao longo de ~350ms, num pan de 18–38s → quase imperceptível.
- **DECISÃO (reviewer, 2026-06-14): OPÇÃO 1 — ramp LINEAR de velocidade (aceleração constante) ~375ms. IMPLEMENTADA.**
  Como nenhuma curva-casa ajustou (família ease-in, RMS linear 0.129 < house 0.308 — todas piores que a linear), e
  a curva real é um ease-in suave FORA do conjunto-casa, optou-se por aceleração linear (sem curva nomeada) em vez de
  introduzir uma cubic-bezier nova. (Alternativas rejeitadas: (b) ease-in não-house ~easeInQuad — traria curva fora do
  conjunto aprovado; (c) manter linear-sem-ramp — ~3px de divergência.)

#### IMPLEMENTAÇÃO (fase 2, 2026-06-14) → `ContactGallery.tsx`
Constante `RAMP_MS = 375` (junto de `PAN_PX_PER_SEC`/`HOLD_MS`). No rAF, após o HOLD, integra-se a velocidade:
`motionMs += dt*1000; v = motionMs < RAMP_MS ? PAN_PX_PER_SEC*(motionMs/RAMP_MS) : PAN_PX_PER_SEC; S = min(rMax, S + v*dt)`.
⇒ v sobe LINEARMENTE 0→cruzeiro em ~375ms (aceleração constante), depois satura; S = ∫v (quadrático no ramp, linear depois).
NÃO é tween eased de S. O ramp atua sobre o **S MESTRE** → A e B compartilham e seguem em lockstep automaticamente.
Cruzeiro, clamp, lockstep, reduced-motion, hold e o dt-clamp (0.05s) ficaram INALTERADOS.
**Nota de duração:** o ramp percorre ~3.5px a menos que o cruzeiro-instantâneo nos primeiros 375ms (metade da distância
do ramp), então o pan encosta no clamp ~190ms mais tarde — **posição final idêntica** (clamp em rMax).

**Confirmação de runtime (código aplicado, aba visible, frame-0, deadline):**
- @1440: arranque = RAMPA (vA 4.5/9.4/14.3/18.7 px/s @ 50/150/250/375ms), cruzeiro A **18.50** / B **16.14** (=18.5·0.872),
  `ratioBA = 0.872` constante em TODO offset (τ=0 == τ=cruzeiro) → lockstep no arranque preservado.
- @1024: arranque = RAMPA (vA 0→18.5 em ~375ms, mesma forma), cruzeiro A **18.5** / B **13.65** (=18.5·0.738),
  `ratioBA = 0.738` constante; **fim −244/−180** (= live), plateau 1.8s, SEM reset, A&B param juntas.
- reduced-motion: pan desativado, `tyA/tyB = 0` por >7s (matchMedia reduce=true).

## A confirmar na próxima fase (não medido agora)
- ~~Curva do ease-in~~ → MEDIDO + IMPLEMENTADO (ramp LINEAR de velocidade ~375ms, opção 1; duração real ~375ms, NÃO ~1s — o "~1s" anterior era artefato de amostragem esparsa; nenhuma curva-casa ajustou: família ease-in, RMS linear 0.129 < house 0.308).
- Clamp final (forma/duração precisas) — ainda não medido (foco desta micro-fase foi só o arranque).
- HOLD em prod: `HOLD_MS=4500` roda a partir do mount; em dev o mount do Vite (~0–2s) adia o motionStart
  (~6.4s @1440 medido), mas em produção o mount é ~instantâneo → ~4.5s desde o load ≈ live (4485ms).
- Velocidade mestre exata (18.4–18.7 px/s — confirmar valor canônico e se é px/s puro).

## ⚠️ Nota de medição
rAF pode congelar se a aba ocluir — capturar SEMPRE `visible`, desde o frame 0 (initScript), e validar com `visibilityState`. Os valores de "fim" (−711.5/−620.7 etc.) são estado assentado real, **não** artefato.

**FIM — mecanismo corrigido e medido (one-shot pan limitado, lockstep, velocidade-invariante, para no fim; reduced-motion desativa). PARAR e aguardar OK.**
