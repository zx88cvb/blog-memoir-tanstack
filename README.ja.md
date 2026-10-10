# TanStack Template

[English](README.md) | [简体中文](README.zh-CN.md) | **[日本語](README.ja.md)**

**TanStack Start、React、TypeScript** を基盤とした Web アプリケーションテンプレートです。多言語サイト、製品のランディングページ、小規模なアプリケーションの開発に利用できます。サンプルのホームページでは Hero と FAQ を組み合わせ、ライト・ダークテーマ、MDX コンテンツページ、基本的な SEO を提供しています。

![TanStack Template のソーシャル共有プレビュー](public/og.png)

## 主な機能

- **ファイルベースのルーティングとサーバーレンダリング**：TanStack Start + TanStack Router。ページ loader、サーバーハンドラー、クライアント側のナビゲーションに対応します。
- **データ取得**：TanStack Query とルーターの SSR を統合。サーバーではリクエストごとに独立した QueryClient を作成し、ブラウザーではインスタンスを再利用します。
- **多言語対応**：Paraglide / Inlang。英語、日本語、簡体字中国語、言語メニュー、多言語リンクを備えています。
- **テーマとコンポーネント**：Tailwind CSS 4、Base UI、Lucide アイコン。青緑色の配色で、初期テーマに light、dark、system を指定できます。
- **コンテンツと SEO**：3 言語の紹介、プライバシー、利用規約の MDX ページ。タイトル、説明、Open Graph、canonical URL、hreflang、JSON-LD に対応します。
- **サイトのエンドポイント**：`/robots.txt`、`/sitemap.xml`、`/llms.txt`、`/manifest.webmanifest`。
- **ビルドとチェック**：Vite、Nitro の Node サーバー出力、Biome。

現在、アカウントシステム、データベース、決済フローは組み込まれていません。S3/R2 アダプターや汎用ユーティリティは必要に応じて利用できますが、アップロード用の業務 API が提供されているわけではありません。GA4 は本番環境で ID を設定した場合のみ有効になります。広告コンポーネントは別途組み込む必要があります。

## セットアップ

Dockerfile に合わせて、**Node.js 22.12 以上の 22 系**と **pnpm 10** を推奨します。

```bash
pnpm install --frozen-lockfile
cp env.example .env.local
pnpm dev
```

`http://localhost:3000` にアクセスします。プロジェクトは `pnpm-lock.yaml` を使用するため、同じパッケージマネージャーを継続して使ってください。

### サイト設定

`.env.local` で公開設定を変更します。

```dotenv
VITE_APP_URL=http://localhost:3000
VITE_APP_NAME=TanStack Template
VITE_APP_DESCRIPTION=A web application template built with TanStack Start, React, and TypeScript.
VITE_DEFAULT_LOCALE=en
VITE_DEFAULT_THEME=light
```

`src/config/index.ts` が設定と既定値をまとめて読み込みます。`VITE_*` 変数はクライアントのビルドに含まれる可能性があるため、秘密情報を保存しないでください。GA4 はサーバー変数 `GOOGLE_ANALYTICS_ID` を使用し、空にすると無効になります。

Vite 設定のカスタムローダーは `.env.local` → `.env.{NODE_ENV}` → `.env` の順に読み込みます。既存の空でないプロセス環境変数が優先されます。認証情報を含む環境ファイルはコミットせず、ローカル設定には無視対象の `.env.local` を使用してください。公開設定を変更したら開発サーバーを再起動し、公開前に再ビルドしてください。

## 技術構成

| レイヤー | 技術と役割 |
| --- | --- |
| ページとルーティング | TanStack Start / Router：ファイルルート、loader、サーバーレンダリング、ナビゲーション |
| データ | TanStack Query：リクエストのキャッシュと SSR 統合 |
| 表示 | React 19 + TypeScript：ページ構成、機能ブロック、共通コンポーネント |
| スタイル | Tailwind CSS 4 + Base UI：テーマトークン、操作の基本要素、レスポンシブレイアウト |
| 多言語対応 | Paraglide / Inlang：メッセージのコンパイル、言語 Cookie、URL のローカライズ |
| コンテンツ | MDX：言語別の静的ページとメタデータ |
| ビルドと実行 | Vite 8 + Nitro：クライアントのビルドと Node サーバー出力 |
| コード品質 | TypeScript の厳格な型チェック + Biome の整形、import 整理、lint |

リクエストは最初に `src/server.ts` の Paraglide ミドルウェアで言語を処理し、その後 TanStack Start に渡されます。`src/router.tsx` が生成されたルートツリー、URL のローカライズ、QueryClient を接続し、`__root.tsx` が HTML 文書とサイトレイアウトを提供します。ページはブロックを組み合わせ、ブロックは文言や機能のロジックを担当し、汎用の表示コンポーネントは props で内容を受け取ります。

## ディレクトリとファイルの役割

```text
src/
├── routes/                 # ファイルルート、ルートレイアウト、サイトのエンドポイント
│   └── (marketing)/(legal)/ # 紹介、プライバシー、利用規約、共通 MDX 読み込み
├── components/
│   ├── home/               # ホームページの構成
│   ├── blocks/             # Hero、ホームの FAQ、サイトレイアウトなど
│   ├── faq/                # 言語に依存しない FAQ 表示
│   ├── layout/             # ヘッダー、フッター、モバイルナビゲーション
│   ├── shared/             # Logo などの共通コンポーネント
│   ├── ui/                 # Button、Accordion、Select などの基本コンポーネント
│   └── analytics/          # GA4 と広告コンポーネント
├── config/                 # 環境設定、言語表示、SEO の言語情報
├── core/
│   ├── i18n/               # 多言語ナビゲーションと動的メッセージのユーティリティ
│   └── storage/            # S3 / R2 アダプターと共通ストレージインターフェース
├── integrations/           # TanStack Query provider と開発ツール
├── lib/                    # SEO、サイトマップ、リクエスト、キャッシュなど
├── paraglide/              # 生成されたランタイムとメッセージ。直接編集しない
├── router.tsx              # ルーターと Query SSR の統合
├── server.ts               # サーバー入口と言語ミドルウェア
├── routeTree.gen.ts        # 自動生成されるルートツリー
└── styles.css              # Tailwind 入口、テーマ、グローバルスタイル
content/pages/              # 3 言語の MDX 本文と meta
messages/                   # en.json、ja.json、zh-cn.json の翻訳元ファイル
project.inlang/             # 言語一覧、メッセージ形式、Paraglide 設定
app/paraglide/              # Vite で追加設定されている Paraglide 生成出力
public/                     # Logo、共有画像、favicon、国旗などの静的素材
```

ルートディレクトリの `vite.config.ts` はプラグインと開発サーバーを設定し、`tsconfig.json` は型チェックと `@/`、`#/` のソース別名を定義します。`biome.json` はコード規約、`Dockerfile` は Node へのデプロイ例です。`AGENTS.md` は貢献ガイド、`.impeccable.md` はデザイン方針です。`.output/`、`.tanstack/`、`.nitro/` と Inlang キャッシュは生成物です。

## よく使うコマンド

| コマンド | 用途 |
| --- | --- |
| `pnpm dev` | 開発サーバーを起動。既定のポートは 3000 |
| `pnpm build` | クライアントと Nitro サーバーをビルド |
| `pnpm preview` | 本番ビルドをローカルでプレビュー |
| `pnpm generate-routes` | ルートツリーを再生成 |
| `pnpm i18n:generate` | 翻訳メッセージとランタイムをコンパイル |
| `pnpm check:i18n` | 多言語プロジェクトをチェック |
| `pnpm check` | ファイルを書き換えずに Biome の総合チェックを実行 |
| `pnpm lint` | Biome の lint チェックを実行 |
| `pnpm format --write` | Biome の整形を適用 |
| `pnpm exec tsc --noEmit` | TypeScript の型チェック |

`pnpm machine-translate` は Inlang の機械翻訳を呼び出します。事前にサービス設定を確認し、結果は人がレビューしてください。現在、自動テストのフレームワークやカバレッジの基準はありません。動的な参照や MDX に対する未使用メッセージの検出は不完全な場合があるため、キーを削除する前に実際の参照を確認してください。

## カスタマイズ

### ページの追加

`src/routes/` にルートファイルを追加し、再利用する内容はコンポーネントに配置します。`(marketing)` などのルートグループは URL に含まれません。`__root.tsx` はルートレイアウトを定義し、`-` で始まるファイルはルーティング対象外の補助ロジックに利用できます。`routeTree.gen.ts` は直接編集しないでください。

```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/example")({
  component: () => <main id="main-content">Example</main>,
});
```

サイト内の移動には `@/core/i18n/navigation` の `Link` を使い、`/about` のように言語の接頭辞なしで `href` を渡してください。現在、英語は `/`、日本語は `/ja`、簡体字中国語は `/zh-cn` を使用します。

### 翻訳と MDX の変更

3 つの `messages/*.json` ファイルを同じキーで更新し、`pnpm i18n:generate` を実行します。既知のメッセージには `m["home.hero.title"]()` のような静的呼び出しを使います。言語一覧は `project.inlang/settings.json`、URL の方針は `project.inlang/paraglide.config.ts` にあります。アプリケーションは `src/paraglide` を使用し、追加の `app/paraglide` 出力は翻訳元ではありません。

MDX ページは `content/pages/` にあり、英語は `about.mdx`、日本語は `about.ja.mdx`、中国語は `about.zh-cn.mdx` を使います。各ファイルは `title`、`description`、`updated_at` を持つ `meta` をエクスポートします。新しいコンテンツページには対応するルートも必要です。既存ページと共通の `staticPageRouteOptions` を参考にしてください。

### テーマとブランドの変更

`src/styles.css` が配色を定義します。ライト背景は暖白色の `#FAFAF7`、ダーク背景は `#111816`、主ボタンは `#0F766E`、ダーク時の強調色は `#2DD4BF` です。テーマ切り替えで保存した訪問者の設定は `VITE_DEFAULT_THEME` より優先されます。

- `public/logo.png`：ヘッダーとフッターの透明 Logo。共通 Logo コンポーネントが直接参照します。
- `public/og.png`：ソーシャル共有の既定画像。SEO メタデータに合わせて **1200 × 630** を維持してください。
- `public/favicon.ico`：現在の Logo から生成した透明ブラウザーアイコン。16、32、48、64px の画像を含みます。
- アプリケーションアイコン：ブランドに合わせて別途変更し、公開前に manifest のパスを確認してください。
- `src/lib/seo.ts`：共通のページメタデータ。ホームのタイトルと説明は `seo.home.*` の翻訳キーを使います。

## ビルドとデプロイ

```bash
pnpm build
node .output/server/index.mjs
```

デプロイ先のディレクトリは `dist/` ではなく **`.output/`** です。実行時のサーバーは `PORT`、`HOST` などのプロセス環境変数で設定します。本番のサイト URL はビルド前に設定してください。

リポジトリのマルチステージ Dockerfile も利用できます。

```bash
docker build -t tanstack-template .
docker run --rm -p 3000:3000 --env-file .env.local tanstack-template
```

Dockerfile は Node 22、pnpm 10、Nitro の Node 出力を使用します。現在 `.dockerignore` はありません。イメージをビルドする前に除外設定を追加し、ローカル環境ファイル、Git データ、依存ディレクトリがビルドコンテキストに含まれないようにしてください。公開設定はイメージのビルド時に確定する必要があります。

## 公開と貢献

変更後は型チェック、Biome チェック、本番ビルドを実行してください。影響を受けるページの 3 言語、モバイルレイアウト、明暗テーマ、キーボード操作を手動で確認します。Biome は tab インデントとダブルクォートを使い、コンポーネント名は PascalCase、ファイル名は kebab-case に統一します。

公開前にサンプル内容を置き換え、運営者情報、プライバシーポリシー、利用規約を完成させてください。本番ドメイン、共有画像、サイトマップ、manifest アイコン、`ads.txt` が実際のデプロイと一致するか確認します。コミットの範囲を明確にし、PR には変更内容と検証結果を記載してください。見た目の変更にはスクリーンショットを添えます。その他の規約は [AGENTS.md](AGENTS.md) を参照してください。
