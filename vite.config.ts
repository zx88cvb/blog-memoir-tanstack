import { defineConfig } from 'vite'
// import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import mdx from '@mdx-js/rollup';

import { loadEnvFiles } from './src/lib/env.ts';

loadEnvFiles();

const config = defineConfig({
  server: {
    port: 3000,
    // Cloud sandboxes (ShipAny Code / e2b) proxy the dev server through a
    // per-sandbox subdomain; without this Vite's host check blocks the
    // preview with "Blocked request. This host is not allowed."
    allowedHosts: ['.e2b.app'],
  },
  resolve: { tsconfigPaths: true },
  plugins: [
    // devtools(),
    // MDX must run before the react plugin so JSX in compiled MDX gets transformed.
    { enforce: 'pre', ...mdx({ providerImportSource: '@mdx-js/react' }) },
    nitro({ rollupConfig: { external: [/^@sentry\//] } }),
    tailwindcss(),
    paraglideVitePlugin({ project: './project.inlang' }),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
