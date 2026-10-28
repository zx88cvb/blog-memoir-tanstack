---
title: "Stripe Radar 防盗刷实操：2027 定价变化与规则配置指南"
description: "面向独立开发者和出海团队，介绍 Stripe Radar 的工作原理、2027 年套餐与计费变化，并分享 3DS、风险拦截和人工审核规则的配置思路。"
author: "Hayden Bi"
date: "2026-08-13"
tags: ["Stripe"]
image: "https://r2.haydenbi.com/cover/post/stripe-radar-rules.webp"
---

## 前言

接入 Stripe 收款之后，除了关注支付成功率，还需要尽早处理盗卡支付、信用卡测试和恶意交易等风险。欺诈交易一旦形成拒付，不仅会带来退款和争议费用，也可能影响账户的整体风险表现。

Stripe Radar 是 Stripe 内置的欺诈检测与预防产品。它会在支付过程中实时分析交易信号，并根据风险模型和规则决定是否放行、请求 3D Secure（3DS）验证、进入人工审核或直接拦截。

不过，Radar 并不是“开启后就不会发生盗刷”的保险。规则设置得太宽松，可能拦不住高风险交易；设置得太严格，又可能误伤正常客户、降低支付转化率。更合理的做法是先理解每条规则的作用，再结合自己的交易量、客单价和争议情况逐步调整。

> **说明：** 本文分享的是我的实际配置思路，不是一套适用于所有业务的通用答案。启用规则前，建议先使用回测功能观察它对历史交易的影响。

## Stripe Radar 是如何工作的

Radar 会检查成功、失败、被拦截和进入审核的支付尝试，并结合 Stripe 网络中的交易数据实时评估欺诈风险。根据风险模型和配置规则，它可以放行支付、请求 3DS 验证、加入人工审核或直接拦截交易。

不同套餐支持的风险信号和自定义能力有所区别，详细工作原理可以查看 [Stripe Radar 官方文档](https://docs.stripe.com/radar/how-radar-works)。

## 2027 年 Radar 定价变化

Stripe 已宣布从 **2027 年 1 月 22 日**起调整 Radar 的套餐与定价。此次调整主要影响在 2026 年 7 月 29 日之前使用 Radar 或 Radar for Fraud Teams 标准定价的部分商户。

以下是 Stripe 美国地区普通商户的美元参考价格：

- **Radar Lite**：随 Stripe 标准支付定价提供基础银行卡欺诈防护，不额外收费
- **Radar Standard**：$10/月，包含 200 笔筛查交易；超出套餐或按需使用为 $0.05/笔
- **Radar Plus**：$14/月，包含 200 笔筛查交易；超出套餐或按需使用为 $0.07/笔
- **Radar Pro**：$20/月，包含 200 笔筛查交易和 400 个筛查客户；超出套餐或按需使用为 $0.09/笔交易，加 $0.005/个筛查客户

受本次调整影响的账户如果不主动切换方案，试用结束后会继续使用付费的 Radar Standard。原 Radar for Fraud Teams 用户会迁移到 Radar Plus。

> **注意：** 以上价格不适用于 Stripe Connect 平台和市场。不同国家、账户类型和合同的价格可能不同，请以 Stripe Dashboard 显示的方案为准。

你可以在 Dashboard 的 Radar 套餐页面查看和切换方案。完整变化请参考 [Stripe 2027 Radar 定价更新说明](https://support.stripe.com/questions/updates-to-radar-pricing-%28january-2027%29)，最新价格可以查看 [Stripe Radar 官方定价](https://stripe.com/radar/pricing)。

## 进入 Radar Rules

<figure class="my-6">
  <img
    src="https://r2.haydenbi.com/post/stripe-radar-rules/stripe-radar-rules-menu.webp"
    alt="Stripe Dashboard 中 Payments 下的 Radar 菜单入口"
    class="mx-auto h-auto w-full rounded-lg"
    loading="lazy"
  />
  <figcaption class="mt-2 text-center text-sm text-neutral-500">
    在 Stripe Dashboard 的 Payments 菜单中进入 Radar。
  </figcaption>
</figure>

进入规则页面的步骤如下：

1. 登录 Stripe Dashboard
2. 在左侧菜单中进入 `Payments → Radar`
3. 打开 `Rules` 页面查看默认规则和自定义规则
4. 如果菜单中没有找到 Radar，也可以使用 Dashboard 顶部搜索框搜索 `Radar`

自定义规则、风险评分和规则回测需要 Radar Plus 或更高套餐。套餐可以在 Dashboard 的 `Settings → Plans and fees` 中查看和管理，具体入口可能会随 Stripe Dashboard 更新而变化。

## 配置规则前需要了解什么

Radar 规则常见的处理动作包括：

- **Request 3DS**：要求符合条件的支付尝试进行额外身份验证
- **Block**：直接阻止符合条件的支付
- **Review**：允许支付继续授权，但将交易加入人工审核队列

Request 3DS 规则会在 Review、Block 和 Allow 规则之前执行。3DS 验证成功后，欺诈争议责任通常会转移给发卡行，但并非所有支付都支持 3DS，也不是每次请求都会触发完整验证。

对所有交易无差别请求 3DS 会增加支付步骤，可能降低转化率。因此更适合结合风险等级、风险评分、客户创建时间、银行卡数量和 IP 支付次数等信号使用。

<figure class="my-6">
  <img
    src="https://r2.haydenbi.com/post/stripe-radar-rules/stripe-radar-rules-config.webp"
    alt="Stripe Radar Rules 自定义规则配置页面"
    class="mx-auto h-auto w-full rounded-lg"
    loading="lazy"
  />
  <figcaption class="mt-2 text-center text-sm text-neutral-500">
    Stripe Radar Rules 页面中的规则配置示例。
  </figcaption>
</figure>

下面是我目前使用或关注的一组规则。如果已经开通 Radar Plus，可以直接复制下面的规则到 Rules 页面，再结合回测结果决定是否启用。

### Request 3DS 规则

这组规则主要用于给风险较高、短时间内使用多张银行卡，或来自特定发卡国家和 IP 的支付增加一道身份验证。

```text
Request 3DS if 3D Secure is supported for card

Request 3DS if :card_3d_secure_support: = 'optional' and :risk_score: > 40

Request 3DS if :card_country: = 'PH' and :card_3d_secure_support: = 'optional'

Request 3DS if :card_count_for_customer_weekly: > 5 and :hours_since_customer_was_created: <= 168

Request 3DS if :card_count_for_customer_weekly:> 4 and :card_funding:= 'credit'

Request 3DS if :card_count_for_customer_weekly:> 3 and :risk_score:> 50

Request 3DS if :total_charges_per_ip_address_daily:> 10 and :risk_score:> 40
```

这些规则分别关注以下风险信号：

- 银行卡支持可选的 3DS 验证，同时 Radar 风险评分较高
- 来自特定发卡国家并支持 3DS 的支付
- 新客户在一周内更换或尝试多张银行卡
- 单个 IP 在一天内发起大量支付，并且风险评分偏高

> **弃用提醒：** Stripe 官方文档已经将内置规则 `Request 3DS if 3D Secure is supported for card` 标记为 Deprecated。这里按原配置保留用于记录，请优先根据当前 Dashboard 提供的规则、风险等级和 Adaptive 3DS 能力进行调整。

### Block 规则

Block 规则会直接拒绝符合条件的支付，适合处理风险非常高、命中 Stripe 默认阻止名单或 CVC 验证失败的交易。

```text
Block if :risk_level: = 'highest'

Block if payment matches one or more values in default Stripe block lists

Block if CVC verification fails based on risk score
```

需要注意：

- `highest` 表示 Radar 判断该笔支付具有非常高的欺诈风险
- 默认阻止名单可拦截命中 Stripe 已知高风险值的支付
- 基于风险评分的 CVC 规则不会简单拦截所有 CVC 异常，而会同时参考 Radar 的风险判断

> **弃用提醒：** Stripe 已将基于 `:risk_level: = 'highest'` 的旧内置 AI 阻止规则标记为 Deprecated，并建议使用新的风险控制能力自动处理最高风险支付。本文保留这条规则，是为了与现有配置保持一致。

直接拦截规则对转化率影响最大。启用前应重点检查历史回测中被命中的正常订单，避免因为某个国家、支付方式或客户行为特征造成大范围误拦截。

### Review 规则

对于风险升高但还不足以直接拒绝的交易，可以先进入人工审核队列：

```text
Review if :risk_level: = 'elevated'
```

人工审核适合交易量不大、客单价较高，并且团队有能力及时处理审核队列的业务。如果审核积压严重，可以结合风险偏好、金额和其他交易信号进一步缩小范围。规则的完整语法、执行顺序和官方示例可以查看 [Stripe Radar 规则文档](https://docs.stripe.com/radar/rules)。

## 总结

对于使用 Stripe 收款的独立开发者和出海团队，Radar 值得尽早了解和配置。它可以帮助识别盗卡测试、异常支付和高风险交易，但不能保证彻底消除欺诈、拒付或账户限制。

如果业务还处于早期、交易量较小，可以先确认 Radar Lite 或 Standard 是否已经覆盖当前需求；如果需要自定义规则、风险评分、回测和更精细的 3DS 策略，再考虑 Radar Plus。无论选择哪个套餐，都应该以自己的历史交易数据为依据，在风控效果和支付转化率之间找到平衡。

## 官方参考资料

- [Stripe：2027 年 Radar 定价更新](https://support.stripe.com/questions/updates-to-radar-pricing-%28january-2027%29)
- [Stripe Docs：Radar 的工作原理与套餐对比](https://docs.stripe.com/radar/how-radar-works)
- [Stripe Docs：Radar 规则说明](https://docs.stripe.com/radar/rules)
