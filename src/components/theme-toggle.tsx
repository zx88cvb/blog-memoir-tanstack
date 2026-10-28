import { Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { envConfigs } from "@/config";

const storageKey = "theme-preference";
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
	// Keep the bootstrap byte-identical in SSR and minified browser builds.
	return `(function(){var t=null;try{t=localStorage.getItem('${storageKey}')}catch(e){}var c=${JSON.stringify(theme)},d=t==='dark'||t==='light'?t==='dark':c==='system'?matchMedia('(prefers-color-scheme: dark)').matches:c!=='light';document.documentElement.classList.toggle('dark',d);document.documentElement.style.colorScheme=d?'dark':'light'})()`;
}
export const themeInitScript = createThemeInitScript(envConfigs.default_theme);

/** label 是本地化的无障碍名称；手动选择优先于默认配置，跨标签页同步。 */
export function ThemeToggle({ label }: { label: string }) {
	const button = useRef<HTMLButtonElement>(null);
	const rope = useRef<HTMLSpanElement>(null);
	const pulling = useRef(false);
	const animations = useRef<Animation[]>([]);
	useEffect(() => {
		const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
		const finish = () => {
			if (reduced.matches)
				for (const animation of animations.current) animation.finish();
		};
		reduced.addEventListener("change", finish);
		return () => {
			reduced.removeEventListener("change", finish);
			for (const animation of animations.current) animation.cancel();
		};
	}, []);
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
	async function pull() {
		if (pulling.current) return;
		const handle = button.current;
		const line = rope.current;
		const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
		if (!handle?.animate || !line?.animate || reduced.matches) {
			toggle();
			return;
		}
		pulling.current = true;
		const stretch = 1 + 20 / Math.max(1, line.getBoundingClientRect().height);
		const easing = "cubic-bezier(0.22, 1, 0.36, 1)";
		try {
			const down = [
				handle.animate(
					[{ transform: "translateY(0)" }, { transform: "translateY(20px)" }],
					{ duration: 180, easing, fill: "forwards" },
				),
				line.animate(
					[{ transform: "scaleY(1)" }, { transform: `scaleY(${stretch})` }],
					{ duration: 180, easing, fill: "forwards" },
				),
			];
			animations.current = down;
			await Promise.all(down.map((animation) => animation.finished));
			if (!handle.isConnected) return;
			toggle();
			if (reduced.matches) return;
			const up = [
				handle.animate(
					[{ transform: "translateY(20px)" }, { transform: "translateY(0)" }],
					{ duration: 220, easing, fill: "forwards" },
				),
				line.animate(
					[{ transform: `scaleY(${stretch})` }, { transform: "scaleY(1)" }],
					{ duration: 220, easing, fill: "forwards" },
				),
			];
			animations.current = up;
			for (const animation of down) animation.cancel();
			await Promise.all(up.map((animation) => animation.finished));
		} catch {
			// Unmounting cancels the pending pull without changing the saved theme.
		} finally {
			for (const animation of animations.current) animation.cancel();
			animations.current = [];
			pulling.current = false;
		}
	}

	return (
		<button
			type="button"
			ref={button}
			className="rope-theme-toggle"
			aria-label={label}
			title={label}
			aria-pressed={dark}
			onClick={pull}
		>
			<span ref={rope} className="rope-theme-line" aria-hidden="true" />
			<Moon className="dark:hidden size-5" aria-hidden="true" />
			<Sun className="hidden dark:block size-5" aria-hidden="true" />
		</button>
	);
}
