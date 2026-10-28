import { createFileRoute } from "@tanstack/react-router";
import { absoluteSiteUrl } from "@/lib/seo";
import { escapeXml } from "@/lib/xml";
import { getAllPosts } from "@/modules/post/service";

export const Route = createFileRoute("/sitemap.xml")({
	server: {
		handlers: {
			GET: () => {
				const pages = ["/", "/about", "/friends", "/product"].map(
					(path) => `<url><loc>${escapeXml(absoluteSiteUrl(path))}</loc></url>`,
				);
				const posts = getAllPosts().map(
					(post) =>
						`<url><loc>${escapeXml(absoluteSiteUrl(`/posts/${post.slug}`))}</loc><lastmod>${post.updated ?? post.date}</lastmod></url>`,
				);
				return new Response(
					`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...pages, ...posts].join("")}</urlset>`,
					{ headers: { "Content-Type": "application/xml; charset=utf-8" } },
				);
			},
		},
	},
});
