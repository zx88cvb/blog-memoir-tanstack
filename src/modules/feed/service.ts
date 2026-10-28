import { Feed } from "feed";
import { absoluteSiteUrl } from "@/lib/seo";
import { getAllPosts } from "@/modules/post/service";
import { m } from "@/paraglide/messages.js";

export function buildFeed(): string {
	const posts = getAllPosts();
	const lastBuildDate = posts.reduce((latest, post) => {
		const modified = post.updated ?? post.date;
		return modified > latest ? modified : latest;
	}, "");
	const date = (value: string) => new Date(`${value}T00:00:00Z`);
	const feed = new Feed({
		title: m["feed.title"](),
		link: absoluteSiteUrl("/"),
		description: m["seo.home.description"](),
		language: "zh-CN",
		feedLinks: { rss: absoluteSiteUrl("/feed.xml") },
		updated: lastBuildDate ? date(lastBuildDate) : undefined,
		generator: false,
	});
	for (const post of posts) {
		feed.addItem({
			title: post.title,
			link: absoluteSiteUrl(`/posts/${post.slug}`),
			guid: `/posts/${post.slug}`,
			description: post.excerpt ?? post.description ?? "",
			date: date(post.date),
		});
	}
	return feed.rss2();
}
