import { type Locale, localizeHref, locales } from "@/paraglide/runtime.js";
import { m } from "@/paraglide/messages.js";

export type AppLocale = Locale;

/** 语言展示与 SEO 的单一配置；支持的语言及其顺序仍由 Paraglide 管理。 */
export const localeConfig = {
	en: {
		name: "English",
		flag: "/images/icons/flag/en.svg",
		hreflang: "en",
		label: "EN",
		messageKey: "language_english",
		flagAlt: () => m["game.locale.flag.en_alt"](),
	},
	ja: {
		name: "日本語",
		flag: "/images/icons/flag/ja.svg",
		hreflang: "ja",
		label: "JA",
		messageKey: "language_japanese",
		flagAlt: () => m["game.locale.flag.ja_alt"](),
	},
	"zh-cn": {
		name: "简体中文",
		flag: "/images/icons/flag/zh-cn.svg",
		hreflang: "zh-CN",
		label: "中",
		messageKey: "language_chinese",
		flagAlt: () => m["game.locale.flag.zh_alt"](),
	},
} as const satisfies Record<
	AppLocale,
	{
		readonly name: string;
		readonly flag: string;
		readonly hreflang: string;
		readonly label: string;
		readonly messageKey: keyof typeof m;
		readonly flagAlt: () => string;
	}
>;

/** 保留已有名称映射接口，避免调用方维护第二份语言名称。 */
export const localeNames = Object.fromEntries(
	locales.map((locale) => [locale, localeConfig[locale].name]),
) as Record<AppLocale, string>;

/** 保留已有 SEO 元数据接口，hreflang 使用标准语言标签大小写。 */
export const localeMeta = Object.fromEntries(
	locales.map((locale) => {
		const { hreflang, label, messageKey } = localeConfig[locale];
		return [locale, { hreflang, label, messageKey }];
	}),
) as Record<
	AppLocale,
	Pick<(typeof localeConfig)[AppLocale], "hreflang" | "label" | "messageKey">
>;

/** 渲染时解析国旗提示，不在模块初始化时缓存当前语言。 */
export function getLocaleFlagAlt(locale: AppLocale): string {
	return localeConfig[locale].flagAlt();
}

/** 该辅助函数不接收参数；带必填参数的消息应通过编译后的函数直接调用。 */
type ParameterlessMessageKey = {
	[K in keyof typeof m]: {} extends Parameters<(typeof m)[K]>[0] ? K : never;
}[keyof typeof m];

/** 按指定语言解析无必填参数的消息键；已知键优先静态调用。 */
export function message(key: ParameterlessMessageKey, locale: AppLocale): string {
	const value = m[key];
	if (typeof value !== "function") return key;
	return value({}, { locale });
}

/** 返回指定语言的首页链接；hash 默认为空，保留已有调用约定。 */
export function localizedPath(locale: AppLocale, hash = "") {
	return localizeHref(`/${hash}`, { locale });
}
