import { z } from "zod";

export const postSchema = z
	.object({
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
	});
