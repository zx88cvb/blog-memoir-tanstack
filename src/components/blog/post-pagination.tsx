import { Link } from "@tanstack/react-router";
import { getPaginationItems, getPaginationSearch } from "@/lib/pagination";
import { cn } from "@/lib/utils";
import type { BlogSearch } from "@/modules/post/types";
import { m } from "@/paraglide/messages.js";

export function PostPagination({
	currentPage,
	totalPages,
	search,
}: {
	currentPage: number;
	totalPages: number;
	search: BlogSearch;
}) {
	if (totalPages <= 1) return null;
	const pageSearch = (page: number) => getPaginationSearch(search, page);
	const controlClass =
		"interactive soft-surface inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border px-4 text-sm";
	const disabledClass =
		"inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-border px-4 text-sm text-muted-foreground cursor-not-allowed";
	return (
		<nav
			aria-label={m["blog.pagination.label"]()}
			className="mt-12 flex items-center justify-center gap-2"
		>
			{currentPage === 1 ? (
				<button
					type="button"
					disabled
					className={disabledClass}
					aria-label={m["blog.pagination.previous_label"]()}
				>
					{m["blog.pagination.previous"]()}
				</button>
			) : (
				<Link
					to="/"
					search={pageSearch(currentPage - 1)}
					rel="prev"
					className={controlClass}
					aria-label={m["blog.pagination.previous_label"]()}
				>
					{m["blog.pagination.previous"]()}
				</Link>
			)}
			<div className="hidden items-center gap-2 lg:flex">
				{getPaginationItems(currentPage, totalPages).map((item) =>
					typeof item === "number" ? (
						<Link
							key={item}
							to="/"
							search={pageSearch(item)}
							aria-label={m["blog.pagination.page"]({ page: item })}
							aria-current={item === currentPage ? "page" : undefined}
							className={cn(
								"interactive grid size-11 place-items-center rounded-full border border-border text-sm",
								item === currentPage
									? "bg-primary text-primary-foreground"
									: "soft-surface",
							)}
						>
							{item}
						</Link>
					) : (
						<span
							key={item}
							aria-hidden="true"
							className="grid size-11 place-items-center text-muted-foreground"
						>
							…
						</span>
					),
				)}
			</div>
			<output
				className="min-w-20 text-center text-sm text-muted-foreground lg:hidden"
				aria-current="page"
				aria-label={m["blog.pagination.status"]({
					current: currentPage,
					total: totalPages,
				})}
			>
				{currentPage} / {totalPages}
			</output>
			{currentPage === totalPages ? (
				<button
					type="button"
					disabled
					className={disabledClass}
					aria-label={m["blog.pagination.next_label"]()}
				>
					{m["blog.pagination.next"]()}
				</button>
			) : (
				<Link
					to="/"
					search={pageSearch(currentPage + 1)}
					rel="next"
					className={controlClass}
					aria-label={m["blog.pagination.next_label"]()}
				>
					{m["blog.pagination.next"]()}
				</Link>
			)}
		</nav>
	);
}
