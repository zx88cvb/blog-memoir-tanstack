import { createFileRoute } from "@tanstack/react-router";
import { searchPosts } from "@/modules/search/service";
export const Route = createFileRoute("/api/search")({
	server: {
		handlers: {
			GET: ({ request }) =>
				Response.json(
					searchPosts(new URL(request.url).searchParams.get("query") ?? ""),
				),
		},
	},
});
