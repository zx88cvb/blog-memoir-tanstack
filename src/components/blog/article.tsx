import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { absoluteSiteUrl } from "@/lib/seo";
import {
	formatDate,
	type PostDetail,
	type TocItem,
} from "@/modules/post/types";
import { m } from "@/paraglide/messages.js";
import { ShareMenu } from "./share-menu";
import { WalineComments } from "./waline-comments";

function TableOfContents({ toc }: { toc: TocItem[] }) {
	const [active, setActive] = useState("");
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries)
					if (entry.isIntersecting) setActive(`#${entry.target.id}`);
			},
			{ rootMargin: "0px 0px -70% 0px" },
		);
		for (const item of toc) {
			const element = document.getElementById(item.url.slice(1));
			if (element) observer.observe(element);
		}
		return () => observer.disconnect();
	}, [toc]);
	return (
		<nav
			aria-label="Table of contents"
			className="sticky top-24 max-h-[calc(100svh-7rem)] overflow-y-auto text-sm"
		>
			<h2 className="mb-4 font-semibold">On this page</h2>
			<ul className="space-y-2">
				{toc.map((item) => (
					<li
						key={item.url}
						style={{ paddingLeft: `${Math.max(0, item.depth - 2) * 12}px` }}
					>
						<a
							href={item.url}
							aria-current={active === item.url ? "location" : undefined}
							className={
								active === item.url
									? "font-medium text-foreground"
									: "text-muted-foreground hover:text-foreground"
							}
						>
							{item.title}
						</a>
					</li>
				))}
			</ul>
		</nav>
	);
}

export function Article({ post }: { post: PostDetail }) {
	const body = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const root = body.current;
		if (!root || !post.html) return;
		const buttons: HTMLButtonElement[] = [];
		const timers = new Map<HTMLButtonElement, ReturnType<typeof setTimeout>>();
		for (const pre of root.querySelectorAll("pre")) {
			const button = document.createElement("button");
			button.type = "button";
			button.className = "code-copy";
			button.textContent = "Copy";
			button.setAttribute("aria-label", "Copy code");
			button.onclick = async () => {
				clearTimeout(timers.get(button));
				try {
					await navigator.clipboard.writeText(
						pre.querySelector("code")?.textContent ?? "",
					);
					button.textContent = "Copied";
					button.setAttribute("aria-label", "Copied code");
				} catch {
					button.textContent = "复制失败";
				}
				timers.set(
					button,
					setTimeout(() => {
						button.textContent = "Copy";
						button.setAttribute("aria-label", "Copy code");
					}, 2000),
				);
			};
			pre.appendChild(button);
			buttons.push(button);
		}
		return () => {
			for (const timer of timers.values()) clearTimeout(timer);
			for (const button of buttons) button.remove();
		};
	}, [post.html]);
	const url = absoluteSiteUrl(`/posts/${post.slug}`);
	return (
		<div className="page-container py-10" data-post-page>
			<div className="mb-10">
				<div className="mb-6 flex items-center justify-between gap-4">
					<Link
						to="/"
						className="inline-flex items-center gap-2 text-sm text-muted-foreground"
					>
						<ArrowLeft className="size-4" />
						Back
					</Link>
					<p className="text-xs text-muted-foreground">
						<time dateTime={post.date}>{formatDate(post.date)}</time> ·{" "}
						{post.author}
						{post.updated && (
							<span className="mt-1 block">
								{m["common.pages.last_updated"]()} ·{" "}
								<time dateTime={post.updated}>{formatDate(post.updated)}</time>
							</span>
						)}
					</p>
				</div>
				{/* Keep Share at the content edge, below the fixed theme control on desktop. */}
				<div className="mb-4 flex items-end justify-between gap-3 md:min-h-12">
					<div className="flex min-w-0 flex-wrap items-center gap-3">
						{post.tags.map((tag) => (
							<span
								key={tag}
								className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
							>
								{tag}
							</span>
						))}
					</div>
					<ShareMenu
						canonicalUrl={url}
						shareText={post.title}
						className="relative ml-auto z-20 shrink-0"
					/>
				</div>
				<h1 className="mb-6 break-words font-serif text-4xl font-medium leading-tight tracking-tight text-primary sm:text-5xl">
					{post.title}
				</h1>
				{post.image && (
					<img
						src={post.image}
						alt={post.title}
						width="1200"
						height="630"
						fetchPriority="high"
						className="aspect-video w-full rounded-2xl object-cover md:aspect-[21/9]"
					/>
				)}
			</div>
			{post.toc.length > 0 && (
				<details className="mb-8 rounded-xl border border-border p-4 lg:hidden">
					<summary className="cursor-pointer text-sm">On this page</summary>
					<ul className="mt-4 space-y-2 text-sm">
						{post.toc.map((item) => (
							<li key={item.url}>
								<a href={item.url}>{item.title}</a>
							</li>
						))}
					</ul>
				</details>
			)}
			<div className="grid min-w-0 grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_240px]">
				<div className="min-w-0">
					<article
						ref={body}
						className="prose prose-neutral mb-16 max-w-none dark:prose-invert"
						// biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is compiled from trusted repository Markdown.
						dangerouslySetInnerHTML={{ __html: post.html }}
					/>
					<WalineComments path={`/posts/${post.slug}`} />
				</div>
				<aside className="hidden lg:block lg:pl-4">
					<TableOfContents toc={post.toc} />
				</aside>
			</div>
		</div>
	);
}
