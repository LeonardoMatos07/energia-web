# Spillway: proposta de redesign geral (Fase 1, só proposta)

Princípio: o Spillway deixa de ser "um site de curtailment" e vira "o painel do setor elétrico brasileiro". Curtailment vira uma área entre outras, sem perder nada. **Nenhuma URL existente muda** (SEO, middleware e testes intactos); mudam menu, agrupamento e home.

## 1. Arquitetura de informação

Estado atual: menu = Painel, Explorar, Mercado, Relatórios, Notícias, Ferramentas (`src/lib/navigation.ts`). Tudo centrado em curtailment.

**Regra:** _Área_ = tema com várias páginas e dados contínuos (tem subnavegação). _Ferramenta_ = algo que o usuário opera (entrada -> saída), sem tema próprio.

### Menu superior (7 itens + conta/tema)

| Item        | Tipo   | Conteúdo                                                          | URLs (existentes marcadas com *)                                                           |
| ----------- | ------ | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Painel      | página | Painel geral do SIN (novo conteúdo)                               | /painel*                                                                                   |
| Sistema     | área   | Matriz, carga, intercâmbio, térmicas (/v1/system/*)               | /sistema (novo)                                                                            |
| Água        | área   | Reservatórios, ENA, energia vertida (/v1/hydro/*)                 | /agua (novo)                                                                               |
| Mercado     | área   | PLD, mercado livre, tarifas, qualidade DEC/FEC                    | /mercado/pld*, /mercado/livre*, /tarifas*, /qualidade*                                     |
| Curtailment | área   | Painel, estados, usinas, comparar, relatórios, previsão, análises | /curtailment (novo hub) + /estados* /usinas* /comparar* /relatorios* /previsao* /analises* |
| Notícias    | área   | Notícias, atos regulatórios, fontes                               | /noticias*                                                                                 |
| Ferramentas | hub    | Plotador, Análises, Previsão (futuro: simuladores, Mapa)          | /ferramentas*                                                                              |

Mapa da rede (/v1/grid/*) entra em "Sistema" como /sistema/mapa quando existir; hoje não aparece (sem item morto no menu).

- Desktop: "Curtailment", "Mercado" e "Ferramentas" abrem **dropdown** (clique/teclado) com as subpáginas. Mobile: botão "Menu" abre drawer com grupos expansíveis.
- Subnavegação por área (abas sob o header, como `explore-tabs.tsx`): Curtailment = Visão geral · Estados · Usinas · Comparar · Relatórios · Previsão · Análises; Mercado = PLD · Mercado livre · Tarifas · Qualidade; Notícias = Notícias · Atos · Fontes.
- `/analises` e `/previsao` permanecem URLs e aparecem em **dois lugares**: card em Ferramentas (modelo em destaque via `tools.ts`) e aba na área Curtailment. Nada se perde.
- **Curtailment como área própria:** `/curtailment` = hub com o painel atual (reusa `DashboardView` inalterado), KPIs do mês, atalhos (estados, usinas, comparar, relatórios, previsão) e texto "o que é curtailment". O mecanismo de período (`?de=&ate=` -> `/curtailment/periodo`) é replicado em etapa própria.
- Decisão a validar: Painel geral **público** (SEO, topo de funil, amostras) com downloads/detalhes para membros. Hoje `/painel` é protegido no middleware; mudar é decisão de produto (etapa 5).

### Rodapé (4 colunas)

Áreas (Painel, Sistema, Água, Mercado, Curtailment, Notícias) · Ferramentas (Plotador, Análises, Previsão) · Spillway (Metodologia, Relatórios, RSS, Newsletter) · Legal (Privacidade, Cancelar newsletter, fontes dos dados ONS/CCEE/ANEEL). Mantém o texto de atribuição.

## 2. Nova página inicial (`src/app/page.tsx`)

1. **Hero** (mantém `HeroBackdrop`, `HeroChart`, `hero-rise/hero-float` e o gradiente). H1 "O setor elétrico brasileiro, _em movimento_" (palavra em gradiente, como "transborda" hoje); subtítulo "Geração, reservatórios, preços, notícias e curtailment, com dados oficiais, num só lugar."; CTAs: Explorar o Painel (primário), Criar conta (secundário; logado vê `MemberNewsletter`).
   - Dado do `HeroChart`: **geração total do SIN por mês, últimos 24 meses (GWh)**, de `/v1/system/generation` agregado (ou `getGenerationMix` se tiver série). Alternativas: carga das últimas 24h, ou matriz (% renovável) ao longo do tempo. Se faltar dado, cai para a série de curtailment atual; sem nenhum dado, `HeroChart` já devolve `null` (`points.length < 2`) e o hero fica só texto.
   - Mudança em `HeroChart`: apenas parametrizar casas decimais/unidade e cor de série; animação e layout intocados.
2. **"Agora no setor"** (StatGrid, 4 tiles, cada um link para sua área): % renovável, carga média, armazenamento hídrico, PLD médio.
3. **Matriz elétrica**: `GenerationMixPie` existente + legenda em lista com valores + link "Ver matriz completa".
4. **Atalhos para áreas** (grid 3x2; ícone, título, 1 frase, 1 número vivo): Sistema, Água, Mercado, Curtailment, Notícias, Relatórios.
5. **Ferramentas** (cards de `TOOLS`; Previsão com selo do modelo) + "Em breve: simuladores e mapa da rede" (texto, sem link).
6. **Últimas notícias** (`getNews({limit:5})`: título, fonte, data, selo "Nota Spillway" se `has_editor_note`) + "Todas as notícias".
7. **Destaques de mercado**: PLD por submercado, bandeira tarifária atual (`getPld`, `getTariffFlags`), mini-sparklines.
8. **Curtailment em destaque**: KPIs do mês (os de hoje) + link para a área. Preserva a história original.
9. **CTA de conta** (oculto se logado) + newsletter.

```
[Header: Logo | Painel Sistema Água Mercado▾ Curtailment▾ Notícias Ferramentas▾ | Entrar ☾]
+------------------------------------------------------------------+
| (backdrop animado)                                                |
|  O setor elétrico brasileiro,        +-------------------------+  |
|  em movimento                        | Geração do SIN (GWh)     |  |
|  Geração, reservatórios, preços...   |  ~~~ linha animada ~~~   |  |
|  [Explorar o Painel] [Criar conta]   |  nov/24          out/26  |  |
|                                      +-------------------------+  |
+------------------------------------------------------------------+
| Agora no setor: [% renovável][Carga][Armazenamento][PLD]          |
+------------------------------------------------------------------+
| A matriz elétrica:  (pizza)  | legenda com valores | ver matriz   |
+------------------------------------------------------------------+
| Explore por área: [Sistema][Água][Mercado][Curtailment][Notícias][Relatórios] |
+------------------------------------------------------------------+
| Ferramentas: [Plotador][Análises][Previsão • modelo X]            |
+------------------------------------------------------------------+
| Últimas notícias (lista)     | Destaques de mercado (PLD, bandeira)|
+------------------------------------------------------------------+
| Curtailment: KPIs do mês + "Ver área"                             |
+------------------------------------------------------------------+
| Criar conta gratuita / Newsletter                                 |
```

Mobile: 1 coluna; gráfico do hero abaixo do texto; tiles 2x2; áreas em 2 colunas compactas; notícias e mercado empilhados.

## 3. Painel geral (`/painel`)

Substitui o painel atual; o painel de curtailment (`DashboardView`) passa a viver em `/curtailment`.

```
Painel do setor elétrico            [Período: último mês ▾] [Baixar ▾]
+------------------------------------------------------------------+
| KPIs: Geração | Carga | % Renovável | Intercâmbio líq. | PLD      |
+------------------------------------------------------------------+
| Geração por fonte, área empilhada no tempo   | Matriz (pizza)     |
+------------------------------------------------------------------+
| Carga x geração               | Reservatórios: armazenamento %    |
|                               | e ENA por subsistema               |
+------------------------------------------------------------------+
| Térmicas despachadas | Intercâmbio entre subsistemas | Vertimento |
+------------------------------------------------------------------+
| Curtailment do mês (1 card -> área) | Notícias | Mercado          |
+------------------------------------------------------------------+
```

- Dados: `/v1/system/{balance,generation,interchange,thermal-dispatch}`, `/v1/hydro/{subsystems,spilled-energy}`, PLD, curtailment. Novas funções em `queries.ts`, tipos em `types.ts`.
- Filtro de período/subsistema reaproveita `period-filter.tsx` e `month-picker.tsx`; mesma reescrita `/painel/periodo`.
- Cada bloco é independente (Suspense + `DataUnavailable`): falha de uma rota não derruba a página.

## 4. Componentes, estados, responsivo, tema, a11y

**Novos componentes** (`src/components/`): `SiteNav` (dropdown + drawer), `AreaSubnav` (generaliza `explore-tabs`/`news-subnav`), `AreaCard`, `LiveStat` (StatTile + sparkline + delta), `NewsList`, `MarketHighlights`, `StackedAreaChart` (usa `charts/palette.ts`), `ReservoirBar`. Reusam `Card`, `Section`, `StatTile`, `StatGrid`, `DataUnavailable`, `Badge` de `ui.tsx`.

**Estados vazios/erro:** todo bloco usa `DataUnavailable` (mensagem curta); hero sem dados vira só texto; notícias vazias -> "Sem notícias recentes" + link para fontes; áreas inexistentes (Sistema/Água) aparecem como "Em breve" apenas na home, nunca no menu. Skeletons de altura fixa (sem salto de layout).

**Responsivo:** breakpoints sm/lg já em uso; header mobile = logo + Menu + tema; grids 1->2->3/4 colunas; SVGs com `viewBox` fluido; tabelas com scroll horizontal.

**Tema claro/escuro:** só tokens de `globals.css` (`--color-*`, `--color-series-1..7`); sem cores fixas. Mapeamento fixo fonte->cor, igual na pizza, na área empilhada e na legenda; contraste validado nos dois temas.

**Acessibilidade:** manter skip link `#conteudo`; dropdown com `aria-expanded`/`aria-controls`, Esc fecha, setas navegam, foco visível (`--color-focus`); `aria-current="page"` na área ativa; gráficos com `figcaption` e tabela/lista equivalente (`data-table.tsx`); informação nunca só por cor; `prefers-reduced-motion` já desliga `hero-rise/hero-float` (conferir elementos novos); alvos de toque >= 44px; um h1 por página.

## 5. Plano de implementação (PRs pequenos)

Cada etapa: `npm run lint && npm test && npm run build` verdes antes de seguir.

1. **Navegação e rodapé** (sem mudar páginas): `src/lib/navigation.ts`, `navigation.test.ts` (hoje fixa os 6 rótulos: atualizar de propósito), `src/components/nav-links.tsx`, `site-chrome.tsx`, novos `site-nav.tsx`, `area-subnav.tsx`. Sistema/Água ficam fora do menu até existirem.
2. **Área Curtailment**: `src/app/(membros)/curtailment/page.tsx` e `periodo/page.tsx` reusando `DashboardView`; `route-access.ts` (`/curtailment` protegido, `PERIOD_PATHS`) + `route-access.test.ts`; `middleware.ts` só se preciso. `/painel` segue com o conteúdo atual.
3. **Home nova**: `src/app/page.tsx`, `hero-visual.tsx` (parametrizar), novos `area-card`, `live-stat`, `news-list`, `market-highlights`; queries em `src/lib/api/queries.ts`. Manter JSON-LD `WebSite`, `pageMetadata`, `MemberNewsletter`, `data-track`. Conferir `components.test.tsx`.
4. **Painel geral**: `src/app/(membros)/painel/page.tsx` e `painel/periodo/page.tsx`; novos `views/overview-view.tsx`, `charts/stacked-area-chart.tsx`; tipos em `src/lib/api/types.ts`/`schema-compat.ts`; testes em `format.test.ts`. Redirecionar 308 `/painel?de=..&ate=..` antigos para `/curtailment` se houver links externos.
5. **Painel público ou de membros**: se público, mover para fora de `(membros)`, tirar `/painel` de `PROTECTED_PREFIXES`, incluir em `sitemap.ts` e atualizar `sitemap.test.ts` e `route-access.test.ts`.
6. **Áreas Sistema e Água** (sobre `/v1/system/*` e `/v1/hydro/*`): entram no menu e no sitemap (se públicas). Depois Mapa (`/v1/grid/*`) e simuladores (`tools.ts` + rota).
7. **Polimento**: metadados/OG por área (`lib/metadata.ts`), links cruzados em `tools.ts`, `FOOTER_LINKS`, revisão a11y/Lighthouse, reduced motion.

### O que NÃO pode quebrar

- Todas as rotas atuais (/estados, /usinas, /comparar, /analises, /previsao, /relatorios, /mercado/_, /qualidade, /tarifas, /conta, /noticias/_, /ferramentas/*), `/painel/periodo` e o rewrite de período (`route-access.ts`, `middleware.ts`).
- Gate de membros: `PROTECTED_PREFIXES`, `(membros)/layout.tsx` (`requireMember`), redirect `/entrar?proximo=`; `route-access.test.ts` e `navigation.test.ts` (alterar só conscientemente).
- SEO: `sitemap.ts`/`sitemap.test.ts` (só páginas abertas), `noticias/rss.xml`, JSON-LD, `pageMetadata`, canonical; páginas da área Curtailment mantêm "curtailment" nos títulos.
- Tracking (`data-track`, `tracker.tsx`, `/api/track`), `/api/revalidate`, `/api/search`, downloads (`/api/baixar/*`), atribuição de dados, `revalidate`/`force-dynamic` existentes.
- Plotador e exemplos (públicos e indexados), tema claro/escuro persistido, hero animado e `prefers-reduced-motion`.
