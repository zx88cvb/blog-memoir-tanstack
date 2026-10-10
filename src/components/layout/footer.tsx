import type { ReactNode } from "react";
import { Logo } from "@/components/shared/logo";
import { Link } from "@/core/i18n/navigation";

export function Footer({
	tagline,
	name,
	year,
	copyright,
	groups,
	socials,
	actions,
	badge,
}: {
	/** 标语 / slogan */
	tagline?: string;
	/** 与 Header 保持一致的应用名称。 */
	name: string;
	/** 由布局计算的当前年份，展示层不管理时间状态。 */
	year: number;
	/** 当前语言的版权说明。 */
	copyright: string;
	/** 导航分组列表 */
	groups: {
		title: string;
		items: { label: string; href: string; external?: boolean }[];
	}[];
	/** 社交图标链接等 */
	socials?: ReactNode;
	/** 语言切换或主题等操作插槽 */
	actions?: ReactNode;
	/** 底部 Badge / 标识（可选） */
	badge?: ReactNode;
}) {
	return (
		<footer>
			<div className="mx-auto max-w-7xl px-6 pt-14 pb-6 sm:px-10 sm:pt-16 lg:px-16 text-muted-foreground [overflow-wrap:anywhere]">
				{tagline ? (
					<p className="font-serif italic text-3xl leading-[1.15] tracking-tight text-foreground sm:text-4xl mb-12 max-w-2xl">
						{tagline}
					</p>
				) : null}

				<div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
					<div className="grid flex-1 grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 sm:gap-x-12">
						{groups.map((group) => (
							<div key={group.title} className="space-y-5">
								<p className="text-[13px] font-semibold tracking-wide text-foreground">
									{group.title}
								</p>
								<ul className="space-y-2">
									{group.items.map((item) => (
										<li key={item.href}>
											{item.external ? (
												<a
													href={item.href}
													target="_blank"
													rel="noopener noreferrer"
													className="inline-flex min-h-8 items-center text-sm text-highlight transition-colors hover:underline underline-offset-4"
												>
													{item.label}
												</a>
											) : (
												<Link
													href={item.href}
													className="inline-flex min-h-8 items-center text-sm text-highlight transition-colors hover:underline underline-offset-4"
												>
													{item.label}
												</Link>
											)}
										</li>
									))}
								</ul>
							</div>
						))}
					</div>

					{actions ? (
						<div className="flex shrink-0 items-center gap-2 lg:pt-1">
							{actions}
						</div>
					) : null}
				</div>

				{socials && (
					<div className="mt-8 flex items-center gap-5">{socials}</div>
				)}

				<div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
					{badge ? (
						<div>{badge}</div>
					) : (
						<span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
							<Logo alt={name} decorative />
							{name}
						</span>
					)}
					<span className="text-sm text-muted-foreground">
						© {year} {name}. {copyright}
					</span>
				</div>
			</div>
		</footer>
	);
}
