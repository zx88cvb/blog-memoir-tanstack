import { createFileRoute } from "@tanstack/react-router";
import { absoluteSiteUrl } from "@/lib/seo";

export const Route = createFileRoute("/robots.txt")({
	server: {
		handlers: {
			GET: () => {
				return new Response(
					[
						"User-Agent: *",
						"Allow: /",
						"Disallow: /api/",
						"Disallow: /private/",
						"Disallow: /cdn-cgi/",
						`Sitemap: ${absoluteSiteUrl("/sitemap.xml")}`,
						"",
					].join("\n"),
					{ headers: { "Content-Type": "text/plain; charset=utf-8" } },
				);
			},
		},
	},
});
