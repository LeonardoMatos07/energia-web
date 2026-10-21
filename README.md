# energia-web

Portal público do **Monitor de Curtailment** (Fase 1): quanta energia eólica e solar o ONS
mandou deixar de gerar no Brasil, por mês, subsistema, estado e usina, com perda estimada em
R$. Inclui uma área administrativa para acompanhar as cargas do pipeline e publicar
relatórios mensais.

Faz parte de quatro repositórios; o contrato entre eles está em
[`energia-api/docs/contrato-fase1.md`](../energia-api/docs/contrato-fase1.md).

| Repositório       | Papel                                                       |
| ----------------- | ----------------------------------------------------------- |
| `energia-data`    | Airflow: ingere o ONS e escreve os agregados                |
| `energia-api`     | FastAPI: dono do schema, leitura pública, newsletter, admin |
| **`energia-web`** | Next.js: este portal (ISR) e a área admin                   |
| `energia-infra`   | Terraform (AWS `sa-east-1`)                                 |

## Stack

Next.js 15 (App Router) · React 19 · TypeScript estrito · Tailwind CSS 4 · Recharts ·
Auth.js v5 (Cognito) · Vitest + Testing Library · ESLint · Prettier · pnpm.

Gráficos com **Recharts**: gera SVG (legível por leitores de tela e nítido em qualquer
tela), é composto em componentes React e é bem menor que o ECharts para o que precisamos
(barras empilhadas e linhas mensais). Todo gráfico tem legenda, tooltip e uma tabela com os
dados; as cores seguem uma paleta categórica validada para daltonismo.

## Páginas

| Rota                                                | Conteúdo                                                                                             | API                       |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------- |
| `/`                                                 | Painel nacional: corte mensal por fonte e por subsistema, números do último mês, estados, newsletter | `/v1/curtailment/sin`     |
| `/estados`, `/estados/[uf]`                         | Série mensal do estado (total/eólica/solar), ranking de usinas, motivos                              | `/v1/curtailment/uf/{uf}` |
| `/usinas`                                           | Busca com filtros de UF e fonte, paginada                                                            | `/v1/usinas`              |
| `/usinas/[slug]`                                    | Cadastro, histórico (verificada × cortada), motivos, comparação com a média da UF, conjunto ↔ usinas | `/v1/usinas/{slug}`       |
| `/relatorios`, `/relatorios/[slug]`                 | Relatórios mensais (Markdown sanitizado)                                                             | `/v1/relatorios`          |
| `/metodologia`                                      | Fontes, rateio, perda em R$, limitações, privacidade                                                 | —                         |
| `/newsletter/confirmar`, `/newsletter/descadastrar` | Leem `?token=` e chamam a API                                                                        | `/v1/newsletter/*`        |
| `/admin`                                            | Cargas do pipeline, criar/publicar relatórios, revalidar cache                                       | `/v1/admin/*`             |
| `POST /api/revalidar`                               | Revalidação sob demanda (chamada pela API)                                                           | —                         |

SEO: `sitemap.xml` (páginas fixas, estados, relatórios e todas as usinas — tolera a API fora
do ar), `robots.txt`, metadados por página (título, descrição, canonical, Open Graph) e
JSON-LD (`Dataset` nas páginas de dados, `Article` nos relatórios).

## Como rodar

Requer Node.js 22+ (CI usa 24) e pnpm 10 (`npm install -g pnpm@10.34.6` ou `corepack enable`).

```bash
pnpm install
cp .env.example .env.local     # ajuste API_URL etc.
pnpm dev                       # http://localhost:3000
```

Com o `energia-api` rodando em `http://localhost:8000` as páginas mostram dados reais; sem
ele, mostram "dados indisponíveis" — nada quebra.

| Comando                                  | O que faz                                                 |
| ---------------------------------------- | --------------------------------------------------------- |
| `pnpm dev` / `pnpm build` / `pnpm start` | Next.js                                                   |
| `pnpm lint`                              | ESLint                                                    |
| `pnpm typecheck`                         | `tsc --noEmit`                                            |
| `pnpm format` / `pnpm format:check`      | Prettier                                                  |
| `pnpm test`                              | Vitest                                                    |
| `pnpm gen:api`                           | Gera `src/lib/api/schema.d.ts` a partir do OpenAPI da API |

### Tipos da API

`src/lib/api/types.ts` tem os tipos escritos à mão a partir do contrato.
`pnpm gen:api` gera `src/lib/api/schema.d.ts` com o `openapi-typescript`, lendo (nesta ordem)
`OPENAPI_SOURCE`, `../energia-api/openapi.json` ou `http://localhost:8000/openapi.json`. No
`energia-api`, `uv run python -m app.export_openapi openapi.json` exporta o arquivo.
`src/lib/api/schema-compat.ts` compara os dois em tempo de compilação: se a API mudar um
formato, `pnpm typecheck` falha.

## Variáveis de ambiente

| Variável                                                        | Uso                                                                     |
| --------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `API_URL`                                                       | URL do `energia-api` (só no servidor). Padrão `http://localhost:8000`   |
| `NEXT_PUBLIC_SITE_URL`                                          | URL pública (canonical, OG, sitemap)                                    |
| `NEXT_PUBLIC_CONTACT_EMAIL`                                     | Contato de privacidade (LGPD) exibido em `/privacidade`                 |
| `REVALIDATE_SECRET`                                             | Segredo de `POST /api/revalidar`; o mesmo valor configurado na API      |
| `WEB_API_SECRET`                                                | Mesmo valor da API; envia o IP do visitante para o limite da newsletter |
| `AUTH_SECRET`                                                   | Chave de criptografia da sessão (Auth.js)                               |
| `AUTH_COGNITO_ID`, `AUTH_COGNITO_SECRET`, `AUTH_COGNITO_ISSUER` | App client do Cognito                                                   |
| `AUTH_URL`                                                      | Opcional fora da Vercel                                                 |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (+ `NEXT_PUBLIC_PLAUSIBLE_SRC`)  | Liga o Plausible                                                        |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID` + `NEXT_PUBLIC_UMAMI_SRC`        | Liga o Umami                                                            |

Sem as variáveis do Cognito, `/admin` mostra "autenticação não configurada". Sem variáveis
de analytics, nenhum script de terceiros é carregado.

## Dados e cache (ISR)

Todas as chamadas à API passam por `src/lib/api/client.ts`, no servidor, com
`fetch(API_URL + path, { next: { tags, revalidate: 3600 } })`. Tags:

- `curtailment` — séries mensais (SIN, UF, usina) e meses;
- `usinas` — busca, páginas de usina e rankings;
- `relatorios` — relatórios.

As respostas ficam no cache de dados por até um dia; as páginas são regeneradas no máximo a
cada hora (reaproveitando o cache), o que permite que uma página gerada com a API fora do ar
se recupere sozinha. Páginas dinâmicas (`/estados/[uf]`, `/usinas/[slug]`,
`/relatorios/[slug]`) não são pré-geradas no build: cada uma é renderizada no primeiro acesso
e então fica em cache. Por isso o build não depende da API.

Chamadas do admin e da newsletter usam `cache: "no-store"`.

## Como funciona a revalidação

1. Ao fim de cada carga, o `energia-data` chama `POST {API_URL}/v1/admin/revalidar` com
   `{"tags": ["curtailment", "usinas"]}`.
2. A API limpa o próprio cache e chama `POST {WEB_URL}/api/revalidar` com o cabeçalho
   `x-revalidate-secret` e o mesmo corpo.
3. Este portal compara o segredo em tempo constante e chama `revalidateTag` para cada tag
   (sem corpo ou com `tags` vazio: todas as três).

```bash
curl -X POST http://localhost:3000/api/revalidar \
  -H "x-revalidate-secret: $REVALIDATE_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"tags": ["curtailment", "usinas"]}'
# {"revalidado":true,"tags":["curtailment","usinas"],"em":"..."}
```

Respostas: `401` segredo errado/ausente, `400` JSON ou tag inválidos, `503`
`REVALIDATE_SECRET` não configurado. Ao publicar um relatório pelo admin, o portal revalida a
tag `relatorios` na hora.

## Admin

Login OAuth (código de autorização com PKCE) no Cognito via Auth.js v5; sessão em cookie
`httpOnly` criptografado. O _access token_ do Cognito fica dentro do cookie e só é lido no
servidor para chamar `/v1/admin/*` — nunca vai para o navegador. A API exige o grupo `admin`.
Callback a cadastrar no app client: `{SITE_URL}/api/auth/callback/cognito`. Não há renovação
automática do token: quando ele expira (1 h por padrão no Cognito), o admin entra de novo.

## Privacidade

Sem login público e sem cookies de rastreamento. A newsletter guarda só o e-mail, com
consentimento explícito (LGPD), confirmação por e-mail (double opt-in) e descadastro em um
clique.

## CI e deploy

`.github/workflows/ci.yml` roda em todo PR e push na `main`: `pnpm install
--frozen-lockfile`, lint, `tsc --noEmit`, `prettier --check`, `vitest run` e `next build`
(sem API).

O **deploy é feito pela Vercel** (integração com o GitHub): preview a cada PR e produção a
cada merge na `main`. Configure na Vercel as variáveis acima (`API_URL`,
`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CONTACT_EMAIL`, `REVALIDATE_SECRET`, `WEB_API_SECRET`, `AUTH_*`, analytics). O CI não faz deploy.
