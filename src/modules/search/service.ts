import { findPosts } from "@/modules/post/service";

export function searchPosts(query: string) {
	const needle = query.trim().toLowerCase();
	if (!needle) return [];
	return findPosts({ q: needle }).map((post) => ({
		id: `/posts/${post.slug}`,
		type: "page" as const,
		content: post.title,
		url: `/posts/${post.slug}`,
		breadcrumbs: [],
		contentWithHighlights: [{ type: "text" as const, content: post.title }],
	}));
}
