import { createFileRoute } from "@tanstack/react-router";
import { CopyButton } from "@/components/blog/copy-button";
import { SiteEntries } from "@/components/blog/site-entries";
import { WalineComments } from "@/components/blog/waline-comments";
import { profileImage } from "@/config/profile";
import { absoluteSiteUrl, pageHead, shareImage } from "@/lib/seo";
import { activeFriends } from "@/modules/friends/service";
import { m } from "@/paraglide/messages.js";

export const Route = createFileRoute("/(marketing)/friends/")({
	head: () =>
		pageHead({
			path: "/friends",
			title: m["seo.friends.title"](),
			description: m["seo.friends.description"](),
			image: shareImage(),
			keywords: ["友链", "友情链接", "伙伴站点", "blogroll"],
			jsonLd: {
				"@type": "CollectionPage",
				name: m["seo.friends.title"](),
				url: absoluteSiteUrl("/friends"),
				description: m["seo.friends.description"](),
				hasPart: activeFriends.map((friend) => ({
					"@type": "WebSite",
					name: friend.name,
					url: friend.url,
					description: friend.description,
				})),
			},
		}),
	component: FriendsPage,
});
function FriendsPage() {
	return (
		<div className="page-container max-w-4xl py-12">
			<header className="mb-8 space-y-3">
				<p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
					Friends
				</p>
				<h1 className="font-serif text-4xl font-medium text-primary">
					友链 / Friendly Links
				</h1>
				<p className="text-muted-foreground">精选伙伴站点</p>
			</header>
			<SiteEntries entries={activeFriends} />
			<section className="mt-20 border-t border-dashed border-border pt-10">
				<header className="mb-10 space-y-3">
					<p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
						Apply
					</p>
					<h2 className="font-serif text-3xl font-medium text-primary">
						本站信息 / My Link Info
					</h2>
					<p className="text-muted-foreground">
						欢迎交换友链，以下是本站的信息
					</p>
				</header>
				<dl className="soft-surface max-w-xl divide-y divide-border rounded-2xl px-6">
					{[
						{ label: "Name", value: "HaydenBi" },
						{ label: "URL", value: absoluteSiteUrl("/").replace(/\/$/, "") },
						{
							label: "Avatar",
							value: profileImage,
						},
						{ label: "Desc", value: "Coffee & Indie Developer" },
					].map(({ label, value }) => (
						<div
							key={label}
							className="grid gap-2 py-3 sm:grid-cols-[96px_1fr] sm:items-center"
						>
							<dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
								{label}
							</dt>
							<dd className="flex flex-wrap items-center gap-2 break-all text-sm">
								<span>{value}</span>
								<CopyButton value={value} label={label} />
							</dd>
						</div>
					))}
				</dl>
			</section>
			<div className="mt-16 border-t border-dashed border-border pt-10">
				<WalineComments path="/friends" />
			</div>
		</div>
	);
}
