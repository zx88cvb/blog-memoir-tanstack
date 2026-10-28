import { Link } from "@tanstack/react-router";
import { footerNavigation } from "@/config/navigation";

export function BlogFooter() {
	return (
		<footer className="py-12 text-center text-sm text-muted-foreground">
			<div className="mb-6 font-serif text-2xl text-primary">
				End of the line
			</div>
			<div className="mb-6 flex justify-center gap-6">
				{footerNavigation.map(({ name, to }) => (
					<Link key={to} to={to}>
						{name}
					</Link>
				))}
			</div>
			<p className="text-xs">© 2025 HaydenBi Blog. All rights reserved.</p>
		</footer>
	);
}
