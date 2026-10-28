import { defineCollection, defineConfig } from "@content-collections/core";
import { z } from "zod";
import { compileMarkdown } from "./scripts/markdown";

const posts = defineCollection({
	name: "posts",
	directory: "content/blog",
	include: "**/*.md",
	schema: z.object({
		title: z.string().min(1),
		date: z.iso.date(),
		updated: z.iso.date().optional(),
		description: z.string().optional(),
		excerpt: z.string().optional(),
		tags: z.array(z.string()).default([]),
		categories: z.array(z.string()).default([]),
		author: z.string().default("Hayden Bi"),
		image: z.string().optional(),
		published: z.boolean().default(true),
		content: z.string(),
	})
	.refine((post) => !post.updated || post.updated >= post.date, {
		message: "updated must not be earlier than date",
		path: ["updated"],
	}),
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
