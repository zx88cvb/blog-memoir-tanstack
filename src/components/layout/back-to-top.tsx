import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export function BackToTop() {
	const [visible, setVisible] = useState(false);
	useEffect(() => {
		const sync = () => setVisible(window.scrollY > 400);
		sync();
		window.addEventListener("scroll", sync, { passive: true });
		return () => window.removeEventListener("scroll", sync);
	}, []);
	if (!visible) return null;
	return (
		<button
			type="button"
			aria-label="Back to top"
			className="interactive fixed bottom-6 right-6 z-20 grid size-11 place-items-center rounded-full border border-border bg-background"
			onClick={() =>
				window.scrollTo({
					top: 0,
					behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
						.matches
						? "instant"
						: "smooth",
				})
			}
		>
			<ArrowUp className="size-4" />
		</button>
	);
}
