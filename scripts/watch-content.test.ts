import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile, unlink, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const probe = new URL(
	"../content/blog/__migration-watch-probe.md",
	import.meta.url,
);
const generated = new URL(
	"../.content-collections/generated/allPosts.js",
	import.meta.url,
);
const content = (marker: string, published = true, updated?: string) =>
	`---\ntitle: "Migration watch probe"\ndate: "2026-10-01"\n${updated ? `updated: "${updated}"\n` : ""}tags: ["SearchTag"]\ncategories: ["Probe Category"]\npublished: ${published}\n---\n\n## 临时内容\n\n${marker} 正文特有词 MixedCase\n`;
async function until(check: () => Promise<boolean>, label: string) {
	for (let attempt = 0; attempt < 200; attempt++) {
		if (await check()) return;
		await new Promise<void>((resolve) => setTimeout(resolve, 100));
	}
	throw new Error(`Timed out: ${label}`);
}

test("Vite picks up added, edited, unpublished and deleted content", {
	timeout: 90000,
}, async () => {
	const reservation = createServer();
	await new Promise<void>((resolve) =>
		reservation.listen(0, "127.0.0.1", resolve),
	);
	const address = reservation.address();
	assert.ok(address && typeof address !== "string");
	const port = address.port;
	await new Promise<void>((resolve, reject) =>
		reservation.close((error) => (error ? reject(error) : resolve())),
	);
	const origin = `http://127.0.0.1:${port}`;
	let logs = "";
	const server = spawn(
		process.execPath,
		[
			fileURLToPath(
				new URL("../node_modules/vite/bin/vite.js", import.meta.url),
			),
			"--host",
			"127.0.0.1",
			"--port",
			String(port),
		],
		{
			env: { ...process.env, NODE_ENV: "development" },
			stdio: ["ignore", "pipe", "pipe"],
		},
	);
	server.stdout.on("data", (chunk) => {
		logs += chunk;
	});
	server.stderr.on("data", (chunk) => {
		logs += chunk;
	});
	let created = false;
	try {
		await until(async () => {
			try {
				return (await fetch(origin)).status === 200;
			} catch {
				return false;
			}
		}, "dev startup");
		await writeFile(probe, content("VERSION_ONE"), { flag: "wx" });
		created = true;
		await until(
			async () => (await readFile(generated, "utf8")).includes("VERSION_ONE"),
			"new collection entry",
		);
		const read = async () => {
			const response = await fetch(`${origin}/posts/__migration-watch-probe`);
			return { status: response.status, html: await response.text() };
		};
		await until(
			async () => (await read()).html.includes("VERSION_ONE"),
			"new article SSR",
		);
		assert.ok(!(await read()).html.includes('"dateModified"'));
		assert.ok(!(await read()).html.includes("article:modified_time"));
		await writeFile(probe, content("VERSION_TWO", true, "2026-10-27"));
		await until(
			async () => (await read()).html.includes("VERSION_TWO"),
			"updated article SSR",
		);
		const updatedHtml = (await read()).html;
		assert.ok(updatedHtml.includes('"dateModified":"2026-10-27"'));
		assert.ok(
			updatedHtml.includes(
				'property="article:modified_time" content="2026-10-27"',
			),
		);
		assert.ok(updatedHtml.includes("最后更新"));
		assert.ok(updatedHtml.includes('<time dateTime="2026-10-27"'));
		const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text();
		assert.match(
			sitemap,
			/\/posts\/__migration-watch-probe<\/loc><lastmod>2026-10-27<\/lastmod>/,
		);
		const feed = await (await fetch(`${origin}/feed.xml`)).text();
		assert.ok(
			feed.includes(
				"<lastBuildDate>Tue, 27 Oct 2026 00:00:00 GMT</lastBuildDate>",
			),
		);
		assert.match(
			feed,
			/<item><title>Migration watch probe<\/title>[\s\S]*?<pubDate>Thu, 01 Oct 2026 00:00:00 GMT<\/pubDate>/,
		);
		for (const query of [
			"正文特有词",
			" mixedCASE ",
			"SearchTag",
			"Probe Category",
		]) {
			const results = await (
				await fetch(`${origin}/api/search?query=${encodeURIComponent(query)}`)
			).json();
			assert.ok(
				results.some(
					(result: { url: string }) =>
						result.url === "/posts/__migration-watch-probe",
				),
			);
			const home = await (
				await fetch(`${origin}/?q=${encodeURIComponent(query)}`)
			).text();
			assert.ok(home.includes('href="/posts/__migration-watch-probe"'));
		}
		const combined = await (
			await fetch(`${origin}/?q=MixedCase&category=probe-category&page=2`)
		).text();
		assert.ok(combined.includes('href="/posts/__migration-watch-probe"'));
		await writeFile(probe, content("VERSION_TWO", false));
		await until(
			async () => (await read()).status === 404,
			"unpublished article 404",
		);
		assert.deepEqual(
			await (await fetch(`${origin}/api/search?query=SearchTag`)).json(),
			[],
		);
		await unlink(probe);
		created = false;
		await until(
			async () =>
				!(await readFile(generated, "utf8")).includes(
					"__migration-watch-probe",
				),
			"deleted collection entry",
		);
		assert.equal((await read()).status, 404);
	} catch (error) {
		if (error instanceof Error) error.message += `\n${logs.slice(-4000)}`;
		throw error;
	} finally {
		if (created) await unlink(probe);
		server.kill();
	}
});
