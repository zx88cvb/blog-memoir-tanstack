import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/home/home-page";
import { absoluteSiteUrl, pageHead, shareImage } from "@/lib/seo";
import { loadPostList } from "@/modules/post/service";
import { parseBlogSearch } from "@/modules/post/types";
import { m } from "@/paraglide/messages.js";

export const Route = createFileRoute("/")({
	validateSearch: parseBlogSearch,
	loaderDeps: ({ search }) => search,
	loader: ({ deps }) => loadPostList({ data: { ...deps } }),
	head: () =>
		pageHead({
			path: "/",
			title: m["seo.home.title"](),
			description: m["seo.home.description"](),
			image: shareImage(),
			keywords: ["blog", "Next.js", "tech notes", "indie dev"],
			jsonLd: {
				"@type": "WebSite",
				name: m["seo.home.title"](),
				url: absoluteSiteUrl("/"),
				description: m["seo.home.description"](),
			},
		}),
	component: RouteComponent,
});
function RouteComponent() {
	return <HomePage data={Route.useLoaderData()} />;
}
