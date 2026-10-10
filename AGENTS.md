# Repository Guidelines

## Project Structure & Module Organization

This template uses React 19, TypeScript, TanStack Start/Router, Vite, Nitro, and Tailwind CSS 4.

- `src/routes/`: file-based pages, layouts, and server endpoints; `__root.tsx` defines the root shell.
- `src/components/`: shared UI, layout, and feature components; `ui/` contains reusable primitives.
- `src/lib/`: utilities; `src/core/`: localization and storage adapters; `src/config/`: application defaults.
- `content/pages/`: localized MDX pages; `messages/`: English, Japanese, and Simplified Chinese translations; `project.inlang/`: localization configuration.
- `public/`: static assets; `src/styles.css`: global styles.

Treat `src/routeTree.gen.ts` and Paraglide output directories as generated files; change their sources instead.

## Build, Test, and Development Commands

Use pnpm 10, matching the Dockerfile and tracked `pnpm-lock.yaml`.

- `pnpm install --frozen-lockfile`: install locked dependencies.
- `pnpm dev`: start development on port 3000.
- `pnpm build`: create the production build.
- `pnpm preview`: preview the build locally.
- `pnpm check`: run Biome formatting, lint, and import checks.
- `pnpm format --write`: apply Biome formatting.
- `pnpm exec tsc --noEmit`: check TypeScript types.
- `pnpm generate-routes`: regenerate the route tree.
- `pnpm i18n:generate` / `pnpm check:i18n`: compile translations / validate localization.

## Coding Style & Naming Conventions

Follow Biome: tab indentation, double quotes in JavaScript/TypeScript, and organized imports. TypeScript uses strict checking. Use PascalCase component names, camelCase functions and variables, and kebab-case component filenames such as `theme-toggle.tsx`. Follow TanStack file-routing conventions. Use configured `@/` or `#/` aliases for source imports and Tailwind utilities for styling.

## Testing Guidelines

No automated test framework, test script, or coverage threshold is currently configured. Validate changes with `pnpm check`, type checking, and `pnpm build`; manually exercise affected routes, locale switching, and responsive layouts. If adding tests, use descriptive `*.test.ts` or `*.test.tsx` names and document the runner command.

## Commit & Pull Request Guidelines

Recent commits use `feat: init`. Continue the `type: description` pattern with specific summaries, such as `fix: correct locale redirect`. Keep changes focused. PRs should describe behavior, link relevant issues, list validation performed, and include screenshots for UI changes.

## Security & Configuration

Use `env.example` to configure local environment files. Never commit secrets; only expose public values through `VITE_*` variables. Keep translation keys consistent across all locale files.
