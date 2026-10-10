import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { envConfigs } from "@/config";

const storageKey = "addressgen-theme-v1";
/** 首屏脚本和交互组件共用判定规则；非法配置与不可用存储均回退到默认暗色。 */
export function resolveDarkTheme(
	saved: string | null,
	configured: string,
	systemDark: boolean,
) {
	if (saved === "dark" || saved === "light") return saved === "dark";
	if (configured === "system") return systemDark;
	return configured !== "light";
}

/** 在首屏样式应用前恢复主题，避免刷新闪烁；环境配置仅作为用户未选择时的默认值。 */
export function createThemeInitScript(configured: string) {
	const theme = ["light", "dark", "system"].includes(configured)
		? configured
		: "dark";
	return `(function(){var t=null;try{t=localStorage.getItem('${storageKey}')}catch(e){}var d=(${resolveDarkTheme.toString()})(t,${JSON.stringify(theme)},matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);document.documentElement.style.colorScheme=d?'dark':'light'})()`;
}
export const themeInitScript = createThemeInitScript(envConfigs.default_theme);

/** label 是本地化的无障碍名称；手动选择优先于默认配置，跨标签页同步。 */
export function ThemeToggle({ label }: { label: string }) {
	const [dark, setDark] = useState(() =>
		resolveDarkTheme(null, envConfigs.default_theme, false),
	);
	useEffect(() => {
		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const sync = () => {
			let saved: string | null = null;
			try {
				saved = localStorage.getItem(storageKey);
			} catch {
				/* 隐私模式可禁用存储，此时使用配置默认值。 */
			}
			const next = resolveDarkTheme(
				saved,
				envConfigs.default_theme,
				media.matches,
			);
			document.documentElement.classList.toggle("dark", next);
			document.documentElement.style.colorScheme = next ? "dark" : "light";
			setDark(next);
		};
		sync();
		media.addEventListener("change", sync);
		window.addEventListener("storage", sync);
		return () => {
			media.removeEventListener("change", sync);
			window.removeEventListener("storage", sync);
		};
	}, []);
	function toggle() {
		const next = !document.documentElement.classList.contains("dark");
		document.documentElement.classList.toggle("dark", next);
		document.documentElement.style.colorScheme = next ? "dark" : "light";
		setDark(next);
		try {
			localStorage.setItem(storageKey, next ? "dark" : "light");
		} catch {
			/* 即使无法持久化，本次页面的主题切换仍然生效。 */
		}
	}
	return (
		<button
			type="button"
			className="grid size-11 cursor-pointer place-items-center rounded-xl border border-border bg-inset text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
			aria-label={label}
			title={label}
			aria-pressed={dark}
			onClick={toggle}
		>
			<Moon className="dark:hidden size-5" aria-hidden="true" />
			<Sun className="hidden dark:block size-5" aria-hidden="true" />
		</button>
	);
}
