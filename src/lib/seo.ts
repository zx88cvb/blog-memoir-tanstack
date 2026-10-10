import { baseLocale, locales, localizeHref } from "@/paraglide/runtime.js";
import { envConfigs } from "@/config";
import { type AppLocale, localeMeta, message } from "@/config/locale";

function withoutTrailingSlash(value: string) {
	return value.replace(/\/$/, "");
}

export function siteOrigin(requestOrigin?: string) {
	return withoutTrailingSlash(
		envConfigs.app_url ?? requestOrigin ?? "http://localhost:3000",
	);
}

export function absoluteSiteUrl(path: string, requestOrigin?: string) {
	return new URL(path, `${siteOrigin(requestOrigin)}/`).toString();
}

/** 文案由路由按语言传入，工具只负责构建统一元数据。 */
export interface PageHeadOptions {
	/** 当前语言，用于 canonical、hreflang 和分享语言。 */
	locale: AppLocale;
	/** 不含语言前缀的站内路径，例如 /us-tax-free-address-generator/。 */
	path: string;
	/** 已翻译的页面标题，同步用于浏览器和社交分享。 */
	title: string;
	/** 已翻译的页面摘要，不在工具内部拼接营销文案。 */
	description: string;
	/** 站点 URL 未配置时使用的请求来源，SSR 与客户端导航均可传入。 */
	requestOrigin?: string;
	/** 自定义图片须提供真实 MIME、尺寸、替代文本；省略使用 /og.png。 */
	image?: {
		path: string;
		alt: string;
		type: string;
		width: number;
		height: number;
	};
	/** 首页使用 WebSite，其他页面默认 WebPage。 */
	schemaType?: "WebSite" | "WebPage";
}
/** @example pageHead({ locale, path: '/example/', title: 'Example', description: 'Description', requestOrigin }) */
export function pageHead({
	locale,
	path,
	title,
	description,
	requestOrigin,
	image,
	schemaType = "WebPage",
}: PageHeadOptions) {
	const pageUrl = absoluteSiteUrl(
		localizeHref(path, { locale }),
		requestOrigin,
	);
	const share = image ?? {
		path: "/og.png",
		alt: message("social_image_alt", locale),
		type: "image/png",
		width: 1200,
		height: 630,
	};
	const imageUrl = absoluteSiteUrl(share.path, requestOrigin);
	return {
		meta: [
			{ title },
			{ name: "description", content: description },
			{ property: "og:type", content: "website" },
			{ property: "og:site_name", content: envConfigs.app_name },
			{ property: "og:title", content: title },
			{ property: "og:description", content: description },
			{ property: "og:url", content: pageUrl },
			{
				property: "og:locale",
				content: localeMeta[locale].hreflang.replace("-", "_"),
			},
			{ property: "og:image", content: imageUrl },
			{ property: "og:image:type", content: share.type },
			{ property: "og:image:width", content: String(share.width) },
			{ property: "og:image:height", content: String(share.height) },
			{
				property: "og:image:alt",
				content: share.alt,
			},
			{ name: "twitter:card", content: "summary_large_image" },
			{ name: "twitter:title", content: title },
			{ name: "twitter:description", content: description },
			{ name: "twitter:image", content: imageUrl },
			{
				name: "twitter:image:alt",
				content: share.alt,
			},
		],
		links: [
			{ rel: "canonical", href: pageUrl },
			...locales.map((alternateLocale) => ({
				rel: "alternate",
				hrefLang: localeMeta[alternateLocale].hreflang,
				href: absoluteSiteUrl(
					localizeHref(path, { locale: alternateLocale }),
					requestOrigin,
				),
			})),
			{
				rel: "alternate",
				hrefLang: "x-default",
				href: absoluteSiteUrl(
					localizeHref(path, { locale: baseLocale }),
					requestOrigin,
				),
			},
		],
		scripts: [
			{
				type: "application/ld+json",
				children: JSON.stringify({
					"@context": "https://schema.org",
					"@type": schemaType,
					name: schemaType === "WebSite" ? envConfigs.app_name : title,
					url: pageUrl,
					description,
					inLanguage: localeMeta[locale].hreflang,
				}).replace(/</g, "\\u003c"),
			},
		],
	};
}
/** 首页兼容入口：使用独立 SEO 文案，保留 WebSite 结构化数据。 */
export function homeHead(locale: AppLocale, requestOrigin?: string) {
	return pageHead({
		locale,
		requestOrigin,
		path: "/",
		title: message("seo.home.title", locale),
		description: message("seo.home.description", locale),
		schemaType: "WebSite",
	});
}
