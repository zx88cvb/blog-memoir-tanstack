import shiki from "@shikijs/markdown-it";
import GithubSlugger from "github-slugger";
import MarkdownIt, { type Token } from "markdown-it";

export type TocItem = {
	title: string;
	url: string;
	depth: number;
};

// One highlighter per build; content compilation is never imported by the app.
const renderer = (async () => {
	const md = new MarkdownIt({ html: true, linkify: true });
	md.use(
		await shiki({
			themes: { light: "github-light", dark: "github-dark" },
		}),
	);
	const highlight = md.options.highlight;
	md.options.highlight = (code, language, attributes) => {
		try {
			return highlight?.(code, language, attributes) ?? "";
		} catch {
			// An unsupported language still renders as an escaped code block.
			return "";
		}
	};
	return md;
})();

function tokenText(token: Token): string {
	if (token.type === "html_inline" || token.type === "html_block") {
		return token.content.replace(/<[^>]*>/g, " ");
	}
	if (token.children) return token.children.map(tokenText).join("");
	return ["text", "code_inline", "code_block", "fence"].includes(token.type)
		? token.content
		: token.type === "softbreak" || token.type === "hardbreak"
			? " "
			: "";
}

export async function compileMarkdown(content: string) {
	const md = await renderer;
	const tokens = md.parse(content, {});
	const slugger = new GithubSlugger();
	const toc: TocItem[] = [];
	for (let index = 0; index < tokens.length; index++) {
		const token = tokens[index];
		if (token.type !== "heading_open") continue;
		const title = tokenText(tokens[index + 1]);
		const id = slugger.slug(title);
		token.attrSet("id", id);
		toc.push({ title, url: `#${id}`, depth: Number(token.tag.slice(1)) });
	}
	return {
		html: md.renderer.render(tokens, md.options, {}),
		toc,
		plainText: tokens.map(tokenText).join(" ").replace(/\s+/g, " ").trim(),
	};
}
