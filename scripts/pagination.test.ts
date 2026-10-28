import assert from "node:assert/strict";
import { test } from "node:test";
import {
	getPaginationItems,
	getPaginationSearch,
} from "../src/lib/pagination.ts";

test("page links preserve search and category and omit page one", () => {
	const search = { q: "MixedCase 中文", category: "ai", page: 9 };
	assert.deepEqual(getPaginationSearch(search, 2), { ...search, page: 2 });
	assert.deepEqual(getPaginationSearch(search, 1), {
		q: search.q,
		category: "ai",
		page: undefined,
	});
	assert.equal(search.page, 9);
});

test("small page ranges include every page", () => {
	assert.deepEqual(getPaginationItems(1, 0), []);
	assert.deepEqual(getPaginationItems(1, 1), [1]);
	assert.deepEqual(getPaginationItems(2, 2), [1, 2]);
	assert.deepEqual(getPaginationItems(4, 7), [1, 2, 3, 4, 5, 6, 7]);
});

test("large page ranges keep boundaries, current neighbors and at most seven items", () => {
	assert.deepEqual(getPaginationItems(1, 100), [
		1,
		2,
		3,
		4,
		5,
		"end-ellipsis",
		100,
	]);
	assert.deepEqual(getPaginationItems(50, 100), [
		1,
		"start-ellipsis",
		49,
		50,
		51,
		"end-ellipsis",
		100,
	]);
	assert.deepEqual(getPaginationItems(100, 100), [
		1,
		"start-ellipsis",
		96,
		97,
		98,
		99,
		100,
	]);
	for (const total of [8, 9, 100, 1_000_000_000]) {
		for (const current of [
			1,
			4,
			5,
			Math.floor(total / 2),
			total - 4,
			total - 3,
			total,
		]) {
			const items = getPaginationItems(current, total);
			const pages = items.filter((item) => typeof item === "number");
			assert.ok(items.length <= 7);
			assert.equal(new Set(items).size, items.length);
			assert.equal(pages[0], 1);
			assert.equal(pages.at(-1), total);
			assert.ok(pages.includes(current));
			assert.ok(
				pages.every((page, index) => index === 0 || page > pages[index - 1]),
			);
		}
	}
});

test("page bounds are normalized without allocating by total page count", () => {
	assert.deepEqual(getPaginationItems(-1, 100), getPaginationItems(1, 100));
	assert.deepEqual(getPaginationItems(999, 100), getPaginationItems(100, 100));
	assert.deepEqual(
		getPaginationItems(Number.NaN, 100),
		getPaginationItems(1, 100),
	);
	assert.deepEqual(getPaginationItems(1, Number.POSITIVE_INFINITY), []);
});
