import { ArrowUpRight } from "lucide-react";
import type { SiteEntry } from "@/types/site-entry";

export function SiteEntries({ entries }: { entries: SiteEntry[] }) {
	return (
		<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{entries.map((entry) => (
				<a
					key={entry.id}
					href={entry.url}
					target="_blank"
					rel="noopener noreferrer"
					className="soft-surface group flex flex-col gap-4 rounded-2xl p-6 transition-transform duration-200 hover:-translate-y-1"
				>
					<div className="flex items-center justify-between">
						<img
							src={entry.avatar}
							alt={entry.name}
							width="56"
							height="56"
							loading="lazy"
							className="size-14 rounded-full border border-border object-cover"
						/>
						<ArrowUpRight className="size-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
					</div>
					<div className="space-y-2">
						<h2 className="font-serif text-lg font-medium text-primary">
							{entry.name}
						</h2>
						<p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
							{entry.description}
						</p>
					</div>
				</a>
			))}
		</div>
	);
}
