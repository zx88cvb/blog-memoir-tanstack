/** Copy with the legacy textarea fallback when the Clipboard API is unavailable. */
export async function copyText(value: string) {
	if (navigator.clipboard?.writeText) {
		await navigator.clipboard.writeText(value);
		return;
	}
	const focused = document.activeElement as HTMLElement | null;
	const textarea = document.createElement("textarea");
	textarea.value = value;
	textarea.style.position = "fixed";
	textarea.style.opacity = "0";
	document.body.appendChild(textarea);
	try {
		textarea.focus();
		textarea.select();
		if (!document.execCommand("copy")) throw new Error("Copy failed");
	} finally {
		textarea.remove();
		focused?.focus?.();
	}
}
