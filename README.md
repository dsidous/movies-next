# Movie Search

<div align="center">

[![Bun](https://img.shields.io/badge/Bun-1-000000?style=flat-square&logo=bun&logoColor=white)](https://bun.sh/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Radix UI](https://img.shields.io/badge/Radix_UI-1-161618?style=flat-square&logo=radixui&logoColor=white)](https://www.radix-ui.com/)
[![cmdk](https://img.shields.io/badge/cmdk-1.1-1E1E1E?style=flat-square)](https://cmdk.paco.me/)
[![Lucide](https://img.shields.io/badge/Lucide-1-000000?style=flat-square&logo=lucide&logoColor=white)](https://lucide.dev/)
[![Zod](https://img.shields.io/badge/Zod-4-3B82F6?style=flat-square&logo=zod&logoColor=white)](https://zod.dev/)
[![ESLint](https://img.shields.io/badge/ESLint-9-4B32C3?style=flat-square&logo=eslint&logoColor=white)](https://eslint.org/)
[![Prettier](https://img.shields.io/badge/Prettier-3-1A2C34?style=flat-square&logo=prettier&logoColor=F7B93E)](https://prettier.io/)
[![TMDB](https://img.shields.io/badge/TMDB-API-01D277?style=flat-square&logo=themoviedatabase&logoColor=white)](https://www.themoviedb.org/)

</div>

A Next.js app for browsing movies, TV series, and people using [The Movie Database (TMDB)](https://www.themoviedb.org/) API data.

## Tech stack

| Area | Technologies |
|------|----------------|
| **Runtime & package manager** | [Bun](https://bun.sh/) |
| **Framework** | [Next.js](https://nextjs.org/) 16 (App Router, React Server Components, Server Actions) |
| **UI library** | [React](https://react.dev/) 19 |
| **Language** | [TypeScript](https://www.typescriptlang.org/) 5 |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) 4, [PostCSS](https://postcss.org/), [tw-animate-css](https://github.com/Wombosvideo/tw-animate-css) |
| **Components & primitives** | [Radix UI](https://www.radix-ui.com/) (via [`radix-ui`](https://github.com/radix-ui/primitives) / [`@radix-ui/react-*`](https://www.npmjs.com/search?q=%40radix-ui)), [cmdk](https://cmdk.paco.me/) (command palette), [`@radix-ui/react-slot`](https://www.radix-ui.com/primitives/docs/utilities/slot) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Class names** | [clsx](https://github.com/lukeed/clsx), [tailwind-merge](https://github.com/dcastil/tailwind-merge), [class-variance-authority](https://cva.style/) |
| **Validation & API types** | [Zod](https://zod.dev/) 4 |
| **API integration** | TMDB REST API (fetch), optional [openapi-typescript](https://github.com/openapi-ts/openapi-typescript) in dev |
| **Linting & formatting** | [ESLint](https://eslint.org/) 9 (with `eslint-config-next`, `eslint-config-prettier`), [Prettier](https://prettier.io/) 3 (with [prettier-plugin-tailwindcss](https://github.com/tailwindlabs/prettier-plugin-tailwindcss), [@trivago/prettier-plugin-sort-imports](https://github.com/trivago/prettier-plugin-sort-imports)) |
| **Images** | [Next.js Image](https://nextjs.org/docs/app/api-reference/components/image) (`sharp` via Next) |

## Scripts

- `bun run dev` — start the development server
- `bun run build` — production build
- `bun run start` — start the production server
- `bun run lint` — run ESLint
- `bun run format` / `bun run format:check` — format or check with Prettier

## Environment

Configure TMDB (and any other) secrets in a local `.env` file; Next.js loads it automatically. The app expects access to the TMDB API (see the TMDB account settings for an API key).

## Project layout (high level)

- `app/` — App Router pages and layouts
- `components/` — React components (UI primitives under `components/ui/`)
- `lib/` — Shared utilities and server actions
- `services/tmdb/` — TMDB client, schemas, and feature modules
