---
title: "OpenClaw (原 Moltbot) 安装教程: 从 0 搭建本地 AI 助手"
date: "2026-01-30"
excerpt: "完整记录 OpenClaw (原 Moltbot) 的安装流程与模型授权、Telegram 机器人接入步骤，附常见问题解决方案"
image: "https://r2.haydenbi.com/cover/post/moltbot-install.png"
tags: ["AI", "Moltbot", "OpenClaw", "ChatGPT"]
author: "Hayden Bi"
---

## 前言
Moltbot (原 Clawdbot) 今天改名为:OpenClaw 可以理解为一个本地运行的 AI 网关工具，它负责在大模型与电脑之间搭桥，让 AI 助手真正能在本地工作。它可以部署在你的个人设备上，例如 **Mac、Windows 或 Linux**，让 AI 不只是停留在网页聊天，而是真正接入你的本地环境与常用应用。

它的核心作用是把 AI 模型的能力和你的设备、软件生态连接起来：

- 一端连接大语言模型（官方推荐使用 Claude，同时也支持 Gemini、OpenAI 等）
- 另一端连接你的本地系统以及常见聊天平台，例如：
  - WhatsApp
  - Telegram
  - iMessage
  - Signal
  - …

通过这种方式，Moltbot 可以让 AI 代理直接在你的日常工具中工作，比如自动回复消息、执行系统任务或触发自动化流程。

> 注意：网关模块通常需要稳定访问模型接口和第三方平台。如果选择在服务器上部署，为避免 DNS、Telegram API、模型访问等网络限制问题，建议使用境外服务器环境运行。

## 前置条件
1. 一台 Linux 服务器，2 核 2GB 配置（推荐 Ubuntu）

## 服务器
我选择的是 AWS 服务器，新账号有 USD $100 的 AWS 抵用金，有效时间半年，基本可以免费用一段时间。

地区我选择的是新加坡。2 核 2GB 配置可以参考下图的选项配置：

<figure class="my-6">
  <img
    src="https://r2.haydenbi.com/post/moltbot-install-aws-server.png"
    alt="AWS 服务器配置示例"
    class="mx-auto h-auto w-full max-w-[720px] rounded-md"
    loading="lazy"
  />
  <figcaption class="mt-2 text-center text-sm text-neutral-500">
    AWS 服务器实例配置示例（2 核 2GB）
  </figcaption>
</figure>


## 安装
### 执行终端命令
```bash
curl -fsSL https://clawd.bot/install.sh | bash
```

<figure class="my-6">
  <img
    src="https://r2.haydenbi.com/post/moltbot-install-moltbot-risky.png"
    alt="安装脚本风险提示"
    class="mx-auto h-auto w-full max-w-[720px] rounded-md"
    loading="lazy"
  />
  <figcaption class="mt-2 text-center text-sm text-neutral-500">
    安装脚本的风险提示确认界面
  </figcaption>
</figure>

I understand this is powerful and inherently risky. Continue?

选择 **Yes**。

<figure class="my-6">
  <img
    src="https://r2.haydenbi.com/post/moltbot-install-onboarding-mode.png"
    alt="Onboarding 模式选择"
    class="mx-auto h-auto w-full max-w-[720px] rounded-md"
    loading="lazy"
  />
  <figcaption class="mt-2 text-center text-sm text-neutral-500">
    Onboarding 模式选择界面
  </figcaption>
</figure>

Onboarding mode

选择 **QuickStart**。

### 选择模型和授权
<figure class="my-6">
  <img
    src="https://r2.haydenbi.com/post/moltbot-install-model-auth.png"
    alt="模型与授权提供方选择"
    class="mx-auto h-auto w-full max-w-[720px] rounded-md"
    loading="lazy"
  />
  <figcaption class="mt-2 text-center text-sm text-neutral-500">
    选择模型与授权提供方
  </figcaption>
</figure>

Model/auth provider

这里我选择的是 OpenAI，因为刚好是 ChatGPT Pro 的用户。如果大家没有 OpenAI 的账号，可以选择 Qwen，免费额度足够使用。

<figure class="my-6">
  <img
    src="https://r2.haydenbi.com/post/moltbot-install-oauth-url.png"
    alt="授权链接展示"
    class="mx-auto h-auto w-full max-w-[720px] rounded-md"
    loading="lazy"
  />
  <figcaption class="mt-2 text-center text-sm text-neutral-500">
    复制授权链接到浏览器完成授权
  </figcaption>
</figure>

选择完模型后会显示授权链接，把链接复制到你本机浏览器打开完成授权。

<figure class="my-6">
  <img
    src="https://r2.haydenbi.com/post/moltbot-install-callback-url.png"
    alt="授权回调链接提示"
    class="mx-auto h-auto w-full max-w-[720px] rounded-md"
    loading="lazy"
  />
  <figcaption class="mt-2 text-center text-sm text-neutral-500">
    授权完成后返回的回调链接
  </figcaption>
</figure>

<figure class="my-6">
  <img
    src="https://r2.haydenbi.com/post/moltbot-install-redirect-url.png"
    alt="浏览器授权完成后的跳转链接"
    class="mx-auto h-auto w-full max-w-[720px] rounded-md"
    loading="lazy"
  />
  <figcaption class="mt-2 text-center text-sm text-neutral-500">
    浏览器授权完成后的跳转链接
  </figcaption>
</figure>

如果选择的是 OpenAI 或 Google 等模型，授权后会返回一个 localhost 链接，把链接复制到终端回车即可。Qwen 模型授权后不需要这一步。

<figure class="my-6">
  <img
    src="https://r2.haydenbi.com/post/moltbot-install-model-choose.png"
    alt="模型选择界面"
    class="mx-auto h-auto w-full max-w-[720px] rounded-md"
    loading="lazy"
  />
  <figcaption class="mt-2 text-center text-sm text-neutral-500">
    选择要使用的模型
  </figcaption>
</figure>

选择模型。

### 选择聊天频道

<figure class="my-6">
  <img
    src="https://r2.haydenbi.com/post/moltbot-install-select-channel.png"
    alt="选择聊天频道"
    class="mx-auto h-auto w-full max-w-[720px] rounded-md"
    loading="lazy"
  />
  <figcaption class="mt-2 text-center text-sm text-neutral-500">
    选择要接入的聊天频道
  </figcaption>
</figure>

<figure class="my-6">
  <img
    src="https://r2.haydenbi.com/post/moltbot-install-http-api-code.png"
    alt="Telegram HTTP API Key 提示"
    class="mx-auto h-auto w-full max-w-[720px] rounded-md"
    loading="lazy"
  />
  <figcaption class="mt-2 text-center text-sm text-neutral-500">
    输入 Telegram HTTP API Key
  </figcaption>
</figure>

这里使用 Telegram，按照提示首先要创建自己的机器人：

- 打开 Telegram，搜索 `@BotFather`，关注并输入 `/newbot`
- 给机器人取名字（例如 `moltbot`）
- 再给机器人一个 id（例如 `molt123_bot`）
- 得到 HTTP API 的 KEY 后输入到终端
- 别忘了点击刚刚创建的机器人，后续步骤需要接收一条消息

### 配置 Skill

<figure class="my-6">
  <img
    src="https://r2.haydenbi.com/post/moltbot-install-skill-config.png"
    alt="配置技能提示"
    class="mx-auto h-auto w-full max-w-[720px] rounded-md"
    loading="lazy"
  />
  <figcaption class="mt-2 text-center text-sm text-neutral-500">
    是否现在配置 Skills
  </figcaption>
</figure>

Configure skills now?

选 **Yes**。

<figure class="my-6">
  <img
    src="https://r2.haydenbi.com/post/moltbot-install-homebrew.png"
    alt="Homebrew 安装命令提示"
    class="mx-auto h-auto w-full max-w-[720px] rounded-md"
    loading="lazy"
  />
  <figcaption class="mt-2 text-center text-sm text-neutral-500">
    Homebrew 安装命令提示
  </figcaption>
</figure>

Show Homebrew install command?

选 **Yes**。

<figure class="my-6">
  <img
    src="https://r2.haydenbi.com/post/moltbot-install-skill-dependencies.png"
    alt="依赖与 Node 管理器选择"
    class="mx-auto h-auto w-full max-w-[720px] rounded-md"
    loading="lazy"
  />
  <figcaption class="mt-2 text-center text-sm text-neutral-500">
    选择 Node 管理器并处理依赖安装
  </figcaption>
</figure>

Preferred node manager for skill installs

选 **npm**。

Install missing skill dependencies

跳过也行，后面也可以再回来安装：

- 用空格选择 **Skip for now**，回车即可

我这里选择了 **summarize**（bird 忽略）。

<figure class="my-6">
  <img
    src="https://r2.haydenbi.com/post/moltbot-install-third-party-api-key.png"
    alt="第三方 API Key 配置"
    class="mx-auto h-auto w-full max-w-[720px] rounded-md"
    loading="lazy"
  />
  <figcaption class="mt-2 text-center text-sm text-neutral-500">
    第三方 API Key 配置（可暂时跳过）
  </figcaption>
</figure>

这些 KEY 暂时可以跳过，选择 **No**，后面如果需要也可以再填写。

<figure class="my-6">
  <img
    src="https://r2.haydenbi.com/post/moltbot-install-hooks-enable.png"
    alt="启用 hooks 提示"
    class="mx-auto h-auto w-full max-w-[720px] rounded-md"
    loading="lazy"
  />
  <figcaption class="mt-2 text-center text-sm text-neutral-500">
    是否启用 hooks
  </figcaption>
</figure>

Enable hooks

选择 **Skip for now**。

<figure class="my-6">
  <img
    src="https://r2.haydenbi.com/post/moltbot-install-hatch-bot.png"
    alt="选择 hatch 方式"
    class="mx-auto h-auto w-full max-w-[720px] rounded-md"
    loading="lazy"
  />
  <figcaption class="mt-2 text-center text-sm text-neutral-500">
    选择 hatch 方式（TUI）
  </figcaption>
</figure>

How do you want to hatch your bot?

选择 **Hatch in TUI**。

<figure class="my-6">
  <img
    src="https://r2.haydenbi.com/post/moltbot-install-complete.png"
    alt="安装完成提示"
    class="mx-auto h-auto w-full max-w-[720px] rounded-md"
    loading="lazy"
  />
  <figcaption class="mt-2 text-center text-sm text-neutral-500">
    安装完成提示
  </figcaption>
</figure>

到这里安装就已经完成了。

### Telegram 机器人配对

<figure class="my-6">
  <img
    src="https://r2.haydenbi.com/post/moltbot-install-tg-pairing-code.png"
    alt="Telegram 配对码"
    class="mx-auto h-auto w-full max-w-[720px] rounded-md"
    loading="lazy"
  />
  <figcaption class="mt-2 text-center text-sm text-neutral-500">
    Telegram 机器人配对码
  </figcaption>
</figure>

在刚刚创建好的机器人对话框中输入 `/start`，会出现 `Pairing code: XXXXXXX`。

在终端输入命令（将 `XXXXXXX` 替换成你的 code）：

```bash
clawdbot pairing approve telegram XXXXXXX
```

如果出现 `clawdbot: command not found`，退出终端重新进入即可。

<figure class="my-6">
  <img
    src="https://r2.haydenbi.com/post/moltbot-install-use.png"
    alt="Telegram 中使用 Moltbot"
    class="mx-auto h-auto w-full max-w-[720px] rounded-md"
    loading="lazy"
  />
  <figcaption class="mt-2 text-center text-sm text-neutral-500">
    配对完成后在 Telegram 中使用 Moltbot
  </figcaption>
</figure>

配对成功后就可以在 Telegram 机器人中正常使用了。

当然 Moltbot 能做到的远不止这些，还有许多意想不到的玩法等我们发掘，我也会在接下来的文章中持续分享。

## 常见问题
### telegram setMyCommands failed: HttpError: Network request for 'setMyCommands'
此错误表示你的 Clawdbot 实例无法连接到 Telegram 的 API 服务器 `api.telegram.org`。

最常见的原因：

1. 防火墙阻止了出站 HTTPS（端口 443）
2. VPS/主机提供商屏蔽了 Telegram IP 地址（一些廉价 VPS 提供商会这样做）
3. DNS 解析失败

解决方法：在 `/etc/hosts` 中添加以下内容：

```txt
149.154.166.110 api.telegram.org
```
