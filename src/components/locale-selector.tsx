import { Check, ChevronDown } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	type AppLocale,
	getLocaleFlagAlt,
	localeConfig,
} from "@/config/locale";
import { cn } from "@/lib/utils";
import { getLocale, locales, setLocale } from "@/paraglide/runtime.js";

export function LocaleSelector({
	variant = "compact",
	className,
}: {
	/** compact 用于页头紧凑布局，pill 用于带完整边框的按钮。 */
	variant?: "compact" | "pill";
	/** 仅覆盖触发按钮外观，不改变菜单或切换语言行为。 */
	className?: string;
}) {
	const locale = getLocale();

	function handleSwitch(newLocale: AppLocale) {
		// 写入语言 cookie，并保留当前页面路径跳转到对应语言版本。
		setLocale(newLocale);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				className={cn(
					"inline-flex h-9 items-center gap-1.5 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
					variant === "compact"
						? "rounded-lg px-2.5 text-muted-foreground hover:bg-accent hover:text-foreground"
						: "rounded-full border px-3.5",
					className,
				)}
			>
				<img
					src={localeConfig[locale].flag}
					alt={getLocaleFlagAlt(locale)}
					width={20}
					height={20}
					className="size-5 shrink-0 rounded-xs"
				/>
				<span>{localeConfig[locale].name}</span>
				<ChevronDown className="size-3.5 shrink-0 opacity-70" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-max min-w-40">
				{locales.map((loc) => (
					<DropdownMenuItem
						key={loc}
						onClick={() => handleSwitch(loc)}
						className="flex items-center justify-between gap-2"
					>
						<span className="flex shrink-0 items-center gap-2">
							<img
								src={localeConfig[loc].flag}
								alt={getLocaleFlagAlt(loc)}
								width={20}
								height={20}
								className="size-5 shrink-0"
							/>
							<span className="whitespace-nowrap">
								{localeConfig[loc].name}
							</span>
						</span>
						<span
							className="flex size-3.5 shrink-0 items-center justify-center"
							aria-hidden="true"
						>
							{loc === locale && <Check className="size-3.5 shrink-0" />}
						</span>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
