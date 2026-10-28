import { m } from "@/paraglide/messages.js";

export function HomeHero() {
	return (
		<section className="px-4 py-10 text-center">
			<div className="mb-6 inline-flex rounded-full border border-surface-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
				{m["home.hero.eyebrow"]()}
			</div>
			<h1 className="mx-auto mb-6 max-w-3xl font-serif text-5xl font-medium tracking-tight text-primary sm:text-6xl">
				Posts from the desk of <span className="italic">Bi</span>.
			</h1>
			<p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
				{m["home.hero.description"]()}
			</p>
		</section>
	);
}
