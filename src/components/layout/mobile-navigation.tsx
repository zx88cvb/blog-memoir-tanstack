import { Dialog } from "@base-ui/react/dialog";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, usePathname } from "@/core/i18n/navigation";
import { cn } from "@/lib/utils";

type MobileNavigationProps = {
	/** 与桌面导航共用的本地化入口；路径不带语言前缀。 */
	navigation: readonly { label: string; href: string }[];
	/** 同时作为抽屉标题和导航区域的无障碍名称。 */
	navigationLabel: string;
	/** 打开及关闭按钮文案，由数据层解析当前语言。 */
	menuLabel: string;
	closeMenuLabel: string;
};

/** 只负责展示与开关；Dialog 管理焦点、Escape、遮罩关闭及滚动锁。 */
export function MobileNavigation({
	navigation,
	navigationLabel,
	menuLabel,
	closeMenuLabel,
}: MobileNavigationProps) {
	const [open, setOpen] = useState(false);
	const pathname = usePathname();

	useEffect(() => {
		const desktop = window.matchMedia("(min-width: 1024px)");
		// 从移动端切到桌面时主动关闭，避免隐藏的抽屉继续锁住页面。
		const closeOnDesktop = () => {
			if (desktop.matches) setOpen(false);
		};
		desktop.addEventListener("change", closeOnDesktop);
		return () => desktop.removeEventListener("change", closeOnDesktop);
	}, []);

	return (
		<Dialog.Root open={open} onOpenChange={setOpen}>
			<Dialog.Trigger
				aria-label={menuLabel}
				className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none lg:hidden"
			>
				<Menu className="size-5" aria-hidden="true" />
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Backdrop className="fixed inset-0 z-60 bg-black/40 backdrop-blur-xs opacity-100 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none" />
				<Dialog.Popup
					// 桌面上触发按钮已隐藏，不把焦点返回不可见元素。
					finalFocus={() => !window.matchMedia("(min-width: 1024px)").matches}
					className="fixed inset-y-0 right-0 z-70 flex w-[min(260px,72vw)] flex-col overflow-y-auto border-l border-border/70 bg-background/95 p-5 text-foreground shadow-2xl backdrop-blur-md outline-none transition-transform duration-200 ease-out data-ending-style:translate-x-full data-starting-style:translate-x-full motion-reduce:transition-none"
				>
					<div className="mb-4 flex items-center justify-between gap-3 border-b border-border/50 pb-3">
						<Dialog.Title className="text-sm font-semibold tracking-wide text-muted-foreground">
							{navigationLabel}
						</Dialog.Title>
						<Dialog.Close
							aria-label={closeMenuLabel}
							className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
						>
							<X className="size-4" aria-hidden="true" />
						</Dialog.Close>
					</div>
					<nav aria-label={navigationLabel} className="flex flex-col gap-1.5">
						{navigation.map((item) => {
							const isActive =
								pathname === item.href ||
								(item.href !== "/" && pathname.startsWith(item.href));
							return (
								<Link
									key={item.href}
									href={item.href}
									onClick={() => setOpen(false)}
									className={cn(
										"flex min-h-10 items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
										isActive
											? "bg-accent font-semibold text-foreground"
											: "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
									)}
								>
									<span>{item.label}</span>
									{isActive && (
										<span
											className="size-1.5 shrink-0 rounded-full bg-primary"
											aria-hidden="true"
										/>
									)}
								</Link>
							);
						})}
					</nav>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
