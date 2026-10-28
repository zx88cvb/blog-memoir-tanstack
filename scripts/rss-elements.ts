/** Read scalar values in generated RSS without depending on indentation or CDATA. */
export function rssText(xml: string, tag: string): string | undefined {
	const value = xml.match(
		new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`),
	)?.[1];
	return value?.replace(
		/<!\[CDATA\[([\s\S]*?)\]\]>|&(amp|lt|gt|quot|apos);/g,
		(match, cdata: string | undefined, entity: string | undefined) =>
			cdata ??
			{ amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" }[
				entity as "amp" | "lt" | "gt" | "quot" | "apos"
			] ??
			match,
	);
}

export function rssItems(xml: string): string[] {
	return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(
		(match) => match[1],
	);
}
