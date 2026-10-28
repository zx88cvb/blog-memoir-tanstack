import { defineCollection, defineConfig } from "@content-collections/core";
import { z } from "zod";
import { compileMarkdown } from "./scripts/markdown";
import { postSchema } from "./scripts/post-schema";

const posts = defineCollection({
	name: "posts",
	directory: "content/blog",
	include: "**/*.md",
	schema: postSchema,
	transform: async (post, context) => ({
		...post,
		slug: post._meta.filePath.replace(/\.md$/, ""),
		...(await context.cache(post, () => compileMarkdown(post.content))),
	}),
});

const categories = defineCollection({
	name: "categories",
	directory: "content/category",
	include: "**/*.md",
	schema: z.object({
		name: z.string(),
		description: z.string().optional(),
		content: z.string(),
	}),
	transform: (category) => ({
		...category,
		slug: category.name.trim().toLowerCase().replace(/\s+/g, "-"),
	}),
});

export default defineConfig({ content: [posts, categories] });
