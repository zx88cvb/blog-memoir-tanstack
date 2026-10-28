---
title: "NextJS接入Google Analytics方法"
date: "2025-08-20"
excerpt: "NextJS接入Google Analytics方法,首先安装@next/third-parties 执行 npm install @next/third-parties"
image: "https://r2.haydenbi.com/cover/post/pexels-wolfgang-weiser-467045605-17928576%20(1).png"
tags: ["Next.js", "前端开发", "NodeJS", "Google Analytics"]
author: "Hayden Bi"
---

## 1. 安装 npm install @next/third-parties

执行npm安装命令
```bash
    npm install @next/third-parties
```
## 2. 引入GoogleAnalytics组件

一般在app下的layout.tsx中引入

```ts
import { GoogleAnalytics } from '@next/third-parties/google';
```

加入GoogleAnalytics代码并且控制只在生产环境使用

```ts
// 仅在生产环境启用GoogleAnalytics
    const GA_ENABLED = process.env.NODE_ENV === 'production';
    return (
      <html lang="en">
        <body>{children}</body>
        {/* Google Analytics - 仅在生产环境启用 */}
        {GA_ENABLED && <GoogleAnalytics gaId="your gaID" />}
      </html>
    );
```

## 3. 检查接入是否成功

### 3.1. 通过F12查看

项目部署到生产环境后进去页面，通过F12查看

![浏览器开发者工具显示Google Analytics代码](https://r2.haydenbi.com/post/google-analytics-f12.png)

如果有图中的代码则表示Google Analytics代码已经成功加入到项目中，一般这段代码会在最末尾

### 3.2. 登录Google Analytics查看是否有访问数据

![Google Analytics控制台显示过去30分钟活跃用户数据](https://r2.haydenbi.com/post/google-analytics-console.png)

如图所示,刚刚访问过后会在**过去 30 分钟的活跃用户数** 中显示数据

也可以通过左侧菜单的实时概览进行查看

![Google Analytics实时概览页面显示访问数据](https://r2.haydenbi.com/post/google-analytics-real-time.png)

好了,以上就是NextJS接入Google Analytics接入的全过程，希望对你有所帮助
