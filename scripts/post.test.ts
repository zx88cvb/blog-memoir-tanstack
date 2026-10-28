import assert from "node:assert/strict";
import { test } from "node:test";
import { loadPostService } from "./load-post-service.ts";

const { filterPosts } = await loadPostService();

import { postSchema } from "./post-schema.ts";

const base = { title: "示例", date: "2026-01-01", content: "正文" };

test("updated is optional, accepts real dates and cannot precede publication", () => {
	assert.equal(postSchema.parse(base).updated, undefined);
	for (const updated of ["2026-01-01", "2026-10-28"])
		assert.equal(postSchema.parse({ ...base, updated }).updated, updated);
	for (const updated of [
		"2025-12-31",
		"2026-02-30",
		"2026-13-01",
		"invalid",
		"2026-1-2",
		"",
	])
		assert.equal(
			postSchema.safeParse({ ...base, updated }).success,
			false,
			updated,
		);
});

const posts = Array.from({ length: 12 }, (_, index) => ({
	slug: `post-${index}`,
	title: `示例 ${index}`,
	date: `2026-01-${String(index + 1).padStart(2, "0")}`,
	excerpt: "摘要词",
	description: "描述词",
	tags: ["TagOnly"],
	categories: ["Special Category"],
	author: "Author",
	published: true,
	plainText: "仅正文关键词 MiXeDCaSe",
}));

test("shared search matches all fields, Chinese, case and surrounding whitespace", () => {
	for (const q of [
		"示例",
		"摘要词",
		"描述词",
		"tagonly",
		"special category",
		"仅正文关键词",
		"  mixedCASE  ",
	])
		assert.equal(filterPosts(posts, { q }).length, 12, q);
	assert.equal(filterPosts(posts, { q: "missing" }).length, 0);
	assert.deepEqual(filterPosts(posts, { q: "  " }), filterPosts(posts));
});

test("published filtering, category normalization and chronological order are shared", () => {
	const source = [...posts, { ...posts[0], slug: "draft", published: false }];
	const result = filterPosts(source, {
		q: "仅正文关键词",
		category: " SPECIAL-CATEGORY ",
	});
	assert.equal(result.length, 12);
	assert.deepEqual(
		result.map((post) => post.slug),
		posts
			.slice()
			.reverse()
			.map((post) => post.slug),
	);
	assert.equal(filterPosts(source, { category: "tagonly" }).length, 12);
	assert.equal(filterPosts(source, { category: "other" }).length, 0);
	assert.equal(source[0].slug, "post-0", "source order must remain unchanged");
});
