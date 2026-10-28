import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import type { Ref } from "react";
import { envConfigs } from "@/config";
import { cn } from "@/lib/utils";
import { Navigation, SocialLinks } from "./navigation";
import { SidebarAd } from "./sidebar-ad";

export function BlogSidebar({
	collapsed,
	onToggle,
	sidebarRef,
}: {
	collapsed: boolean;
	onToggle: () => void;
	sidebarRef: Ref<HTMLElement>;
}) {
	return (
		<aside
			ref={sidebarRef}
			data-collapsed={collapsed}
			className={cn(
				"blog-sidebar fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-transparent p-6 md:flex",
				collapsed ? "w-20 px-4" : "w-64",
			)}
		>
			<button
				type="button"
				onClick={onToggle}
				aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
				aria-expanded={!collapsed}
				data-sidebar-motion
				className="sidebar-toggle absolute -right-[22px] top-3.5 z-10 grid size-11 place-items-center rounded-full"
			>
				<ChevronLeft
					className={cn(
						"size-3 transition-transform duration-300",
						collapsed && "rotate-180",
					)}
					aria-hidden="true"
				/>
			</button>
			<Link
				to="/"
				className={cn(
					"relative mb-8 flex h-10 items-center gap-3",
					collapsed && "justify-center",
				)}
			>
				<img
					src={envConfigs.app_logo}
					alt="Hayden Bi avatar"
					width="40"
					height="40"
					data-sidebar-motion
					className="size-10 shrink-0 rounded-full object-cover"
				/>
				<div className="sidebar-profile-label" aria-hidden={collapsed}>
					<p className="text-sm font-semibold">Hayden Bi</p>
					<p className="text-xs text-muted-foreground">
						Coffee &amp; Indie Developer
					</p>
				</div>
			</Link>
			<Navigation collapsed={collapsed} />
			<SocialLinks collapsed={collapsed} />
			<div
				className="sidebar-ad"
				inert={collapsed}
				aria-hidden={collapsed}
				data-sidebar-motion
			>
				<SidebarAd />
			</div>
		</aside>
	);
}
