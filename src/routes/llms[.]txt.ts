import { createFileRoute } from "@tanstack/react-router";

import { envConfigs } from "@/config";
import { absoluteSiteUrl } from "@/lib/seo";
import { type Locale, locales, localizeHref } from "@/paraglide/runtime.js";

const languageNames = {
	en: "English",
	ja: "Japanese",
	"zh-cn": "Simplified Chinese",
} as const satisfies Record<Locale, string>;

const pages = [
	{
		path: "/",
		name: "TanStack Template",
		description: "A web application template built with TanStack Start, React, and TypeScript.",
	},
	{
		path: "/about",
		name: "About",
		description: "The template's routing, data fetching, localization, themes, and customization options.",
	},
	{
		path: "/privacy",
		name: "Privacy policy",
		description: "Example privacy content for the website operator to adapt to actual data practices.",
	},
	{
		path: "/terms",
		name: "Terms of service",
		description: "Example terms for the website operator to adapt to the deployed service.",
	},
] as const;

export const Route = createFileRoute("/llms.txt")({
	server: {
		handlers: {
			GET: ({ request }) => {
				const requestOrigin = new URL(request.url).origin;
				const body = [
					`# ${envConfigs.app_name}`,
					"",
					"> A web application template built with TanStack Start, React, and TypeScript.",
					"",
					"The template includes file-based routing, server rendering, TanStack Query integration, Paraglide localization, theme switching, reusable UI components, and localized MDX pages.",
					"",
					"It supports English, Japanese, and Simplified Chinese. Adapt the example content, site configuration, and integrations to your project. Privacy and terms pages are starting points for customization by the website operator.",
					"",
					...locales.flatMap((locale) => [
						`## ${languageNames[locale]} pages`,
						"",
						...pages.map(({ path, name, description }) =>
							`- [${name}](${absoluteSiteUrl(localizeHref(path, { locale }), requestOrigin)}): ${description}`,
						),
						"",
					]),
					"## Optional",
					"",
					`- [Sitemap](${absoluteSiteUrl("/sitemap.xml", requestOrigin)}): Public page URLs and language alternatives.`,
					`- [Robots](${absoluteSiteUrl("/robots.txt", requestOrigin)}): Crawling rules for this site.`,
					"",
				].join("\n");
				return new Response(body, {
					headers: { "Content-Type": "text/plain; charset=utf-8" },
				});
			},
		},
	},
});
