import { createFileRoute } from "@tanstack/react-router";
import { absoluteSiteUrl } from "@/lib/seo";
import { getAllPosts } from "@/modules/post/service";
import { m } from "@/paraglide/messages.js";

export const Route = createFileRoute("/llms.txt")({
	server: {
		handlers: {
			GET: () => {
				const line = (text: string) => text.replace(/\s+/g, " ").trim();
				const link = (name: string, path: string, description: string) =>
					`- [${line(name).replace(/([\\[\]])/g, "\\$1")}](${absoluteSiteUrl(path)}): ${line(description)}`;
				return new Response(
					[
						`# ${m["seo.home.title"]()}`,
						"",
						m["llms.introduction"](),
						"",
						m["llms.guidance"](),
						"",
						m["llms.pages"](),
						"",
						link(m["llms.home.name"](), "/", m["llms.home.description"]()),
						link(
							m["llms.about.name"](),
							"/about",
							m["llms.about.description"](),
						),
						link(
							m["llms.product.name"](),
							"/product",
							m["llms.product.description"](),
						),
						"",
						m["llms.articles"](),
						"",
						...getAllPosts().map((post) =>
							link(
								post.title,
								`/posts/${post.slug}`,
								post.excerpt ??
									post.description ??
									m["llms.article_fallback"](),
							),
						),
						"",
						m["llms.optional"](),
						"",
						link(
							m["llms.friends.name"](),
							"/friends",
							m["llms.friends.description"](),
						),
						link(
							m["llms.feed.name"](),
							"/feed.xml",
							m["llms.feed.description"](),
						),
						link(
							m["llms.sitemap.name"](),
							"/sitemap.xml",
							m["llms.sitemap.description"](),
						),
						"",
					].join("\n"),
					{ headers: { "Content-Type": "text/plain; charset=utf-8" } },
				);
			},
		},
	},
});
