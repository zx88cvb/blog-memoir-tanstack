import * as fs from "node:fs";
import * as path from "node:path";

export const isProduction = process.env.NODE_ENV === "production";

export const isCloudflareWorker =
	typeof globalThis !== "undefined" && "Cloudflare" in globalThis;

/**
 * Load server-only env files in the existing priority order:
 * .env.local > .env.{development,production} > .env
 *
 * Earlier files win — if a key is already set, later files don't overwrite.
 * Leave VITE_* to Vite: writing file values into process.env would make them
 * override subsequent file edits when the dev server reloads its configuration.
 */
export function loadEnvFiles() {
	const nodeEnv = process.env.NODE_ENV || "development";
	const files = [".env.local", `.env.${nodeEnv}`, ".env"];

	for (const file of files) {
		const envPath = path.resolve(file);
		if (!fs.existsSync(envPath)) continue;
		const content = fs.readFileSync(envPath, "utf-8");
		for (const line of content.split("\n")) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith("#")) continue;
			const eqIndex = trimmed.indexOf("=");
			if (eqIndex === -1) continue;
			const key = trimmed.slice(0, eqIndex).trim();
			if (key.startsWith("VITE_")) continue;
			let value = trimmed.slice(eqIndex + 1).trim();
			// Strip surrounding quotes (single or double)
			if (
				(value.startsWith('"') && value.endsWith('"')) ||
				(value.startsWith("'") && value.endsWith("'"))
			) {
				value = value.slice(1, -1);
			}
			if (!process.env[key]) {
				process.env[key] = value;
			}
		}
	}
}
