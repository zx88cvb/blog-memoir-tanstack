import { X } from "lucide-react";
import { useEffect, useState } from "react";
import adsData from "../../../content/data/sidebar-ads.json";

export function SidebarAd() {
	const [ad, setAd] = useState<(typeof adsData.ads)[number] | null>(null);
	const [visible, setVisible] = useState(true);
	useEffect(() => {
		const ads = adsData.ads.filter((entry) => entry.enabled);
		setAd(ads[Math.floor(Math.random() * ads.length)] ?? null);
		const sync = () => {
			try {
				setVisible(localStorage.getItem("sidebar-ad-visible") !== "false");
			} catch {
				/* Storage may be disabled. */
			}
		};
		sync();
		window.addEventListener("storage", sync);
		return () => window.removeEventListener("storage", sync);
	}, []);
	function toggle() {
		setVisible(!visible);
		try {
			localStorage.setItem("sidebar-ad-visible", String(!visible));
		} catch {
			/* Keep the in-memory preference. */
		}
	}
	if (!ad) return null;
	return (
		<div className="mt-8">
			{visible ? (
				<>
					<div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
						<span>Ad</span>
						<button
							type="button"
							aria-label="Hide ad"
							onClick={toggle}
							className="interactive grid size-11 place-items-center rounded-full"
						>
							<X className="size-3" />
						</button>
					</div>
					<a
						href={ad.href}
						target="_blank"
						rel="noopener noreferrer sponsored"
						className="soft-surface block overflow-hidden rounded-lg"
					>
						<img
							src={ad.imageSrc}
							alt={ad.imageAlt}
							width="1200"
							height="630"
							className="aspect-[1200/630] w-full object-contain"
							loading="lazy"
						/>
						<p className="truncate p-3 text-xs">{ad.title}</p>
					</a>
				</>
			) : (
				<button
					type="button"
					onClick={toggle}
					className="interactive min-h-11 w-full rounded-md border border-border p-2 text-xs"
				>
					Show Ad
				</button>
			)}
		</div>
	);
}
