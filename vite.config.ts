import { defineConfig } from "vite";

// import { devtools } from '@tanstack/devtools-vite'

import contentCollections from "@content-collections/vite";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";

import { loadEnvFiles } from "./src/lib/env.ts";

loadEnvFiles();

const config = defineConfig({
	server: {
		port: 3000,
		// per-sandbox subdomain; without this Vite's host check blocks the
		// preview with "Blocked request. This host is not allowed."
		allowedHosts: [".e2b.app"],
	},
	resolve: { tsconfigPaths: true },
	plugins: [
		// devtools(),
		contentCollections(),
		nitro({ rollupConfig: { external: [/^@sentry\//] } }),
		tailwindcss(),
		paraglideVitePlugin({
			project: "./project.inlang",
			outdir: "./src/paraglide",
			strategy: ["baseLocale"],
		}),
		tanstackStart(),
		viteReact(),
	],
});

export default config;
