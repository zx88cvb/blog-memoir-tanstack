import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowRight, Search } from "lucide-react";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import {
	type BlogSearch,
	formatDate,
	type PostListData,
} from "@/modules/post/types";
import { m } from "@/paraglide/messages.js";
import { PostPagination } from "./post-pagination";

export function PostList({ data }: { data: PostListData }) {
	const search = useSearch({ strict: false }) as BlogSearch;
	const navigate = useNavigate();
	const searchInput = useRef<HTMLInputElement>(null);
	const hasFilters = Boolean(search.q?.trim() || search.category);
	async function resetSearch() {
		if (searchInput.current) searchInput.current.value = "";
		await navigate({ to: "/", search: {}, resetScroll: false });
		searchInput.current?.focus({ preventScroll: true });
	}
	const { posts, categories, page, totalPages, totalPosts } = data;
	return (
		<section className="page-container py-12">
			<div className="mb-10 flex justify-center">
				<form
					action="/"
					method="get"
					className="relative"
					onSubmit={(event) => {
						event.preventDefault();
						const form = new FormData(event.currentTarget);
						const q = String(form.get("q") ?? "").trim();
						void navigate({
							to: "/",
							search: { category: search.category, q: q || undefined },
							resetScroll: false,
						});
					}}
				>
					{search.category && (
						<input type="hidden" name="category" value={search.category} />
					)}
					<Search
						aria-hidden="true"
						className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
					/>
					<input
						key={search.q ?? ""}
						ref={searchInput}
						type="search"
						name="q"
						aria-label="Search posts"
						placeholder="Search..."
						defaultValue={search.q}
						className="soft-surface h-11 w-64 rounded-full pl-9 pr-4 text-sm outline-offset-4"
					/>
				</form>
			</div>
			<div className="mb-6 flex items-center justify-between gap-4">
				<div>
					<p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
						Latest posts
					</p>
					<h2 className="mt-1 font-serif text-3xl font-medium tracking-tight text-primary">
						Fresh from the journal
					</h2>
				</div>
				<span className="whitespace-nowrap text-sm text-muted-foreground">
					{totalPosts} published
				</span>
			</div>
			<div className="mb-8 flex gap-3 overflow-x-auto pb-4">
				<CategoryPill
					label="All"
					search={{ q: search.q }}
					active={!search.category}
				/>
				{categories.map((category) => (
					<CategoryPill
						key={category.slug}
						label={category.name}
						search={{ category: category.slug, q: search.q }}
						active={search.category === category.slug}
					/>
				))}
			</div>
			{posts.length === 0 ? (
				<div className="flex flex-col items-center gap-5 py-12 text-center">
					<p className="max-w-md text-muted-foreground">
						{hasFilters ? m["blog.empty.filtered"]() : m["blog.empty.none"]()}
					</p>
					{hasFilters && (
						<button
							type="button"
							onClick={() => void resetSearch()}
							className="interactive soft-surface inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-medium"
						>
							{m["blog.empty.reset"]()}
						</button>
					)}
				</div>
			) : (
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{posts.map((post, index) => (
						<Link
							key={post.slug}
							to="/posts/$slug"
							params={{ slug: post.slug }}
							className="soft-surface group block overflow-hidden rounded-2xl p-2 transition-shadow hover:shadow-md dark:hover:shadow-none"
						>
							<div className="mb-4 aspect-[4/3] overflow-hidden rounded-xl bg-image-placeholder">
								{post.image && (
									<img
										src={post.image}
										alt={post.title}
										width="640"
										height="480"
										loading={index < 3 ? "eager" : "lazy"}
										fetchPriority={index === 0 ? "high" : "auto"}
										className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
									/>
								)}
							</div>
							<div className="flex flex-col gap-2 px-2 pb-3">
								<div className="flex justify-between gap-2 text-xs font-medium text-muted-foreground">
									<time dateTime={post.date}>{formatDate(post.date)}</time>
									<span className="max-w-32 truncate">{post.tags[0]}</span>
								</div>
								<div className="flex min-h-14 items-start justify-between gap-2">
									<h3 className="line-clamp-2 text-lg font-semibold leading-tight tracking-tight text-primary group-hover:underline">
										{post.title}
									</h3>
									<ArrowRight className="size-6 shrink-0 rounded-full bg-muted p-1" />
								</div>
								<p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
									{post.excerpt ?? post.description ?? ""}
								</p>
							</div>
						</Link>
					))}
				</div>
			)}
			<PostPagination
				currentPage={page}
				totalPages={totalPages}
				search={search}
			/>
		</section>
	);
}

function CategoryPill({
	label,
	search,
	active,
}: {
	label: string;
	search: BlogSearch;
	active: boolean;
}) {
	return (
		<Link
			to="/"
			search={search}
			resetScroll={false}
			aria-current={active ? "page" : undefined}
			className={cn(
				"interactive inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 py-2 text-sm font-medium",
				active
					? "border-primary bg-primary text-primary-foreground"
					: "soft-surface",
			)}
		>
			{label}
		</Link>
	);
}
