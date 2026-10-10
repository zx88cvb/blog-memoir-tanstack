import { createFileRoute } from "@tanstack/react-router";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";
import { HomePage } from "@/components/home/home-page";
import { getLocale } from "@/paraglide/runtime.js";
import { homeHead } from "@/lib/seo";

// 同一 loader 兼容首次 SSR 与客户端导航，保留请求 origin 作为 SEO 回退值。
const getRequestOrigin = createIsomorphicFn()
	.server(() => getRequestUrl().origin)
	.client(() => window.location.origin);

export const Route = createFileRoute("/")({
	loader: () => {
		const locale = getLocale();
		return {
			head: homeHead(locale, getRequestOrigin()),
		};
	},
	head: ({ loaderData }) => loaderData?.head ?? {},
	component: HomePage,
});
