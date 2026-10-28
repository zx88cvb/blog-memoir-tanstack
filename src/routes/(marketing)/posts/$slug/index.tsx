import { createFileRoute, notFound } from "@tanstack/react-router";
import { Article } from "@/components/blog/article";
import { absoluteSiteUrl, pageHead } from "@/lib/seo";
import { loadPost } from "@/modules/post/service";
import { m } from "@/paraglide/messages.js";

export const Route = createFileRoute("/(marketing)/posts/$slug/")({
	loader: async ({ params }) => {
		const post = await loadPost({ data: params.slug });
		if (!post) throw notFound();
		return post;
	},
	head: ({ loaderData: post }) => {
		if (!post)
			return {
				meta: [
					{ title: m["seo.not_found.title"]() },
					{ name: "robots", content: "noindex" },
				],
			};
		const url = absoluteSiteUrl(`/posts/${post.slug}`);
		const authorUrl = absoluteSiteUrl("/about");
		return pageHead({
			path: `/posts/${post.slug}`,
			title: m["seo.post.title"]({ title: post.title }),
			socialTitle: post.title,
			description: post.excerpt ?? post.description,
			keywords: post.tags,
			image: post.image,
			type: "article",
			publishedTime: post.date,
			modifiedTime: post.updated,
			jsonLd: {
				"@type": "BlogPosting",
				headline: post.title,
				description: post.excerpt ?? post.description,
				datePublished: post.date,
				...(post.updated ? { dateModified: post.updated } : {}),
				image: absoluteSiteUrl(post.image ?? "/logo.png"),
				url,
				author: {
					"@type": "Person",
					"@id": `${authorUrl}#main-author`,
					name: post.author,
					url: authorUrl,
				},
			},
		});
	},
	component: PostPage,
});
function PostPage() {
	return <Article post={Route.useLoaderData()} />;
}
