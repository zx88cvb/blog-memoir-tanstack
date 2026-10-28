---
title: "OpenClaw (原 Moltbot) Gmail 集成教程：邮件自动化与每日摘要"
date: "2026-02-03"
excerpt: "手把手完成 OpenClaw Gmail 授权与配置，支持重点邮件筛选、摘要生成与定时推送"
image: "https://r2.haydenbi.com/cover/post/openclaw-gmail-setup.png"
tags: ["AI", "Moltbot", "OpenClaw", "Gmail"]
author: "Hayden Bi"
---

## 前言
本文演示如何使用 OpenClaw（原名 Moltbot/Clawdbot）实现 Gmail 邮件自动化管理。你将学会完成 OAuth 授权、筛选重要邮件、生成摘要，并配置定时推送，让邮件处理更省心。

## 前置条件
1. 已安装 OpenClaw，并完成频道接入（可参考： [OpenClaw（原 Moltbot）安装教程：从 0 搭建本地 AI 助手](/posts/moltbot-install)）
2. 拥有 Google 账号（Gmail 邮箱）

## 集成

### 确定方案

<figure class="my-6">
  <img
    src="https://r2.haydenbi.com/post/openclaw-gmail-setup-start.png"
    alt="OpenClaw设置Gmail"
    class="mx-auto h-auto w-full max-w-[720px] rounded-md"
    loading="lazy"
  />
  <figcaption class="mt-2 text-center text-sm text-neutral-500">
    OpenClaw设置Gmail
  </figcaption>
</figure>

可以直接跟 OpenClaw 说下面这段话帮忙设置 Gmail：

```bash
Set up Gmail integration for email management
```

这里我选择的是方案 2：**Gmail API + OAuth**。这是 OpenClaw 最推荐的做法，下面是 OpenClaw 回复的操作方案：

```bash
方案 2 的落地步骤（我们就按这个来）

我会在这台 Clawdbot 服务器上做：

1. 写一个脚本：拉取 Gmail 未读邮件（From/Subject/时间/正文摘要/链接）
2. 设置定时：每 X 分钟检查一次
3. 把摘要推送给你（Telegram）
你需要做的 2 件事

A. 创建 Google OAuth 客户端

1. 打开 Google Cloud Console → 创建项目
2. APIs & Services → Enable APIs → 启用 Gmail API
3. Credentials → Create Credentials → OAuth client ID
类型选 “Desktop App”（最省事）
4. 下载生成的 client_secret_*.json
B. 把这个 json 发给我

• 最好用 Telegram 直接发 文件（不要粘贴在消息里）
• 我会把它放到服务器的 secrets/ 并只用于 OAuth 授权
我不会要你的 Gmail 密码，也不需要你给 2FA 验证码。



我还需要你确认 3 个设置（我才能一次配好）

1. 只读够不够？还是你想我也能 打标签/标记已读？（默认：只读）
2. 推送频率：每 5/15/30/60 分钟一次？
3. 推送规则：  • 只推 “未读且重要（Primary）”
  • 还是推所有未读（含 Promotions/Social）？

你回我这 3 个答案 + 把 client_secret_*.json 发过来，我就开始在服务器上搭脚本和定时任务。
```

### Google Cloud Console 配置
具体实现方案如下：

1. 打开 Google Cloud Console 第一次需要先创建项目 (https://console.cloud.google.com/).

<figure class="my-6">
  <img
    src="https://r2.haydenbi.com/post/openclaw-gmail-setup-google-cloud-console.png"
    alt="Google Cloud Console 主页"
    class="mx-auto h-auto w-full max-w-[720px] rounded-md"
    loading="lazy"
  />
  <figcaption class="mt-2 text-center text-sm text-neutral-500">
    Google Cloud Console 主页
  </figcaption>
</figure>

2. 选择 **API 和服务（APIs & Services）**，点击 **启用 API 和服务**

<figure class="my-6">
  <img
    src="https://r2.haydenbi.com/post/openclaw-gmail-setup-gmail-api-enable.png"
    alt="Google Cloud Console 启用API"
    class="mx-auto h-auto w-full max-w-[720px] rounded-md"
    loading="lazy"
  />
  <figcaption class="mt-2 text-center text-sm text-neutral-500">
    Google Cloud Console 启用API
  </figcaption>
</figure>

3. 找到 **Gmail API** 并启用

<figure class="my-6">
  <img
    src="https://r2.haydenbi.com/post/openclaw-gmail-setup-create-oauth-client.png"
    alt="Google Cloud Console 创建凭证"
    class="mx-auto h-auto w-full max-w-[720px] rounded-md"
    loading="lazy"
  />
  <figcaption class="mt-2 text-center text-sm text-neutral-500">
    Google Cloud Console 创建凭证
  </figcaption>
</figure>

4. 回到控制台 **API 和服务 → 凭证 → 创建凭证 → OAuth 客户端 ID**，类型选择 **Desktop App（桌面应用）**。创建完成后会生成客户端 ID 和客户端密钥，这两个一定要保存好。并下载 `client_secret_*.json` 文件。

<a id="oauth-consent-screen"></a>

<figure class="my-6">
  <img
    src="https://r2.haydenbi.com/post/openclaw-gmail-setup-oauth-consent-screen.png"
    alt="Google Cloud Console OAuth consent screen"
    class="mx-auto h-auto w-full max-w-[720px] rounded-md"
    loading="lazy"
  />
  <figcaption class="mt-2 text-center text-sm text-neutral-500">
    Google Cloud Console OAuth consent screen
  </figcaption>
</figure>

5. 在搜索框输入 **OAuth consent screen**，在 **目标对象 → 测试用户** 中添加自己的 Gmail 邮箱

### OpenClaw 配置

<figure class="my-6">
  <img
    src="https://r2.haydenbi.com/post/openclaw-gmail-setup-config.png"
    alt="OpenClaw Config Email"
    class="mx-auto h-auto w-full max-w-[720px] rounded-md"
    loading="lazy"
  />
  <figcaption class="mt-2 text-center text-sm text-neutral-500">
    OpenClaw Config Email
  </figcaption>
</figure>

接下来把刚刚下载的 `client_secret_*.json` 文件和自己的需求发给 OpenClaw。

这时会得到类似回复：

```bash
行，老板，三项设置我收到了：

1. 标记已读
2. 每 3 小时推送一次
3. 只推 Primary 未读
但现在还差最后一步：我需要你再给我一个 gmail_token.json（里面必须带 refresh_token），这样我才能在服务器上定时拉取邮件并“标记已读”。
注意：为了能标记已读，授权 scope 需要 gmail.modify（只读的 gmail.readonly 不够）。

你要做的事（在你自己的电脑上，5 分钟）

1. 新建一个文件夹，把你刚发的那个 client_secret.json 放进去
2. 在该文件夹里执行：
npm init -y
npm i googleapis @google-cloud/local-auth
3. 然后下载/复制我这段脚本（我服务器里已经准备好了同名脚本，你也可以让我发你文本），保存为 gmail_token_from_desktop.js，再运行：
node gmail_token_from_desktop.js ./client_secret.json
它会弹浏览器让你登录授权，成功后会生成 gmail_token.json。

4. 把生成的 gmail_token.json 发回给我（文件形式）。
我拿到 token 后会做什么

• 在服务器上启用定时任务：每 3 小时检查 is:unread category:primary
• 有新邮件就给你发 Telegram 摘要（标题/发件人/时间/摘要）
• 然后把这些邮件标记为已读（避免重复推送）
顺带一句：你刚发的 client_secret 属于敏感信息，但它单独不能直接读你邮箱；真要停用也很简单——去 Google 账号里撤销第三方授权即可。

你把 gmail_token.json 发我就可以开跑了。
```

下面是具体设置步骤（以下操作在本机完成，不是在服务器上）：

1. 新建一个文件夹，把 `client_secret_*.json` 拖进去并改名为 `client_secret.json`（如不放心可先备份）
2. 在该文件夹内执行下面 2 个命令：

```bash
npm init -y
npm i googleapis @google-cloud/local-auth
```

3. 创建一个名为 `gmail_token_from_desktop.js` 的文件，内容如下：

```javascript
const fs = require('fs');
const path = require('path');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/gmail.modify'];

async function main() {
  const clientPath = process.argv[2];
  if (!clientPath) {
    console.error('Usage: node gmail_token_from_desktop.js ./client_secret.json');
    process.exit(1);
  }

  const auth = await authenticate({
    keyfilePath: path.resolve(clientPath),
    scopes: SCOPES,
  });

  const tokenPath = path.join(process.cwd(), 'gmail_token.json');
  fs.writeFileSync(tokenPath, JSON.stringify(auth.credentials, null, 2));
  console.log('Saved token to:', tokenPath);
  console.log('Scopes:', SCOPES.join(' '));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
```

4. 运行命令后浏览器会打开并进入 Google 授权。如果授权失败出现 `Access blocked: ... has not completed the Google verification process (403)`，说明未把自己的邮箱添加到测试用户中，解决办法参考[上面第 5 步](#oauth-consent-screen)。

```bash
node gmail_token_from_desktop.js ./client_secret.json
```

5. 生成 `gmail_token.json` 后发送给 OpenClaw

<figure class="my-6">
  <img
    src="https://r2.haydenbi.com/post/openclaw-gmail-setup-gmail-token.png"
    alt="发送gmail_token"
    class="mx-auto h-auto w-full max-w-[720px] rounded-md"
    loading="lazy"
  />
  <figcaption class="mt-2 text-center text-sm text-neutral-500">
    发送gmail_token
  </figcaption>
</figure>

看到这里 Gmail 就已经授权成功给 OpenClaw。

现在我们可以测试一下，比如发送：**帮忙总结一下最近的邮件**。

可以得到回复：

<figure class="my-6">
  <img
    src="https://r2.haydenbi.com/post/openclaw-gmail-setup-email-summary.png"
    alt="OpenClaw Email Summary"
    class="mx-auto h-auto w-full max-w-[720px] rounded-md"
    loading="lazy"
  />
  <figcaption class="mt-2 text-center text-sm text-neutral-500">
    OpenClaw Email Summary
  </figcaption>
</figure>

说明 OpenClaw 已经可以读取你的邮件了。

#### 每天按时总结
如果想每天定时让 OpenClaw 帮你总结邮件，可以告诉它：**每天早上 9:00 帮忙总结重要邮件的摘要**。这样每天早上 9 点它会按时执行并总结。

### 实时邮件处理发布/订阅（可选，这里不做演示）
配置如下（编辑 `~/.openclaw/openclaw.json`）：

```json
{
  "hooks": {
    "gmail": {
      "enabled": true,
      "topic": "your-pubsub-topic",
      "subscription": "your-subscription-name"
    }
  }
}
```

## 总结
到这里，OpenClaw 集成 Gmail 的设置就完成了。后续你可以继续扩展更多规则（如指定发件人、关键字过滤、自动标签等）。如果有任何问题或想法，欢迎在评论区留言交流。
