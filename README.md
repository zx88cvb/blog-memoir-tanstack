# TanStack Template

**[English](README.md)** | [简体中文](README.zh-CN.md) | [日本語](README.ja.md)

A web application template built with **TanStack Start, React, and TypeScript**. Use it as a starting point for a multilingual website, product landing page, or small application. The example homepage combines Hero and FAQ blocks, with light and dark themes, MDX content pages, and basic SEO included.

![TanStack Template social preview](public/og.png)

## Features

- **File-based routing and server rendering**: TanStack Start + TanStack Router, with page loaders, server handlers, and client navigation.
- **Data fetching**: TanStack Query integrated with router SSR. Each server request gets a separate QueryClient; the browser reuses an instance.
- **Localization**: Paraglide / Inlang, with English, Japanese, Simplified Chinese, a language menu, and localized links.
- **Themes and components**: Tailwind CSS 4, Base UI, and Lucide icons. A teal palette with light, dark, and system initial theme settings.
- **Content and SEO**: About, privacy, and terms MDX pages in three languages; titles, descriptions, Open Graph, canonical URLs, hreflang, and JSON-LD.
- **Site endpoints**: `/robots.txt`, `/sitemap.xml`, `/llms.txt`, and `/manifest.webmanifest`.
- **Build and checks**: Vite, Nitro Node server output, and Biome.

The template does not currently include an account system, database, or payment flow. S3/R2 adapters and general utilities are available for optional use; they do not constitute an upload API. GA4 runs only in production when an ID is configured. Advertising components require explicit integration.

## Getting started

Use **Node.js 22.12+ (22.x)** and **pnpm 10**, matching the Dockerfile.

```bash
pnpm install --frozen-lockfile
cp env.example .env.local
pnpm dev
```

Open `http://localhost:3000`. The project uses `pnpm-lock.yaml`; keep the same package manager throughout development.

### Site configuration

Adjust public configuration in `.env.local`:

```dotenv
VITE_APP_URL=http://localhost:3000
VITE_APP_NAME=TanStack Template
VITE_APP_DESCRIPTION=A web application template built with TanStack Start, React, and TypeScript.
VITE_DEFAULT_LOCALE=en
VITE_DEFAULT_THEME=light
```

`src/config/index.ts` centralizes configuration and defaults. `VITE_*` variables can enter the client build, so never use them for secrets. GA4 uses the server variable `GOOGLE_ANALYTICS_ID`; leave it empty to disable tracking.

The custom loader in the Vite configuration reads `.env.local` → `.env.{NODE_ENV}` → `.env`. Existing nonempty process variables take priority. Do not commit credentials in environment files; use the ignored `.env.local` for local settings. Restart development after changing public configuration and rebuild before publishing.

## Architecture

| Layer | Technology and responsibility |
| --- | --- |
| Pages and routing | TanStack Start / Router: file routes, loaders, server rendering, navigation |
| Data | TanStack Query: request caching and SSR integration |
| Presentation | React 19 + TypeScript: page composition, feature blocks, shared components |
| Styling | Tailwind CSS 4 + Base UI: theme tokens, interaction primitives, responsive layouts |
| Localization | Paraglide / Inlang: message compilation, language cookies, localized URLs |
| Content | MDX: localized static pages and metadata |
| Build and runtime | Vite 8 + Nitro: client builds and Node server output |
| Code quality | Strict TypeScript checks + Biome formatting, import organization, and linting |

Requests first pass through the Paraglide middleware in `src/server.ts`, then reach TanStack Start. `src/router.tsx` connects the generated route tree, URL localization, and QueryClient. `__root.tsx` supplies the HTML document and site layout. Pages compose blocks, blocks handle copy and feature logic, and reusable presentation components receive content through props.

## Project structure

```text
src/
├── routes/                 # File routes, root layout, and site endpoints
│   └── (marketing)/(legal)/ # About, privacy, terms, and shared MDX loading
├── components/
│   ├── home/               # Homepage composition
│   ├── blocks/             # Hero, homepage FAQ, and site layout blocks
│   ├── faq/                # Locale-independent FAQ presentation
│   ├── layout/             # Header, footer, and mobile navigation
│   ├── shared/             # Shared components such as Logo
│   ├── ui/                 # Button, Accordion, Select, and other primitives
│   └── analytics/          # GA4 and advertising components
├── config/                 # Environment settings, locale display, SEO locale metadata
├── core/
│   ├── i18n/               # Localized navigation and dynamic message utilities
│   └── storage/            # S3 / R2 adapters and shared storage interfaces
├── integrations/           # TanStack Query provider and devtools
├── lib/                    # SEO, sitemap, request, cache, and other utilities
├── paraglide/              # Generated runtime and messages; do not edit manually
├── router.tsx              # Router and Query SSR integration
├── server.ts               # Server entry and locale middleware
├── routeTree.gen.ts        # Generated route tree
└── styles.css              # Tailwind entry, theme tokens, and global styles
content/pages/              # MDX content and meta in three languages
messages/                   # en.json, ja.json, zh-cn.json translation sources
project.inlang/             # Locales, message format, and Paraglide configuration
app/paraglide/              # Additional Paraglide output configured in Vite
public/                     # Logo, social image, favicon, flags, and static assets
```

At the root, `vite.config.ts` configures plugins and development, `tsconfig.json` defines type checking and the `@/` and `#/` source aliases, `biome.json` defines code conventions, and `Dockerfile` provides a Node deployment example. `AGENTS.md` is the contributor guide; `.impeccable.md` records design conventions. `.output/`, `.tanstack/`, `.nitro/`, and Inlang caches are generated artifacts.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start development on port 3000 |
| `pnpm build` | Build the client and Nitro server |
| `pnpm preview` | Preview the production build locally |
| `pnpm generate-routes` | Regenerate the route tree |
| `pnpm i18n:generate` | Compile translated messages and runtime |
| `pnpm check:i18n` | Check the localization project |
| `pnpm check` | Run Biome checks without rewriting files |
| `pnpm lint` | Run Biome lint checks |
| `pnpm format --write` | Apply Biome formatting |
| `pnpm exec tsc --noEmit` | Check TypeScript types |

`pnpm machine-translate` invokes Inlang machine translation. Review its service configuration first and check the results manually. No automated test framework or coverage threshold is currently configured. Unused-message checks may be incomplete for dynamic references and MDX; inspect actual references before deleting keys.

## Customization

### Add a page

Add a route file under `src/routes/` and put reusable content in components. Route groups such as `(marketing)` do not appear in URLs. `__root.tsx` defines the root layout; files prefixed with `-` can hold helpers excluded from routing. Do not edit `routeTree.gen.ts` manually.

```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/example")({
  component: () => <main id="main-content">Example</main>,
});
```

For internal navigation, prefer `Link` from `@/core/i18n/navigation` with a locale-free `href`, such as `/about`. English currently uses `/`, Japanese `/ja`, and Simplified Chinese `/zh-cn`.

### Translations and MDX

Update all three `messages/*.json` files with consistent keys, then run `pnpm i18n:generate`. Use static calls for known messages, such as `m["home.hero.title"]()`. Locales are configured in `project.inlang/settings.json`; URL strategies live in `project.inlang/paraglide.config.ts`. Application code uses `src/paraglide`; the extra `app/paraglide` output is not a translation source.

MDX pages live under `content/pages/`: `about.mdx` for English, `about.ja.mdx` for Japanese, and `about.zh-cn.mdx` for Chinese. Each exports `meta` with `title`, `description`, and `updated_at`. New content pages also need a corresponding route; follow the existing pages and shared `staticPageRouteOptions`.

### Themes and branding

`src/styles.css` defines the palette: warm white `#FAFAF7` for light mode, `#111816` for dark backgrounds, `#0F766E` for primary buttons, and `#2DD4BF` for dark-mode emphasis. The theme toggle saves visitor preferences, which override `VITE_DEFAULT_THEME`.

- `public/logo.png`: transparent header and footer logo, referenced directly by the shared Logo component.
- `public/og.png`: default social image; keep it at **1200 × 630**, matching the SEO metadata.
- `public/favicon.ico`: transparent browser icon derived from the current Logo, with 16, 32, 48, and 64px layers.
- Application icons: replace them separately for your brand and verify manifest paths before publishing.
- `src/lib/seo.ts`: shared page metadata; homepage titles and descriptions come from the `seo.home.*` translation keys.

## Build and deployment

```bash
pnpm build
node .output/server/index.mjs
```

The deployment directory is **`.output/`**, not `dist/`. Configure the running server through process variables such as `PORT` and `HOST`. Set the production site URL before building.

You can also use the repository's multi-stage Dockerfile:

```bash
docker build -t tanstack-template .
docker run --rm -p 3000:3000 --env-file .env.local tanstack-template
```

The Dockerfile uses Node 22, pnpm 10, and Nitro Node output. There is currently no `.dockerignore`; add exclusions before building an image to keep local environment files, Git data, and dependency directories out of the build context. Public configuration must still be determined at image build time.

## Publishing and contributing

Run type checks, Biome checks, and a production build after changes. Manually verify affected pages in all three languages, mobile layouts, both themes, and keyboard navigation. Biome uses tabs and double quotes; use PascalCase component names and kebab-case filenames.

Before publishing, replace sample content and complete operator details, privacy policies, and terms. Check the production domain, social image, sitemap, manifest icons, and `ads.txt` against your deployment. Keep commits focused and describe changes and validation in PRs; include screenshots for visual changes. See [AGENTS.md](AGENTS.md) for further conventions.
