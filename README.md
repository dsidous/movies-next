# Watch

[Bun](https://bun.sh/) · [Next.js](https://nextjs.org/) · [React](https://react.dev/) · [TypeScript](https://www.typescriptlang.org/) · [Tailwind CSS](https://tailwindcss.com/) · [shadcn/ui](https://ui.shadcn.com/) · [Clerk](https://clerk.com/) · [Supabase](https://supabase.com/) · [Drizzle ORM](https://orm.drizzle.team/) · [Vercel](https://vercel.com/) · [TMDB](https://www.themoviedb.org/)

A Next.js app for browsing movies, TV series, and people using [The Movie Database (TMDB)](https://www.themoviedb.org/) API data. Authentication and user data use **Clerk**; **PostgreSQL** is managed with **Supabase** and accessed through **Drizzle**. The UI layer follows **shadcn/ui** patterns (Radix primitives + Tailwind). The app is designed to run on **Vercel**.

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
| **Deployment**                     | [Vercel](https://vercel.com/) — Next.js hosting, env vars, serverless/edge compatible with Clerk and Supabase                                                                                                                                                                                                                         |
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

## Environment

Configure secrets in a local `.env` file (or in **Vercel** project settings for production). Typical variables:

- **TMDB** — API base URL and token for movie/TV data
- **Clerk** — `NEXT_PUBLIC_CLERK_*` and `CLERK_SECRET_KEY` (and webhook secret if using Clerk webhooks)
- **Supabase / Postgres** — `DATABASE_URL` (e.g. Supabase **Settings → Database → Connection string** in URI form for Drizzle)

## Project layout (high level)

- `app/` — App Router pages and layouts
- `components/` — React components (shadcn-style UI under `components/ui/`, providers under `components/providers/`)
- `db/` — Drizzle schema (`schema.ts`), DB client, migrations
- `lib/` — Shared utilities; `lib/actions/` — Server Actions (TMDB, watchlist, discover pagination)
- `services/` — TMDB client/schemas (`services/tmdb/`), app services (watchlist, users) using Drizzle

