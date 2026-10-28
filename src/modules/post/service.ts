import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { allCategories, allPosts } from "content-collections";
import { z } from "zod";
import {
	type BlogSearch,
	type PostDetail,
	type PostListData,
	type PostSummary,
	parseBlogSearch,
} from "./types.ts";

// Only this callback reads generated content; Start removes it and its imports from the browser.
const getCollections = createServerOnlyFn(() => ({ allCategories, allPosts }));

type SearchablePost = PostSummary & { published: boolean; plainText: string };

const normalizeCategory = (value: string) =>
	value.trim().toLowerCase().replace(/\s+/g, "-");

/** Shared by server-side listing and search; never send the source text to clients. */
export function filterPosts<T extends SearchablePost>(
	posts: readonly T[],
	search: Pick<BlogSearch, "q" | "category"> = {},
) {
	const query = search.q?.trim().toLowerCase();
	const category = search.category && normalizeCategory(search.category);
	return posts
		.filter((post) => {
			if (!post.published) return false;
			const labels = [...post.categories, ...post.tags];
			if (
				category &&
				!labels.some((label) => normalizeCategory(label) === category)
			)
				return false;
			return (
				!query ||
				[post.title, post.excerpt, post.description, ...labels, post.plainText]
					.filter(Boolean)
					.join(" ")
					.toLowerCase()
					.includes(query)
			);
		})
		.sort((a, b) => b.date.localeCompare(a.date));
}

export function getAllPosts() {
	return findPosts();
}

export function findPosts(search: Pick<BlogSearch, "q" | "category"> = {}) {
	return filterPosts(getCollections().allPosts, search);
}

function summarize(
	post: PostDetail & { published: boolean; plainText: string },
): PostSummary {
	const {
		slug,
		title,
		date,
		updated,
		description,
		excerpt,
		tags,
		categories,
		author,
		image,
	} = post;
	return {
		slug,
		title,
		date,
		updated,
		description,
		excerpt,
		tags,
		categories,
		author,
		image,
	};
}

export function getPostBySlug(slug: string): PostDetail | null {
	const post = getAllPosts().find((entry) => entry.slug === slug);
	return post ? { ...summarize(post), html: post.html, toc: post.toc } : null;
}

export function getPostList(search: BlogSearch): PostListData {
	const filtered = findPosts(search);
	const totalPages = Math.max(1, Math.ceil(filtered.length / 9));
	const parsedPage = Number.parseInt(String(search.page ?? 1), 10);
	const page = Math.min(
		Math.max(Number.isFinite(parsedPage) ? parsedPage : 1, 1),
		totalPages,
	);
	return {
		posts: filtered.slice((page - 1) * 9, page * 9).map(summarize),
		categories: getCollections()
			.allCategories.map(({ name, slug }) => ({ name, slug }))
			.sort((a, b) => a.name.localeCompare(b.name)),
		page,
		totalPages,
		totalPosts: filtered.length,
	};
}

export const loadPostList = createServerFn({ method: "GET" })
	.validator((input: Record<string, unknown>) => parseBlogSearch(input))
	.handler(({ data }) => getPostList(data));

export const loadPost = createServerFn({ method: "GET" })
	.validator(z.string())
	.handler(({ data }) => getPostBySlug(data));
