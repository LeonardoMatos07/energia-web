# energia-web

Public portal of **Spillway** (Phase 1), the curtailment monitor: how much wind and solar energy ONS
ordered Brazilian plants not to generate, per month, subsystem, state and plant, with the
estimated loss in BRL. It includes an admin area to follow the pipeline loads and publish
monthly reports.

It is one of four repositories; the contract between them is in
[`energia-api/docs/phase1-contract.md`](../energia-api/docs/phase1-contract.md).

| Repository        | Role                                                   |
| ----------------- | ------------------------------------------------------ |
| `energia-data`    | Airflow: ingests ONS data and writes the aggregates    |
| `energia-api`     | FastAPI: schema owner, public reads, newsletter, admin |
| **`energia-web`** | Next.js: this portal (ISR) and the admin area          |
| `energia-infra`   | Terraform (AWS `sa-east-1`)                            |

## Stack

Next.js 15 (App Router) · React 19 · strict TypeScript · Tailwind CSS 4 · Recharts ·
Auth.js v5 (Cognito) · Vitest + Testing Library · ESLint · Prettier · pnpm.

Charts use **Recharts**: it renders SVG (readable by screen readers and sharp on any screen),
composes as React components and is much smaller than ECharts for what we need (stacked bars
and monthly lines). Every chart has a legend, a tooltip and a data table; colors follow a
categorical palette checked for color blindness.

## Language

Code, identifiers, logs and documentation are in English. Everything rendered on screen is in
Portuguese, and so are the public URLs, including their query parameters (`/usinas?uf=RN`,
`?fonte=eolica`) and the section anchors of the content pages (`/metodologia#rateio`).

## Pages

| Route                                               | Content                                                                                                                                                                                                                                                                                                                                            | API                              |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `/`                                                 | National dashboard: monthly curtailment by source and subsystem, latest month, states, newsletter                                                                                                                                                                                                                                                  | `/v1/curtailment/subsystems`     |
| `/estados`, `/estados/[uf]`                         | State monthly series (total/wind/solar), plant ranking, reasons                                                                                                                                                                                                                                                                                    | `/v1/curtailment/states/{state}` |
| `/usinas`                                           | Search with state and source filters, paginated                                                                                                                                                                                                                                                                                                    | `/v1/plants`                     |
| `/usinas/[slug]`                                    | Registry data, history (verified × curtailed), reasons, comparison with the state average, cluster ↔ plants                                                                                                                                                                                                                                        | `/v1/plants/{slug}`              |
| `/comparar`                                         | Comparador em 3 passos: escolher até 6 itens (estados, subsistemas, usinas), escolher livremente as métricas (geração, energia cortada, perda em R$, % de corte) e ver em linhas, barras ou pizza, comparando os itens ou cada item separado. Tudo fica na URL: `?itens=u:<slug>,e:<UF>,s:<id>&metricas=gerado,cortado,perda,percentual&modo=itens | separado&grafico=linhas          | barras | pizza` | `/v1/plants/{slug}`, `/v1/curtailment/*` |
| `/relatorios`, `/relatorios/[slug]`                 | Monthly reports (sanitized Markdown)                                                                                                                                                                                                                                                                                                               | `/v1/reports`                    |
| `/metodologia`                                      | Sources, allocation, BRL loss, limitations, privacy                                                                                                                                                                                                                                                                                                | —                                |
| `/newsletter/confirmar`, `/newsletter/descadastrar` | Read `?token=` and call the API                                                                                                                                                                                                                                                                                                                    | `/v1/newsletter/*`               |
| `/admin`                                            | Pipeline loads, create/publish reports, revalidate the cache                                                                                                                                                                                                                                                                                       | `/v1/admin/*`                    |
| `GET /api/search?q=`                                | Busca de usinas para o seletor da página de comparação                                                                                                                                                                                                                                                                                             | `/v1/plants`                     |
| `POST /api/revalidate`                              | On-demand revalidation (called by the API)                                                                                                                                                                                                                                                                                                         | —                                |

SEO: `sitemap.xml` (fixed pages, states, reports and every plant; it tolerates the API being
down), `robots.txt`, per-page metadata (title, description, canonical, Open Graph) and JSON-LD
(`Dataset` on the data pages, `Article` on reports).

## Running

Requires Node.js 22+ (CI uses 24) and pnpm 10 (`npm install -g pnpm@10.34.6` or
`corepack enable`).

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Adjust `API_URL` and the other variables in `.env.local`. The site runs on
`http://localhost:3000`. With `energia-api` running on `http://127.0.0.1:8000` the pages show
real data; without it they show "dados indisponíveis" and nothing breaks.

| Command                                  | What it does                                             |
| ---------------------------------------- | -------------------------------------------------------- |
| `pnpm dev` / `pnpm build` / `pnpm start` | Next.js                                                  |
| `pnpm lint`                              | ESLint                                                   |
| `pnpm typecheck`                         | `tsc --noEmit`                                           |
| `pnpm format` / `pnpm format:check`      | Prettier                                                 |
| `pnpm test`                              | Vitest                                                   |
| `pnpm gen:api`                           | Generates `src/lib/api/schema.d.ts` from the API OpenAPI |

### API types

`src/lib/api/types.ts` holds the hand-written types from the contract. `pnpm gen:api`
generates `src/lib/api/schema.d.ts` with `openapi-typescript`, reading (in this order)
`OPENAPI_SOURCE`, `../energia-api/openapi.json` or `http://localhost:8000/openapi.json`. In
`energia-api`, `uv run python -m app.export_openapi openapi.json` exports the file.
`src/lib/api/schema-compat.ts` compares both at compile time: if the API changes a payload,
`pnpm typecheck` fails.

## Environment variables

| Variable                                                        | Purpose                                                                 |
| --------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `API_URL`                                                       | `energia-api` URL (server only). Default `http://127.0.0.1:8000`        |
| `NEXT_PUBLIC_SITE_URL`                                          | Public URL (canonical, OG, sitemap)                                     |
| `NEXT_PUBLIC_CONTACT_EMAIL`                                     | Privacy contact (LGPD) shown on `/privacidade`                          |
| `REVALIDATE_SECRET`                                             | Secret of `POST /api/revalidate`; the same value configured in the API  |
| `WEB_API_SECRET`                                                | Same value as the API; forwards the visitor IP for the newsletter limit |
| `AUTH_SECRET`                                                   | Session encryption key (Auth.js)                                        |
| `AUTH_COGNITO_ID`, `AUTH_COGNITO_SECRET`, `AUTH_COGNITO_ISSUER` | Cognito app client                                                      |
| `AUTH_URL`                                                      | Optional outside Vercel                                                 |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (+ `NEXT_PUBLIC_PLAUSIBLE_SRC`)  | Enables Plausible                                                       |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID` + `NEXT_PUBLIC_UMAMI_SRC`        | Enables Umami                                                           |

Without the Cognito variables, `/admin` says authentication is not configured. Without the
analytics variables, no third-party script is loaded.

## Data and cache (ISR)

Every API call goes through `src/lib/api/client.ts`, on the server, with
`fetch(API_URL + path, { next: { tags, revalidate: 3600 } })`. Tags:

- `curtailment`: monthly series (SIN, state, plant) and months;
- `plants`: search, plant pages and rankings;
- `reports`: reports.

Responses stay in the data cache for up to a day; pages are regenerated at most every hour
(reusing the cache), so a page generated while the API was down recovers on its own. Dynamic
pages (`/estados/[uf]`, `/usinas/[slug]`, `/relatorios/[slug]`) are not generated at build
time: each one is rendered on first access and then cached. That is why the build does not
depend on the API.

Admin and newsletter calls use `cache: "no-store"`.

## How revalidation works

1. After each load, `energia-data` calls `POST {API_URL}/v1/admin/revalidate` with
   `{"tags": ["curtailment", "plants"]}`.
2. The API clears its own cache and calls `POST {WEB_URL}/api/revalidate` with the
   `x-revalidate-secret` header and the same body.
3. This portal compares the secret in constant time and calls `revalidateTag` for each tag
   (no body or an empty `tags` list: all three).

```bash
curl -X POST http://localhost:3000/api/revalidate \
  -H "x-revalidate-secret: $REVALIDATE_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"tags": ["curtailment", "plants"]}'
```

It answers `{"revalidated":true,"tags":["curtailment","plants"],"at":"..."}`. Errors: `401`
wrong or missing secret, `400` invalid JSON or tag, `503` `REVALIDATE_SECRET` not set. When a
report is published from the admin area, the portal revalidates the `reports` tag right away.

## Admin

OAuth sign-in (authorization code with PKCE) against Cognito through Auth.js v5; session in an
encrypted `httpOnly` cookie. The Cognito _access token_ lives inside the cookie and is only
read on the server to call `/v1/admin/*`; it never reaches the browser. The API requires the
`admin` group. Callback to register on the app client: `{SITE_URL}/api/auth/callback/cognito`.
There is no automatic token refresh: when it expires (1 h by default in Cognito), the admin
signs in again.

## Privacy

No public sign-in and no tracking cookies. The newsletter only stores the e-mail address, with
explicit consent (LGPD), e-mail confirmation (double opt-in) and one-click unsubscribe.

## CI and deployment

`.github/workflows/ci.yml` runs on every push, pull request and manual run (_Actions → pipeline
→ Run workflow_):

| Job                               | What it checks                         |
| --------------------------------- | -------------------------------------- |
| Lint                              | ESLint and `prettier --check`          |
| Type check                        | `tsc --noEmit`                         |
| Tests                             | Vitest                                 |
| Build                             | `next build` without the API           |
| Dependency audit                  | `pnpm audit --prod --audit-level high` |
| Secrets and misconfiguration scan | Trivy over the repository              |

`package.json` overrides the `postcss` bundled with Next.js (`next>postcss`) with a patched
release until Next.js ships one.

**Deployment.** Vercel still builds a preview for every pull request through its GitHub
integration, but `vercel.json` turns off its automatic production deployments from `main`.
Production goes through the pipeline: on `main`, once `VERCEL_PROJECT_ID` is set,
**Deploy to production** waits for approval in the `production` environment and then runs
`vercel pull`, `vercel build --prod` and `vercel deploy --prebuilt --prod`. Required settings:
secret `VERCEL_TOKEN`; variables `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`; environment `production`
with required reviewers. Set the runtime variables above on Vercel (`API_URL`,
`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CONTACT_EMAIL`, `REVALIDATE_SECRET`, `WEB_API_SECRET`,
`AUTH_*`, analytics).

## Accounts and gated pages

The dashboard, states, plants, compare, reports, analyses and account pages sit in the
`src/app/(membros)` route group and need a free account. The landing page, sign-up, login,
methodology and privacy pages are public.

- `src/middleware.ts` redirects to `/entrar?proximo=...` when the `spillway_session` cookie is
  missing; the group layout then validates the session against the API (`/v1/auth/me`), so a
  forged cookie is rejected too. Pages in the group are dynamic on purpose.
- Sign-up, login, logout, password reset and account deletion are server actions in
  `src/lib/auth-actions.ts`. The session token lives in an `httpOnly` cookie.
- The header reads `/api/session` after load, so public pages stay static.
- Data routes of the API are still public: the gate captures leads, it does not protect the data.
