import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import {
	allCategories,
	allPosts,
} from "../.content-collections/generated/index.js";
import { m } from "../src/paraglide/messages.js";
import { loadPostService } from "./load-post-service.ts";
import { rssItems, rssText } from "./rss-elements.ts";

const { filterPosts } = await loadPostService();

type LegacyPost = {
	slug: string;
	title: string;
	date: string;
	description?: string;
	excerpt?: string;
	image?: string;
	author?: string;
	tags?: string[];
	categories?: string[];
	tocUrls?: string[];
};

const baseline: LegacyPost[] = JSON.parse(
	await readFile(
		new URL("./fixtures/legacy-posts.json", import.meta.url),
		"utf8",
	),
);
const legacySeo: Record<string, { status: number; tags: string[] }> =
	JSON.parse(
		await readFile(
			new URL("./fixtures/legacy-seo.json", import.meta.url),
			"utf8",
		),
	);
const published = allPosts.filter((post) => post.published);
const canonicalOrigin = (
	process.env.VITE_APP_URL || "https://haydenbi.com"
).replace(/\/$/, "");
let server: ReturnType<typeof spawn>;
let origin: string;
let logs = "";

before(async () => {
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
	origin = `http://127.0.0.1:${port}`;
	server = spawn(
		process.execPath,
		[fileURLToPath(new URL("../.output/server/index.mjs", import.meta.url))],
		{
			cwd: tmpdir(),
			env: {
				...process.env,
				NODE_ENV: "production",
				PORT: String(port),
				HOST: "127.0.0.1",
			},
			stdio: ["ignore", "pipe", "pipe"],
		},
	);
	server.stdout?.on("data", (chunk) => {
		logs += chunk;
	});
	server.stderr?.on("data", (chunk) => {
		logs += chunk;
	});
	for (let attempt = 0; attempt < 100; attempt++) {
		try {
			await fetch(origin);
			return;
		} catch {
			await new Promise<void>((resolve) => setTimeout(resolve, 100));
		}
	}
	throw new Error(`Production server failed to start: ${logs}`);
});
after(() => server?.kill());

async function page(path: string, expected = 200) {
	const response = await fetch(`${origin}${path}`, { redirect: "manual" });
	assert.equal(response.status, expected, `${path}: ${logs}`);
	const html = await response.text();
	const expectedSeo = legacySeo[path];
	if (expectedSeo) {
		assert.equal(response.status, expectedSeo.status);
		const tags = [
			...html.matchAll(
				/<title[^>]*>[\s\S]*?<\/title>|<meta\s[^>]*>|<link[^>]*rel="canonical"[^>]*>|<script[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g,
			),
		]
			.map((match) => match[0])
			.sort();
		assert.deepEqual(
			tags,
			expectedSeo.tags
				.map((tag) => tag.replaceAll("https://haydenbi.com", canonicalOrigin))
				.sort(),
			`${path}: SEO changed`,
		);
	}
	return html;
}
const escapeHtml = (value: string) =>
	value.replace(
		/[&<>"']/g,
		(char) =>
			(
				({
					"&": "&amp;",
					"<": "&lt;",
					">": "&gt;",
					'"': "&quot;",
					"'": "&#x27;",
				}) as Record<string, string>
			)[char] ?? char,
	);
function canonical(html: string, path: string) {
	const tags = html.match(/<link\b[^>]*rel="canonical"[^>]*>/g) ?? [];
	assert.equal(tags.length, 1);
	assert.ok(tags[0].includes(`href="${canonicalOrigin}${path}"`), tags[0]);
	assert.ok(!html.includes('hrefLang="en"') && !html.includes('hreflang="ja"'));
}

test("all legacy article metadata, slugs, and Markdown content migrate", () => {
	assert.equal(published.length, baseline.length);
	assert.equal(allCategories.length, 7);
	assert.equal(
		new Set(allPosts.map((post) => post.slug)).size,
		allPosts.length,
	);
	for (const legacy of baseline) {
		const post = published.find((item) => item.slug === legacy.slug);
		assert.ok(post, legacy.slug);
		for (const field of [
			"title",
			"date",
			"excerpt",
			"description",
			"image",
			"author",
			"tags",
			"categories",
		] as const) {
			if (legacy[field] !== undefined)
				assert.deepEqual(
					post[field],
					legacy[field],
					`${legacy.slug}: ${field}`,
				);
		}
		assert.ok(post.html.includes("<p>"));
		if (legacy.tocUrls)
			assert.deepEqual(
				post.toc.map((item) => item.url),
				legacy.tocUrls,
			);
		assert.ok(!/className=/.test(post.html));
		for (const heading of post.toc)
			assert.ok(
				post.html.includes(`id="${heading.url.slice(1)}"`),
				heading.url,
			);
	}
});

test("legacy pages and article SSR retain canonical, metadata, body and schema", async () => {
	for (const path of ["/", "/about", "/friends", "/product", "/blog"]) {
		const html = await page(path);
		assert.ok(html.includes('<html lang="zh-CN"'));
		assert.ok(!html.includes("\0"), "SSR state must not contain raw NUL bytes");
		canonical(html, path === "/blog" ? "/" : path);
		assert.ok(html.includes("application/ld+json"));
	}
	for (const legacy of baseline) {
		const html = await page(`/posts/${legacy.slug}`);
		canonical(html, `/posts/${legacy.slug}`);
		assert.ok(
			html.includes(`<title>${escapeHtml(legacy.title)} | HaydenBi</title>`),
		);
		assert.ok(html.includes('content="article"'));
		assert.ok(html.includes('"@type":"BlogPosting"'));
		const post = published.find((item) => item.slug === legacy.slug);
		assert.ok(post);
		assert.ok(html.includes(post.html), `SSR body missing: ${legacy.slug}`);
	}
});

test("404s and inactive language routes do not publish duplicate content", async () => {
	for (const path of [
		"/posts/not-a-real-post",
		"/posts/not-a-post",
		"/not-a-page",
		"/privacy",
		"/terms",
		"/en",
		"/ja/about",
		"/zh-cn",
	]) {
		const html = await page(path, 404);
		assert.ok(/name="robots" content="noindex"/.test(html));
	}
});

test("query combinations retain SSR and home canonical", async () => {
	for (const path of [
		"/?page=2",
		"/?page=-1",
		"/?page=bad",
		"/?page=9999",
		"/?category=ai",
		"/?q=OpenClaw",
		"/?category=ai&q=OpenClaw&page=2",
		"/blog?page=2",
	]) {
		canonical(await page(path), "/");
	}
	const empty = await page("/?q=__no_matching_article__");
	assert.ok(empty.replace(/<!--[\s\S]*?-->/g, "").includes("0 published"));
	const first = await page("/");
	const second = await page("/?page=2");
	assert.equal(
		(first.match(/class="soft-surface group block/g) ?? []).length,
		9,
	);
	assert.equal(
		(second.match(/class="soft-surface group block/g) ?? []).length,
		Math.max(0, published.length - 9),
	);
});

test("search endpoint preserves array contract and supports Chinese body text", async () => {
	assert.deepEqual(await (await fetch(`${origin}/api/search`)).json(), []);
	const results = await (
		await fetch(`${origin}/api/search?query=${encodeURIComponent("实践")}`)
	).json();
	assert.ok(results.length > 0);
	for (const result of results) {
		assert.equal(result.type, "page");
		assert.equal(result.id, result.url);
		assert.ok(Array.isArray(result.breadcrumbs));
		assert.ok(Array.isArray(result.contentWithHighlights));
	}
});

test("composed home has one main landmark and directional pagination", async () => {
	for (const path of ["/", "/blog", "/?page=2"]) {
		const html = await page(path);
		assert.equal((html.match(/<main\b/g) ?? []).length, 1);
		assert.equal((html.match(/id="main-content"/g) ?? []).length, 1);
		const nav = html.match(/<nav aria-label="分页"[\s\S]*?<\/nav>/)?.[0];
		assert.ok(nav);
		const disabled = path.includes("page=2") ? "下一页" : "上一页";
		assert.match(
			nav,
			new RegExp(`<button[^>]*disabled[^>]*aria-label="${disabled}"`),
		);
		const direction = path.includes("page=2") ? "prev" : "next";
		assert.ok(nav.includes(`rel="${direction}"`));
	}
});

test("home and API search agree across fields, category filtering and pagination", async () => {
	const postLinks = (html: string) =>
		[...html.matchAll(/<a\b[^>]*href="(\/posts\/[^"?#]+)"/g)].map(
			(match) => match[1],
		);
	for (const query of [
		"实践",
		"  OpENcLaW  ",
		"NodeJS",
		"旅行",
		"__missing__",
		"   ",
	]) {
		const expected = filterPosts(allPosts, { q: query });
		const results = await (
			await fetch(`${origin}/api/search?query=${encodeURIComponent(query)}`)
		).json();
		assert.deepEqual(
			results.map((entry: { url: string }) => entry.url),
			query.trim() ? expected.map((post) => `/posts/${post.slug}`) : [],
		);
		const links: string[] = [];
		for (
			let pageNumber = 1;
			pageNumber <= Math.max(1, Math.ceil(expected.length / 9));
			pageNumber++
		) {
			const html = await page(
				`/?q=${encodeURIComponent(query)}&page=${pageNumber}`,
			);
			links.push(...postLinks(html));
		}
		assert.deepEqual(
			links,
			expected.map((post) => `/posts/${post.slug}`),
		);
	}
	const expected = filterPosts(allPosts, { q: "AI", category: "ai" });
	assert.deepEqual(
		postLinks(await page("/?category=ai&q=AI&page=2")),
		expected
			.slice(Math.max(0, Math.ceil(expected.length / 9) - 1) * 9)
			.map((post) => `/posts/${post.slug}`),
	);
});

test("sitemap, feed, discovery and verification files remain available", async () => {
	const sitemap = await page("/sitemap.xml");
	const feed = await page("/feed.xml");
	const llms = await page("/llms.txt");
	assert.equal((sitemap.match(/<url>/g) ?? []).length, published.length + 4);
	assert.equal((feed.match(/<item>/g) ?? []).length, published.length);
	const channel = feed.split("<item>")[0];
	assert.equal(
		rssText(channel, "title"),
		m["feed.title"]({}, { locale: "zh-cn" }),
	);
	assert.equal(rssText(channel, "link"), `${canonicalOrigin}/`);
	assert.equal(
		rssText(channel, "description"),
		m["seo.home.description"]({}, { locale: "zh-cn" }),
	);
	assert.equal(rssText(channel, "language"), "zh-CN");
	const image = channel.match(/<image>([\s\S]*?)<\/image>/)?.[1];
	assert.ok(image, "RSS channel includes a logo");
	assert.equal(rssText(image, "url"), `${canonicalOrigin}/logo.png`);
	assert.equal(rssText(image, "title"), rssText(channel, "title"));
	assert.equal(rssText(image, "link"), `${canonicalOrigin}/`);
	assert.match(
		channel,
		new RegExp(
			`<atom:link[^>]*href="${canonicalOrigin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/feed\\.xml"[^>]*rel="self"[^>]*type="application/rss\\+xml"`,
		),
	);
	assert.ok(!feed.includes("<generator>"));
	assert.ok(!feed.includes("<content:encoded>"));
	const expectedPosts = filterPosts(allPosts);
	const items = rssItems(feed);
	assert.deepEqual(
		items.map((item) => rssText(item, "guid")),
		expectedPosts.map((post) => `/posts/${post.slug}`),
	);
	for (const [index, post] of expectedPosts.entries()) {
		const item = items[index];
		assert.equal(rssText(item, "title"), post.title);
		assert.equal(
			rssText(item, "link"),
			`${canonicalOrigin}/posts/${post.slug}`,
		);
		assert.match(item, /<guid isPermaLink="false">/);
		assert.equal(
			rssText(item, "description") ?? "",
			post.excerpt ?? post.description ?? "",
		);
		assert.equal(
			rssText(item, "pubDate"),
			new Date(`${post.date}T00:00:00Z`).toUTCString(),
		);
	}
	const latest = expectedPosts
		.map((post) => post.updated ?? post.date)
		.sort()
		.at(-1);
	if (latest)
		assert.equal(
			rssText(channel, "lastBuildDate"),
			new Date(`${latest}T00:00:00Z`).toUTCString(),
		);
	for (const post of published) {
		assert.ok(sitemap.includes(`${canonicalOrigin}/posts/${post.slug}`));
		assert.ok(feed.includes(`${canonicalOrigin}/posts/${post.slug}`));
		assert.ok(llms.includes(`${canonicalOrigin}/posts/${post.slug}`));
	}
	assert.ok(!/\/ja\/|\/en\/|\/zh-cn\//.test(sitemap));
	assert.ok(
		(await page("/robots.txt")).includes(`${canonicalOrigin}/sitemap.xml`),
	);
	const manifest = await (await fetch(`${origin}/manifest.webmanifest`)).json();
	assert.equal(manifest.lang, "zh-CN");
	for (const icon of manifest.icons)
		assert.equal((await fetch(`${origin}${icon.src}`)).status, 200);
	for (const path of [
		"/favicon.ico",
		"/logo.png",
		"/baidu_verify_codeva-BGSxepMVn0.html",
		"/963011ef5f7746e2b680d9492f292702.txt",
	])
		assert.equal((await fetch(`${origin}${path}`)).status, 200);
	for (const [path, type] of [
		["/feed.xml", "application/rss+xml"],
		["/sitemap.xml", "application/xml"],
		["/llms.txt", "text/plain"],
		["/manifest.webmanifest", "application/manifest+json"],
	])
		assert.ok(
			(await fetch(`${origin}${path}`)).headers
				.get("content-type")
				?.includes(type),
		);
});

test("browser bundles contain neither article bodies nor build-time renderers", async () => {
	const assets = new URL("../.output/public/assets/", import.meta.url);
	for (const name of (await readdir(assets)).filter((name) =>
		name.endsWith(".js"),
	)) {
		const code = await readFile(new URL(name, assets), "utf8");
		assert.ok(!code.includes("公司的后端开发，最后只剩下我一个人"), name);
		assert.ok(!code.includes("@shikijs/markdown-it"), name);
		assert.ok(!code.includes("onig.wasm"), name);
		assert.ok(!code.includes("validator.w3.org/feed/docs/rss2.html"), name);
		assert.ok(!code.includes("xml-js"), name);
	}
});
