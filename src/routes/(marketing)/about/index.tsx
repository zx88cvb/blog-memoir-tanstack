import { createFileRoute } from "@tanstack/react-router";
import { profileImage } from "@/config/profile";
import { absoluteSiteUrl, pageHead } from "@/lib/seo";
import { m } from "@/paraglide/messages.js";

export const Route = createFileRoute("/(marketing)/about/")({
	head: () =>
		pageHead({
			path: "/about",
			title: m["seo.about.title"](),
			description: m["seo.about.description"](),
			image: profileImage,
			type: "profile",
			keywords: ["关于", "独立开发者", "写作", "个人简介"],
			jsonLd: {
				"@type": "ProfilePage",
				url: absoluteSiteUrl("/about"),
				mainEntity: {
					"@id": `${absoluteSiteUrl("/about")}#main-author`,
					"@type": "Person",
					name: "Hayden Bi",
					url: absoluteSiteUrl("/about"),
					image: profileImage,
					description: m["seo.about.description"](),
				},
			},
		}),
	component: AboutPage,
});
function AboutPage() {
	return (
		<div className="page-container flex min-h-[70svh] flex-col justify-center py-12">
			<div className="grid items-center gap-12 lg:grid-cols-2">
				<div className="space-y-8">
					<div className="inline-flex rounded-full bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
						Who's writing
					</div>
					<h1 className="font-serif text-4xl font-medium tracking-tight text-primary sm:text-5xl">
						Hey, I'm Hayden Bi.
					</h1>
					<div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
						<p>
							我是一名独立开发者，正在尝试把产品做向全球市场，也是一位咖啡研究者，记录风味与冲煮实验。
						</p>
						<p>
							平时喜欢电影、游戏和绘画，这些灵感常常会变成产品灵感或文章。这里分享我在出海开发、个人成长和生活兴趣里的实践笔记。
						</p>
					</div>
				</div>
				<img
					src={profileImage}
					alt="Portrait of Hayden Bi"
					width="1000"
					height="750"
					fetchPriority="high"
					className="aspect-[4/3] w-full rounded-2xl object-cover"
				/>
			</div>
		</div>
	);
}
