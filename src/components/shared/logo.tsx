import { cn } from "@/lib/utils";

export function Logo({
	className,
	alt,
	decorative = false,
}: {
	className?: string;
	alt: string;
	decorative?: boolean;
}) {
	return (
		<img
			src="/logo.png"
			alt={alt}
			aria-hidden={decorative || undefined}
			width={512}
			height={512}
			className={cn("size-9 shrink-0 object-contain", className)}
		/>
	);
}
