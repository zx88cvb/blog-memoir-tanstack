import { createFileRoute } from "@tanstack/react-router";
import { SiteEntries } from "@/components/blog/site-entries";
import { absoluteSiteUrl, pageHead, shareImage } from "@/lib/seo";
import { activeProducts } from "@/modules/product/service";
import { m } from "@/paraglide/messages.js";

export const Route = createFileRoute("/(marketing)/product/")({
	head: () =>
		pageHead({
			path: "/product",
			title: m["seo.product.title"](),
			description: m["seo.product.description"](),
			image: shareImage(),
			keywords: ["产品", "工具", "独立开发", "Projects", "Tools"],
			jsonLd: {
				"@type": "CollectionPage",
				name: m["seo.product.title"](),
				url: absoluteSiteUrl("/product"),
				description: m["seo.product.description"](),
				hasPart: activeProducts.map((product) => ({
					"@type": "SoftwareApplication",
					name: product.name,
					url: product.url,
					description: product.description,
					image: product.avatar,
				})),
			},
		}),
	component: ProductPage,
});
function ProductPage() {
	return (
		<div className="page-container max-w-4xl py-12">
			<header className="mb-8 space-y-3">
				<p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
					Products
				</p>
				<h1 className="font-serif text-4xl font-medium text-primary">
					产品 / Products
				</h1>
				<p className="text-muted-foreground">个人独立开发的产品与工具</p>
			</header>
			<SiteEntries entries={activeProducts} />
		</div>
	);
}
