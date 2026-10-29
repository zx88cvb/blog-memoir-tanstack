import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { loadEnv } from "vite";
import { loadEnvFiles } from "../src/lib/env.ts";

async function withEnvFiles(run: (directory: string) => Promise<void>) {
	const directory = await mkdtemp(join(tmpdir(), "blog-env-test-"));
	const cwd = process.cwd();
	const keys = [
		"NODE_ENV",
		"VITE_DEFAULT_THEME",
		"BLOG_ENV_LOCAL_PROBE",
		"BLOG_ENV_MODE_PROBE",
		"BLOG_ENV_BASE_PROBE",
		"BLOG_ENV_EXPLICIT_PROBE",
	];
	const previous = new Map(keys.map((key) => [key, process.env[key]]));
	try {
		for (const key of keys) delete process.env[key];
		process.env.NODE_ENV = "test";
		process.chdir(directory);
		await run(directory);
	} finally {
		process.chdir(cwd);
		for (const [key, value] of previous) {
			if (value === undefined) delete process.env[key];
			else process.env[key] = value;
		}
		await rm(directory, { recursive: true, force: true });
	}
}

test("public file values stay out of process.env and Vite reads theme edits", async () => {
	await withEnvFiles(async (directory) => {
		const localFile = join(directory, ".env.local");
		await writeFile(localFile, "VITE_DEFAULT_THEME=light\n");
		loadEnvFiles();
		assert.equal(process.env.VITE_DEFAULT_THEME, undefined);
		assert.equal(loadEnv("test", directory).VITE_DEFAULT_THEME, "light");
		await writeFile(localFile, 'VITE_DEFAULT_THEME="dark"\n');
		loadEnvFiles();
		assert.equal(process.env.VITE_DEFAULT_THEME, undefined);
		assert.equal(loadEnv("test", directory).VITE_DEFAULT_THEME, "dark");
		await writeFile(localFile, "VITE_DEFAULT_THEME=system\n");
		loadEnvFiles();
		assert.equal(loadEnv("test", directory).VITE_DEFAULT_THEME, "system");
	});
});

test("server variables keep local, mode, base and explicit process precedence", async () => {
	await withEnvFiles(async (directory) => {
		await writeFile(
			join(directory, ".env"),
			"BLOG_ENV_LOCAL_PROBE=base\nBLOG_ENV_MODE_PROBE=base\nBLOG_ENV_BASE_PROBE=base\nBLOG_ENV_EXPLICIT_PROBE=base\n",
		);
		await writeFile(
			join(directory, ".env.test"),
			"BLOG_ENV_LOCAL_PROBE=mode\nBLOG_ENV_MODE_PROBE=mode\n",
		);
		await writeFile(
			join(directory, ".env.local"),
			'BLOG_ENV_LOCAL_PROBE="local"\nBLOG_ENV_EXPLICIT_PROBE=file\n',
		);
		process.env.BLOG_ENV_EXPLICIT_PROBE = "process";
		loadEnvFiles();
		assert.equal(process.env.BLOG_ENV_LOCAL_PROBE, "local");
		assert.equal(process.env.BLOG_ENV_MODE_PROBE, "mode");
		assert.equal(process.env.BLOG_ENV_BASE_PROBE, "base");
		assert.equal(process.env.BLOG_ENV_EXPLICIT_PROBE, "process");
	});
});

test("Vite mode-local files and explicit public process values retain priority", async () => {
	await withEnvFiles(async (directory) => {
		for (const [name, theme] of [
			[".env", "light"],
			[".env.test", "light"],
			[".env.local", "dark"],
			[".env.test.local", "system"],
		]) {
			await writeFile(join(directory, name), `VITE_DEFAULT_THEME=${theme}\n`);
		}
		loadEnvFiles();
		assert.equal(loadEnv("test", directory).VITE_DEFAULT_THEME, "system");
		process.env.VITE_DEFAULT_THEME = "dark";
		loadEnvFiles();
		assert.equal(loadEnv("test", directory).VITE_DEFAULT_THEME, "dark");
	});
});
