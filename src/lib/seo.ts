import { envConfigs } from "@/config";
import { m } from "@/paraglide/messages.js";

export function siteOrigin() {
	return envConfigs.app_url.replace(/\/$/, "");
}

export function absoluteSiteUrl(path: string) {
	return new URL(path, `${siteOrigin()}/`).toString();
}

export function shareImage() {
	return "/og.png";
}

type JsonLd = Record<string, unknown>;
interface PageHeadOptions {
	path: string;
	title: string;
	description?: string;
	image?: string;
	keywords?: string[];
	socialTitle?: string;
	type?: "website" | "article" | "profile";
	publishedTime?: string;
	modifiedTime?: string;
	jsonLd?: JsonLd;
}

export function pageHead({
	path,
	title,
	description = m["seo.home.description"](),
	image = "/logo.png",
	keywords,
	socialTitle = title,
	type = "website",
	publishedTime,
	modifiedTime,
	jsonLd,
}: PageHeadOptions) {
	const url = absoluteSiteUrl(path);
	const imageUrl = absoluteSiteUrl(image);
	return {
		meta: [
			{ title },
			{ name: "description", content: description },
			...(keywords?.length
				? [{ name: "keywords", content: keywords.join(", ") }]
				: []),
			{ property: "og:type", content: type },
			{ property: "og:title", content: socialTitle },
			{ property: "og:description", content: description },
			{ property: "og:url", content: url },
			{ property: "og:site_name", content: m["seo.home.title"]() },
			{ property: "og:locale", content: "zh_CN" },
			{ property: "og:image", content: imageUrl },
			...(publishedTime
				? [{ property: "article:published_time", content: publishedTime }]
				: []),
			{ name: "twitter:card", content: "summary_large_image" },
			...(modifiedTime
				? [{ property: "article:modified_time", content: modifiedTime }]
				: []),
			{ name: "twitter:title", content: socialTitle },
			{ name: "twitter:description", content: description },
			{ name: "twitter:image", content: imageUrl },
			{ name: "twitter:site", content: envConfigs.twitter_site },
		],
		links: [{ rel: "canonical", href: url }],
		scripts: jsonLd
			? [
					{
						type: "application/ld+json",
						children: JSON.stringify({
							"@context": "https://schema.org",
							...jsonLd,
						}).replace(/</g, "\\u003c"),
					},
				]
			: [],
	};
}
