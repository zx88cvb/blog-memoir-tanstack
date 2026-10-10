import { ArrowDown, ArrowUpRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/core/i18n/navigation";
import { m } from "@/paraglide/messages.js";

/** 首页介绍区块；直接读取当前语言，保持 HomePage 只负责组合。 */
export function Hero() {
	const capabilities = [
		m["home.hero.routing"](),
		m["home.hero.localization"](),
		m["home.hero.themes"](),
		m["home.hero.content"](),
	];

	return (
		<section
			aria-labelledby="hero-title"
			className="mx-auto grid w-[calc(100%-2rem)] max-w-6xl items-center gap-10 border-b border-border pt-12 pb-10 sm:w-[calc(100%-3rem)] sm:pt-20 sm:pb-14 lg:grid-cols-[1.2fr_1fr] lg:gap-16 lg:pt-24 lg:pb-20"
		>
			<div className="min-w-0">
				<p className="mb-6 flex items-center gap-3 text-xs font-medium tracking-wide text-muted-foreground">
					<span aria-hidden="true" className="size-2 bg-highlight" />
					{m["home.hero.eyebrow"]()}
				</p>
				<h1
					id="hero-title"
					className="max-w-2xl text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.12] font-semibold tracking-tight text-balance"
				>
					{m["home.hero.title"]()}
				</h1>
				<p className="mt-6 max-w-xl text-base leading-8 text-pretty text-muted-foreground sm:text-lg">
					{m["home.hero.description"]()}
				</p>
				<div className="mt-8 flex flex-wrap items-center gap-4 sm:gap-6">
					<Link
						href="/about"
						className={buttonVariants({
							size: "lg",
							className: "min-h-11 gap-3 px-5",
						})}
					>
						{m["home.hero.about"]()}
						<ArrowUpRight aria-hidden="true" />
					</Link>
					<a
						href="#faq"
						className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-highlight underline-offset-4 hover:underline"
					>
						{m["home.hero.faq"]()}
						<ArrowDown aria-hidden="true" className="size-4" />
					</a>
				</div>
				<ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-3 text-xs text-muted-foreground sm:text-sm">
					{capabilities.map((capability) => (
						<li key={capability} className="flex items-start gap-2">
							<span
								aria-hidden="true"
								className="mt-2 h-px w-3 shrink-0 bg-highlight"
							/>
							{capability}
						</li>
					))}
				</ul>
			</div>
			<div
				aria-hidden="true"
				className="relative mx-auto aspect-[6/5] w-full max-w-sm select-none lg:max-w-none"
			>
				<div className="absolute inset-[8%] border border-border" />
				<div className="absolute inset-x-[8%] top-1/2 h-px bg-border" />
				<div className="absolute inset-y-[8%] left-1/2 w-px bg-border" />
				<div className="absolute top-[29%] left-[27%] h-[47%] w-[55%] rotate-[-12deg] border border-highlight/30 bg-brand-light" />
				<div className="absolute top-[22%] left-[20%] h-[47%] w-[55%] rotate-[-12deg] bg-primary" />
				<div className="absolute top-[15%] left-[13%] flex h-[47%] w-[55%] rotate-[-12deg] flex-col justify-between border border-border bg-surface p-[7%]">
					<span className="size-5 border-2 border-highlight sm:size-7" />
					<div className="space-y-2">
						<div className="h-1.5 w-3/4 bg-foreground/80" />
						<div className="h-1.5 w-1/2 bg-muted-foreground/40" />
					</div>
				</div>
				<div className="absolute top-[19%] right-[15%] size-[13%] bg-brand-amber" />
				<div className="absolute right-[16%] bottom-[15%] h-px w-[20%] bg-highlight" />
				<div className="absolute right-[16%] bottom-[15%] h-[10%] w-px bg-highlight" />
			</div>
		</section>
	);
}
