---
title: "Dokploy安装和部署项目流程"
date: "2025-09-10"
excerpt: "Dokploy 是一个免费的、自托管的平台. 使用Dokploy的原因: 自带 Traefik，自动处理域名解析、HTTPS 证书（Let’s Encrypt 自动续期.."
image: "https://r2.haydenbi.com/cover/post/land-o-lakes-inc-1w3tO5F8HYY-dokploy-install.png"
tags: ["Dokploy", "前端开发", "部署"]
author: "Hayden Bi"
---

## 使用Dokploy的原因

我之前用的都是传统的部署方式。通过Dockerfile进行部署然后使用Nginx做反向代理。SSL证书使用Let’s Encrypt 。每当上一个新项目这一套程序都得走一遍而且是纯手动配置执行。因为考虑到现在是初期尝试阶段，新项目的个数会有点多，再加上想把重心放在产品业务上，运维方面的事情就想通过自动化来完成。于是发现了Dokploy 是一个免费的、自托管的平台即服务 (PaaS)，可简化应用程序和数据库的部署和管理。

✅ 优点

+ 自带 **Traefik**，自动处理域名解析、HTTPS 证书（Let’s Encrypt 自动续期）。
+ Web UI 一键部署，不用自己写 nginx.conf。
+ 内置 **GitHub 自动部署**，更新代码 = 自动重新构建/上线。
+ 内置 **数据库/存储管理**，可以直接装 Postgres、MySQL、Redis。
+ 多项目管理方便，日志可视化。

## 前置条件
1. 一台Linux服务器.运行内存2GB RAM
2. Linux发行版(以下版本官方测试过，其他发行版不太确定是否能使用)
+ Ubuntu 24.04 LTS
+ Ubuntu 23.10
+ Ubuntu 22.04 LTS
+ Ubuntu 20.04 LTS
+ Ubuntu 18.04 LTS
+ Debian 12
+ Debian 11
+ Debian 10
+ Fedora 40
+ Centos 9
+ Centos 8

## 安装Dokploy
Dokploy有两种使用模式：云版本，开源版本

使用云版本每个月会有一定的费用，而开源版本是完全免费的 收费模式如下图

![Dokploy收费模式图](https://r2.haydenbi.com/post/1757491869182-ce73125a-2bcf-402d-9e7f-2053df9a0307.png)

本篇介绍的是在服务器上安装的开源版本

我的服务器的发行版是Debian 12 其他Linux发行版安装同理

安装使用官方提供的命令

```bash
curl -sSL https://dokploy.com/install.sh | sh
```

如果服务器上没有安装Docker 这条命令会自动帮你安装

> 注意: 需要确保服务器上的80、443、3000端口是空闲状态

> 我安装时因为服务器上有Nginx运行所以提示80端口被占用，把Nginx关掉就可以安装了

安装成功后可以通过 你的服务器公网http://IP:3000 比如http://123:456:789:123:3000（需要设置服务器的3000端口开放才可以访问）

![Dokploy注册页面](https://r2.haydenbi.com/post/1757491213684-e51efb9e-4474-44ed-840b-b66e00bf5c39.png)

进入图中页面可以注册你的账号密码

## 部署第一个项目
这里我使用NextJS项目为例来部署一个项目

![Dokploy控制台主页面](https://r2.haydenbi.com/post/aa057a46-32ad-4cea-accd-839edfc7f845.png)

登录到主页面后可以看到Dokploy的控制台

### 新建Project
选择左侧菜单的Projects-> 点击右侧的Create Project

![创建新项目页面](https://r2.haydenbi.com/post/1757492233682-20797c34-f19f-4a27-a3dc-97b996059d8b.png)

输入项目名称和描述信息

点击Create

### 新建Service
点击进入刚刚创建的Project可以看到这个页面是Service服务页面

Service是Project下面的服务，可以理解成真正意义上你的单独的项目

![Service服务页面](https://r2.haydenbi.com/post/1757492393834-2b13e187-4ad6-4a91-9a38-e6b0daaa39de.png)

点击右侧的Create Service -> 选择Application->填写你的项目名称等信息

### 配置关联Git项目仓库
![配置Git仓库页面](https://r2.haydenbi.com/post/997e07bb-1ce4-4b9b-936d-d04ce5f21bfc.png)

点击刚刚创建的Service会进入到如图所示的页面

1. 首先在General下看到Provider这一栏
2. 选择你的仓库 我项目是放在Github上，所以选择Github
3. 选择Github Account 如果是第一次Github会要求你授权登录，授权成功后可以选择你的账号
4. Repository仓库可以看到你Github上所有的项目，这时选择你需要部署的项目
5. 下面的Branch 、Build Path等配置不变按照默认的来

![Git仓库配置保存提示](https://r2.haydenbi.com/post/1757493061897-e9fcd829-d6f6-4be6-a154-eb213127d026.png)

最后点击Save保存 记住一定得点一下，下一步配置Build时如果没保存会把刚刚的配置清空掉

### 配置Build
![Build构建配置页面](https://r2.haydenbi.com/post/1757493174100-3fdc2a3b-be6b-46e6-84a4-e2483a3b7133.png)

页面接着往下滑会看到Build Type设置。

1. Build Type选择 Dockerfile
2. 下面Docker File 填写./Dockerfile

项目中一定得有Dockerfile文件并且在最外层的根目录。Dockerfile文件在下面可以参考下。

> 我NextJS用的是pnpm构建的，所以Dockerfile中会有pnpm-lock.yaml的文件。如果构建时发现这个文件没有就是因为没有使用pnpm run build的原因，在本地执行一遍就好了

```dockerfile
FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat && yarn global add pnpm

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml* ./
RUN pnpm i --frozen-lockfile

# Rebuild the source code only when needed
FROM deps AS builder

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY . .
RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir .next && \
    chown nextjs:nodejs .next

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# server.js is created by next build from the standalone output
CMD ["node", "server.js"]
```

最后点击save保存



### 设置环境变量
![环境变量配置页面](https://r2.haydenbi.com/post/1757493604873-0b8ff1f8-919f-4e51-bbe9-cc9ef7e5eeb8.png)

点击菜单上面的Environment可以看到如上图的页面

在Environment Settings 这一栏点开右边的眼睛图标就可以添加你项目中的.env配置文件

最后点击最下面的Save保存

### 部署
![部署按钮页面](https://r2.haydenbi.com/post/1757493836315-8d927632-47a3-4900-85e8-ba9ab9705ebc.png)

回到General菜单，点击Deploy部署按钮即可

这时选择Deployments菜单可以看到部署时的情况日志

当部署成功之后点击最右侧的Logs菜单查看项目的日志

## 给项目添加域名
### 配置DNS
这里我以cloudflare为例

把域名指向你服务器的公网IP

![Cloudflare DNS配置页面](https://r2.haydenbi.com/post/1757494396551-d01272f7-f518-408d-b526-86bbdf5e31c9.png)

Type: A 

name:域名.com 

conent: 服务器的公网IP



如果需要配置www前缀 可以参考CNAME那一栏的配置

### 配置域名和SSL证书
![Dokploy域名配置页面](https://r2.haydenbi.com/post/1757493997311-75daa751-d17d-49a6-b660-34d5d7274b58.png)

选择Domains这栏->点击Add Domain

![添加域名配置详情](https://r2.haydenbi.com/post/1757494054323-6449c70f-e2fa-4bf6-9c6c-176b150f80de.png)

可以参考我的配置，把Host换成你的域名

Container Port是Dockerfile里写的容器内端口，这里我是3000



配置完成后通过域名就可以访问到你当前的项目了

### www前缀域名转发到一级主域名
我所使用的版本Dokploy 0.25.1目前没有找到可视化的配置方法。有人说在左侧菜单Traefik File System中可以配置，这个我没有试过 主要对Traefik不太熟悉



目前的办法是通过Cloudflare进行转发

![Cloudflare页面规则配置](https://r2.haydenbi.com/post/1757494937335-50f5b867-6a75-4f0d-aa22-cf2e2cb23932.png)

Cloudflare左侧菜单 Rules->Page Rules->点击Create Page Rule

![www域名重定向规则配置](https://r2.haydenbi.com/post/1757494986158-1f9e25ef-9ef0-4e98-ba98-7f7353ae59af.png)

具体配置可以参考我的配置，把域名换成你自己的即可



目前为止项目配置到此结束，通过域名和www域名转发到主域名都可以访问了！

## 给Dokploy添加域名(可选)
![Dokploy Web Server配置页面](https://r2.haydenbi.com/post/1757495171453-4fefa141-d696-4e1a-b254-00b08c6d6c23.png)

> 配置之前记得设置DNS把域名映射到服务器的IP上，和上面4.1配置DNS步骤一样

如果想通过域名访问dokploy页面可以点击菜单左侧Web Server

Domain输入你的未使用域名(二级域名也可以)

Let's Encrypt Email 填写你的邮箱 开启Https点击Save

接下来便可以通过域名访问dokploy页面了，3000端口也可以不同对外开放了～



好了，本期教程到此结束。如果有任何疑问可以通过邮箱联系我，更多精彩内容可以关注我的博客。
