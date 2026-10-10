import { createFileRoute } from "@tanstack/react-router";
import { buildSitemapXml } from "@/lib/sitemap";

export const Route = createFileRoute("/sitemap.xml")({
	server: {
		handlers: {
			GET: ({ request }) => {
				const xml = buildSitemapXml(new URL(request.url).origin);
				return new Response(xml, {
					headers: { "content-type": "application/xml; charset=utf-8" },
				});
			},
		},
	},
});
