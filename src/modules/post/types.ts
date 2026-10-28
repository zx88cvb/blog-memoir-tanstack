export interface TocItem {
	title: string;
	url: string;
	depth: number;
}

export interface PostSummary {
	slug: string;
	title: string;
	date: string;
	updated?: string;
	description?: string;
	excerpt?: string;
	tags: string[];
	categories: string[];
	author: string;
	image?: string;
}

export interface PostDetail extends PostSummary {
	html: string;
	toc: TocItem[];
}

export interface BlogSearch {
	category?: string;
	q?: string;
	page?: number | string;
}

export function parseBlogSearch(search: Record<string, unknown>): BlogSearch {
	const first = (value: unknown) => (Array.isArray(value) ? value[0] : value);
	const category = first(search.category);
	const q = first(search.q);
	const page = first(search.page);
	return {
		category: typeof category === "string" ? category : undefined,
		q: typeof q === "string" ? q : undefined,
		page:
			typeof page === "string" || typeof page === "number" ? page : undefined,
	};
}

export function formatDate(value: string) {
	return new Date(`${value}T00:00:00Z`).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
		timeZone: "UTC",
	});
}

export interface PostListData {
	posts: PostSummary[];
	categories: { name: string; slug: string }[];
	page: number;
	totalPages: number;
	totalPosts: number;
}
