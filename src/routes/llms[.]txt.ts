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
		name: "Address generator",
		description: "Generate sample addresses and contact profiles for the available countries and regions.",
	},
	{
		path: "/region/us-address",
		name: "US address generator",
		description: "Choose Random or one of all 50 US states for sample addresses with ZIP codes and simulated contact details.",
	},
	{
		path: "/region/jp-address",
		name: "Japan address generator",
		description: "Choose Random or one of all 47 Japanese prefectures for matched area and postal-code data with simulated building numbers and contact details.",
	},
	{
		path: "/us-tax-free-address-generator",
		name: "US tax-free state address generator",
		description: "Create test address samples for Delaware, Oregon, Alaska, Montana and New Hampshire; an address does not establish tax eligibility.",
	},
	{
		path: "/privacy",
		name: "Privacy policy",
		description: "How generation requests, browser preferences, technical information and support messages are handled.",
	},
	{
		path: "/terms",
		name: "Terms of service",
		description: "Permitted uses, sample-data limitations, automated access and service availability.",
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
					"> A free address generator for US and Japanese sample addresses and simulated contact profiles. No signup is required.",
					"",
					"Use the samples for testing, software development, education and demonstrations. The tools support all 50 US states, all 47 Japanese prefectures, and a dedicated selection of five US tax-free states: Delaware, Oregon, Alaska, Montana and New Hampshire.",
					"",
					"Address records or postal-area data may correspond to real places, while contact profiles and some address details are simulated. Results are not verified identities and are not guaranteed to exist or be deliverable. Do not use them for actual deliveries, identity verification, official registrations or tax filings. A generated address does not establish residence or eligibility for any tax exemption. The tax-free label refers to the absence of a statewide general sales tax, not exemption from every tax.",
					"",
					"Generated results are not saved as a server-side address history. The site is available in English, Japanese and Simplified Chinese. The following links point to existing web pages, including their usage explanations and FAQs.",
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
