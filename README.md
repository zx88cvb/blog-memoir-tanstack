# Hayden Bi Blog

从 `bi-blog-memoir` 迁移的个人博客，采用 React 19、TanStack Start/Router、Vite、Nitro 和 Tailwind CSS 4。内容使用 Content Collections + markdown-it，在构建阶段生成 HTML、目录和搜索文本；没有 Next.js、Fumadocs 或 MDX 运行时。

![项目截图](https://i.imgur.com/s5dG4jM.png)

## 开发

需要 Node.js 22.18+ 和 pnpm 10。

```sh
pnpm install --frozen-lockfile
cp env.example .env.local
pnpm dev
```

默认开发地址为 `http://localhost:3000`。公开配置通过 `VITE_*` 在构建时注入；Google Analytics ID 在服务端运行时读取，仅生产环境启用。

## 内容维护

- `content/blog/*.md`：文章；`content/category/*.md`：分类。
- `content/data/`：友链、产品与侧栏广告。保留原 JSON 结构及排序；产品历史数据的数组名为 `friends`。
- `content-collections.ts`：集合、字段校验和编译转换；`scripts/markdown.ts`：HTML、目录和搜索文本生成。
- `.content-collections/`、`src/paraglide/`、`src/routeTree.gen.ts`：生成文件，请修改其源配置。

文章示例：

```md
---
title: "文章标题"
date: "2026-10-28"
updated: "2026-10-28"
description: "搜索与分享摘要"
author: "Hayden Bi"
tags: ["AI"]
image: "https://example.com/cover.webp"
published: true
---

## 前言

正文。
```

`title`、`date` 必填；`excerpt` 优先于 `description` 作为展示摘要。`published` 默认 `true`，设置 `false` 后不会出现在页面、详情、搜索、RSS 或 sitemap。以 `.txt` 结尾的草稿不收录。

`updated` 可选，使用 `YYYY-MM-DD`，不能早于 `date`。仅在实质修改文章时手动填写真实更新日期；不要按构建时间或文件修改时间自动生成，也无需为历史文章补填。填写后文章页展示最后更新时间，并同步到 JSON-LD、Open Graph、sitemap 与 RSS 频道维护时间；文章排序及 RSS `pubDate` 仍使用原始发布日期。

首页搜索与 `/api/search` 共用服务端匹配逻辑，覆盖标题、摘要、描述、标签、分类和正文纯文本，去除查询首尾空白、忽略大小写，按发布日期倒序。正文和全文搜索源数据不会打入浏览器包。

文件名决定原始 slug，只去除末尾 `.md`。请勿修改已发布文件名的大小写或内部句点。文章支持标准 Markdown、表格、删除线和 HTML 图片布局；HTML 使用 `class`，不使用 JSX 的 `className` 或 React 组件。代码高亮在构建时完成，未知语言显示为普通代码块。

修改、增加或删除内容后，Vite 插件自动重新生成集合。生产环境无需保留内容源码或编译工具。

## 目录与职责

- `src/routes/index.tsx`：首页；`src/routes/__root.tsx`：根壳。
- `src/routes/(marketing)/{页面}/index.tsx`：关于、博客、友链、产品；文章详情位于 `posts/$slug/index.tsx`。目录分组不改变公开 URL。
- `src/routes/api/search.ts`：`/api/search` 的参数和响应入口。
- robots、llms、Manifest、sitemap 的生成实现直接放在各自的根路由文件；`src/routes/feed[.]xml.ts` 保留 RSS 业务模块的响应入口，所有公开地址不变。
- `src/modules/*/service.ts`：各模块业务入口。post 将文章查询、匹配和 `createServerFn` 封装放在同一文件，使用 `createServerOnlyFn` 隔离 Content Collections 读取；`types.ts` 提供客户端展示类型。search 提供兼容的搜索结果映射。列表参数与 loader 仍在路由中声明。
- `src/modules/feed/`：通过 `feed` 包生成 RSS 2.0，保留文章 GUID、发布时间和频道维护日期；空订阅的频道日期使用生成时间。modules 仅承载业务代码和 API 调用。
- `src/modules/friends/`、`product/`：各自的数据筛选与排序；共享的 `SiteEntry` 类型位于 `src/types/site-entry.ts`。
- 每个页面直接在路由的 `head` 中调用 `src/lib/seo.ts` 提供的通用 `pageHead`，组合元数据和结构化数据，不再建立页面专属 SEO 文件。`src/lib/xml.ts` 提供 XML 转义，`src/config/profile.ts` 保存头像图片配置。
- `src/components/layout/blog-layout.tsx`：站点壳与侧栏联动动画；桌面侧栏、共享导航、移动 dialog、广告、页脚和返回顶部组件分别维护在 layout 目录。`src/config/navigation.ts` 集中维护主菜单、社交入口和页脚菜单。
- `src/components/home/home-page.tsx`：组合 HomeHero 与 PostList，首页与 `/blog` 共用，主内容 main 由布局提供。
- `src/components/blog/post-pagination.tsx`：Prev/Next、最多七个页码/省略号项目；小屏展示当前页/总页数。`share-menu.tsx` 保留原博客 Share2 图标、紧凑菜单与复制回退。友链仍使用通用 CopyButton。
- `src/styles.css`：主题与语义样式 token、正文与评论样式、侧栏和主题按钮交互。
- `src/integrations/analytics/functions.ts`：Analytics 服务端集成，GA 配置仍由服务端读取。

静态 meta title、description、默认 SEO、404、RSS、Manifest 和 llms 文案通过 `messages/zh-cn.json` 维护，并在请求或渲染时调用 Paraglide。英文、日文资源保持相同键，目前复用现有文案。文章元数据仍使用 frontmatter，友链与产品内容仍使用业务 JSON；不再使用 `site-data.ts` 混合文案和数据。

## 路由与兼容

- `/`：文章列表；`category`、`q`、`page` 支持组合，每页九篇。
- `/posts/{slug}`：文章；原有大小写、含句点 URL 和目录锚点保留。
- `/about`、`/friends`、`/product`：关于、友链和产品。
- `/blog`：列表兼容入口，canonical 指向 `/`；所有筛选、分页链接指向首页。
- `/api/search?query=关键词`：已发布文章全文搜索，返回兼容的结果数组；空查询返回 `[]`。
- `/feed.xml`、`/sitemap.xml`、`/robots.txt`、`/llms.txt`、`/manifest.webmanifest`：订阅和发现端点。

页面默认中文，原有中英文混排文案保留。Hero 标签与描述、分页、分享和文章空状态使用 Paraglide 中英日资源，在组件渲染时读取；Hero 英文标题保持各语言相同。生产页面只启用中文，不展示语言选择器，不发布带语言前缀的页面。无结果时可重置搜索、分类、页码和未提交的输入，并保留滚动位置。模板的隐私和条款占位页已移除。

默认语言的唯一来源是 `project.inlang/settings.json` 中的 `baseLocale: "zh-cn"`；Vite 插件与 Paraglide 配置使用 `strategy: ["baseLocale"]`。修改这些源配置后重新生成翻译，不要直接修改生成目录。

Waline 使用原始评论路径 `/posts/{slug}` 和 `/friends`。继续配置原 Waline 服务即可显示历史评论，无需重新导入评论。

## 验证

```sh
pnpm check
pnpm exec tsc --noEmit
pnpm check:i18n
pnpm test:content
pnpm test:env
pnpm test:watch
VITE_APP_URL=https://haydenbi.com pnpm build
pnpm test:migration
```

`pnpm check` 的迁移基线为 38 个既有错误；清理未使用的旧 Header 并规范环境加载文件的 Node 导入后，目前剩余 37 个错误、26 条警告和 3 条提示，均属于原有诊断。全局样式已开启 Tailwind CSS 语法支持并纳入 Biome 检查，本次修改文件检查通过。错误分类、文件与范围说明见 [Biome 基线](docs/migration/biome-baseline.md)。不要对全库执行自动修复来消除这些差异。

`test:content` 验证中文及重复标题锚点、表格、HTML 图片、代码高亮、更新时间校验、共享搜索规则、大页数分页、剪贴板复制回退及显式 locale 的中英日文案与参数。`test:watch` 验证 Vite 下文章新增、编辑、撤稿和删除后的 SSR 更新，以及更新时间在正文、SEO、sitemap、RSS 中的输出和首页/API 搜索一致性。`test:migration` 自动启动临时 Nitro 服务并关闭，对旧文章及完整 SEO 标签基线、SSR、canonical、404、查询参数、搜索、RSS、sitemap、验证文件和浏览器包隔离执行检查。原生 Node 测试通过 `scripts/load-post-service.ts` 解析 Content Collections 的构建别名。必须先构建，且测试的 `VITE_APP_URL` 应与构建时一致；未指定时按 `https://haydenbi.com` 验收。回归服务从系统临时目录启动，验证生产产物不依赖源码工作目录。

## 构建与部署

本次迁移不更改域名。正式站点使用 `https://haydenbi.com`。不要将用于开发的 localhost canonical 部署到生产。

```sh
VITE_APP_URL=https://haydenbi.com pnpm build
node .output/server/index.mjs
```

公开的 `VITE_*` 变量由 Vite 原生加载，优先级为进程变量 > `.env.{mode}.local` > `.env.local` > `.env.{mode}` > `.env`。开发时修改环境文件会触发 Vite 重载；生产修改后必须重新构建。`VITE_DEFAULT_THEME` 支持 `light`、`dark`、`system`，已有的用户主题选择优先于配置默认值。

服务端变量仍由 `loadEnvFiles()` 加载，优先级为进程变量 > `.env.local` > `.env.{NODE_ENV}` > `.env`；文件中的 `VITE_*` 不会写入 `process.env`，避免重载时旧值覆盖新配置。`pnpm test:env` 验证这两条加载链路与主题配置更新。使用 Docker 时，在构建阶段提供公开配置，运行时通过环境变量传入 `GOOGLE_ANALYTICS_ID`。不要把秘密放进 `VITE_*`。

```sh
docker build --build-arg VITE_APP_URL=https://haydenbi.com -t haydenbi-blog .
docker run --rm -p 3000:3000 -e GOOGLE_ANALYTICS_ID=G-EXAMPLE haydenbi-blog
```

上线前检查真实域名的文章、分享图、评论服务和站点验证文件；上线后观察 404、服务器错误、Search Console 抓取及 canonical。切换流量前保留原站部署作为回退。

`bi-blog-memoir/` 仅作为迁移参考，不参与新项目类型检查、lint 或 Docker 构建。旧文章验收基线保存在 `scripts/fixtures/legacy-posts.json`。

Router Core 在直接依赖及 pnpm overrides 中统一固定为 `1.171.37`，确保 Nitro 与浏览器使用相同的路由状态编码。升级 TanStack 时需同步调整这两处，并复验生产首屏 hydration。

迁移验证结果与界面截图见 [迁移验收报告](docs/migration/README.md)。
