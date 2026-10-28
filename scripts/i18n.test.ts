import assert from "node:assert/strict";
import { test } from "node:test";
import { m } from "../src/paraglide/messages.js";

test("Hero and interaction messages resolve Chinese, English and Japanese explicitly", () => {
	const expected = {
		"zh-cn": [
			"随笔与开发手记",
			"上一页",
			"下一页",
			"分享",
			"复制链接",
			"链接已复制",
			"重置搜索",
		],
		en: [
			"Personal notes & build log",
			"Prev",
			"Next",
			"Share",
			"Copy Link",
			"Copied link",
			"Reset search",
		],
		ja: [
			"日々の記録と開発ノート",
			"前へ",
			"次へ",
			"シェア",
			"リンクをコピー",
			"リンクをコピーしました",
			"検索条件をリセット",
		],
	} as const;
	for (const locale of ["zh-cn", "en", "ja"] as const) {
		const options = { locale };
		assert.deepEqual(
			[
				m["home.hero.eyebrow"]({}, options),
				m["blog.pagination.previous"]({}, options),
				m["blog.pagination.next"]({}, options),
				m["blog.share.title"]({}, options),
				m["blog.share.copy_link"]({}, options),
				m["blog.share.copied_link"]({}, options),
				m["blog.empty.reset"]({}, options),
			],
			expected[locale],
		);
		assert.doesNotMatch(
			m["home.hero.description"]({}, options),
			/content\/blog|folder|MDX/i,
		);
		assert.ok(m["blog.empty.filtered"]({}, options).length > 0);
		assert.ok(m["blog.empty.none"]({}, options).length > 0);
	}
});

test("pagination and share placeholders resolve correctly in all three locales", () => {
	for (const [locale, page, status, share] of [
		["zh-cn", "第 3 页", "第 3 页，共 9 页", "分享到 Pinterest"],
		["en", "Page 3", "Page 3 of 9", "Share on Pinterest"],
		["ja", "3ページ目", "全9ページ中3ページ目", "Pinterestでシェア"],
	] as const) {
		assert.equal(m["blog.pagination.page"]({ page: 3 }, { locale }), page);
		assert.equal(
			m["blog.pagination.status"]({ current: 3, total: 9 }, { locale }),
			status,
		);
		assert.equal(
			m["blog.share.on"]({ platform: "Pinterest" }, { locale }),
			share,
		);
	}
});
