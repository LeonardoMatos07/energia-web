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

Public pages (no account, indexable, rendered with ISR):

| Route                               | Content                                                                                   | API                              |
| ----------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------- |
| `/`                                 | Landing page: headline, national numbers of the latest month, what a free account unlocks | `/v1/curtailment/subsystems`     |
| `/painel`                           | National dashboard: period filter, indicators, monthly series by source and subsystem     | `/v1/curtailment/subsystems`     |
| `/estados`, `/estados/[uf]`         | State monthly series (total/wind/solar), plant ranking, reasons                           | `/v1/curtailment/states/{state}` |
| `/usinas`                           | Search with state and source filters, paginated (dynamic: it reads the query string)      | `/v1/plants`                     |
| `/usinas/[slug]`                    | Registry data, history (verified × curtailed), reasons, comparison with the state average | `/v1/plants/{slug}`              |
| `/relatorios`, `/relatorios/[slug]` | Monthly reports (sanitized Markdown), all years in the HTML with a year selector          | `/v1/reports`                    |
| `/metodologia`, `/privacidade`      | Methodology and privacy policy                                                            | —                                |
| `/cadastro`, `/entrar`              | Sign-up (profile, 6-digit e-mail code), login, password reset (`/esqueci-a-senha`)        | `/v1/auth/*`                     |
| `/newsletter/*`                     | Confirm and unsubscribe (`?token=`)                                                       | `/v1/newsletter/*`               |

Pages that need a free account (`src/app/(membros)`):

| Route       | Content                                                                                                                                         | API                                        |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `/comparar` | Up to 6 items (states, subsystems, plants), any metrics, as lines, bars or pie. The whole state is in the URL (`?itens=…&metricas=…&grafico=…`) | `/v1/plants/{slug}`, `/v1/curtailment/*`   |
| `/analises` | Compensable share of the cut, ranking by company and connection point, hourly profile                                                           | `/v1/rankings/*`, `/v1/curtailment/hourly` |
| `/conta`    | Profile and account deletion                                                                                                                    | `/v1/auth/me`                              |

Other routes: `/admin` and `/admin/uso` (Cognito admin: loads, reports, cache, usage statistics),
`GET /api/search?q=` (plant search for the compare page), `GET /api/session`, `POST /api/track`
(usage events) and `POST /api/revalidate` (called by the API).

Public pages show a call to action ("Crie uma conta grátis para comparar usinas, ver a série
horária e exportar") to visitors without a session; it disappears when `/api/session` says there is
one.

### SEO

- `sitemap.xml`: the fixed pages, the 27 states, every report and every plant (paginated through
  the API). Each source is read independently: if the API is down, the reports and the plants are
  left out and the sitemap still lists the fixed pages and the states. It is regenerated every
  hour, so a failure does not stay for long.
- `robots.txt`: allows everything except `/admin`, `/api/`, the token pages and the pages that
  need an account.
- Per-page metadata (title, description, canonical, Open Graph) through `pageMetadata`, and JSON-LD
  (`Dataset` on the dashboard, state and plant pages, `Article` on reports).
- A custom period (`?de=2026-01&ate=2026-06`) on `/painel`, `/estados/[uf]` and `/usinas/[slug]`
  is rendered by a dynamic variant (`…/periodo`, selected by the middleware with a rewrite, the URL
  does not change). The variant is `noindex` and its canonical URL is the page without a period, so
  Google only indexes the static page.

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
(reusing the cache), so a page generated while the API was down recovers on its own. The pages
with a route parameter (`/estados/[uf]`, `/usinas/[slug]`, `/relatorios/[slug]`) are not generated at build
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

The data pages are open; comparing, the hourly series and exports need a free account (see below).
The site stores: the newsletter e-mail (double opt-in, one-click unsubscribe); the account profile
(password only as a scrypt hash, e-mail verified with a 6-digit code); and a usage log
(`usage_event`: pages, filters, searches, comparisons, clicks, time on page; IP only as a keyed
hash). Own cookies only, no third parties: `spillway_vid` (visitor, 1 year), `spillway_sid` (visit,
30 minutes) and `spillway_session` (login, up to 14 days). Visitors without an account who send
Do Not Track or Global Privacy Control are not measured. The wording lives in
`src/app/privacidade/page.tsx` and must be updated with any change to what is collected.

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

Only `/comparar`, `/analises` and `/conta` (the `src/app/(membros)` route group) need a free
account. Everything else, including the dashboard, states, plants and reports, is public and static
so search engines can index it.

- `src/middleware.ts` redirects those three prefixes to `/entrar?proximo=...` when the
  `spillway_session` cookie is missing (`src/lib/route-access.ts` holds the list); the group layout
  then validates the session against the API (`/v1/auth/me`), so a forged cookie is rejected too.
  The group is dynamic on purpose. The middleware also records every page view (`page.view`, or
  `page.gated` for a blocked visit).
- Public pages must not read cookies or headers, or they stop being static. The header and the
  call to action read the session in the browser through `/api/session` (`src/lib/session-store.ts`).
- Sign-up, login, logout, password reset and account deletion are server actions in
  `src/lib/auth-actions.ts`. The session token lives in an `httpOnly` cookie.
- Data routes of the API are still public: the gate captures leads, it does not protect the data.
