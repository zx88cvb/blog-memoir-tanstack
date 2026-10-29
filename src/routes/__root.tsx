import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Link,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { BlogLayout } from "@/components/layout/blog-layout";
import { themeInitScript } from "@/components/theme-toggle";
import { envConfigs } from "@/config";
import { m } from "@/paraglide/messages.js";
import appCss from "../styles.css?url";

// Expose only public settings through the root loader.
const getConfigs = createServerFn().handler(() => ({
	gaId: envConfigs.google_analytics_id.trim(),
	walineServerUrl: envConfigs.waline_server_url.trim(),
}));

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
	{
		loader: () => getConfigs(),
		head: () => ({
			meta: [
				{ charSet: "utf-8" },
				{ name: "viewport", content: "width=device-width, initial-scale=1" },
				{ title: m["seo.home.title"]() },
				{ name: "IndexNow", content: "963011ef5f7746e2b680d9492f292702" },
			],
			links: [
				{ rel: "stylesheet", href: appCss },
				{ rel: "icon", href: "/favicon.ico" },
				{ rel: "shortcut icon", href: "/favicon-32x32.png" },
				{ rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
				{ rel: "manifest", href: "/manifest.webmanifest" },
				{
					rel: "alternate",
					type: "application/rss+xml",
					title: m["seo.home.title"](),
					href: "/feed.xml",
				},
			],
		}),
		shellComponent: RootDocument,
		component: RootComponent,
		notFoundComponent: NotFound,
		errorComponent: ({ reset }) => (
			<div className="page-container py-24 text-center">
				<h1 className="text-3xl font-serif">{m["error.title"]()}</h1>
				<button type="button" className="mt-6 underline" onClick={reset}>
					{m["error.retry"]()}
				</button>
			</div>
		),
	},
);

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="zh-CN" suppressHydrationWarning>
			<head>
				{/* biome-ignore lint/security/noDangerouslySetInnerHtml: Static theme bootstrap is generated from validated configuration. */}
				<script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
				<HeadContent />
			</head>
			<body>
				{children}
				<Scripts />
			</body>
		</html>
	);
}

function RootComponent() {
	const { gaId } = Route.useLoaderData();
	return (
		<>
			{import.meta.env.PROD && <GoogleAnalytics measurementId={gaId} />}
			<BlogLayout>
				<Outlet />
			</BlogLayout>
		</>
	);
}

export function NotFound() {
	return (
		<div className="page-container flex min-h-[70svh] flex-col items-center justify-center text-center">
			<title>{m["seo.not_found.title"]()}</title>
			<meta name="robots" content="noindex" />
			<h1 className="select-none font-serif text-9xl font-medium text-primary/20">
				404
			</h1>
			<div className="relative -mt-12 space-y-6">
				<h2 className="font-serif text-4xl font-medium text-primary">
					{m["not_found.title"]()}
				</h2>
				<p className="mx-auto max-w-md text-lg leading-relaxed text-muted-foreground">
					{m["not_found.description"]()}
				</p>
				<Link
					to="/"
					className="inline-flex min-h-10 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
				>
					{m["not_found.back_home"]()}
				</Link>
			</div>
		</div>
	);
}
