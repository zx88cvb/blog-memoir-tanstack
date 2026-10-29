# Hayden Bi Blog

个人博客与内容站点，基于 React 和 TanStack Start，支持 Markdown 文章、分类筛选、全文搜索、RSS 订阅与 JSON-LD SEO。

![项目截图](https://i.imgur.com/s5dG4jM.png)

## 技术栈

- React 19、TypeScript
- TanStack Start / Router（路由与服务端渲染）
- Vite、Nitro（开发与生产构建）
- Content Collections、markdown-it、Shiki（内容编译与代码高亮）
- Tailwind CSS 4、Lucide React（样式与图标）

## 目录结构

- `content/blog/`：Markdown 文章。
- `content/category/`：分类定义。
- `content/data/`：友链、产品与侧栏广告数据。
- `src/routes/`：页面路由与 API。
- `src/components/`：布局、文章与通用 UI 组件。
- `src/modules/`：文章、搜索、RSS 等业务逻辑。
- `src/config/`：站点配置与导航。
- `src/lib/`：通用工具；`src/styles.css`：全局样式。

## 开发 / 构建

需要 Node.js 22.18+ 和 pnpm 10。

```sh
pnpm install --frozen-lockfile
cp env.example .env.local
pnpm dev
```

默认开发地址：`http://localhost:3000`。

- 代码检查：`pnpm check`
- 类型检查：`pnpm exec tsc --noEmit`
- 生产构建：`pnpm build`

## 内容与路由

- 在 `content/blog/` 添加 `.md` 文章，frontmatter 中的 `title`、`date` 必填，支持摘要、标签、分类和封面。
- 文件名决定文章地址 `/posts/{slug}`，已发布文件名请保持不变。
- `published: false` 的草稿及 `.txt` 文件不收录。
- `updated` 可选，使用 `YYYY-MM-DD`，不能早于发布日期；仅在实质修改后手动填写真实日期，不自动生成或补写历史日期。
- 首页支持 `?category=` 分类、`?q=` 搜索与 `?page=` 分页，每页九篇。
- `/about`、`/friends`、`/product` 分别为关于、友链和产品页。

页面默认中文，基础语言由 `project.inlang/settings.json` 中的 `baseLocale` 配置。

## RSS / SEO

- RSS：`/feed.xml`，使用 `feed` 包生成，包含站点 Logo 和文章封面附件。
- 站点发现：`/sitemap.xml`、`/robots.txt`、`/llms.txt`。
- SEO：页面包含 canonical、Open Graph、Twitter Card 和 JSON-LD。
- 更新时间同步到文章页与订阅信息，文章排序和 RSS 发布日期仍使用原始发布日期。

## 环境变量

完整配置见 [env.example](env.example)。

- `VITE_APP_URL`：站点地址，用于 canonical、RSS 等绝对链接。
- `VITE_DEFAULT_THEME`：默认主题，支持 `light`、`dark`、`system`，用户保存的选择优先。
- `WALINE_SERVER_URL`：Waline 评论服务地址，运行时读取，留空时隐藏评论。
- `GOOGLE_ANALYTICS_ID`：服务端运行时读取，仅生产环境启用。

`VITE_*` 为公开的构建时配置，生产修改后需重新构建，不要放入秘密信息。

默认分享图为 `public/og.png`，替换图片后重新构建即可。Dokploy 中将评论地址配置为运行环境变量 `WALINE_SERVER_URL`，无需 Docker Build Args；首次部署新代码后，修改该地址只需重启容器。

## 部署

构建时设置真实站点地址，再运行 Nitro 服务：

```sh
VITE_APP_URL=https://haydenbi.com pnpm build
node .output/server/index.mjs
```

也可使用项目自带的 Dockerfile（站点地址默认使用 `https://haydenbi.com`）：

```sh
docker build -t haydenbi-blog .
docker run --rm -p 3000:3000 \
  -e WALINE_SERVER_URL=https://example.com \
  -e GOOGLE_ANALYTICS_ID=G-EXAMPLE haydenbi-blog
```

迁移验证结果与界面截图见 [迁移验收报告](docs/migration/README.md)。
