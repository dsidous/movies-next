# Watch

[![Bun](https://img.shields.io/badge/Bun-1.x-000000?style=flat-square&logo=bun&logoColor=white)](https://bun.sh/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-components-000000?style=flat-square)](https://ui.shadcn.com/)
[![Clerk](https://img.shields.io/badge/Clerk-auth-6C47FF?style=flat-square&logo=clerk&logoColor=white)](https://clerk.com/)
[![Drizzle](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=flat-square&logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Supabase](https://img.shields.io/badge/Supabase-host-3FCF8E?style=flat-square&logo=supabase&logoColor=black)](https://supabase.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack-Query-FF4154?style=flat-square&logo=tanstack&logoColor=white)](https://tanstack.com/query/latest)
[![Zod](https://img.shields.io/badge/Zod-4-3B82F6?style=flat-square&logo=zod&logoColor=white)](https://zod.dev/)
[![ESLint](https://img.shields.io/badge/ESLint-9-4B32C3?style=flat-square&logo=eslint&logoColor=white)](https://eslint.org/)
[![SST](https://img.shields.io/badge/SST-Ion-5945FF?style=flat-square)](https://sst.dev/)
[![AWS](https://img.shields.io/badge/AWS-hosting-FF9900?style=flat-square&logo=amazonwebservices&logoColor=white)](https://aws.amazon.com/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-DNS-F38020?style=flat-square&logo=cloudflare&logoColor=white)](https://www.cloudflare.com/)
[![TMDB](https://img.shields.io/badge/TMDB-API-01D277?style=flat-square&logo=themoviedatabase&logoColor=white)](https://www.themoviedb.org/)

A Next.js app for browsing movies, TV series, and people using [The Movie Database (TMDB)](https://www.themoviedb.org/) API data. Authentication and user data use **Clerk**; **PostgreSQL** is managed with **Supabase** and accessed through **Drizzle**. The UI layer follows **shadcn/ui** patterns (Radix primitives + Tailwind). Production is deployed with **[SST](https://sst.dev/)** as **`sst.aws.Nextjs`** on **AWS**, with **Cloudflare** handling DNS for the custom domain configured in **`sst.config.ts`**.

## Tech stack


| Area                               | Technologies                                                                                                                                                                                                                                                                                                                         |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Runtime & package manager**      | [Bun](https://bun.sh/)                                                                                                                                                                                                                                                                                                               |
| **Framework**                      | [Next.js](https://nextjs.org/) 16 (App Router, React Server Components)                                                                                                                                                                                                                                                              |
| **UI library**                     | [React](https://react.dev/) 19                                                                                                                                                                                                                                                                                                       |
| **Language**                       | [TypeScript](https://www.typescriptlang.org/) 5                                                                                                                                                                                                                                                                                      |
| **Styling**                        | [Tailwind CSS](https://tailwindcss.com/) 4, [PostCSS](https://postcss.org/), [tw-animate-css](https://github.com/Wombosvideo/tw-animate-css)                                                                                                                                                                                         |
| **Components & primitives**        | [shadcn/ui](https://ui.shadcn.com/)-style kit under `components/ui/` ([Radix UI](https://www.radix-ui.com/) primitives, [radix-ui](https://www.npmjs.com/package/radix-ui) package), [cmdk](https://cmdk.paco.me/) (command palette)                                                                                                                                                                  |
| **Icons**                          | [Lucide React](https://lucide.dev/)                                                                                                                                                                                                                                                                                                  |
| **Class names**                    | [clsx](https://github.com/lukeed/clsx), [tailwind-merge](https://github.com/dcastil/tailwind-merge), [class-variance-authority](https://cva.style/)                                                                                                                                                                                  |
| **Validation & API types**         | [Zod](https://zod.dev/) 4                                                                                                                                                                                                                                                                                                            |
| **Authentication**                 | [Clerk](https://clerk.com/) (`@clerk/nextjs`) — sign-in, sessions, webhooks; users/watchlist tied to Clerk user ids in Postgres                                                                                                                                                                                                      |
| **Database**                       | [Supabase](https://supabase.com/) **Postgres** (connection string via `DATABASE_URL`); schema and queries with [Drizzle ORM](https://orm.drizzle.team/) (`drizzle-orm`, `postgres` driver); migrations in `db/migrations`, [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview) for generate/migrate/studio                     |
| **Deployment**                     | [SST (Ion)](https://sst.dev/) — [`sst.aws.Nextjs`](https://sst.dev/docs/component/aws/nextjs/) on AWS; GitHub Actions runs `npx sst install` then `npx sst deploy --stage prod`; custom domain DNS via [Cloudflare](https://www.cloudflare.com/). Config lives in **`sst.config.ts`**.                                                                                                                      |
| **Server data & mutations**        | [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations) (`'use server'` modules under `lib/actions/`) — TMDB and app data stay on the server                                                                                                                         |
| **Client-side fetching & caching** | [TanStack Query](https://tanstack.com/query/latest) v5 (`@tanstack/react-query`) — `[QueryClientProvider](components/providers/query-provider.tsx)` in the root layout; `[useInfiniteQuery](https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries)` for paginated lists (popular people, movie/TV discover) |
| **API integration**                | TMDB REST API (fetch via `services/tmdb/`), optional [openapi-typescript](https://github.com/openapi-ts/openapi-typescript) in dev                                                                                                                                                                                                   |
| **Linting & formatting**           | [ESLint](https://eslint.org/) 9 (with `eslint-config-next`, `eslint-config-prettier`), [Prettier](https://prettier.io/) 3 (with [prettier-plugin-tailwindcss](https://github.com/tailwindlabs/prettier-plugin-tailwindcss), [@trivago/prettier-plugin-sort-imports](https://github.com/trivago/prettier-plugin-sort-imports))        |
| **Images**                         | [Next.js Image](https://nextjs.org/docs/app/api-reference/components/image) (`sharp` via Next)                                                                                                                                                                                                                                       |


## Scripts

- `bun run dev` — start the development server
- `bun run build` — production build
- `bun run start` — start the production server
- `bun run lint` — run ESLint
- `bun run format` / `bun run format:check` — format or check with Prettier
- `bun run db:generate` / `db:migrate` / `db:push` / `db:studio` — Drizzle schema migrations and [Drizzle Studio](https://orm.drizzle.team/drizzle-studio/overview)

## Environment (local development)

Put values in a **`.env`** file at the repo root (ignored by Git). Typical keys:

- **TMDB** — `TMDB_BASE_URL`, `TMDB_API_TOKEN`
- **AI search (Next.js)** — `AI_SEARCH_BASE_URL` (e.g. `http://localhost:8000`), optional `AI_SEARCH_SERVICE_KEY` (must match the Python service if set)
- **Clerk** — `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and `CLERK_WEBHOOK_SECRET` if you use Clerk webhooks
- **Supabase / Postgres** — `DATABASE_URL` (Supabase **Settings → Database → Connection string**, URI form for Drizzle), plus `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` if your app expects them at runtime

If you only develop locally (`bun dev`) and rely on CI for deployment, you do **not** need AWS credentials, Cloudflare tokens, or `SST_*` variables unless you run SST CLI commands (`sst dev`, deploy, etc.) on your machine.

### AI search microservice (local)

Natural-language search uses a **separate Python FastAPI service** in [`ai-search/`](ai-search/). It is **not** deployed with the Next.js app.

1. Set up and run the Python service — see [`ai-search/README.md`](ai-search/README.md)
2. Add `AI_SEARCH_BASE_URL=http://localhost:8000` to your root `.env`
3. Run both: `bun run ai-search:dev` and `bun dev`

LLM API keys (`AI_API_KEY`) belong in `ai-search/.env` only — never in Next.js or GitHub Actions deploy secrets.

If `AI_SEARCH_BASE_URL` is unset, search falls back to direct TMDB lookup with the raw query.

## Deployment (AWS + SST)

Production deploys via **GitHub Actions** ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)).

- **When:** pushes to **`main`** and manual **workflow dispatch**
- **Steps (summary):** `bun install` → **`npx sst install`** (providers; generates `.sst/` locally/on the runner) → **`npx sst deploy --stage prod --print-logs`**
- **App / infra:** defined in **`sst.config.ts`** (`$config`, **`sst.aws.Nextjs`** with **`sst.cloudflare.dns()`** for the custom domain).

### GitHub Actions — Variables (`Settings → Secrets and variables → Actions → Variables`)

| Variable                    | Notes                                                                                             |
| --------------------------- | ------------------------------------------------------------------------------------------------- |
| **`SST_SITE_DOMAIN`**       | **Required.** Hostname served in production (e.g. `watch.example.com`). The workflow exits early if unset. |
| `SST_APP_NAME`                        | Optional; defaults in `sst.config.ts`.                                                         |
| `SST_NEXTJS_NAME`                     | Optional SST component logical name; default in config.                                          |
| `SST_CLOUDFLARE_PROVIDER_VERSION` | Optional Pulumi Cloudflare provider version string; default in config.                     |
| `SST_RETAIN_STAGES`         | Optional comma-separated stage names using `retain`; default handles `production` and `prod`.     |

Use **repository** variables unless you introduce GitHub Environments (staging vs prod) with different domains.

### GitHub Actions — Secrets (`Settings → Secrets and variables → Actions → Secrets`)

| Secret                                      | Purpose                                                                 |
| ------------------------------------------- | ----------------------------------------------------------------------- |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | Deploy to AWS from the workflow                                        |
| `CLOUDFLARE_API_TOKEN`                      | Cloudflare DNS for the custom domain                                    |
| `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET` | Clerk (server); passed through to Next.js via `sst.config.ts` environment block |
| `DATABASE_URL`                              | Postgres (e.g. Supabase)                                                 |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`       | Clerk (publishable key at build/runtime)                                   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_URL` | Supabase                                                             |
| `TMDB_API_TOKEN`, `TMDB_BASE_URL`          | TMDB API                                                                |
| `AI_SEARCH_BASE_URL`, `AI_SEARCH_SERVICE_KEY` | URL of the Modal-hosted AI search service (optional key for auth) |
| `MODAL_TOKEN_ID`, `MODAL_TOKEN_SECRET` | Deploy `ai-search/` to Modal ([`.github/workflows/deploy-ai-search.yml`](.github/workflows/deploy-ai-search.yml)) |

The Next.js deploy workflow does **not** build or deploy `ai-search/`. AI search deploys separately to **Modal** on pushes to `main` that touch `ai-search/**`. Set `AI_SEARCH_BASE_URL` to the Modal web URL after the first deploy — see [`ai-search/README.md`](ai-search/README.md).

### Fresh clone / SST typings

Running **`npx sst install`** once generates `.sst/platform/config.d.ts` (gitignored); `sst.config.ts` references it for `$config` and `sst` globals—see [SST Config](https://sst.dev/docs/reference/config/).

## Project layout (high level)

- `app/` — App Router pages and layouts
- `components/` — React components (shadcn-style UI under `components/ui/`, providers under `components/providers/`)
- `db/` — Drizzle schema (`schema.ts`), DB client, migrations
- `lib/` — Shared utilities; `lib/actions/` — Server Actions (TMDB, watchlist, discover pagination)
- `services/` — TMDB client/schemas (`services/tmdb/`), AI search client (`services/ai-search/`), app services (watchlist, users) using Drizzle
- `ai-search/` — Python FastAPI microservice for natural-language search (deployed to Modal via `.github/workflows/deploy-ai-search.yml`)
- `sst.config.ts` — SST app metadata, **`sst.aws.Nextjs`**, environment variables forwarded to AWS, Cloudflare-backed domain
- `.github/workflows/deploy.yml` — CI deploy pipeline

