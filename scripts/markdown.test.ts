import assert from "node:assert/strict";
import { test } from "node:test";
import { compileMarkdown } from "./markdown.ts";

test("Chinese and repeated headings use stable GitHub anchors", async () => {
	const result = await compileMarkdown(
		"## 前言\n\n## 前言\n\n### Use `code` & links\n",
	);
	assert.deepEqual(
		result.toc.map((item) => item.url),
		["#前言", "#前言-1", "#use-code--links"],
	);
	assert.ok(result.html.includes('id="前言-1"'));
});

test("Markdown tables, deletion, figures, code and unknown languages render", async () => {
	const result = await compileMarkdown(
		'| A | B |\n| - | - |\n| 一 | 二 |\n\n~~删除~~\n\n<figure class="test"><img src="/logo.png" alt="image"><figcaption>Caption</figcaption></figure>\n\n```js\nconst value = "<tag>";\n```\n\n```not-a-known-language\n<script>alert(1)</script>\n```',
	);
	assert.ok(result.html.includes("<table>"));
	assert.ok(result.html.includes("<s>删除</s>"));
	assert.ok(result.html.includes('<figure class="test">'));
	assert.ok(result.html.includes('class="shiki'));
	assert.ok(result.html.includes("&lt;script&gt;"));
	assert.ok(result.plainText.includes("Caption"));
	assert.ok(result.plainText.includes('const value = "<tag>"'));
});
