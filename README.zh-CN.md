# TanStack Template

[English](README.md) | **[简体中文](README.zh-CN.md)** | [日本語](README.ja.md)

一个基于 **TanStack Start、React 和 TypeScript** 的 Web 应用模板，适合作为多语言网站、产品首页或小型应用的开发起点。首页示例通过 Hero 和 FAQ 展示组件组合，项目同时提供明暗主题、MDX 内容页面和基础 SEO。

![TanStack Template 分享预览](public/og.png)

## 已有能力

- **文件路由与服务端渲染**：TanStack Start + TanStack Router，支持页面 loader、服务端处理器和客户端导航。
- **数据请求**：集成 TanStack Query 与路由 SSR，服务端每次请求使用独立的 QueryClient，浏览器复用实例。
- **多语言**：Paraglide / Inlang，内置英语、日语和简体中文，提供语言菜单与本地化链接。
- **主题与组件**：Tailwind CSS 4、Base UI 和 Lucide 图标；青绿色主题，支持 light、dark、system 初始设置。
- **内容与 SEO**：三语言的关于、隐私和条款 MDX 页面；页面标题、描述、Open Graph、canonical、hreflang 和 JSON-LD。
- **站点端点**：`/robots.txt`、`/sitemap.xml`、`/llms.txt` 和 `/manifest.webmanifest`。
- **构建与检查**：Vite、Nitro Node 服务端输出和 Biome。

当前模板没有接入账户系统、数据库或支付流程。S3/R2 适配器和部分通用工具可按需使用，不代表已经提供上传业务接口。GA4 仅在生产环境且配置了 ID 时启用；广告组件需要自行接入。

## 快速开始

推荐使用 **Node.js 22.12+（22 系列）** 和 **pnpm 10**，与 Dockerfile 保持一致。

```bash
pnpm install --frozen-lockfile
cp env.example .env.local
pnpm dev
```

访问 `http://localhost:3000`。项目使用 `pnpm-lock.yaml`，请保持同一种包管理器。

### 站点配置

在 `.env.local` 中调整公开配置：

```dotenv
VITE_APP_URL=http://localhost:3000
VITE_APP_NAME=TanStack Template
VITE_APP_DESCRIPTION=A web application template built with TanStack Start, React, and TypeScript.
VITE_DEFAULT_LOCALE=en
VITE_DEFAULT_THEME=light
```

`src/config/index.ts` 集中读取配置与默认值。`VITE_*` 变量可进入客户端构建，勿用于存放密钥。GA4 使用服务端变量 `GOOGLE_ANALYTICS_ID`，留空即可关闭。

Vite 配置中的自定义加载器按 `.env.local` → `.env.{NODE_ENV}` → `.env` 顺序读取，已有非空进程变量优先。环境文件不得包含需要提交的凭据；本地推荐使用已被忽略的 `.env.local`。修改公开配置后重新启动开发服务，发布时重新构建。

## 技术架构

| 层级 | 技术与职责 |
| --- | --- |
| 页面与路由 | TanStack Start / Router：文件路由、loader、服务端渲染、导航 |
| 数据层 | TanStack Query：请求缓存及 SSR 集成 |
| 展示层 | React 19 + TypeScript：页面组合、业务区块、通用组件 |
| 样式层 | Tailwind CSS 4 + Base UI：主题 token、交互原语、响应式布局 |
| 国际化 | Paraglide / Inlang：消息编译、语言 Cookie、URL 本地化 |
| 内容层 | MDX：按语言加载静态页面及其元数据 |
| 构建与运行 | Vite 8 + Nitro：客户端构建和 Node 服务端输出 |
| 代码质量 | TypeScript 严格检查 + Biome 格式、导入和 lint 检查 |

请求先由 `src/server.ts` 的 Paraglide 中间件处理语言，再交给 TanStack Start。`src/router.tsx` 连接生成的路由树、URL 本地化和 QueryClient；`__root.tsx` 提供 HTML 文档与站点布局。页面组件组合区块，区块负责文案和业务，通用展示组件通过 props 接收内容。

## 目录与文件职责

```text
src/
├── routes/                 # 文件路由、根布局与站点端点
│   └── (marketing)/(legal)/ # 关于、隐私、条款及共享 MDX 加载逻辑
├── components/
│   ├── home/               # 首页组合入口
│   ├── blocks/             # Hero、首页 FAQ、站点布局等区块
│   ├── faq/                # 与语言无关的 FAQ 展示组件
│   ├── layout/             # 页头、页脚、移动导航
│   ├── shared/             # Logo 等共享组件
│   ├── ui/                 # Button、Accordion、Select 等基础组件
│   └── analytics/          # GA4 与广告组件
├── config/                 # 环境配置、语言显示与 SEO 语言信息
├── core/
│   ├── i18n/               # 本地化导航与动态消息工具
│   └── storage/            # S3 / R2 适配器及统一存储接口
├── integrations/           # TanStack Query provider 与开发工具
├── lib/                    # SEO、站点地图、请求、缓存等工具
├── paraglide/              # 生成的国际化运行时和消息，不手动修改
├── router.tsx              # 路由与 Query SSR 集成
├── server.ts               # 服务端入口与语言中间件
├── routeTree.gen.ts        # 自动生成的路由树
└── styles.css              # Tailwind 入口、明暗主题和全局样式
content/pages/              # 三语言 MDX 正文与 meta
messages/                   # en.json、ja.json、zh-cn.json 翻译源文件
project.inlang/             # 语言列表、消息格式及 Paraglide 编译配置
app/paraglide/              # Vite 中额外配置的 Paraglide 生成输出
public/                     # Logo、分享图、favicon、国旗等静态资源
```

根目录的 `vite.config.ts` 配置插件与开发服务，`tsconfig.json` 配置类型检查及 `@/`、`#/` 源码别名，`biome.json` 配置代码规范，`Dockerfile` 提供 Node 部署示例。`AGENTS.md` 是贡献指南，`.impeccable.md` 记录设计约定。`.output/`、`.tanstack/`、`.nitro/` 和 Inlang 缓存属于生成产物。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `pnpm dev` | 启动开发服务，默认端口 3000 |
| `pnpm build` | 构建客户端及 Nitro 服务端 |
| `pnpm preview` | 本地预览生产构建 |
| `pnpm generate-routes` | 重新生成路由树 |
| `pnpm i18n:generate` | 编译翻译消息与运行时 |
| `pnpm check:i18n` | 检查国际化项目 |
| `pnpm check` | Biome 综合检查，不自动改写 |
| `pnpm lint` | Biome lint 检查 |
| `pnpm format --write` | 应用 Biome 格式化 |
| `pnpm exec tsc --noEmit` | TypeScript 类型检查 |

`pnpm machine-translate` 可调用 Inlang 机器翻译；使用前了解其服务配置，并人工审核结果。目前没有自动化测试框架或覆盖率门槛。国际化检查对动态引用和 MDX 的未使用 key 判断可能不完整，删除 key 前需核对实际引用。

## 按需定制

### 新增页面

在 `src/routes/` 添加路由文件，将可复用内容放入组件。路由分组目录如 `(marketing)` 不进入 URL；`__root.tsx` 定义根布局，`-` 前缀文件可用于不参与路由的辅助逻辑。不要手动编辑 `routeTree.gen.ts`。

```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/example")({
  component: () => <main id="main-content">Example</main>,
});
```

站内导航优先使用 `@/core/i18n/navigation` 导出的 `Link`，传入不带语言前缀的 `href`，如 `/about`。当前英语使用 `/`，日语使用 `/ja`，简体中文使用 `/zh-cn`。

### 修改翻译与 MDX

同步编辑三个 `messages/*.json` 文件，保持 key 一致，再执行 `pnpm i18n:generate`。组件中的已知消息使用静态调用，例如 `m["home.hero.title"]()`。语言列表位于 `project.inlang/settings.json`，URL 策略位于 `project.inlang/paraglide.config.ts`；业务源码使用 `src/paraglide`，额外的 `app/paraglide` 输出不作为翻译源文件。

MDX 页面位于 `content/pages/`，英语使用 `about.mdx`，日语和中文分别使用 `about.ja.mdx`、`about.zh-cn.mdx`。每个文件导出 `meta`，包含 `title`、`description` 和 `updated_at`。新增内容页还需要对应路由，可参考已有页面与共享的 `staticPageRouteOptions`。

### 修改主题与品牌

`src/styles.css` 集中定义主题颜色：浅色暖白 `#FAFAF7`，深色背景 `#111816`，主按钮 `#0F766E`，深色强调 `#2DD4BF`。主题开关保存访客偏好，优先于 `VITE_DEFAULT_THEME`。

- `public/logo.png`：页头、页脚的透明 Logo；共享 Logo 组件目前直接引用此路径。
- `public/og.png`：默认社交分享图，保持 **1200 × 630**，SEO 元数据已按此尺寸配置。
- `public/favicon.ico`：由当前 Logo 生成的透明浏览器图标，包含 16、32、48、64px 图层。
- 应用图标：根据自己的品牌另行替换；发布前核对 manifest 中的图标路径。
- `src/lib/seo.ts`：统一页面元数据；首页标题和描述来自翻译文件中的 `seo.home.*`。

## 构建与部署

```bash
pnpm build
node .output/server/index.mjs
```

实际部署目录为 **`.output/`**，不是 `dist/`。运行时通过 `PORT`、`HOST` 等进程环境变量配置服务；站点 URL 应在构建前设置为正式域名。

也可以使用仓库中的多阶段 Dockerfile：

```bash
docker build -t tanstack-template .
docker run --rm -p 3000:3000 --env-file .env.local tanstack-template
```

Dockerfile 使用 Node 22、pnpm 10 和 Nitro Node 输出。仓库目前没有 `.dockerignore`；构建镜像前请自行配置忽略规则，避免将本地环境文件、Git 数据和依赖目录放入构建上下文。公开配置仍应在镜像构建阶段确定。

## 发布与贡献

修改后执行类型检查、Biome 检查和生产构建，并手动验证受影响页面的三语言、手机布局、明暗主题及键盘操作。Biome 使用 tab 缩进与双引号，组件名使用 PascalCase，文件名沿用 kebab-case。

发布前替换示例内容，完善运营者信息、隐私政策和服务条款，确认正式域名、分享图片、站点地图、manifest 图标和 `ads.txt` 与实际部署一致。提交保持范围清晰，并在 PR 中说明改动、验证结果；视觉修改附截图。更多约定见 [AGENTS.md](AGENTS.md)。
