# Biome 原有问题基线

恢复上轮无关格式化后，`pnpm check` 返回非零：38 个错误、26 个警告、5 个提示。全部 38 个错误位于下表的 29 个文件中，均已逐字验证与当前 Git HEAD 原版一致，未扩大修改范围修复这些问题。

错误分布：29 个格式化、8 个导入排序、1 个旧 Label primitive 的无关联控件提示。本次实际变更的源文件单独检查通过，无新增错误。没有添加忽略规则来隐藏这些原有问题。

复核命令：

```sh
pnpm check
pnpm exec biome check --reporter=json --max-diagnostics=none
```

| 文件 | 原有错误 |
| --- | --- |
| `src/components/analytics/ads.tsx` | `format` |
| `src/components/layout/header.tsx` | `format` |
| `src/components/ui/accordion.tsx` | `assist/source/organizeImports`, `format` |
| `src/components/ui/dropdown-menu.tsx` | `format`, `assist/source/organizeImports` |
| `src/components/ui/input.tsx` | `format` |
| `src/components/ui/label.tsx` | `lint/a11y/noLabelWithoutControl`, `format` |
| `src/components/ui/select.tsx` | `assist/source/organizeImports`, `format` |
| `src/components/ui/switch.tsx` | `assist/source/organizeImports`, `format` |
| `src/components/ui/textarea.tsx` | `format` |
| `src/config/locale/index.ts` | `format`, `assist/source/organizeImports` |
| `src/core/i18n/dynamic.ts` | `format` |
| `src/core/i18n/navigation.tsx` | `format`, `assist/source/organizeImports` |
| `src/core/storage/index.ts` | `assist/source/organizeImports`, `format` |
| `src/core/storage/r2.ts` | `format` |
| `src/core/storage/s3.ts` | `format` |
| `src/integrations/tanstack-query/devtools.tsx` | `format` |
| `src/integrations/tanstack-query/root-provider.tsx` | `format` |
| `src/lib/api-client.ts` | `format` |
| `src/lib/cache.ts` | `format` |
| `src/lib/cookie.ts` | `format` |
| `src/lib/crypto.ts` | `format` |
| `src/lib/env.ts` | `format` |
| `src/lib/hash.ts` | `format` |
| `src/lib/query-client.ts` | `format` |
| `src/lib/rate-limit.ts` | `format` |
| `src/lib/redirect.ts` | `format` |
| `src/lib/resp.ts` | `format` |
| `src/lib/time.ts` | `format` |
| `src/lib/utils.ts` | `assist/source/organizeImports`, `format` |

本次恢复只涉及已确认的格式化、导入整理和自动修复；包依赖、内容配置、路由、样式、翻译配置等迁移所需改动及用户已有修改继续保留。
