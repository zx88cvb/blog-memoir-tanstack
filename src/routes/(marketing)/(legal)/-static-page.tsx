import type { ComponentType } from 'react';
import { notFound, useLoaderData } from '@tanstack/react-router';
import { createIsomorphicFn } from '@tanstack/react-start';
import { getRequestUrl } from '@tanstack/react-start/server';

import type { AppLocale } from '@/config/locale';
import { pageHead } from '@/lib/seo';
import { m } from '@/paraglide/messages.js';
import { baseLocale, getLocale } from '@/paraglide/runtime.js';

const getRequestOrigin = createIsomorphicFn()
  .server(() => getRequestUrl().origin)
  .client(() => window.location.origin);

type PageMeta = {
  title: string;
  description: string;
  updated_at: string;
};

type PageModule = {
  default: ComponentType;
  meta: PageMeta;
};

// Eagerly bundle the static content pages (small legal/info MDX files).
// Keys are absolute from the project root.
const pages = import.meta.glob<PageModule>('/content/pages/*.mdx', {
  eager: true,
});

function loadPage(slug: string, locale: AppLocale): PageModule | null {
  return (
    pages[`/content/pages/${slug}.${locale}.mdx`] ??
    pages[`/content/pages/${slug}.${baseLocale}.mdx`] ??
    pages[`/content/pages/${slug}.mdx`] ??
    null
  );
}

type LoaderData = {
  meta: PageMeta;
  slug: string;
  locale: AppLocale;
  head: ReturnType<typeof pageHead>;
};

// Shared route options for static MDX pages. Each page gets its own
// explicit route file (e.g. privacy-policy.tsx) so static segments
// always outrank dynamic ones — add a new page by creating the MDX
// content plus a thin route file using this factory.
export function staticPageRouteOptions(slug: string) {
  return {
    loader: (): LoaderData => {
      const locale = getLocale();
      const page = loadPage(slug, locale);
      if (!page) throw notFound();
      return {
        meta: page.meta,
        slug,
        locale,
        head: pageHead({
          locale,
          path: `/${slug}`,
          title: page.meta.title,
          description: page.meta.description,
          requestOrigin: getRequestOrigin(),
        }),
      };
    },
    head: ({ loaderData }: { loaderData?: LoaderData }) => loaderData?.head ?? {},
    component: StaticPage,
  };
}

function StaticPage() {
  const { meta, slug, locale } = useLoaderData({
    strict: false,
  }) as LoaderData;

  const page = loadPage(slug, locale)!;
  const Content = page.default;

  return (
    <article>
      <header className="border-border mb-6 border-b pb-5">
        <h1 className="text-foreground text-3xl font-semibold tracking-tight md:text-4xl">
          {meta.title}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">{meta.description}</p>
        <p className="text-muted-foreground mt-2 text-xs">
          {m['common.pages.last_updated']({}, { locale })}: {meta.updated_at}
        </p>
      </header>
      <div className="text-foreground/90 text-[15px] leading-7">
        <Content />
      </div>
    </article>
  );
}
