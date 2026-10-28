---
title: "OpenClaw 升级指南: 官方推荐方式与常见报错修复"
date: "2026-02-04"
excerpt: "整理 OpenClaw 升级的推荐方式、常见报错与处理思路，避免升级卡住或重复踩坑。"
image: "https://r2.haydenbi.com/cover/post/openclaw-update.png"
tags: ["AI", "Moltbot", "OpenClaw", "Update"]
author: "Hayden Bi"
---

## 前言

OpenClaw 更新频率比较快，很多新功能和修复都会通过安装脚本下发。如果你已经在服务器上跑起来了，最常见的问题就是：怎么安全升级、升级失败要怎么处理、哪些错误其实可以忽略。本文记录了官方推荐的升级方式，以及我在升级过程中遇到的典型报错和解决办法，方便后续查阅。

## 升级

官方推荐通过安装脚本升级，它会检测现有安装并进行就地更新：

```bash
curl -fsSL https://openclaw.ai/install.sh | bash -s -- --no-onboard
```

`--no-onboard` 表示不再运行引导程序。

如果升级失败，并出现 `npm install failed; cleaning up and retrying...`，可以先清理 npm 缓存：

```bash
npm cache clean --force
```

然后再次执行升级命令：

```bash
curl -fsSL https://openclaw.ai/install.sh | bash -s -- --no-onboard
```

等待一会儿即可完成更新。

## 常见问题

### 通过 openclaw update 升级出现 Updating via package manager 错误

```bash
Updating OpenClaw...
│
◇  ✗ Updating via package manager (54.4s)
    npm warn deprecated npmlog@6.0.2: This package is no longer supported.
    npm warn deprecated gauge@4.0.4: This package is no longer supported.
    npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
    npm warn deprecated are-we-there-yet@3.0.1: This package is no longer supported.
    npm warn deprecated tar@6.2.1: Old versions of tar are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
    npm warn deprecated glob@10.5.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
    npm warn deprecated glob@11.1.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
    npm warn tar TAR_ENTRY_ERROR ENOSPC: no space left on device, write
    npm error A complete log of this run can be found in: /home/ubuntu/.npm/_logs/2026-02-04T07_10_41_454Z-debug-0.log

Update Result: ERROR
  Root: /home/ubuntu/.npm-global/lib/node_modules/openclaw
  Reason: global update
  Before: 2026.1.29

Total time: 54.7s
```

这种情况通常是包管理器更新失败。可以改用本文上面提到的安装脚本升级方式：

```bash
curl -fsSL https://openclaw.ai/install.sh | bash -s -- --no-onboard
```
