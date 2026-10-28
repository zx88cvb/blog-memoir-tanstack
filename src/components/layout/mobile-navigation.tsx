import { Menu, X } from "lucide-react";
import { type RefObject, useEffect, useRef, useState } from "react";
import { Navigation, SocialLinks } from "./navigation";

export function MobileNavigation({
	desktopTarget,
}: {
	desktopTarget: RefObject<HTMLElement | null>;
}) {
	const menu = useRef<HTMLDialogElement>(null);
	const trigger = useRef<HTMLButtonElement>(null);
	const [open, setOpen] = useState(false);
	const closeMenu = () => menu.current?.close();

	useEffect(() => {
		const desktop = window.matchMedia("(min-width: 768px)");
		const closeOnDesktop = () => {
			if (!desktop.matches || !menu.current?.open) return;
			menu.current.close();
			desktopTarget.current
				?.querySelector<HTMLButtonElement>("button")
				?.focus();
		};
		desktop.addEventListener("change", closeOnDesktop);
		return () => desktop.removeEventListener("change", closeOnDesktop);
	}, [desktopTarget]);

	return (
		<>
			<button
				type="button"
				ref={trigger}
				aria-label="Open navigation"
				aria-haspopup="dialog"
				aria-controls="mobile-navigation"
				aria-expanded={open}
				onClick={() => {
					menu.current?.showModal();
					setOpen(true);
				}}
				className="interactive fixed left-4 top-4 z-30 grid size-11 place-items-center rounded-full bg-background md:hidden"
			>
				<Menu className="size-6" />
			</button>
			<dialog
				ref={menu}
				id="mobile-navigation"
				aria-label="Navigation"
				className="mobile-menu"
				onClose={() => {
					setOpen(false);
					if (!window.matchMedia("(min-width: 768px)").matches)
						trigger.current?.focus();
				}}
			>
				<button
					type="button"
					aria-label="Close navigation"
					className="interactive absolute left-4 top-4 grid size-11 rounded-full place-items-center"
					onClick={closeMenu}
				>
					<X />
				</button>
				<Navigation onNavigate={closeMenu} />
				<SocialLinks />
			</dialog>
		</>
	);
}
