import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function CopyButton({
	value,
	label = "Copy",
}: {
	value: string;
	label?: string;
}) {
	const [status, setStatus] = useState("");
	const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	useEffect(() => () => clearTimeout(timer.current), []);
	async function copy() {
		try {
			await navigator.clipboard.writeText(value);
			setStatus("Copied");
		} catch {
			setStatus("复制失败，请手动复制");
		}
		clearTimeout(timer.current);
		timer.current = setTimeout(() => setStatus(""), 2000);
	}
	return (
		<button
			type="button"
			onClick={copy}
			aria-label={status || `Copy ${label}`}
			title={status || `Copy ${label}`}
			className="interactive inline-flex min-h-11 min-w-11 items-center gap-1 rounded px-2 text-xs text-muted-foreground"
		>
			{status === "Copied" ? (
				<Check className="size-3" />
			) : (
				<Copy className="size-3" />
			)}
			<span aria-live="polite">{status}</span>
		</button>
	);
}
