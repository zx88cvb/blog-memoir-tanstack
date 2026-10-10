import { localeMeta } from "@/config/locale";
import { absoluteSiteUrl } from "@/lib/seo";
import { baseLocale, locales, localizeHref } from "@/paraglide/runtime.js";

/** 仅收录已上线的公开页面；国家路径与目录共用，排除 API 和未知 slug。 */
const publicPaths = [
	"/",
	"/privacy",
	"/about",
	"/terms",
];

/** 同时用于 XML 文本和属性，避免 URL 中的特殊字符破坏文档。 */
function escapeXml(value: string) {
	return value.replace(
		/[&<>"']/g,
		(character) =>
			({
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				'"': "&quot;",
				"'": "&apos;",
			})[character]!,
	);
}

/** requestOrigin 为站点 URL 未配置时的回退；不虚构 lastmod 或更新频率。 */
export function buildSitemapXml(requestOrigin?: string) {
	const urls = [...new Set(publicPaths)].flatMap((path) => {
		const urlFor = (locale: (typeof locales)[number]) =>
			escapeXml(absoluteSiteUrl(localizeHref(path, { locale }), requestOrigin));
		const alternates = [
			...locales.map(
				(locale) =>
					`<xhtml:link rel="alternate" hreflang="${escapeXml(localeMeta[locale].hreflang)}" href="${urlFor(locale)}"/>`,
			),
			`<xhtml:link rel="alternate" hreflang="x-default" href="${urlFor(baseLocale)}"/>`,
		].join("");
		return locales.map(
			(locale) => `  <url><loc>${urlFor(locale)}</loc>${alternates}</url>`,
		);
	});
	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>`;
}
