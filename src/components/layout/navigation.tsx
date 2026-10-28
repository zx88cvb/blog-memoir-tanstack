import { Link, useLocation } from "@tanstack/react-router";
import { Handshake, Home, Lightbulb, Mail, Rss, User } from "lucide-react";
import type { SVGProps } from "react";
import { primaryNavigation, socialNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils";

const menuLinkClass =
	"interactive relative flex h-9 max-md:min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground";

function XBrandIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
			<path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
		</svg>
	);
}

const icons = {
	home: Home,
	user: User,
	lightbulb: Lightbulb,
	handshake: Handshake,
	mail: Mail,
	rss: Rss,
	x: XBrandIcon,
};

export function Navigation({
	collapsed = false,
	onNavigate,
}: {
	collapsed?: boolean;
	onNavigate?: () => void;
}) {
	const pathname = useLocation({ select: (location) => location.pathname });
	return (
		<nav aria-label="Main navigation" className="space-y-1">
			{primaryNavigation.map(({ name, to, icon }) => {
				const Icon = icons[icon];
				return (
					<Link
						key={to}
						to={to}
						onClick={onNavigate}
						aria-current={pathname === to ? "page" : undefined}
						title={collapsed ? name : undefined}
						aria-label={name}
						data-sidebar-motion
						className={cn(
							menuLinkClass,
							collapsed && "justify-center px-2",
							pathname === to
								? "bg-accent text-foreground"
								: "text-muted-foreground",
						)}
					>
						<Icon className="size-4 shrink-0" aria-hidden="true" />
						<span className="sidebar-label" aria-hidden={collapsed}>
							{name}
						</span>
					</Link>
				);
			})}
		</nav>
	);
}

export function SocialLinks({ collapsed = false }: { collapsed?: boolean }) {
	return (
		<div className="relative mt-8 space-y-1">
			<div className="sidebar-heading mb-4" aria-hidden={collapsed}>
				<h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
					Find Me
				</h3>
			</div>
			{socialNavigation.map(({ label, href, icon }) => {
				const Icon = icons[icon];
				return (
					<a
						key={label}
						href={href}
						title={label}
						aria-label={label}
						data-sidebar-motion
						target="_blank"
						rel="noopener noreferrer"
						className={cn(
							menuLinkClass,
							"text-muted-foreground",
							collapsed && "justify-center px-2",
						)}
					>
						<Icon className="size-4 shrink-0" aria-hidden="true" />
						<span className="sidebar-label" aria-hidden={collapsed}>
							{label}
						</span>
					</a>
				);
			})}
		</div>
	);
}
