# 默认主题与语言配置验收

2026-10-29。

## 修复原因

原 `loadEnvFiles()` 将文件中的 `VITE_*` 写入 `process.env`。Vite 重载配置后，旧的进程值优先于新的文件值，导致 `.env.local` 已改成 `dark`，页面首屏脚本和客户端仍得到 `light`。

现在该加载器只处理服务端变量，公开变量完全交给 Vite。已完整重启 localhost:3000 开发服务，清除旧进程值；本地主题恢复为 `VITE_DEFAULT_THEME="dark"`，其余本地配置保留，仅移除无效的语言变量。

## 自动检查

- `pnpm test:env`：3 项通过，覆盖公开变量不污染进程、同进程重新读取主题变更、服务端优先级、Vite mode-local 及显式进程值优先。
- `pnpm test:content`：13 项通过。
- `pnpm test:watch`：临时副本中 1 项通过，避免与运行中的开发服务争用生成文件。
- 类型检查、生产构建、修改文件 Biome 和 `git diff --check`：通过。
- 生产客户端包确认注入 `VITE_DEFAULT_THEME: dark`。
- 迁移回归：8/9 通过；唯一失败为已有友链数据与 `/friends` 的 SEO 基线差异。本次没有更改基线。
- 全量 Biome：37 个错误、26 条警告、3 条提示；相较之前减少两条 Node 导入提示，没有新增诊断。

## 浏览器检查

在此前未用于主题操作的 `http://[::1]:3000/` 来源进行，保留 localhost 来源原有的用户主题偏好。

| 配置与操作 | 观察结果 |
| --- | --- |
| 重启后默认 dark | 首屏脚本 `c="dark"`，根元素 dark、colorScheme 和按钮状态均为深色 |
| 修改文件为 light，Vite 重载后刷新 | 首屏脚本变为 light，最终主题和按钮均为亮色 |
| 修改文件为 system，Vite 重载后刷新 | 首屏脚本变为 system；浏览器当前系统偏好为亮色，页面同步为亮色 |
| 恢复 dark | 首屏脚本与页面再次为深色 |
| 在 dark 默认下手动选择亮色并刷新 | 首屏配置仍为 dark，保存的亮色选择优先，页面和按钮保持亮色 |

验收结束时恢复深色显示，本地配置保持 dark。主题动画、减少动画及非法值回退实现没有修改。默认语言仍来自 Paraglide 的 baseLocale 与 baseLocale 策略，已删除的语言配置没有残留引用。

## 截图

- [默认深色](dark.jpg)
- [修改配置后亮色](light.jpg)
- [保存的亮色偏好优先](saved-light.jpg)
