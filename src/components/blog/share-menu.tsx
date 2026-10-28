import { Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { copyText } from "@/lib/clipboard";
import { m } from "@/paraglide/messages.js";

export function ShareMenu({
	canonicalUrl,
	shareText,
	className,
}: {
	canonicalUrl: string;
	shareText: string;
	className?: string;
}) {
	const details = useRef<HTMLDetailsElement>(null);
	const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const mounted = useRef(false);
	const [copied, setCopied] = useState(false);
	const encodedUrl = encodeURIComponent(canonicalUrl);
	const encodedText = encodeURIComponent(shareText);
	useEffect(() => {
		mounted.current = true;
		const closeOutside = (event: PointerEvent) => {
			if (
				details.current?.open &&
				event.target instanceof Node &&
				!details.current.contains(event.target)
			)
				details.current.open = false;
		};
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape" && details.current)
				details.current.open = false;
		};
		document.addEventListener("pointerdown", closeOutside);
		document.addEventListener("keydown", closeOnEscape);
		return () => {
			mounted.current = false;
			clearTimeout(timer.current);
			document.removeEventListener("pointerdown", closeOutside);
			document.removeEventListener("keydown", closeOnEscape);
		};
	}, []);
	async function copyLink() {
		clearTimeout(timer.current);
		setCopied(false);
		try {
			await copyText(canonicalUrl);
			if (!mounted.current) return;
			setCopied(true);
			timer.current = setTimeout(() => setCopied(false), 2000);
		} catch {
			if (mounted.current) setCopied(false);
		}
	}
	const itemClass =
		"block w-full rounded-lg px-3 py-2 text-left text-foreground hover:bg-surface-hover";
	return (
		<details ref={details} className={className}>
			<summary
				className={
					"soft-surface list-none inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-surface-hover [&::-webkit-details-marker]:hidden"
				}
			>
				<Share2 className="size-3.5" aria-hidden="true" />
				<span>{m["blog.share.title"]()}</span>
			</summary>
			<div className="soft-surface absolute right-0 z-50 mt-2 w-52 rounded-xl p-1 text-sm shadow-md backdrop-blur">
				<a
					href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`}
					target="_blank"
					rel="noreferrer"
					className={itemClass}
				>
					{m["blog.share.on"]({ platform: "X" })}
				</a>
				<a
					href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
					target="_blank"
					rel="noreferrer"
					className={itemClass}
				>
					{m["blog.share.on"]({ platform: "Facebook" })}
				</a>
				<a
					href={`https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedText}`}
					target="_blank"
					rel="noreferrer"
					className={itemClass}
				>
					{m["blog.share.on"]({ platform: "Pinterest" })}
				</a>
				<button
					type="button"
					onClick={copyLink}
					className={itemClass}
					aria-live="polite"
				>
					{copied ? m["blog.share.copied_link"]() : m["blog.share.copy_link"]()}
				</button>
			</div>
		</details>
	);
}
