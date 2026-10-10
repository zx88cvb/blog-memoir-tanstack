import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { createServerFn } from '@tanstack/react-start';

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

import { getLocale } from "@/paraglide/runtime.js";
import { m } from "@/paraglide/messages.js";
import { Link } from "@/core/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";

import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { SiteLayout } from "@/components/blocks/site-layout";
import { themeInitScript } from "@/components/theme-toggle";
import { envConfigs } from "@/config";

interface MyRouterContext {
  queryClient: QueryClient
}

// Expose only public analytics settings through the root loader.
const getAnalyticsConfigs = createServerFn().handler(async () => {
  const configs = envConfigs;
  return {
    gaId: configs.google_analytics_id?.trim() || '',
    adsenseCode: configs.adsense_code?.trim() || '',
  };
});

export const Route = createRootRouteWithContext<MyRouterContext>()({
  loader: () => getAnalyticsConfigs(),
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const { gaId } = Route.useLoaderData();
  return (
    <html lang={getLocale()} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <HeadContent />
        {import.meta.env.PROD && (
					<GoogleAnalytics measurementId={gaId} />
				)}
      </head>
      <body>
        <SiteLayout>{children}</SiteLayout>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}

/**
 * 404 page
 */
function NotFound() {
	const title = m["not_found.title"]();
	const description = m["not_found.description"]();

	return (
		<>
			<title>{`${title} | ${envConfigs.app_name}`}</title>
			<meta name="description" content={description} />
			<meta name="robots" content="noindex" />
			<main
				id="main-content"
				className="mx-auto flex min-h-[60svh] max-w-2xl flex-col items-center justify-center px-6 py-16 text-center"
			>
				<p className="text-6xl font-semibold tracking-tight text-muted-foreground sm:text-8xl">
					404
				</p>
				<h1 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
					{title}
				</h1>
				<p className="mt-4 max-w-lg text-sm leading-7 text-muted-foreground sm:text-base">
					{description}
				</p>
				<Link href="/" className={buttonVariants({ className: "mt-8", size: "lg" })}>
					{m["not_found.back_home"]()}
				</Link>
			</main>
		</>
	);
}
