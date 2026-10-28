---
title: "包含多个子项目集成一个项目部署Vercel方法"
date: "2025-08-22"
excerpt: "一个项目中包含多个子项目,子项目用到的框架不同.例如projectA用的React,Project B用的Vue, Project C用的原生HTML+CSS+JS。如何将多个项目合并成一个配置并且部署到Vercel.."
image: "https://r2.haydenbi.com/cover/post/pexels-ananto-biswas-utshow-2156876079-34871769.png"
tags: ["Vercel", "前端开发", "部署"]
author: "Hayden Bi"
---

## 1. 起因
  因为手上有一个项目集合需要通过: 域名/项目名称 访问。但每个项目用到的框架各不相同。最简单的办法是通过nginx配置反向代理来实现，奈何没有多余的服务器。所以就想部署到Vercel上。本来是想每个项目在Vercel单独部署,因为每个项目都是一个小模块功能不多，单独起一个项目有点浪费就打算合成一个项目通过域名+项目名的方式来部署。于是查了查资料发现还真可以。下面就来带大家第一实践一下。

## 2. 项目结构


```txt
project-list/
├── vercel.json
├── project-A/   # React/Next.js 项目
├── project-B/   # Vue 项目
├── project-C/   # Astro 项目
└── project-D/   # 纯 HTML 静态项目
```

### 2.1 project-A项目下的package.json
```json
{
  "name": "project-A",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "18.2.0",
    "react-dom": "18.2.0"
  }
}
```
Vercel 自动识别 @vercel/next，会跑 npm run build，输出 .next/。

### 2.2 project-B项目下的package.json
```json
{
  "name": "project-B",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "vite": "^5.0.0"
  }
}
```
Vite 默认打包目录 dist/

### 2.3 project-C项目下的package.json
```json
{
  "name": "project-C",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "astro": "^4.0.0"
  }
}
```
Astro 也会输出 dist/

### 2.4 project-D 纯HTML+CSS+JS
```json
project-D/
 ├── index.html
 ├── style.css
 ├── script.js
 └── images/
```
Vercel 直接托管，不需要 build。

## 3. vercel.json创建和配置
在父项目project-list下创建vercel.json
下面是vercel.json的具体配置
```json
{
    "version": 2,
    "builds": [
      {
        "src": "project-A/package.json",
        "use": "@vercel/next"
      },
      {
        "src": "project-B/package.json",
        "use": "@vercel/static-build",
        "config": { "distDir": "dist" }
      },
      {
        "src": "project-C/package.json",
        "use": "@vercel/static-build",
        "config": { "distDir": "dist" }
      },
      {
        "src": "project-D/**/*",
        "use": "@vercel/static"
      }
    ],
    "rewrites": [
      {
        "source": "/project-A/(.*)",
        "destination": "/project-A/$1"
      },
      {
        "source": "/project-B/(.*)",
        "destination": "/project-B/$1"
      },
      {
        "source": "/project-C/(.*)",
        "destination": "/project-C/$1"
      },
      {
        "source": "/project-D/(.*)",
        "destination": "/project-D/$1"
      }
    ]
  }
```
针对不同项目,builds里面的写法不同. 当然具体情况得看自己的项目结构，即便是其他的框架也可以照葫芦画瓢的在builds里面配置。
## 4. 提交并部署
现在可以直接将父项目源码上传到Git,Vercel通过vercel.json会识别到各个项目的build设置。后续部署全程由Vercel来自动完成(第一次操作记得在Vercel中关联到Git里面的project-list父项目,后续代码有提交都会自动部署)

部署完成后通过 域名/项目名/index.html 来试着访问一下你的项目吧!

好了,以上就是Vercel部署多个项目合集的方法.如果有任何疑问可以通过邮箱联系我
