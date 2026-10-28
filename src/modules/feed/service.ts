import { absoluteSiteUrl } from "@/lib/seo";
import { escapeXml } from "@/lib/xml";
import { getAllPosts } from "@/modules/post/service";
import { m } from "@/paraglide/messages.js";

export function buildFeed() {
	const posts = getAllPosts();
	const lastBuildDate = posts.reduce((latest, post) => {
		const modified = post.updated ?? post.date;
		return modified > latest ? modified : latest;
	}, "");
	const date = (value: string) => new Date(`${value}T00:00:00Z`).toUTCString();
	return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${escapeXml(m["feed.title"]())}</title><link>${escapeXml(absoluteSiteUrl("/"))}</link><description>${escapeXml(m["seo.home.description"]())}</description><language>zh-CN</language><atom:link href="${escapeXml(absoluteSiteUrl("/feed.xml"))}" rel="self" type="application/rss+xml"/>${lastBuildDate ? `<lastBuildDate>${date(lastBuildDate)}</lastBuildDate>` : ""}${posts
		.map((post) => {
			const url = escapeXml(absoluteSiteUrl(`/posts/${post.slug}`));
			return `<item><title>${escapeXml(post.title)}</title><link>${url}</link><guid isPermaLink="false">${escapeXml(`/posts/${post.slug}`)}</guid><description>${escapeXml(post.excerpt ?? post.description ?? "")}</description><pubDate>${date(post.date)}</pubDate></item>`;
		})
		.join("")}</channel></rss>`;
}
