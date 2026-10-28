import { createFileRoute } from "@tanstack/react-router";
import { buildFeed } from "@/modules/feed/service";
export const Route = createFileRoute("/feed.xml")({
	server: {
		handlers: {
			GET: () =>
				new Response(buildFeed(), {
					headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
				}),
		},
	},
});
