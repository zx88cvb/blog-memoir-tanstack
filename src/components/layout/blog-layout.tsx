import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { BackToTop } from "./back-to-top";
import { BlogFooter } from "./blog-footer";
import { BlogSidebar } from "./blog-sidebar";
import { MobileNavigation } from "./mobile-navigation";

export function BlogLayout({ children }: { children: React.ReactNode }) {
	const [collapsed, setCollapsed] = useState(false);
	const sidebar = useRef<HTMLElement>(null);
	const content = useRef<HTMLDivElement>(null);
	const positions = useRef(new Map<HTMLElement, DOMRect>());
	const animations = useRef<Animation[]>([]);

	function toggleSidebar() {
		const elements = [
			...(sidebar.current?.querySelectorAll<HTMLElement>(
				"[data-sidebar-motion]",
			) ?? []),
		];
		if (content.current) elements.push(content.current);
		positions.current = new Map(
			elements.map((element) => [
				element,
				(element === content.current
					? (element.firstElementChild ?? element)
					: element
				).getBoundingClientRect(),
			]),
		);
		setCollapsed((value) => !value);
	}

	useLayoutEffect(() => {
		const previous = positions.current;
		if (!previous.size) return;
		positions.current = new Map();
		for (const animation of animations.current) animation.cancel();
		animations.current = [];
		if (
			!previous.size ||
			!window.matchMedia("(min-width: 768px)").matches ||
			window.matchMedia("(prefers-reduced-motion: reduce)").matches
		)
			return;
		// Measure the final layout once, then animate only translations; text never scales.
		const moves = [...previous]
			.filter(([element]) => element.isConnected)
			.map(([element, before]) => {
				const after = (
					element === content.current
						? (element.firstElementChild ?? element)
						: element
				).getBoundingClientRect();
				return {
					element,
					x: before.left - after.left,
					y: before.top - after.top,
				};
			});
		for (const { element, x, y } of moves) {
			if ((!x && !y) || !element.animate) continue;
			animations.current.push(
				element.animate(
					[
						{ transform: `translate(${x}px, ${y}px)` },
						{ transform: "translate(0, 0)" },
					],
					{ duration: 300, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
				),
			);
		}
	});

	useEffect(() => {
		const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
		const desktop = window.matchMedia("(min-width: 768px)");
		const finish = () => {
			for (const animation of animations.current) animation.finish();
		};
		reduced.addEventListener("change", finish);
		desktop.addEventListener("change", finish);
		return () => {
			reduced.removeEventListener("change", finish);
			desktop.removeEventListener("change", finish);
			for (const animation of animations.current) animation.cancel();
		};
	}, []);

	return (
		<div className="min-h-svh">
			<a href="#main-content" className="skip-link">
				跳转到内容
			</a>
			<BlogSidebar
				collapsed={collapsed}
				onToggle={toggleSidebar}
				sidebarRef={sidebar}
			/>
			<MobileNavigation desktopTarget={sidebar} />
			<main
				id="main-content"
				className={cn(
					"min-w-0 overflow-x-clip pt-12 md:pt-0",
					collapsed ? "md:pl-20" : "md:pl-64",
				)}
			>
				<div ref={content} className="min-w-0">
					{children}
					<BlogFooter />
				</div>
			</main>
			<ThemeToggle label="切换明暗主题" />
			<BackToTop />
		</div>
	);
}
