import { type ReactNode, useEffect, useRef, useState } from "react";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { Logo } from "@/components/shared/logo";
import { Link, usePathname } from "@/core/i18n/navigation";
import { cn } from "@/lib/utils";

export function Header({
	name,
	navigation,
	navigationLabel,
	menuLabel,
	closeMenuLabel,
	actions,
}: {
	/** 配置中的应用名称，由布局传入，避免硬编码。 */
	name: string;
	/** 本地化导航名称与不带语言前缀的站内路径，按数组顺序展示。 */
	navigation: readonly { label: string; href: string }[];
	/** 导航区域的本地化无障碍名称。 */
	navigationLabel: string;
	/** 移动端抽屉打开、关闭按钮的本地化无障碍标签。 */
	menuLabel: string;
	closeMenuLabel: string;
	/** 右侧操作插槽，通常组合语言选择与主题按钮。 */
	actions: ReactNode;
}) {
	const headerRef = useRef<HTMLElement>(null);
	const [scrolled, setScrolled] = useState(false);
	const pathname = usePathname();

	useEffect(() => {
		const header = headerRef.current;
		if (!header) return;
		const root = document.documentElement;
		const previousHeight = root.style.getPropertyValue("--site-header-height");

		// 高度随响应式或布局变化更新，供全局锚点滚动避让。
		const updateHeight = () => {
			root.style.setProperty(
				"--site-header-height",
				`${header.getBoundingClientRect().height}px`,
			);
		};

		const updateScroll = () => {
			setScrolled(window.scrollY > 8);
		};

		const observer = new ResizeObserver(updateHeight);
		observer.observe(header);
		updateHeight();
		updateScroll();

		window.addEventListener("scroll", updateScroll, { passive: true });
		return () => {
			observer.disconnect();
			window.removeEventListener("scroll", updateScroll);
			if (previousHeight)
				root.style.setProperty("--site-header-height", previousHeight);
			else root.style.removeProperty("--site-header-height");
		};
	}, []);

	return (
		<header
			ref={headerRef}
			className={cn(
				"sticky top-0 z-40 border-b transition-[background-color,border-color,box-shadow] duration-200 motion-reduce:transition-none",
				scrolled
					? "border-border/60 bg-background/80 shadow-xs backdrop-blur-md supports-[backdrop-filter]:bg-background/70"
					: "border-transparent bg-transparent",
			)}
		>
			<div className="mx-auto flex w-[calc(100%-2rem)] max-w-6xl items-center gap-3 py-3.5 sm:w-[calc(100%-3rem)] sm:gap-6 sm:py-4 lg:gap-8 lg:py-4.5">
				<Link
					href="/"
					className="group flex min-w-0 items-center gap-2 text-base font-bold tracking-tight text-foreground transition-opacity hover:opacity-90 sm:gap-2.5 sm:text-lg"
				>
					<Logo alt={name} decorative className="size-8 shrink-0 transition-transform duration-200 group-hover:scale-105 sm:size-9" />
					<span className="truncate">{name}</span>
				</Link>

				<nav
					className="hidden items-center gap-1 lg:flex"
					aria-label={navigationLabel}
				>
					{navigation.map((item) => {
						const isActive =
							pathname === item.href ||
							(item.href !== "/" && pathname.startsWith(item.href));
						return (
							<Link
								key={item.href}
								href={item.href}
								className={cn(
									"relative inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
									isActive
										? "bg-accent/80 font-semibold text-foreground shadow-2xs"
										: "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
								)}
							>
								{item.label}
							</Link>
						);
					})}
				</nav>

				<div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
					{actions}
					<MobileNavigation
						navigation={navigation}
						navigationLabel={navigationLabel}
						menuLabel={menuLabel}
						closeMenuLabel={closeMenuLabel}
					/>
				</div>
			</div>
		</header>
	);
}
